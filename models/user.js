const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["employee", "employer", null], default: null },
  createdAt: { type: Date, default: Date.now },
});
export default mongoose.model("User", userSchema);
