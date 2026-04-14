"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboard_controller_1 = __importDefault(require("../controllers/dashboard.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.get("/overview", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"), dashboard_controller_1.default.getAdminOverview.bind(dashboard_controller_1.default));
exports.default = router;
