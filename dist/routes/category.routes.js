"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const category_controller_1 = __importDefault(require("../controllers/category.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const upload_middleware_1 = require("../middlewares/upload.middleware");
const router = (0, express_1.Router)();
router.get("/search", category_controller_1.default.searchCategories.bind(category_controller_1.default));
router.get("/service", category_controller_1.default.getServiceCategoriesWithSubcategories.bind(category_controller_1.default));
router.get("/service/:id", category_controller_1.default.getServiceCategoryById.bind(category_controller_1.default));
router.post("/service/:id/subcategories", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"), category_controller_1.default.createSubCategory.bind(category_controller_1.default));
router.post("/service", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"), upload_middleware_1.categoryImageUpload, category_controller_1.default.createServiceCategory.bind(category_controller_1.default));
router.get("/event", category_controller_1.default.getEventCategoriesSummary.bind(category_controller_1.default));
router.post("/event", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"), upload_middleware_1.categoryImageUpload, category_controller_1.default.createEventCategory.bind(category_controller_1.default));
exports.default = router;
