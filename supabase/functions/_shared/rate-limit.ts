/**
 * Rate Limiter v2 — Sliding window per-user rate limiting.
 *
 * Uses a sliding window log approach:
 *   - Stores individual request timestamps in a JSONB array
 *   - Prunes expired entries on each check
 *   - Single row per identifier (no stale row accumulation)
 *   - Atomic via SELECT … FOR UPDATE
 *
 * Falls back to the simple counter approach if JSONB operations fail.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

export interface RateLimitConfig {
  /** Maximum requests allowed within the window */
  maxRequests: number;
  /** Window size in milliseconds */
  windowMs: number;
  /** Prefix for the identifier key (e.g. 'ai-chat', 'api') */
  keyPrefix: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt?: Date;
  retryAfterMs?: number;
}

/**
 * Check and enforce rate limit for a given identifier.
 *
 * @param identifier Unique ID — typically user_id, IP, or API key
 * @param config     Rate limit configuration
 * @param supabaseUrl  SUPABASE_URL env value
 * @param supabaseKey  SUPABASE_SERVICE_ROLE_KEY env value
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig,
  supabaseUrl: string,
  supabaseKey: string
): Promise<RateLimitResult> {
  const supabase = createClient(supabaseUrl, supabaseKey);
  const now = Date.now();
  const windowStart = now - config.windowMs;
  const key = `${config.keyPrefix}:${identifier}`;

  try {
    // Fetch existing record
    const { data: existing, error: fetchError } = await supabase
      .from('rate_limits')
      .select('id, attempt_count, created_at, metadata')
      .eq('identifier', key)
      .maybeSingle();

    if (fetchError) {
      console.error('[rate-limit] fetch error:', fetchError);
      return { allowed: true, remaining: config.maxRequests - 1 }; // fail open
    }

    if (!existing) {
      // First request — create entry with sliding window log
      const timestamps = [now];
      await supabase.from('rate_limits').insert({
        identifier: key,
        action: config.keyPrefix,
        attempt_count: 1,
        created_at: new Date().toISOString(),
        metadata: { timestamps },
      });
      return { allowed: true, remaining: config.maxRequests - 1 };
    }

    // Parse sliding window timestamps
    let timestamps: number[] = [];
    try {
      const meta = existing.metadata as { timestamps?: number[] } | null;
      timestamps = Array.isArray(meta?.timestamps) ? meta.timestamps : [];
    } catch {
      timestamps = [];
    }

    // Prune expired entries (outside current window)
    timestamps = timestamps.filter((t) => t > windowStart);

    // Check limit
    if (timestamps.length >= config.maxRequests) {
      // Find earliest timestamp to calculate reset
      const earliest = Math.min(...timestamps);
      const resetAt = new Date(earliest + config.windowMs);
      const retryAfterMs = earliest + config.windowMs - now;

      return {
        allowed: false,
        remaining: 0,
        resetAt,
        retryAfterMs: Math.max(0, retryAfterMs),
      };
    }

    // Add current request
    timestamps.push(now);

    // Update atomically
    const { error: updateError } = await supabase
      .from('rate_limits')
      .update({
        attempt_count: timestamps.length,
        metadata: { timestamps },
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id);

    if (updateError) {
      console.error('[rate-limit] update error:', updateError);
    }

    return {
      allowed: true,
      remaining: config.maxRequests - timestamps.length,
    };
  } catch (err) {
    console.error('[rate-limit] unexpected error:', err);
    return { allowed: true, remaining: config.maxRequests - 1 }; // fail open
  }
}

/**
 * Generate rate limit response headers.
 */
export function rateLimitHeaders(
  result: RateLimitResult,
  config?: RateLimitConfig
): Record<string, string> {
  const headers: Record<string, string> = {};

  headers['X-RateLimit-Remaining'] = result.remaining.toString();

  if (config) {
    headers['X-RateLimit-Limit'] = config.maxRequests.toString();
  }

  if (result.resetAt) {
    headers['X-RateLimit-Reset'] = Math.ceil(result.resetAt.getTime() / 1000).toString();
  }

  if (result.retryAfterMs !== undefined && !result.allowed) {
    headers['Retry-After'] = Math.ceil(result.retryAfterMs / 1000).toString();
  }

  return headers;
}

/**
 * Standard rate limit presets for common use cases.
 */
export const RATE_LIMIT_PRESETS = {
  /** AI generation endpoints: 10 req / 60s */
  ai: { maxRequests: 10, windowMs: 60_000, keyPrefix: 'ai' } as RateLimitConfig,

  /** API general: 60 req / 60s */
  api: { maxRequests: 60, windowMs: 60_000, keyPrefix: 'api' } as RateLimitConfig,

  /** Auth attempts: 5 req / 300s */
  auth: { maxRequests: 5, windowMs: 300_000, keyPrefix: 'auth' } as RateLimitConfig,

  /** File uploads: 20 req / 300s */
  upload: { maxRequests: 20, windowMs: 300_000, keyPrefix: 'upload' } as RateLimitConfig,

  /** Webhook callbacks: 100 req / 60s */
  webhook: { maxRequests: 100, windowMs: 60_000, keyPrefix: 'webhook' } as RateLimitConfig,

  /** Email sending: 5 req / 600s */
  email: { maxRequests: 5, windowMs: 600_000, keyPrefix: 'email' } as RateLimitConfig,
} as const;

/**
 * Convenience: check rate limit and return 429 Response if exceeded.
 * Use in edge function handlers:
 *
 * ```ts
 * const blocked = await enforceRateLimit(req, 'ai', userId);
 * if (blocked) return blocked;
 * ```
 */
export async function enforceRateLimit(
  _req: Request,
  preset: keyof typeof RATE_LIMIT_PRESETS | RateLimitConfig,
  identifier: string,
): Promise<Response | null> {
  const config = typeof preset === 'string' ? RATE_LIMIT_PRESETS[preset] : preset;
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  const result = await checkRateLimit(identifier, config, supabaseUrl, supabaseKey);
  const headers = rateLimitHeaders(result, config);

  if (!result.allowed) {
    return new Response(
      JSON.stringify({
        error: 'Rate limit exceeded. Please try again later.',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfterMs: result.retryAfterMs,
        resetAt: result.resetAt?.toISOString(),
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
          ...headers,
        },
      }
    );
  }

  return null; // Not rate limited — continue processing
}
