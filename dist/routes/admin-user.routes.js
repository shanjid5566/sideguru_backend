"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_user_controller_1 = __importDefault(require("../controllers/admin-user.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"));
router.get("/", admin_user_controller_1.default.getUsers.bind(admin_user_controller_1.default));
router.get("/:id", admin_user_controller_1.default.getUserById.bind(admin_user_controller_1.default));
router.put("/:id", admin_user_controller_1.default.updateUser.bind(admin_user_controller_1.default));
router.delete("/:id", admin_user_controller_1.default.deleteUser.bind(admin_user_controller_1.default));
exports.default = router;
