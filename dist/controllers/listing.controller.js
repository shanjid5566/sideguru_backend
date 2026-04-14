"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const listing_service_1 = __importDefault(require("../services/listing.service"));
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
class ListingController {
    async createService(req, res, next) {
        try {
            const result = await listing_service_1.default.createService({
                body: req.body,
                files: req.files,
                userId: req.user?.userId || "",
                baseUrl: getBaseUrl(req),
            });
            sendResponse(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async getPublicServices(req, res, next) {
        try {
            const result = await listing_service_1.default.getPublicServices({
                query: req.query,
                baseUrl: getBaseUrl(req),
            });
            sendResponse(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async getServiceById(req, res, next) {
        try {
            const result = await listing_service_1.default.getServiceById({
                id: toSingleParam(req.params.id),
                baseUrl: getBaseUrl(req),
            });
            sendResponse(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async getMyServices(req, res, next) {
        try {
            const result = await listing_service_1.default.getMyServices({
                userId: req.user?.userId || "",
                query: req.query,
                baseUrl: getBaseUrl(req),
            });
            sendResponse(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async updateService(req, res, next) {
        try {
            const result = await listing_service_1.default.updateService({
                id: toSingleParam(req.params.id),
                userId: req.user?.userId || "",
                body: req.body,
                files: req.files,
                baseUrl: getBaseUrl(req),
            });
            sendResponse(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async deleteMyService(req, res, next) {
        try {
            const result = await listing_service_1.default.deleteMyService({
                id: toSingleParam(req.params.id),
                userId: req.user?.userId || "",
            });
            sendResponse(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async getAdminServices(req, res, next) {
        try {
            const result = await listing_service_1.default.getAdminServices({
                query: req.query,
                baseUrl: getBaseUrl(req),
            });
            sendResponse(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async updateServiceStatus(req, res, next) {
        try {
            const body = req.body;
            const result = await listing_service_1.default.updateServiceStatus({
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
    async createServicePaymentIntent(req, res, next) {
        try {
            const body = req.body;
            const result = await listing_service_1.default.createServicePaymentIntent({
                listingId: toSingleParam(req.params.id),
                userId: req.user?.userId || "",
                planId: body.planId || "",
                successUrl: body.successUrl || "",
                cancelUrl: body.cancelUrl || "",
                baseUrl: getBaseUrl(req),
            });
            sendResponse(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async createServiceRenewalCheckoutSession(req, res, next) {
        try {
            const body = req.body;
            const result = await listing_service_1.default.createServiceRenewalCheckoutSession({
                listingId: toSingleParam(req.params.id),
                userId: req.user?.userId || "",
                planId: body.planId || "",
                successUrl: body.successUrl || "",
                cancelUrl: body.cancelUrl || "",
                baseUrl: getBaseUrl(req),
            });
            sendResponse(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async confirmServiceListingPurchase(req, res, next) {
        try {
            const body = req.body;
            const result = await listing_service_1.default.confirmServiceListingPurchase({
                listingId: toSingleParam(req.params.id),
                userId: req.user?.userId || "",
                planId: body.planId || "",
                checkoutSessionId: body.checkoutSessionId || "",
                baseUrl: getBaseUrl(req),
            });
            sendResponse(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async confirmServiceRenewal(req, res, next) {
        try {
            const body = req.body;
            const result = await listing_service_1.default.confirmServiceRenewal({
                listingId: toSingleParam(req.params.id),
                userId: req.user?.userId || "",
                planId: body.planId || "",
                checkoutSessionId: body.checkoutSessionId || "",
                baseUrl: getBaseUrl(req),
            });
            sendResponse(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async reportServiceSpam(req, res, next) {
        try {
            const result = await listing_service_1.default.reportServiceSpam({
                id: toSingleParam(req.params.id),
                baseUrl: getBaseUrl(req),
            });
            sendResponse(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async deleteService(req, res, next) {
        try {
            const result = await listing_service_1.default.deleteService({
                id: toSingleParam(req.params.id),
            });
            sendResponse(res, result);
        }
        catch (error) {
            next(error);
        }
    }
}
const listingController = new ListingController();
exports.default = listingController;
