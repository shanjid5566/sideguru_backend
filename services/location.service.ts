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

  async updateCountry(countryId: string, { name }: { name?: string }) {
    if (!name || !name.trim()) {
      throw createHttpError(400, "Country name is required");
    }

    const country = await prisma.country.findUnique({
      where: { id: countryId },
    });

    if (!country) {
      throw createHttpError(404, "Country not found");
    }

    const normalizedName = name.trim();
    const existingCountry = await prisma.country.findFirst({
      where: {
        name: normalizedName,
        id: {
          not: countryId,
        },
      },
    });

    if (existingCountry) {
      throw createHttpError(409, "Country already exists");
    }

    const updatedCountry = await prisma.country.update({
      where: { id: countryId },
      data: {
        name: normalizedName,
      },
    });

    return {
      statusCode: 200,
      message: "Country updated successfully",
      data: updatedCountry,
    };
  }

  async deleteCountry(countryId: string) {
    const country = await prisma.country.findUnique({
      where: { id: countryId },
      select: {
        id: true,
        name: true,
      },
    });

    if (!country) {
      throw createHttpError(404, "Country not found");
    }

    const [listingCount, userCount] = await Promise.all([
      prisma.listing.count({
        where: {
          countryId,
          deletedAt: null,
        },
      }),
      prisma.user.count({
        where: {
          countryId,
          deletedAt: null,
        },
      }),
    ]);

    if (listingCount > 0 || userCount > 0) {
      throw createHttpError(409, "Cannot delete country while it is referenced by users or listings");
    }

    await prisma.country.delete({
      where: { id: countryId },
    });

    return {
      statusCode: 200,
      message: "Country deleted successfully",
      data: {
        id: country.id,
        name: country.name,
      },
    };
  }

  async updateRegion(countryId: string, regionId: string, { name }: { name?: string }) {
    if (!name || !name.trim()) {
      throw createHttpError(400, "Region name is required");
    }

    const country = await prisma.country.findUnique({
      where: { id: countryId },
      select: { id: true },
    });

    if (!country) {
      throw createHttpError(404, "Country not found");
    }

    const region = await prisma.region.findFirst({
      where: {
        id: regionId,
        countryId,
      },
    });

    if (!region) {
      throw createHttpError(404, "Region not found in this country");
    }

    const normalizedName = name.trim();
    const existingRegion = await prisma.region.findFirst({
      where: {
        countryId,
        name: normalizedName,
        id: {
          not: regionId,
        },
      },
    });

    if (existingRegion) {
      throw createHttpError(409, "Region already exists in this country");
    }

    const updatedRegion = await prisma.region.update({
      where: { id: regionId },
      data: {
        name: normalizedName,
      },
    });

    return {
      statusCode: 200,
      message: "Region updated successfully",
      data: updatedRegion,
    };
  }

  async deleteRegion(countryId: string, regionId: string) {
    const country = await prisma.country.findUnique({
      where: { id: countryId },
      select: { id: true },
    });

    if (!country) {
      throw createHttpError(404, "Country not found");
    }

    const region = await prisma.region.findFirst({
      where: {
        id: regionId,
        countryId,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!region) {
      throw createHttpError(404, "Region not found in this country");
    }

    const [listingCount, userCount] = await Promise.all([
      prisma.listing.count({
        where: {
          regionId,
          deletedAt: null,
        },
      }),
      prisma.user.count({
        where: {
          regionId,
          deletedAt: null,
        },
      }),
    ]);

    if (listingCount > 0 || userCount > 0) {
      throw createHttpError(409, "Cannot delete region while it is referenced by users or listings");
    }

    await prisma.region.delete({
      where: { id: regionId },
    });

    return {
      statusCode: 200,
      message: "Region deleted successfully",
      data: {
        id: region.id,
        name: region.name,
        countryId,
      },
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
