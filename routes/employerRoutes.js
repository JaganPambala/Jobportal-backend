import express from "express";
import {
  createEmployerDetails,
  getEmployerDetails,
  updateEmployerDetails,
  deleteEmployerDetails,
  getMyEmployerDetails
} from "../controller/employerController.js";

import { verifyToken } from "../middleware/verifyToken.js";
import { verifyRole } from "../middleware/verifyRole.js";

const router = express.Router();

router.post(
  "/details",
  verifyToken,
  verifyRole("employer"),
  createEmployerDetails
);

/**
 * @route GET /api/employer/details/:userId
 * @desc Get employer profile by userId
 * @access Public
 */
router.get("/details/:userId", getEmployerDetails);

/**
 * @route PUT /api/employer/details
 * @desc Update employer profile
 * @access Employer only
 */
router.put(
  "/details",
  verifyToken,
  verifyRole("employer"),
  updateEmployerDetails
);

/**
 * @route DELETE /api/employer/details
 * @desc Delete employer profile
 * @access Employer only
 */
router.delete(
  "/details",
  verifyToken,
  verifyRole("employer"),
  deleteEmployerDetails
);



router.get(
  "/me",
  verifyToken,
  verifyRole("employer"),
  getMyEmployerDetails
);


export default router;
