import type { NextFunction, Request, Response } from "express";

import adminListingService from "../services/admin-listing.service";

const getBaseUrl = (req: Request): string => {
  if (process.env.BACKEND_URL) {
    return process.env.BACKEND_URL.replace(/\/$/, "");
  }

  return `${req.protocol}://${req.get("host")}`;
};

const sendResponse = (
  res: Response,
  result: { statusCode: number; message: string; data?: unknown; meta?: unknown },
) =>
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

class AdminListingController {
  async getAllListings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await adminListingService.getAllListings({
        query: req.query as Record<string, unknown>,
        baseUrl: getBaseUrl(req),
      });
      sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getListingById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await adminListingService.getListingById({
        id: toSingleParam(req.params.id),
        baseUrl: getBaseUrl(req),
      });
      sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async updateListingStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = req.body as { status?: string };
      const result = await adminListingService.updateListingStatus({
        id: toSingleParam(req.params.id),
        status: body.status || "",
        baseUrl: getBaseUrl(req),
      });
      sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async deleteListing(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await adminListingService.deleteListing({
        id: toSingleParam(req.params.id),
      });
      sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  }
}

const adminListingController = new AdminListingController();

export default adminListingController;
