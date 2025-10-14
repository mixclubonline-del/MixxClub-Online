import { supabase } from "@/integrations/supabase/client";

/**
 * Generate a signed URL for a file in storage
 * This provides time-limited, secure access to files
 */
export async function createSignedUrl(
  bucket: string,
  path: string,
  expiresIn: number = 3600 // Default 1 hour
): Promise<{ url: string | null; error: Error | null }> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) throw error;
    
    return { url: data.signedUrl, error: null };
  } catch (error) {
    console.error('Error creating signed URL:', error);
    return { url: null, error: error as Error };
  }
}

/**
 * Generate signed URLs for multiple files
 */
export async function createSignedUrls(
  bucket: string,
  paths: string[],
  expiresIn: number = 3600
): Promise<{ urls: Record<string, string>; errors: string[] }> {
  const urls: Record<string, string> = {};
  const errors: string[] = [];

  await Promise.all(
    paths.map(async (path) => {
      const { url, error } = await createSignedUrl(bucket, path, expiresIn);
      if (url) {
        urls[path] = url;
      } else {
        errors.push(`Failed to create URL for ${path}: ${error?.message}`);
      }
    })
  );

  return { urls, errors };
}

/**
 * For public buckets, use public URL (showcase-audio, media-library)
 * For private buckets, use signed URL
 */
export function getStorageUrl(
  bucket: string,
  path: string,
  options?: { expiresIn?: number; forcePublic?: boolean }
): Promise<string | null> {
  const publicBuckets = ['showcase-audio', 'media-library'];
  
  if (options?.forcePublic || publicBuckets.includes(bucket)) {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return Promise.resolve(data.publicUrl);
  }

  return createSignedUrl(bucket, path, options?.expiresIn).then(
    ({ url }) => url
  );
}
