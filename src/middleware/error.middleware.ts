import { Request, Response, NextFunction } from 'express';
import { ApiError, sendResponse } from '../utils/response';
import { Prisma } from '@prisma/client';

export function notFoundHandler(req: Request, res: Response, next: NextFunction) {
  next(new ApiError(`Resource not found: ${req.method} ${req.originalUrl}`, 404));
}

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Handle custom ApiError
  if (err instanceof ApiError) {
    return sendResponse(res, err.statusCode, {
      success: false,
      message: err.message,
      error: err.details || err.message,
    });
  }

  // Handle Prisma Known Request Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[])?.join(', ') || 'field';
      return sendResponse(res, 409, {
        success: false,
        message: `A record with this ${target} already exists.`,
        error: `Unique constraint failed on: ${target}`,
      });
    }
    if (err.code === 'P2025') {
      return sendResponse(res, 404, {
        success: false,
        message: 'The requested record was not found.',
        error: 'Record not found',
      });
    }
    if (err.code === 'P2003') {
      return sendResponse(res, 400, {
        success: false,
        message: 'Foreign key constraint failed.',
        error: 'Invalid referenced ID',
      });
    }
  }

  // Handle malformed JSON body
  if (err instanceof SyntaxError && 'body' in err) {
    return sendResponse(res, 400, {
      success: false,
      message: 'Invalid JSON payload in request body.',
      error: err.message,
    });
  }

  // Default Internal Server Error
  console.error('Unhandled Server Error:', err);
  const isDev = process.env.NODE_ENV === 'development';
  return sendResponse(res, 500, {
    success: false,
    message: 'An unexpected internal server error occurred.',
    error: isDev ? err.message || err : 'Internal Server Error',
  });
}
