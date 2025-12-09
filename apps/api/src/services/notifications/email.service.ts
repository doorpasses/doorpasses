import nodemailer, { Transporter } from 'nodemailer';
import logger from '../../config/logger';

/**
 * Email Notification Service
 * Handles sending email notifications for access pass operations
 */
export class EmailService {
  private transporter: Transporter | null = null;
  private isConfigured: boolean = false;

  constructor() {
    this.initialize();
  }

  /**
   * Initialize email transporter
   */
  private initialize(): void {
    try {
      const smtpHost = process.env.SMTP_HOST;
      const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASS;

      if (!smtpHost || !smtpUser || !smtpPass) {
        logger.warn('Email service not configured. Email notifications will be disabled.');
        return;
      }

      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465, // true for 465, false for other ports
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      this.isConfigured = true;
      logger.info('Email service initialized successfully');
    } catch (error) {
      logger.error({ error }, 'Failed to initialize email service');
      this.isConfigured = false;
    }
  }

  /**
   * Send access pass issued notification
   */
  async sendAccessPassIssued(
    email: string,
    data: {
      fullName: string;
      accessPassId: string;
      installUrl: string;
      startDate: string;
      expirationDate: string;
      language?: string;
    }
  ): Promise<boolean> {
    if (!this.isConfigured || !this.transporter) {
      logger.warn('Email service not configured. Skipping email notification.');
      return false;
    }

    try {
      const language = data.language || 'en';
      // TODO: Use i18next for translations when email templates are ready
      // const t = i18next.getFixedT(language);

      const subject = language === 'ar'
        ? 'تم إصدار تصريح الوصول الخاص بك'
        : 'Your Access Pass Has Been Issued';

      const html = this.generateAccessPassIssuedTemplate(data, language);

      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@doorpasses.com',
        to: email,
        subject: subject,
        html: html,
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Access pass issued email sent to ${email}`);
      return true;
    } catch (error) {
      logger.error({ error }, `Failed to send access pass issued email to ${email}`);
      return false;
    }
  }

  /**
   * Send access pass suspended notification
   */
  async sendAccessPassSuspended(
    email: string,
    data: {
      fullName: string;
      accessPassId: string;
      reason?: string;
      language?: string;
    }
  ): Promise<boolean> {
    if (!this.isConfigured || !this.transporter) {
      logger.warn('Email service not configured. Skipping email notification.');
      return false;
    }

    try {
      const language = data.language || 'en';

      const subject = language === 'ar'
        ? 'تم تعليق تصريح الوصول الخاص بك'
        : 'Your Access Pass Has Been Suspended';

      const html = this.generateAccessPassSuspendedTemplate(data, language);

      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@doorpasses.com',
        to: email,
        subject: subject,
        html: html,
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Access pass suspended email sent to ${email}`);
      return true;
    } catch (error) {
      logger.error({ error }, `Failed to send access pass suspended email to ${email}`);
      return false;
    }
  }

  /**
   * Send access pass resumed notification
   */
  async sendAccessPassResumed(
    email: string,
    data: {
      fullName: string;
      accessPassId: string;
      language?: string;
    }
  ): Promise<boolean> {
    if (!this.isConfigured || !this.transporter) {
      logger.warn('Email service not configured. Skipping email notification.');
      return false;
    }

    try {
      const language = data.language || 'en';

      const subject = language === 'ar'
        ? 'تم استئناف تصريح الوصول الخاص بك'
        : 'Your Access Pass Has Been Resumed';

      const html = this.generateAccessPassResumedTemplate(data, language);

      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@doorpasses.com',
        to: email,
        subject: subject,
        html: html,
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Access pass resumed email sent to ${email}`);
      return true;
    } catch (error) {
      logger.error({ error }, `Failed to send access pass resumed email to ${email}`);
      return false;
    }
  }

  /**
   * Send access pass expiring soon notification
   */
  async sendAccessPassExpiringSoon(
    email: string,
    data: {
      fullName: string;
      accessPassId: string;
      expirationDate: string;
      daysUntilExpiration: number;
      language?: string;
    }
  ): Promise<boolean> {
    if (!this.isConfigured || !this.transporter) {
      logger.warn('Email service not configured. Skipping email notification.');
      return false;
    }

    try {
      const language = data.language || 'en';

      const subject = language === 'ar'
        ? `تصريح الوصول الخاص بك سينتهي قريباً - ${data.daysUntilExpiration} أيام متبقية`
        : `Your Access Pass Expires Soon - ${data.daysUntilExpiration} Days Remaining`;

      const html = this.generateAccessPassExpiringSoonTemplate(data, language);

      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@doorpasses.com',
        to: email,
        subject: subject,
        html: html,
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Access pass expiring soon email sent to ${email}`);
      return true;
    } catch (error) {
      logger.error({ error }, `Failed to send access pass expiring soon email to ${email}`);
      return false;
    }
  }

  /**
   * Generate HTML template for access pass issued
   */
  private generateAccessPassIssuedTemplate(data: any, language: string): string {
    if (language === 'ar') {
      return `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .button { display: inline-block; padding: 12px 24px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>وصول - DoorPasses</h1>
            </div>
            <div class="content">
              <h2>مرحباً ${data.fullName}،</h2>
              <p>تم إصدار تصريح الوصول الرقمي الخاص بك بنجاح!</p>
              <p><strong>معرف التصريح:</strong> ${data.accessPassId}</p>
              <p><strong>صالح من:</strong> ${data.startDate}</p>
              <p><strong>ينتهي في:</strong> ${data.expirationDate}</p>
              <p>أضف التصريح إلى محفظتك الرقمية:</p>
              <a href="${data.installUrl}" class="button">إضافة إلى المحفظة</a>
              <p>إذا كان لديك أي أسئلة، يرجى الاتصال بفريق الدعم لدينا.</p>
            </div>
            <div class="footer">
              <p>© 2025 DoorPasses. جميع الحقوق محفوظة.</p>
              <p>هذا بريد إلكتروني تلقائي، يرجى عدم الرد عليه.</p>
            </div>
          </div>
        </body>
        </html>
      `;
    } else {
      return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .button { display: inline-block; padding: 12px 24px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>DoorPasses - وصول</h1>
            </div>
            <div class="content">
              <h2>Hello ${data.fullName},</h2>
              <p>Your digital access pass has been issued successfully!</p>
              <p><strong>Pass ID:</strong> ${data.accessPassId}</p>
              <p><strong>Valid From:</strong> ${data.startDate}</p>
              <p><strong>Expires:</strong> ${data.expirationDate}</p>
              <p>Add the pass to your digital wallet:</p>
              <a href="${data.installUrl}" class="button">Add to Wallet</a>
              <p>If you have any questions, please contact our support team.</p>
            </div>
            <div class="footer">
              <p>© 2025 DoorPasses. All rights reserved.</p>
              <p>This is an automated email, please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `;
    }
  }

  /**
   * Generate HTML template for access pass suspended
   */
  private generateAccessPassSuspendedTemplate(data: any, language: string): string {
    if (language === 'ar') {
      return `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f44336; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>وصول - DoorPasses</h1>
            </div>
            <div class="content">
              <h2>مرحباً ${data.fullName}،</h2>
              <p>تم تعليق تصريح الوصول الخاص بك.</p>
              <p><strong>معرف التصريح:</strong> ${data.accessPassId}</p>
              ${data.reason ? `<p><strong>السبب:</strong> ${data.reason}</p>` : ''}
              <p>لن تتمكن من استخدام هذا التصريح حتى يتم استئنافه.</p>
              <p>للمزيد من المعلومات، يرجى الاتصال بفريق الدعم.</p>
            </div>
            <div class="footer">
              <p>© 2025 DoorPasses. جميع الحقوق محفوظة.</p>
            </div>
          </div>
        </body>
        </html>
      `;
    } else {
      return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f44336; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>DoorPasses - وصول</h1>
            </div>
            <div class="content">
              <h2>Hello ${data.fullName},</h2>
              <p>Your access pass has been suspended.</p>
              <p><strong>Pass ID:</strong> ${data.accessPassId}</p>
              ${data.reason ? `<p><strong>Reason:</strong> ${data.reason}</p>` : ''}
              <p>You will not be able to use this pass until it is resumed.</p>
              <p>For more information, please contact our support team.</p>
            </div>
            <div class="footer">
              <p>© 2025 DoorPasses. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;
    }
  }

  /**
   * Generate HTML template for access pass resumed
   */
  private generateAccessPassResumedTemplate(data: any, language: string): string {
    if (language === 'ar') {
      return `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>وصول - DoorPasses</h1>
            </div>
            <div class="content">
              <h2>مرحباً ${data.fullName}،</h2>
              <p>تم استئناف تصريح الوصول الخاص بك.</p>
              <p><strong>معرف التصريح:</strong> ${data.accessPassId}</p>
              <p>يمكنك الآن استخدام التصريح مرة أخرى.</p>
            </div>
            <div class="footer">
              <p>© 2025 DoorPasses. جميع الحقوق محفوظة.</p>
            </div>
          </div>
        </body>
        </html>
      `;
    } else {
      return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>DoorPasses</h1>
            </div>
            <div class="content">
              <h2>Hello ${data.fullName},</h2>
              <p>Your access pass has been resumed.</p>
              <p><strong>Pass ID:</strong> ${data.accessPassId}</p>
              <p>You can now use your pass again.</p>
            </div>
            <div class="footer">
              <p>© 2025 DoorPasses. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;
    }
  }

  /**
   * Generate HTML template for access pass expiring soon
   */
  private generateAccessPassExpiringSoonTemplate(data: any, language: string): string {
    if (language === 'ar') {
      return `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #FF9800; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>DoorPasses</h1>
            </div>
            <div class="content">
              <h2>مرحباً ${data.fullName}،</h2>
              <p>تصريح الوصول الخاص بك سينتهي قريباً.</p>
              <p><strong>معرف التصريح:</strong> ${data.accessPassId}</p>
              <p><strong>ينتهي في:</strong> ${data.expirationDate}</p>
              <p><strong>أيام متبقية:</strong> ${data.daysUntilExpiration}</p>
              <p>يرجى الاتصال بالإدارة لتجديد تصريحك إذا لزم الأمر.</p>
            </div>
            <div class="footer">
              <p>© 2025 DoorPasses. جميع الحقوق محفوظة.</p>
            </div>
          </div>
        </body>
        </html>
      `;
    } else {
      return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #FF9800; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>DoorPasses</h1>
            </div>
            <div class="content">
              <h2>Hello ${data.fullName},</h2>
              <p>Your access pass will expire soon.</p>
              <p><strong>Pass ID:</strong> ${data.accessPassId}</p>
              <p><strong>Expires:</strong> ${data.expirationDate}</p>
              <p><strong>Days Remaining:</strong> ${data.daysUntilExpiration}</p>
              <p>Please contact administration to renew your pass if needed.</p>
            </div>
            <div class="footer">
              <p>© 2025 DoorPasses. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;
    }
  }
}

export default new EmailService();
