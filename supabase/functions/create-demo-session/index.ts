import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';
import { getCorsHeaders } from '../_shared/cors.ts';
import { createLogger } from '../_shared/logger.ts';

const logger = createLogger('create-demo-session');

interface DemoSessionRequest {
  role: 'client' | 'engineer';
}

// Only allow non-admin demo roles
const ALLOWED_DEMO_ROLES = ['client', 'engineer'] as const;

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logger.info('Creating demo session');

    const { role }: DemoSessionRequest = await req.json();

    // SECURITY: Only allow client and engineer roles — never admin
    if (!ALLOWED_DEMO_ROLES.includes(role as typeof ALLOWED_DEMO_ROLES[number])) {
      return new Response(
        JSON.stringify({ error: 'Invalid role. Only "client" and "engineer" are allowed for demo sessions.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Generate a unique temporary email for this session
    const timestamp = Date.now();
    const randomId = crypto.randomUUID().substring(0, 8);
    const tempEmail = `demo-${role}-${timestamp}-${randomId}@mixclub.temp`;
    const tempPassword = crypto.randomUUID();

    logger.info('Creating temporary demo account', { role, tempEmail });

    // Create temporary user account
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: tempEmail,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: role === 'engineer' ? 'Demo Engineer' : 'Demo Artist',
        is_demo: true,
        demo_role: role,
        expires_at: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours
      }
    });

    if (authError) {
      logger.error('Failed to create demo user', authError);
      throw authError;
    }

    if (!authData.user) {
      throw new Error('No user returned from auth');
    }

    logger.info('Demo user created', { userId: authData.user.id });

    // Set up profile - map role to valid profile role (never admin)
    const profileRole = role === 'client' ? 'artist' : role;
    
    // Wait a moment for the profile trigger to create the profile
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ 
        role: profileRole,
        full_name: authData.user.user_metadata.full_name
      })
      .eq('id', authData.user.id);

    if (profileError) {
      logger.warn('Profile update failed', profileError);
      const { error: insertError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: authData.user.id,
          role: profileRole,
          full_name: authData.user.user_metadata.full_name,
          email: tempEmail
        });
      if (insertError) {
        logger.warn('Profile insert also failed', insertError);
      }
    }

    // Add role to user_roles table — NEVER admin
    const userRole = role === 'client' ? 'artist' : role;
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({ 
        user_id: authData.user.id, 
        role: userRole 
      });

    if (roleError) {
      logger.warn('Role assignment failed', roleError);
    }

    logger.info('Demo session created successfully', { 
      userId: authData.user.id,
      role,
      expiresIn: '4 hours'
    });

    // Return temporary credentials for client to sign in
    return new Response(
      JSON.stringify({ 
        email: tempEmail,
        password: tempPassword,
        userId: authData.user.id,
        role,
        expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create demo session';
    logger.error('Demo session creation failed', error);
    return new Response(
      JSON.stringify({ 
        error: errorMessage
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
