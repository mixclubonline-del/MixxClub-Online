import { supabase } from "@/integrations/supabase/client";

export type ContentType = 'hot-take' | 'production-tip' | 'industry-insight' | 'platform-promo' | 'trend-reaction';
export type ContentStatus = 'pending' | 'generating' | 'ready' | 'approved' | 'scheduled' | 'posted' | 'rejected';

export interface PlatformContent {
  caption: string;
  hashtags: string[];
  format?: string;
}

export interface PrimeContent {
  id: string;
  content_type: ContentType;
  topic: string | null;
  script: string;
  audio_url: string | null;
  image_url: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  platform_content: Record<string, PlatformContent>;
  status: ContentStatus;
  scheduled_for: string | null;
  posted_at: string | null;
  platforms_posted: string[];
  engagement_metrics: Record<string, any>;
  generation_metadata: Record<string, any>;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface GenerateContentRequest {
  contentType: ContentType;
  topic?: string;
  platforms?: string[];
  includeVoice?: boolean;
  includeImage?: boolean;
  includeVideo?: boolean;
  trendData?: {
    id: string;
    title: string;
    description: string;
  };
}

export interface GeneratedContentResponse {
  success: boolean;
  content?: {
    id: string;
    script: string;
    audioUrl?: string;
    imageUrl?: string;
    videoUrl?: string;
    platformContent: Record<string, PlatformContent>;
  };
  error?: string;
}

/**
 * Generate new Prime content using the content engine
 */
export async function generatePrimeContent(request: GenerateContentRequest): Promise<GeneratedContentResponse> {
  const { data, error } = await supabase.functions.invoke('prime-content-engine', {
    body: request
  });

  if (error) {
    console.error('Content generation error:', error);
    return { success: false, error: error.message };
  }

  return data;
}

/**
 * Fetch content queue with optional filters
 */
export async function fetchContentQueue(filters?: {
  status?: ContentStatus;
  contentType?: ContentType;
  limit?: number;
}): Promise<PrimeContent[]> {
  let query = supabase
    .from('prime_content_queue')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.contentType) {
    query = query.eq('content_type', filters.contentType);
  }
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Failed to fetch content queue:', error);
    return [];
  }

  return (data || []) as unknown as PrimeContent[];
}

/**
 * Update content status (approve, reject, schedule)
 */
export async function updateContentStatus(
  contentId: string,
  status: ContentStatus,
  options?: {
    scheduledFor?: string;
    rejectionReason?: string;
  }
): Promise<boolean> {
  const updateData: Record<string, any> = {
    status,
    reviewed_at: new Date().toISOString()
  };

  if (options?.scheduledFor) {
    updateData.scheduled_for = options.scheduledFor;
  }
  if (options?.rejectionReason) {
    updateData.rejection_reason = options.rejectionReason;
  }

  const { error } = await supabase
    .from('prime_content_queue')
    .update(updateData)
    .eq('id', contentId);

  if (error) {
    console.error('Failed to update content status:', error);
    return false;
  }

  return true;
}

/**
 * Mark content as posted to specific platforms
 */
export async function markAsPosted(
  contentId: string,
  platforms: string[],
  engagementMetrics?: Record<string, any>
): Promise<boolean> {
  const { data: current } = await supabase
    .from('prime_content_queue')
    .select('platforms_posted')
    .eq('id', contentId)
    .single();

  const existingPlatforms = (current?.platforms_posted as string[]) || [];
  const allPlatforms = [...new Set([...existingPlatforms, ...platforms])];

  const { error } = await supabase
    .from('prime_content_queue')
    .update({
      status: 'posted',
      posted_at: new Date().toISOString(),
      platforms_posted: allPlatforms,
      engagement_metrics: engagementMetrics || {}
    })
    .eq('id', contentId);

  if (error) {
    console.error('Failed to mark content as posted:', error);
    return false;
  }

  return true;
}

/**
 * Delete content from queue
 */
export async function deleteContent(contentId: string): Promise<boolean> {
  const { error } = await supabase
    .from('prime_content_queue')
    .delete()
    .eq('id', contentId);

  if (error) {
    console.error('Failed to delete content:', error);
    return false;
  }

  return true;
}

/**
 * Get content statistics
 */
export async function getContentStats(): Promise<{
  pending: number;
  ready: number;
  approved: number;
  posted: number;
  totalThisWeek: number;
}> {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const { data, error } = await supabase
    .from('prime_content_queue')
    .select('status, created_at');

  if (error || !data) {
    return { pending: 0, ready: 0, approved: 0, posted: 0, totalThisWeek: 0 };
  }

  const stats = {
    pending: 0,
    ready: 0,
    approved: 0,
    posted: 0,
    totalThisWeek: 0
  };

  data.forEach((item: any) => {
    if (item.status === 'pending') stats.pending++;
    if (item.status === 'ready') stats.ready++;
    if (item.status === 'approved' || item.status === 'scheduled') stats.approved++;
    if (item.status === 'posted') stats.posted++;
    if (new Date(item.created_at) >= oneWeekAgo) stats.totalThisWeek++;
  });

  return stats;
}
