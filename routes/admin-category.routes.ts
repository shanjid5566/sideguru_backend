import { Router } from "express";

import adminCategoryController from "../controllers/admin-category.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate, authorize("ADMIN"));

router.patch("/service", adminCategoryController.updateServiceCategoryAndSubcategory.bind(adminCategoryController));
router.patch("/event", adminCategoryController.updateEventCategory.bind(adminCategoryController));
router.delete("/service/:categoryId", adminCategoryController.deleteServiceCategory.bind(adminCategoryController));
router.delete(
	"/service/:categoryId/subcategories/:subcategoryId",
	adminCategoryController.deleteServiceSubcategory.bind(adminCategoryController),
);
router.delete("/event/:categoryId", adminCategoryController.deleteEventCategory.bind(adminCategoryController));

export default router;
