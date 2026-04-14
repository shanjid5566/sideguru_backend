"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../lib/prisma");
const httpError_1 = require("../utils/httpError");
const prisma = prisma_1.prisma;
const ABSOLUTE_URL_PATTERN = /^https?:\/\//i;
const LISTING_STATUSES = ["PENDING", "APPROVED", "SUSPENDED", "EXPIRED"];
const MODERATABLE_STATUSES = ["PENDING", "APPROVED", "SUSPENDED"];
const SORTABLE_FIELDS = ["createdAt", "price", "title"];
const toAbsoluteMediaUrl = (baseUrl, mediaPath) => {
    if (!mediaPath) {
        return mediaPath;
    }
    if (ABSOLUTE_URL_PATTERN.test(mediaPath)) {
        return mediaPath;
    }
    const normalizedPath = mediaPath.startsWith("/") ? mediaPath : `/${mediaPath}`;
    return `${baseUrl}${normalizedPath}`;
};
const serializeListingMedia = (baseUrl, listing) => {
    if (!listing) {
        return listing;
    }
    return {
        ...listing,
        categoryName: listing.category?.name || null,
        subCategoryName: listing.subCategory?.name || null,
        countryName: listing.country?.name || null,
        regionName: listing.region?.name || null,
        mainImage: toAbsoluteMediaUrl(baseUrl, listing.mainImage ?? null),
        serviceImages: Array.isArray(listing.serviceImages)
            ? listing.serviceImages.map((image) => toAbsoluteMediaUrl(baseUrl, image))
            : [],
        gallery: Array.isArray(listing.gallery)
            ? listing.gallery.map((image) => toAbsoluteMediaUrl(baseUrl, image))
            : [],
        user: listing.user
            ? {
                ...listing.user,
                profileImage: toAbsoluteMediaUrl(baseUrl, listing.user.profileImage ?? null),
            }
            : null,
    };
};
const normalizeError = (error) => {
    const typed = error;
    if (typed?.meta?.cause) {
        return (0, httpError_1.createHttpError)(500, typed.meta.cause);
    }
    if (typed?.statusCode && typed?.message) {
        return typed;
    }
    return (0, httpError_1.createHttpError)(500, typed?.message || "An unexpected error occurred");
};
const expireListings = async () => {
    try {
        const now = new Date();
        await prisma.listing.updateMany({
            where: {
                status: "APPROVED",
                expiresAt: {
                    lte: now,
                },
                deletedAt: null,
            },
            data: {
                status: "EXPIRED",
            },
        });
    }
    catch (error) {
        console.error("Error expiring listings:", error);
    }
};
const getListingExpiryDate = () => {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    return expiryDate;
};
const pickQueryString = (query, key) => {
    const value = query[key];
    if (Array.isArray(value)) {
        return typeof value[0] === "string" ? value[0] : undefined;
    }
    return typeof value === "string" ? value : undefined;
};
class AdminListingService {
    async getAllListings({ query, baseUrl }) {
        try {
            await expireListings();
            const status = pickQueryString(query, "status");
            const listingType = pickQueryString(query, "listingType");
            const categoryId = pickQueryString(query, "categoryId");
            const subCategoryId = pickQueryString(query, "subCategoryId");
            const countryId = pickQueryString(query, "countryId");
            const regionId = pickQueryString(query, "regionId");
            const search = pickQueryString(query, "search");
            const sortBy = pickQueryString(query, "sortBy") || "createdAt";
            const sortOrder = pickQueryString(query, "sortOrder") || "desc";
            const page = pickQueryString(query, "page") || "1";
            const limit = pickQueryString(query, "limit") || "20";
            if (status && !LISTING_STATUSES.includes(status)) {
                throw (0, httpError_1.createHttpError)(400, "Invalid status value");
            }
            if (listingType && !["SERVICE", "EVENT"].includes(listingType)) {
                throw (0, httpError_1.createHttpError)(400, "Invalid listingType value. Must be SERVICE or EVENT");
            }
            const parsedPage = Math.max(Number.parseInt(page, 10) || 1, 1);
            const parsedLimit = Math.min(Math.max(Number.parseInt(limit, 10) || 20, 1), 100);
            const selectedSortField = SORTABLE_FIELDS.includes(sortBy) ? sortBy : "createdAt";
            const selectedSortOrder = sortOrder === "asc" ? "asc" : "desc";
            const where = {
                deletedAt: null,
                payments: {
                    some: {
                        status: "SUCCESS",
                    },
                },
                ...(status ? { status } : {}),
                ...(listingType ? { listingType } : {}),
                ...(categoryId ? { categoryId } : {}),
                ...(subCategoryId ? { subCategoryId } : {}),
                ...(countryId ? { countryId } : {}),
                ...(regionId ? { regionId } : {}),
                ...(search
                    ? {
                        OR: [
                            { title: { contains: search, mode: "insensitive" } },
                            { description: { contains: search, mode: "insensitive" } },
                            { user: { fullName: { contains: search, mode: "insensitive" } } },
                        ],
                    }
                    : {}),
            };
            const [total, listings] = await Promise.all([
                prisma.listing.count({ where }),
                prisma.listing.findMany({
                    where,
                    include: {
                        category: true,
                        subCategory: true,
                        country: true,
                        region: true,
                        user: {
                            select: {
                                id: true,
                                fullName: true,
                                email: true,
                                phoneNumber: true,
                                profileImage: true,
                            },
                        },
                        payments: {
                            orderBy: { createdAt: "desc" },
                            take: 1,
                        },
                        subscription: true,
                    },
                    orderBy: {
                        [selectedSortField]: selectedSortOrder,
                    },
                    skip: (parsedPage - 1) * parsedLimit,
                    take: parsedLimit,
                }),
            ]);
            return {
                statusCode: 200,
                message: "Listings retrieved successfully",
                data: listings.map((listing) => serializeListingMedia(baseUrl, listing)),
                meta: {
                    total,
                    page: parsedPage,
                    limit: parsedLimit,
                    totalPages: Math.ceil(total / parsedLimit) || 1,
                },
            };
        }
        catch (error) {
            throw normalizeError(error);
        }
    }
    async getListingById({ id, baseUrl }) {
        try {
            await expireListings();
            const listing = await prisma.listing.findFirst({
                where: {
                    id,
                    deletedAt: null,
                },
                include: {
                    category: true,
                    subCategory: true,
                    country: true,
                    region: true,
                    user: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                            phoneNumber: true,
                            profileImage: true,
                        },
                    },
                    payments: {
                        orderBy: { createdAt: "desc" },
                        take: 1,
                    },
                    subscription: true,
                },
            });
            if (!listing) {
                throw (0, httpError_1.createHttpError)(404, "Listing not found");
            }
            return {
                statusCode: 200,
                message: "Listing retrieved successfully",
                data: serializeListingMedia(baseUrl, listing),
            };
        }
        catch (error) {
            throw normalizeError(error);
        }
    }
    async updateListingStatus({ id, status, baseUrl }) {
        try {
            await expireListings();
            if (!MODERATABLE_STATUSES.includes(status)) {
                throw (0, httpError_1.createHttpError)(400, "status must be PENDING, APPROVED, or SUSPENDED");
            }
            const existingListing = await prisma.listing.findFirst({
                where: {
                    id,
                    deletedAt: null,
                    payments: {
                        some: {
                            status: "SUCCESS",
                        },
                    },
                },
            });
            if (!existingListing) {
                throw (0, httpError_1.createHttpError)(404, "Listing not found");
            }
            const listing = await prisma.listing.update({
                where: { id },
                data: status === "APPROVED"
                    ? {
                        status,
                        publishedAt: new Date(),
                        expiresAt: getListingExpiryDate(),
                    }
                    : {
                        status,
                    },
                include: {
                    category: true,
                    subCategory: true,
                    country: true,
                    region: true,
                    user: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                            phoneNumber: true,
                            profileImage: true,
                        },
                    },
                    payments: {
                        orderBy: { createdAt: "desc" },
                        take: 1,
                    },
                    subscription: true,
                },
            });
            if (status === "APPROVED") {
                await prisma.subscription.upsert({
                    where: { listingId: listing.id },
                    update: {
                        planType: listing.subscription?.planType || "Listing Renewal",
                        startDate: listing.publishedAt,
                        endDate: listing.expiresAt,
                        isActive: true,
                    },
                    create: {
                        listingId: listing.id,
                        planType: "Listing Activation",
                        startDate: listing.publishedAt,
                        endDate: listing.expiresAt,
                        isActive: true,
                    },
                });
            }
            if (status === "SUSPENDED") {
                await prisma.subscription.updateMany({
                    where: { listingId: listing.id },
                    data: { isActive: false },
                });
            }
            return {
                statusCode: 200,
                message: `Listing status updated to ${status}`,
                data: serializeListingMedia(baseUrl, listing),
            };
        }
        catch (error) {
            throw normalizeError(error);
        }
    }
    async deleteListing({ id }) {
        try {
            await expireListings();
            const existingListing = await prisma.listing.findFirst({
                where: {
                    id,
                    deletedAt: null,
                },
            });
            if (!existingListing) {
                throw (0, httpError_1.createHttpError)(404, "Listing not found");
            }
            await prisma.listing.update({
                where: { id },
                data: {
                    deletedAt: new Date(),
                },
            });
            return {
                statusCode: 200,
                message: "Listing deleted successfully",
            };
        }
        catch (error) {
            throw normalizeError(error);
        }
    }
}
const adminListingService = new AdminListingService();
exports.default = adminListingService;
