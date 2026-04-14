import { prisma as prismaClient } from "../lib/prisma";
import emailService from "../utils/emailService";
import { createHttpError } from "../utils/httpError";

const prisma: any = prismaClient;

const CONTACT_RECEIVER_EMAIL = process.env.CONTACT_RECEIVER_EMAIL || "shanjid.maktech@gmail.com";

class SupportService {
  async submitContactMessage({ name, email, message }: { name?: string; email?: string; message?: string }) {
    const normalizedName = name?.trim();
    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedMessage = message?.trim();

    if (!normalizedName || !normalizedEmail || !normalizedMessage) {
      throw createHttpError(400, "name, email, and message are required");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      throw createHttpError(400, "Invalid email format");
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

    const emailSent = await emailService.sendContactMessage({
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

export default supportService;
