"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const node_path_1 = __importDefault(require("node:path"));
const upload_routes_1 = __importDefault(require("./routes/upload.routes"));
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
app.use((error, _req, res, _next) => {
    if (error.message.includes("Only image and video")) {
        res.status(400).json({ message: error.message });
        return;
    }
    if (error.message.includes("File too large")) {
        res.status(400).json({ message: "File exceeds 50MB limit" });
        return;
    }
    res.status(500).json({ message: "Internal server error" });
});
exports.default = app;
