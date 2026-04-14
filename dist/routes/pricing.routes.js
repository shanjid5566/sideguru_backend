"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pricing_controller_1 = __importDefault(require("../controllers/pricing.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.get("/", pricing_controller_1.default.getActivePricingPlans.bind(pricing_controller_1.default));
router.get("/stripe-config", pricing_controller_1.default.getStripeConfig.bind(pricing_controller_1.default));
router.get("/eligibility", auth_middleware_1.authenticate, pricing_controller_1.default.getPricingEligibility.bind(pricing_controller_1.default));
router.post("/", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"), pricing_controller_1.default.createPricingPlan.bind(pricing_controller_1.default));
router.patch("/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"), pricing_controller_1.default.updatePricingPlan.bind(pricing_controller_1.default));
router.delete("/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"), pricing_controller_1.default.deletePricingPlan.bind(pricing_controller_1.default));
exports.default = router;
