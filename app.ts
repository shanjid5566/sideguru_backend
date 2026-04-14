import express, { type NextFunction, type Request, type Response } from "express";
import path from "node:path";

import uploadRouter from "./routes/upload.routes";
import authRouter from "./routes/auth.routes";
import adminCategoryRouter from "./routes/admin-category.routes";
import adminListingRouter from "./routes/admin-listing.routes";
import adminRevenueRouter from "./routes/admin-revenue.routes";
import adminUserRouter from "./routes/admin-user.routes";
import categoryRouter from "./routes/category.routes";

const app = express();
const cors = require("cors") as (options: {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => void;
  credentials: boolean;
}) => NextFunction;

app.set("trust proxy", true);

const allowedOrigins = [
  "http://localhost:5173",
  "https://sideguru.vercel.app",
];

const corsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void,
  ) => {
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
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "SideGuru backend is running" });
});

// Health check route
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "OK",
    message: "SideGurus API Server is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

app.use("/api/upload", uploadRouter);
app.use("/api/auth", authRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/admin/categories", adminCategoryRouter);
app.use("/api/admin/listings", adminListingRouter);
app.use("/api/admin/revenue", adminRevenueRouter);
app.use("/api/admin/users", adminUserRouter);
app.use((error: Error, _req: Request, res: Response, _next: () => void) => {
  console.error("[API ERROR]", error);
  const message = error.message || "Internal server error";
  const statusError = error as Error & { statusCode?: number };

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

  if (
    message.includes("required") ||
    message.includes("already exists") ||
    message.includes("not found") ||
    message.includes("Invalid")
  ) {
    res.status(400).json({ message });
    return;
  }

  const parseError = error as Error & { type?: string; status?: number; statusCode?: number };
  if (parseError.type === "entity.parse.failed" || parseError.status === 400 || parseError.statusCode === 400) {
    res.status(400).json({ message: "Invalid JSON body" });
    return;
  }

  res.status(500).json({ message: "Internal server error" });
});

export default app;