"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryImageUpload = exports.profileImageUpload = void 0;
const multer_1 = require("../config/multer");
exports.profileImageUpload = multer_1.upload.single("profileImage");
exports.categoryImageUpload = multer_1.upload.single("image");
