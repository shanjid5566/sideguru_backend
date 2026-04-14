import { prisma as prismaClient } from "../lib/prisma";
import { createHttpError } from "../utils/httpError";

const prisma: any = prismaClient;

const ABSOLUTE_URL_PATTERN = /^https?:\/\//i;
const USER_SORTABLE_FIELDS = ["createdAt", "fullName", "email"] as const;
const USER_ROLES = ["USER", "ADMIN"] as const;

type QueryInput = Record<string, unknown>;

type UpdateUserBody = {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  countryId?: string;
  regionId?: string;
  role?: string;
  isEmailVerified?: boolean;
};

const toAbsoluteMediaUrl = (baseUrl: string, mediaPath: string | null): string | null => {
  if (!mediaPath) {
    return mediaPath;
  }

  if (ABSOLUTE_URL_PATTERN.test(mediaPath)) {
    return mediaPath;
  }

  const normalizedPath = mediaPath.startsWith("/") ? mediaPath : `/${mediaPath}`;
  return `${baseUrl}${normalizedPath}`;
};

const serializeUser = (baseUrl: string, user: any, activeListingsCount = 0) => ({
  ...user,
  profileImage: toAbsoluteMediaUrl(baseUrl, user.profileImage ?? null),
  countryName: user.country?.name || null,
  regionName: user.region?.name || null,
  locationName: user.region?.name || null,
  activeListingsCount,
});

const buildUserSelect = () => ({
  id: true,
  fullName: true,
  email: true,
  phoneNumber: true,
  profileImage: true,
  role: true,
  isEmailVerified: true,
  createdAt: true,
  updatedAt: true,
  countryId: true,
  regionId: true,
  country: {
    select: {
      id: true,
      name: true,
    },
  },
  region: {
    select: {
      id: true,
      name: true,
      countryId: true,
    },
  },
});

const getActiveListingCounts = async (userIds: string[]): Promise<Map<string, number>> => {
  if (!userIds.length) {
    return new Map<string, number>();
  }

  const rows = await prisma.listing.groupBy({
    by: ["userId"],
    where: {
      userId: {
        in: userIds,
      },
      deletedAt: null,
      status: "APPROVED",
      expiresAt: {
        gt: new Date(),
      },
    },
    _count: {
      _all: true,
    },
  });

  return new Map(rows.map((row: { userId: string; _count: { _all: number } }) => [row.userId, row._count._all]));
};

const pickQueryString = (query: QueryInput, key: string): string | undefined => {
  const value = query[key];
  if (Array.isArray(value)) {
    return typeof value[0] === "string" ? value[0] : undefined;
  }
  return typeof value === "string" ? value : undefined;
};

class AdminUserService {
  async getUsers({ query, baseUrl }: { query: QueryInput; baseUrl: string }) {
    const search = pickQueryString(query, "search");
    const role = pickQueryString(query, "role") || "USER";
    const sortBy = pickQueryString(query, "sortBy") || "createdAt";
    const sortOrder = pickQueryString(query, "sortOrder") || "desc";
    const page = pickQueryString(query, "page") || "1";
    const limit = pickQueryString(query, "limit") || "20";

    if (role && !USER_ROLES.includes(role as (typeof USER_ROLES)[number])) {
      throw createHttpError(400, "role must be USER or ADMIN");
    }

    const parsedPage = Math.max(Number.parseInt(page, 10) || 1, 1);
    const parsedLimit = Math.min(Math.max(Number.parseInt(limit, 10) || 20, 1), 100);
    const selectedSortField = USER_SORTABLE_FIELDS.includes(sortBy as (typeof USER_SORTABLE_FIELDS)[number])
      ? sortBy
      : "createdAt";
    const selectedSortOrder = sortOrder === "asc" ? "asc" : "desc";

    const where: any = {
      deletedAt: null,
      ...(role ? { role } : {}),
      ...(search
        ? {
            OR: [
              {
                fullName: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                email: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                phoneNumber: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),
    };

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        select: buildUserSelect(),
        orderBy: {
          [selectedSortField]: selectedSortOrder,
        },
        skip: (parsedPage - 1) * parsedLimit,
        take: parsedLimit,
      }),
    ]);

    const activeListingCounts = await getActiveListingCounts(users.map((user: { id: string }) => user.id));

    return {
      statusCode: 200,
      message: "Admin users retrieved successfully",
      data: users.map((user: any) => serializeUser(baseUrl, user, activeListingCounts.get(user.id) || 0)),
      meta: {
        total,
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil(total / parsedLimit) || 1,
      },
    };
  }

  async getUserById({ id, baseUrl }: { id: string; baseUrl: string }) {
    const user = await prisma.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: buildUserSelect(),
    });

    if (!user) {
      throw createHttpError(404, "User not found");
    }

    const activeListingCounts = await getActiveListingCounts([id]);
    const [totalListings, totalPayments] = await Promise.all([
      prisma.listing.count({
        where: {
          userId: id,
          deletedAt: null,
        },
      }),
      prisma.payment.count({
        where: {
          userId: id,
        },
      }),
    ]);

    return {
      statusCode: 200,
      message: "Admin user retrieved successfully",
      data: {
        ...serializeUser(baseUrl, user, activeListingCounts.get(id) || 0),
        totalListings,
        totalPayments,
      },
    };
  }

  async updateUser({ id, body, baseUrl }: { id: string; body: UpdateUserBody; baseUrl: string }) {
    const { fullName, email, phoneNumber, countryId, regionId, role, isEmailVerified } = body;

    const existingUser = await prisma.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: {
        id: true,
        email: true,
        countryId: true,
        regionId: true,
        role: true,
      },
    });

    if (!existingUser) {
      throw createHttpError(404, "User not found");
    }

    const normalizedFullName = fullName === undefined ? undefined : fullName.trim();
    const normalizedEmail = email === undefined ? undefined : email.trim().toLowerCase();
    const normalizedPhoneNumber = phoneNumber === undefined ? undefined : phoneNumber.trim() || null;
    const normalizedCountryId = countryId === undefined ? existingUser.countryId : countryId || null;
    const normalizedRegionId = regionId === undefined ? existingUser.regionId : regionId || null;

    if (fullName !== undefined && !normalizedFullName) {
      throw createHttpError(400, "fullName cannot be empty");
    }

    if (email !== undefined) {
      if (!normalizedEmail) {
        throw createHttpError(400, "email cannot be empty");
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(normalizedEmail)) {
        throw createHttpError(400, "Invalid email format");
      }

      const duplicateUser = await prisma.user.findFirst({
        where: {
          email: normalizedEmail,
          deletedAt: null,
          NOT: {
            id,
          },
        },
        select: {
          id: true,
        },
      });

      if (duplicateUser) {
        throw createHttpError(409, "User with this email already exists");
      }
    }

    if (role !== undefined && !USER_ROLES.includes(role as (typeof USER_ROLES)[number])) {
      throw createHttpError(400, "role must be USER or ADMIN");
    }

    if (isEmailVerified !== undefined && typeof isEmailVerified !== "boolean") {
      throw createHttpError(400, "isEmailVerified must be a boolean");
    }

    if ((regionId !== undefined || countryId !== undefined) && normalizedRegionId && !normalizedCountryId) {
      throw createHttpError(400, "countryId is required when regionId is provided");
    }

    if (normalizedCountryId) {
      const country = await prisma.country.findUnique({
        where: {
          id: normalizedCountryId,
        },
      });

      if (!country) {
        throw createHttpError(400, "Invalid country");
      }
    }

    if (normalizedRegionId) {
      const region = await prisma.region.findFirst({
        where: {
          id: normalizedRegionId,
          ...(normalizedCountryId ? { countryId: normalizedCountryId } : {}),
        },
      });

      if (!region) {
        throw createHttpError(400, "Invalid region for the selected country");
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(fullName !== undefined ? { fullName: normalizedFullName } : {}),
        ...(email !== undefined ? { email: normalizedEmail } : {}),
        ...(phoneNumber !== undefined ? { phoneNumber: normalizedPhoneNumber } : {}),
        ...(countryId !== undefined ? { countryId: normalizedCountryId } : {}),
        ...(regionId !== undefined ? { regionId: normalizedRegionId } : {}),
        ...(role !== undefined ? { role } : {}),
        ...(isEmailVerified !== undefined ? { isEmailVerified } : {}),
      },
      select: buildUserSelect(),
    });

    const activeListingCounts = await getActiveListingCounts([id]);

    return {
      statusCode: 200,
      message: "User updated successfully",
      data: serializeUser(baseUrl, user, activeListingCounts.get(id) || 0),
    };
  }

  async deleteUser({ id, adminUserId }: { id: string; adminUserId: string }) {
    const user = await prisma.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      throw createHttpError(404, "User not found");
    }

    if (user.id === adminUserId) {
      throw createHttpError(400, "You cannot delete your own account");
    }

    const deletedAt = new Date();
    const archivedEmail = `${Date.now()}__deleted__${user.email}`;

    await prisma.$transaction([
      prisma.user.update({
        where: { id },
        data: {
          deletedAt,
          email: archivedEmail,
        },
      }),
      prisma.listing.updateMany({
        where: {
          userId: id,
          deletedAt: null,
        },
        data: {
          deletedAt,
          status: "SUSPENDED",
        },
      }),
      prisma.subscription.updateMany({
        where: {
          listing: {
            userId: id,
          },
          isActive: true,
        },
        data: {
          isActive: false,
        },
      }),
    ]);

    return {
      statusCode: 200,
      message: "User deleted successfully",
    };
  }
}

const adminUserService = new AdminUserService();

export default adminUserService;
