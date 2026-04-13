"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const upload_controller_1 = require("../controllers/upload.controller");
const multer_1 = require("../config/multer");
const uploadRouter = (0, express_1.Router)();
uploadRouter.post("/", multer_1.upload.single("file"), upload_controller_1.uploadMedia);
exports.default = uploadRouter;
