import mongoose from "mongoose";

const savedJobSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  savedAt: { type: Date, default: Date.now }
});

// Prevent duplicate saves for same job by same employee
savedJobSchema.index({ jobId: 1, employeeId: 1 }, { unique: true });

export default mongoose.model("SavedJob", savedJobSchema);
