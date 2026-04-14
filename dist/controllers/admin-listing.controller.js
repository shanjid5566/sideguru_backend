"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const admin_listing_service_1 = __importDefault(require("../services/admin-listing.service"));
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
class AdminListingController {
    async getAllListings(req, res, next) {
        try {
            const result = await admin_listing_service_1.default.getAllListings({
                query: req.query,
                baseUrl: getBaseUrl(req),
            });
            sendResponse(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async getListingById(req, res, next) {
        try {
            const result = await admin_listing_service_1.default.getListingById({
                id: toSingleParam(req.params.id),
                baseUrl: getBaseUrl(req),
            });
            sendResponse(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async updateListingStatus(req, res, next) {
        try {
            const body = req.body;
            const result = await admin_listing_service_1.default.updateListingStatus({
                id: toSingleParam(req.params.id),
                status: body.status || "",
                baseUrl: getBaseUrl(req),
            });
            sendResponse(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async deleteListing(req, res, next) {
        try {
            const result = await admin_listing_service_1.default.deleteListing({
                id: toSingleParam(req.params.id),
            });
            sendResponse(res, result);
        }
        catch (error) {
            next(error);
        }
    }
}
const adminListingController = new AdminListingController();
exports.default = adminListingController;
