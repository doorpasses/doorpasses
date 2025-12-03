import prisma from '../config/database';
import { PassEventType, PublishStatus } from '@repo/database/types';
import { generateExternalId } from '../utils/auth';
import { AppError } from '../middleware/error.middleware';
import logger from '../config/logger';
import {
  CreateCardTemplateInput,
  UpdateCardTemplateInput,
  ReadEventLogInput,
} from '../validators/card-template.validator';
import { eventLogService } from './event-log.service';
import { webhookService } from './webhook.service';
import { WebhookEventType } from '../types';

class CardTemplateService {
  /**
   * Create a new card template
   */
  async createCardTemplate(organizationId: string, createdById: string, data: CreateCardTemplateInput) {
    try {
      // Generate external ID for the card template
      const exId = generateExternalId(12);

      const createData: any = {
        exId,
        organizationId,
        createdById,
        name: data.name,
        platform: data.platform,
        useCase: data.use_case,
        protocol: data.protocol,
        allowOnMultipleDevices: data.allow_on_multiple_devices || false,
        publishStatus: PublishStatus.DRAFT,
      };

      // Add optional design fields
      if (data.design?.background_color !== undefined) {
        createData.backgroundColor = data.design.background_color;
      }
      if (data.design?.label_color !== undefined) {
        createData.labelColor = data.design.label_color;
      }
      if (data.design?.label_secondary_color !== undefined) {
        createData.labelSecondaryColor = data.design.label_secondary_color;
      }
      if (data.design?.background_image !== undefined) {
        createData.backgroundImage = data.design.background_image;
      }
      if (data.design?.logo_image !== undefined) {
        createData.logoImage = data.design.logo_image;
      }
      if (data.design?.icon_image !== undefined) {
        createData.iconImage = data.design.icon_image;
      }

      // Add optional support info fields
      if (data.support_info?.support_url !== undefined) {
        createData.supportUrl = data.support_info.support_url;
      }
      if (data.support_info?.support_phone_number !== undefined) {
        createData.supportPhoneNumber = data.support_info.support_phone_number;
      }
      if (data.support_info?.support_email !== undefined) {
        createData.supportEmail = data.support_info.support_email;
      }
      if (data.support_info?.privacy_policy_url !== undefined) {
        createData.privacyPolicyUrl = data.support_info.privacy_policy_url;
      }
      if (data.support_info?.terms_and_conditions_url !== undefined) {
        createData.termsAndConditionsUrl = data.support_info.terms_and_conditions_url;
      }

      // Add optional count fields
      if (data.watch_count !== undefined) {
        createData.watchCount = data.watch_count;
      }
      if (data.iphone_count !== undefined) {
        createData.iphoneCount = data.iphone_count;
      }

      // Stringify metadata if provided
      if (data.metadata !== undefined) {
        createData.metadata = JSON.stringify(data.metadata);
      }

      const cardTemplate = await prisma.cardTemplate.create({
        data: createData,
      });

      // Log event
      await eventLogService.logEvent(PassEventType.CARD_TEMPLATE_CREATED, cardTemplate.id);

      // Send webhook
      await webhookService.sendWebhook(
        organizationId,
        WebhookEventType.CARD_TEMPLATE_CREATED,
        {
          card_template_id: cardTemplate.exId,
          protocol: cardTemplate.protocol,
          metadata: cardTemplate.metadata,
        }
      );

      logger.info({ cardTemplateId: cardTemplate.exId }, 'Card template created');

      return {
        id: cardTemplate.exId,
        externalId: cardTemplate.exId, // Alias for backwards compatibility
        name: cardTemplate.name,
        platform: cardTemplate.platform,
        use_case: cardTemplate.useCase,
        protocol: cardTemplate.protocol,
        status: cardTemplate.publishStatus, // Add status field for tests
        publish_status: cardTemplate.publishStatus,
        config: {
          design: {
            background_color: cardTemplate.backgroundColor,
            label_color: cardTemplate.labelColor,
            label_secondary_color: cardTemplate.labelSecondaryColor,
          },
          fields: [], // Empty fields array for newly created template
        },
        created_at: cardTemplate.createdAt,
      };
    } catch (error) {
      logger.error({ error }, 'Failed to create card template');
      throw error;
    }
  }

  /**
   * Read a card template
   */
  async readCardTemplate(organizationId: string, templateId: string) {
    try {
      const cardTemplate = await prisma.cardTemplate.findFirst({
        where: {
          exId: templateId,
          organizationId,
        },
        select: {
          exId: true,
          name: true,
          platform: true,
          useCase: true,
          protocol: true,
          allowOnMultipleDevices: true,
          watchCount: true,
          iphoneCount: true,
          backgroundColor: true,
          labelColor: true,
          labelSecondaryColor: true,
          supportUrl: true,
          supportPhoneNumber: true,
          supportEmail: true,
          privacyPolicyUrl: true,
          termsAndConditionsUrl: true,
          publishStatus: true,
          publishedAt: true,
          metadata: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              accessPasses: true,
            },
          },
        },
      });

      if (!cardTemplate) {
        throw new AppError('CARD_TEMPLATE_NOT_FOUND', 'Card template not found', 404);
      }

      return {
        id: cardTemplate.exId,
        externalId: cardTemplate.exId, // Alias for backwards compatibility
        name: cardTemplate.name,
        platform: cardTemplate.platform,
        use_case: cardTemplate.useCase,
        protocol: cardTemplate.protocol,
        allow_on_multiple_devices: cardTemplate.allowOnMultipleDevices,
        watch_count: cardTemplate.watchCount,
        iphone_count: cardTemplate.iphoneCount,
        design: {
          background_color: cardTemplate.backgroundColor,
          label_color: cardTemplate.labelColor,
          label_secondary_color: cardTemplate.labelSecondaryColor,
        },
        support_info: {
          support_url: cardTemplate.supportUrl,
          support_phone_number: cardTemplate.supportPhoneNumber,
          support_email: cardTemplate.supportEmail,
          privacy_policy_url: cardTemplate.privacyPolicyUrl,
          terms_and_conditions_url: cardTemplate.termsAndConditionsUrl,
        },
        publish_status: cardTemplate.publishStatus,
        published_at: cardTemplate.publishedAt,
        metadata: cardTemplate.metadata,
        access_passes_count: cardTemplate._count.accessPasses,
        created_at: cardTemplate.createdAt,
        updated_at: cardTemplate.updatedAt,
      };
    } catch (error) {
      logger.error({ error }, 'Failed to read card template');
      throw error;
    }
  }

  /**
   * Update a card template
   */
  async updateCardTemplate(
    organizationId: string,
    templateId: string,
    data: UpdateCardTemplateInput
  ) {
    try {
      // Find card template and verify ownership
      const cardTemplate = await prisma.cardTemplate.findFirst({
        where: {
          exId: templateId,
          organizationId,
        },
      });

      if (!cardTemplate) {
        throw new AppError('CARD_TEMPLATE_NOT_FOUND', 'Card template not found', 404);
      }

      const updated = await prisma.cardTemplate.update({
        where: { id: cardTemplate.id },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.allow_on_multiple_devices !== undefined && {
            allowOnMultipleDevices: data.allow_on_multiple_devices,
          }),
          ...(data.watch_count && { watchCount: data.watch_count }),
          ...(data.iphone_count && { iphoneCount: data.iphone_count }),
          ...(data.design?.background_color && {
            backgroundColor: data.design.background_color,
          }),
          ...(data.design?.label_color && {
            labelColor: data.design.label_color,
          }),
          ...(data.design?.label_secondary_color && {
            labelSecondaryColor: data.design.label_secondary_color,
          }),
          ...(data.design?.background_image && {
            backgroundImage: data.design.background_image,
          }),
          ...(data.design?.logo_image && {
            logoImage: data.design.logo_image,
          }),
          ...(data.design?.icon_image && {
            iconImage: data.design.icon_image,
          }),
          ...(data.support_info?.support_url && {
            supportUrl: data.support_info.support_url,
          }),
          ...(data.support_info?.support_phone_number && {
            supportPhoneNumber: data.support_info.support_phone_number,
          }),
          ...(data.support_info?.support_email && {
            supportEmail: data.support_info.support_email,
          }),
          ...(data.support_info?.privacy_policy_url && {
            privacyPolicyUrl: data.support_info.privacy_policy_url,
          }),
          ...(data.support_info?.terms_and_conditions_url && {
            termsAndConditionsUrl: data.support_info.terms_and_conditions_url,
          }),
          ...(data.metadata && { metadata: JSON.stringify(data.metadata) }),
        },
        select: {
          id: true,
          exId: true,
          name: true,
          backgroundColor: true,
          labelColor: true,
          labelSecondaryColor: true,
          metadata: true,
          updatedAt: true,
        },
      });

      // Log event
      await eventLogService.logEvent(PassEventType.CARD_TEMPLATE_UPDATED, cardTemplate.id);

      // Send webhook
      await webhookService.sendWebhook(
        organizationId,
        WebhookEventType.CARD_TEMPLATE_UPDATED,
        {
          card_template_id: updated.exId,
          protocol: cardTemplate.protocol,
          metadata: updated.metadata,
        }
      );

      logger.info({ cardTemplateId: updated.exId }, 'Card template updated');

      // Parse metadata if it's a string
      let parsedMetadata: any = {};
      if (updated.metadata && typeof updated.metadata === 'string') {
        try {
          parsedMetadata = JSON.parse(updated.metadata);
        } catch (e) {
          // If parsing fails, keep it as empty object
        }
      }

      return {
        id: updated.exId,
        name: updated.name,
        description: parsedMetadata?.description, // Extract description from metadata
        design: {
          background_color: updated.backgroundColor,
          label_color: updated.labelColor,
          label_secondary_color: updated.labelSecondaryColor,
        },
        updated_at: updated.updatedAt,
      };
    } catch (error) {
      logger.error({ error }, 'Failed to update card template');
      throw error;
    }
  }

  /**
   * Publish a card template
   */
  async publishCardTemplate(organizationId: string, templateId: string) {
    try {
      const cardTemplate = await prisma.cardTemplate.findFirst({
        where: {
          exId: templateId,
          organizationId,
        },
      });

      if (!cardTemplate) {
        throw new AppError('CARD_TEMPLATE_NOT_FOUND', 'Card template not found', 404);
      }

      const updated = await prisma.cardTemplate.update({
        where: { id: cardTemplate.id },
        data: {
          publishStatus: PublishStatus.PUBLISHED,
          publishedAt: new Date(),
        },
      });

      // Log event
      await eventLogService.logEvent(PassEventType.CARD_TEMPLATE_PUBLISHED, cardTemplate.id);

      // Send webhook
      await webhookService.sendWebhook(
        organizationId,
        WebhookEventType.CARD_TEMPLATE_PUBLISHED,
        {
          card_template_id: updated.exId,
          protocol: updated.protocol,
          metadata: updated.metadata,
        }
      );

      logger.info({ cardTemplateId: updated.exId }, 'Card template published');

      return {
        id: updated.exId,
        status: updated.publishStatus, // Alias for tests
        publish_status: updated.publishStatus,
        publishedAt: updated.publishedAt, // Alias for tests
        published_at: updated.publishedAt,
      };
    } catch (error) {
      logger.error({ error }, 'Failed to publish card template');
      throw error;
    }
  }

  /**
   * Read event logs for a card template
   */
  async readEventLog(
    organizationId: string,
    templateId: string,
    filters?: ReadEventLogInput,
    page: number = 1,
    limit: number = 100
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

      // Build where clause
      const where: any = {
        cardTemplateId: cardTemplate.id,
      };

      if (filters) {
        if (filters.device) {
          where.device = filters.device;
        }
        if (filters.start_date || filters.end_date) {
          where.createdAt = {};
          if (filters.start_date) {
            where.createdAt.gte = new Date(filters.start_date);
          }
          if (filters.end_date) {
            where.createdAt.lte = new Date(filters.end_date);
          }
        }
        if (filters.event_type) {
          // Map event_type to PassEventType enum
          const eventTypeMap: Record<string, PassEventType> = {
            issue: PassEventType.ACCESS_PASS_ISSUED,
            install: PassEventType.ACCESS_PASS_ACTIVATED,
            update: PassEventType.ACCESS_PASS_UPDATED,
            suspend: PassEventType.ACCESS_PASS_SUSPENDED,
            resume: PassEventType.ACCESS_PASS_RESUMED,
            unlink: PassEventType.ACCESS_PASS_UNLINKED,
          };
          where.eventType = eventTypeMap[filters.event_type];
        }
      }

      const [events, total] = await Promise.all([
        prisma.passEventLog.findMany({
          where,
          include: {
            accessPass: {
              select: {
                exId: true,
                fullName: true,
                employeeId: true,
              },
            },
          },
          skip,
          take: limit,
          orderBy: {
            createdAt: 'desc',
          },
        }),
        prisma.passEventLog.count({ where }),
      ]);

      return {
        items: events.map((event: typeof events[0]) => ({
          id: event.id,
          event_type: event.eventType,
          device: event.device,
          access_pass: event.accessPass
            ? {
              id: event.accessPass.exId,
              full_name: event.accessPass.fullName,
              employee_id: event.accessPass.employeeId,
            }
            : null,
          metadata: event.metadata,
          created_at: event.createdAt,
        })),
        logs: events.map((event: typeof events[0]) => ({ // Alias for backwards compatibility
          id: event.id,
          event_type: event.eventType,
          device: event.device,
          access_pass: event.accessPass
            ? {
              id: event.accessPass.exId,
              full_name: event.accessPass.fullName,
              employee_id: event.accessPass.employeeId,
            }
            : null,
          metadata: event.metadata,
          created_at: event.createdAt,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error({ error }, 'Failed to read event log');
      throw error;
    }
  }
}

export const cardTemplateService = new CardTemplateService();
