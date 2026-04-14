import type { NextFunction, Request, Response } from "express";

import listingService from "../services/listing.service";

const getBaseUrl = (req: Request): string => {
  if (process.env.BACKEND_URL) {
    return process.env.BACKEND_URL.replace(/\/$/, "");
  }

  return `${req.protocol}://${req.get("host")}`;
};

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

class ListingController {
  async createService(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await listingService.createService({
        body: req.body as Record<string, unknown>,
        files: req.files,
        userId: req.user?.userId || "",
        baseUrl: getBaseUrl(req),
      });
      sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getPublicServices(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await listingService.getPublicServices({
        query: req.query as Record<string, unknown>,
        baseUrl: getBaseUrl(req),
      });
      sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getServiceById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await listingService.getServiceById({
        id: toSingleParam(req.params.id),
        baseUrl: getBaseUrl(req),
      });
      sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getMyServices(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await listingService.getMyServices({
        userId: req.user?.userId || "",
        query: req.query as Record<string, unknown>,
        baseUrl: getBaseUrl(req),
      });
      sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async updateService(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await listingService.updateService({
        id: toSingleParam(req.params.id),
        userId: req.user?.userId || "",
        body: req.body as Record<string, unknown>,
        files: req.files,
        baseUrl: getBaseUrl(req),
      });
      sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async deleteMyService(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await listingService.deleteMyService({
        id: toSingleParam(req.params.id),
        userId: req.user?.userId || "",
      });
      sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getAdminServices(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await listingService.getAdminServices({
        query: req.query as Record<string, unknown>,
        baseUrl: getBaseUrl(req),
      });
      sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async updateServiceStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = req.body as { status?: string };
      const result = await listingService.updateServiceStatus({
        id: toSingleParam(req.params.id),
        status: body.status || "",
        baseUrl: getBaseUrl(req),
      });
      sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async createServicePaymentIntent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = req.body as { planId?: string; successUrl?: string; cancelUrl?: string };
      const result = await listingService.createServicePaymentIntent({
        listingId: toSingleParam(req.params.id),
        userId: req.user?.userId || "",
        planId: body.planId || "",
        successUrl: body.successUrl || "",
        cancelUrl: body.cancelUrl || "",
        baseUrl: getBaseUrl(req),
      });
      sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async createServiceRenewalCheckoutSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = req.body as { planId?: string; successUrl?: string; cancelUrl?: string };
      const result = await listingService.createServiceRenewalCheckoutSession({
        listingId: toSingleParam(req.params.id),
        userId: req.user?.userId || "",
        planId: body.planId || "",
        successUrl: body.successUrl || "",
        cancelUrl: body.cancelUrl || "",
        baseUrl: getBaseUrl(req),
      });
      sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async confirmServiceListingPurchase(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = req.body as { planId?: string; checkoutSessionId?: string };
      const result = await listingService.confirmServiceListingPurchase({
        listingId: toSingleParam(req.params.id),
        userId: req.user?.userId || "",
        planId: body.planId || "",
        checkoutSessionId: body.checkoutSessionId || "",
        baseUrl: getBaseUrl(req),
      });
      sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async confirmServiceRenewal(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = req.body as { planId?: string; checkoutSessionId?: string };
      const result = await listingService.confirmServiceRenewal({
        listingId: toSingleParam(req.params.id),
        userId: req.user?.userId || "",
        planId: body.planId || "",
        checkoutSessionId: body.checkoutSessionId || "",
        baseUrl: getBaseUrl(req),
      });
      sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async reportServiceSpam(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await listingService.reportServiceSpam({
        id: toSingleParam(req.params.id),
        baseUrl: getBaseUrl(req),
      });
      sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async deleteService(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await listingService.deleteService({
        id: toSingleParam(req.params.id),
      });
      sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  }
}

const listingController = new ListingController();

export default listingController;
