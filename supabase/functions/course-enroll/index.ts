import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseClient.auth.getUser(token);

    if (!user) {
      throw new Error('Unauthorized');
    }

    const { course_id } = await req.json();

    // Get course details
    const { data: course, error: courseError } = await supabaseClient
      .from('courses')
      .select('*')
      .eq('id', course_id)
      .eq('is_published', true)
      .single();

    if (courseError || !course) {
      throw new Error('Course not found');
    }

    // Check if already enrolled
    const { data: existing } = await supabaseClient
      .from('course_enrollments')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', course_id)
      .maybeSingle();

    if (existing) {
      return new Response(
        JSON.stringify({ message: 'Already enrolled', enrollment: existing }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Create enrollment
    const { data: enrollment, error: enrollError } = await supabaseClient
      .from('course_enrollments')
      .insert({
        user_id: user.id,
        course_id: course_id,
      })
      .select()
      .single();

    if (enrollError) throw enrollError;

    // Update enrollment count
    await supabaseClient
      .from('courses')
      .update({ enrollment_count: (course.enrollment_count || 0) + 1 })
      .eq('id', course_id);

    return new Response(
      JSON.stringify(enrollment),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
