import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { cardTemplateService } from '../services/card-template.service';
import { sendSuccess } from '../utils/response';
import {
  createCardTemplateSchema,
  updateCardTemplateSchema,
  readEventLogSchema,
} from '../validators/card-template.validator';

class CardTemplateController {
  /**
   * Create a new card template
   * POST /v1/console/card-templates
   */
  async createCardTemplate(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Validate request body
      const data = createCardTemplateSchema.parse(req.body);

      const result = await cardTemplateService.createCardTemplate(
        req.account!.id,
        req.account!.userId,
        data
      );

      sendSuccess(res, result, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Read a card template
   * GET /v1/console/card-templates/:id
   */
  async readCardTemplate(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      const result = await cardTemplateService.readCardTemplate(
        req.account!.id,
        id
      );

      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a card template
   * PATCH /v1/console/card-templates/:id
   */
  async updateCardTemplate(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      // Validate request body
      const data = updateCardTemplateSchema.parse(req.body);

      const result = await cardTemplateService.updateCardTemplate(
        req.account!.id,
        id,
        data
      );

      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Publish a card template
   * POST /v1/console/card-templates/:id/publish
   */
  async publishCardTemplate(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      const result = await cardTemplateService.publishCardTemplate(
        req.account!.id,
        id
      );

      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Read event logs for a card template
   * GET /v1/console/card-templates/:id/logs
   */
  async readEventLog(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 100;

      // Validate filters
      const filters = readEventLogSchema.parse(req.query);

      const result = await cardTemplateService.readEventLog(
        req.account!.id,
        id,
        filters,
        page,
        limit
      );

      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}

export const cardTemplateController = new CardTemplateController();
