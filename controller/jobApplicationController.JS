import JobApplication from "../models/Job_Application.js";
import Job from "../models/Job.js";
import EmployeeDetails from "../models/Employee.js";
import EmployerDetails from "../models/Employeer.js";

// EMPLOYEE: Apply for a job
export const applyJob = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const jobId = req.params.jobId;

    // Basic validations - job must exist and be active
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (!job.isActive) return res.status(400).json({ message: "Job is not active" });
    if (job.expiryDate && job.expiryDate < new Date()) return res.status(400).json({ message: "Job has expired" });

    // Ensure employee profile exists and includes required fields before applying
    const employeeProfile = await EmployeeDetails.findOne({ userId: employeeId });
    if (!employeeProfile) {
      return res.status(400).json({ message: "Complete your applicant profile before applying (create Employee details)." });
    }
    // Require resume for application (you can change this to be optional)
    if (!employeeProfile.resumeUrl) {
      return res.status(400).json({ message: "Please upload your resume before applying for jobs." });
    }

    // Check if already applied
    const alreadyApplied = await JobApplication.findOne({ jobId, employeeId });
    if (alreadyApplied) {
      return res.status(400).json({ message: "Already applied for this job" });
    }

    const messageText = req.body?.message || "";
    const application = new JobApplication({
      jobId,
      employeeId,
      message: messageText
    });
    await application.save();

    // Increment total applicants count in Job model (non-critical, if fails, we still return success)
    await Job.findByIdAndUpdate(jobId, { $inc: { totalApplicants: 1 } });

    res.status(201).json({
      message: "Job applied successfully",
      application
    });
  } catch (err) {
    const errorMessage = err?.message || err || "Unknown error";
    console.error('applyJob error:', err);
    res.status(500).json({ message: "Error applying for job", error: errorMessage });
  }
};

// EMPLOYEE: Get all applications by logged-in employee
export const getEmployeeApplications = async (req, res) => {
  try {
    // Pagination and optional status filter
    const { page = 1, limit = 10, status } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const query = { employeeId: req.user.id };
    const allowedStatuses = ["Applied", "Viewed", "Shortlisted", "Rejected"];
    if (typeof status !== 'undefined') {
      // support comma-separated or array status filters
      const statuses = Array.isArray(status) ? status : String(status).split(",").map(s => s.trim()).filter(Boolean);
      // validate each status
      const invalid = statuses.filter(s => !allowedStatuses.includes(s));
      if (invalid.length) {
        return res.status(400).json({ message: 'Invalid status filter(s)', invalid, allowedStatuses });
      }
      // use $in to match any of the provided statuses
      query.status = { $in: statuses };
    }

    // Populate job details and nested employer fields; select only required fields
    const total = await JobApplication.countDocuments(query);
    const applications = await JobApplication.find(query)
      .populate({
        path: 'jobId',
        select: 'title salaryRange location jobType employerId',
        populate: { path: 'employerId', select: 'companyName companyLogo' }
      })
      .select('status message appliedAt jobId employeeId')
      .sort({ appliedAt: -1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    // Map to the required response shape
    const formatted = applications.map(app => ({
      applicationId: app._id,
      applicationStatus: app.status,
      appliedAt: app.appliedAt,
      message: app.message || '',
      employeeId: app.employeeId,
      jobId: app.jobId?._id || null,
      jobTitle: app.jobId?.title || null,
      jobType: app.jobId?.jobType || null,
      salaryRange: app.jobId?.salaryRange || null,
      location: app.jobId?.location || null,
      employerId: app.jobId?.employerId?._id || null,
      companyName: app.jobId?.employerId?.companyName || null,
      companyLogo: app.jobId?.employerId?.companyLogo || null,
    }));

    res.status(200).json({
      applications: formatted,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching applications", error: err });
  }
};

// EMPLOYER: Get applications for one job they posted
export const getEmployerJobApplications = async (req, res) => {
  try {
    const jobId = req.params.jobId;

    // Check if job belongs to the employer (confirm user's employer details and match employerId)
    const employerProfile = await EmployerDetails.findOne({ userId: req.user.id });
    if (!employerProfile) return res.status(403).json({ message: "No employer profile for this user" });
    const job = await Job.findOne({ _id: jobId, employerId: employerProfile._id });
    if (!job) {
      return res.status(403).json({ message: "You do not own this job" });
    }

    const applications = await JobApplication.find({ jobId })
      .populate("employeeId", "fullName email");

    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: "Error fetching applications", error: err });
  }
};

// EMPLOYER: Update application status
export const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, feedback } = req.body;

    const application = await JobApplication.findById(applicationId).populate("jobId");

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Only job owner can update status (ensure user's employer profile matches job employer)
    const employerProfile = await EmployerDetails.findOne({ userId: req.user.id });
    if (!employerProfile) return res.status(403).json({ message: "No employer profile for this user" });
    if (application.jobId.employerId.toString() !== employerProfile._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const allowedStatuses = ["Applied", "Viewed", "Shortlisted", "Rejected"];
    if (typeof status !== 'undefined') {
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status value", allowedStatuses });
      }
      application.status = status;
    }
    application.feedback = feedback || application.feedback;

    await application.save();

    res.json({
      message: "Application status updated",
      application
    });
  } catch (err) {
    res.status(500).json({ message: "Error updating status", error: err });
  }
};

// EMPLOYEE: Delete/cancel application
export const deleteApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await JobApplication.findById(applicationId);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Only the employee who applied can delete it
    if (application.employeeId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await JobApplication.findByIdAndDelete(applicationId);

    // Decrement job's totalApplicants atomically; ensure it does not go below 0
    try {
      const updatedJob = await Job.findByIdAndUpdate(application.jobId, { $inc: { totalApplicants: -1 } }, { new: true });
      if (updatedJob && typeof updatedJob.totalApplicants === 'number' && updatedJob.totalApplicants < 0) {
        // correct negative counts that might happen due to concurrent updates
        await Job.findByIdAndUpdate(application.jobId, { $set: { totalApplicants: 0 } });
      }
    } catch (e) {
      // Log error (if logger exists) but do not fail the delete request
      console.error('Failed to decrement totalApplicants for job', application.jobId, e);
    }

    res.json({ message: "Application deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting application", error: err });
  }
};
