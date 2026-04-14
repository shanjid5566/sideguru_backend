"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStripePublishableKey = exports.getStripeClient = exports.STRIPE_CURRENCY = void 0;
const stripe_1 = __importDefault(require("stripe"));
exports.STRIPE_CURRENCY = (process.env.STRIPE_CURRENCY || "usd").toLowerCase();
let stripeClient = null;
const getStripeClient = () => {
    if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    if (!stripeClient) {
        stripeClient = new stripe_1.default(process.env.STRIPE_SECRET_KEY);
    }
    return stripeClient;
};
exports.getStripeClient = getStripeClient;
const getStripePublishableKey = () => process.env.STRIPE_PUBLISHABLE_KEY || "";
exports.getStripePublishableKey = getStripePublishableKey;
