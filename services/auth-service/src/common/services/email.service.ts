import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sgMail from '@sendgrid/mail';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly fromEmail: string;
  private readonly appName: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('SENDGRID_API_KEY');
    
    if (apiKey) {
      sgMail.setApiKey(apiKey);
      this.logger.log('SendGrid initialized successfully');
    } else {
      this.logger.warn('SendGrid API key not found - email sending will be disabled');
    }

    this.fromEmail = this.configService.get<string>('EMAIL_FROM', 'noreply@example.com');
    this.appName = this.configService.get<string>('APP_NAME', 'SaaS ERP System');
  }

  async sendPasswordResetEmail(to: string, resetToken: string): Promise<void> {
    const resetUrl = `${this.configService.get<string>('FRONTEND_URL', 'http://localhost:5173')}/reset-password?token=${resetToken}`;
    
    const msg = {
      to,
      from: this.fromEmail,
      subject: `${this.appName} - Đặt lại mật khẩu`,
      html: this.getPasswordResetEmailTemplate(resetUrl),
      text: `Bạn đã yêu cầu đặt lại mật khẩu.\n\nVui lòng truy cập link sau để đặt lại mật khẩu:\n${resetUrl}\n\nLink này sẽ hết hạn sau 1 giờ.\n\nNếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.`,
    };

    try {
      // Only send if API key is configured
      const apiKey = this.configService.get<string>('SENDGRID_API_KEY');
      
      if (!apiKey) {
        this.logger.warn(`Email would be sent to ${to} (SendGrid not configured)`);
        this.logger.log(`Reset link: ${resetUrl}`);
        return;
      }

      await sgMail.send(msg);
      this.logger.log(`Password reset email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${to}:`, error);
      
      // Log the reset URL in development even if email fails
      if (this.configService.get('NODE_ENV') === 'development') {
        this.logger.log(`Reset link (email failed): ${resetUrl}`);
      }
      
      throw new Error('Failed to send password reset email');
    }
  }

  private getPasswordResetEmailTemplate(resetUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Đặt lại mật khẩu</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                        ${this.appName}
                      </h1>
                    </td>
                  </tr>
                  
                  <!-- Body -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px; font-weight: 600;">
                        Đặt lại mật khẩu
                      </h2>
                      
                      <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                        Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản của mình. Nhấp vào nút bên dưới để tạo mật khẩu mới:
                      </p>
                      
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 20px 0;">
                            <a href="${resetUrl}" 
                               style="display: inline-block; padding: 14px 32px; background-color: #FB7E00; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600;">
                              Đặt lại mật khẩu
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 20px 0 0 0; color: #999999; font-size: 14px; line-height: 1.6;">
                        Hoặc sao chép và dán link sau vào trình duyệt:<br>
                        <a href="${resetUrl}" style="color: #FB7E00; word-break: break-all;">${resetUrl}</a>
                      </p>
                      
                      <div style="margin-top: 30px; padding-top: 30px; border-top: 1px solid #eeeeee;">
                        <p style="margin: 0 0 10px 0; color: #999999; font-size: 14px; line-height: 1.6;">
                          ⚠️ Link này sẽ <strong>hết hạn sau 1 giờ</strong>.
                        </p>
                        <p style="margin: 0; color: #999999; font-size: 14px; line-height: 1.6;">
                          Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này. Mật khẩu của bạn sẽ không thay đổi.
                        </p>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f8f8; padding: 20px 30px; text-align: center; border-top: 1px solid #eeeeee;">
                      <p style="margin: 0; color: #999999; font-size: 12px;">
                        © ${new Date().getFullYear()} ${this.appName}. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;
  }

  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    const msg = {
      to,
      from: this.fromEmail,
      subject: `Chào mừng đến với ${this.appName}`,
      html: `
        <h1>Xin chào ${name}!</h1>
        <p>Chào mừng bạn đến với ${this.appName}.</p>
        <p>Cảm ơn bạn đã đăng ký!</p>
      `,
      text: `Xin chào ${name}! Chào mừng bạn đến với ${this.appName}. Cảm ơn bạn đã đăng ký!`,
    };

    try {
      const apiKey = this.configService.get<string>('SENDGRID_API_KEY');
      if (!apiKey) {
        this.logger.warn(`Welcome email would be sent to ${to} (SendGrid not configured)`);
        return;
      }

      await sgMail.send(msg);
      this.logger.log(`Welcome email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${to}:`, error);
      // Don't throw - welcome email is not critical
    }
  }
}
