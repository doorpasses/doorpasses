import { Response } from 'express';
import { ApiResponse } from '../types';

/**
 * Send a success response
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode: number = 200,
  metadata?: Record<string, any>
): Response {
  const response: ApiResponse<T> = {
    success: true,
    data,
    metadata: {
      timestamp: new Date().toISOString(),
      ...metadata,
    },
  };
  return res.status(statusCode).json(response);
}

/**
 * Send an error response
 */
export function sendError(
  res: Response,
  code: string,
  message: string,
  statusCode: number = 400,
  details?: any
): Response {
  const response: ApiResponse = {
    success: false,
    error: {
      code,
      message,
      details,
    },
    metadata: {
      timestamp: new Date().toISOString(),
    },
  };
  return res.status(statusCode).json(response);
}

/**
 * Send a validation error response
 */
export function sendValidationError(
  res: Response,
  errors: any
): Response {
  return sendError(
    res,
    'VALIDATION_ERROR',
    'Request validation failed',
    400,
    errors
  );
}

/**
 * Send a not found error
 */
export function sendNotFound(
  res: Response,
  resource: string = 'Resource'
): Response {
  return sendError(
    res,
    'NOT_FOUND',
    `${resource} not found`,
    404
  );
}

/**
 * Send an unauthorized error
 */
export function sendUnauthorized(
  res: Response,
  message: string = 'Unauthorized'
): Response {
  return sendError(
    res,
    'UNAUTHORIZED',
    message,
    401
  );
}

/**
 * Send a forbidden error
 */
export function sendForbidden(
  res: Response,
  message: string = 'Forbidden'
): Response {
  return sendError(
    res,
    'FORBIDDEN',
    message,
    403
  );
}

/**
 * Send an internal server error
 */
export function sendInternalError(
  res: Response,
  message: string = 'Internal server error'
): Response {
  return sendError(
    res,
    'INTERNAL_ERROR',
    message,
    500
  );
}
