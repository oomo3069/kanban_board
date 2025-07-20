import express from "express";
import { inviteToBoard,acceptInvite,rejectInvite } from "../controllers/invite.controller";
import {authenticateJWT} from "../middleware/auth";

const router = express.Router();

router.post("/", authenticateJWT, inviteToBoard);
router.post("/accept/:notification_id", authenticateJWT, acceptInvite);
router.post("/reject/:notification_id", authenticateJWT, rejectInvite);
export default router;
