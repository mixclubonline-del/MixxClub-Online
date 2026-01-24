import { supabase } from "@/integrations/supabase/client";

export type AssetType = 'video-reference' | 'image-reference' | 'voice-sample' | 'style-guide' | 'thumbnail';

export interface PrimeBrandAsset {
  id: string;
  asset_type: AssetType;
  name: string;
  description: string | null;
  storage_path: string;
  public_url: string;
  usage_context: string[] | null;
  is_canonical: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface VisualIdentity {
  character_appearance?: {
    description: string;
    lighting: string;
    framing: string;
    energy: string;
    attire: string;
  };
  video_style?: {
    duration_tiktok: string;
    duration_reels: string;
    duration_twitter: string;
    motion: string;
    background: string;
    text_overlay_style: string;
    transitions: string;
  };
  voice_characteristics?: {
    tone: string;
    pacing: string;
    style: string;
  };
  canonical_references?: string[];
}

/**
 * Fetch all Prime brand assets
 */
export async function fetchBrandAssets(filters?: {
  assetType?: AssetType;
  isCanonical?: boolean;
}): Promise<PrimeBrandAsset[]> {
  let query = supabase
    .from('prime_brand_assets')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.assetType) {
    query = query.eq('asset_type', filters.assetType);
  }
  if (filters?.isCanonical !== undefined) {
    query = query.eq('is_canonical', filters.isCanonical);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Failed to fetch brand assets:', error);
    return [];
  }

  return (data || []) as unknown as PrimeBrandAsset[];
}

/**
 * Get the canonical asset for a specific type and context
 */
export async function getCanonicalAsset(
  assetType: AssetType,
  usageContext?: string
): Promise<PrimeBrandAsset | null> {
  let query = supabase
    .from('prime_brand_assets')
    .select('*')
    .eq('asset_type', assetType)
    .eq('is_canonical', true);

  if (usageContext) {
    query = query.contains('usage_context', [usageContext]);
  }

  const { data, error } = await query.single();

  if (error) {
    console.error('Failed to fetch canonical asset:', error);
    return null;
  }

  return data as unknown as PrimeBrandAsset;
}

/**
 * Fetch Prime's visual identity configuration
 */
export async function fetchVisualIdentity(): Promise<VisualIdentity | null> {
  const { data, error } = await supabase
    .from('prime_persona_config')
    .select('visual_identity')
    .eq('is_active', true)
    .single();

  if (error) {
    console.error('Failed to fetch visual identity:', error);
    return null;
  }

  return (data?.visual_identity as VisualIdentity) || null;
}

/**
 * Register a new brand asset
 */
export async function registerBrandAsset(asset: {
  assetType: AssetType;
  name: string;
  description?: string;
  storagePath: string;
  publicUrl: string;
  usageContext?: string[];
  isCanonical?: boolean;
  metadata?: Record<string, any>;
}): Promise<PrimeBrandAsset | null> {
  const { data, error } = await supabase
    .from('prime_brand_assets')
    .insert({
      asset_type: asset.assetType,
      name: asset.name,
      description: asset.description,
      storage_path: asset.storagePath,
      public_url: asset.publicUrl,
      usage_context: asset.usageContext,
      is_canonical: asset.isCanonical || false,
      metadata: asset.metadata || {}
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to register brand asset:', error);
    return null;
  }

  return data as unknown as PrimeBrandAsset;
}

/**
 * Set an asset as the canonical reference (unsets others of same type)
 */
export async function setCanonicalAsset(assetId: string): Promise<boolean> {
  // Get the asset type first
  const { data: asset } = await supabase
    .from('prime_brand_assets')
    .select('asset_type')
    .eq('id', assetId)
    .single();

  if (!asset) return false;

  // Unset other canonical assets of the same type
  await supabase
    .from('prime_brand_assets')
    .update({ is_canonical: false })
    .eq('asset_type', asset.asset_type)
    .neq('id', assetId);

  // Set this one as canonical
  const { error } = await supabase
    .from('prime_brand_assets')
    .update({ is_canonical: true })
    .eq('id', assetId);

  if (error) {
    console.error('Failed to set canonical asset:', error);
    return false;
  }

  return true;
}

/**
 * Delete a brand asset
 */
export async function deleteBrandAsset(assetId: string): Promise<boolean> {
  const { error } = await supabase
    .from('prime_brand_assets')
    .delete()
    .eq('id', assetId);

  if (error) {
    console.error('Failed to delete brand asset:', error);
    return false;
  }

  return true;
}

/**
 * Update visual identity configuration
 */
export async function updateVisualIdentity(identity: VisualIdentity): Promise<boolean> {
  const { error } = await supabase
    .from('prime_persona_config')
    .update({ 
      visual_identity: JSON.parse(JSON.stringify(identity)),
      updated_at: new Date().toISOString()
    })
    .eq('is_active', true);

  if (error) {
    console.error('Failed to update visual identity:', error);
    return false;
  }

  return true;
}
