
import Job from "../models/Job.js";
import JobCategory from "../models/Job_Category.js";
import user from "../models/user.js";
import EmployerDetails from "../models/Employeer.js";
import JobApplication from "../models/Job_Application.js";

// CREATE JOB (Employer only)
export const createJob = async (req, res) => {
  try {
    const userId = req.user.id; // from auth middleware

    // verify user exists and has employer role
    const employerUser = await user.findById(userId);
    if (!employerUser || employerUser.role !== "employer") {
      return res.status(403).json({ message: "Only employers can post jobs" });
    }

    // find employer details document for this user
    const employerDetails = await EmployerDetails.findOne({ userId });
    if (!employerDetails) {
      return res.status(400).json({ message: "Employer profile not found. Create employer details first." });
    }

    const newJob = new Job({
      employerId: employerDetails._id,
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
      isFeatured: req.body.isFeatured || false,
      isActive: req.body.isActive || true,
      postDate: req.body.postDate || Date.now(),
      updatedAt: req.body.updatedAt || Date.now(),
    
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


// GET ALL JOBS WITH PAGINATION
export const getJobs = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const query = { isActive: true };

    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .populate({
        path: "employerId",
        select: "companyName companyLogo companyWebsite companyProfile companyPhone",
        populate: { path: "userId", select: "name email" },
      })
      .populate("categoryId", "name")
      .sort({ postDate: -1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    res.status(200).json({
      jobs,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching jobs", error: error.message });
  }
};

// GET FEATURED JOBS
export const getFeaturedJobs = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const query = { isActive: true, isFeatured: true };

    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .populate({
        path: "employerId",
        select: "companyName companyLogo companyWebsite companyProfile companyPhone",
        populate: { path: "userId", select: "name email" },
      })
      .populate("categoryId", "name")
      .sort({ postDate: -1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    res.status(200).json({
      jobs,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching featured jobs", error: error.message });
  }
};

// GET POPULAR JOBS (by total applicants)
export const getPopularJobs = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const query = { isActive: true };

    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .populate({
        path: "employerId",
        select: "companyName companyLogo companyWebsite companyProfile companyPhone",
        populate: { path: "userId", select: "name email" },
      })
      .populate("categoryId", "name")
      .sort({ totalApplicants: -1, postDate: -1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    res.status(200).json({
      jobs,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching popular jobs", error: error.message });
  }
};

// GET TRENDING JOBS (by view count and recent activity)
export const getTrendingJobs = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const query = { isActive: true, updatedAt: { $gte: sevenDaysAgo } };

    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .populate({
        path: "employerId",
        select: "companyName companyLogo companyWebsite companyProfile companyPhone",
        populate: { path: "userId", select: "name email" },
      })
      .populate("categoryId", "name")
      .sort({ viewCount: -1, updatedAt: -1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    res.status(200).json({
      jobs,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching trending jobs", error: error.message });
  }
};

// GET RECOMMENDED JOBS (based on job preferences - requires employee preferences)
export const getRecommendedJobs = async (req, res) => {
  try {
    // This requires employee model with saved preferences
    // For now, implementing basic recommendation based on recent jobs in preferred categories
    const userId = req.user?.id;
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    // You may want to fetch user preferences from Employee model
    // For this implementation, we'll return recently posted jobs
    const query = { isActive: true };

    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .populate({
        path: "employerId",
        select: "companyName companyLogo companyWebsite companyProfile companyPhone",
        populate: { path: "userId", select: "name email" },
      })
      .populate("categoryId", "name")
      .sort({ postDate: -1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    res.status(200).json({
      jobs,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching recommended jobs", error: error.message });
  }
};

// FULL SEARCH ENDPOINT WITH ADVANCED FILTERS
export const searchJobs = async (req, res) => {
  try {
    const {
      keyword,
      categoryId,
      location,
      jobType,
      skills,
      minSalary,
      maxSalary,
      experienceLevel,
      page = 1,
      limit = 10,
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const query = { isActive: true };

    // Keyword search across title, description, and responsibilities
    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
        { responsibilities: { $regex: keyword, $options: "i" } },
      ];
    }

    // Category filter
    if (categoryId) {
      query.categoryId = categoryId;
    }

    // Location filter
    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    // Job type filter
    if (jobType) {
      query.jobType = jobType;
    }

    // Skills filter (matches any skill)
    if (skills) {
      const skillsArray = skills.split(",").map(skill => skill.trim());
      query.skillsRequired = { $in: skillsArray };
    }

    // Salary range filter
    if (minSalary || maxSalary) {
      query.$or = query.$or || [];
      if (minSalary) {
        query.$or.push({ "salaryRange.min": { $gte: parseInt(minSalary) } });
      }
      if (maxSalary) {
        query.$or.push({ "salaryRange.max": { $lte: parseInt(maxSalary) } });
      }
    }

    // Experience level filter
    if (experienceLevel) {
      query.experienceRequired = { $lte: parseInt(experienceLevel) };
    }

    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .populate({
        path: "employerId",
        select: "companyName companyLogo companyWebsite companyProfile companyPhone",
        populate: { path: "userId", select: "name email" },
      })
      .populate("categoryId", "name")
      .sort({ postDate: -1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    res.status(200).json({
      jobs,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error searching jobs", error: error.message });
  }
};

// GET JOBS BY CATEGORY
export const getJobsByCategory = async (req, res) => {
  try {
    const { id: categoryId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    // Verify category exists
    const category = await JobCategory.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const query = { isActive: true, categoryId };

    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .populate("employerId", "name email companyName companyLogo")
      .populate("categoryId", "name")
      .sort({ postDate: -1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    res.status(200).json({
      category: category.name,
      jobs,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching jobs by category", error: error.message });
  }
};


export const getEmployerJobs = async (req, res) => {
  try {
    const employerId = req.params.employerId;

    const jobs = await Job.find({ employerId })
      .populate({
        path: "employerId",
        select: "companyName companyLogo companyWebsite companyProfile companyPhone",
        populate: { path: "userId", select: "name email" },
      })
      .populate("categoryId", "name")
      .sort({ postDate: -1 });

    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching employer jobs", error });
  }
};


// GET MY JOBS (Employer only) - /jobs/my-jobs
export const getMyJobs = async (req, res) => {
  try {
    const userId = req.user.id; // from auth middleware
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    // Find employer profile for this user
    const employerDetails = await EmployerDetails.findOne({ userId });
    if (!employerDetails) {
      return res.status(404).json({ message: "Employer profile not found. Create employer details first." });
    }

    const query = { employerId: employerDetails._id };
    const total = await Job.countDocuments(query);

    // fetch jobs for this employer (paged)
    const jobs = await Job.find(query)
      .populate({
        path: "employerId",
        select: "companyName companyLogo companyWebsite companyProfile companyPhone",
        populate: { path: "userId", select: "name email" },
      })
      .populate("categoryId", "name")
      .sort({ postDate: -1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    const jobIds = jobs.map(j => j._id);

    // Aggregate application counts grouped by jobId and status
    const agg = await JobApplication.aggregate([
      { $match: { jobId: { $in: jobIds } } },
      { $group: { _id: { jobId: "$jobId", status: "$status" }, count: { $sum: 1 } } }
    ]);

    // Build map: jobId => {total, Applied, Viewed, Shortlisted, Rejected}
    const countsMap = {};
    agg.forEach(item => {
      const jid = item._id.jobId.toString();
      if (!countsMap[jid]) countsMap[jid] = { total: 0, Applied: 0, Viewed: 0, Shortlisted: 0, Rejected: 0 };
      countsMap[jid][item._id.status] = item.count;
      countsMap[jid].total += item.count;
    });

    // Format response: include fields useful for managing jobs
    const formatted = jobs.map(job => {
      const jid = job._id.toString();
      const counts = countsMap[jid] || { total: job.totalApplicants || 0, Applied: 0, Viewed: 0, Shortlisted: 0, Rejected: 0 };
      const now = new Date();
      let status = "Active";
      if (!job.isActive) status = "Closed";
      else if (job.expiryDate && job.expiryDate < now) status = "Expired";

      return {
        id: job._id,
        title: job.title,
        companyName: job.employerId?.companyName || "",
        companyLogo: job.employerId?.companyLogo || null,
        category: job.categoryId?.name || null,
        location: job.location || null,
        jobType: job.jobType || null,
        salaryRange: job.salaryRange || null,
        experienceRequired: job.experienceRequired || null,
        postDate: job.postDate,
        expiryDate: job.expiryDate || null,
        viewCount: job.viewCount || 0,
        totalApplicants: counts.total || job.totalApplicants || 0,
        applicantsBreakdown: counts,
        status,
        isFeatured: job.isFeatured || false,
      };
    });

    res.status(200).json({
      jobs: formatted,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching my jobs", error: error.message });
  }
};


//Get Job by ID (with view count increment)
export const getJobById = async (req, res) => {
  try {
    const jobId = req.params.id;

    // Find job and increment view count atomically
    const job = await Job.findByIdAndUpdate(
      jobId,
      { $inc: { viewCount: 1 } },
      { new: true }
    )
      .populate({
        path: "employerId",
        select: "companyName companyLogo companyWebsite companyProfile companyPhone",
        populate: { path: "userId", select: "name email" },
      })
      .populate("categoryId", "name");

    if (!job) return res.status(404).json({ message: "Job not found" });

    res.status(200).json(job);
  } catch (error) {
    res.status(500).json({ message: "Error fetching job", error: error.message });
  }
};


//Update Job (Employer only)

export const updateJob = async (req, res) => {
  try {
    const userId = req.user.id;

    const job = await Job.findById(req.params.id);

    if (!job) return res.status(404).json({ message: "Job not found" });

    // verify the user owns this employer profile
    const employerDetails = await EmployerDetails.findOne({ userId });
    if (!employerDetails) return res.status(403).json({ message: "No employer profile for this user" });

    if (job.employerId.toString() !== employerDetails._id.toString()) {
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
    const userId = req.user.id;

    const job = await Job.findById(req.params.id);

    if (!job) return res.status(404).json({ message: "Job not found" });

    // verify the user owns this employer profile
    const employerDetails = await EmployerDetails.findOne({ userId });
    if (!employerDetails) return res.status(403).json({ message: "No employer profile for this user" });

    if (job.employerId.toString() !== employerDetails._id.toString()) {
      return res.status(403).json({ message: "You can delete only your own jobs" });
    }

    job.isActive = false;
    await job.save();

    res.status(200).json({ message: "Job deleted (soft delete) successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting job", error });
  }
};


// PATCH - Activate or deactivate a job (Employer only)
export const setJobActivation = async (req, res) => {
  try {
    const userId = req.user.id;
    const jobId = req.params.id;

    // validate input
    if (typeof req.body.isActive === "undefined") {
      return res.status(400).json({ message: "Request body must include isActive boolean" });
    }

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    // verify the user owns this employer profile
    const employerDetails = await EmployerDetails.findOne({ userId });
    if (!employerDetails) return res.status(403).json({ message: "No employer profile for this user" });

    if (job.employerId.toString() !== employerDetails._id.toString()) {
      return res.status(403).json({ message: "You can only update your own jobs" });
    }

    // update only isActive and updatedAt for quick change
    job.isActive = !!req.body.isActive; // coerce to boolean
    job.updatedAt = new Date();
    const updated = await job.save();

    res.status(200).json({ message: `Job ${job.isActive ? 'activated' : 'deactivated'} successfully`, job: updated });
  } catch (error) {
    res.status(500).json({ message: "Error changing job activation", error: error.message });
  }
};
