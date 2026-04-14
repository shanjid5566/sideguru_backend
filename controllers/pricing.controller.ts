import type { NextFunction, Request, Response } from "express";

import pricingService from "../services/pricing.service";

const sendResponse = (
  res: Response,
  result: { statusCode: number; message: string; data?: unknown; meta?: unknown },
): Response =>
  res.status(result.statusCode).json({
    success: true,
    message: result.message,
    ...(result.data !== undefined ? { data: result.data } : {}),
    ...(result.meta !== undefined ? { meta: result.meta } : {}),
  });

const toSingleParam = (value: string | string[] | undefined): string => {
  if (Array.isArray(value)) {
    return value[0] || "";
  }

  return value || "";
};

class PricingController {
  async getActivePricingPlans(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await pricingService.getActivePricingPlans();
      sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getPricingEligibility(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await pricingService.getPricingEligibility(req.user?.userId || "");
      sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getStripeConfig(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await pricingService.getStripeConfig();
      sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async createPricingPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await pricingService.createPricingPlan(req.body as { title?: string; price?: unknown; duration?: unknown; isActive?: unknown });
      sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async updatePricingPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await pricingService.updatePricingPlan(
        toSingleParam(req.params.id),
        req.body as { title?: string; price?: unknown; duration?: unknown; isActive?: unknown },
      );
      sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async deletePricingPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await pricingService.deletePricingPlan(toSingleParam(req.params.id));
      sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  }
}

const pricingController = new PricingController();

export default pricingController;
