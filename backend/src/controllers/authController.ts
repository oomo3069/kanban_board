// controllers/auth.controller.ts
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import client from "../config/db";


const JWT_SECRET = process.env.JWT_SECRET || "reset_secret_key";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const result = await client.query("SELECT * FROM customers WHERE email = $1", [email]);
    const user = result.rows[0];

    if (!user) {
       res.status(400).json({ error: "ไม่พบเมล" });
       return;
    }
    
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "10m" });
    const resetLink = `https://kanban-board-chi-olive.vercel.app/reset-password/${token}`;


    await transporter.sendMail({
      to: email,
      subject: "รีเซ็ตรหัสผ่านของคุณ",
      html: `<p>คลิกเพื่อรีเซ็ตรหัสผ่าน: <a href="${resetLink}">${resetLink}</a></p>`,
    });


    res.status(200).json({ message: "ส่งลิงก์ไปยังอีเมลแล้ว" });
    return ;

  } catch (err) {
    console.error("Forgot Password Error:", err);
     res.status(500).json({ error: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
     return;
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const hashed = await bcrypt.hash(password, 10);
    await client.query("UPDATE customers SET password = $1 WHERE id = $2", [hashed, decoded.id]);
    res.json({ message: "Password reset successful" });
  } catch (err) {
    res.status(400).json({ message: "Invalid or expired token" });
  }
};
