import twilio from 'twilio';
import logger from '../../config/logger';

/**
 * SMS Notification Service
 * Handles sending SMS notifications using Twilio
 * Supports Arabic and English messages
 */
export class SMSService {
  private client: any = null;
  private isConfigured: boolean = false;
  private fromPhoneNumber: string = '';

  constructor() {
    this.initialize();
  }

  /**
   * Initialize Twilio client
   */
  private initialize(): void {
    try {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const fromPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

      if (!accountSid || !authToken || !fromPhoneNumber) {
        logger.warn('SMS service not configured. SMS notifications will be disabled.');
        return;
      }

      this.client = twilio(accountSid, authToken);
      this.fromPhoneNumber = fromPhoneNumber;
      this.isConfigured = true;

      logger.info('SMS service initialized successfully');
    } catch (error) {
      logger.error({ error }, 'Failed to initialize SMS service');
      this.isConfigured = false;
    }
  }

  /**
   * Send access pass issued SMS
   */
  async sendAccessPassIssued(
    phoneNumber: string,
    data: {
      fullName: string;
      accessPassId: string;
      installUrl: string;
      language?: string;
    }
  ): Promise<boolean> {
    if (!this.isConfigured || !this.client) {
      logger.warn('SMS service not configured. Skipping SMS notification.');
      return false;
    }

    try {
      const language = data.language || 'en';
      const message = this.formatAccessPassIssuedMessage(data, language);

      await this.sendSMS(phoneNumber, message);
      logger.info(`Access pass issued SMS sent to ${phoneNumber}`);
      return true;
    } catch (error) {
      logger.error({ error }, `Failed to send access pass issued SMS to ${phoneNumber}`);
      return false;
    }
  }

  /**
   * Send access pass suspended SMS
   */
  async sendAccessPassSuspended(
    phoneNumber: string,
    data: {
      fullName: string;
      accessPassId: string;
      language?: string;
    }
  ): Promise<boolean> {
    if (!this.isConfigured || !this.client) {
      logger.warn('SMS service not configured. Skipping SMS notification.');
      return false;
    }

    try {
      const language = data.language || 'en';
      const message = this.formatAccessPassSuspendedMessage(data, language);

      await this.sendSMS(phoneNumber, message);
      logger.info(`Access pass suspended SMS sent to ${phoneNumber}`);
      return true;
    } catch (error) {
      logger.error({ error }, `Failed to send access pass suspended SMS to ${phoneNumber}`);
      return false;
    }
  }

  /**
   * Send access pass resumed SMS
   */
  async sendAccessPassResumed(
    phoneNumber: string,
    data: {
      fullName: string;
      accessPassId: string;
      language?: string;
    }
  ): Promise<boolean> {
    if (!this.isConfigured || !this.client) {
      logger.warn('SMS service not configured. Skipping SMS notification.');
      return false;
    }

    try {
      const language = data.language || 'en';
      const message = this.formatAccessPassResumedMessage(data, language);

      await this.sendSMS(phoneNumber, message);
      logger.info(`Access pass resumed SMS sent to ${phoneNumber}`);
      return true;
    } catch (error) {
      logger.error({ error }, `Failed to send access pass resumed SMS to ${phoneNumber}`);
      return false;
    }
  }

  /**
   * Send access pass expiring soon SMS
   */
  async sendAccessPassExpiringSoon(
    phoneNumber: string,
    data: {
      fullName: string;
      daysUntilExpiration: number;
      language?: string;
    }
  ): Promise<boolean> {
    if (!this.isConfigured || !this.client) {
      logger.warn('SMS service not configured. Skipping SMS notification.');
      return false;
    }

    try {
      const language = data.language || 'en';
      const message = this.formatAccessPassExpiringSoonMessage(data, language);

      await this.sendSMS(phoneNumber, message);
      logger.info(`Access pass expiring soon SMS sent to ${phoneNumber}`);
      return true;
    } catch (error) {
      logger.error({ error }, `Failed to send access pass expiring soon SMS to ${phoneNumber}`);
      return false;
    }
  }

  /**
   * Send generic SMS
   */
  private async sendSMS(to: string, message: string): Promise<void> {
    if (!this.client) {
      throw new Error('SMS client not initialized');
    }

    await this.client.messages.create({
      body: message,
      from: this.fromPhoneNumber,
      to: to,
    });
  }

  /**
   * Format access pass issued message
   */
  private formatAccessPassIssuedMessage(data: any, language: string): string {
    if (language === 'ar') {
      return `مرحباً ${data.fullName}،\n\nتم إصدار تصريح الوصول الخاص بك: ${data.accessPassId}\n\nأضف إلى المحفظة: ${data.installUrl}\n\nوصول`;
    } else {
      return `Hello ${data.fullName},\n\nYour access pass has been issued: ${data.accessPassId}\n\nAdd to wallet: ${data.installUrl}\n\nDoorPasses`;
    }
  }

  /**
   * Format access pass suspended message
   */
  private formatAccessPassSuspendedMessage(data: any, language: string): string {
    if (language === 'ar') {
      return `مرحباً ${data.fullName}،\n\nتم تعليق تصريح الوصول الخاص بك: ${data.accessPassId}\n\nيرجى الاتصال بالإدارة للحصول على مزيد من المعلومات.\n\nوصول`;
    } else {
      return `Hello ${data.fullName},\n\nYour access pass has been suspended: ${data.accessPassId}\n\nPlease contact administration for more information.\n\nDoorPasses`;
    }
  }

  /**
   * Format access pass resumed message
   */
  private formatAccessPassResumedMessage(data: any, language: string): string {
    if (language === 'ar') {
      return `مرحباً ${data.fullName}،\n\nتم استئناف تصريح الوصول الخاص بك: ${data.accessPassId}\n\nيمكنك الآن استخدام التصريح.\n\nوصول`;
    } else {
      return `Hello ${data.fullName},\n\nYour access pass has been resumed: ${data.accessPassId}\n\nYou can now use your pass.\n\nDoorPasses`;
    }
  }

  /**
   * Format access pass expiring soon message
   */
  private formatAccessPassExpiringSoonMessage(data: any, language: string): string {
    if (language === 'ar') {
      return `مرحباً ${data.fullName}،\n\nتصريح الوصول الخاص بك سينتهي في ${data.daysUntilExpiration} أيام.\n\nيرجى الاتصال بالإدارة للتجديد.\n\nوصول`;
    } else {
      return `Hello ${data.fullName},\n\nYour access pass expires in ${data.daysUntilExpiration} days.\n\nPlease contact administration to renew.\n\nDoorPasses`;
    }
  }
}

export default new SMSService();
