import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  keyPrefix: string;
}

export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig,
  supabaseUrl: string,
  supabaseKey: string
): Promise<{ allowed: boolean; resetAt?: Date; remaining?: number }> {
  const supabase = createClient(supabaseUrl, supabaseKey);
  const now = new Date();
  const windowStart = new Date(now.getTime() - config.windowMs);
  
  const key = `${config.keyPrefix}:${identifier}`;
  
  // Check existing rate limit
  const { data: existing, error } = await supabase
    .from('rate_limits')
    .select('*')
    .eq('identifier', key)
    .gte('created_at', windowStart.toISOString())
    .single();
  
  if (error && error.code !== 'PGRST116') { // Not "no rows" error
    console.error('Rate limit check error:', error);
    return { allowed: true }; // Fail open
  }
  
  if (existing) {
    if (existing.attempt_count >= config.maxRequests) {
      const resetAt = new Date(new Date(existing.created_at).getTime() + config.windowMs);
      return {
        allowed: false,
        resetAt,
        remaining: 0
      };
    }
    
    // Increment
    await supabase
      .from('rate_limits')
      .update({ 
        attempt_count: existing.attempt_count + 1,
        updated_at: now.toISOString()
      })
      .eq('id', existing.id);
    
    return {
      allowed: true,
      remaining: config.maxRequests - existing.attempt_count - 1
    };
  }
  
  // Create new entry
  await supabase
    .from('rate_limits')
    .insert({
      identifier: key,
      action: config.keyPrefix,
      attempt_count: 1,
      created_at: now.toISOString()
    });
  
  return {
    allowed: true,
    remaining: config.maxRequests - 1
  };
}

export function rateLimitHeaders(result: { resetAt?: Date; remaining?: number }) {
  const headers: Record<string, string> = {};
  
  if (result.remaining !== undefined) {
    headers['X-RateLimit-Remaining'] = result.remaining.toString();
  }
  
  if (result.resetAt) {
    headers['X-RateLimit-Reset'] = result.resetAt.toISOString();
  }
  
  return headers;
}
