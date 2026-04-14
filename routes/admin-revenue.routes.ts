import { Router } from "express";

import adminRevenueController from "../controllers/admin-revenue.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate, authorize("ADMIN"));

router.get("/today", adminRevenueController.getRevenueToday.bind(adminRevenueController));
router.get("/this-month", adminRevenueController.getRevenueThisMonth.bind(adminRevenueController));
router.get("/total", adminRevenueController.getTotalRevenue.bind(adminRevenueController));
router.get("/sales-performance", adminRevenueController.getSalesPerformance.bind(adminRevenueController));
router.get("/stats", adminRevenueController.getRevenueStats.bind(adminRevenueController));

export default router;
