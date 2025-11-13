import mongoose from "mongoose";

const jobApplicationSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  status: {
    type: String,
    enum: ["Applied", "Shortlisted", "Rejected"],
    default: "Applied",
  },
  appliedAt: { type: Date, default: Date.now },
  message: String,
 feedback: String, 

});

export default mongoose.model("JobApplication", jobApplicationSchema);
