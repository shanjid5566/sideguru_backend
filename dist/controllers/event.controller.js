"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const event_service_1 = __importDefault(require("../services/event.service"));
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
class EventController {
    async createEvent(req, res, next) {
        try {
            const result = await event_service_1.default.createEvent({
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
    async getPublicEvents(req, res, next) {
        try {
            const result = await event_service_1.default.getPublicEvents({
                query: req.query,
                baseUrl: getBaseUrl(req),
            });
            sendResponse(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async getEventById(req, res, next) {
        try {
            const result = await event_service_1.default.getEventById({
                id: toSingleParam(req.params.id),
                baseUrl: getBaseUrl(req),
            });
            sendResponse(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async getMyEvents(req, res, next) {
        try {
            const result = await event_service_1.default.getMyEvents({
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
    async updateEvent(req, res, next) {
        try {
            const result = await event_service_1.default.updateEvent({
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
    async deleteMyEvent(req, res, next) {
        try {
            const result = await event_service_1.default.deleteMyEvent({
                id: toSingleParam(req.params.id),
                userId: req.user?.userId || "",
            });
            sendResponse(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async getAdminEvents(req, res, next) {
        try {
            const result = await event_service_1.default.getAdminEvents({
                query: req.query,
                baseUrl: getBaseUrl(req),
            });
            sendResponse(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async updateEventStatus(req, res, next) {
        try {
            const body = req.body;
            const result = await event_service_1.default.updateEventStatus({
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
    async createEventPaymentIntent(req, res, next) {
        try {
            const body = req.body;
            const result = await event_service_1.default.createEventPaymentIntent({
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
    async createEventRenewalCheckoutSession(req, res, next) {
        try {
            const body = req.body;
            const result = await event_service_1.default.createEventRenewalCheckoutSession({
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
    async confirmEventListingPurchase(req, res, next) {
        try {
            const body = req.body;
            const result = await event_service_1.default.confirmEventListingPurchase({
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
    async confirmEventRenewal(req, res, next) {
        try {
            const body = req.body;
            const result = await event_service_1.default.confirmEventRenewal({
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
    async reportEventSpam(req, res, next) {
        try {
            const result = await event_service_1.default.reportEventSpam({
                id: toSingleParam(req.params.id),
                baseUrl: getBaseUrl(req),
            });
            sendResponse(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async deleteEvent(req, res, next) {
        try {
            const result = await event_service_1.default.deleteEvent({
                id: toSingleParam(req.params.id),
            });
            sendResponse(res, result);
        }
        catch (error) {
            next(error);
        }
    }
}
const eventController = new EventController();
exports.default = eventController;
