import { prisma as prismaClient } from "../lib/prisma";
import { createHttpError } from "../utils/httpError";

const prisma: any = prismaClient;

class LocationService {
  async createCountry({ name }: { name?: string }) {
    if (!name || !name.trim()) {
      throw createHttpError(400, "Country name is required");
    }

    const normalizedName = name.trim();
    const existingCountry = await prisma.country.findUnique({
      where: { name: normalizedName },
    });

    if (existingCountry) {
      throw createHttpError(409, "Country already exists");
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

  async createRegion(countryId: string, { name }: { name?: string }) {
    if (!name || !name.trim()) {
      throw createHttpError(400, "Region name is required");
    }

    const country = await prisma.country.findUnique({
      where: { id: countryId },
    });

    if (!country) {
      throw createHttpError(404, "Country not found");
    }

    const normalizedName = name.trim();
    const existingRegion = await prisma.region.findFirst({
      where: {
        countryId,
        name: normalizedName,
      },
    });

    if (existingRegion) {
      throw createHttpError(409, "Region already exists in this country");
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

  async getRegionsByCountryId(countryId: string) {
    const country = await prisma.country.findUnique({
      where: { id: countryId },
    });

    if (!country) {
      throw createHttpError(404, "Country not found");
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

export default locationService;
