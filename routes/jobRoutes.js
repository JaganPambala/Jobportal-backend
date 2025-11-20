import express from "express";
import {
  createJob,
  getJobs,
  getEmployerJobs,
  getJobById,
  updateJob,
  deleteJob
} from "../controller/jobController.js";

import { verifyToken } from "../middleware/verifyToken.js";
import { verifyRole } from "../middleware/verifyRole.js";

const router = express.Router();

// ----- PUBLIC ROUTES -----
router.get("/", getJobs);         
router.get("/:id", getJobById);   

// ----- EMPLOYER ROUTES -----
router.post(
  "/",
  verifyToken,
  verifyRole("employer"),        
  createJob
);

router.get(
  "/employer/:employerId",
  verifyToken,
  verifyRole("employer"),         
  getEmployerJobs
);

router.put(
  "/:id",
  verifyToken,
  verifyRole("employer"),         
  updateJob
);

router.delete(
  "/:id",
  verifyToken,
  verifyRole("Employer"),        
    deleteJob
);

export default router;
