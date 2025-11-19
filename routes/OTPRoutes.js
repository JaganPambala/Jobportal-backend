import express from "express";
import { sendOtp, verifyOtp } from "../controller/auth/OTP.js";

const router = express.Router();

router.post("/send", sendOtp);
router.post("/verify", verifyOtp);

export default router;
