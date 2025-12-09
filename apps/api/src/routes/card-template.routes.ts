import { Router } from 'express';
import { cardTemplateController } from '../controllers/card-template.controller';
import { authenticateRequest, requireEnterprise } from '../middleware/auth.middleware';
import { apiRateLimiter } from '../middleware/rate-limit.middleware';

const router = Router();

// All routes require authentication and enterprise tier
router.use(authenticateRequest);
router.use(requireEnterprise);
router.use(apiRateLimiter);

/**
 * @route   POST /v1/console/card-templates
 * @desc    Create a new card template
 * @access  Private (Enterprise only)
 */
router.post('/', cardTemplateController.createCardTemplate.bind(cardTemplateController));

/**
 * @route   GET /v1/console/card-templates/:id
 * @desc    Read a card template
 * @access  Private (Enterprise only)
 */
router.get('/:id', cardTemplateController.readCardTemplate.bind(cardTemplateController));

/**
 * @route   PATCH /v1/console/card-templates/:id
 * @desc    Update a card template
 * @access  Private (Enterprise only)
 */
router.patch('/:id', cardTemplateController.updateCardTemplate.bind(cardTemplateController));

/**
 * @route   POST /v1/console/card-templates/:id/publish
 * @desc    Publish a card template
 * @access  Private (Enterprise only)
 */
router.post('/:id/publish', cardTemplateController.publishCardTemplate.bind(cardTemplateController));

/**
 * @route   GET /v1/console/card-templates/:id/logs
 * @desc    Read event logs for a card template
 * @access  Private (Enterprise only)
 */
router.get('/:id/logs', cardTemplateController.readEventLog.bind(cardTemplateController));

export default router;
