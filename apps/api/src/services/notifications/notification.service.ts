import emailService from './email.service';
import smsService from './sms.service';
import logger from '../../config/logger';

/**
 * Unified Notification Service
 * Coordinates email and SMS notifications
 */
export class NotificationService {
  /**
   * Send access pass issued notification
   */
  async notifyAccessPassIssued(data: {
    email?: string;
    phoneNumber?: string;
    fullName: string;
    accessPassId: string;
    installUrl: string;
    startDate: string;
    expirationDate: string;
    language?: string;
  }): Promise<{ email: boolean; sms: boolean }> {
    const results = {
      email: false,
      sms: false,
    };

    // Send email notification
    if (data.email) {
      results.email = await emailService.sendAccessPassIssued(data.email, {
        fullName: data.fullName,
        accessPassId: data.accessPassId,
        installUrl: data.installUrl,
        startDate: data.startDate,
        expirationDate: data.expirationDate,
        language: data.language,
      });
    }

    // Send SMS notification
    if (data.phoneNumber) {
      results.sms = await smsService.sendAccessPassIssued(data.phoneNumber, {
        fullName: data.fullName,
        accessPassId: data.accessPassId,
        installUrl: data.installUrl,
        language: data.language,
      });
    }

    logger.info(`Access pass issued notifications sent (email: ${results.email}, sms: ${results.sms})`);

    return results;
  }

  /**
   * Send access pass suspended notification
   */
  async notifyAccessPassSuspended(data: {
    email?: string;
    phoneNumber?: string;
    fullName: string;
    accessPassId: string;
    reason?: string;
    language?: string;
  }): Promise<{ email: boolean; sms: boolean }> {
    const results = {
      email: false,
      sms: false,
    };

    // Send email notification
    if (data.email) {
      results.email = await emailService.sendAccessPassSuspended(data.email, {
        fullName: data.fullName,
        accessPassId: data.accessPassId,
        reason: data.reason,
        language: data.language,
      });
    }

    // Send SMS notification
    if (data.phoneNumber) {
      results.sms = await smsService.sendAccessPassSuspended(data.phoneNumber, {
        fullName: data.fullName,
        accessPassId: data.accessPassId,
        language: data.language,
      });
    }

    logger.info(`Access pass suspended notifications sent (email: ${results.email}, sms: ${results.sms})`);

    return results;
  }

  /**
   * Send access pass resumed notification
   */
  async notifyAccessPassResumed(data: {
    email?: string;
    phoneNumber?: string;
    fullName: string;
    accessPassId: string;
    language?: string;
  }): Promise<{ email: boolean; sms: boolean }> {
    const results = {
      email: false,
      sms: false,
    };

    // Send email notification
    if (data.email) {
      results.email = await emailService.sendAccessPassResumed(data.email, {
        fullName: data.fullName,
        accessPassId: data.accessPassId,
        language: data.language,
      });
    }

    // Send SMS notification
    if (data.phoneNumber) {
      results.sms = await smsService.sendAccessPassResumed(data.phoneNumber, {
        fullName: data.fullName,
        accessPassId: data.accessPassId,
        language: data.language,
      });
    }

    logger.info(`Access pass resumed notifications sent (email: ${results.email}, sms: ${results.sms})`);

    return results;
  }

  /**
   * Send access pass expiring soon notification
   */
  async notifyAccessPassExpiringSoon(data: {
    email?: string;
    phoneNumber?: string;
    fullName: string;
    accessPassId: string;
    expirationDate: string;
    daysUntilExpiration: number;
    language?: string;
  }): Promise<{ email: boolean; sms: boolean }> {
    const results = {
      email: false,
      sms: false,
    };

    // Send email notification
    if (data.email) {
      results.email = await emailService.sendAccessPassExpiringSoon(data.email, {
        fullName: data.fullName,
        accessPassId: data.accessPassId,
        expirationDate: data.expirationDate,
        daysUntilExpiration: data.daysUntilExpiration,
        language: data.language,
      });
    }

    // Send SMS notification
    if (data.phoneNumber) {
      results.sms = await smsService.sendAccessPassExpiringSoon(data.phoneNumber, {
        fullName: data.fullName,
        daysUntilExpiration: data.daysUntilExpiration,
        language: data.language,
      });
    }

    logger.info(`Access pass expiring soon notifications sent (email: ${results.email}, sms: ${results.sms})`);

    return results;
  }
}

export default new NotificationService();
