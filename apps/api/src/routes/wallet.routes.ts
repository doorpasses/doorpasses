import { Router } from 'express';
import { authenticateRequest } from '../middleware/auth.middleware';
import * as walletController from '../controllers/wallet.controller';

const router = Router();

/**
 * @route   GET /v1/wallet/passes/:accessPassId
 * @desc    Generate and download wallet pass (Apple) or get install URL (Google)
 * @access  Authenticated
 */
router.get('/passes/:accessPassId', authenticateRequest, walletController.generateWalletPass);

/**
 * Apple Wallet Web Service endpoints
 * These endpoints are called by Apple Wallet app for pass updates
 */

/**
 * @route   GET /v1/wallet/apple/v1/passes/:passTypeIdentifier/:serialNumber
 * @desc    Get the latest version of a pass
 * @access  Public (authenticated via pass token)
 */
router.get('/apple/v1/passes/:passTypeIdentifier/:serialNumber', walletController.getApplePass);

/**
 * @route   POST /v1/wallet/apple/v1/devices/:deviceLibraryIdentifier/registrations/:passTypeIdentifier/:serialNumber
 * @desc    Register a device to receive push notifications for a pass
 * @access  Public (authenticated via pass token)
 */
router.post(
  '/apple/v1/devices/:deviceLibraryIdentifier/registrations/:passTypeIdentifier/:serialNumber',
  walletController.registerAppleDevice
);

/**
 * @route   DELETE /v1/wallet/apple/v1/devices/:deviceLibraryIdentifier/registrations/:passTypeIdentifier/:serialNumber
 * @desc    Unregister a device from receiving push notifications
 * @access  Public (authenticated via pass token)
 */
router.delete(
  '/apple/v1/devices/:deviceLibraryIdentifier/registrations/:passTypeIdentifier/:serialNumber',
  walletController.unregisterAppleDevice
);

/**
 * @route   GET /v1/wallet/apple/v1/devices/:deviceLibraryIdentifier/registrations/:passTypeIdentifier
 * @desc    Get serial numbers for passes associated with a device
 * @access  Public (authenticated via pass token)
 */
router.get(
  '/apple/v1/devices/:deviceLibraryIdentifier/registrations/:passTypeIdentifier',
  walletController.getPassesForDevice
);

/**
 * @route   POST /v1/wallet/apple/v1/log
 * @desc    Log messages from Apple Wallet
 * @access  Public
 */
router.post('/apple/v1/log', walletController.logAppleWalletMessage);

export default router;
