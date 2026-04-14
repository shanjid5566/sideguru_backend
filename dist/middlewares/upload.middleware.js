"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventListingUpload = exports.categoryImageUpload = exports.profileImageUpload = void 0;
const multer_1 = require("../config/multer");
exports.profileImageUpload = multer_1.upload.single("profileImage");
exports.categoryImageUpload = multer_1.upload.single("image");
exports.eventListingUpload = multer_1.upload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "eventImage", maxCount: 1 },
    { name: "eventImages", maxCount: 10 },
    { name: "serviceImages", maxCount: 10 },
    { name: "gallery", maxCount: 10 },
    { name: "eventGallery", maxCount: 10 },
]);
