import { Response } from 'express';

export interface ApiResponseOptions<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string | any;
  meta?: Record<string, any>;
}

export class ApiError extends Error {
  statusCode: number;
  details?: any;

  constructor(message: string, statusCode: number = 400, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function sendResponse<T>(res: Response, statusCode: number, options: ApiResponseOptions<T>) {
  return res.status(statusCode).json({
    success: options.success,
    message: options.message,
    data: options.data !== undefined ? options.data : null,
    error: options.error !== undefined ? options.error : null,
    meta: options.meta !== undefined ? options.meta : undefined,
  });
}
