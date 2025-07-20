import { Request, Response } from "express";
import pool from "../config/db";

// ✅ Owner เชิญสมาชิกเข้าบอร์ด
export const inviteToBoard = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { board_id, invite_code } = req.body;

    const boardRes = await pool.query(`SELECT * FROM boards WHERE id = $1`, [board_id]);
    const board = boardRes.rows[0];
    if (!board || board.owner_id !== user.id) {
      return res.status(403).json({ error: "❌ คุณไม่ใช่เจ้าของบอร์ดนี้" });
    }

    const customerRes = await pool.query(`SELECT * FROM customers WHERE invite_code = $1`, [invite_code]);
    if (customerRes.rowCount === 0) {
      return res.status(404).json({ error: "❌ ไม่พบผู้ใช้ด้วย invite code นี้" });
    }
    const invited = customerRes.rows[0];

    const check = await pool.query(
      `SELECT * FROM board_members WHERE board_id = $1 AND customer_id = $2`,
      [board_id, invited.id]
    );
    if ((check.rowCount ?? 0) > 0) {
      return res.status(409).json({ error: "❌ ผู้ใช้นี้เป็นสมาชิกหรือเคยถูกเชิญแล้ว" });
    }

    // ✅ แก้ให้ใช้ notifications เดียว
    await pool.query(
      `INSERT INTO notifications (customer_id, message, type, metadata) 
       VALUES ($1, $2, 'invite', $3::jsonb)`,
      [
        invited.id,
        `📩 คุณได้รับคำเชิญเข้าร่วมบอร์ด: ${board.name}`,
        JSON.stringify({ board_id, board_name: board.name })
      ]
    );

    res.status(200).json({ message: `✅ เชิญ ${invited.name} เข้าร่วมบอร์ดแล้ว` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ ตอบรับคำเชิญเข้าร่วมบอร์ด
export const acceptInvite = async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { notification_id } = req.params;

  try {
    // ดึง Notification
    const notifRes = await pool.query(
      `SELECT * FROM notifications WHERE id = $1 AND customer_id = $2 AND type = 'invite'`,
      [notification_id, user.id]
    );
    if (notifRes.rowCount === 0) {
      return res.status(404).json({ error: "❌ ไม่พบคำเชิญ" });
    }

    const metadata = notifRes.rows[0].metadata;
    const board_id = metadata.board_id;

    // เพิ่มเข้า board_members
    await pool.query(
      `INSERT INTO board_members (board_id, customer_id) VALUES ($1, $2)`,
      [board_id, user.id]
    );

    // ลบ notification
    await pool.query(`DELETE FROM notifications WHERE id = $1`, [notification_id]);

    res.json({ message: "✅ เข้าร่วมบอร์ดสำเร็จ!" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// ❌ ปฏิเสธคำเชิญ (แค่ลบ notification)
export const rejectInvite = async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { notification_id } = req.params;

  try {
    const notif = await pool.query(
      `SELECT * FROM notifications WHERE id = $1 AND customer_id = $2 AND type = 'invite'`,
      [notification_id, user.id]
    );
    if (notif.rowCount === 0) {
      return res.status(404).json({ error: "❌ ไม่พบคำเชิญ" });
    }

    await pool.query(`DELETE FROM notifications WHERE id = $1`, [notification_id]);
    res.json({ message: "❌ ปฏิเสธคำเชิญแล้ว" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
