"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const admin_revenue_service_1 = __importDefault(require("../services/admin-revenue.service"));
const sendResponse = (res, result) => res.status(result.statusCode).json({
    success: true,
    message: result.message,
    ...(result.data !== undefined ? { data: result.data } : {}),
    ...(result.meta !== undefined ? { meta: result.meta } : {}),
});
const getSingleQueryParam = (value) => {
    if (Array.isArray(value)) {
        return typeof value[0] === "string" ? value[0] : undefined;
    }
    return typeof value === "string" ? value : undefined;
};
class AdminRevenueController {
    async getRevenueToday(_req, res, next) {
        try {
            const result = await admin_revenue_service_1.default.getRevenueToday();
            sendResponse(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async getRevenueThisMonth(_req, res, next) {
        try {
            const result = await admin_revenue_service_1.default.getRevenueThisMonth();
            sendResponse(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async getTotalRevenue(_req, res, next) {
        try {
            const result = await admin_revenue_service_1.default.getTotalRevenue();
            sendResponse(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async getSalesPerformance(req, res, next) {
        try {
            const yearQuery = getSingleQueryParam(req.query.year);
            const parsedYear = yearQuery ? Number.parseInt(yearQuery, 10) : Number.NaN;
            const result = await admin_revenue_service_1.default.getSalesPerformance({
                year: Number.isNaN(parsedYear) ? new Date().getFullYear() : parsedYear,
            });
            sendResponse(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async getRevenueStats(_req, res, next) {
        try {
            const result = await admin_revenue_service_1.default.getRevenueStats();
            sendResponse(res, result);
        }
        catch (error) {
            next(error);
        }
    }
}
const adminRevenueController = new AdminRevenueController();
exports.default = adminRevenueController;
