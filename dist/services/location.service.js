"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../lib/prisma");
const httpError_1 = require("../utils/httpError");
const prisma = prisma_1.prisma;
class LocationService {
    async createCountry({ name }) {
        if (!name || !name.trim()) {
            throw (0, httpError_1.createHttpError)(400, "Country name is required");
        }
        const normalizedName = name.trim();
        const existingCountry = await prisma.country.findUnique({
            where: { name: normalizedName },
        });
        if (existingCountry) {
            throw (0, httpError_1.createHttpError)(409, "Country already exists");
        }
        const country = await prisma.country.create({
            data: {
                name: normalizedName,
            },
        });
        return {
            statusCode: 201,
            message: "Country created successfully",
            data: country,
        };
    }
    async createRegion(countryId, { name }) {
        if (!name || !name.trim()) {
            throw (0, httpError_1.createHttpError)(400, "Region name is required");
        }
        const country = await prisma.country.findUnique({
            where: { id: countryId },
        });
        if (!country) {
            throw (0, httpError_1.createHttpError)(404, "Country not found");
        }
        const normalizedName = name.trim();
        const existingRegion = await prisma.region.findFirst({
            where: {
                countryId,
                name: normalizedName,
            },
        });
        if (existingRegion) {
            throw (0, httpError_1.createHttpError)(409, "Region already exists in this country");
        }
        const region = await prisma.region.create({
            data: {
                name: normalizedName,
                countryId,
            },
        });
        return {
            statusCode: 201,
            message: "Region created successfully",
            data: region,
        };
    }
    async getCountries() {
        const countries = await prisma.country.findMany({
            orderBy: {
                name: "asc",
            },
        });
        return {
            statusCode: 200,
            message: "Countries retrieved successfully",
            data: countries,
        };
    }
    async getRegionsByCountryId(countryId) {
        const country = await prisma.country.findUnique({
            where: { id: countryId },
        });
        if (!country) {
            throw (0, httpError_1.createHttpError)(404, "Country not found");
        }
        const regions = await prisma.region.findMany({
            where: {
                countryId,
            },
            orderBy: {
                name: "asc",
            },
        });
        return {
            statusCode: 200,
            message: "Regions retrieved successfully",
            data: regions,
        };
    }
    async getCountriesWithRegions() {
        const countries = await prisma.country.findMany({
            include: {
                regions: {
                    orderBy: {
                        name: "asc",
                    },
                },
            },
            orderBy: {
                name: "asc",
            },
        });
        return {
            statusCode: 200,
            message: "Countries with regions retrieved successfully",
            data: countries,
        };
    }
}
const locationService = new LocationService();
exports.default = locationService;
