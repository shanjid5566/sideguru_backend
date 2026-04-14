"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const admin_user_service_1 = __importDefault(require("../services/admin-user.service"));
const getBaseUrl = (req) => {
    if (process.env.BACKEND_URL) {
        return process.env.BACKEND_URL.replace(/\/$/, "");
    }
    return `${req.protocol}://${req.get("host")}`;
};
const sendResponse = (res, result) => res.status(result.statusCode).json({
    success: true,
    message: result.message,
    ...(result.data !== undefined ? { data: result.data } : {}),
    ...(result.meta !== undefined ? { meta: result.meta } : {}),
});
const toSingleParam = (value) => {
    if (Array.isArray(value)) {
        return value[0] || "";
    }
    return value || "";
};
class AdminUserController {
    async getUsers(req, res, next) {
        try {
            const result = await admin_user_service_1.default.getUsers({
                query: req.query,
                baseUrl: getBaseUrl(req),
            });
            sendResponse(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async getUserById(req, res, next) {
        try {
            const result = await admin_user_service_1.default.getUserById({
                id: toSingleParam(req.params.id),
                baseUrl: getBaseUrl(req),
            });
            sendResponse(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async updateUser(req, res, next) {
        try {
            const result = await admin_user_service_1.default.updateUser({
                id: toSingleParam(req.params.id),
                body: req.body,
                baseUrl: getBaseUrl(req),
            });
            sendResponse(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async deleteUser(req, res, next) {
        try {
            const adminUserId = req.user?.userId;
            if (!adminUserId) {
                res.status(401).json({ success: false, message: "Unauthorized" });
                return;
            }
            const result = await admin_user_service_1.default.deleteUser({
                id: toSingleParam(req.params.id),
                adminUserId,
            });
            sendResponse(res, result);
        }
        catch (error) {
            next(error);
        }
    }
}
const adminUserController = new AdminUserController();
exports.default = adminUserController;
