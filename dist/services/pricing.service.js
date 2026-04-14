"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../lib/prisma");
const stripe_1 = require("../config/stripe");
const httpError_1 = require("../utils/httpError");
const prisma = prisma_1.prisma;
const INTRODUCTORY_PERIOD_DAYS = 90;
const getIntroductoryCutoffDate = () => {
    const date = new Date();
    date.setDate(date.getDate() - INTRODUCTORY_PERIOD_DAYS);
    return date;
};
const decoratePlans = (plans) => {
    if (!plans.length) {
        return [];
    }
    const minimumPrice = Math.min(...plans.map((plan) => plan.price));
    return plans.map((plan) => ({
        ...plan,
        isIntroductory: plan.price === minimumPrice,
    }));
};
class PricingService {
    async getActivePricingPlans() {
        const plans = await prisma.pricingPlan.findMany({
            where: {
                isActive: true,
            },
            orderBy: [
                { price: "asc" },
                { title: "asc" },
            ],
        });
        const decoratedPlans = decoratePlans(plans);
        return {
            statusCode: 200,
            message: "Pricing plans retrieved successfully",
            data: decoratedPlans,
            meta: {
                introductoryPlanId: decoratedPlans.find((plan) => plan.isIntroductory)?.id || null,
                stripePublishableKey: (0, stripe_1.getStripePublishableKey)(),
                stripeCurrency: stripe_1.STRIPE_CURRENCY,
            },
        };
    }
    async getPricingEligibility(userId) {
        const [user, plans] = await Promise.all([
            prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    createdAt: true,
                },
            }),
            prisma.pricingPlan.findMany({
                where: {
                    isActive: true,
                },
                orderBy: [
                    { price: "asc" },
                    { title: "asc" },
                ],
            }),
        ]);
        if (!user) {
            throw (0, httpError_1.createHttpError)(404, "User not found");
        }
        const decoratedPlans = decoratePlans(plans);
        const introductoryPlan = decoratedPlans.find((plan) => plan.isIntroductory) || null;
        const isUnderFirstThreeMonths = user.createdAt >= getIntroductoryCutoffDate();
        return {
            statusCode: 200,
            message: "Pricing eligibility retrieved successfully",
            data: {
                isUnderFirstThreeMonths,
                introductoryPlanId: introductoryPlan?.id || null,
                introductoryPlan,
                plans: decoratedPlans,
                stripePublishableKey: (0, stripe_1.getStripePublishableKey)(),
                stripeCurrency: stripe_1.STRIPE_CURRENCY,
            },
        };
    }
    async getStripeConfig() {
        return {
            statusCode: 200,
            message: "Stripe configuration retrieved successfully",
            data: {
                publishableKey: (0, stripe_1.getStripePublishableKey)(),
                currency: stripe_1.STRIPE_CURRENCY,
            },
        };
    }
    async createPricingPlan({ title, price, duration, isActive = true }) {
        if (!title || !title.trim() || price === undefined || duration === undefined) {
            throw (0, httpError_1.createHttpError)(400, "title, price, and duration are required");
        }
        const parsedPrice = Number(price);
        const parsedDuration = Number(duration);
        if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
            throw (0, httpError_1.createHttpError)(400, "price must be a valid positive number");
        }
        if (!Number.isInteger(parsedDuration) || parsedDuration <= 0) {
            throw (0, httpError_1.createHttpError)(400, "duration must be a positive integer in days");
        }
        const plan = await prisma.pricingPlan.create({
            data: {
                title: title.trim(),
                price: parsedPrice,
                duration: parsedDuration,
                isActive: Boolean(isActive),
            },
        });
        const activePlans = await prisma.pricingPlan.findMany({
            where: {
                isActive: true,
            },
            orderBy: {
                price: "asc",
            },
        });
        const minimumPrice = activePlans[0]?.price ?? null;
        return {
            statusCode: 201,
            message: "Pricing plan created successfully",
            data: {
                ...plan,
                isIntroductory: plan.isActive && plan.price === minimumPrice,
            },
        };
    }
    async updatePricingPlan(id, input) {
        const existingPlan = await prisma.pricingPlan.findUnique({
            where: { id },
        });
        if (!existingPlan) {
            throw (0, httpError_1.createHttpError)(404, "Pricing plan not found");
        }
        const { title, price, duration, isActive } = input;
        const hasAnyField = title !== undefined || price !== undefined || duration !== undefined || isActive !== undefined;
        if (!hasAnyField) {
            throw (0, httpError_1.createHttpError)(400, "At least one field is required to update pricing plan");
        }
        const updateData = {};
        if (title !== undefined) {
            if (!title || !title.trim()) {
                throw (0, httpError_1.createHttpError)(400, "title must be a non-empty string");
            }
            updateData.title = title.trim();
        }
        if (price !== undefined) {
            const parsedPrice = Number(price);
            if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
                throw (0, httpError_1.createHttpError)(400, "price must be a valid positive number");
            }
            updateData.price = parsedPrice;
        }
        if (duration !== undefined) {
            const parsedDuration = Number(duration);
            if (!Number.isInteger(parsedDuration) || parsedDuration <= 0) {
                throw (0, httpError_1.createHttpError)(400, "duration must be a positive integer in days");
            }
            updateData.duration = parsedDuration;
        }
        if (isActive !== undefined) {
            updateData.isActive = Boolean(isActive);
        }
        const updatedPlan = await prisma.pricingPlan.update({
            where: { id },
            data: updateData,
        });
        const activePlans = await prisma.pricingPlan.findMany({
            where: {
                isActive: true,
            },
            orderBy: {
                price: "asc",
            },
        });
        const minimumPrice = activePlans[0]?.price ?? null;
        return {
            statusCode: 200,
            message: "Pricing plan updated successfully",
            data: {
                ...updatedPlan,
                isIntroductory: updatedPlan.isActive && updatedPlan.price === minimumPrice,
            },
        };
    }
    async deletePricingPlan(id) {
        const existingPlan = await prisma.pricingPlan.findUnique({
            where: { id },
        });
        if (!existingPlan) {
            throw (0, httpError_1.createHttpError)(404, "Pricing plan not found");
        }
        await prisma.pricingPlan.delete({
            where: { id },
        });
        return {
            statusCode: 200,
            message: "Pricing plan deleted successfully",
        };
    }
}
const pricingService = new PricingService();
exports.default = pricingService;
