import { Request, Response } from "express";
import pool from "../config/db";
import { generateBoardCode } from "../utils/codeGen";

// สร้างบอร์ดใหม่
export const createBoard = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { name, description } = req.body;
    const board_code = generateBoardCode(); // สุ่ม 6 หลัก

    const result = await pool.query(
      `INSERT INTO boards (owner_id, name, description, board_code)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [user.id, name, description, board_code]
    );

    // เพิ่มตัวเองเข้า board_members ด้วย
    await pool.query(
      `INSERT INTO board_members (board_id, customer_id) VALUES ($1, $2)`,
      [result.rows[0].id, user.id]
    );

    res.status(201).json({ message: "✅ สร้างบอร์ดสำเร็จ", board: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// ดึงบอร์ดทั้งหมดของตัวเอง
export const getMyBoards = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const result = await pool.query(
      `SELECT * FROM boards WHERE owner_id = $1 AND deleted_at IS NULL ORDER BY created_at DESC`,
      [user.id]
    );

    res.json({ boards: result.rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// แก้ไขชื่อหรือคำอธิบายบอร์ด
export const updateBoard = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const boardId = req.params.id;
    const { name, description } = req.body;

    // ตรวจสอบสิทธิ์
    const board = await pool.query(`SELECT * FROM boards WHERE id = $1`, [boardId]);
    if (board.rows.length === 0) return res.status(404).json({ error: "❌ ไม่พบบอร์ด" });
    if (board.rows[0].owner_id !== user.id)
      return res.status(403).json({ error: "❌ ไม่มีสิทธิ์แก้ไขบอร์ดนี้" });

    const result = await pool.query(
      `UPDATE boards SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *`,
      [name, description, boardId]
    );

    res.json({ message: "✅ แก้ไขบอร์ดเรียบร้อย", board: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// ลบบอร์ด (soft delete)
export const deleteBoard = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const boardId = req.params.id;

    const board = await pool.query(`SELECT * FROM boards WHERE id = $1`, [boardId]);
    if (board.rows.length === 0) return res.status(404).json({ error: "❌ ไม่พบบอร์ด" });
    if (board.rows[0].owner_id !== user.id)
      return res.status(403).json({ error: "❌ ไม่มีสิทธิ์ลบบอร์ดนี้" });

    await pool.query(
      `UPDATE boards SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [boardId]
    );

    res.json({ message: "🗑️ ลบบอร์ดสำเร็จ" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// board.controller.ts
export const getBoardsIMember = async (req: Request, res: Response) => {
  const user = (req as any).user;
  try {
    const result = await pool.query(
      `SELECT b.* FROM boards b
       JOIN board_members bm ON bm.board_id = b.id
       WHERE bm.customer_id = $1 AND bm.status = true
       ORDER BY b.created_at DESC`,
      [user.id]
    );
    res.json({ boards: result.rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const leaveBoard = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const board_id = req.params.board_id;

    const board = await pool.query(`SELECT * FROM boards WHERE id = $1`, [board_id]);
    if (board.rowCount === 0) return res.status(404).json({ error: "❌ ไม่พบบอร์ด" });

    const isOwner = board.rows[0].owner_id === user.id;
    if (isOwner) return res.status(403).json({ error: "❌ เจ้าของบอร์ดไม่สามารถออกจากบอร์ดได้" });

    const isMember = await pool.query(
      `SELECT * FROM board_members WHERE board_id = $1 AND customer_id = $2 AND status = true`,
      [board_id, user.id]
    );
    if (isMember.rowCount === 0) return res.status(400).json({ error: "❌ คุณไม่ได้อยู่ในบอร์ดนี้" });

    await pool.query(
      `UPDATE board_members SET status = false, out_at = CURRENT_TIMESTAMP WHERE board_id = $1 AND customer_id = $2`,
      [board_id, user.id]
    );

    res.json({ message: "🚪 ออกจากบอร์ดเรียบร้อย" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getBoardById = async (req: Request, res: Response) => {
  const boardId = req.params.id;
  const user = (req as any).user;

  try {
    const result = await pool.query(
      `SELECT b.* FROM boards b
       LEFT JOIN board_members bm ON bm.board_id = b.id
       WHERE b.id = $1 AND (b.owner_id = $2 OR bm.customer_id = $2 AND bm.status = true)
       LIMIT 1`,
      [boardId, user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Board not found or access denied" });
    }

    res.json({ board: result.rows[0] });
  } catch (err: any) {
    console.error("getBoardById error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const getBoardMembers = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT c.id, c.name FROM board_members bm
       JOIN customers c ON c.id = bm.customer_id
       WHERE bm.board_id = $1 AND bm.status = true`,
      [id]
    );
    res.json({ members: result.rows });
  } catch (err: any) {
    console.error("Error fetching members:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


