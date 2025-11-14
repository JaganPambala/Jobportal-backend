import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  // Personal Information
  phone: String,
  address: String,
  gender: { type: String, enum: ["M", "F", "O"] },

  // Professional Information
  education: [
    {
      degree: String,
      specialization: String,
      institution: String,
      passedOutYear: String,
    },
  ],
  experience: Number,
  skills: [String],
  pastWork: String,

  // Additional Information
  resumeUrl: String,
  photoUrl: String,

  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("EmployeeDetails", employeeSchema);
