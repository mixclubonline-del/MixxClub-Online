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

/**
 * Sanitized error response for edge functions.
 * Maps known safe error patterns to user-friendly messages,
 * masks all other errors as generic to prevent leaking internals.
 * Full error details are always logged server-side.
 */
export function safeErrorResponse(
  error: unknown,
  corsHeaders: Record<string, string>
): Response {
  // Always log full error server-side for debugging
  console.error('Edge function error:', error);

  const headers = { ...corsHeaders, 'Content-Type': 'application/json' };

  // AppError = intentional user-facing error — pass through as-is
  if (error instanceof AppError) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: error.statusCode, headers }
    );
  }

  if (error instanceof Error) {
    const msg = error.message.toLowerCase();

    // Rate limit
    if (msg.includes('rate limit') || msg.includes('429')) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
        { status: 429, headers }
      );
    }

    // Authentication / authorization
    if (msg.includes('unauthorized') || msg.includes('authentication required') || msg.includes('not authenticated')) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers }
      );
    }

    if (msg.includes('admin access required') || msg.includes('forbidden') || msg.includes('access denied')) {
      return new Response(
        JSON.stringify({ error: 'Access denied' }),
        { status: 403, headers }
      );
    }

    // Not found
    if (msg.includes('not found') || msg.includes('no rows')) {
      return new Response(
        JSON.stringify({ error: 'Resource not found' }),
        { status: 404, headers }
      );
    }

    // Validation / missing fields
    if (msg.includes('missing required') || msg.includes('invalid') || msg.includes('validation')) {
      return new Response(
        JSON.stringify({ error: 'Invalid request' }),
        { status: 400, headers }
      );
    }

    // Payment-specific safe messages
    if (msg.includes('insufficient') || msg.includes('already refunded') || msg.includes('already processed')) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers }
      );
    }

    // API credit / billing
    if (msg.includes('credits required') || msg.includes('402')) {
      return new Response(
        JSON.stringify({ error: 'Service credits required. Please check your account.' }),
        { status: 402, headers }
      );
    }
  }

  // Default: mask all other errors
  return new Response(
    JSON.stringify({ error: 'An internal error occurred' }),
    { status: 500, headers }
  );
}
