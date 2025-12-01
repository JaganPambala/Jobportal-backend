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

// GET /categories/parents -> only top-level parent categories
export const getParentCategories = async (req, res) => {
  try {
    const parents = await JobCategory.find({ parentCategoryId: null }).select("name");
    res.json(parents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /categories/:parentId/children -> children for a parent
export const getChildrenByParent = async (req, res) => {
  try {
    const { parentId } = req.params;
    const children = await JobCategory.find({ parentCategoryId: parentId }).select("name");
    res.json(children);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /categories/:parentId/children-or-jobs -> return children if present, otherwise jobs under that category
import Job from "../models/Job.js";
export const getChildrenOrJobs = async (req, res) => {
  try {
    const { parentId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const children = await JobCategory.find({ parentCategoryId: parentId }).select("name");
    if (children && children.length > 0) {
      return res.json({ type: "children", children });
    }

    // no children — return jobs matching this category id
    const query = { isActive: true, categoryId: parentId };
    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .populate({ path: "employerId", select: "companyName companyLogo", populate: { path: "userId", select: "fullName email" } })
      .populate("categoryId", "name")
      .sort({ postDate: -1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    return res.json({ type: "jobs", jobs, pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
