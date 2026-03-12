import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { requireAdmin, authErrorResponse } from '../_shared/auth.ts';

/**
 * orchestrate-promo-campaign
 * 
 * Chains multiple generate-* functions into a single campaign deliverable.
 * Creates a campaign record, then generates each asset type in sequence,
 * storing results in promo_assets.
 * 
 * Characters: Prime (Engineer/OG), Jax (Artist), Rell (Producer), Nova (Fan)
 */

import { createClient } from "jsr:@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface CampaignRequest {
    phase: 'made-with-mixxclub' | 'character-launch' | 'challenge' | 'insider-drip' | 'grand-opening';
    name?: string;
    character?: 'prime' | 'jax' | 'rell' | 'nova';
    genre?: string;
    config?: Record<string, unknown>;
}

interface AssetResult {
    asset_type: string;
    generator_function: string;
    content_url?: string;
    content_text?: string;
    metadata?: Record<string, unknown>;
    status: 'ready' | 'failed';
}

// Generator function mapping — what each phase needs
const PHASE_GENERATORS: Record<string, Array<{ fn: string; type: string }>> = {
    'made-with-mixxclub': [
        { fn: 'generate-trap-beat', type: 'beat' },
        { fn: 'generate-album-art', type: 'album_art' },
        { fn: 'generate-track-name', type: 'track_name' },
        { fn: 'generate-ad-copy', type: 'ad_copy' },
        { fn: 'generate-social-posts', type: 'social_post' },
        { fn: 'generate-waveform', type: 'waveform' },
    ],
    'character-launch': [
        { fn: 'generate-video', type: 'video' },
        { fn: 'prime-speak', type: 'voiceover' },
        { fn: 'generate-ad-copy', type: 'ad_copy' },
        { fn: 'generate-social-posts', type: 'social_post' },
        { fn: 'generate-landing-image', type: 'landing_image' },
    ],
    'challenge': [
        { fn: 'generate-trap-beat', type: 'beat' },
        { fn: 'generate-social-posts', type: 'social_post' },
        { fn: 'generate-ad-copy', type: 'ad_copy' },
        { fn: 'generate-video', type: 'video' },
    ],
    'insider-drip': [
        { fn: 'generate-ad-copy', type: 'ad_copy' },
        { fn: 'generate-music', type: 'beat' },
        { fn: 'generate-ai-avatar', type: 'avatar' },
        { fn: 'generate-economy-asset', type: 'economy_asset' },
    ],
    'grand-opening': [
        { fn: 'generate-trap-beat', type: 'beat' },
        { fn: 'prime-speak', type: 'voiceover' },
        { fn: 'generate-social-posts', type: 'social_post' },
        { fn: 'generate-economy-asset', type: 'economy_asset' },
        { fn: 'generate-video', type: 'video' },
    ],
};

// Character context for content generation
const CHARACTER_CONTEXT: Record<string, { name: string; role: string; tone: string }> = {
    prime: { name: 'Prime', role: 'Lead Engineer / The OG', tone: 'Wise, direct, authoritative. The adult in the room.' },
    jax: { name: 'Jax', role: 'The Artist', tone: 'Quiet confidence, straight talk. Raw talent seeking perfection.' },
    rell: { name: 'Rell', role: 'The Producer', tone: 'Creative, rhythm-focused, business-aware. The beat maker.' },
    nova: { name: 'Nova', role: 'The Fan / Community Pulse', tone: 'Expressive, encouraging. The culture connector.' },
};

async function callGenerator(
    fn: string,
    context: {
        character: string;
        genre: string;
        campaignName: string;
        phase: string;
    }
): Promise<{ content_url?: string; content_text?: string; metadata?: Record<string, unknown> }> {
    const charCtx = CHARACTER_CONTEXT[context.character] || CHARACTER_CONTEXT.prime;

    try {
        const response = await fetch(`${supabaseUrl}/functions/v1/${fn}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabaseServiceKey}`,
            },
            body: JSON.stringify({
                // Common context for all generators
                platform: 'mixxclub',
                campaign: context.campaignName,
                phase: context.phase,
                genre: context.genre,
                character: charCtx,
                // Generator-specific hints
                prompt_context: `MixxClub promo content for the "${context.campaignName}" campaign. ` +
                    `Character: ${charCtx.name} (${charCtx.role}). ` +
                    `Tone: ${charCtx.tone}. Genre: ${context.genre}. ` +
                    `This content should showcase MixxClub's capabilities — the platform that promotes itself.`,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Generator ${fn} failed:`, errorText);
            return { metadata: { error: errorText } };
        }

        const result = await response.json();

        // Map all known generator response shapes
        const content_url = result.url || result.audio_url || result.audioUrl
            || result.image_url || result.imageUrl || result.video_url || null;
        const content_text = result.text || result.copy || result.caption || result.name || null;

        return {
            content_url,
            content_text,
            metadata: result,
        };
    } catch (error) {
        console.error(`Generator ${fn} threw:`, error);
        return { metadata: { error: String(error) } };
    }
}

Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
        });
    }

    try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        const body: CampaignRequest = await req.json();

        const { phase, name, character = 'prime', genre = 'trap', config = {} } = body;

        if (!phase || !PHASE_GENERATORS[phase]) {
            return new Response(JSON.stringify({ error: 'Invalid phase' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const campaignName = name || `${phase}-${Date.now()}`;

        // 1. Create campaign record
        const { data: campaign, error: campaignError } = await supabase
            .from('promo_campaigns')
            .insert({
                name: campaignName,
                phase,
                status: 'generating',
                character_id: character,
                genre,
                config,
            })
            .select()
            .single();

        if (campaignError) {
            return new Response(JSON.stringify({ error: campaignError.message }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // 2. Generate each asset in the pipeline
        const generators = PHASE_GENERATORS[phase];
        const results: AssetResult[] = [];

        for (const gen of generators) {
            console.log(`[${campaignName}] Generating ${gen.type} via ${gen.fn}...`);

            const result = await callGenerator(gen.fn, {
                character,
                genre,
                campaignName,
                phase,
            });

            // Check top-level fields AND metadata for content
            const hasContent = !!(result.content_url || result.content_text);
            const hasMetadataContent = !!(result.metadata && (
                result.metadata.variants || result.metadata.suggestions ||
                result.metadata.posts || result.metadata.audioUrl ||
                result.metadata.audio_url || result.metadata.imageUrl ||
                result.metadata.waveformData
            ));
            const hasError = !!(result.metadata?.error);
            const assetStatus = (hasContent || hasMetadataContent) && !hasError ? 'ready' : 'failed';

            // Store asset
            const { error: assetError } = await supabase
                .from('promo_assets')
                .insert({
                    campaign_id: campaign.id,
                    asset_type: gen.type,
                    generator_function: gen.fn,
                    content_url: result.content_url,
                    content_text: result.content_text,
                    metadata: result.metadata || {},
                    status: assetStatus,
                });

            if (assetError) {
                console.error(`Asset storage failed for ${gen.type}:`, assetError);
            }

            results.push({
                asset_type: gen.type,
                generator_function: gen.fn,
                content_url: result.content_url,
                content_text: result.content_text,
                metadata: result.metadata,
                status: assetStatus,
            });
        }

        // 3. Update campaign status
        const readyCount = results.filter(r => r.status === 'ready').length;
        const finalStatus = readyCount === results.length ? 'ready' : readyCount > 0 ? 'ready' : 'draft';

        await supabase
            .from('promo_campaigns')
            .update({
                status: finalStatus,
                asset_count: readyCount,
            })
            .eq('id', campaign.id);

        return new Response(JSON.stringify({
            campaign_id: campaign.id,
            name: campaignName,
            phase,
            status: finalStatus,
            assets: results,
            ready: readyCount,
            total: results.length,
        }), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });
    } catch (error) {
        console.error('Campaign orchestration error:', error);
        return new Response(JSON.stringify({ error: String(error) }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
});
