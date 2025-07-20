import { Request, Response } from "express";
import pool from "../config/db";

// ✅ มอบหมาย Task ให้สมาชิกในบอร์ด (Owner เท่านั้น)
export const assignTask = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { task_id, member_id } = req.body;

    // ตรวจสอบ Task
    const taskRes = await pool.query(
      `SELECT * FROM tasks WHERE id = $1 AND deleted_at IS NULL`,
      [task_id]
    );
    if (taskRes.rowCount === 0)
      return res.status(404).json({ error: "❌ ไม่พบ Task" });
    const task = taskRes.rows[0];

    // ตรวจสอบว่า user เป็นเจ้าของบอร์ด
    const board = await pool.query(`SELECT * FROM boards WHERE id = $1`, [task.board_id]);
    if (board.rowCount === 0 || board.rows[0].owner_id !== user.id)
      return res.status(403).json({ error: "❌ คุณไม่ใช่เจ้าของบอร์ดนี้" });

    // ตรวจสอบว่า member อยู่ในบอร์ดจริง
    const isMember = await pool.query(
      `SELECT * FROM  board_members WHERE board_id = $1 AND customer_id = $2 AND status = true`,
      [task.board_id, member_id]
    );
    if (isMember.rowCount === 0)
      return res.status(400).json({ error: "❌ ผู้ใช้ที่เลือกไม่ได้อยู่ในบอร์ดนี้" });

    // ตรวจสอบการมอบหมายซ้ำ
    const exists = await pool.query(
      `SELECT * FROM tasks_members WHERE task_id = $1 AND customer_id = $2`,
      [task_id, member_id]
    );
    if ((exists.rowCount ??0) > 0)
      return res.status(409).json({ error: "❌ มอบหมายซ้ำแล้ว" });

    // มอบหมาย
    const assign = await pool.query(
      `INSERT INTO tasks_members (task_id, customer_id) VALUES ($1, $2) RETURNING *`,
      [task_id, member_id]
    );

    // สร้างแจ้งเตือน
    await pool.query(
      `INSERT INTO notifications (customer_id, message) VALUES ($1, $2)`,
      [member_id, `📌 คุณได้รับมอบหมาย Task ใหม่: ${task.name}`]
    );

    res.status(201).json({ message: "✅ มอบหมายสำเร็จ", assign: assign.rows[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
