"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.profileImageUpload = void 0;
const multer_1 = require("../config/multer");
exports.profileImageUpload = multer_1.upload.single("profileImage");
