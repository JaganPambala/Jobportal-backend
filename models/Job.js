import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  employerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  title: { type: String, required: true },
  description: String,
  responsibilities: [String],
  location: String,

  experienceRequired: Number,
  minEducation: String,

  skillsRequired: [String],

  salaryRange: {
    min: Number,
    max: Number,
  },

  jobType: {
    type: String,
    enum: ["Full-time", "Part-time", "Remote"],
    default: "Full-time",
  },

  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "JobCategory" },

  isActive: { type: Boolean, default: true },
  postDate: { type: Date, default: Date.now },
  expiryDate: { type: Date },
});

export default mongoose.model("Job", jobSchema);
