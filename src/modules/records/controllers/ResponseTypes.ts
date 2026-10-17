// src/modules/records/controllers/ResponseTypes.ts

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
  path?: string;
  statusCode: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export function createSuccessResponse<T>(
  data: T,
  message?: string,
  statusCode: number = 200
): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
    statusCode
  };
}

export function createErrorResponse(
  error: string,
  statusCode: number = 400,
  path?: string
): ApiResponse {
  return {
    success: false,
    error,
    timestamp: new Date().toISOString(),
    path,
    statusCode
  };
}

export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  limit: number,
  offset: number,
  message?: string
): PaginatedResponse<T> {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
    statusCode: 200,
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + limit < total
    }
  };
}
