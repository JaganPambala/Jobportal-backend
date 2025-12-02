import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  employerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "EmployerDetails",
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
  isFeatured: { type: Boolean, default: false },
  totalApplicants: { type: Number, default: 0 },
  savedCount: { type: Number, default: 0 },
  viewCount: { type: Number, default: 0 },

  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "JobCategory" },

  isActive: { type: Boolean, default: true },
  postDate: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  expiryDate: { type: Date },

  // indexes for efficient queries
}, { timestamps: false });

jobSchema.index({ isActive: 1, postDate: -1 });
jobSchema.index({ categoryId: 1, isActive: 1 });
jobSchema.index({ isFeatured: 1, isActive: 1 });
jobSchema.index({ viewCount: -1, isActive: 1 });
jobSchema.index({ totalApplicants: -1, isActive: 1 });
jobSchema.index({ savedCount: -1, isActive: 1 });
jobSchema.index({ postDate: -1, isActive: 1 });

export default mongoose.model("Job", jobSchema);
