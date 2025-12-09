import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import walletService from '../services/wallet/wallet.service';
import appleWalletService from '../services/wallet/apple-wallet.service';
import { sendSuccess, sendError } from '../utils/response';
import logger from '../config/logger';

/**
 * Generate wallet pass for an access pass
 */
export const generateWalletPass = async (req: AuthenticatedRequest, res: Response): Promise<Response | void> => {
  try {
    const { accessPassId } = req.params;

    const result = await walletService.generateWalletPass(accessPassId);

    if (result.platform === 'APPLE') {
      // Return PKPass file for Apple Wallet
      res.setHeader('Content-Type', 'application/vnd.apple.pkpass');
      res.setHeader('Content-Disposition', `attachment; filename="${accessPassId}.pkpass"`);
      return res.send(result.data);
    } else if (result.platform === 'GOOGLE') {
      // Return installation URL for Google Wallet
      return sendSuccess(res, {
        platform: 'GOOGLE',
        installUrl: result.installUrl,
        message: req.t?.('wallet.google_pass_generated') || 'Google Wallet pass generated successfully',
      });
    }
  } catch (error: any) {
    logger.error({ error }, 'Failed to generate wallet pass');
    return sendError(res, 'WALLET_ERROR', error.message, 500);
  }
};

/**
 * Get pass for Apple Wallet web service (for dynamic updates)
 */
export const getApplePass = async (req: AuthenticatedRequest, res: Response): Promise<Response | void> => {
  try {
    const { serialNumber } = req.params;

    const passBuffer = await appleWalletService.getPassForWebService(serialNumber);

    if (!passBuffer) {
      return res.status(404).json({ error: 'Pass not found' });
    }

    res.setHeader('Content-Type', 'application/vnd.apple.pkpass');
    res.setHeader('Last-Modified', new Date().toUTCString());
    return res.send(passBuffer);
  } catch (error: any) {
    logger.error({ error }, 'Failed to get Apple Wallet pass');
    return sendError(res, 'WALLET_ERROR', error.message, 500);
  }
};

/**
 * Register device for Apple Wallet push notifications
 */
export const registerAppleDevice = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const { deviceLibraryIdentifier, serialNumber } = req.params;
    const pushToken = req.body.pushToken;

    logger.info(`Apple Wallet device registered: ${deviceLibraryIdentifier} for pass ${serialNumber}`);

    // Store device registration in database for push notifications
    // This would typically be stored in a separate table
    // TODO: Implement device registration storage with pushToken

    void pushToken; // Marked as intentionally unused for now

    return res.status(201).json({ success: true });
  } catch (error: any) {
    logger.error({ error }, 'Failed to register Apple Wallet device');
    return sendError(res, 'WALLET_ERROR', error.message, 500);
  }
};

/**
 * Unregister device from Apple Wallet
 */
export const unregisterAppleDevice = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const { deviceLibraryIdentifier, serialNumber } = req.params;

    logger.info(`Apple Wallet device unregistered: ${deviceLibraryIdentifier} for pass ${serialNumber}`);

    // Remove device registration from database

    return res.status(200).json({ success: true });
  } catch (error: any) {
    logger.error({ error }, 'Failed to unregister Apple Wallet device');
    return sendError(res, 'WALLET_ERROR', error.message, 500);
  }
};

/**
 * Get passes associated with a device (Apple Wallet web service)
 */
export const getPassesForDevice = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const deviceLibraryIdentifier = req.params.deviceLibraryIdentifier;
    const passTypeIdentifier = req.params.passTypeIdentifier;
    const passesUpdatedSince = req.query.passesUpdatedSince;

    // Query database for passes that need to be updated
    // TODO: Implement query logic using deviceLibraryIdentifier, passTypeIdentifier, and passesUpdatedSince
    const serialNumbers: string[] = [];

    void deviceLibraryIdentifier; // Marked as intentionally unused for now
    void passTypeIdentifier; // Marked as intentionally unused for now
    void passesUpdatedSince; // Marked as intentionally unused for now

    // For now, return empty list
    if (serialNumbers.length === 0) {
      return res.status(204).send();
    }

    return res.json({
      serialNumbers,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error({ error }, 'Failed to get passes for device');
    return sendError(res, 'WALLET_ERROR', error.message, 500);
  }
};

/**
 * Log messages from Apple Wallet
 */
export const logAppleWalletMessage = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const { logs } = req.body;

    if (logs && Array.isArray(logs)) {
      logs.forEach((log: string) => {
        logger.info(`Apple Wallet log: ${log}`);
      });
    }

    return res.status(200).json({ success: true });
  } catch (error: any) {
    logger.error({ error }, 'Failed to log Apple Wallet message');
    return sendError(res, 'WALLET_ERROR', error.message, 500);
  }
};
