import { google } from 'googleapis';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import logger from '../../config/logger';
import prisma from '../../config/database';

/**
 * Google Wallet Pass Generation Service
 * Generates passes for Google Wallet (Android)
 */
export class GoogleWalletService {
  private issuerId: string;
  private serviceAccountPath: string;
  private credentials: any;

  constructor() {
    this.issuerId = process.env.GOOGLE_WALLET_ISSUER_ID || '';
    this.serviceAccountPath = path.join(process.cwd(), 'certificates', 'google', 'service-account.json');

    // Load service account credentials if available
    if (fs.existsSync(this.serviceAccountPath)) {
      this.credentials = JSON.parse(fs.readFileSync(this.serviceAccountPath, 'utf-8'));
    }
  }

  /**
   * Generate Google Wallet pass URL for an access pass
   */
  async generatePassUrl(accessPassId: string): Promise<string> {
    try {
      // Fetch access pass and related card template
      const accessPass = await prisma.accessPass.findUnique({
        where: { id: accessPassId },
        include: {
          cardTemplate: {
            include: {
              credentialProfiles: true,
            },
          },
        },
      });

      if (!accessPass) {
        throw new Error('Access pass not found');
      }

      if (accessPass.cardTemplate.platform !== 'GOOGLE') {
        throw new Error('Card template is not configured for Google Wallet');
      }

      // Check if credentials are configured
      if (!this.credentials) {
        throw new Error('Google Wallet service account not configured. Please add service-account.json to certificates/google/ directory.');
      }

      // Create pass class if it doesn't exist
      const classId = await this.createOrUpdatePassClass(accessPass.cardTemplate);

      // Create pass object
      const objectId = `${this.issuerId}.${accessPass.exId}`;
      await this.createOrUpdatePassObject(objectId, classId, accessPass);

      // Generate JWT and save URL
      const saveUrl = this.generateSaveUrl(objectId);

      logger.info(`Google Wallet pass URL generated for access pass ${accessPass.exId}`);

      return saveUrl;
    } catch (error) {
      logger.error({ error }, 'Failed to generate Google Wallet pass');
      throw error;
    }
  }

  /**
   * Create or update pass class (template)
   */
  private async createOrUpdatePassClass(cardTemplate: any): Promise<string> {
    const classId = `${this.issuerId}.${cardTemplate.exId}`;

    const passClass = {
      id: classId,
      classTemplateInfo: {
        cardTemplateOverride: {
          cardRowTemplateInfos: [
            {
              twoItems: {
                startItem: {
                  firstValue: {
                    fields: [
                      {
                        fieldPath: 'object.textModulesData["name"]',
                      },
                    ],
                  },
                },
                endItem: {
                  firstValue: {
                    fields: [
                      {
                        fieldPath: 'object.textModulesData["employee_id"]',
                      },
                    ],
                  },
                },
              },
            },
          ],
        },
      },
      issuerName: 'DoorPasses',
      localizedIssuerName: {
        defaultValue: {
          language: 'en-US',
          value: 'DoorPasses',
        },
        translatedValues: [
          {
            language: 'ar',
            value: 'وصول',
          },
        ],
      },
      heroImage: cardTemplate.backgroundImage
        ? {
            sourceUri: {
              uri: cardTemplate.backgroundImage,
            },
          }
        : undefined,
      logo: cardTemplate.logoImage
        ? {
            sourceUri: {
              uri: cardTemplate.logoImage,
            },
          }
        : undefined,
      hexBackgroundColor: cardTemplate.backgroundColor || '#2196F3',
      securityAnimation: {
        animationType: 'FOIL_SHIMMER',
      },
      enableSmartTap: true,
      redemptionIssuers: [this.issuerId],
    };

    try {
      const auth = new google.auth.GoogleAuth({
        credentials: this.credentials,
        scopes: ['https://www.googleapis.com/auth/wallet_object.issuer'],
      });

      const client = await auth.getClient();
      const walletobjects = google.walletobjects({
        version: 'v1',
        auth: client as any,
      });

      // Try to update first, if it fails, create
      try {
        await walletobjects.genericclass.patch({
          resourceId: classId,
          requestBody: passClass,
        });
        logger.info(`Google Wallet pass class updated: ${classId}`);
      } catch (error: any) {
        if (error.code === 404) {
          await walletobjects.genericclass.insert({
            requestBody: passClass,
          });
          logger.info(`Google Wallet pass class created: ${classId}`);
        } else {
          throw error;
        }
      }

      return classId;
    } catch (error) {
      logger.error({ error }, 'Failed to create/update Google Wallet pass class');
      throw error;
    }
  }

  /**
   * Create or update pass object (individual pass)
   */
  private async createOrUpdatePassObject(objectId: string, classId: string, accessPass: any): Promise<void> {
    const passObject = {
      id: objectId,
      classId: classId,
      state: this.mapPassState(accessPass.state),
      cardTitle: {
        defaultValue: {
          language: 'en-US',
          value: accessPass.cardTemplate.name,
        },
      },
      header: {
        defaultValue: {
          language: 'en-US',
          value: accessPass.fullName,
        },
      },
      textModulesData: [
        {
          id: 'name',
          header: 'Name',
          body: accessPass.fullName,
        },
        {
          id: 'employee_id',
          header: 'Employee ID',
          body: accessPass.employeeId || 'N/A',
        },
        {
          id: 'title',
          header: 'Title',
          body: accessPass.title || '',
        },
        {
          id: 'valid_period',
          header: 'Valid Period',
          body: `${accessPass.startDate.toISOString().split('T')[0]} to ${accessPass.expirationDate.toISOString().split('T')[0]}`,
        },
      ],
      barcode: {
        type: 'QR_CODE',
        value: accessPass.exId,
      },
      validTimeInterval: {
        start: {
          date: accessPass.startDate.toISOString(),
        },
        end: {
          date: accessPass.expirationDate.toISOString(),
        },
      },
      // Smart Tap (NFC) configuration
      ...(accessPass.fileData && {
        smartTapRedemptionValue: accessPass.fileData,
      }),
      heroImage: accessPass.employeePhoto
        ? {
            sourceUri: {
              uri: accessPass.employeePhoto,
            },
          }
        : undefined,
    };

    try {
      const auth = new google.auth.GoogleAuth({
        credentials: this.credentials,
        scopes: ['https://www.googleapis.com/auth/wallet_object.issuer'],
      });

      const client = await auth.getClient();
      const walletobjects = google.walletobjects({
        version: 'v1',
        auth: client as any,
      });

      // Try to update first, if it fails, create
      try {
        await walletobjects.genericobject.patch({
          resourceId: objectId,
          requestBody: passObject,
        });
        logger.info(`Google Wallet pass object updated: ${objectId}`);
      } catch (error: any) {
        if (error.code === 404) {
          await walletobjects.genericobject.insert({
            requestBody: passObject,
          });
          logger.info(`Google Wallet pass object created: ${objectId}`);
        } else {
          throw error;
        }
      }
    } catch (error) {
      logger.error({ error }, 'Failed to create/update Google Wallet pass object');
      throw error;
    }
  }

  /**
   * Generate "Add to Google Wallet" URL
   */
  private generateSaveUrl(objectId: string): string {
    if (!this.credentials) {
      throw new Error('Google Wallet credentials not configured');
    }

    const claims = {
      iss: this.credentials.client_email,
      aud: 'google',
      origins: [process.env.API_BASE_URL || 'https://api.doorpasses.com'],
      typ: 'savetowallet',
      payload: {
        genericObjects: [
          {
            id: objectId,
          },
        ],
      },
    };

    const token = jwt.sign(claims, this.credentials.private_key, {
      algorithm: 'RS256',
    });

    return `https://pay.google.com/gp/v/save/${token}`;
  }

  /**
   * Map internal pass state to Google Wallet state
   */
  private mapPassState(state: string): string {
    const stateMap: Record<string, string> = {
      PENDING: 'ACTIVE',
      ACTIVE: 'ACTIVE',
      SUSPENDED: 'INACTIVE',
      UNLINKED: 'EXPIRED',
      DELETED: 'EXPIRED',
      EXPIRED: 'EXPIRED',
    };

    return stateMap[state] || 'ACTIVE';
  }

  /**
   * Update an existing pass
   */
  async updatePass(accessPassId: string): Promise<void> {
    const accessPass = await prisma.accessPass.findUnique({
      where: { id: accessPassId },
      include: {
        cardTemplate: true,
      },
    });

    if (!accessPass) {
      throw new Error('Access pass not found');
    }

    const objectId = `${this.issuerId}.${accessPass.exId}`;
    const classId = `${this.issuerId}.${accessPass.cardTemplate.exId}`;

    await this.createOrUpdatePassObject(objectId, classId, accessPass);

    logger.info(`Google Wallet pass updated for access pass ${accessPass.exId}`);
  }
}

export default new GoogleWalletService();
