import { Router } from "express";

import authController from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { profileImageUpload } from "../middlewares/upload.middleware";

const router = Router();

router.post("/register", authController.register.bind(authController));
router.post("/verify-registration-otp", authController.verifyRegistrationOTP.bind(authController));
router.post("/resend-registration-otp", authController.resendRegistrationOTP.bind(authController));
router.post("/login", authController.login.bind(authController));
router.post("/firebase-register", authController.firebaseRegister.bind(authController));
router.post("/firebase-login", authController.firebaseLogin.bind(authController));
router.post("/forgot-password", authController.forgotPassword.bind(authController));
router.post("/verify-otp", authController.verifyOTP.bind(authController));
router.post("/reset-password", authController.resetPassword.bind(authController));

router.get("/account-settings", authenticate, authController.getAccountSettings.bind(authController));
router.put("/account-settings", authenticate, profileImageUpload, authController.updateAccountSettings.bind(authController));
router.post("/account-settings/change-password", authenticate, authController.changeAccountPassword.bind(authController));
router.post("/change-password", authenticate, authController.changePassword.bind(authController));
router.get("/profile", authenticate, authController.getProfile.bind(authController));
router.put("/profile", authenticate, profileImageUpload, authController.updateProfile.bind(authController));

export default router;
