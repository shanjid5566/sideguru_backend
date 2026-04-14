"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_revenue_controller_1 = __importDefault(require("../controllers/admin-revenue.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"));
router.get("/today", admin_revenue_controller_1.default.getRevenueToday.bind(admin_revenue_controller_1.default));
router.get("/this-month", admin_revenue_controller_1.default.getRevenueThisMonth.bind(admin_revenue_controller_1.default));
router.get("/total", admin_revenue_controller_1.default.getTotalRevenue.bind(admin_revenue_controller_1.default));
router.get("/sales-performance", admin_revenue_controller_1.default.getSalesPerformance.bind(admin_revenue_controller_1.default));
router.get("/stats", admin_revenue_controller_1.default.getRevenueStats.bind(admin_revenue_controller_1.default));
exports.default = router;
