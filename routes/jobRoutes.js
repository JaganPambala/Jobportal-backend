import express from "express";
import {
  createJob,
  getJobs,
  getFeaturedJobs,
  getPopularJobs,
  getTrendingJobs,
  getRecommendedJobs,
  searchJobs,
  getJobsByCategory,
  getEmployerJobs,
  getMyJobs,
  getJobById,
  setJobActivation,
  updateJob,
  deleteJob
} from "../controller/jobController.js";

import { verifyToken } from "../middleware/verifyToken.js";
import { verifyRole } from "../middleware/verifyRole.js";

const router = express.Router();

// ----- PUBLIC ROUTES (GET) -----
router.get("/featured", getFeaturedJobs);        // /jobs/featured
router.get("/popular", getPopularJobs);          // /jobs/popular
router.get("/trending", getTrendingJobs);        // /jobs/trending
router.get("/recommended", getRecommendedJobs);  // /jobs/recommended
router.get("/search", searchJobs);               // /jobs/search
router.get("/by-category/:id", getJobsByCategory); // /jobs/by-category/:id
router.get("/", getJobs);                        // /jobs (paginated)

// ----- EMPLOYER ROUTES (WRITE) -----
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

// Get jobs for the currently authenticated employer
router.get(
  "/my-jobs",
  verifyToken,
  verifyRole("employer"),
  getMyJobs
);

// Activation/Deactivation quick update for a job
router.patch(
  "/:id/activation",
  verifyToken,
  verifyRole("employer"),
  setJobActivation
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
  verifyRole("employer"),        
  deleteJob
);

// Single job details route - placed after more specific routes so "/my-jobs" and others are not mistaken as an id
router.get("/:id", getJobById);                  // /jobs/:id (single job detail)

export default router;
