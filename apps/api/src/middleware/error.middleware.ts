import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { sendError, sendInternalError, sendValidationError } from '../utils/response';
import logger from '../config/logger';

/**
 * Global error handler middleware
 */
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log error
  logger.error(
    {
      error: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    },
    'Error occurred'
  );

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    sendValidationError(res, formattedErrors);
    return;
  }

  // Handle Prisma errors
  if (err.code && err.code.startsWith('P')) {
    handlePrismaError(err, res);
    return;
  }

  // Handle custom application errors
  if (err.statusCode) {
    sendError(res, err.code || 'ERROR', err.message, err.statusCode, err.details);
    return;
  }

  // Default to 500 internal server error
  sendInternalError(res, process.env.NODE_ENV === 'development' ? err.message : undefined);
}

/**
 * Handle Prisma-specific errors
 */
function handlePrismaError(err: any, res: Response): void {
  switch (err.code) {
    case 'P2002':
      // Unique constraint violation
      sendError(
        res,
        'DUPLICATE_ENTRY',
        `A record with this ${err.meta?.target?.[0] || 'field'} already exists`,
        409
      );
      break;
    case 'P2025':
      // Record not found
      sendError(res, 'NOT_FOUND', 'Record not found', 404);
      break;
    case 'P2003':
      // Foreign key constraint violation
      sendError(res, 'INVALID_REFERENCE', 'Invalid reference to related record', 400);
      break;
    default:
      sendInternalError(res, 'Database error occurred');
  }
}

/**
 * 404 Not Found handler
 */
export function notFoundHandler(req: Request, res: Response): void {
  sendError(res, 'NOT_FOUND', `Route ${req.method} ${req.path} not found`, 404);
}

/**
 * Custom error class for application errors
 */
export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}
