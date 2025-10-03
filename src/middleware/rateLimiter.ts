// Client-side rate limiting for admin actions
interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

class RateLimiter {
  private limits: Map<string, { count: number; resetTime: number }> = new Map();

  check(key: string, config: RateLimitConfig): boolean {
    const now = Date.now();
    const limit = this.limits.get(key);

    // Reset if window expired
    if (!limit || now > limit.resetTime) {
      this.limits.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
      });
      return true;
    }

    // Check if limit exceeded
    if (limit.count >= config.maxRequests) {
      return false;
    }

    // Increment count
    limit.count++;
    return true;
  }

  getRemainingTime(key: string): number {
    const limit = this.limits.get(key);
    if (!limit) return 0;
    return Math.max(0, limit.resetTime - Date.now());
  }

  clear(key: string) {
    this.limits.delete(key);
  }
}

export const rateLimiter = new RateLimiter();

// Rate limit configurations for different actions
export const RATE_LIMITS = {
  ADMIN_QUERY: { maxRequests: 100, windowMs: 60 * 1000 }, // 100 per minute
  ADMIN_MUTATION: { maxRequests: 20, windowMs: 60 * 1000 }, // 20 per minute
  FILE_UPLOAD: { maxRequests: 10, windowMs: 60 * 1000 }, // 10 per minute
  EXPORT: { maxRequests: 5, windowMs: 60 * 1000 }, // 5 per minute
};