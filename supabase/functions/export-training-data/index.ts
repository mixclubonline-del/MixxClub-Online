import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Export Prime Brain training data as JSONL for io.net SFT.
 *
 * GET  /export-training-data              → all data (admin)
 * GET  /export-training-data?min_quality=3 → filter by quality
 * GET  /export-training-data?format=jsonl  → JSONL (default)
 * GET  /export-training-data?format=json   → JSON array
 *
 * Output format (JSONL, one per line):
 *   {"instruction": "user message", "output": "AI response"}
 *
 * With ALS context enrichment:
 *   {"instruction": "user message [ALS: Body=0.72, Soul=0.65, Silk=0.48, Air=0.81, Velvet=74]", "output": "AI response"}
 */
serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Auth check — only authenticated users can export
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return new Response(
                JSON.stringify({ error: 'Authorization required' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        if (authError || !user) {
            return new Response(
                JSON.stringify({ error: 'Invalid token' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Parse query params
        const url = new URL(req.url);
        const format = url.searchParams.get('format') || 'jsonl';
        const minQuality = parseInt(url.searchParams.get('min_quality') || '0');
        const includeALS = url.searchParams.get('include_als') !== 'false';
        const limit = parseInt(url.searchParams.get('limit') || '10000');

        // Query training data
        let query = supabase
            .from('prime_brain_training_data')
            .select('instruction, output, als_snapshot, quality_rating')
            .order('created_at', { ascending: true })
            .limit(limit);

        if (minQuality > 0) {
            query = query.gte('quality_rating', minQuality);
        }

        const { data, error } = await query;

        if (error) {
            return new Response(
                JSON.stringify({ error: `Query failed: ${error.message}` }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        if (!data || data.length === 0) {
            return new Response(
                JSON.stringify({ error: 'No training data found', count: 0 }),
                { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Transform to io.net SFT format
        const trainingPairs = data.map((row: { instruction: string; output: string; als_snapshot: Record<string, number> | null }) => {
            let instruction = row.instruction;

            // Enrich instruction with ALS context if available
            if (includeALS && row.als_snapshot) {
                const als = row.als_snapshot;
                instruction += ` [ALS: Body=${als.body}, Soul=${als.soul}, Silk=${als.silk}, Air=${als.air}, Velvet=${als.velvet}]`;
            }

            return { instruction, output: row.output };
        });

        // Format output
        if (format === 'json') {
            return new Response(
                JSON.stringify({ count: trainingPairs.length, data: trainingPairs }),
                {
                    headers: {
                        ...corsHeaders,
                        'Content-Type': 'application/json',
                    },
                }
            );
        }

        // JSONL — one JSON object per line (io.net / Hugging Face format)
        const jsonl = trainingPairs
            .map((pair: { instruction: string; output: string }) => JSON.stringify(pair))
            .join('\n');

        return new Response(jsonl, {
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/x-ndjson',
                'Content-Disposition': `attachment; filename="prime-brain-training-${new Date().toISOString().split('T')[0]}.jsonl"`,
            },
        });

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
