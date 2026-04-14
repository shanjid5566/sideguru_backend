import type { NextFunction, Request, Response } from "express";

import adminRevenueService from "../services/admin-revenue.service";

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

const getSingleQueryParam = (value: unknown): string | undefined => {
  if (Array.isArray(value)) {
    return typeof value[0] === "string" ? value[0] : undefined;
  }

  return typeof value === "string" ? value : undefined;
};

class AdminRevenueController {
  async getRevenueToday(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await adminRevenueService.getRevenueToday();
      sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getRevenueThisMonth(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await adminRevenueService.getRevenueThisMonth();
      sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getTotalRevenue(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await adminRevenueService.getTotalRevenue();
      sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getSalesPerformance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const yearQuery = getSingleQueryParam(req.query.year);
      const parsedYear = yearQuery ? Number.parseInt(yearQuery, 10) : Number.NaN;

      const result = await adminRevenueService.getSalesPerformance({
        year: Number.isNaN(parsedYear) ? new Date().getFullYear() : parsedYear,
      });
      sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getRevenueStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await adminRevenueService.getRevenueStats();
      sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  }
}

const adminRevenueController = new AdminRevenueController();

export default adminRevenueController;
