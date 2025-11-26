import JobApplication from "../models/Job_Application.js";
import Job from "../models/Job.js";

// EMPLOYEE: Apply for a job
export const applyJob = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const jobId = req.params.jobId;

    // Check if already applied
    const alreadyApplied = await JobApplication.findOne({ jobId, employeeId });
    if (alreadyApplied) {
      return res.status(400).json({ message: "Already applied for this job" });
    }

    const application = new JobApplication({
      jobId,
      employeeId,
      message: req.body.message || ""
    });
 // Increment total applicants count in Job model
     await Job.findByIdAndUpdate(jobId, { $inc: { totalApplicants: 1 } });

    await application.save();

    res.status(201).json({
      message: "Job applied successfully",
      application
    });
  } catch (err) {
    res.status(500).json({ message: "Error applying for job", error: err });
  }
};

// EMPLOYEE: Get all applications by logged-in employee
export const getEmployeeApplications = async (req, res) => {
  try {
    const applications = await JobApplication.find({ employeeId: req.user.id })
      .populate("jobId");

    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: "Error fetching applications", error: err });
  }
};

// EMPLOYER: Get applications for one job they posted
export const getEmployerJobApplications = async (req, res) => {
  try {
    const jobId = req.params.jobId;

    // Check if job belongs to the employer
    const job = await Job.findOne({ _id: jobId, employerId: req.user.id });
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

    // Only job owner can update status
    if (application.jobId.employerId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    application.status = status || application.status;
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

    res.json({ message: "Application deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting application", error: err });
  }
};
