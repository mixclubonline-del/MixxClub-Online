import { supabase } from '@/integrations/supabase/client';

/**
 * Storage utility for premium content with signed URLs and cache optimization.
 * Handles both public and private buckets with appropriate URL strategies.
 */

const PUBLIC_BUCKETS = ['brand-assets', 'showcase-audio', 'media-library'];
const SIGNED_URL_CACHE = new Map<string, { url: string; expiresAt: number }>();
const CACHE_BUFFER_MS = 5 * 60 * 1000; // Refresh 5 min before expiry

/**
 * Get a storage URL with intelligent caching.
 * - Public buckets → public URL (CDN-cacheable)
 * - Private buckets → signed URL with in-memory cache
 */
export async function getOptimizedUrl(
  bucket: string,
  path: string,
  options?: { expiresIn?: number; forcePublic?: boolean; forceRefresh?: boolean }
): Promise<string | null> {
  if (!path) return null;

  // External URLs pass through
  if (path.startsWith('http://') || path.startsWith('https://')) return path;

  const expiresIn = options?.expiresIn ?? 3600;

  // Public buckets use CDN-friendly public URLs
  if (options?.forcePublic || PUBLIC_BUCKETS.includes(bucket)) {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  // Check signed URL cache
  const cacheKey = `${bucket}:${path}`;
  if (!options?.forceRefresh) {
    const cached = SIGNED_URL_CACHE.get(cacheKey);
    if (cached && cached.expiresAt > Date.now() + CACHE_BUFFER_MS) {
      return cached.url;
    }
  }

  // Generate signed URL
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error || !data?.signedUrl) {
    console.error(`[Storage] Failed to sign ${bucket}/${path}:`, error);
    return null;
  }

  // Cache it
  SIGNED_URL_CACHE.set(cacheKey, {
    url: data.signedUrl,
    expiresAt: Date.now() + expiresIn * 1000,
  });

  return data.signedUrl;
}

/**
 * Batch-generate signed URLs with parallel fetching.
 * Returns a map of path → signedUrl.
 */
export async function getOptimizedUrls(
  bucket: string,
  paths: string[],
  options?: { expiresIn?: number }
): Promise<Record<string, string>> {
  const results: Record<string, string> = {};
  const toFetch: string[] = [];

  // Check cache first
  for (const path of paths) {
    const cacheKey = `${bucket}:${path}`;
    const cached = SIGNED_URL_CACHE.get(cacheKey);
    if (cached && cached.expiresAt > Date.now() + CACHE_BUFFER_MS) {
      results[path] = cached.url;
    } else {
      toFetch.push(path);
    }
  }

  // Fetch uncached in parallel
  if (toFetch.length > 0) {
    const fetched = await Promise.all(
      toFetch.map((path) => getOptimizedUrl(bucket, path, options).then((url) => ({ path, url })))
    );
    for (const { path, url } of fetched) {
      if (url) results[path] = url;
    }
  }

  return results;
}

/**
 * Upload a file with standardized path conventions.
 * Path format: {userId}/{timestamp}_{fileName}
 */
export async function uploadFile(
  bucket: string,
  file: File,
  userId: string,
  options?: { subfolder?: string; upsert?: boolean }
): Promise<{ path: string; url: string } | null> {
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const timestamp = Date.now();
  const folder = options?.subfolder ? `${userId}/${options.subfolder}` : userId;
  const path = `${folder}/${timestamp}_${sanitizedName}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: PUBLIC_BUCKETS.includes(bucket) ? '31536000' : '3600',
      upsert: options?.upsert ?? false,
      contentType: file.type,
    });

  if (error) {
    console.error(`[Storage] Upload failed:`, error);
    return null;
  }

  const url = await getOptimizedUrl(bucket, path);
  return url ? { path, url } : null;
}

/**
 * Clear signed URL cache (useful on logout or session refresh).
 */
export function clearStorageCache() {
  SIGNED_URL_CACHE.clear();
}

/**
 * Get cache stats for debugging.
 */
export function getStorageCacheStats() {
  const now = Date.now();
  let valid = 0;
  let expired = 0;
  SIGNED_URL_CACHE.forEach((entry) => {
    if (entry.expiresAt > now) valid++;
    else expired++;
  });
  return { total: SIGNED_URL_CACHE.size, valid, expired };
}
