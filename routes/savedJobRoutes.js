import express from 'express';
import { saveJob, unsaveJob, getSavedJobs, checkSavedStatus } from '../controller/savedJobController.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { verifyRole } from '../middleware/verifyRole.js';

const router = express.Router();

// Employee saves a job
router.post('/:id', verifyToken, verifyRole('employee'), saveJob);

// Employee unsaves a job
router.delete('/:id', verifyToken, verifyRole('employee'), unsaveJob);

// Check if the currently logged in employee has saved a job
router.get('/:id/status', verifyToken, verifyRole('employee'), checkSavedStatus);

// Get list of saved jobs for current employee
router.get('/', verifyToken, verifyRole('employee'), getSavedJobs);

export default router;
