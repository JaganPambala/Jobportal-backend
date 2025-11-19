import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },

  role: { type: String, enum: ["employee", "employer", null], default: null },

  isVerified: { type: Boolean, default: false },
  otp: String,
  otpExpiresAt: Date,

  createdAt: { type: Date, default: Date.now },
});



const User = mongoose.model("User", userSchema);
export default User;