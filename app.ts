import express, { type Request, type Response } from "express";

const app = express();

app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "SideGuru backend is running" });
});

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

export default app;