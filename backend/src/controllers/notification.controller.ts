import { Request, Response } from "express";
import pool from "../config/db";

// 🔔 ดูแจ้งเตือนทั้งหมดของผู้ใช้
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const result = await pool.query(
      `SELECT * FROM notifications WHERE customer_id = $1 ORDER BY created_at DESC`,
      [user.id]
    );
    res.json({ notifications: result.rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ กดอ่านแจ้งเตือน แล้วลบทิ้งทันที
export const markNotificationAsRead = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const id = req.params.id;

    // ตรวจสอบว่าเป็นของ user จริงไหม
    const result = await pool.query(
      `SELECT * FROM notifications WHERE id = $1 AND customer_id = $2`,
      [id, user.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: "❌ ไม่พบแจ้งเตือนนี้" });

    // ลบแจ้งเตือน
    await pool.query(`DELETE FROM notifications WHERE id = $1`, [id]);

    res.json({ message: "🗑️ ลบแจ้งเตือนแล้ว" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
