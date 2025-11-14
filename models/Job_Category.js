import mongoose from "mongoose";

const jobCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  parentCategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "JobCategory",
    default: null,
  },
});

export default mongoose.model("JobCategory", jobCategorySchema);
