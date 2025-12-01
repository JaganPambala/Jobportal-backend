import express from "express";
import {
  createEmployerDetails,
  getEmployerDetails,
  updateEmployerDetails,
  deleteEmployerDetails,
  getMyEmployerDetails,
  uploadEmployerLogo,
} from "../controller/employerController.js";

import { verifyToken } from "../middleware/verifyToken.js";
import { verifyRole } from "../middleware/verifyRole.js";
import { avatarUpload } from "../middleware/upload.js";

// Multer error handler for uploads
const handleMulterError = (err, req, res, next) => {
  if (err) {
    console.error('Multer error (employer):', err);
    return res.status(400).json({ message: 'File upload error', error: err.message });
  }
  next();
};

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


// POST /me/logo - upload company logo
router.post(
  "/me/logo",
  verifyToken,
  verifyRole("employer"),
  (req, res, next) => {
    avatarUpload.single('logo')(req, res, (err) => handleMulterError(err, req, res, next));
  },
  uploadEmployerLogo
);


export default router;
