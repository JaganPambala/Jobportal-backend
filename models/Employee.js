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

  // ✅ Job Preferences
  jobPreferences: {
    selectedRoles: [String],        // UX Designer, Motion Designer etc.
    selectedLocation: String,       // USA, Worldwide etc.
    jobType: String,                // Any, Full-Time etc.
    officeType: String,             // Remote, On-Site etc.
  },

  // ✅ Selected Categories
  selectedCategories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobCategory",
    },
  ],

  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("EmployeeDetails", employeeSchema);
