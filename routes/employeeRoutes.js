import express from "express";
import {
  createEmployeeDetails,
  getEmployeeDetails,
  getMyEmployeeDetails,
  updateEmployeeDetails,
  deleteEmployeeDetails
  , saveJobPreferences
  , patchEmployeeMe
  , uploadEmployeeAvatar
  , uploadEmployeeResume
  , deleteEmployeeResume
  , addEducation
  , updateEducation
  , deleteEducation
} from "../controller/employeeController.js";

import { verifyToken } from "../middleware/verifyToken.js";
import { verifyRole } from "../middleware/verifyRole.js";
import { avatarUpload, resumeUpload } from "../middleware/upload.js";

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

// PATCH /employee/me
router.patch(
  "/me",
  verifyToken,
  verifyRole("employee"),
  patchEmployeeMe
);

// file upload endpoints - use multer middleware from upload.js (already imported above)

router.post(
  "/me/avatar",
  verifyToken,
  verifyRole("employee"),
  avatarUpload.single('avatar'),
  uploadEmployeeAvatar
);

router.post(
  "/me/resume",
  verifyToken,
  verifyRole("employee"),
  resumeUpload.single('resume'),
  uploadEmployeeResume
);

router.delete(
  "/me/resume",
  verifyToken,
  verifyRole("employee"),
  deleteEmployeeResume
);

// education CRUD
router.post(
  "/me/education",
  verifyToken,
  verifyRole("employee"),
  addEducation
);

router.patch(
  "/me/education/:eduId",
  verifyToken,
  verifyRole("employee"),
  updateEducation
);

router.delete(
  "/me/education/:eduId",
  verifyToken,
  verifyRole("employee"),
  deleteEducation
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

router.patch("/preferences", verifyToken,  verifyRole("employee"), saveJobPreferences);

export default router;
