import type { Request, Response } from "express";

type MulterRequest = Request & {
  file?: {
    path: string;
    originalname: string;
    filename: string;
    mimetype: string;
    size: number;
  };
};

const buildPublicFileUrl = (req: Request, relativePath: string): string => {
  const backendUrl = process.env.BACKEND_URL;

  if (backendUrl) {
    return `${backendUrl.replace(/\/$/, "")}${relativePath}`;
  }

  return `${req.protocol}://${req.get("host")}${relativePath}`;
};

export const uploadMedia = (req: MulterRequest, res: Response): void => {
  if (!req.file) {
    res.status(400).json({ message: "No file uploaded" });
    return;
  }

  const mediaFolder = req.file.mimetype.startsWith("video/") ? "videos" : "images";
  const publicPath = `/uploads/${mediaFolder}/${req.file.filename}`;

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
