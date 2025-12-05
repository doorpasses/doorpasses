import { Router } from 'express';
import { accessPassController } from '../controllers/access-pass.controller';
import { authenticateRequest } from '../middleware/auth.middleware';
import { apiRateLimiter } from '../middleware/rate-limit.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateRequest);
router.use(apiRateLimiter);

/**
 * @route   POST /v1/access-passes
 * @desc    Issue a new access pass
 * @access  Private (Requires authentication)
 */
router.post('/', accessPassController.issueAccessPass.bind(accessPassController));

/**
 * @route   GET /v1/access-passes
 * @desc    List access passes for a card template
 * @access  Private (Requires authentication)
 */
router.get('/', accessPassController.listAccessPasses.bind(accessPassController));

/**
 * @route   PATCH /v1/access-passes/:id
 * @desc    Update an access pass
 * @access  Private (Requires authentication)
 */
router.patch('/:id', accessPassController.updateAccessPass.bind(accessPassController));

/**
 * @route   POST /v1/access-passes/:id/suspend
 * @desc    Suspend an access pass
 * @access  Private (Requires authentication)
 */
router.post('/:id/suspend', accessPassController.suspendAccessPass.bind(accessPassController));

/**
 * @route   POST /v1/access-passes/:id/resume
 * @desc    Resume an access pass
 * @access  Private (Requires authentication)
 */
router.post('/:id/resume', accessPassController.resumeAccessPass.bind(accessPassController));

/**
 * @route   POST /v1/access-passes/:id/unlink
 * @desc    Unlink an access pass
 * @access  Private (Requires authentication)
 */
router.post('/:id/unlink', accessPassController.unlinkAccessPass.bind(accessPassController));

/**
 * @route   POST /v1/access-passes/:id/delete
 * @desc    Delete an access pass
 * @access  Private (Requires authentication)
 */
router.post('/:id/delete', accessPassController.deleteAccessPass.bind(accessPassController));

export default router;
