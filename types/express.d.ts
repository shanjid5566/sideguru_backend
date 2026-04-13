import type { Multer } from "multer";

declare global {
  namespace Express {
    interface UserPayload {
      userId: string;
      email: string;
      role: string;
    }

    interface Request {
      user?: UserPayload;
      file?: Multer.File;
    }
  }
}

export {};
