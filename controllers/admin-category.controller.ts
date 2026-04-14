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

const toSingleParam = (value: string | string[] | undefined): string => {
  if (Array.isArray(value)) {
    return value[0] || "";
  }

  return value || "";
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

  async deleteServiceCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await adminCategoryService.deleteServiceCategory(toSingleParam(req.params.categoryId));
      sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async deleteServiceSubcategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await adminCategoryService.deleteServiceSubcategory(
        toSingleParam(req.params.categoryId),
        toSingleParam(req.params.subcategoryId),
      );
      sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async deleteEventCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await adminCategoryService.deleteEventCategory(toSingleParam(req.params.categoryId));
      sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  }
}

const adminCategoryController = new AdminCategoryController();

export default adminCategoryController;
