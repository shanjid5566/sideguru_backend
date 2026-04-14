import type { NextFunction, Request, Response } from "express";

import adminUserService from "../services/admin-user.service";

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

class AdminUserController {
  async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await adminUserService.getUsers({
        query: req.query as Record<string, unknown>,
        baseUrl: getBaseUrl(req),
      });

      sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await adminUserService.getUserById({
        id: toSingleParam(req.params.id),
        baseUrl: getBaseUrl(req),
      });

      sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await adminUserService.updateUser({
        id: toSingleParam(req.params.id),
        body: req.body as Record<string, unknown>,
        baseUrl: getBaseUrl(req),
      });

      sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const adminUserId = req.user?.userId;

      if (!adminUserId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }

      const result = await adminUserService.deleteUser({
        id: toSingleParam(req.params.id),
        adminUserId,
      });

      sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  }
}

const adminUserController = new AdminUserController();

export default adminUserController;
