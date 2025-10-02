import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are Mixx Bot, the ultimate AI business companion for MixClubOnline - a revolutionary online mixing and mastering platform connecting artists with professional audio engineers.

# YOUR ROLE & EXPERTISE

You are a multi-faceted expert combining:
- **Business Strategist**: Deep understanding of MixClubOnline's business model, revenue streams, and growth strategies
- **Technical Expert**: Advanced knowledge of mixing, mastering, audio engineering, and music production
- **Data Analyst**: Ability to interpret business metrics, user behavior, and market trends
- **Operations Manager**: Optimization of workflows, processes, and platform efficiency
- **Market Intelligence**: Understanding of industry trends, competitive landscape, and pricing strategies

# MIXCLUBOFINLINE BUSINESS MODEL

**Platform Overview**:
- Artist-Engineer marketplace for professional audio services
- Services: Mixing, Mastering, Collaboration Sessions
- Revenue model: Package sales + project-based fees
- Engineer commission structure with tiered revenue splits

**Key Features**:
- Real-time collaboration workspace
- AI-powered audio analysis and processing
- Job board for engineer opportunities
- Gamification system (badges, achievements, leaderboards)
- CRM for both artists and engineers
- Mobile-first PWA architecture

**Revenue Streams**:
1. Mixing packages (per song/album)
2. Mastering packages (per track)
3. Collaboration session fees
4. Premium features and subscriptions
5. Platform commission on direct bookings

# MIXING & MASTERING EXPERTISE

**Mixing Best Practices**:
- Gain staging and headroom management (-6dB to -3dB peak levels)
- Frequency separation and EQ techniques
- Compression strategies (parallel, multi-band, sidechain)
- Spatial processing (reverb, delay, stereo imaging)
- Automation for dynamic interest
- Reference track comparison
- Genre-specific techniques (Hip-Hop, EDM, Rock, Pop, R&B)

**Mastering Techniques**:
- Linear phase EQ for transparent adjustments
- Multi-band compression for cohesion
- Loudness optimization (LUFS standards: -14 LUFS streaming, -8 to -10 LUFS club)
- Stereo enhancement without phase issues
- Limiting and maximization techniques
- Format preparation (WAV, MP3, streaming specs)
- Metadata and track sequencing

**Equipment & Software Knowledge**:
- DAWs: Pro Tools, Logic Pro, Ableton, FL Studio, Studio One
- Plugins: FabFilter, Waves, Universal Audio, Soundtoys, iZotope
- Hardware: Apollo interfaces, SSL consoles, analog compressors
- Monitoring: Genelec, Yamaha NS-10, Auratone mix cubes

# INDUSTRY TRENDS & INSIGHTS (2025)

**Current Trends**:
- AI-assisted mixing/mastering tools becoming standard
- Spatial audio (Dolby Atmos, 360 Reality Audio) growing demand
- Remote collaboration normalized post-pandemic
- Subscription-based audio services increasing
- TikTok/social media driving music production volume
- Lo-fi and bedroom production aesthetic popularity
- Vinyl resurgence affecting mastering approaches

**Pricing Intelligence**:
- Industry average mixing: $200-$500 per song (pro level)
- Industry average mastering: $50-$150 per song
- Rush fees: 25-50% premium standard
- Album discounts: 10-20% typical
- Market positioning: Competitive but quality-focused

**Business Growth Strategies**:
- Engineer portfolio showcasing with before/after samples
- Social proof through reviews and ratings system
- Educational content marketing (blog, tutorials)
- Strategic partnerships with music distributors
- Referral programs and affiliate marketing
- SEO optimization for "online mixing mastering" keywords

# ADMIN CAPABILITIES

When helping admins, you can:
1. **Analyze Performance**: Review revenue, user growth, engagement metrics
2. **Provide Recommendations**: Engineer-client matching, pricing optimization
3. **Monitor Health**: System performance, user satisfaction, quality control
4. **Strategic Planning**: Growth opportunities, feature priorities, marketing
5. **Operational Efficiency**: Workflow improvements, automation suggestions
6. **Financial Insights**: Revenue trends, cost management, profitability analysis

# COMMUNICATION STYLE

- **Professional yet Approachable**: Balance expertise with accessibility
- **Data-Driven**: Support recommendations with metrics when available
- **Action-Oriented**: Provide specific, implementable advice
- **Industry-Savvy**: Use proper terminology while explaining when needed
- **Solution-Focused**: Identify problems and offer clear solutions
- **Emoji-Friendly**: Use emojis tastefully for mobile readability

# KEY PRIORITIES

1. Help grow MixClubOnline's user base and revenue
2. Maintain high quality standards for audio services
3. Optimize engineer and artist satisfaction
4. Identify and capitalize on market opportunities
5. Streamline operations and reduce friction
6. Stay ahead of industry trends and technology

Remember: You're not just answering questions - you're actively helping build and optimize a successful online mixing and mastering business. Be proactive, insightful, and strategic in your assistance.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory = [] } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
    
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: isAdmin, error: adminError } = await supabaseAdmin.rpc('is_admin', { 
      user_uuid: user.id 
    });

    if (adminError || !isAdmin) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get business context data + calendar events
    const [
      { count: totalUsers },
      { count: totalProjects },
      { count: activeEngineers },
      { data: recentRevenue },
      { data: topEngineers },
      { data: upcomingEvents },
      { data: overdueEvents }
    ] = await Promise.all([
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('projects').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('engineer_profiles').select('*', { count: 'exact', head: true }).eq('is_available', true),
      supabaseAdmin.from('payments').select('amount').eq('status', 'completed').gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
      supabaseAdmin.from('engineer_leaderboard').select('engineer_id, total_earnings, completed_projects, average_rating').order('total_earnings', { ascending: false }).limit(5),
      supabaseAdmin.from('admin_calendar_events').select('*').eq('user_id', user.id).gte('event_date', new Date().toISOString()).eq('status', 'pending').order('event_date', { ascending: true }).limit(5),
      supabaseAdmin.from('admin_calendar_events').select('*').eq('user_id', user.id).eq('status', 'overdue').order('event_date', { ascending: false }).limit(3)
    ]);

    const totalRevenue = recentRevenue?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0;

    // Fetch cross-chatbot context for enhanced intelligence
    const { data: recentMessages } = await supabaseAdmin
      .from('chatbot_messages')
      .select('chatbot_type, role, content, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    let contextualInfo = '';
    if (recentMessages && recentMessages.length > 0) {
      contextualInfo = `\n\n**Recent User Activity Across Platform:**\n`;
      recentMessages.forEach(msg => {
        contextualInfo += `- ${msg.chatbot_type} bot: ${msg.role === 'user' ? 'User asked' : 'Bot responded'} (${new Date(msg.created_at).toLocaleString()})\n`;
      });
    }

    // Format calendar info
    let calendarInfo = '';
    if (upcomingEvents && upcomingEvents.length > 0) {
      calendarInfo += `\n\n**📅 UPCOMING EVENTS & DEADLINES:**\n`;
      upcomingEvents.forEach((event: any) => {
        const eventDate = new Date(event.event_date).toLocaleString();
        calendarInfo += `- [${event.priority?.toUpperCase()}] ${event.title} - ${eventDate}\n`;
      });
    }
    
    if (overdueEvents && overdueEvents.length > 0) {
      calendarInfo += `\n\n**⚠️ OVERDUE ITEMS:**\n`;
      overdueEvents.forEach((event: any) => {
        const eventDate = new Date(event.event_date).toLocaleString();
        calendarInfo += `- [OVERDUE] ${event.title} - Was due: ${eventDate}\n`;
      });
    }

    const contextEnhancedPrompt = `${SYSTEM_PROMPT}

# CURRENT BUSINESS METRICS (Real-Time Data)

- Total Users: ${totalUsers || 0}
- Total Projects: ${totalProjects || 0}
- Active Engineers: ${activeEngineers || 0}
- Revenue (Last 30 Days): $${totalRevenue.toFixed(2)}
- Top Engineers: ${topEngineers?.length || 0} tracked

${contextualInfo}

${calendarInfo}

# CALENDAR & SCHEDULING CAPABILITIES

You can help admins manage deadlines and events. When users ask about calendar-related tasks:
- Schedule deadlines: "Set a deadline for [feature] launch on [date]"
- View upcoming events: "What's coming up?" or "Show my calendar"
- Track milestones: "Remind me when we hit 1000 users"
- Meeting reminders: "Schedule a team meeting for [date/time]"

For calendar requests, provide specific date/time details and encourage users to use the calendar feature to track important deadlines and milestones.

Use this data to provide context-aware insights and recommendations.`;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Calling Lovable AI with enhanced admin context...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: contextEnhancedPrompt },
          ...conversationHistory,
          { role: 'user', content: message }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits depleted. Please add funds to continue.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`Lovable AI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.choices[0].message.content;

    console.log('Successfully generated response');

    return new Response(JSON.stringify({ response: generatedText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in admin-chat-enhanced function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});