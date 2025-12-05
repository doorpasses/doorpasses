import appleWalletService from './apple-wallet.service';
import googleWalletService from './google-wallet.service';
import prisma from '../../config/database';
import logger from '../../config/logger';

/**
 * Unified Wallet Service
 * Handles pass generation for both Apple Wallet and Google Wallet
 */
export class WalletService {
  /**
   * Generate wallet pass based on card template platform
   */
  async generateWalletPass(accessPassId: string): Promise<{ platform: string; data: Buffer | string; installUrl?: string }> {
    try {
      // Fetch access pass with card template
      const accessPass = await prisma.accessPass.findUnique({
        where: { id: accessPassId },
        include: {
          cardTemplate: true,
        },
      });

      if (!accessPass) {
        throw new Error('Access pass not found');
      }

      const { platform } = accessPass.cardTemplate;

      if (platform === 'APPLE') {
        // Generate Apple Wallet pass (PKPass file)
        const passBuffer = await appleWalletService.generatePass(accessPassId);

        // Update access pass with installation URL
        const installUrl = `${process.env.API_BASE_URL || 'https://api.doorpasses.com'}/v1/wallet/passes/${accessPass.exId}.pkpass`;
        await prisma.accessPass.update({
          where: { id: accessPassId },
          data: { installUrl },
        });

        logger.info(`Apple Wallet pass generated for access pass ${accessPass.exId}`);

        return {
          platform: 'APPLE',
          data: passBuffer,
          installUrl,
        };
      } else if (platform === 'GOOGLE') {
        // Generate Google Wallet pass URL
        const installUrl = await googleWalletService.generatePassUrl(accessPassId);

        // Update access pass with installation URL
        await prisma.accessPass.update({
          where: { id: accessPassId },
          data: { installUrl },
        });

        logger.info(`Google Wallet pass URL generated for access pass ${accessPass.exId}`);

        return {
          platform: 'GOOGLE',
          data: installUrl,
          installUrl,
        };
      } else {
        throw new Error(`Unsupported platform: ${platform}`);
      }
    } catch (error) {
      logger.error({ error }, 'Failed to generate wallet pass');
      throw error;
    }
  }

  /**
   * Update wallet pass (triggers push notification or updates in Google Wallet)
   */
  async updateWalletPass(accessPassId: string): Promise<void> {
    try {
      const accessPass = await prisma.accessPass.findUnique({
        where: { id: accessPassId },
        include: {
          cardTemplate: true,
        },
      });

      if (!accessPass) {
        throw new Error('Access pass not found');
      }

      const { platform } = accessPass.cardTemplate;

      if (platform === 'APPLE') {
        await appleWalletService.updatePass(accessPassId);
        logger.info(`Apple Wallet pass update triggered for access pass ${accessPass.exId}`);
      } else if (platform === 'GOOGLE') {
        await googleWalletService.updatePass(accessPassId);
        logger.info(`Google Wallet pass updated for access pass ${accessPass.exId}`);
      }
    } catch (error) {
      logger.error({ error }, 'Failed to update wallet pass');
      throw error;
    }
  }

  /**
   * Invalidate wallet pass (mark as expired/deleted)
   */
  async invalidateWalletPass(accessPassId: string): Promise<void> {
    // Update the access pass state, then trigger wallet update
    await this.updateWalletPass(accessPassId);
  }
}

export default new WalletService();
