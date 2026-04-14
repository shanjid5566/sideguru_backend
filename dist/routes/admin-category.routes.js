"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_category_controller_1 = __importDefault(require("../controllers/admin-category.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"));
router.patch("/service", admin_category_controller_1.default.updateServiceCategoryAndSubcategory.bind(admin_category_controller_1.default));
router.patch("/event", admin_category_controller_1.default.updateEventCategory.bind(admin_category_controller_1.default));
router.delete("/service/:categoryId", admin_category_controller_1.default.deleteServiceCategory.bind(admin_category_controller_1.default));
router.delete("/service/:categoryId/subcategories/:subcategoryId", admin_category_controller_1.default.deleteServiceSubcategory.bind(admin_category_controller_1.default));
router.delete("/event/:categoryId", admin_category_controller_1.default.deleteEventCategory.bind(admin_category_controller_1.default));
exports.default = router;
