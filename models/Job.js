import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  role: String,
  responsibilities: String,
  location: String,
  experienceRequired: String,
  minEducation: String,
  workHours: Number,
  salary: String,
  jobType: { type: String, enum: ["Full-time", "Part-time", "Remote"], default: "Full-time" },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "JobCategory" },
  employer: { type: mongoose.Schema.Types.ObjectId, ref: "Employer" },
  isActive: { type: Boolean, default: true },
  postDate: { type: Date, default: Date.now },
});

export default mongoose.model("Job", jobSchema);
