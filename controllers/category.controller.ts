import type { NextFunction, Request, Response } from "express";

import categoryService from "../services/category.service";

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

class CategoryController {
  async createEventCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await categoryService.createEventCategory({
        body: req.body as { name?: string },
        file: req.file,
        baseUrl: getBaseUrl(req),
      });
      sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async createServiceCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await categoryService.createServiceCategory({
        body: req.body as { name?: string },
        file: req.file,
        baseUrl: getBaseUrl(req),
      });
      sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = req.body as { name?: string; image?: string; type?: "SERVICE" | "EVENT" };
      const result = await categoryService.createCategory({
        ...body,
        baseUrl: getBaseUrl(req),
      });
      sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async createSubCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await categoryService.createSubCategory(toSingleParam(req.params.id), req.body as { name?: string });
      sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getAllCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await categoryService.getAllCategories({ baseUrl: getBaseUrl(req) });
      sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getCategoryById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await categoryService.getCategoryById(toSingleParam(req.params.id), { baseUrl: getBaseUrl(req) });
      sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getServiceCategoryById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await categoryService.getCategoryByIdAndType(toSingleParam(req.params.id), "SERVICE", {
        baseUrl: getBaseUrl(req),
      });
      sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getEventCategoryById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await categoryService.getCategoryByIdAndType(toSingleParam(req.params.id), "EVENT", {
        baseUrl: getBaseUrl(req),
      });
      sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getAllCategoriesWithSubcategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await categoryService.getAllCategoriesWithSubcategories({ baseUrl: getBaseUrl(req) });
      sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getServiceCategoriesWithSubcategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await categoryService.getServiceCategoriesWithSubcategories({ baseUrl: getBaseUrl(req) });
      sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getCategoriesByType(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const type = toSingleParam(req.params.type) as "SERVICE" | "EVENT";
      const result = await categoryService.getCategoriesByType(type, { baseUrl: getBaseUrl(req) });
      sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getSubcategoriesByCategoryId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await categoryService.getSubcategoriesByCategoryId(toSingleParam(req.params.id));
      sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getServiceSubcategoriesByCategoryId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await categoryService.getServiceSubcategoriesByCategoryId(toSingleParam(req.params.id));
      sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getServiceSubcategoriesWithCategory(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await categoryService.getServiceSubcategoriesWithCategory();
      sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async searchCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const queryValue = req.query.q;
      const q = Array.isArray(queryValue) ? queryValue[0] : queryValue;
      const result = await categoryService.searchCategories(typeof q === "string" ? q : "", {
        baseUrl: getBaseUrl(req),
      });
      sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getEventCategoriesSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await categoryService.getEventCategoriesSummary({ baseUrl: getBaseUrl(req) });
      sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async updateEventCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await categoryService.updateEventCategory(toSingleParam(req.params.id), {
        body: req.body as { name?: string },
        file: req.file,
        baseUrl: getBaseUrl(req),
      });
      sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async deleteEventCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await categoryService.deleteEventCategory(toSingleParam(req.params.id));
      sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getServiceCategoriesSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await categoryService.getServiceCategoriesSummary({ baseUrl: getBaseUrl(req) });
      sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async updateServiceCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await categoryService.updateServiceCategory(toSingleParam(req.params.id), {
        body: req.body as { name?: string },
        file: req.file,
        baseUrl: getBaseUrl(req),
      });
      sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async deleteServiceCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await categoryService.deleteServiceCategory(toSingleParam(req.params.id));
      sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  }
}

const categoryController = new CategoryController();

export default categoryController;
