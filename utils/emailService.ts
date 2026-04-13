class EmailService {
  async sendRegistrationOTP(_email: string, _otp: string, _fullName: string): Promise<boolean> {
    return false;
  }

  async sendPasswordResetOTP(_email: string, _otp: string): Promise<boolean> {
    return false;
  }
}

const emailService = new EmailService();

export default emailService;
