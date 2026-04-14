"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pricing_service_1 = __importDefault(require("../services/pricing.service"));
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
class PricingController {
    async getActivePricingPlans(_req, res, next) {
        try {
            const result = await pricing_service_1.default.getActivePricingPlans();
            sendResponse(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async getPricingEligibility(req, res, next) {
        try {
            const result = await pricing_service_1.default.getPricingEligibility(req.user?.userId || "");
            sendResponse(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async getStripeConfig(_req, res, next) {
        try {
            const result = await pricing_service_1.default.getStripeConfig();
            sendResponse(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async createPricingPlan(req, res, next) {
        try {
            const result = await pricing_service_1.default.createPricingPlan(req.body);
            sendResponse(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async updatePricingPlan(req, res, next) {
        try {
            const result = await pricing_service_1.default.updatePricingPlan(toSingleParam(req.params.id), req.body);
            sendResponse(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async deletePricingPlan(req, res, next) {
        try {
            const result = await pricing_service_1.default.deletePricingPlan(toSingleParam(req.params.id));
            sendResponse(res, result);
        }
        catch (error) {
            next(error);
        }
    }
}
const pricingController = new PricingController();
exports.default = pricingController;
