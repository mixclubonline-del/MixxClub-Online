/**
 * CORS Configuration
 * Restricts origins to known MixxClub domains + local dev
 */

const ALLOWED_ORIGINS = [
  'https://mixxclub.lovable.app',
  'https://mixxclub.com',
  'https://www.mixxclub.com',
  'https://app.mixxclub.com',
  'http://localhost:5173',
  'http://localhost:8080',
  'http://localhost:3000',
];

// Also allow Lovable preview origins
function isAllowedOrigin(origin: string): boolean {
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  // Allow Lovable preview/dev domains
  if (origin.endsWith('.lovable.app')) return true;
  if (origin.endsWith('.lovableproject.com')) return true;
  return false;
}

/**
 * Get CORS headers with origin validation
 */
export function getCorsHeaders(req: Request): HeadersInit {
  const origin = req.headers.get('origin') || '';
  const allowedOrigin = isAllowedOrigin(origin) ? origin : ALLOWED_ORIGINS[0];

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
    'Vary': 'Origin',
  };
}

/**
 * Headers for webhook endpoints (no CORS needed)
 */
export const webhookHeaders: HeadersInit = {
  'Content-Type': 'application/json'
};
