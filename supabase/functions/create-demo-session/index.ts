import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';
import { getCorsHeaders } from '../_shared/cors.ts';
import { createLogger } from '../_shared/logger.ts';

const logger = createLogger('create-demo-session');

interface DemoSessionRequest {
  role: 'client' | 'engineer' | 'admin';
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logger.info('Creating demo session');

    const { role }: DemoSessionRequest = await req.json();

    if (!['client', 'engineer', 'admin'].includes(role)) {
      throw new Error('Invalid role specified');
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
        full_name: role === 'admin' ? 'Demo Admin' : role === 'engineer' ? 'Demo Engineer' : 'Demo Artist',
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

    // Set up profile
    const profileRole = role === 'admin' ? 'client' : role;
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ 
        role: profileRole,
        full_name: authData.user.user_metadata.full_name
      })
      .eq('id', authData.user.id);

    if (profileError) {
      logger.warn('Profile update failed', profileError);
    }

    // Add admin role if needed
    if (role === 'admin') {
      const { error: roleError } = await supabaseAdmin
        .from('user_roles')
        .insert({ 
          user_id: authData.user.id, 
          role: 'admin' 
        });

      if (roleError) {
        logger.warn('Admin role assignment failed', roleError);
      }
    }

    // Set up onboarding profile for slideshow
    const { error: onboardingError } = await supabaseAdmin
      .from('onboarding_profiles')
      .insert({
        user_id: authData.user.id,
        user_type: role === 'engineer' ? 'engineer' : 'artist',
        onboarding_completed: true
      });

    if (onboardingError) {
      logger.warn('Onboarding profile creation failed', onboardingError);
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
