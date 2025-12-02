import prisma from '../config/database';
import { PassState, PassEventType } from '@repo/database/types';
import { generateExternalId } from '../utils/auth';
import { AppError } from '../middleware/error.middleware';
import logger from '../config/logger';

import {
  IssueAccessPassInput,
  UpdateAccessPassInput,
} from '../validators/access-pass.validator';
import { eventLogService } from './event-log.service';
import { webhookService } from './webhook.service';
import { WebhookEventType } from '../types';
import walletService from './wallet/wallet.service';
import notificationService from './notifications/notification.service';

class AccessPassService {
  /**
   * Issue a new access pass
   */
  async issueAccessPass(organizationId: string, createdById: string, data: IssueAccessPassInput) {
    try {
      // Verify card template exists and belongs to organization
      const cardTemplate = await prisma.cardTemplate.findFirst({
        where: {
          exId: data.card_template_id,
          organizationId,
        },
      });

      if (!cardTemplate) {
        throw new AppError('CARD_TEMPLATE_NOT_FOUND', 'Card template not found', 404);
      }

      // Check if card template is published
      if (cardTemplate.publishStatus !== 'PUBLISHED') {
        throw new AppError(
          'CARD_TEMPLATE_NOT_PUBLISHED',
          'Card template must be published before issuing passes',
          400
        );
      }

      // Generate external ID for the access pass
      const exId = generateExternalId(14);

      // Generate install URL (this would be a real URL in production)
      const installUrl = `https://doorpasses.com/install/${exId}`;

      // Create access pass
      const accessPass = await prisma.accessPass.create({
        data: {
          exId,
          cardTemplateId: cardTemplate.id,
          createdById,
          employeeId: data.employee_id,
          fullName: data.full_name,
          email: data.email,
          phoneNumber: data.phone_number,
          classification: data.classification,
          title: data.title,
          employeePhoto: data.employee_photo,
          tagId: data.tag_id,
          siteCode: data.site_code,
          cardNumber: data.card_number,
          fileData: data.file_data,
          startDate: new Date(data.start_date),
          expirationDate: new Date(data.expiration_date),
          memberId: data.member_id,
          membershipStatus: data.membership_status,
          isPassReadyToTransact: data.is_pass_ready_to_transact,
          tileData: data.tile_data as any,
          reservations: data.reservations as any,
          metadata: data.metadata as any,
          installUrl,
          state: PassState.PENDING,
        },
      });

      // Log event
      await eventLogService.logEvent(
        PassEventType.ACCESS_PASS_ISSUED,
        cardTemplate.id,
        accessPass.id
      );

      // Send webhook
      await webhookService.sendWebhook(
        organizationId,
        WebhookEventType.ACCESS_PASS_ISSUED,
        {
          access_pass_id: accessPass.exId,
          protocol: cardTemplate.protocol,
          metadata: accessPass.metadata,
        }
      );

      // Generate wallet pass
      let walletInstallUrl = installUrl;
      try {
        const walletResult = await walletService.generateWalletPass(accessPass.id);
        walletInstallUrl = walletResult.installUrl || installUrl;
      } catch (error) {
        logger.warn({ error, accessPassId: accessPass.exId }, 'Failed to generate wallet pass');
      }

      // Send notifications (email and SMS)
      if (accessPass.email || accessPass.phoneNumber) {
        try {
          await notificationService.notifyAccessPassIssued({
            email: accessPass.email || undefined,
            phoneNumber: accessPass.phoneNumber || undefined,
            fullName: accessPass.fullName,
            accessPassId: accessPass.exId,
            installUrl: walletInstallUrl,
            startDate: accessPass.startDate.toISOString().split('T')[0],
            expirationDate: accessPass.expirationDate.toISOString().split('T')[0],
            language: 'en', // TODO: Get from user preferences
          });
        } catch (error) {
          logger.warn({ error, accessPassId: accessPass.exId }, 'Failed to send notifications');
        }
      }

      logger.info(
        { accessPassId: accessPass.exId, cardTemplateId: cardTemplate.exId },
        'Access pass issued'
      );

      return {
        id: accessPass.exId,
        externalId: accessPass.exId, // Alias for backwards compatibility
        status: accessPass.state, // Alias for tests
        state: accessPass.state,
        install_url: walletInstallUrl,
        metadata: accessPass.metadata,
        created_at: accessPass.createdAt,
      };
    } catch (error) {
      logger.error({ error }, 'Failed to issue access pass');
      throw error;
    }
  }

  /**
   * List access passes for a card template
   */
  async listAccessPasses(
    organizationId: string,
    templateId: string,
    state?: PassState,
    page: number = 1,
    limit: number = 50
  ) {
    try {
      // Verify card template exists and belongs to account
      const cardTemplate = await prisma.cardTemplate.findFirst({
        where: {
          exId: templateId,
          organizationId,
        },
      });

      if (!cardTemplate) {
        throw new AppError('CARD_TEMPLATE_NOT_FOUND', 'Card template not found', 404);
      }

      const skip = (page - 1) * limit;

      const [accessPasses, total] = await Promise.all([
        prisma.accessPass.findMany({
          where: {
            cardTemplateId: cardTemplate.id,
            ...(state && { state }),
          },
          select: {
            exId: true,
            fullName: true,
            email: true,
            employeeId: true,
            state: true,
            startDate: true,
            expirationDate: true,
            createdAt: true,
            updatedAt: true,
          },
          skip,
          take: limit,
          orderBy: {
            createdAt: 'desc',
          },
        }),
        prisma.accessPass.count({
          where: {
            cardTemplateId: cardTemplate.id,
            ...(state && { state }),
          },
        }),
      ]);

      return {
        items: accessPasses,
        passes: accessPasses, // Alias for backwards compatibility
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error({ error }, 'Failed to list access passes');
      throw error;
    }
  }

  /**
   * Update an access pass
   */
  async updateAccessPass(organizationId: string, passId: string, data: UpdateAccessPassInput) {
    try {
      // Find access pass and verify ownership
      const accessPass = await prisma.accessPass.findFirst({
        where: {
          exId: passId,
          cardTemplate: {
            organizationId,
          },
        },
        include: {
          cardTemplate: true,
        },
      });

      if (!accessPass) {
        throw new AppError('ACCESS_PASS_NOT_FOUND', 'Access pass not found', 404);
      }

      // Update access pass
      const updated = await prisma.accessPass.update({
        where: { id: accessPass.id },
        data: {
          ...(data.employee_id && { employeeId: data.employee_id }),
          ...(data.full_name && { fullName: data.full_name }),
          ...(data.classification && { classification: data.classification }),
          ...(data.expiration_date && { expirationDate: new Date(data.expiration_date) }),
          ...(data.employee_photo && { employeePhoto: data.employee_photo }),
          ...(data.title && { title: data.title }),
          ...(data.file_data && { fileData: data.file_data }),
          ...(data.is_pass_ready_to_transact !== undefined && {
            isPassReadyToTransact: data.is_pass_ready_to_transact,
          }),
          ...(data.tile_data && { tileData: data.tile_data as any }),
          ...(data.reservations && { reservations: data.reservations as any }),
          ...(data.metadata && { metadata: data.metadata as any }),
        },
      });

      // Log event
      await eventLogService.logEvent(
        PassEventType.ACCESS_PASS_UPDATED,
        accessPass.cardTemplate.id,
        accessPass.id
      );

      // Send webhook
      await webhookService.sendWebhook(
        organizationId,
        WebhookEventType.ACCESS_PASS_UPDATED,
        {
          access_pass_id: updated.exId,
          protocol: accessPass.cardTemplate.protocol,
          metadata: updated.metadata,
        }
      );

      logger.info({ accessPassId: updated.exId }, 'Access pass updated');

      return {
        id: updated.exId,
        state: updated.state,
        metadata: updated.metadata,
        updated_at: updated.updatedAt,
      };
    } catch (error) {
      logger.error({ error }, 'Failed to update access pass');
      throw error;
    }
  }

  /**
   * Suspend an access pass
   */
  async suspendAccessPass(organizationId: string, passId: string) {
    return this.updatePassState(
      organizationId,
      passId,
      PassState.SUSPENDED,
      PassEventType.ACCESS_PASS_SUSPENDED,
      WebhookEventType.ACCESS_PASS_SUSPENDED
    );
  }

  /**
   * Resume an access pass
   */
  async resumeAccessPass(organizationId: string, passId: string) {
    return this.updatePassState(
      organizationId,
      passId,
      PassState.ACTIVE,
      PassEventType.ACCESS_PASS_RESUMED,
      WebhookEventType.ACCESS_PASS_RESUMED
    );
  }

  /**
   * Unlink an access pass
   */
  async unlinkAccessPass(organizationId: string, passId: string) {
    return this.updatePassState(
      organizationId,
      passId,
      PassState.UNLINKED,
      PassEventType.ACCESS_PASS_UNLINKED,
      WebhookEventType.ACCESS_PASS_UNLINKED
    );
  }

  /**
   * Delete an access pass
   */
  async deleteAccessPass(organizationId: string, passId: string) {
    return this.updatePassState(
      organizationId,
      passId,
      PassState.DELETED,
      PassEventType.ACCESS_PASS_DELETED,
      WebhookEventType.ACCESS_PASS_DELETED
    );
  }

  /**
   * Helper method to update pass state
   */
  private async updatePassState(
    organizationId: string,
    passId: string,
    state: PassState,
    eventType: PassEventType,
    webhookEventType: WebhookEventType
  ) {
    try {
      // Find access pass and verify ownership
      const accessPass = await prisma.accessPass.findFirst({
        where: {
          exId: passId,
          cardTemplate: {
            organizationId,
          },
        },
        include: {
          cardTemplate: true,
        },
      });

      if (!accessPass) {
        throw new AppError('ACCESS_PASS_NOT_FOUND', 'Access pass not found', 404);
      }

      // Update state
      const updated = await prisma.accessPass.update({
        where: { id: accessPass.id },
        data: { state },
      });

      // Log event
      await eventLogService.logEvent(eventType, accessPass.cardTemplate.id, accessPass.id);

      // Send webhook
      await webhookService.sendWebhook(organizationId, webhookEventType, {
        access_pass_id: updated.exId,
        protocol: accessPass.cardTemplate.protocol,
        metadata: updated.metadata,
      });

      // Update wallet pass
      try {
        await walletService.updateWalletPass(accessPass.id);
      } catch (error) {
        logger.warn({ error, accessPassId: updated.exId }, 'Failed to update wallet pass');
      }

      // Send notifications based on state change
      if (accessPass.email || accessPass.phoneNumber) {
        try {
          if (state === PassState.SUSPENDED) {
            await notificationService.notifyAccessPassSuspended({
              email: accessPass.email || undefined,
              phoneNumber: accessPass.phoneNumber || undefined,
              fullName: accessPass.fullName,
              accessPassId: accessPass.exId,
              language: 'en',
            });
          } else if (state === PassState.ACTIVE && accessPass.state === PassState.SUSPENDED) {
            await notificationService.notifyAccessPassResumed({
              email: accessPass.email || undefined,
              phoneNumber: accessPass.phoneNumber || undefined,
              fullName: accessPass.fullName,
              accessPassId: accessPass.exId,
              language: 'en',
            });
          }
        } catch (error) {
          logger.warn({ error, accessPassId: updated.exId }, 'Failed to send notifications');
        }
      }

      logger.info({ accessPassId: updated.exId, state }, 'Access pass state updated');

      return {
        id: updated.exId,
        status: updated.state, // Alias for tests
        state: updated.state,
        updated_at: updated.updatedAt,
      };
    } catch (error) {
      logger.error({ error }, 'Failed to update access pass state');
      throw error;
    }
  }
}

export const accessPassService = new AccessPassService();
