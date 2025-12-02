import SavedJob from '../models/SavedJob.js';
import Job from '../models/Job.js';
import EmployerDetails from '../models/Employeer.js';
import { getIO } from '../utils/socket.js';
import JobApplication from '../models/Job_Application.js';

// Save a job for an employee
export const saveJob = async (req, res) => {
  try {
    const userId = req.user.id;
    const jobId = req.params.id;
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    const saved = new SavedJob({ jobId, employeeId: userId });
    try {
      await saved.save();
    } catch (e) {
      if (e.code === 11000) return res.status(200).json({ message: 'Job already saved' });
      throw e;
    }
    await Job.findByIdAndUpdate(jobId, { $inc: { savedCount: 1 } });
    // notify employer
    try {
      const employerProfile = await EmployerDetails.findById(job.employerId);
      const employerUserId = employerProfile?.userId?.toString();
      const io = getIO();
      if (io && employerUserId) io.to(`user_${employerUserId}`).emit('jobSaved', { jobId, employeeId: userId });
    } catch (e) {
      console.error('realtime notify error', e);
    }
    res.status(201).json({ message: 'Job saved' });
  } catch (err) {
    res.status(500).json({ message: 'Error saving job', error: err.message || err });
  }
};

// Unsave a job
export const unsaveJob = async (req, res) => {
  try {
    const userId = req.user.id;
    const jobId = req.params.id;
    const removed = await SavedJob.findOneAndDelete({ jobId, employeeId: userId });
    if (!removed) return res.status(404).json({ message: 'Saved job not found' });
    const job = await Job.findByIdAndUpdate(jobId, { $inc: { savedCount: -1 } }, { new: true });
    if (job && job.savedCount < 0) await Job.findByIdAndUpdate(jobId, { $set: { savedCount: 0 } });
    res.json({ message: 'Job unsaved' });
  } catch (err) {
    res.status(500).json({ message: 'Error unsaving job', error: err.message || err });
  }
};

// Get saved jobs for an employee
export const getSavedJobs = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const total = await SavedJob.countDocuments({ employeeId });
    const saved = await SavedJob.find({ employeeId })
      .populate({ path: 'jobId', select: 'title salaryRange location jobType employerId', populate: { path: 'employerId', select: 'companyName companyLogo' } })
      .sort({ savedAt: -1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);
    // collect jobIds to fetch related application statuses for this employee in one query
    const jobIds = saved.map(s => s.jobId?._id).filter(Boolean);
    const applications = await JobApplication.find({ jobId: { $in: jobIds }, employeeId });
    const appMap = {};
    applications.forEach(a => { appMap[a.jobId.toString()] = { status: a.status, applicationId: a._id }; });

    const formatted = saved.map(s => ({
      savedId: s._id,
      savedAt: s.savedAt,
      jobId: s.jobId?._id || null,
      jobTitle: s.jobId?.title || null,
      location: s.jobId?.location || null,
      jobType: s.jobId?.jobType || null,
      companyName: s.jobId?.employerId?.companyName || null,
      companyLogo: s.jobId?.employerId?.companyLogo || null,
      salaryRange: s.jobId?.salaryRange || null,
      applicationStatus: appMap[s.jobId?._id?.toString()]?.status || null,
      applicationId: appMap[s.jobId?._id?.toString()]?.applicationId || null,
    }));
    res.json({ savedJobs: formatted, pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) } });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching saved jobs', error: err.message || err });
  }
};

// Check if a job is saved by current employee
export const checkSavedStatus = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const jobId = req.params.id;
    const found = await SavedJob.findOne({ jobId, employeeId });
    res.json({ isSaved: !!found });
  } catch (err) {
    res.status(500).json({ message: 'Error checking saved status', error: err.message || err });
  }
};
