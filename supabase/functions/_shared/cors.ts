/**
 * CORS Configuration
 * Allows all origins for development and preview environments
 */

/**
 * Get CORS headers allowing all origins
 */
export function getCorsHeaders(req: Request): HeadersInit {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

/**
 * Headers for webhook endpoints (no CORS needed)
 */
export const webhookHeaders: HeadersInit = {
  'Content-Type': 'application/json'
};
