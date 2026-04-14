"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
class EmailService {
    transporter = null;
    constructor() {
        this.initializeTransporter();
    }
    initializeTransporter() {
        try {
            this.transporter = nodemailer_1.default.createTransport({
                host: process.env.SMTP_HOST || "smtp.gmail.com",
                port: Number.parseInt(process.env.SMTP_PORT || "587", 10),
                secure: process.env.SMTP_SECURE === "true",
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASSWORD,
                },
            });
            this.transporter.verify((error) => {
                if (error) {
                    console.error("Email service configuration error:", error.message);
                }
                else {
                    console.log("Email service is ready to send emails");
                }
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Unknown error";
            console.error("Failed to initialize email service:", message);
            this.transporter = null;
        }
    }
    async sendRegistrationOTP(email, otp, fullName = "User") {
        try {
            if (!this.transporter) {
                return false;
            }
            const mailOptions = {
                from: `"SideGurus" <${process.env.EMAIL_FROM || process.env.SMTP_USER || "no-reply@sidegurus.com"}>`,
                to: email,
                subject: "Verify Your Email - SideGurus",
                html: `<p>Hello ${fullName},</p><p>Your verification code is <strong>${otp}</strong>.</p><p>This code expires in 15 minutes.</p>`,
                text: `Hello ${fullName},\n\nYour verification code is: ${otp}\n\nThis code expires in 15 minutes.`,
            };
            const info = await this.transporter.sendMail(mailOptions);
            console.log(`Registration OTP email sent to ${email} (Message ID: ${info.messageId})`);
            return true;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Unknown error";
            console.error(`Failed to send registration OTP email to ${email}:`, message);
            return false;
        }
    }
    async sendPasswordResetOTP(email, otp) {
        try {
            if (!this.transporter) {
                return false;
            }
            const mailOptions = {
                from: `"SideGurus" <${process.env.EMAIL_FROM || process.env.SMTP_USER || "no-reply@sidegurus.com"}>`,
                to: email,
                subject: "Password Reset Code - SideGurus",
                html: `<p>Password reset requested.</p><p>Your reset code is <strong>${otp}</strong>.</p><p>This code expires in 15 minutes.</p>`,
                text: `Password reset requested.\n\nYour reset code is: ${otp}\n\nThis code expires in 15 minutes.`,
            };
            const info = await this.transporter.sendMail(mailOptions);
            console.log(`Password reset OTP email sent to ${email} (Message ID: ${info.messageId})`);
            return true;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Unknown error";
            console.error(`Failed to send password reset OTP email to ${email}:`, message);
            return false;
        }
    }
    async sendContactMessage({ toEmail, senderName, senderEmail, message }) {
        try {
            if (!this.transporter) {
                return false;
            }
            const mailOptions = {
                from: `"SideGurus Contact Form" <${process.env.EMAIL_FROM || process.env.SMTP_USER || "no-reply@sidegurus.com"}>`,
                to: toEmail,
                replyTo: senderEmail,
                subject: `New Contact Message from ${senderName}`,
                html: `<p><strong>Name:</strong> ${senderName}</p><p><strong>Email:</strong> ${senderEmail}</p><p><strong>Message:</strong></p><p>${message}</p>`,
                text: `New Contact Message\n\nName: ${senderName}\nEmail: ${senderEmail}\n\nMessage:\n${message}`,
            };
            const info = await this.transporter.sendMail(mailOptions);
            console.log(`Contact message email sent to ${toEmail} (Message ID: ${info.messageId})`);
            return true;
        }
        catch (error) {
            const errMessage = error instanceof Error ? error.message : "Unknown error";
            console.error(`Failed to send contact message email to ${toEmail}:`, errMessage);
            return false;
        }
    }
}
const emailService = new EmailService();
exports.default = emailService;
