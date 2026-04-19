import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { AppError, isOperationalError } from '@/utils/errors';
import { sendError } from '@/utils/response';
import { logError } from '@/utils/logger';
import { config } from '@/config';

//  Not Found middleware - Handle 404 errors
export const notFound = (req: Request, res: Response): void => {
  sendError(
    res,
    404,
    `Route ${req.method} ${req.originalUrl} not found`,
    'ROUTE_NOT_FOUND'
  );
};

// Global Error Handler middleware
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  // Log the error
  logError(err, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Handle operational errors (expected errors)
  if (err instanceof AppError) {
    sendError(res, err.statusCode, err.message);
    return;
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const errors = err.errors.map((error) => ({
      field: error.path.join('.'),
      message: error.message,
    }));

    sendError(
      res,
      422,
      'Validation failed',
      'VALIDATION_ERROR',
      errors
    );
    return;
  }

  // Handle Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    handlePrismaError(err, res);
    return;
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    sendError(
      res,
      400,
      'Invalid data provided',
      'VALIDATION_ERROR'
    );
    return;
  }

  if (err instanceof Prisma.PrismaClientInitializationError) {
    sendError(
      res,
      503,
      'Database connection failed',
      'DATABASE_ERROR'
    );
    return;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    sendError(res, 401, 'Invalid token', 'INVALID_TOKEN');
    return;
  }

  if (err.name === 'TokenExpiredError') {
    sendError(res, 401, 'Token expired', 'TOKEN_EXPIRED');
    return;
  }

  // Handle programming errors (unexpected errors)
  if (!isOperationalError(err)) {
    // In production, don't expose internal error details
    if (config.isProduction) {
      sendError(
        res,
        500,
        'An unexpected error occurred',
        'INTERNAL_SERVER_ERROR'
      );
    } else {
      // In development, show full error details
      sendError(
        res,
        500,
        err.message,
        'INTERNAL_SERVER_ERROR',
        {
          stack: err.stack,
          name: err.name,
        }
      );
    }
    return;
  }

  // Fallback error response
  sendError(
    res,
    500,
    'An unexpected error occurred',
    'INTERNAL_SERVER_ERROR'
  );
};

// Handle Prisma-specific errors
const handlePrismaError = (
  err: Prisma.PrismaClientKnownRequestError,
  res: Response
): void => {
  switch (err.code) {
    // Unique constraint violation
    case 'P2002':
      {
        const fields = (err.meta?.target as string[]) || [];
        sendError(
          res,
          409,
          `A record with this ${fields.join(', ')} already exists`,
          'DUPLICATE_ENTRY',
          { fields }
        );
      }
      break;

    // Foreign key constraint violation
    case 'P2003':
      sendError(
        res,
        400,
        'Invalid reference to related record',
        'FOREIGN_KEY_CONSTRAINT'
      );
      break;

    // Record not found
    case 'P2025':
      sendError(
        res,
        404,
        'Record not found',
        'RECORD_NOT_FOUND'
      );
      break;

    // Too many connections
    case 'P1000':
      sendError(
        res,
        503,
        'Database temporarily unavailable',
        'DATABASE_OVERLOAD'
      );
      break;

    // Database connection error
    case 'P1001':
    case 'P1002':
      sendError(
        res,
        503,
        'Cannot connect to database',
        'DATABASE_CONNECTION_ERROR'
      );
      break;

    // Default Prisma error
    default:
      sendError(
        res,
        500,
        'Database operation failed',
        'DATABASE_ERROR',
        config.isDevelopment ? { code: err.code, meta: err.meta } : undefined
      );
  }
};

// Async error wrapper - Catch async errors in route handlers
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
