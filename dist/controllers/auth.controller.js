"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_service_1 = __importDefault(require("../services/auth.service"));
const getBaseUrl = (req) => {
    if (process.env.BACKEND_URL) {
        return process.env.BACKEND_URL.replace(/\/$/, "");
    }
    return `${req.protocol}://${req.get("host")}`;
};
class AuthController {
    async register(req, res, next) {
        try {
            const { fullName, email, password, confirmPassword, phoneNumber, countryName, regionName } = req.body;
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
            const result = await auth_service_1.default.register({
                fullName,
                email,
                password,
                phoneNumber,
                countryName,
                regionName,
            });
            res.status(201).json({ success: true, ...result });
        }
        catch (error) {
            next(error);
        }
    }
    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                res.status(400).json({ success: false, error: "Email and password are required" });
                return;
            }
            const result = await auth_service_1.default.login(email, password);
            res.status(200).json({ success: true, ...result });
        }
        catch (error) {
            next(error);
        }
    }
    async firebaseRegister(req, res, next) {
        try {
            const { idToken } = req.body;
            if (!idToken) {
                res.status(400).json({ success: false, error: "idToken is required" });
                return;
            }
            const result = await auth_service_1.default.firebaseRegister(idToken);
            res.status(201).json({ success: true, ...result });
        }
        catch (error) {
            next(error);
        }
    }
    async firebaseLogin(req, res, next) {
        try {
            const { idToken } = req.body;
            if (!idToken) {
                res.status(400).json({ success: false, error: "idToken is required" });
                return;
            }
            const result = await auth_service_1.default.firebaseLogin(idToken);
            res.status(200).json({ success: true, ...result });
        }
        catch (error) {
            next(error);
        }
    }
    async forgotPassword(req, res, next) {
        try {
            const { email } = req.body;
            if (!email) {
                res.status(400).json({ success: false, error: "Email is required" });
                return;
            }
            const result = await auth_service_1.default.forgotPassword(email);
            res.status(200).json({ success: true, ...result });
        }
        catch (error) {
            next(error);
        }
    }
    async verifyOTP(req, res, next) {
        try {
            const { email, otp } = req.body;
            if (!email || !otp) {
                res.status(400).json({ success: false, error: "Email and OTP are required" });
                return;
            }
            const result = await auth_service_1.default.verifyOTP(email, otp);
            res.status(200).json({ success: true, ...result });
        }
        catch (error) {
            next(error);
        }
    }
    async verifyRegistrationOTP(req, res, next) {
        try {
            const { email, otp } = req.body;
            if (!email || !otp) {
                res.status(400).json({ success: false, error: "Email and OTP are required" });
                return;
            }
            const result = await auth_service_1.default.verifyRegistrationOTP(email, otp);
            res.status(200).json({ success: true, ...result });
        }
        catch (error) {
            next(error);
        }
    }
    async resendRegistrationOTP(req, res, next) {
        try {
            const { email } = req.body;
            if (!email) {
                res.status(400).json({ success: false, error: "Email is required" });
                return;
            }
            const result = await auth_service_1.default.resendRegistrationOTP(email);
            res.status(200).json({ success: true, ...result });
        }
        catch (error) {
            next(error);
        }
    }
    async resetPassword(req, res, next) {
        try {
            const { email, otp, password, confirmPassword } = req.body;
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
            const result = await auth_service_1.default.resetPassword(email, otp, password);
            res.status(200).json({ success: true, ...result });
        }
        catch (error) {
            next(error);
        }
    }
    async changePassword(req, res, next) {
        try {
            const { currentPassword, newPassword, confirmPassword } = req.body;
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
            const result = await auth_service_1.default.changePassword(userId, currentPassword, newPassword);
            res.status(200).json({ success: true, ...result });
        }
        catch (error) {
            next(error);
        }
    }
    async getProfile(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ success: false, error: "Unauthorized" });
                return;
            }
            const user = await auth_service_1.default.getProfile(userId, getBaseUrl(req));
            res.status(200).json({ success: true, data: user });
        }
        catch (error) {
            next(error);
        }
    }
    async updateProfile(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ success: false, error: "Unauthorized" });
                return;
            }
            const user = await auth_service_1.default.updateProfile(userId, req.body, req.file, getBaseUrl(req));
            res.status(200).json({
                success: true,
                data: user,
                message: "Profile updated successfully",
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getAccountSettings(req, res, next) {
        return this.getProfile(req, res, next);
    }
    async updateAccountSettings(req, res, next) {
        return this.updateProfile(req, res, next);
    }
    async changeAccountPassword(req, res, next) {
        return this.changePassword(req, res, next);
    }
}
const authController = new AuthController();
exports.default = authController;
