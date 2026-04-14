import { prisma as prismaClient } from "../lib/prisma";
import { STRIPE_CURRENCY, getStripePublishableKey } from "../config/stripe";
import { createHttpError } from "../utils/httpError";

const prisma: any = prismaClient;

const INTRODUCTORY_PERIOD_DAYS = 90;

type PricingPlanInput = {
  title?: string;
  price?: unknown;
  duration?: unknown;
  isActive?: unknown;
};

const getIntroductoryCutoffDate = (): Date => {
  const date = new Date();
  date.setDate(date.getDate() - INTRODUCTORY_PERIOD_DAYS);
  return date;
};

const decoratePlans = (plans: any[]): any[] => {
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
        stripePublishableKey: getStripePublishableKey(),
        stripeCurrency: STRIPE_CURRENCY,
      },
    };
  }

  async getPricingEligibility(userId: string) {
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
      throw createHttpError(404, "User not found");
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
        stripePublishableKey: getStripePublishableKey(),
        stripeCurrency: STRIPE_CURRENCY,
      },
    };
  }

  async getStripeConfig() {
    return {
      statusCode: 200,
      message: "Stripe configuration retrieved successfully",
      data: {
        publishableKey: getStripePublishableKey(),
        currency: STRIPE_CURRENCY,
      },
    };
  }

  async createPricingPlan({ title, price, duration, isActive = true }: PricingPlanInput) {
    if (!title || !title.trim() || price === undefined || duration === undefined) {
      throw createHttpError(400, "title, price, and duration are required");
    }

    const parsedPrice = Number(price);
    const parsedDuration = Number(duration);

    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      throw createHttpError(400, "price must be a valid positive number");
    }

    if (!Number.isInteger(parsedDuration) || parsedDuration <= 0) {
      throw createHttpError(400, "duration must be a positive integer in days");
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

  async updatePricingPlan(id: string, input: PricingPlanInput) {
    const existingPlan = await prisma.pricingPlan.findUnique({
      where: { id },
    });

    if (!existingPlan) {
      throw createHttpError(404, "Pricing plan not found");
    }

    const { title, price, duration, isActive } = input;
    const hasAnyField = title !== undefined || price !== undefined || duration !== undefined || isActive !== undefined;

    if (!hasAnyField) {
      throw createHttpError(400, "At least one field is required to update pricing plan");
    }

    const updateData: Record<string, unknown> = {};

    if (title !== undefined) {
      if (!title || !title.trim()) {
        throw createHttpError(400, "title must be a non-empty string");
      }

      updateData.title = title.trim();
    }

    if (price !== undefined) {
      const parsedPrice = Number(price);

      if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
        throw createHttpError(400, "price must be a valid positive number");
      }

      updateData.price = parsedPrice;
    }

    if (duration !== undefined) {
      const parsedDuration = Number(duration);

      if (!Number.isInteger(parsedDuration) || parsedDuration <= 0) {
        throw createHttpError(400, "duration must be a positive integer in days");
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

  async deletePricingPlan(id: string) {
    const existingPlan = await prisma.pricingPlan.findUnique({
      where: { id },
    });

    if (!existingPlan) {
      throw createHttpError(404, "Pricing plan not found");
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

export default pricingService;
