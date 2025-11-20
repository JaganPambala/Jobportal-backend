import express from "express";
import {
  createEmployeeDetails,
  getEmployeeDetails,
  getMyEmployeeDetails,
  updateEmployeeDetails,
  deleteEmployeeDetails
} from "../controller/employeeController.js";

import { verifyToken } from "../middleware/verifyToken.js";
import { verifyRole } from "../middleware/verifyRole.js";

const router = express.Router();

/**
 * @route POST /api/employee/details
 * @desc Create employee profile
 * @access Employee only
 */
router.post(
  "/details",
  verifyToken,
  verifyRole("employee"),
  createEmployeeDetails
);

/**
 * @route GET /api/employee/details/:userId
 * @desc Public - Get employee profile by userId
 */
router.get("/details/:userId", getEmployeeDetails);

/**
 * @route GET /api/employee/me
 * @desc Get own employee profile
 * @access Employee only
 */
router.get(
  "/me",
  verifyToken,
  verifyRole("employee"),
  getMyEmployeeDetails
);

/**
 * @route PUT /api/employee/details
 * @desc Update employee profile
 * @access Employee only
 */
router.put(
  "/details",
  verifyToken,
  verifyRole("employee"),
  updateEmployeeDetails
);

/**
 * @route DELETE /api/employee/details
 * @desc Delete employee profile
 * @access Employee only
 */
router.delete(
  "/details",
  verifyToken,
  verifyRole("employee"),
  deleteEmployeeDetails
);

export default router;
