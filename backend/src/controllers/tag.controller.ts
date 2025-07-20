import { Request, Response } from "express";
import pool from "../config/db";

// ✅ เพิ่ม Tag ให้ Task
export const createTag = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { task_id, text } = req.body;

    // ตรวจสอบว่า task อยู่ใน board ที่ user มีสิทธิ์
    const taskRes = await pool.query(`SELECT * FROM tasks WHERE id = $1 AND deleted_at IS NULL`, [task_id]);
    if (taskRes.rowCount === 0) return res.status(404).json({ error: "❌ ไม่พบ Task" });
    const task = taskRes.rows[0];

    const member = await pool.query(
      `SELECT * FROM board_members WHERE board_id = $1 AND customer_id = $2 AND status = true`,
      [task.board_id, user.id]
    );
    const board = await pool.query(`SELECT * FROM boards WHERE id = $1`, [task.board_id]);
    const isOwner = board.rows[0]?.owner_id === user.id;

    if (!isOwner && member.rowCount === 0) {
      return res.status(403).json({ error: "❌ คุณไม่มีสิทธิ์เพิ่ม Tag" });
    }

    const tag = await pool.query(
      `INSERT INTO tags (task_id, text) VALUES ($1, $2) RETURNING *`,
      [task_id, text]
    );

    res.status(201).json({ message: "✅ เพิ่ม Tag สำเร็จ", tag: tag.rows[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ ดู Tag ของ Task
export const getTagsByTask = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const task_id = req.params.task_id;

    const taskRes = await pool.query(`SELECT * FROM tasks WHERE id = $1`, [task_id]);
    if (taskRes.rowCount === 0) return res.status(404).json({ error: "❌ ไม่พบ Task" });
    const task = taskRes.rows[0];

    const member = await pool.query(
      `SELECT * FROM board_members WHERE board_id = $1 AND customer_id = $2 AND status = true`,
      [task.board_id, user.id]
    );
    const board = await pool.query(`SELECT * FROM boards WHERE id = $1`, [task.board_id]);
    const isOwner = board.rows[0]?.owner_id === user.id;

    if (!isOwner && member.rowCount === 0) {
      return res.status(403).json({ error: "❌ ไม่มีสิทธิ์ดู Tag" });
    }

    const tags = await pool.query(`SELECT * FROM tags WHERE task_id = $1`, [task_id]);
    res.json({ tags: tags.rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ ลบ Tag
export const deleteTag = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const tag_id = req.params.id;

    const tagRes = await pool.query(`SELECT * FROM tags WHERE id = $1`, [tag_id]);
    if (tagRes.rowCount === 0) return res.status(404).json({ error: "❌ ไม่พบ Tag" });

    const task_id = tagRes.rows[0].task_id;
    const taskRes = await pool.query(`SELECT * FROM tasks WHERE id = $1`, [task_id]);
    const task = taskRes.rows[0];

    const member = await pool.query(
      `SELECT * FROM board_members WHERE board_id = $1 AND customer_id = $2 AND status = true`,
      [task.board_id, user.id]
    );
    const board = await pool.query(`SELECT * FROM boards WHERE id = $1`, [task.board_id]);
    const isOwner = board.rows[0]?.owner_id === user.id;

    if (!isOwner && member.rowCount === 0) {
      return res.status(403).json({ error: "❌ ไม่มีสิทธิ์ลบ Tag นี้" });
    }

    await pool.query(`DELETE FROM tags WHERE id = $1`, [tag_id]);
    res.json({ message: "🗑️ ลบ Tag สำเร็จ" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
