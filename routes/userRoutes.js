import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { setRole } from "../controllers/userController.js";

const router = express.Router();
router.put("/set-role", verifyToken, setRole);

export default router;
