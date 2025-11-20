import mongoose from "mongoose";
import config from "config";
import seedingCategories from "../utils/seedCategories.js";


const db = config.get("mongoURI");

const connectDB = async () => {
  try {
    await mongoose.connect(db);
    console.log("MongoDB connected");
      await seedingCategories();  
  } catch (error) {
    console.error("MongoDB connection error", error);
    process.exit(1);
  }
};

export default connectDB;
