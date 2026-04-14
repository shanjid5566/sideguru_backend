"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const node_path_1 = __importDefault(require("node:path"));
const upload_routes_1 = __importDefault(require("./routes/upload.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const admin_category_routes_1 = __importDefault(require("./routes/admin-category.routes"));
const admin_listing_routes_1 = __importDefault(require("./routes/admin-listing.routes"));
const app = (0, express_1.default)();
const cors = require("cors");
app.set("trust proxy", true);
const allowedOrigins = [
    "http://localhost:5173",
    "https://sideguru.vercel.app",
];
const corsOptions = {
    origin: (origin, callback) => {
        // Allow non-browser requests (Postman/server-to-server) and explicit frontend origins.
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
            return;
        }
        callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
};
app.use(cors(corsOptions));
// Keep popup-based auth flows (e.g., Firebase Google sign-in) compatible.
app.use((_req, res, next) => {
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
    res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
    next();
});
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use("/uploads", express_1.default.static(node_path_1.default.join(process.cwd(), "uploads")));
app.get("/", (_req, res) => {
    res.json({ message: "SideGuru backend is running" });
});
// Health check route
app.get("/health", (_req, res) => {
    res.status(200).json({
        status: "OK",
        message: "SideGurus API Server is running",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
    });
});
app.use("/api/upload", upload_routes_1.default);
app.use("/api/auth", auth_routes_1.default);
app.use("/api/admin/categories", admin_category_routes_1.default);
app.use("/api/admin/listings", admin_listing_routes_1.default);
app.use((error, _req, res, _next) => {
    console.error("[API ERROR]", error);
    const message = error.message || "Internal server error";
    const statusError = error;
    if (statusError.statusCode) {
        res.status(statusError.statusCode).json({ message });
        return;
    }
    if (error.message.includes("Only image and video")) {
        res.status(400).json({ message: error.message });
        return;
    }
    if (error.message.includes("File too large")) {
        res.status(400).json({ message: "File exceeds 50MB limit" });
        return;
    }
    if (message.includes("Invalid email or password") || message.includes("Invalid token")) {
        res.status(401).json({ message });
        return;
    }
    if (message.includes("verify your email")) {
        res.status(403).json({ message });
        return;
    }
    if (message.includes("required") ||
        message.includes("already exists") ||
        message.includes("not found") ||
        message.includes("Invalid")) {
        res.status(400).json({ message });
        return;
    }
    const parseError = error;
    if (parseError.type === "entity.parse.failed" || parseError.status === 400 || parseError.statusCode === 400) {
        res.status(400).json({ message: "Invalid JSON body" });
        return;
    }
    res.status(500).json({ message: "Internal server error" });
});
exports.default = app;
