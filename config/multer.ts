import fs from "node:fs";
import path from "node:path";

import multer, { type FileFilterCallback } from "multer";
import type { Request } from "express";

const uploadsRoot = path.join(process.cwd(), "uploads");
const imageDir = path.join(uploadsRoot, "images");
const videoDir = path.join(uploadsRoot, "videos");

for (const dir of [uploadsRoot, imageDir, videoDir]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const storage = multer.diskStorage({
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
    const ext = path.extname(file.originalname);
    const safeName = file.originalname
      .replace(ext, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    cb(null, `${Date.now()}-${safeName || "file"}${ext}`);
  },
});

const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
    cb(null, true);
    return;
  }

  cb(new Error("Only image and video files are allowed"));
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
});
