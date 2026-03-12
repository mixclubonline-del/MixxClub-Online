import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { safeErrorResponse } from '../_shared/error-handler.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization')!;
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Fetch user's projects
    const { data: projects } = await supabase
      .from('projects')
      .select('*')
      .or(`client_id.eq.${user.id},engineer_id.eq.${user.id}`)
      .order('updated_at', { ascending: false })
      .limit(10);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const prompt = `Analyze these music production projects and provide actionable insights:

${projects?.map(p => `
- ${p.title}: Status=${p.status}, Priority=${p.priority}, Deadline=${p.deadline}
`).join('\n')}

Provide 3-5 specific insights about:
1. Urgent actions needed
2. Workflow optimization opportunities
3. Project health concerns
4. Collaboration recommendations

Format as JSON array with: { type, title, message, action }`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Try to parse JSON from response
    let insights;
    try {
      insights = JSON.parse(content);
    } catch {
      // If not JSON, create structured insights from text
      insights = [{
        type: 'info',
        title: 'AI Analysis',
        message: content,
        action: { link: '/artist-crm', label: 'View Projects' }
      }];
    }

    return new Response(
      JSON.stringify({ insights }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return safeErrorResponse(error, corsHeaders);
  }
});
