import type { NextFunction, Request, Response } from "express";

import supportService from "../services/support.service";

class SupportController {
  async submitContactMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await supportService.submitContactMessage(req.body as { name?: string; email?: string; message?: string });

      res.status(result.statusCode).json({
        success: true,
        message: result.message,
        data: result.data,
      });
    } catch (error) {
      next(error);
    }
  }
}

const supportController = new SupportController();

export default supportController;
