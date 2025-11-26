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
  getJobById,
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
router.get("/:id", getJobById);                  // /jobs/:id (single job detail)

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

export default router;
