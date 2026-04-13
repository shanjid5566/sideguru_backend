"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMedia = void 0;
const node_path_1 = __importDefault(require("node:path"));
const buildPublicFileUrl = (req, relativePath) => {
    const backendUrl = process.env.BACKEND_URL;
    if (backendUrl) {
        return `${backendUrl.replace(/\/$/, "")}${relativePath}`;
    }
    return `${req.protocol}://${req.get("host")}${relativePath}`;
};
const uploadMedia = (req, res) => {
    if (!req.file) {
        res.status(400).json({ message: "No file uploaded" });
        return;
    }
    const relativePath = node_path_1.default.relative(process.cwd(), req.file.path).replace(/\\/g, "/");
    const publicPath = `/${relativePath}`;
    res.status(201).json({
        message: "File uploaded successfully",
        file: {
            originalName: req.file.originalname,
            filename: req.file.filename,
            mimeType: req.file.mimetype,
            size: req.file.size,
            path: publicPath,
            url: buildPublicFileUrl(req, publicPath),
        },
    });
};
exports.uploadMedia = uploadMedia;
