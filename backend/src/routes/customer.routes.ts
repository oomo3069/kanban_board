import express from "express";
import {
  registerCustomer,
  loginCustomer,
  getCustomerProfile
} from "../controllers/customer.controller";
import { forgotPassword,resetPassword} from "../controllers/authController";
import { authenticateJWT } from "../middleware/auth";

const router = express.Router();


router.post("/register", registerCustomer);
router.post("/login", loginCustomer);
router.get("/profile", authenticateJWT, getCustomerProfile);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;
