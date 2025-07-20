import { Request, Response } from "express";
import pool from "../config/db";

// ✅ สร้าง Task
export const createTask = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { board_id, name, description } = req.body;

    const board = await pool.query(`SELECT * FROM boards WHERE id = $1 AND deleted_at IS NULL`, [board_id]);
    if (board.rowCount === 0) return res.status(404).json({ error: "❌ ไม่พบบอร์ด" });

    const member = await pool.query(
      `SELECT * FROM board_members WHERE board_id = $1 AND customer_id = $2 AND status = true`,
      [board_id, user.id]
    );
    if (member.rowCount === 0) return res.status(403).json({ error: "❌ คุณไม่ได้อยู่ในบอร์ดนี้" });

    const task = await pool.query(
      `INSERT INTO tasks (board_id, created_by, name, description) VALUES ($1, $2, $3, $4) RETURNING *`,
      [board_id, user.id, name, description]
    );

    res.status(201).json({ message: "✅ สร้าง Task สำเร็จ", task: task.rows[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ ดู Task ทั้งหมดในบอร์ด
export const getTasksByBoard = async (req: Request, res: Response) => {
  const user = (req as any).user;
  const board_id = req.params.board_id;

  try {
    // ตรวจสอบสิทธิ์ผู้ใช้ในบอร์ด
    const boardRes = await pool.query(`SELECT * FROM boards WHERE id = $1`, [board_id]);
    if (boardRes.rowCount === 0) return res.status(404).json({ error: "ไม่พบบอร์ด" });

    const board = boardRes.rows[0];
    const isOwner = board.owner_id === user.id;

    const memberRes = await pool.query(
      `SELECT * FROM board_members WHERE board_id = $1 AND customer_id = $2 AND status = true`,
      [board_id, user.id]
    );
    if (!isOwner && memberRes.rowCount === 0) {
      return res.status(403).json({ error: "คุณไม่มีสิทธิ์เข้าถึงบอร์ดนี้" });
    }

    // ดึง tasks
    const taskRes = await pool.query(
      `SELECT * FROM tasks WHERE board_id = $1 ORDER BY created_at ASC`,
      [board_id]
    );

    const tasks = taskRes.rows;

    // ดึง tags ของทุก task
    const taskIds = tasks.map(t => t.id);
    const tagRes = await pool.query(
      `SELECT * FROM tags WHERE task_id = ANY($1::int[])`,
      [taskIds]
    );

    const tagsByTask: { [key: number]: any[] } = {};
    for (const tag of tagRes.rows) {
      if (!tagsByTask[tag.task_id]) {
        tagsByTask[tag.task_id] = [];
      }
      tagsByTask[tag.task_id].push(tag);
    }

    // รวม tags เข้ากับแต่ละ task
    const tasksWithTags = tasks.map(task => ({
      ...task,
      tags: tagsByTask[task.id] || [],
    }));

    res.json({ tasks: tasksWithTags });
  } catch (err: any) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูล tasks" });
  }
};

// ✅ แก้ไข Task (Owner หรือสมาชิกบอร์ดเท่านั้น)
export const updateTask = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const task_id = req.params.id;
    const { name, description, status } = req.body;

    const task = await pool.query(`SELECT * FROM tasks WHERE id = $1`, [task_id]);
    if (task.rowCount === 0) return res.status(404).json({ error: "❌ ไม่พบ Task" });

    const board = await pool.query(`SELECT * FROM boards WHERE id = $1`, [task.rows[0].board_id]);

    const member = await pool.query(
      `SELECT * FROM board_members WHERE board_id = $1 AND customer_id = $2 AND status = true`,
      [task.rows[0].board_id, user.id]
    );
    const isOwner = board.rows[0].owner_id === user.id;

    if (!isOwner && member.rowCount === 0)
      return res.status(403).json({ error: "❌ ไม่มีสิทธิ์แก้ไข Task นี้" });

    const updated = await pool.query(
      `UPDATE tasks SET name = $1, description = $2, status = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *`,
      [name, description, status, task_id]
    );

    res.json({ message: "✅ แก้ไข Task สำเร็จ", task: updated.rows[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ ลบ Task
export const deleteTask = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const task_id = req.params.id;

    const task = await pool.query(`SELECT * FROM tasks WHERE id = $1`, [task_id]);
    if (task.rowCount === 0) return res.status(404).json({ error: "❌ ไม่พบ Task" });

    const board = await pool.query(`SELECT * FROM boards WHERE id = $1`, [task.rows[0].board_id]);

    const member = await pool.query(
      `SELECT * FROM board_members WHERE board_id = $1 AND customer_id = $2 AND status = true`,
      [task.rows[0].board_id, user.id]
    );
    const isOwner = board.rows[0].owner_id === user.id;

    if (!isOwner && member.rowCount === 0)
      return res.status(403).json({ error: "❌ ไม่มีสิทธิ์ลบ Task นี้" });

    await pool.query(`UPDATE tasks SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1`, [task_id]);

    res.json({ message: "🗑️ ลบ Task สำเร็จ" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
