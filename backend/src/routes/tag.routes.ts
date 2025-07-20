import { Router } from "express";
import { createTag, getTagsByTask, deleteTag } from "../controllers/tag.controller";
import {authenticateJWT} from "../middleware/auth";

const router = Router();

router.post("/", authenticateJWT, createTag); // ✅ เพิ่ม tag
router.get("/:task_id", authenticateJWT, getTagsByTask); // ✅ ดู tag ของ task
router.delete("/:id", authenticateJWT, deleteTag); // ✅ ลบ tag

export default router;
