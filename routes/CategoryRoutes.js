import { getAllCategories,getSubCategories,getGroupedCategories } from "../controller/CategoryController.js";

import express from "express";

const router = express.Router();    
router.get("/categories", getAllCategories);
router.get("/categories/roles", getSubCategories);
router.get("/categories/grouped", getGroupedCategories);
 
export default router;