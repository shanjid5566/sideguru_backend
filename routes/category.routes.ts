import { Router } from "express";

import categoryController from "../controllers/category.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { categoryImageUpload } from "../middlewares/upload.middleware";

const router = Router();

router.get("/search", categoryController.searchCategories.bind(categoryController));

router.get("/service", categoryController.getServiceCategoriesWithSubcategories.bind(categoryController));
router.get("/service/:id", categoryController.getServiceCategoryById.bind(categoryController));
router.post(
  "/service/:id/subcategories",
  authenticate,
  authorize("ADMIN"),
  categoryController.createSubCategory.bind(categoryController),
);
router.post(
  "/service",
  authenticate,
  authorize("ADMIN"),
  categoryImageUpload,
  categoryController.createServiceCategory.bind(categoryController),
);

router.get("/event", categoryController.getEventCategoriesSummary.bind(categoryController));
router.post(
  "/event",
  authenticate,
  authorize("ADMIN"),
  categoryImageUpload,
  categoryController.createEventCategory.bind(categoryController),
);

export default router;
