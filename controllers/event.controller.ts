import type { NextFunction, Request, Response } from "express";

import eventService from "../services/event.service";

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

class EventController {
  async createEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await eventService.createEvent({
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

  async getPublicEvents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await eventService.getPublicEvents({
        query: req.query as Record<string, unknown>,
        baseUrl: getBaseUrl(req),
      });
      sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getEventById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await eventService.getEventById({
        id: toSingleParam(req.params.id),
        baseUrl: getBaseUrl(req),
      });
      sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getMyEvents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await eventService.getMyEvents({
        userId: req.user?.userId || "",
        query: req.query as Record<string, unknown>,
        baseUrl: getBaseUrl(req),
      });
      sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async updateEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await eventService.updateEvent({
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

  async deleteMyEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await eventService.deleteMyEvent({
        id: toSingleParam(req.params.id),
        userId: req.user?.userId || "",
      });
      sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getAdminEvents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await eventService.getAdminEvents({
        query: req.query as Record<string, unknown>,
        baseUrl: getBaseUrl(req),
      });
      sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async updateEventStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = req.body as { status?: string };
      const result = await eventService.updateEventStatus({
        id: toSingleParam(req.params.id),
        status: body.status || "",
        baseUrl: getBaseUrl(req),
      });
      sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async createEventPaymentIntent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = req.body as { planId?: string; successUrl?: string; cancelUrl?: string };
      const result = await eventService.createEventPaymentIntent({
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

  async createEventRenewalCheckoutSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = req.body as { planId?: string; successUrl?: string; cancelUrl?: string };
      const result = await eventService.createEventRenewalCheckoutSession({
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

  async confirmEventListingPurchase(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = req.body as { planId?: string; checkoutSessionId?: string };
      const result = await eventService.confirmEventListingPurchase({
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

  async confirmEventRenewal(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = req.body as { planId?: string; checkoutSessionId?: string };
      const result = await eventService.confirmEventRenewal({
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

  async reportEventSpam(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await eventService.reportEventSpam({
        id: toSingleParam(req.params.id),
        baseUrl: getBaseUrl(req),
      });
      sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async deleteEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await eventService.deleteEvent({
        id: toSingleParam(req.params.id),
      });
      sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  }
}

const eventController = new EventController();

export default eventController;
