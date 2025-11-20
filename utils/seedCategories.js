
import JobCategory from "../models/Job_Category.js";

const seedCategories = async () => {
  try {
    // Check if categories already exist
    const count = await JobCategory.countDocuments();

    if (count > 0) {
      console.log(`Category table already has ${count} records. Skipping seeding.`);
      return ;
    }

    console.log("Seeding categories...");

    // Insert Parent Categories
    const parentCategories = await JobCategory.insertMany([
      { name: "Software Development", parentCategoryId: null },
      { name: "Data & Analytics", parentCategoryId: null },
      { name: "Design & Creative", parentCategoryId: null },
      { name: "Cloud & DevOps", parentCategoryId: null },
    ]);

    console.log("Parent categories created.");

    const softwareId = parentCategories[0]._id;
    const dataId = parentCategories[1]._id;
    const designId = parentCategories[2]._id;
    const cloudId = parentCategories[3]._id;

    // Insert Subcategories
    await JobCategory.insertMany([
      // Software Development
      { name: "Frontend Developer", parentCategoryId: softwareId },
      { name: "Backend Developer", parentCategoryId: softwareId },
      { name: "Full Stack Developer", parentCategoryId: softwareId },

      // Data & Analytics
      { name: "Data Analyst", parentCategoryId: dataId },
      { name: "Data Scientist", parentCategoryId: dataId },

      // Design & Creative
      { name: "UI Designer", parentCategoryId: designId },
      { name: "UX Researcher", parentCategoryId: designId },

      // Cloud & DevOps
      { name: "DevOps Engineer", parentCategoryId: cloudId },
      { name: "Cloud Architect", parentCategoryId: cloudId },
    ]);

    console.log("Subcategories created.");
    console.log("Category seeding completed!");

  } catch (err) {
    console.error("Error while seeding:", err);

  }
};

seedCategories(); 

export default seedCategories;
