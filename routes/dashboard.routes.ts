import { Router } from "express";

import dashboardController from "../controllers/dashboard.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

router.get("/overview", authenticate, authorize("ADMIN"), dashboardController.getAdminOverview.bind(dashboardController));

export default router;
