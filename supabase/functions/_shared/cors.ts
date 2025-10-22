/**
 * Secure CORS Configuration
 * Restricts cross-origin requests to approved domains only
 */

const ALLOWED_ORIGINS = [
  'https://mixclubonline.com',
  'https://www.mixclubonline.com',
  'https://id-preview--ee0645d0-cc4e-4e26-b5eb-b018162f6a50.lovable.app',
  // Add development origins conditionally
  ...(Deno.env.get('ENVIRONMENT') === 'development' ? ['http://localhost:5173', 'http://localhost:3000'] : [])
];

/**
 * Get secure CORS headers with origin validation
 */
export function getCorsHeaders(req: Request): HeadersInit {
  const origin = req.headers.get('origin');
  
  // Validate origin is in allowed list
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) 
    ? origin 
    : ALLOWED_ORIGINS[0];

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Credentials': 'true',
  };
}

/**
 * Validate origin for admin-only functions
 * Returns true if origin is allowed, logs security event if not
 */
export async function validateAdminOrigin(
  req: Request, 
  supabaseClient: any, 
  userId: string
): Promise<boolean> {
  const origin = req.headers.get('origin');
  
  if (!origin || !ALLOWED_ORIGINS.includes(origin)) {
    // Log security event for invalid origin
    await supabaseClient.rpc('log_security_event', {
      p_event_type: 'invalid_origin',
      p_severity: 'high',
      p_admin_id: userId,
      p_description: `Admin function called from unauthorized origin: ${origin || 'unknown'}`,
      p_details: { 
        origin, 
        userAgent: req.headers.get('user-agent'),
        timestamp: new Date().toISOString()
      }
    }).catch((err: Error) => console.error('Failed to log security event:', err));
    
    return false;
  }
  
  return true;
}

/**
 * Headers for webhook endpoints (no CORS needed)
 */
export const webhookHeaders: HeadersInit = {
  'Content-Type': 'application/json'
};
