import mongoose from "mongoose";

const employerSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  companyName: { type: String, required: true },
  companyAddress: String,
  companyPhone: String,
  companyWebsite: String,
  companyLogo: String, 
  companyProfile: String, 
  requirements: [String], 
 applicantsCount: { type: Number, default: 0 }, 
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Employer", employerSchema);
