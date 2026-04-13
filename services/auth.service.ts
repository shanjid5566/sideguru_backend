import bcrypt from "bcryptjs";
import crypto from "node:crypto";

import { prisma as prismaClient } from "../lib/prisma";
import { verifyFirebaseIdToken } from "../config/firebase";
import { generateToken } from "../utils/jwtUtils";
import otpStore from "../utils/otpStore";
import emailService from "../utils/emailService";

const prisma: any = prismaClient;

type RegisterInput = {
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  countryName: string;
  regionName: string;
};

type UpdateProfileInput = {
  fullName?: string;
  phoneNumber?: string;
  countryId?: string;
  regionId?: string;
};

type UploadedFile = {
  path: string;
};

const ABSOLUTE_URL_PATTERN = /^https?:\/\//i;

const toPublicUploadPath = (filePath: string): string => {
  const normalized = filePath.replace(/\\/g, "/");
  const uploadsIndex = normalized.indexOf("uploads/");

  if (uploadsIndex === -1) {
    return normalized.startsWith("/") ? normalized : `/${normalized}`;
  }

  return `/${normalized.slice(uploadsIndex)}`;
};

const toAbsoluteMediaUrl = (baseUrl: string | null, mediaPath: string | null): string | null => {
  if (!mediaPath) {
    return mediaPath;
  }

  if (ABSOLUTE_URL_PATTERN.test(mediaPath)) {
    return mediaPath;
  }

  if (!baseUrl) {
    return mediaPath;
  }

  const normalizedPath = mediaPath.startsWith("/") ? mediaPath : `/${mediaPath}`;
  return `${baseUrl}${normalizedPath}`;
};

const serializeUserProfile = (baseUrl: string | null, user: any): any => {
  if (!user) {
    return user;
  }

  return {
    ...user,
    profileImage: toAbsoluteMediaUrl(baseUrl, user.profileImage ?? null),
    countryName: user.country?.name || null,
    regionName: user.region?.name || null,
    locationName: user.region?.name || null,
  };
};

class AuthService {
  async getVerifiedFirebaseUser(idToken: string): Promise<{ email: string; fullName: string; profileImage: string | null }> {
    const decodedToken = await verifyFirebaseIdToken(idToken);
    const email = decodedToken.email?.toLowerCase();

    if (!email) {
      throw new Error("Firebase token does not contain an email address");
    }

    if (!decodedToken.email_verified) {
      throw new Error("Firebase email is not verified");
    }

    const fallbackName = email.split("@")[0] || "User";

    return {
      email,
      fullName: decodedToken.name?.trim() || fallbackName,
      profileImage: decodedToken.picture || null,
    };
  }

  async createFirebaseUser(input: { email: string; fullName: string; profileImage: string | null }) {
    const randomPassword = crypto.randomBytes(32).toString("hex");
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    return prisma.user.create({
      data: {
        fullName: input.fullName,
        email: input.email,
        password: hashedPassword,
        profileImage: input.profileImage,
        role: "USER",
        isEmailVerified: true,
      },
    });
  }

  buildAuthResponse(user: any, message: string) {
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const { password: _password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
      message,
    };
  }

  async register(userData: RegisterInput) {
    const { fullName, email, password, phoneNumber, countryName, regionName } = userData;

    const existingUser = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        deletedAt: null,
      },
    });

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const country = await prisma.country.findUnique({
      where: { name: countryName },
    });

    if (!country) {
      throw new Error(`Country '${countryName}' not found`);
    }

    const region = await prisma.region.findFirst({
      where: {
        name: regionName,
        countryId: country.id,
      },
    });

    if (!region) {
      throw new Error(`Region '${regionName}' not found in ${countryName}`);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        fullName,
        email: email.toLowerCase(),
        password: hashedPassword,
        phoneNumber: phoneNumber || null,
        countryId: country.id,
        regionId: region.id,
        role: "USER",
        isEmailVerified: false,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        role: true,
        profileImage: true,
        isEmailVerified: true,
        createdAt: true,
        country: {
          select: { id: true, name: true },
        },
        region: {
          select: { id: true, name: true, countryId: true },
        },
      },
    });

    const otp = Math.floor(10000 + Math.random() * 90000).toString();
    const expiresInMinutes = Number.parseInt(process.env.OTP_EXPIRES_IN_MINUTES || "15", 10);
    otpStore.store(email.toLowerCase(), otp, expiresInMinutes);

    const emailSent = await emailService.sendRegistrationOTP(email, otp, fullName);

    return {
      user: serializeUserProfile(null, user),
      message: emailSent
        ? "Registration successful. Please check your email for the verification code."
        : "Registration successful. Please verify your email with the OTP. (Email service temporarily unavailable)",
    };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        deletedAt: null,
      },
    });

    if (!user) {
      throw new Error("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    if (!user.isEmailVerified) {
      throw new Error("Please verify your email before logging in. Check your email for the OTP.");
    }

    return this.buildAuthResponse(user, "Login successful");
  }

  async firebaseRegister(idToken: string) {
    const { email, fullName, profileImage } = await this.getVerifiedFirebaseUser(idToken);

    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        deletedAt: null,
      },
    });

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const user = await this.createFirebaseUser({ email, fullName, profileImage });

    return this.buildAuthResponse(user, "Firebase registration successful");
  }

  async firebaseLogin(idToken: string) {
    const { email } = await this.getVerifiedFirebaseUser(idToken);

    const user = await prisma.user.findFirst({
      where: {
        email,
        deletedAt: null,
      },
    });

    if (!user) {
      throw new Error("No account found for this email. Please register first.");
    }

    return this.buildAuthResponse(user, "Firebase login successful");
  }

  async forgotPassword(email: string) {
    const user = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        deletedAt: null,
      },
    });

    if (!user) {
      return { message: "If the email exists, a reset code has been sent" };
    }

    const otp = Math.floor(10000 + Math.random() * 90000).toString();
    const expiresInMinutes = Number.parseInt(process.env.OTP_EXPIRES_IN_MINUTES || "15", 10);
    otpStore.store(email.toLowerCase(), otp, expiresInMinutes);

    await emailService.sendPasswordResetOTP(email, otp);

    return { message: "If the email exists, a reset code has been sent" };
  }

  async verifyOTP(email: string, otp: string) {
    const isValid = otpStore.verify(email.toLowerCase(), otp);

    if (!isValid) {
      throw new Error("Invalid or expired OTP");
    }

    return {
      message: "OTP verified successfully",
      email: email.toLowerCase(),
    };
  }

  async verifyRegistrationOTP(email: string, otp: string) {
    const isValid = otpStore.verify(email.toLowerCase(), otp);

    if (!isValid) {
      throw new Error("Invalid or expired OTP");
    }

    const user = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        deletedAt: null,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (user.isEmailVerified) {
      throw new Error("Email already verified");
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { isEmailVerified: true },
    });

    otpStore.remove(email.toLowerCase());

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const { password: _password, ...userWithoutPassword } = user;

    return {
      user: { ...userWithoutPassword, isEmailVerified: true },
      token,
      message: "Email verified successfully. You can now log in.",
    };
  }

  async resendRegistrationOTP(email: string) {
    const user = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        deletedAt: null,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (user.isEmailVerified) {
      throw new Error("Email already verified");
    }

    const otp = Math.floor(10000 + Math.random() * 90000).toString();
    const expiresInMinutes = Number.parseInt(process.env.OTP_EXPIRES_IN_MINUTES || "15", 10);
    otpStore.store(email.toLowerCase(), otp, expiresInMinutes);

    const emailSent = await emailService.sendRegistrationOTP(email, otp, user.fullName);

    return {
      message: emailSent ? "OTP sent successfully. Please check your email." : "OTP generated. (Email service temporarily unavailable)",
    };
  }

  async resetPassword(email: string, otp: string, newPassword: string) {
    const isValid = otpStore.verify(email.toLowerCase(), otp);

    if (!isValid) {
      throw new Error("Invalid or expired OTP");
    }

    const user = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        deletedAt: null,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    otpStore.remove(email.toLowerCase());

    return { message: "Password reset successful" };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      throw new Error("Current password is incorrect");
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);

    if (isSamePassword) {
      throw new Error("New password must be different from current password");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: "Password changed successfully" };
  }

  async getProfile(userId: string, baseUrl: string | null) {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        profileImage: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        countryId: true,
        regionId: true,
        country: { select: { id: true, name: true } },
        region: { select: { id: true, name: true, countryId: true } },
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return serializeUserProfile(baseUrl, user);
  }

  async updateProfile(userId: string, updateData: UpdateProfileInput, file: UploadedFile | undefined, baseUrl: string | null) {
    const { fullName, phoneNumber, countryId, regionId } = updateData;

    const existingUser = await prisma.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
      },
      select: {
        id: true,
        countryId: true,
        regionId: true,
      },
    });

    if (!existingUser) {
      throw new Error("User not found");
    }

    const normalizedFullName = fullName?.trim();
    const normalizedPhoneNumber = phoneNumber === undefined ? undefined : phoneNumber.trim() || null;
    const normalizedCountryId = countryId === undefined ? existingUser.countryId : countryId || null;
    const normalizedRegionId = regionId === undefined ? existingUser.regionId : regionId || null;

    if (fullName !== undefined && !normalizedFullName) {
      throw new Error("Full name cannot be empty");
    }

    if ((regionId !== undefined || countryId !== undefined) && normalizedRegionId && !normalizedCountryId) {
      throw new Error("countryId is required when regionId is provided");
    }

    if (normalizedCountryId) {
      const country = await prisma.country.findUnique({ where: { id: normalizedCountryId } });

      if (!country) {
        throw new Error("Invalid country");
      }
    }

    if (normalizedRegionId) {
      const region = await prisma.region.findFirst({
        where: {
          id: normalizedRegionId,
          ...(normalizedCountryId ? { countryId: normalizedCountryId } : {}),
        },
      });

      if (!region) {
        throw new Error("Invalid region for the selected country");
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(fullName !== undefined ? { fullName: normalizedFullName } : {}),
        ...(phoneNumber !== undefined ? { phoneNumber: normalizedPhoneNumber } : {}),
        ...(countryId !== undefined ? { countryId: normalizedCountryId } : {}),
        ...(regionId !== undefined ? { regionId: normalizedRegionId } : {}),
        ...(file ? { profileImage: toPublicUploadPath(file.path) } : {}),
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        profileImage: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        countryId: true,
        regionId: true,
        country: { select: { id: true, name: true } },
        region: { select: { id: true, name: true, countryId: true } },
      },
    });

    return serializeUserProfile(baseUrl, user);
  }
}

const authService = new AuthService();

export default authService;
