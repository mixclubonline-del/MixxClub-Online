import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href'],
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Sanitize text input (strip all HTML)
 */
export function sanitizeText(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}

/**
 * Escape SQL-like special characters (use with Supabase text search)
 */
export function escapeSqlLike(input: string): string {
  return input
    .replace(/\\/g, '\\\\')
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_');
}

/**
 * Sanitize file name to prevent directory traversal
 */
export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9-_. ]/g, '')
    .replace(/\.{2,}/g, '.')
    .substring(0, 255);
}

/**
 * Validate and sanitize URL
 */
export function sanitizeUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    // Only allow http and https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * Remove dangerous SQL patterns (basic protection, use with RLS)
 */
export function sanitizeSqlInput(input: string): string {
  const dangerousPatterns = [
    /('|--|;|\/\*|\*\/|xp_|sp_|exec|execute|select|insert|update|delete|drop|create|alter|union|script)/gi
  ];
  
  let sanitized = input;
  dangerousPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });
  
  return sanitized.trim();
}

/**
 * Rate limit key generator (for API calls)
 */
export function generateRateLimitKey(userId: string, action: string): string {
  return `ratelimit:${userId}:${action}:${Math.floor(Date.now() / 60000)}`; // Per minute
}

/**
 * Check for common injection patterns
 */
export function detectInjectionAttempt(input: string): boolean {
  const injectionPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // Event handlers
    /eval\(/i,
    /expression\(/i,
    /import\s/i,
    /&#/i, // HTML entities that could be used for XSS
  ];

  return injectionPatterns.some(pattern => pattern.test(input));
}
