"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const location_service_1 = __importDefault(require("../services/location.service"));
const sendResponse = (res, result) => res.status(result.statusCode).json({
    success: true,
    message: result.message,
    ...(result.data !== undefined ? { data: result.data } : {}),
    ...(result.meta !== undefined ? { meta: result.meta } : {}),
});
const toSingleParam = (value) => {
    if (Array.isArray(value)) {
        return value[0] || "";
    }
    return value || "";
};
class LocationController {
    async createCountry(req, res, next) {
        try {
            const result = await location_service_1.default.createCountry(req.body);
            sendResponse(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async createRegion(req, res, next) {
        try {
            const result = await location_service_1.default.createRegion(toSingleParam(req.params.countryId), req.body);
            sendResponse(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async getCountries(_req, res, next) {
        try {
            const result = await location_service_1.default.getCountries();
            sendResponse(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async getRegionsByCountryId(req, res, next) {
        try {
            const result = await location_service_1.default.getRegionsByCountryId(toSingleParam(req.params.countryId));
            sendResponse(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async getCountriesWithRegions(_req, res, next) {
        try {
            const result = await location_service_1.default.getCountriesWithRegions();
            sendResponse(res, result);
        }
        catch (error) {
            next(error);
        }
    }
}
const locationController = new LocationController();
exports.default = locationController;
