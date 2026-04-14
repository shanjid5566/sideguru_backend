import type { NextFunction, Request, Response } from "express";

import dashboardService from "../services/dashboard.service";

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

class DashboardController {
  async getAdminOverview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const periodValue = req.query.period;
      const period = Array.isArray(periodValue) ? periodValue[0] : periodValue;

      const result = await dashboardService.getAdminOverview({
        period: typeof period === "string" ? period : undefined,
      });

      sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  }
}

const dashboardController = new DashboardController();

export default dashboardController;
