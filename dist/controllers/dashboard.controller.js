"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dashboard_service_1 = __importDefault(require("../services/dashboard.service"));
const sendResponse = (res, result) => res.status(result.statusCode).json({
    success: true,
    message: result.message,
    ...(result.data !== undefined ? { data: result.data } : {}),
    ...(result.meta !== undefined ? { meta: result.meta } : {}),
});
class DashboardController {
    async getAdminOverview(req, res, next) {
        try {
            const periodValue = req.query.period;
            const period = Array.isArray(periodValue) ? periodValue[0] : periodValue;
            const result = await dashboard_service_1.default.getAdminOverview({
                period: typeof period === "string" ? period : undefined,
            });
            sendResponse(res, result);
        }
        catch (error) {
            next(error);
        }
    }
}
const dashboardController = new DashboardController();
exports.default = dashboardController;
