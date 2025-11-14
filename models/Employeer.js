import mongoose from "mongoose";

const employerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  companyName: { type: String, required: true },
  companyAddress: String,
  companyPhone: String,
  companyWebsite: String,
  companyLogo: String,
  companyProfile: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("EmployerDetails", employerSchema);
