import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { setRole } from "../controller/auth/user.js";

const router = express.Router();
router.put("/set-role", verifyToken, setRole);

export default router;
