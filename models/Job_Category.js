import mongoose from "mongoose";

const jobCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: "JobCategory" },
});

export default mongoose.model("JobCategory", jobCategorySchema);
