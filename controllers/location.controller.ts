import type { NextFunction, Request, Response } from "express";

import locationService from "../services/location.service";

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

class LocationController {
  async createCountry(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await locationService.createCountry(req.body as { name?: string });
      sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async createRegion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await locationService.createRegion(toSingleParam(req.params.countryId), req.body as { name?: string });
      sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async updateCountry(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await locationService.updateCountry(
        toSingleParam(req.params.countryId),
        req.body as { name?: string },
      );
      sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async deleteCountry(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await locationService.deleteCountry(toSingleParam(req.params.countryId));
      sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async updateRegion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await locationService.updateRegion(
        toSingleParam(req.params.countryId),
        toSingleParam(req.params.regionId),
        req.body as { name?: string },
      );
      sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async deleteRegion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await locationService.deleteRegion(
        toSingleParam(req.params.countryId),
        toSingleParam(req.params.regionId),
      );
      sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getCountries(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await locationService.getCountries();
      sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getRegionsByCountryId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await locationService.getRegionsByCountryId(toSingleParam(req.params.countryId));
      sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getCountriesWithRegions(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await locationService.getCountriesWithRegions();
      sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  }
}

const locationController = new LocationController();

export default locationController;
