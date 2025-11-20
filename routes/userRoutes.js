import express from "express";

import { setRole } from "../controller/auth/user.js";

const router = express.Router();
router.put("/set-role", setRole);

export default router;
