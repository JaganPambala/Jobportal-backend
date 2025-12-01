import express from "express";
import {
  applyJob,
  getEmployeeApplications,
  getEmployerJobApplications,
  updateApplicationStatus,
  deleteApplication
} from "../controller/jobApplicationController.js";

import { verifyToken } from "../middleware/verifyToken.js";
import { verifyRole } from "../middleware/verifyRole.js";

const router = express.Router();

// Employee applies for a job
router.post(
  "/apply/:jobId",
  verifyToken,
  verifyRole("employee"),
  applyJob
);

// Employee gets all their applications
router.get(
  "/employee",
  verifyToken,
  verifyRole("employee"),
  getEmployeeApplications
);

// Employer gets applications for one job
router.get(
  "/job/:jobId",
  verifyToken,
  verifyRole("employer"),
  getEmployerJobApplications
);

// Employer updates application status (partial update - PATCH)
router.patch(
  "/status/:applicationId",
  verifyToken,
  verifyRole("employer"),
  updateApplicationStatus
);

// Employee deletes/cancels their application
router.delete(
  "/:applicationId",
  verifyToken,
  verifyRole("employee"),
  deleteApplication
);

export default router;
