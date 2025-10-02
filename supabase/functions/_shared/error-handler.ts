export interface APIError {
  error: string;
  code?: string;
  details?: any;
  timestamp: string;
  requestId?: string;
}

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function handleError(error: unknown, requestId?: string): { status: number; body: APIError } {
  console.error('Error occurred:', error);
  
  if (error instanceof AppError) {
    return {
      status: error.statusCode,
      body: {
        error: error.message,
        code: error.code,
        details: error.details,
        timestamp: new Date().toISOString(),
        requestId
      }
    };
  }
  
  if (error instanceof Error) {
    // Check for specific error patterns
    if (error.message.includes('rate limit') || error.message.includes('429')) {
      return {
        status: 429,
        body: {
          error: 'Rate limit exceeded. Please try again later.',
          code: 'RATE_LIMIT_EXCEEDED',
          timestamp: new Date().toISOString(),
          requestId
        }
      };
    }
    
    if (error.message.includes('auth') || error.message.includes('unauthorized')) {
      return {
        status: 401,
        body: {
          error: 'Authentication required',
          code: 'UNAUTHORIZED',
          timestamp: new Date().toISOString(),
          requestId
        }
      };
    }
    
    return {
      status: 500,
      body: {
        error: error.message,
        timestamp: new Date().toISOString(),
        requestId
      }
    };
  }
  
  return {
    status: 500,
    body: {
      error: 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
      requestId
    }
  };
}

export function validateRequest(data: any, requiredFields: string[]): void {
  for (const field of requiredFields) {
    if (!data[field]) {
      throw new AppError(`Missing required field: ${field}`, 400, 'VALIDATION_ERROR');
    }
  }
}

export function createResponse(
  data: any,
  status: number = 200,
  additionalHeaders: Record<string, string> = {}
): Response {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
  
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      ...additionalHeaders
    }
  });
}
