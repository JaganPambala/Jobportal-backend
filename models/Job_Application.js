import mongoose from "mongoose";

const jobApplicationSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  status: {
    type: String,
    enum: ["Applied", "Viewed", "Shortlisted", "Rejected"],
    default: "Applied",
  },

  message: String, // cover letter
  feedback: String, // employer feedback

  appliedAt: { type: Date, default: Date.now },
});

export default mongoose.model("JobApplication", jobApplicationSchema);
