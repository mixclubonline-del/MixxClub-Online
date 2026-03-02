import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

/**
 * Shared authentication utilities for edge functions.
 * Validates JWT tokens and checks user roles.
 */

export interface AuthResult {
  user: { id: string; email?: string };
  error?: never;
}

export interface AuthError {
  user?: never;
  error: string;
  status: number;
}

/**
 * Validate the Authorization header and return the authenticated user.
 * Uses supabase.auth.getUser() for server-side token verification.
 */
export async function requireAuth(req: Request): Promise<AuthResult | AuthError> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return { error: 'Missing or invalid authorization header', status: 401 };
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authHeader } } }
  );

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabaseClient.auth.getUser(token);

  if (error || !user) {
    return { error: 'Invalid or expired token', status: 401 };
  }

  return { user: { id: user.id, email: user.email } };
}

/**
 * Validate auth AND require admin role.
 * Uses service role client to check user_roles table.
 */
export async function requireAdmin(req: Request): Promise<AuthResult | AuthError> {
  const authResult = await requireAuth(req);
  if ('error' in authResult) return authResult;

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const { data: role } = await supabaseAdmin
    .from('user_roles')
    .select('role')
    .eq('user_id', authResult.user.id)
    .eq('role', 'admin')
    .single();

  if (!role) {
    return { error: 'Admin access required', status: 403 };
  }

  return authResult;
}

/**
 * Helper to create an error response from AuthError
 */
export function authErrorResponse(authError: AuthError, corsHeaders: HeadersInit): Response {
  return new Response(
    JSON.stringify({ error: authError.error }),
    { status: authError.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
