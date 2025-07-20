import express from "express";
import { assignTask } from "../controllers/assign.controller";
import {authenticateJWT} from "../middleware/auth";

const router = express.Router();

router.post("/", authenticateJWT, assignTask); // ✅ มอบหมาย Task

export default router;