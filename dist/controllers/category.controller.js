"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const category_service_1 = __importDefault(require("../services/category.service"));
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
class CategoryController {
    async createEventCategory(req, res, next) {
        try {
            const result = await category_service_1.default.createEventCategory({
                body: req.body,
                file: req.file,
                baseUrl: getBaseUrl(req),
            });
            sendResponse(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async createServiceCategory(req, res, next) {
        try {
            const result = await category_service_1.default.createServiceCategory({
                body: req.body,
                file: req.file,
                baseUrl: getBaseUrl(req),
            });
            sendResponse(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async createCategory(req, res, next) {
        try {
            const body = req.body;
            const result = await category_service_1.default.createCategory({
                ...body,
                baseUrl: getBaseUrl(req),
            });
            sendResponse(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async createSubCategory(req, res, next) {
        try {
            const result = await category_service_1.default.createSubCategory(toSingleParam(req.params.id), req.body);
            sendResponse(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async getAllCategories(req, res, next) {
        try {
            const result = await category_service_1.default.getAllCategories({ baseUrl: getBaseUrl(req) });
            sendResponse(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async getCategoryById(req, res, next) {
        try {
            const result = await category_service_1.default.getCategoryById(toSingleParam(req.params.id), { baseUrl: getBaseUrl(req) });
            sendResponse(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async getServiceCategoryById(req, res, next) {
        try {
            const result = await category_service_1.default.getCategoryByIdAndType(toSingleParam(req.params.id), "SERVICE", {
                baseUrl: getBaseUrl(req),
            });
            sendResponse(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async getEventCategoryById(req, res, next) {
        try {
            const result = await category_service_1.default.getCategoryByIdAndType(toSingleParam(req.params.id), "EVENT", {
                baseUrl: getBaseUrl(req),
            });
            sendResponse(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async getAllCategoriesWithSubcategories(req, res, next) {
        try {
            const result = await category_service_1.default.getAllCategoriesWithSubcategories({ baseUrl: getBaseUrl(req) });
            sendResponse(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async getServiceCategoriesWithSubcategories(req, res, next) {
        try {
            const result = await category_service_1.default.getServiceCategoriesWithSubcategories({ baseUrl: getBaseUrl(req) });
            sendResponse(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async getCategoriesByType(req, res, next) {
        try {
            const type = toSingleParam(req.params.type);
            const result = await category_service_1.default.getCategoriesByType(type, { baseUrl: getBaseUrl(req) });
            sendResponse(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async getSubcategoriesByCategoryId(req, res, next) {
        try {
            const result = await category_service_1.default.getSubcategoriesByCategoryId(toSingleParam(req.params.id));
            sendResponse(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async getServiceSubcategoriesByCategoryId(req, res, next) {
        try {
            const result = await category_service_1.default.getServiceSubcategoriesByCategoryId(toSingleParam(req.params.id));
            sendResponse(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async getServiceSubcategoriesWithCategory(_req, res, next) {
        try {
            const result = await category_service_1.default.getServiceSubcategoriesWithCategory();
            sendResponse(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async searchCategories(req, res, next) {
        try {
            const queryValue = req.query.q;
            const q = Array.isArray(queryValue) ? queryValue[0] : queryValue;
            const result = await category_service_1.default.searchCategories(typeof q === "string" ? q : "", {
                baseUrl: getBaseUrl(req),
            });
            sendResponse(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async getEventCategoriesSummary(req, res, next) {
        try {
            const result = await category_service_1.default.getEventCategoriesSummary({ baseUrl: getBaseUrl(req) });
            sendResponse(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async updateEventCategory(req, res, next) {
        try {
            const result = await category_service_1.default.updateEventCategory(toSingleParam(req.params.id), {
                body: req.body,
                file: req.file,
                baseUrl: getBaseUrl(req),
            });
            sendResponse(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async deleteEventCategory(req, res, next) {
        try {
            const result = await category_service_1.default.deleteEventCategory(toSingleParam(req.params.id));
            sendResponse(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async getServiceCategoriesSummary(req, res, next) {
        try {
            const result = await category_service_1.default.getServiceCategoriesSummary({ baseUrl: getBaseUrl(req) });
            sendResponse(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async updateServiceCategory(req, res, next) {
        try {
            const result = await category_service_1.default.updateServiceCategory(toSingleParam(req.params.id), {
                body: req.body,
                file: req.file,
                baseUrl: getBaseUrl(req),
            });
            sendResponse(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async deleteServiceCategory(req, res, next) {
        try {
            const result = await category_service_1.default.deleteServiceCategory(toSingleParam(req.params.id));
            sendResponse(res, result);
        }
        catch (error) {
            next(error);
        }
    }
}
const categoryController = new CategoryController();
exports.default = categoryController;
