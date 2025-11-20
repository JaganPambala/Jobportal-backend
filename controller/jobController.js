
import Job from "../models/Job.js";
import JobCategory from "../models/Job_Category.js";
import user from "../models/user.js";

// CREATE JOB (Employer only)
export const createJob = async (req, res) => {
  try {
    const employerId = req.user.id; // from auth middleware

    // verify employer exists
    const employer = await user.findById(employerId);
    if (!employer || employer.role !== "employer") {
      return res.status(403).json({ message: "Only employers can post jobs" });
    }

    const newJob = new Job({
      employerId,
      title: req.body.title,
      description: req.body.description,
      responsibilities: req.body.responsibilities || [],
      location: req.body.location,
      experienceRequired: req.body.experienceRequired,
      minEducation: req.body.minEducation,
      skillsRequired: req.body.skillsRequired || [],
      salaryRange: req.body.salaryRange,
      jobType: req.body.jobType,
      categoryId: req.body.categoryId,
      expiryDate: req.body.expiryDate,
    });

    const savedJob = await newJob.save();

    res.status(201).json({
      message: "Job created successfully",
      job: savedJob,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating job", error: error.message });
  }
};


//GET JOBS with Filters and Pagination
export const getJobs = async (req, res) => {
  try {
    const { categoryId, location, jobType, skills, page = 1, limit = 10 } = req.query;

    const query = { isActive: true };

    if (categoryId) query.categoryId = categoryId;
    if (location) query.location = { $regex: location, $options: "i" };
    if (jobType) query.jobType = jobType;

    // skill filter (matches any skill)
    if (skills) {
      const skillsArray = skills.split(",");
      query.skillsRequired = { $in: skillsArray };
    }

    const jobs = await Job.find(query)
      .populate("employerId", "name email companyName")
      .populate("categoryId", "name")
      .sort({ postDate: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching jobs", error });
  }
};


export const getEmployerJobs = async (req, res) => {
  try {
    const employerId = req.params.employerId;

    const jobs = await Job.find({ employerId })
      .populate("categoryId", "name")
      .sort({ postDate: -1 });

    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching employer jobs", error });
  }
};


//Get Job by ID
export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate("employerId", "name email companyName")
      .populate("categoryId", "name");

    if (!job) return res.status(404).json({ message: "Job not found" });

    res.status(200).json(job);
  } catch (error) {
    res.status(500).json({ message: "Error fetching job", error });
  }
};


//Update Job (Employer only)

export const updateJob = async (req, res) => {
  try {
    const employerId = req.user.id;

    const job = await Job.findById(req.params.id);

    if (!job) return res.status(404).json({ message: "Job not found" });

    if (job.employerId.toString() !== employerId) {
      return res.status(403).json({ message: "You can only update your own jobs" });
    }

    Object.assign(job, req.body);

    const updatedJob = await job.save();

    res.status(200).json({
      message: "Job updated successfully",
      job: updatedJob,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating job", error });
  }
};


//Delete Job (Soft Delete)

export const deleteJob = async (req, res) => {
  try {
    const employerId = req.user.id;

    const job = await Job.findById(req.params.id);

    if (!job) return res.status(404).json({ message: "Job not found" });

    if (job.employerId.toString() !== employerId) {
      return res.status(403).json({ message: "You can delete only your own jobs" });
    }

    job.isActive = false;
    await job.save();

    res.status(200).json({ message: "Job deleted (soft delete) successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting job", error });
  }
};
