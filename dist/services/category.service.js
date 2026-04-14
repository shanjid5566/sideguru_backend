"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../lib/prisma");
const httpError_1 = require("../utils/httpError");
const prisma = prisma_1.prisma;
const ABSOLUTE_URL_PATTERN = /^https?:\/\//i;
const toPublicUploadPath = (filePath) => {
    const normalized = filePath.replace(/\\/g, "/");
    const uploadsIndex = normalized.indexOf("uploads/");
    if (uploadsIndex === -1) {
        return normalized.startsWith("/") ? normalized : `/${normalized}`;
    }
    return `/${normalized.slice(uploadsIndex)}`;
};
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
const serializeCategoryImage = (baseUrl, category) => {
    if (!category) {
        return category;
    }
    return {
        ...category,
        image: toAbsoluteMediaUrl(baseUrl, category.image ?? null),
    };
};
class CategoryService {
    async createEventCategory({ body, file, baseUrl }) {
        return this.createCategory({
            name: body?.name,
            image: file ? toPublicUploadPath(file.path) : undefined,
            type: "EVENT",
            baseUrl,
        });
    }
    async createServiceCategory({ body, file, baseUrl }) {
        return this.createCategory({
            name: body?.name,
            image: file ? toPublicUploadPath(file.path) : undefined,
            type: "SERVICE",
            baseUrl,
        });
    }
    async createCategory({ name, image, type = "SERVICE", baseUrl }) {
        if (!name || !name.trim()) {
            throw (0, httpError_1.createHttpError)(400, "Category name is required");
        }
        if (!image || !image.trim()) {
            throw (0, httpError_1.createHttpError)(400, "Category image file is required");
        }
        if (!["SERVICE", "EVENT"].includes(type)) {
            throw (0, httpError_1.createHttpError)(400, "Invalid category type. Must be SERVICE or EVENT");
        }
        const normalizedName = name.trim();
        const existingCategory = await prisma.category.findUnique({
            where: { name: normalizedName },
        });
        if (existingCategory) {
            throw (0, httpError_1.createHttpError)(409, "Category already exists");
        }
        const category = await prisma.category.create({
            data: {
                name: normalizedName,
                image: image.trim(),
                type,
            },
        });
        return {
            statusCode: 201,
            message: "Category created successfully",
            data: serializeCategoryImage(baseUrl, category),
        };
    }
    async createSubCategory(categoryId, input) {
        const { name } = input;
        if (!name || !name.trim()) {
            throw (0, httpError_1.createHttpError)(400, "Subcategory name is required");
        }
        const category = await prisma.category.findUnique({ where: { id: categoryId } });
        if (!category) {
            throw (0, httpError_1.createHttpError)(404, "Category not found");
        }
        if (category.type !== "SERVICE") {
            throw (0, httpError_1.createHttpError)(400, "Subcategories are only allowed for service categories");
        }
        const normalizedName = name.trim();
        const existingSubCategory = await prisma.subCategory.findFirst({
            where: {
                categoryId,
                name: normalizedName,
            },
        });
        if (existingSubCategory) {
            throw (0, httpError_1.createHttpError)(409, "Subcategory already exists in this category");
        }
        const subCategory = await prisma.subCategory.create({
            data: {
                name: normalizedName,
                categoryId,
            },
        });
        return {
            statusCode: 201,
            message: "Subcategory created successfully",
            data: subCategory,
        };
    }
    async getAllCategories({ baseUrl }) {
        const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
        return {
            statusCode: 200,
            message: "Categories retrieved successfully",
            data: categories.map((category) => serializeCategoryImage(baseUrl, category)),
        };
    }
    async getCategoryById(id, { baseUrl }) {
        const category = await prisma.category.findUnique({
            where: { id },
            include: {
                subCategories: { orderBy: { name: "asc" } },
            },
        });
        if (!category) {
            throw (0, httpError_1.createHttpError)(404, "Category not found");
        }
        return {
            statusCode: 200,
            message: "Category retrieved successfully",
            data: serializeCategoryImage(baseUrl, category),
        };
    }
    async getCategoryByIdAndType(id, type, { baseUrl }) {
        if (!["SERVICE", "EVENT"].includes(type)) {
            throw (0, httpError_1.createHttpError)(400, "Invalid category type. Must be SERVICE or EVENT");
        }
        const category = await prisma.category.findFirst({
            where: { id, type },
            include: {
                subCategories: { orderBy: { name: "asc" } },
            },
        });
        if (!category) {
            throw (0, httpError_1.createHttpError)(404, `${type === "SERVICE" ? "Service" : "Event"} category not found`);
        }
        return {
            statusCode: 200,
            message: `${type} category retrieved successfully`,
            data: serializeCategoryImage(baseUrl, category),
        };
    }
    async getAllCategoriesWithSubcategories({ baseUrl }) {
        const categories = await prisma.category.findMany({
            include: {
                subCategories: { orderBy: { name: "asc" } },
            },
            orderBy: { name: "asc" },
        });
        return {
            statusCode: 200,
            message: "Categories with subcategories retrieved successfully",
            data: categories.map((category) => serializeCategoryImage(baseUrl, category)),
        };
    }
    async getServiceCategoriesWithSubcategories({ baseUrl }) {
        const categories = await prisma.category.findMany({
            where: { type: "SERVICE" },
            include: {
                subCategories: { orderBy: { name: "asc" } },
            },
            orderBy: { name: "asc" },
        });
        return {
            statusCode: 200,
            message: "Service categories with subcategories retrieved successfully",
            data: categories.map((category) => serializeCategoryImage(baseUrl, category)),
        };
    }
    async getCategoriesByType(type, { baseUrl }) {
        if (!["SERVICE", "EVENT"].includes(type)) {
            throw (0, httpError_1.createHttpError)(400, "Invalid category type. Must be SERVICE or EVENT");
        }
        const categories = await prisma.category.findMany({
            where: { type },
            include: {
                subCategories: { orderBy: { name: "asc" } },
            },
            orderBy: { name: "asc" },
        });
        return {
            statusCode: 200,
            message: `${type} categories retrieved successfully`,
            data: categories.map((category) => serializeCategoryImage(baseUrl, category)),
        };
    }
    async getSubcategoriesByCategoryId(id) {
        const category = await prisma.category.findUnique({ where: { id } });
        if (!category) {
            throw (0, httpError_1.createHttpError)(404, "Category not found");
        }
        const subcategories = await prisma.subCategory.findMany({
            where: { categoryId: id },
            orderBy: { name: "asc" },
        });
        return {
            statusCode: 200,
            message: "Subcategories retrieved successfully",
            data: subcategories,
        };
    }
    async getServiceSubcategoriesByCategoryId(id) {
        const category = await prisma.category.findFirst({
            where: { id, type: "SERVICE" },
        });
        if (!category) {
            throw (0, httpError_1.createHttpError)(404, "Service category not found");
        }
        const subcategories = await prisma.subCategory.findMany({
            where: { categoryId: id },
            orderBy: { name: "asc" },
        });
        return {
            statusCode: 200,
            message: "Service subcategories retrieved successfully",
            data: subcategories,
        };
    }
    async getServiceSubcategoriesWithCategory() {
        const subcategories = await prisma.subCategory.findMany({
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        type: true,
                    },
                },
            },
            where: {
                category: { type: "SERVICE" },
            },
            orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
        });
        return {
            statusCode: 200,
            message: "Service subcategories with categories retrieved successfully",
            data: subcategories,
        };
    }
    async searchCategories(query, { baseUrl }) {
        if (!query || query.trim() === "") {
            throw (0, httpError_1.createHttpError)(400, "Search query is required");
        }
        const categories = await prisma.category.findMany({
            where: {
                name: {
                    contains: query,
                    mode: "insensitive",
                },
            },
            include: {
                subCategories: { orderBy: { name: "asc" } },
            },
            orderBy: { name: "asc" },
        });
        return {
            statusCode: 200,
            message: "Search results retrieved successfully",
            data: categories.map((category) => serializeCategoryImage(baseUrl, category)),
        };
    }
    async getCategorySummaryByType(type, { baseUrl }) {
        if (!["SERVICE", "EVENT"].includes(type)) {
            throw (0, httpError_1.createHttpError)(400, "Invalid category type. Must be SERVICE or EVENT");
        }
        const categories = await prisma.category.findMany({
            where: { type },
            select: { id: true, name: true, image: true },
            orderBy: { name: "asc" },
        });
        return {
            statusCode: 200,
            message: `${type} categories retrieved successfully`,
            data: categories.map((category) => serializeCategoryImage(baseUrl, category)),
        };
    }
    async getEventCategoriesSummary({ baseUrl }) {
        return this.getCategorySummaryByType("EVENT", { baseUrl });
    }
    async getServiceCategoriesSummary({ baseUrl }) {
        return this.getCategorySummaryByType("SERVICE", { baseUrl });
    }
    async updateCategoryByType(id, { body, file, baseUrl }, type) {
        if (!["SERVICE", "EVENT"].includes(type)) {
            throw (0, httpError_1.createHttpError)(400, "Invalid category type. Must be SERVICE or EVENT");
        }
        const { name } = body || {};
        const image = file ? toPublicUploadPath(file.path) : undefined;
        const existingCategory = await prisma.category.findFirst({
            where: { id, type },
        });
        if (!existingCategory) {
            throw (0, httpError_1.createHttpError)(404, `${type === "EVENT" ? "Event" : "Service"} category not found`);
        }
        const updateData = {};
        if (name !== undefined) {
            if (!name || !name.trim()) {
                throw (0, httpError_1.createHttpError)(400, "Category name cannot be empty");
            }
            const normalizedName = name.trim();
            const duplicateCategory = await prisma.category.findFirst({
                where: {
                    name: normalizedName,
                    id: { not: id },
                },
            });
            if (duplicateCategory) {
                throw (0, httpError_1.createHttpError)(409, "Category already exists");
            }
            updateData.name = normalizedName;
        }
        if (image !== undefined) {
            updateData.image = image.trim() || null;
        }
        if (!Object.keys(updateData).length) {
            throw (0, httpError_1.createHttpError)(400, "At least one of name or image is required to update");
        }
        const category = await prisma.category.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                name: true,
                image: true,
                type: true,
            },
        });
        return {
            statusCode: 200,
            message: `${type === "EVENT" ? "Event" : "Service"} category updated successfully`,
            data: serializeCategoryImage(baseUrl, category),
        };
    }
    async updateEventCategory(id, payload) {
        return this.updateCategoryByType(id, payload, "EVENT");
    }
    async updateServiceCategory(id, payload) {
        return this.updateCategoryByType(id, payload, "SERVICE");
    }
    async deleteCategoryByType(id, type) {
        if (!["SERVICE", "EVENT"].includes(type)) {
            throw (0, httpError_1.createHttpError)(400, "Invalid category type. Must be SERVICE or EVENT");
        }
        const existingCategory = await prisma.category.findFirst({
            where: { id, type },
            include: {
                subCategories: {
                    select: { id: true },
                },
                listings: {
                    where: { deletedAt: null },
                    select: { id: true },
                    take: 1,
                },
            },
        });
        if (!existingCategory) {
            throw (0, httpError_1.createHttpError)(404, `${type === "EVENT" ? "Event" : "Service"} category not found`);
        }
        if (existingCategory.subCategories.length > 0) {
            throw (0, httpError_1.createHttpError)(409, `Cannot delete ${type === "EVENT" ? "event" : "service"} category with subcategories. Remove subcategories first.`);
        }
        if (existingCategory.listings.length > 0) {
            throw (0, httpError_1.createHttpError)(409, `Cannot delete ${type === "EVENT" ? "event" : "service"} category with existing ${type === "EVENT" ? "event" : "service"} listings.`);
        }
        await prisma.category.delete({ where: { id } });
        return {
            statusCode: 200,
            message: `${type === "EVENT" ? "Event" : "Service"} category deleted successfully`,
        };
    }
    async deleteEventCategory(id) {
        return this.deleteCategoryByType(id, "EVENT");
    }
    async deleteServiceCategory(id) {
        return this.deleteCategoryByType(id, "SERVICE");
    }
}
const categoryService = new CategoryService();
exports.default = categoryService;
