import express from "express";
import {
  getNotifications,
  markNotificationAsRead,
} from "../controllers/notification.controller";
import {authenticateJWT} from "../middleware/auth";

const router = express.Router();

router.get("/", authenticateJWT, getNotifications);               // 🔔 ดูแจ้งเตือนทั้งหมด
router.put("/:id/read", authenticateJWT, markNotificationAsRead); // ✅ เปลี่ยนสถานะเป็นอ่านแล้ว

export default router;
