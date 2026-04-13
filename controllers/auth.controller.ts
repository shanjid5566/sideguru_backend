import type { NextFunction, Request, Response } from "express";

import authService from "../services/auth.service";

const getBaseUrl = (req: Request): string => {
  if (process.env.BACKEND_URL) {
    return process.env.BACKEND_URL.replace(/\/$/, "");
  }

  return `${req.protocol}://${req.get("host")}`;
};

class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { fullName, email, password, confirmPassword, phoneNumber, countryName, regionName } = req.body as {
        fullName?: string;
        email?: string;
        password?: string;
        confirmPassword?: string;
        phoneNumber?: string;
        countryName?: string;
        regionName?: string;
      };

      if (!fullName || !email || !password || !confirmPassword || !countryName || !regionName) {
        res.status(400).json({
          success: false,
          error: "Full name, email, password, confirm password, country, and region are required",
        });
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({ success: false, error: "Invalid email format" });
        return;
      }

      if (password !== confirmPassword) {
        res.status(400).json({ success: false, error: "Passwords do not match" });
        return;
      }

      if (password.length < 8) {
        res.status(400).json({ success: false, error: "Password must be at least 8 characters long" });
        return;
      }

      const result = await authService.register({
        fullName,
        email,
        password,
        phoneNumber,
        countryName,
        regionName,
      });

      res.status(201).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body as { email?: string; password?: string };

      if (!email || !password) {
        res.status(400).json({ success: false, error: "Email and password are required" });
        return;
      }

      const result = await authService.login(email, password);

      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async firebaseRegister(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { idToken } = req.body as { idToken?: string };

      if (!idToken) {
        res.status(400).json({ success: false, error: "idToken is required" });
        return;
      }

      const result = await authService.firebaseRegister(idToken);

      res.status(201).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async firebaseLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { idToken } = req.body as { idToken?: string };

      if (!idToken) {
        res.status(400).json({ success: false, error: "idToken is required" });
        return;
      }

      const result = await authService.firebaseLogin(idToken);

      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body as { email?: string };

      if (!email) {
        res.status(400).json({ success: false, error: "Email is required" });
        return;
      }

      const result = await authService.forgotPassword(email);

      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async verifyOTP(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, otp } = req.body as { email?: string; otp?: string };

      if (!email || !otp) {
        res.status(400).json({ success: false, error: "Email and OTP are required" });
        return;
      }

      const result = await authService.verifyOTP(email, otp);

      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async verifyRegistrationOTP(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, otp } = req.body as { email?: string; otp?: string };

      if (!email || !otp) {
        res.status(400).json({ success: false, error: "Email and OTP are required" });
        return;
      }

      const result = await authService.verifyRegistrationOTP(email, otp);

      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async resendRegistrationOTP(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body as { email?: string };

      if (!email) {
        res.status(400).json({ success: false, error: "Email is required" });
        return;
      }

      const result = await authService.resendRegistrationOTP(email);

      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, otp, password, confirmPassword } = req.body as {
        email?: string;
        otp?: string;
        password?: string;
        confirmPassword?: string;
      };

      if (!email || !otp || !password || !confirmPassword) {
        res.status(400).json({
          success: false,
          error: "Email, OTP, password, and confirm password are required",
        });
        return;
      }

      if (password !== confirmPassword) {
        res.status(400).json({ success: false, error: "Passwords do not match" });
        return;
      }

      if (password.length < 8) {
        res.status(400).json({ success: false, error: "Password must be at least 8 characters long" });
        return;
      }

      const result = await authService.resetPassword(email, otp, password);

      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { currentPassword, newPassword, confirmPassword } = req.body as {
        currentPassword?: string;
        newPassword?: string;
        confirmPassword?: string;
      };
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ success: false, error: "Unauthorized" });
        return;
      }

      if (!currentPassword || !newPassword || !confirmPassword) {
        res.status(400).json({
          success: false,
          error: "Current password, new password, and confirm password are required",
        });
        return;
      }

      if (newPassword !== confirmPassword) {
        res.status(400).json({ success: false, error: "New passwords do not match" });
        return;
      }

      if (newPassword.length < 8) {
        res.status(400).json({ success: false, error: "New password must be at least 8 characters long" });
        return;
      }

      const result = await authService.changePassword(userId, currentPassword, newPassword);

      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ success: false, error: "Unauthorized" });
        return;
      }

      const user = await authService.getProfile(userId, getBaseUrl(req));

      res.status(200).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ success: false, error: "Unauthorized" });
        return;
      }

      const user = await authService.updateProfile(userId, req.body, req.file, getBaseUrl(req));

      res.status(200).json({
        success: true,
        data: user,
        message: "Profile updated successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async getAccountSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
    return this.getProfile(req, res, next);
  }

  async updateAccountSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
    return this.updateProfile(req, res, next);
  }

  async changeAccountPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    return this.changePassword(req, res, next);
  }
}

const authController = new AuthController();

export default authController;
