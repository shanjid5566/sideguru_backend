"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class EmailService {
    async sendRegistrationOTP(_email, _otp, _fullName) {
        return false;
    }
    async sendPasswordResetOTP(_email, _otp) {
        return false;
    }
    async sendContactMessage(_input) {
        return false;
    }
}
const emailService = new EmailService();
exports.default = emailService;
