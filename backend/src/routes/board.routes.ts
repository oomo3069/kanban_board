import express from "express";
import { createBoard, getMyBoards, updateBoard, deleteBoard,getBoardsIMember,leaveBoard } from "../controllers/board.controller";
import {authenticateJWT} from "../middleware/auth";
import { getBoardById,getBoardMembers } from "../controllers/board.controller";

const router = express.Router();

router.post("/", authenticateJWT, createBoard);
router.get("/my", authenticateJWT, getMyBoards);
router.put("/:id", authenticateJWT, updateBoard);
router.delete("/:id", authenticateJWT, deleteBoard);
router.get("/member", authenticateJWT, getBoardsIMember);
router.put("/leave/:board_id", authenticateJWT, leaveBoard);
router.get("/:id", authenticateJWT, getBoardById);
router.get("/:id/members", authenticateJWT, getBoardMembers);

export default router;
