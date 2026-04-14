"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const admin_category_service_1 = __importDefault(require("../services/admin-category.service"));
const getBaseUrl = (req) => {
    if (process.env.BACKEND_URL) {
        return process.env.BACKEND_URL.replace(/\/$/, "");
    }
    return `${req.protocol}://${req.get("host")}`;
};
const sendResponse = (res, result) => {
    return res.status(result.statusCode).json({
        success: true,
        message: result.message,
        ...(result.data !== undefined ? { data: result.data } : {}),
        ...(result.meta !== undefined ? { meta: result.meta } : {}),
    });
};
class AdminCategoryController {
    async updateServiceCategoryAndSubcategory(req, res, next) {
        try {
            const { categoryId, categoryName, subcategoryId, subcategoryName } = req.body;
            const result = await admin_category_service_1.default.updateServiceCategoryAndSubcategory({
                categoryId: categoryId || "",
                categoryName,
                subcategoryId,
                subcategoryName,
                baseUrl: getBaseUrl(req),
            });
            sendResponse(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async updateEventCategory(req, res, next) {
        try {
            const { categoryId, categoryName } = req.body;
            const result = await admin_category_service_1.default.updateEventCategory({
                categoryId: categoryId || "",
                categoryName,
                baseUrl: getBaseUrl(req),
            });
            sendResponse(res, result);
        }
        catch (error) {
            next(error);
        }
    }
}
const adminCategoryController = new AdminCategoryController();
exports.default = adminCategoryController;
