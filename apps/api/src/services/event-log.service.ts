import prisma from '../config/database';
import { PassEventType } from '@repo/database/types';
import logger from '../config/logger';

class EventLogService {
  /**
   * Log an event
   */
  async logEvent(
    eventType: PassEventType,
    cardTemplateId?: string,
    accessPassId?: string,
    device?: string,
    metadata?: Record<string, any>
  ) {
    try {
      const event = await prisma.passEventLog.create({
        data: {
          eventType,
          cardTemplateId,
          accessPassId,
          device,
          metadata: metadata as any,
        },
      });

      logger.debug({ eventType, cardTemplateId, accessPassId }, 'Event logged');
      return event;
    } catch (error) {
      logger.error({ error, eventType }, 'Failed to log event');
      // Don't throw - we don't want to fail the main operation if logging fails
      return undefined;
    }
  }

  /**
   * Get events for a card template
   */
  async getEventsByTemplate(
    cardTemplateId: string,
    filters?: {
      eventType?: PassEventType;
      startDate?: Date;
      endDate?: Date;
      device?: string;
    }
  ) {
    try {
      const where: any = { cardTemplateId };

      if (filters) {
        if (filters.eventType) {
          where.eventType = filters.eventType;
        }
        if (filters.device) {
          where.device = filters.device;
        }
        if (filters.startDate || filters.endDate) {
          where.createdAt = {};
          if (filters.startDate) {
            where.createdAt.gte = filters.startDate;
          }
          if (filters.endDate) {
            where.createdAt.lte = filters.endDate;
          }
        }
      }

      return await prisma.passEventLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 1000, // Limit to last 1000 events
      });
    } catch (error) {
      logger.error({ error, cardTemplateId }, 'Failed to get events');
      throw error;
    }
  }

  /**
   * Get events for an access pass
   */
  async getEventsByAccessPass(accessPassId: string) {
    try {
      return await prisma.passEventLog.findMany({
        where: { accessPassId },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      logger.error({ error, accessPassId }, 'Failed to get events');
      throw error;
    }
  }
}

export const eventLogService = new EventLogService();
