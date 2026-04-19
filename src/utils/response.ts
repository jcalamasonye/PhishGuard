import { Response } from 'express';

// Standard API Response Interface
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

// Send success response
export const sendSuccess = <T = any>(
  res: Response,
  data: T,
  message?: string,
  statusCode = 200,
  metadata?: ApiResponse['metadata']
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    data,
  };

  if (message) {
    response.message = message;
  }

  if (metadata) {
    response.metadata = metadata;
  }

  return res.status(statusCode).json(response);
};

// Send created response (201)
export const sendCreated = <T = any>(
  res: Response,
  data: T,
  message = 'Resource created successfully'
): Response => {
  return sendSuccess(res, data, message, 201);
};

// Send no content response (204)
export const sendNoContent = (res: Response): Response => {
  return res.status(204).send();
};

// Send error response
export const sendError = (
  res: Response,
  statusCode: number,
  message: string,
  code?: string,
  details?: any
): Response => {
  const response: ApiResponse = {
    success: false,
    error: {
      code: code || `ERROR_${statusCode}`,
      message,
      ...(details && { details }),
    },
  };

  return res.status(statusCode).json(response);
};

// Send paginated response
export const sendPaginated = <T = any>(
  res: Response,
  data: T[],
  page: number,
  limit: number,
  total: number,
  message?: string
): Response => {
  const totalPages = Math.ceil(total / limit);

  return sendSuccess(
    res,
    data,
    message,
    200,
    {
      page,
      limit,
      total,
      totalPages,
    }
  );
};

// Response helpers for common scenarios
export const responses = {
  // Success responses
  ok: (res: Response, data: any, message?: string) => 
    sendSuccess(res, data, message, 200),
  
  created: (res: Response, data: any, message?: string) => 
    sendCreated(res, data, message),
  
  noContent: (res: Response) => 
    sendNoContent(res),

  // Error responses
  badRequest: (res: Response, message = 'Bad request', details?: any) =>
    sendError(res, 400, message, 'BAD_REQUEST', details),
  
  unauthorized: (res: Response, message = 'Unauthorized') =>
    sendError(res, 401, message, 'UNAUTHORIZED'),
  
  forbidden: (res: Response, message = 'Forbidden') =>
    sendError(res, 403, message, 'FORBIDDEN'),
  
  notFound: (res: Response, message = 'Resource not found') =>
    sendError(res, 404, message, 'NOT_FOUND'),
  
  conflict: (res: Response, message = 'Resource already exists') =>
    sendError(res, 409, message, 'CONFLICT'),
  
  validationError: (res: Response, message = 'Validation failed', errors?: any) =>
    sendError(res, 422, message, 'VALIDATION_ERROR', errors),
  
  tooManyRequests: (res: Response, message = 'Too many requests') =>
    sendError(res, 429, message, 'RATE_LIMIT_EXCEEDED'),
  
  serverError: (res: Response, message = 'Internal server error') =>
    sendError(res, 500, message, 'INTERNAL_SERVER_ERROR'),
};
