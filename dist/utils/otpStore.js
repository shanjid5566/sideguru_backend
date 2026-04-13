"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class OtpStore {
    records = new Map();
    store(email, otp, expiresInMinutes) {
        this.records.set(email, {
            otp,
            expiresAt: Date.now() + expiresInMinutes * 60 * 1000,
        });
    }
    verify(email, otp) {
        const record = this.records.get(email);
        if (!record) {
            return false;
        }
        if (Date.now() > record.expiresAt) {
            this.records.delete(email);
            return false;
        }
        return record.otp === otp;
    }
    remove(email) {
        this.records.delete(email);
    }
}
const otpStore = new OtpStore();
exports.default = otpStore;
