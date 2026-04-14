"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../lib/prisma");
const emailService_1 = __importDefault(require("../utils/emailService"));
const httpError_1 = require("../utils/httpError");
const prisma = prisma_1.prisma;
const CONTACT_RECEIVER_EMAIL = process.env.CONTACT_RECEIVER_EMAIL || "shanjid.maktech@gmail.com";
class SupportService {
    async submitContactMessage({ name, email, message }) {
        const normalizedName = name?.trim();
        const normalizedEmail = email?.trim().toLowerCase();
        const normalizedMessage = message?.trim();
        if (!normalizedName || !normalizedEmail || !normalizedMessage) {
            throw (0, httpError_1.createHttpError)(400, "name, email, and message are required");
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(normalizedEmail)) {
            throw (0, httpError_1.createHttpError)(400, "Invalid email format");
        }
        const ticket = await prisma.supportTicket.create({
            data: {
                name: normalizedName,
                email: normalizedEmail,
                message: normalizedMessage,
            },
            select: {
                id: true,
                name: true,
                email: true,
                message: true,
                createdAt: true,
            },
        });
        const emailSent = await emailService_1.default.sendContactMessage({
            toEmail: CONTACT_RECEIVER_EMAIL,
            senderName: normalizedName,
            senderEmail: normalizedEmail,
            message: normalizedMessage,
        });
        return {
            statusCode: 201,
            message: emailSent
                ? "Message sent successfully"
                : "Message saved, but email delivery is temporarily unavailable",
            data: ticket,
        };
    }
}
const supportService = new SupportService();
exports.default = supportService;
