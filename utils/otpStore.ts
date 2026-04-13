type OtpRecord = {
  otp: string;
  expiresAt: number;
};

class OtpStore {
  private readonly records = new Map<string, OtpRecord>();

  store(email: string, otp: string, expiresInMinutes: number): void {
    this.records.set(email, {
      otp,
      expiresAt: Date.now() + expiresInMinutes * 60 * 1000,
    });
  }

  verify(email: string, otp: string): boolean {
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

  remove(email: string): void {
    this.records.delete(email);
  }
}

const otpStore = new OtpStore();

export default otpStore;
