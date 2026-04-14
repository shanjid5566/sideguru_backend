import type { NextFunction, Request, Response } from "express";

import adminCategoryService from "../services/admin-category.service";

const getBaseUrl = (req: Request): string => {
  if (process.env.BACKEND_URL) {
    return process.env.BACKEND_URL.replace(/\/$/, "");
  }

  return `${req.protocol}://${req.get("host")}`;
};

const sendResponse = (
  res: Response,
  result: { statusCode: number; message: string; data?: unknown; meta?: unknown },
) => {
  return res.status(result.statusCode).json({
    success: true,
    message: result.message,
    ...(result.data !== undefined ? { data: result.data } : {}),
    ...(result.meta !== undefined ? { meta: result.meta } : {}),
  });
};

class AdminCategoryController {
  async updateServiceCategoryAndSubcategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { categoryId, categoryName, subcategoryId, subcategoryName } = req.body as {
        categoryId?: string;
        categoryName?: string | null;
        subcategoryId?: string;
        subcategoryName?: string | null;
      };

      const result = await adminCategoryService.updateServiceCategoryAndSubcategory({
        categoryId: categoryId || "",
        categoryName,
        subcategoryId,
        subcategoryName,
        baseUrl: getBaseUrl(req),
      });

      sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async updateEventCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { categoryId, categoryName } = req.body as {
        categoryId?: string;
        categoryName?: string | null;
      };

      const result = await adminCategoryService.updateEventCategory({
        categoryId: categoryId || "",
        categoryName,
        baseUrl: getBaseUrl(req),
      });

      sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  }
}

const adminCategoryController = new AdminCategoryController();

export default adminCategoryController;
