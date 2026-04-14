"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../lib/prisma");
const httpError_1 = require("../utils/httpError");
const prisma = prisma_1.prisma;
const ABSOLUTE_URL_PATTERN = /^https?:\/\//i;
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
const serializeCategoryImage = (baseUrl, category) => ({
    ...category,
    image: toAbsoluteMediaUrl(baseUrl, category.image),
});
class AdminCategoryService {
    async updateServiceCategoryAndSubcategory({ categoryId, categoryName, subcategoryId, subcategoryName, baseUrl, }) {
        if (!categoryId) {
            throw (0, httpError_1.createHttpError)(400, "categoryId is required");
        }
        const category = await prisma.category.findFirst({
            where: {
                id: categoryId,
                type: "SERVICE",
            },
            include: {
                subCategories: true,
            },
        });
        if (!category) {
            throw (0, httpError_1.createHttpError)(404, "Service category not found");
        }
        if (categoryName === null || categoryName === "") {
            await prisma.category.delete({
                where: { id: categoryId },
            });
            return {
                statusCode: 200,
                message: "Service category and all its subcategories deleted successfully",
                data: {
                    action: "deleted",
                    type: "category",
                    categoryId,
                },
            };
        }
        if (subcategoryId) {
            const subcategory = await prisma.subCategory.findFirst({
                where: {
                    id: subcategoryId,
                    categoryId,
                },
            });
            if (!subcategory) {
                throw (0, httpError_1.createHttpError)(404, "Subcategory not found in this category");
            }
            if (subcategoryName === null || subcategoryName === "") {
                await prisma.subCategory.delete({
                    where: { id: subcategoryId },
                });
                return {
                    statusCode: 200,
                    message: "Service subcategory deleted successfully",
                    data: {
                        action: "deleted",
                        type: "subcategory",
                        subcategoryId,
                        categoryId,
                    },
                };
            }
            if (!subcategoryName) {
                throw (0, httpError_1.createHttpError)(400, "subcategoryName is required for subcategory update");
            }
            const normalizedSubcategoryName = subcategoryName.trim();
            const duplicateSubcategory = await prisma.subCategory.findFirst({
                where: {
                    name: normalizedSubcategoryName,
                    categoryId,
                    id: {
                        not: subcategoryId,
                    },
                },
            });
            if (duplicateSubcategory) {
                throw (0, httpError_1.createHttpError)(409, "Subcategory with this name already exists in this category");
            }
            const updatedSubcategory = await prisma.subCategory.update({
                where: { id: subcategoryId },
                data: { name: normalizedSubcategoryName },
            });
            return {
                statusCode: 200,
                message: "Service subcategory updated successfully",
                data: {
                    action: "updated",
                    type: "subcategory",
                    subcategory: updatedSubcategory,
                    categoryId,
                },
            };
        }
        if (!categoryName) {
            throw (0, httpError_1.createHttpError)(400, "Category name is required");
        }
        const normalizedCategoryName = categoryName.trim();
        if (!normalizedCategoryName) {
            throw (0, httpError_1.createHttpError)(400, "Category name cannot be empty");
        }
        const duplicateCategory = await prisma.category.findFirst({
            where: {
                name: normalizedCategoryName,
                id: {
                    not: categoryId,
                },
            },
        });
        if (duplicateCategory) {
            throw (0, httpError_1.createHttpError)(409, "Category with this name already exists");
        }
        const updatedCategory = await prisma.category.update({
            where: { id: categoryId },
            data: { name: normalizedCategoryName },
            include: {
                subCategories: true,
            },
        });
        return {
            statusCode: 200,
            message: "Service category updated successfully",
            data: {
                action: "updated",
                type: "category",
                category: serializeCategoryImage(baseUrl, updatedCategory),
                subCategoriesCount: updatedCategory.subCategories.length,
            },
        };
    }
    async updateEventCategory({ categoryId, categoryName, baseUrl }) {
        if (!categoryId) {
            throw (0, httpError_1.createHttpError)(400, "categoryId is required");
        }
        const category = await prisma.category.findFirst({
            where: {
                id: categoryId,
                type: "EVENT",
            },
        });
        if (!category) {
            throw (0, httpError_1.createHttpError)(404, "Event category not found");
        }
        if (categoryName === null || categoryName === "") {
            await prisma.category.delete({
                where: { id: categoryId },
            });
            return {
                statusCode: 200,
                message: "Event category deleted successfully",
                data: {
                    action: "deleted",
                    type: "category",
                    categoryId,
                },
            };
        }
        if (!categoryName) {
            throw (0, httpError_1.createHttpError)(400, "Category name is required");
        }
        const normalizedCategoryName = categoryName.trim();
        if (!normalizedCategoryName) {
            throw (0, httpError_1.createHttpError)(400, "Category name cannot be empty");
        }
        const duplicateCategory = await prisma.category.findFirst({
            where: {
                name: normalizedCategoryName,
                id: {
                    not: categoryId,
                },
            },
        });
        if (duplicateCategory) {
            throw (0, httpError_1.createHttpError)(409, "Category with this name already exists");
        }
        const updatedCategory = await prisma.category.update({
            where: { id: categoryId },
            data: { name: normalizedCategoryName },
        });
        return {
            statusCode: 200,
            message: "Event category updated successfully",
            data: {
                action: "updated",
                type: "category",
                category: serializeCategoryImage(baseUrl, updatedCategory),
            },
        };
    }
    async deleteServiceCategory(categoryId) {
        if (!categoryId) {
            throw (0, httpError_1.createHttpError)(400, "categoryId is required");
        }
        const category = await prisma.category.findFirst({
            where: {
                id: categoryId,
                type: "SERVICE",
            },
            include: {
                subCategories: {
                    select: { id: true },
                },
            },
        });
        if (!category) {
            throw (0, httpError_1.createHttpError)(404, "Service category not found");
        }
        await prisma.category.delete({
            where: { id: categoryId },
        });
        return {
            statusCode: 200,
            message: "Service category and all its subcategories deleted successfully",
            data: {
                action: "deleted",
                type: "category",
                categoryId,
                deletedSubcategoriesCount: category.subCategories.length,
            },
        };
    }
    async deleteServiceSubcategory(categoryId, subcategoryId) {
        if (!categoryId) {
            throw (0, httpError_1.createHttpError)(400, "categoryId is required");
        }
        if (!subcategoryId) {
            throw (0, httpError_1.createHttpError)(400, "subcategoryId is required");
        }
        const category = await prisma.category.findFirst({
            where: {
                id: categoryId,
                type: "SERVICE",
            },
            select: { id: true },
        });
        if (!category) {
            throw (0, httpError_1.createHttpError)(404, "Service category not found");
        }
        const subcategory = await prisma.subCategory.findFirst({
            where: {
                id: subcategoryId,
                categoryId,
            },
            select: {
                id: true,
                name: true,
            },
        });
        if (!subcategory) {
            throw (0, httpError_1.createHttpError)(404, "Subcategory not found in this category");
        }
        await prisma.subCategory.delete({
            where: { id: subcategoryId },
        });
        return {
            statusCode: 200,
            message: "Service subcategory deleted successfully",
            data: {
                action: "deleted",
                type: "subcategory",
                categoryId,
                subcategoryId,
                subcategoryName: subcategory.name,
            },
        };
    }
    async deleteEventCategory(categoryId) {
        if (!categoryId) {
            throw (0, httpError_1.createHttpError)(400, "categoryId is required");
        }
        const category = await prisma.category.findFirst({
            where: {
                id: categoryId,
                type: "EVENT",
            },
            select: {
                id: true,
                name: true,
            },
        });
        if (!category) {
            throw (0, httpError_1.createHttpError)(404, "Event category not found");
        }
        await prisma.category.delete({
            where: { id: categoryId },
        });
        return {
            statusCode: 200,
            message: "Event category deleted successfully",
            data: {
                action: "deleted",
                type: "category",
                categoryId,
                categoryName: category.name,
            },
        };
    }
}
const adminCategoryService = new AdminCategoryService();
exports.default = adminCategoryService;
