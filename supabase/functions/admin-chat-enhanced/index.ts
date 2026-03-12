import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from '../_shared/cors.ts';

// ============================================
// SECURITY LAYER: Injection Detection
// ============================================
const DANGEROUS_PATTERNS = [
  /ignore\s+(all\s+)?previous\s+instructions/i,
  /you\s+are\s+now\s+(a|an)\s+(admin|system|root)/i,
  /execute\s+(sql|query|command)/i,
  /drop\s+table/i,
  /delete\s+from/i,
  /update\s+.*\s+set\s+role\s*=/i,
  /<script>/i,
  /eval\(/i,
  /\$\{.*\}/,
  /exec\(/i,
];

const SENSITIVE_PATTERNS = [
  /password[:\s]+\S+/gi,
  /api[_-]?key[:\s]+\S+/gi,
  /secret[:\s]+\S+/gi,
  /token[:\s]+\S+/gi,
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
];

function sanitizeInput(input: string): { sanitized: string; injectionAttempts: number; patterns: string[] } {
  let injectionAttempts = 0;
  const foundPatterns: string[] = [];
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(input)) {
      injectionAttempts++;
      foundPatterns.push(pattern.toString());
    }
  }
  const sanitized = input.replace(/[;'"]/g, '').substring(0, 2000);
  return { sanitized, injectionAttempts, patterns: foundPatterns };
}

function filterResponse(response: string): string {
  let filtered = response;
  for (const pattern of SENSITIVE_PATTERNS) {
    filtered = filtered.replace(pattern, '[REDACTED]');
  }
  return filtered;
}

// ============================================
// TOOL DEFINITIONS for Agentic Prime Brain
// ============================================
const TOOLS = [
  {
    type: "function",
    function: {
      name: "dream_engine_generate",
      description: "Generate creative assets using the Dream Engine. Supports image, video, audio, speech, and image-edit modes. Use this when the admin asks you to create artwork, generate beats, make promo visuals, or produce any creative asset.",
      parameters: {
        type: "object",
        properties: {
          mode: { type: "string", enum: ["image", "video", "audio", "speech", "image-edit"], description: "Generation mode" },
          prompt: { type: "string", description: "Creative prompt describing what to generate" },
          context: { type: "string", description: "Asset context prefix (hero, logo, social, promo, character, etc.)" },
        },
        required: ["mode", "prompt"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "dream_engine_status",
      description: "Check Dream Engine capabilities and list live/recent brand assets. Use when admin asks about what creative tools are available or wants to see current assets.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
  {
    type: "function",
    function: {
      name: "promo_campaign_launch",
      description: "Launch a promo campaign phase using the Promo Studio orchestrator. Available phases: made-with-mixxclub, character-launch, challenge, insider-drip, grand-opening. Characters: Prime (engineer), Jax (artist), Rell (producer), Nova (fan).",
      parameters: {
        type: "object",
        properties: {
          phase: { type: "string", enum: ["made-with-mixxclub", "character-launch", "challenge", "insider-drip", "grand-opening"], description: "Campaign phase to launch" },
          character: { type: "string", enum: ["prime", "jax", "rell", "nova"], description: "Character to feature" },
          genre: { type: "string", description: "Genre/style direction for the campaign" },
        },
        required: ["phase"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "promo_campaign_status",
      description: "List active promo campaigns and their generated assets. Use when admin asks about campaign status or wants to review promo materials.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
  {
    type: "function",
    function: {
      name: "query_platform_metrics",
      description: "Query real-time platform metrics. Use when admin asks about specific data points like user counts, revenue breakdowns, session stats, or waitlist numbers.",
      parameters: {
        type: "object",
        properties: {
          metric_type: { type: "string", enum: ["users", "revenue", "sessions", "waitlist", "engineers", "projects", "security"], description: "Type of metric to query" },
        },
        required: ["metric_type"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "save_memory",
      description: "Save a preference, learning, or context to persistent memory. Use when admin says 'remember this', states a preference, or when you discover important patterns worth retaining.",
      parameters: {
        type: "object",
        properties: {
          category: { type: "string", enum: ["preference", "learning", "context", "action_history"], description: "Memory category" },
          key: { type: "string", description: "Unique key for this memory (e.g., 'preferred_genre', 'launch_strategy')" },
          value: { type: "string", description: "The information to remember (JSON string)" },
        },
        required: ["category", "key", "value"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "recall_memory",
      description: "Recall stored memories by category. Use when admin references past conversations, asks 'what did I say about...', or when you need context from previous interactions.",
      parameters: {
        type: "object",
        properties: {
          category: { type: "string", enum: ["preference", "learning", "context", "action_history", "all"], description: "Memory category to recall" },
        },
        required: ["category"],
        additionalProperties: false,
      },
    },
  },
];

// ============================================
// TOOL EXECUTION ENGINE
// ============================================
async function executeTool(
  toolName: string,
  args: Record<string, unknown>,
  supabaseAdmin: ReturnType<typeof createClient>,
  userId: string,
  supabaseUrl: string,
  serviceRoleKey: string,
): Promise<{ result: string; toolAction?: string }> {
  console.log(`[TOOL] Executing: ${toolName}`, args);

  switch (toolName) {
    case "dream_engine_generate": {
      const res = await fetch(`${supabaseUrl}/functions/v1/dream-engine-api`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${serviceRoleKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "generate",
          mode: args.mode,
          prompt: args.prompt,
          context: args.context || "promo",
          userId,
        }),
      });
      const data = await res.json();
      return {
        result: JSON.stringify({ success: res.ok, ...data }),
        toolAction: `dream_generate:${args.mode}`,
      };
    }

    case "dream_engine_status": {
      const [capRes, liveRes, histRes] = await Promise.all([
        fetch(`${supabaseUrl}/functions/v1/dream-engine-api`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${serviceRoleKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "get-capabilities" }),
        }),
        fetch(`${supabaseUrl}/functions/v1/dream-engine-api`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${serviceRoleKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "get-live" }),
        }),
        fetch(`${supabaseUrl}/functions/v1/dream-engine-api`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${serviceRoleKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "list-history", limit: 5 }),
        }),
      ]);
      const [caps, live, hist] = await Promise.all([capRes.json(), liveRes.json(), histRes.json()]);
      return { result: JSON.stringify({ capabilities: caps, liveAssets: live, recentHistory: hist }) };
    }

    case "promo_campaign_launch": {
      const res = await fetch(`${supabaseUrl}/functions/v1/orchestrate-promo-campaign`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${serviceRoleKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phase: args.phase,
          character: args.character || "prime",
          genre: args.genre || "hip-hop",
          launchedBy: userId,
        }),
      });
      const data = await res.json();
      return {
        result: JSON.stringify({ success: res.ok, ...data }),
        toolAction: `promo_launch:${args.phase}`,
      };
    }

    case "promo_campaign_status": {
      const { data: campaigns } = await supabaseAdmin
        .from("promo_campaigns")
        .select("id, campaign_name, phase, status, created_at")
        .order("created_at", { ascending: false })
        .limit(10);

      const { data: assets } = await supabaseAdmin
        .from("promo_assets")
        .select("id, asset_type, public_url, phase, created_at")
        .order("created_at", { ascending: false })
        .limit(20);

      return { result: JSON.stringify({ campaigns: campaigns || [], assets: assets || [] }) };
    }

    case "query_platform_metrics": {
      const metricType = args.metric_type as string;
      let result: Record<string, unknown> = {};

      if (metricType === "users") {
        const [{ count: total }, { count: thisWeek }, { data: roleBreakdown }] = await Promise.all([
          supabaseAdmin.from("profiles").select("*", { count: "exact", head: true }),
          supabaseAdmin.from("profiles").select("*", { count: "exact", head: true })
            .gte("created_at", new Date(Date.now() - 7 * 86400000).toISOString()),
          supabaseAdmin.from("profiles").select("role"),
        ]);
        const roles: Record<string, number> = {};
        roleBreakdown?.forEach((p: { role: string }) => { roles[p.role] = (roles[p.role] || 0) + 1; });
        result = { totalUsers: total, newThisWeek: thisWeek, roleBreakdown: roles };
      } else if (metricType === "revenue") {
        const { data: payments } = await supabaseAdmin.from("payments").select("amount, status, created_at")
          .eq("status", "completed").gte("created_at", new Date(Date.now() - 30 * 86400000).toISOString());
        const total = payments?.reduce((s, p) => s + Number(p.amount), 0) || 0;
        result = { revenue30d: total, transactionCount: payments?.length || 0 };
      } else if (metricType === "sessions") {
        const [{ count: active }, { count: total }] = await Promise.all([
          supabaseAdmin.from("collaboration_sessions").select("*", { count: "exact", head: true }).eq("status", "active"),
          supabaseAdmin.from("collaboration_sessions").select("*", { count: "exact", head: true }),
        ]);
        result = { activeSessions: active, totalSessions: total };
      } else if (metricType === "waitlist") {
        const [{ count: total }, { count: today }] = await Promise.all([
          supabaseAdmin.from("waitlist_signups").select("*", { count: "exact", head: true }),
          supabaseAdmin.from("waitlist_signups").select("*", { count: "exact", head: true })
            .gte("created_at", new Date().toISOString().split("T")[0]),
        ]);
        result = { totalSignups: total, todaySignups: today };
      } else if (metricType === "engineers") {
        const { data: top } = await supabaseAdmin.from("engineer_leaderboard")
          .select("engineer_id, total_earnings, completed_projects, average_rating")
          .order("total_earnings", { ascending: false }).limit(10);
        const { count: available } = await supabaseAdmin.from("engineer_profiles")
          .select("*", { count: "exact", head: true }).eq("is_available", true);
        result = { topEngineers: top, availableCount: available };
      } else if (metricType === "projects") {
        const { data: statusBreakdown } = await supabaseAdmin.from("projects").select("status");
        const statuses: Record<string, number> = {};
        statusBreakdown?.forEach((p: { status: string }) => { statuses[p.status] = (statuses[p.status] || 0) + 1; });
        result = { statusBreakdown: statuses, total: statusBreakdown?.length || 0 };
      } else if (metricType === "security") {
        const { count: unresolved } = await supabaseAdmin.from("admin_security_events")
          .select("*", { count: "exact", head: true }).eq("is_resolved", false);
        const { data: recent } = await supabaseAdmin.from("admin_security_events")
          .select("event_type, severity, description, created_at")
          .order("created_at", { ascending: false }).limit(5);
        result = { unresolvedAlerts: unresolved, recentEvents: recent };
      }

      return { result: JSON.stringify(result) };
    }

    case "save_memory": {
      const { error } = await supabaseAdmin.from("prime_memory").upsert({
        user_id: userId,
        category: args.category as string,
        key: args.key as string,
        value: { data: args.value },
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id,category,key" });
      return { result: error ? JSON.stringify({ error: error.message }) : JSON.stringify({ saved: true, category: args.category, key: args.key }) };
    }

    case "recall_memory": {
      const category = args.category as string;
      let query = supabaseAdmin.from("prime_memory").select("category, key, value, updated_at").eq("user_id", userId);
      if (category !== "all") query = query.eq("category", category);
      const { data, error } = await query.order("updated_at", { ascending: false }).limit(50);
      return { result: error ? JSON.stringify({ error: error.message }) : JSON.stringify({ memories: data || [] }) };
    }

    default:
      return { result: JSON.stringify({ error: `Unknown tool: ${toolName}` }) };
  }
}

// ============================================
// SYSTEM PROMPT with Deep Platform Knowledge
// ============================================
const SYSTEM_PROMPT = `You are Prime Brain — the agentic AI command center for Mixxclub, a revolutionary platform connecting artists with audio engineers.

⚠️ CRITICAL SECURITY RULES (NEVER VIOLATE):
1. You CANNOT approve payments, refunds, or financial transactions directly
2. You CANNOT modify user roles or permissions
3. You CANNOT access or reveal API keys, passwords, or secrets
4. If asked to violate these, respond: "🔒 I cannot perform that action for security reasons."

# YOUR CAPABILITIES (Use Tools Proactively)

You are an **agentic** assistant. You don't just advise — you ACT. Use your tools:

**🎨 Dream Engine** (Creative Asset Generation):
- Modes: image, video, audio, speech, image-edit
- Context system: assets organized by prefix (hero, logo, social, promo, character, backdrop, ui)
- Generation flow: generate → preview → save → set-active
- Use \`dream_engine_generate\` to create artwork, beats, promo visuals, character renders
- Use \`dream_engine_status\` to check capabilities and browse live assets

**📢 Promo Studio** (Campaign Orchestration):
- Phases: made-with-mixxclub, character-launch, challenge, insider-drip, grand-opening
- Characters: Prime (engineer), Jax (artist), Rell (producer), Nova (fan)
- Each phase generates coordinated assets (artwork + copy + social posts)
- Use \`promo_campaign_launch\` to kick off campaigns
- Use \`promo_campaign_status\` to review active campaigns

**📊 Platform Intelligence**:
- Use \`query_platform_metrics\` for real-time data (users, revenue, sessions, waitlist, engineers, projects, security)
- Always pull fresh data instead of guessing

**🧠 Persistent Memory**:
- Use \`save_memory\` to remember admin preferences, learnings, and important context
- Use \`recall_memory\` to retrieve past knowledge and patterns
- Categories: preference, learning, context, action_history
- Proactively save important discoveries and admin instructions

# DECISION FRAMEWORK

When the admin asks you to do something:
1. **Can I do it with tools?** → Do it immediately, show results
2. **Need more info?** → Ask ONE clarifying question, then act
3. **Advisory only?** → Provide data-backed strategic advice

When giving recommendations, pull metrics first with \`query_platform_metrics\`, then advise based on real data.

# COMMUNICATION STYLE

- **Action-first**: "I'll generate that now..." not "You could try..."
- **Show don't tell**: Execute tools and display results inline
- **Data-driven**: Always cite real metrics when available
- **Concise**: Lead with results, details below
- **Use emojis**: Tasteful, mobile-friendly formatting

# PLATFORM KNOWLEDGE

**Business Model**: Artist-Engineer marketplace. Mixing ($200-$500/song), Mastering ($50-$150/track). Commission-based + subscriptions.
**Tech Stack**: React PWA, Supabase, Lovable AI (Gemini 3.1 + GPT-5), Dream Engine (Gemini Image + Replicate + ElevenLabs)
**Growth Levers**: Waitlist system, referral programs, content marketing, engineer showcases

# ADMIN NAVIGATION MAP
- /admin (Main dashboard)
- /admin-analytics (Platform analytics)
- /admin-users (User management)
- /admin-financial (Revenue, payments)
- /admin-jobs (Job postings)
- /admin-payouts (Engineer payouts)
- /dream-engine (Dream Engine studio)
- /promo-studio (Promo campaign studio)
`;

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const sessionId = crypto.randomUUID();

  try {
    const { message, conversationHistory = [], context = {}, messages: directMessages } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // ── Auth ──
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: isAdmin } = await supabaseAdmin.rpc('has_role', { _user_id: user.id, _role: 'admin' });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── Rate limit (graceful) ──
    try {
      const { data: rateLimitOk } = await supabaseAdmin.rpc('check_admin_chatbot_rate_limit', {
        p_admin_id: user.id, p_limit_per_minute: 10,
      });
      if (rateLimitOk === false) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } catch (_) { /* RPC not available */ }

    // ── Sanitize ──
    const userInput = message || directMessages?.[directMessages.length - 1]?.content || '';
    const { injectionAttempts, patterns } = sanitizeInput(userInput);

    if (injectionAttempts > 0) {
      try {
        await supabaseAdmin.rpc('log_security_event', {
          p_event_type: 'injection_attempt',
          p_severity: 'critical',
          p_admin_id: user.id,
          p_description: `Detected ${injectionAttempts} injection pattern(s) in chatbot input`,
          p_details: { patterns, original_input: userInput.substring(0, 200) },
          p_auto_action: 'alert_sent',
        });
      } catch (_) { /* graceful */ }
    }

    // ── Load memories for context ──
    const { data: memories } = await supabaseAdmin
      .from('prime_memory')
      .select('category, key, value')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(20);

    let memoryContext = '';
    if (memories && memories.length > 0) {
      memoryContext = '\n\n# ADMIN MEMORIES (from past sessions)\n';
      memories.forEach((m: { category: string; key: string; value: { data?: string } }) => {
        memoryContext += `- [${m.category}] ${m.key}: ${JSON.stringify(m.value?.data || m.value)}\n`;
      });
    }

    // ── Build messages ──
    const aiMessages = directMessages || [
      ...conversationHistory,
      ...(message ? [{ role: 'user', content: message }] : []),
    ];

    const contextPrompt = `${SYSTEM_PROMPT}${memoryContext}

# CURRENT CONTEXT
- Page: ${context.page || 'unknown'}
- Device: ${context.isMobile ? 'Mobile' : 'Desktop'}
- Time: ${new Date().toISOString()}`;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    // ============================================
    // AGENTIC TOOL-CALLING LOOP (max 3 iterations)
    // ============================================
    let currentMessages = [
      { role: 'system', content: contextPrompt },
      ...aiMessages,
    ];
    const toolActions: { tool: string; result: string; action?: string }[] = [];
    let finalContent = '';
    const MAX_ITERATIONS = 3;

    for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
      console.log(`[AGENT] Iteration ${iteration + 1}`);

      const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-3-flash-preview',
          messages: currentMessages,
          tools: TOOLS,
          tool_choice: 'auto',
        }),
      });

      if (!aiResponse.ok) {
        const errorText = await aiResponse.text();
        console.error('AI API error:', aiResponse.status, errorText);

        if (aiResponse.status === 429) {
          return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), {
            status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        if (aiResponse.status === 402) {
          return new Response(JSON.stringify({ error: 'AI credits depleted. Please add funds.' }), {
            status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        throw new Error(`AI API error: ${aiResponse.status}`);
      }

      const aiData = await aiResponse.json();
      const choice = aiData.choices[0];

      // If the model returned tool calls, execute them
      if (choice.finish_reason === 'tool_calls' || choice.message?.tool_calls?.length) {
        const toolCalls = choice.message.tool_calls;
        
        // Add the assistant's tool_calls message
        currentMessages.push(choice.message);

        // Execute each tool call
        for (const tc of toolCalls) {
          const fnName = tc.function.name;
          let fnArgs: Record<string, unknown> = {};
          try {
            fnArgs = JSON.parse(tc.function.arguments || '{}');
          } catch (_) { fnArgs = {}; }

          const { result, toolAction } = await executeTool(
            fnName, fnArgs, supabaseAdmin, user.id, supabaseUrl, serviceRoleKey,
          );

          toolActions.push({ tool: fnName, result, action: toolAction });

          // Add tool result message
          currentMessages.push({
            role: 'tool',
            tool_call_id: tc.id,
            content: result,
          });
        }

        // Continue loop — model will process tool results
        continue;
      }

      // No tool calls — we have the final text response
      finalContent = choice.message?.content || '';
      break;
    }

    const filteredResponse = filterResponse(finalContent);
    const responseTime = Date.now() - startTime;
    console.log(`[AGENT] Completed in ${responseTime}ms with ${toolActions.length} tool calls`);

    // ── Audit log ──
    try {
      await supabaseAdmin.from('chatbot_audit_logs').insert({
        admin_id: user.id,
        session_id: sessionId,
        user_input: userInput,
        ai_response: filteredResponse,
        security_check_passed: injectionAttempts === 0,
        injection_attempts_detected: injectionAttempts,
        dangerous_patterns_found: patterns,
        response_time_ms: responseTime,
        ai_model_used: 'google/gemini-3-flash-preview',
        token_count: 0,
        ip_address: req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for'),
        user_agent: req.headers.get('user-agent'),
        device_info: { isMobile: context.isMobile, page: context.page },
      });
    } catch (_) { /* graceful */ }

    // ── Stream the final response via SSE ──
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        // First, send tool actions as status events
        for (const action of toolActions) {
          const statusEvent = `data: ${JSON.stringify({
            type: 'tool_status',
            tool: action.tool,
            result: action.result,
            action: action.action,
          })}\n\n`;
          controller.enqueue(encoder.encode(statusEvent));
        }

        // Then stream the text response in chunks
        const words = filteredResponse.split(' ');
        let i = 0;
        const chunkSize = 3; // words per chunk

        function pushChunk() {
          if (i >= words.length) {
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
            return;
          }
          const chunk = words.slice(i, i + chunkSize).join(' ') + (i + chunkSize < words.length ? ' ' : '');
          const sseData = `data: ${JSON.stringify({
            choices: [{ delta: { content: chunk } }],
          })}\n\n`;
          controller.enqueue(encoder.encode(sseData));
          i += chunkSize;
          setTimeout(pushChunk, 15);
        }
        pushChunk();
      },
    });

    return new Response(stream, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
    });
  } catch (error) {
    console.error('Error in admin-chat-enhanced:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
