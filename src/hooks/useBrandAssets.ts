import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BrandAsset {
  id: string;
  asset_type: 'logo' | 'video' | 'background' | 'image';
  name: string;
  prompt_used: string | null;
  storage_path: string;
  public_url: string;
  thumbnail_url: string | null;
  created_by: string | null;
  is_active: boolean;
  asset_context: 'hero' | 'navigation' | 'favicon' | 'splash' | 'background' | 'general' | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

interface BrandSetting {
  id: string;
  active_asset_id: string | null;
  setting_value: Record<string, unknown>;
  updated_at: string;
}

export function useBrandAssets() {
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);

  // Fetch all brand assets
  const { data: assets = [], isLoading: assetsLoading } = useQuery({
    queryKey: ['brand-assets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brand_assets')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as BrandAsset[];
    }
  });

  // Fetch brand settings
  const { data: settings = [], isLoading: settingsLoading } = useQuery({
    queryKey: ['brand-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brand_settings')
        .select('*');
      
      if (error) throw error;
      return data as BrandSetting[];
    }
  });

  // Get active asset for a specific context
  const getActiveAsset = useCallback((settingId: string): BrandAsset | null => {
    const setting = settings.find(s => s.id === settingId);
    if (!setting?.active_asset_id) return null;
    return assets.find(a => a.id === setting.active_asset_id) || null;
  }, [assets, settings]);

  // Save generated asset to storage and database
  const saveAsset = useCallback(async (
    base64Data: string,
    assetType: 'logo' | 'video' | 'background' | 'image',
    name: string,
    prompt: string,
    context?: 'hero' | 'navigation' | 'favicon' | 'splash' | 'background' | 'general'
  ) => {
    setIsUploading(true);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      // Convert base64 to blob
      const isDataUrl = base64Data.startsWith('data:');
      let mimeType = assetType === 'video' ? 'video/mp4' : 'image/png';
      let base64Content = base64Data;
      
      if (isDataUrl) {
        const matches = base64Data.match(/^data:([^;]+);base64,(.+)$/);
        if (matches) {
          mimeType = matches[1];
          base64Content = matches[2];
        }
      }
      
      const byteCharacters = atob(base64Content);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });

      // Generate filename
      const extension = mimeType.split('/')[1] || (assetType === 'video' ? 'mp4' : 'png');
      const timestamp = Date.now();
      const fileName = `${assetType}s/${name.toLowerCase().replace(/\s+/g, '-')}-${timestamp}.${extension}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('brand-assets')
        .upload(fileName, blob, {
          contentType: mimeType,
          cacheControl: '3600',
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('brand-assets')
        .getPublicUrl(fileName);

      // Save to database
      const { data: asset, error: dbError } = await supabase
        .from('brand_assets')
        .insert({
          asset_type: assetType,
          name,
          prompt_used: prompt,
          storage_path: fileName,
          public_url: publicUrl,
          created_by: user?.id || null,
          asset_context: context || 'general',
          metadata: { originalMimeType: mimeType }
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['brand-assets'] });

      toast.success(`${name} saved successfully!`);
      return asset as BrandAsset;

    } catch (error) {
      console.error('Error saving asset:', error);
      toast.error('Failed to save asset');
      throw error;
    } finally {
      setIsUploading(false);
    }
  }, [queryClient]);

  // Save asset from URL (for external URLs)
  const saveAssetFromUrl = useCallback(async (
    url: string,
    assetType: 'logo' | 'video' | 'background' | 'image',
    name: string,
    prompt: string,
    context?: 'hero' | 'navigation' | 'favicon' | 'splash' | 'background' | 'general'
  ) => {
    setIsUploading(true);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      // Fetch the file
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch asset');
      
      const blob = await response.blob();
      const mimeType = blob.type || (assetType === 'video' ? 'video/mp4' : 'image/png');
      
      // Generate filename
      const extension = mimeType.split('/')[1] || (assetType === 'video' ? 'mp4' : 'png');
      const timestamp = Date.now();
      const fileName = `${assetType}s/${name.toLowerCase().replace(/\s+/g, '-')}-${timestamp}.${extension}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('brand-assets')
        .upload(fileName, blob, {
          contentType: mimeType,
          cacheControl: '3600',
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('brand-assets')
        .getPublicUrl(fileName);

      // Save to database
      const { data: asset, error: dbError } = await supabase
        .from('brand_assets')
        .insert({
          asset_type: assetType,
          name,
          prompt_used: prompt,
          storage_path: fileName,
          public_url: publicUrl,
          created_by: user?.id || null,
          asset_context: context || 'general',
          metadata: { originalUrl: url }
        })
        .select()
        .single();

      if (dbError) throw dbError;

      queryClient.invalidateQueries({ queryKey: ['brand-assets'] });
      toast.success(`${name} saved successfully!`);
      return asset as BrandAsset;

    } catch (error) {
      console.error('Error saving asset from URL:', error);
      toast.error('Failed to save asset');
      throw error;
    } finally {
      setIsUploading(false);
    }
  }, [queryClient]);

  // Apply asset as active
  const applyAsset = useMutation({
    mutationFn: async ({ assetId, settingId }: { assetId: string; settingId: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Update brand_settings
      const { error: settingsError } = await supabase
        .from('brand_settings')
        .upsert({
          id: settingId,
          active_asset_id: assetId,
          updated_at: new Date().toISOString(),
          updated_by: user?.id || null
        });

      if (settingsError) throw settingsError;

      // Update the asset's is_active flag
      // First, deactivate all assets of the same context
      const asset = assets.find(a => a.id === assetId);
      if (asset?.asset_context) {
        await supabase
          .from('brand_assets')
          .update({ is_active: false })
          .eq('asset_context', asset.asset_context);
      }

      // Then activate this one
      const { error: assetError } = await supabase
        .from('brand_assets')
        .update({ is_active: true })
        .eq('id', assetId);

      if (assetError) throw assetError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-assets'] });
      queryClient.invalidateQueries({ queryKey: ['brand-settings'] });
      toast.success('Asset applied successfully!');
    },
    onError: (error) => {
      console.error('Error applying asset:', error);
      toast.error('Failed to apply asset');
    }
  });

  // Delete asset
  const deleteAsset = useMutation({
    mutationFn: async (assetId: string) => {
      const asset = assets.find(a => a.id === assetId);
      if (!asset) throw new Error('Asset not found');

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('brand-assets')
        .remove([asset.storage_path]);

      if (storageError) console.warn('Storage deletion error:', storageError);

      // Delete from database
      const { error: dbError } = await supabase
        .from('brand_assets')
        .delete()
        .eq('id', assetId);

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-assets'] });
      toast.success('Asset deleted');
    },
    onError: (error) => {
      console.error('Error deleting asset:', error);
      toast.error('Failed to delete asset');
    }
  });

  return {
    assets,
    settings,
    isLoading: assetsLoading || settingsLoading,
    isUploading,
    getActiveAsset,
    saveAsset,
    saveAssetFromUrl,
    applyAsset: applyAsset.mutate,
    deleteAsset: deleteAsset.mutate,
    isApplying: applyAsset.isPending,
    isDeleting: deleteAsset.isPending,
  };
}
