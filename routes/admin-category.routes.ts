import { Router } from "express";

import adminCategoryController from "../controllers/admin-category.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate, authorize("ADMIN"));

router.patch("/service", adminCategoryController.updateServiceCategoryAndSubcategory.bind(adminCategoryController));
router.patch("/event", adminCategoryController.updateEventCategory.bind(adminCategoryController));

export default router;
