import { getAllCategories,getSubCategories,getGroupedCategories, getParentCategories, getChildrenByParent, getChildrenOrJobs } from "../controller/CategoryController.js";

import express from "express";

const router = express.Router();    
router.get("/categories", getAllCategories);
router.get("/categories/roles", getSubCategories);
router.get("/categories/grouped", getGroupedCategories);
router.get("/categories/parents", getParentCategories);
router.get("/categories/:parentId/children", getChildrenByParent);
router.get("/categories/:parentId/children-or-jobs", getChildrenOrJobs);
 
export default router;