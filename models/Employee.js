import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  education: String,
  experience: Number,
  skills: [String],
  pastWork: String,
  phone: String,
  address: String,
  gender: { type: String, enum: ["M", "F", "O"], default: "O" },
  resumeUrl: String, // store resume file URL (Firebase)
  photoUrl: String, // optional: profile photo
  

  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Employee", employeeSchema);
