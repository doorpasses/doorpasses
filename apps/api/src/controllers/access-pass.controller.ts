import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { accessPassService } from '../services/access-pass.service';
import { sendSuccess } from '../utils/response';
import {
  issueAccessPassSchema,
  updateAccessPassSchema,
  listAccessPassesSchema,
} from '../validators/access-pass.validator';

class AccessPassController {
  /**
   * Issue a new access pass
   * POST /v1/access-passes
   */
  async issueAccessPass(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Validate request body
      const data = issueAccessPassSchema.parse(req.body);

      // Issue access pass
      const result = await accessPassService.issueAccessPass(
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
   * List access passes for a card template
   * GET /v1/access-passes?template_id=xxx&state=xxx
   */
  async listAccessPasses(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Validate query parameters
      const query = listAccessPassesSchema.parse(req.query);

      const result = await accessPassService.listAccessPasses(
        req.account!.id,
        query.template_id,
        query.state,
        query.page || 1,
        query.limit || 50
      );

      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update an access pass
   * PATCH /v1/access-passes/:id
   */
  async updateAccessPass(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      // Validate request body
      const data = updateAccessPassSchema.parse(req.body);

      const result = await accessPassService.updateAccessPass(
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
   * Suspend an access pass
   * POST /v1/access-passes/:id/suspend
   */
  async suspendAccessPass(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      const result = await accessPassService.suspendAccessPass(
        req.account!.id,
        id
      );

      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Resume an access pass
   * POST /v1/access-passes/:id/resume
   */
  async resumeAccessPass(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      const result = await accessPassService.resumeAccessPass(
        req.account!.id,
        id
      );

      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Unlink an access pass
   * POST /v1/access-passes/:id/unlink
   */
  async unlinkAccessPass(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      const result = await accessPassService.unlinkAccessPass(
        req.account!.id,
        id
      );

      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete an access pass
   * POST /v1/access-passes/:id/delete
   */
  async deleteAccessPass(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      const result = await accessPassService.deleteAccessPass(
        req.account!.id,
        id
      );

      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}

export const accessPassController = new AccessPassController();
