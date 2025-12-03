import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { verifyPayloadSignature, encodePayload } from '../utils/auth';
import { sendUnauthorized } from '../utils/response';
import prisma from '../config/database';
import logger from '../config/logger';

/**
 * Dual Authentication Middleware
 * Implements dual authentication with:
 * 1. X-ACCT-ID header for account identification
 * 2. X-PAYLOAD-SIG header for payload signature verification
 */
export async function authenticateRequest(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Extract headers
    const accountId = req.headers['x-acct-id'] as string;
    const payloadSignature = req.headers['x-payload-sig'] as string;

    // Check if headers are present
    if (!accountId || !payloadSignature) {
      logger.warn('Missing authentication headers');
      sendUnauthorized(res, 'Missing authentication headers');
      return;
    }

    // Find API key by account ID (now using organizationId)
    // TODO: Update this to use proper API key authentication
    const apiKey = await prisma.apiKey.findFirst({
      where: {
        key: accountId,
        isActive: true,
      },
      include: {
        organization: true,
        user: true,
      },
    });

    if (!apiKey) {
      logger.warn({ accountId }, 'API key not found');
      sendUnauthorized(res, 'Invalid API key');
      return;
    }

    if (!apiKey.organization.active) {
      logger.warn({ accountId }, 'Organization is inactive');
      sendUnauthorized(res, 'Organization is inactive');
      return;
    }

    // Use shared secret from environment or test default
    const sharedSecret = process.env.API_SHARED_SECRET || 'test-shared-secret-12345';

    // Prepare payload for signature verification
    let payload: string;

    if (req.method === 'GET') {
      // For GET requests, use the sig_payload query parameter
      const sigPayload = req.query.sig_payload as string;
      if (!sigPayload) {
        logger.warn('Missing sig_payload for GET request');
        sendUnauthorized(res, 'Missing signature payload');
        return;
      }
      // sig_payload is already base64 encoded from the query string
      payload = sigPayload;
    } else if (req.method === 'POST' || req.method === 'PATCH' || req.method === 'PUT') {
      // For POST/PATCH/PUT requests, use the request body
      if (!req.body || Object.keys(req.body).length === 0) {
        // If no body, use default payload with ID from URL params
        const defaultPayload = {
          id: req.params.id || req.params.card_id || req.params.template_id || '0',
        };
        payload = encodePayload(defaultPayload);
      } else {
        payload = encodePayload(req.body);
      }
    } else {
      // For other methods, use default payload
      const defaultPayload = {
        id: req.params.id || req.params.card_id || req.params.template_id || '0',
      };
      payload = encodePayload(defaultPayload);
    }

    // Verify signature
    const isValidSignature = verifyPayloadSignature(
      sharedSecret,
      payload,
      payloadSignature
    );

    if (!isValidSignature) {
      logger.warn({ accountId }, 'Invalid payload signature');
      sendUnauthorized(res, 'Invalid signature');
      return;
    }

    // Attach account to request (using organization data)
    req.account = {
      id: apiKey.organizationId,
      accountId: apiKey.key,
      userId: apiKey.userId,
      tier: apiKey.organization.planName || 'STARTER', // Get tier from organization planName
    };

    logger.debug({ accountId: apiKey.key }, 'Request authenticated');
    next();
  } catch (error) {
    logger.error({ error }, 'Authentication error');
    sendUnauthorized(res, 'Authentication failed');
  }
}

/**
 * Middleware to check if account is enterprise tier
 */
export function requireEnterprise(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.account) {
    sendUnauthorized(res, 'Authentication required');
    return;
  }

  if (req.account.tier !== 'ENTERPRISE') {
    sendUnauthorized(res, 'Enterprise tier required');
    return;
  }

  next();
}
