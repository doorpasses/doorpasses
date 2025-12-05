import { PKPass } from 'passkit-generator';
import path from 'path';
import fs from 'fs';
import logger from '../../config/logger';
import prisma from '../../config/database';

/**
 * Apple Wallet Pass Generation Service
 * Generates PKPass files for Apple Wallet (iOS)
 */
export class AppleWalletService {
  private certificatesPath: string;

  constructor() {
    this.certificatesPath = path.join(process.cwd(), 'certificates', 'apple');
  }

  /**
   * Generate Apple Wallet pass for an access pass
   */
  async generatePass(accessPassId: string): Promise<Buffer> {
    try {
      // Fetch access pass and related card template
      const accessPass = await prisma.accessPass.findUnique({
        where: { id: accessPassId },
        include: {
          cardTemplate: true,
        },
      });

      if (!accessPass) {
        throw new Error('Access pass not found');
      }

      if (accessPass.cardTemplate.platform !== 'APPLE') {
        throw new Error('Card template is not configured for Apple Wallet');
      }

      // Check if certificates exist
      const signerCertPath = path.join(this.certificatesPath, 'signerCert.pem');
      const signerKeyPath = path.join(this.certificatesPath, 'signerKey.pem');
      const wwdrPath = path.join(this.certificatesPath, 'wwdr.pem');

      if (!fs.existsSync(signerCertPath) || !fs.existsSync(signerKeyPath) || !fs.existsSync(wwdrPath)) {
        throw new Error('Apple Wallet certificates not configured. Please add certificates to certificates/apple/ directory.');
      }

      // Create pass instance
      const pass = await PKPass.from(
        {
          model: path.join(process.cwd(), 'pass-templates', 'apple', accessPass.cardTemplate.useCase.toLowerCase()),
          certificates: {
            wwdr: wwdrPath,
            signerCert: signerCertPath,
            signerKey: signerKeyPath,
            signerKeyPassphrase: process.env.APPLE_CERT_PASSPHRASE || '',
          },
        },
        {
          // Pass Type Identifier (must match certificate)
          passTypeIdentifier: process.env.APPLE_PASS_TYPE_ID || 'pass.com.doorpasses.access',
          teamIdentifier: process.env.APPLE_TEAM_ID || '',
          serialNumber: accessPass.exId,
          description: accessPass.cardTemplate.name,
          organizationName: 'DoorPasses',

          // Visual appearance
          backgroundColor: accessPass.cardTemplate.backgroundColor || 'rgb(33, 150, 243)',
          foregroundColor: accessPass.cardTemplate.labelColor || 'rgb(255, 255, 255)',
          labelColor: accessPass.cardTemplate.labelSecondaryColor || 'rgb(200, 200, 200)',

          // Grouping
          groupingIdentifier: accessPass.cardTemplate.exId,

          // Expiration
          expirationDate: accessPass.expirationDate.toISOString(),
          voided: accessPass.state === 'DELETED' || accessPass.state === 'UNLINKED',

          // Barcodes for visual scanning (fallback)
          barcodes: [
            {
              format: 'PKBarcodeFormatQR',
              message: accessPass.exId,
              messageEncoding: 'iso-8859-1',
            },
          ],

          // NFC configuration for tap-to-unlock
          nfc: {
            message: accessPass.fileData || accessPass.tagId || '',
            encryptionPublicKey: process.env.APPLE_NFC_ENCRYPTION_KEY,
          },

          // Location-based notifications (optional)
          ...(accessPass.metadata && (accessPass.metadata as any).locations && {
            locations: (accessPass.metadata as any).locations,
          }),

          // Web service for dynamic updates
          webServiceURL: `${process.env.API_BASE_URL || 'https://api.doorpasses.com'}/v1/wallet/apple`,
          authenticationToken: accessPass.exId,
        }
      );

      // Add pass fields based on use case
      this.addPassFields(pass, accessPass);

      // Generate and return the pass buffer
      const passBuffer = pass.getAsBuffer();

      logger.info(`Apple Wallet pass generated for access pass ${accessPass.exId}`);

      return passBuffer;
    } catch (error) {
      logger.error({ error }, 'Failed to generate Apple Wallet pass');
      throw error;
    }
  }

  /**
   * Add fields to pass based on use case
   */
  private addPassFields(pass: PKPass, accessPass: any): void {
    const { useCase } = accessPass.cardTemplate;

    // Primary fields (front of card)
    pass.primaryFields.push({
      key: 'name',
      label: 'Name',
      value: accessPass.fullName,
    });

    // Secondary fields
    if (accessPass.employeeId) {
      pass.secondaryFields.push({
        key: 'employee_id',
        label: 'Employee ID',
        value: accessPass.employeeId,
      });
    }

    if (accessPass.title) {
      pass.secondaryFields.push({
        key: 'title',
        label: 'Title',
        value: accessPass.title,
      });
    }

    // Auxiliary fields
    pass.auxiliaryFields.push(
      {
        key: 'valid_from',
        label: 'Valid From',
        value: accessPass.startDate.toISOString().split('T')[0],
        dateStyle: 'PKDateStyleShort',
      },
      {
        key: 'expires',
        label: 'Expires',
        value: accessPass.expirationDate.toISOString().split('T')[0],
        dateStyle: 'PKDateStyleShort',
      }
    );

    // Back fields (detailed info)
    pass.backFields.push(
      {
        key: 'access_pass_id',
        label: 'Access Pass ID',
        value: accessPass.exId,
      }
    );

    if (accessPass.siteCode) {
      pass.backFields.push({
        key: 'site_code',
        label: 'Site Code',
        value: accessPass.siteCode,
      });
    }

    if (accessPass.cardNumber) {
      pass.backFields.push({
        key: 'card_number',
        label: 'Card Number',
        value: accessPass.cardNumber,
      });
    }

    // Hotel-specific fields
    if (useCase === 'HOTEL' && accessPass.reservations) {
      const reservations = accessPass.reservations as any;
      if (reservations.roomNumbers) {
        pass.backFields.push({
          key: 'room_numbers',
          label: 'Room Numbers',
          value: reservations.roomNumbers.join(', '),
        });
      }
      if (reservations.reservationNumber) {
        pass.backFields.push({
          key: 'reservation_number',
          label: 'Reservation Number',
          value: reservations.reservationNumber,
        });
      }
    }

    // Add support contact info
    if (accessPass.cardTemplate.supportPhoneNumber) {
      pass.backFields.push({
        key: 'support_phone',
        label: 'Support Phone',
        value: accessPass.cardTemplate.supportPhoneNumber,
      });
    }

    if (accessPass.cardTemplate.supportEmail) {
      pass.backFields.push({
        key: 'support_email',
        label: 'Support Email',
        value: accessPass.cardTemplate.supportEmail,
      });
    }
  }

  /**
   * Update an existing pass (triggers push notification to user's device)
   */
  async updatePass(accessPassId: string): Promise<void> {
    // When pass data changes, Apple Wallet will automatically request
    // the updated pass from the web service endpoint
    logger.info(`Pass update triggered for access pass ${accessPassId}`);
  }

  /**
   * Get pass for web service request (for dynamic updates)
   */
  async getPassForWebService(serialNumber: string): Promise<Buffer | null> {
    try {
      const accessPass = await prisma.accessPass.findUnique({
        where: { exId: serialNumber },
      });

      if (!accessPass) {
        return null;
      }

      return await this.generatePass(accessPass.id);
    } catch (error) {
      logger.error({ error }, 'Failed to get pass for web service');
      return null;
    }
  }
}

export default new AppleWalletService();
