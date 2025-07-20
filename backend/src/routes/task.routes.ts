import express from "express";
import {
  createTask,
  getTasksByBoard,
  updateTask,
  deleteTask,
} from "../controllers/task.controller";
import {authenticateJWT} from "../middleware/auth";

const router = express.Router();

router.post("/", authenticateJWT, createTask);
router.get("/board/:board_id", authenticateJWT, getTasksByBoard);
router.put("/:id", authenticateJWT, updateTask);
router.delete("/:id", authenticateJWT, deleteTask);

export default router;
