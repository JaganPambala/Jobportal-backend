import JobCategory from "../models/Job_Category.js";
// GET /categories  → all categories
export const getAllCategories = async (req, res) => {
  try {
    const categories = await JobCategory.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /categories/roles  → only subcategories (job roles)
export const getSubCategories = async (req, res) => {
  try {
    const roles = await JobCategory.find({
      parentCategoryId: { $ne: null },
    });
    res.json(roles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /categories/grouped  → parent → children mapping
export const getGroupedCategories = async (req, res) => {
  try {
    const parents = await JobCategory.find({ parentCategoryId: null });
    const children = await JobCategory.find({
      parentCategoryId: { $ne: null },
    });

    const grouped = parents.map((parent) => ({
      parent: parent.name,
      parentId: parent._id,
      children: children
        .filter(
          (child) =>
            child.parentCategoryId?.toString() === parent._id.toString()
        )
        .map((child) => ({
          id: child._id,
          name: child.name,
        })),
    }));

    res.json(grouped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
