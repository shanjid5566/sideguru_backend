"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = exports.uploadsStaticDir = void 0;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const multer_1 = __importDefault(require("multer"));
const isVercel = process.env.VERCEL === "1" || process.env.VERCEL === "true";
const uploadsRoot = isVercel ? node_path_1.default.join("/tmp", "uploads") : node_path_1.default.join(process.cwd(), "uploads");
const imageDir = node_path_1.default.join(uploadsRoot, "images");
const videoDir = node_path_1.default.join(uploadsRoot, "videos");
exports.uploadsStaticDir = uploadsRoot;
for (const dir of [uploadsRoot, imageDir, videoDir]) {
    if (!node_fs_1.default.existsSync(dir)) {
        node_fs_1.default.mkdirSync(dir, { recursive: true });
    }
}
const storage = multer_1.default.diskStorage({
    destination: (_req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, imageDir);
            return;
        }
        if (file.mimetype.startsWith("video/")) {
            cb(null, videoDir);
            return;
        }
        cb(new Error("Unsupported file type"), uploadsRoot);
    },
    filename: (_req, file, cb) => {
        const ext = node_path_1.default.extname(file.originalname);
        const safeName = file.originalname
            .replace(ext, "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
        cb(null, `${Date.now()}-${safeName || "file"}${ext}`);
    },
});
const fileFilter = (_req, file, cb) => {
    if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
        cb(null, true);
        return;
    }
    cb(new Error("Only image and video files are allowed"));
};
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024,
    },
});
