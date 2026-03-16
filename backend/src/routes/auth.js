import express from "express";
import { signup, login, verifyAdminOTP, resendAdminOTP, getProfile } from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/verify-otp", verifyAdminOTP);
router.post("/resend-otp", resendAdminOTP);
router.get("/profile", authenticate, getProfile);

export default router;
