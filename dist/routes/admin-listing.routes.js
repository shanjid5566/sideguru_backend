"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_listing_controller_1 = __importDefault(require("../controllers/admin-listing.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.get("/", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"), admin_listing_controller_1.default.getAllListings.bind(admin_listing_controller_1.default));
router.get("/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"), admin_listing_controller_1.default.getListingById.bind(admin_listing_controller_1.default));
router.patch("/:id/status", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"), admin_listing_controller_1.default.updateListingStatus.bind(admin_listing_controller_1.default));
router.delete("/:id", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"), admin_listing_controller_1.default.deleteListing.bind(admin_listing_controller_1.default));
exports.default = router;
