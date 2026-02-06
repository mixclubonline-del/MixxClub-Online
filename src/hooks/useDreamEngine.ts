import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type DreamMode = 'image' | 'video' | 'audio' | 'speech' | 'image-edit';

export interface AssetContext {
  id: string;
  context_prefix: string;
  name: string;
  description: string | null;
  icon: string | null;
}

export interface GenerationResult {
  url: string;
  type: string;
  context?: string;
  savedAssetId?: string;
  operationId?: string;
}

export interface GenerationHistoryItem {
  id: string;
  mode: DreamMode;
  prompt: string;
  context: string | null;
  provider: string;
  result_url: string | null;
  saved_asset_id: string | null;
  generation_time_ms: number | null;
  created_at: string;
}

export interface DreamEngineCapabilities {
  image: boolean;
  video: boolean;
  audio: boolean;
  speech: boolean;
  imageEdit: boolean;
}

interface UseDreamEngineReturn {
  // State
  isGenerating: boolean;
  lastResult: GenerationResult | null;
  error: string | null;
  pendingOperation: string | null;
  isPolling: boolean;
  
  // Contexts
  contexts: AssetContext[];
  loadingContexts: boolean;
  refreshContexts: () => Promise<void>;
  
  // History
  history: GenerationHistoryItem[];
  loadingHistory: boolean;
  refreshHistory: () => Promise<void>;
  
  // Live assets
  liveAssets: Map<string, { id: string; url: string }>;
  loadingLiveAssets: boolean;
  refreshLiveAssets: () => Promise<void>;
  
  // Actions
  generate: (
    mode: DreamMode,
    prompt: string,
    context?: string,
    options?: {
      model?: string;
      style?: string;
      save?: boolean;
      makeActive?: boolean;
      name?: string;
      sourceAsset?: string;
    }
  ) => Promise<GenerationResult | null>;
  
  pollOperation: (operationId: string) => Promise<GenerationResult | null>;
  
  saveGeneration: (
    url: string,
    context: string,
    mode: DreamMode,
    prompt: string,
    name?: string,
    makeActive?: boolean
  ) => Promise<string | null>;
  
  setAssetActive: (assetId: string, context: string) => Promise<boolean>;
  
  // Capabilities
  capabilities: DreamEngineCapabilities;
}

export function useDreamEngine(): UseDreamEngineReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastResult, setLastResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingOperation, setPendingOperation] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  
  const [contexts, setContexts] = useState<AssetContext[]>([]);
  const [loadingContexts, setLoadingContexts] = useState(true);
  
  const [history, setHistory] = useState<GenerationHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  const [liveAssets, setLiveAssets] = useState<Map<string, { id: string; url: string }>>(new Map());
  const [loadingLiveAssets, setLoadingLiveAssets] = useState(false);

  // Capabilities based on available APIs (we assume image is always available)
  const capabilities: DreamEngineCapabilities = {
    image: true,
    video: true, // Replicate key is configured
    audio: true, // Suno key is configured  
    speech: false, // ElevenLabs not connected yet
    imageEdit: true,
  };

  // Load contexts
  const refreshContexts = useCallback(async () => {
    setLoadingContexts(true);
    try {
      const { data, error } = await supabase
        .from("asset_contexts")
        .select("*")
        .order("name");
      
      if (error) throw error;
      setContexts((data as AssetContext[]) || []);
    } catch (err) {
      console.error("Failed to load contexts:", err);
    } finally {
      setLoadingContexts(false);
    }
  }, []);

  // Load generation history
  const refreshHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from("generation_history")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      
      if (error) throw error;
      setHistory((data as GenerationHistoryItem[]) || []);
    } catch (err) {
      console.error("Failed to load history:", err);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  // Load live assets per context
  const refreshLiveAssets = useCallback(async () => {
    setLoadingLiveAssets(true);
    try {
      const { data, error } = await supabase
        .from("brand_assets")
        .select("id, public_url, asset_context")
        .eq("is_active", true)
        .not("asset_context", "is", null);
      
      if (error) throw error;
      
      const assetMap = new Map<string, { id: string; url: string }>();
      for (const asset of data || []) {
        if (asset.asset_context) {
          assetMap.set(asset.asset_context, {
            id: asset.id,
            url: asset.public_url,
          });
        }
      }
      setLiveAssets(assetMap);
    } catch (err) {
      console.error("Failed to load live assets:", err);
    } finally {
      setLoadingLiveAssets(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    refreshContexts();
    refreshLiveAssets();
  }, [refreshContexts, refreshLiveAssets]);

  // Generate asset
  const generate = useCallback(async (
    mode: DreamMode,
    prompt: string,
    context?: string,
    options?: {
      model?: string;
      style?: string;
      save?: boolean;
      makeActive?: boolean;
      name?: string;
      sourceAsset?: string;
    }
  ): Promise<GenerationResult | null> => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const { data, error: fnError } = await supabase.functions.invoke("dream-engine", {
        body: {
          mode,
          prompt,
          context,
          sourceAsset: options?.sourceAsset,
          options: {
            model: options?.model,
            style: options?.style,
            save: options?.save,
            makeActive: options?.makeActive,
            name: options?.name,
          },
        },
      });
      
      if (fnError) throw fnError;
      if (!data?.ok) throw new Error(data?.error || "Generation failed");
      
      const result: GenerationResult = {
        url: data.asset.url,
        type: data.asset.type,
        context: data.asset.context,
        savedAssetId: data.asset.savedAssetId,
        operationId: data.asset.operationId,
      };

      // If this is an async VEO operation, start polling
      if (result.operationId) {
        setPendingOperation(result.operationId);
        toast.info("Video generation started — this takes 1-2 minutes...");
        // Auto-poll
        const polledResult = await pollOperationInternal(result.operationId);
        if (polledResult) {
          return polledResult;
        }
        return result;
      }
      
      setLastResult(result);
      toast.success(`${mode} generated successfully!`);
      
      // Refresh live assets if we saved and made active
      if (options?.save && options?.makeActive) {
        refreshLiveAssets();
      }
      
      return result;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Generation failed";
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [refreshLiveAssets]);

  // Poll a VEO operation until complete
  const pollOperationInternal = useCallback(async (operationId: string): Promise<GenerationResult | null> => {
    setIsPolling(true);
    setPendingOperation(operationId);

    const maxAttempts = 30; // 5 minutes at 10s intervals
    let attempts = 0;

    try {
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 10000)); // 10s delay
        attempts++;

        console.log(`Polling VEO operation (attempt ${attempts}/${maxAttempts}):`, operationId);

        const { data, error: fnError } = await supabase.functions.invoke("check-video-status", {
          body: { operationName: operationId },
        });

        if (fnError) {
          console.error("Poll error:", fnError);
          continue;
        }

        if (!data?.success) {
          console.error("Poll failed:", data?.error);
          continue;
        }

        if (data.done) {
          const result: GenerationResult = {
            url: data.videoUrl,
            type: 'video',
          };
          setLastResult(result);
          setPendingOperation(null);
          toast.success("Video generation complete!");
          return result;
        }
      }

      throw new Error("Video generation timed out after 5 minutes");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Polling failed";
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsPolling(false);
      setPendingOperation(null);
    }
  }, []);

  // Public poll method
  const pollOperation = useCallback(async (operationId: string): Promise<GenerationResult | null> => {
    return pollOperationInternal(operationId);
  }, [pollOperationInternal]);

  // Save a generation to brand_assets
  const saveGeneration = useCallback(async (
    url: string,
    context: string,
    mode: DreamMode,
    prompt: string,
    name?: string,
    makeActive?: boolean
  ): Promise<string | null> => {
    try {
      const assetType = mode === 'video' ? 'video' : mode === 'audio' ? 'audio' : 'image';
      
      const { data, error } = await supabase.functions.invoke("save-brand-asset", {
        body: {
          imageUrl: url,
          assetContext: context,
          promptUsed: prompt,
          name: name || `${context}_${Date.now()}`,
          assetType,
          setActive: makeActive ?? false,
          deactivateSiblings: makeActive ?? false,
        },
      });
      
      if (error || !data?.ok) {
        throw new Error(data?.message || "Failed to save asset");
      }
      
      toast.success("Asset saved to library!");
      
      if (makeActive) {
        refreshLiveAssets();
      }
      
      return data.asset.id;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Save failed";
      toast.error(message);
      return null;
    }
  }, [refreshLiveAssets]);

  // Set an existing asset as active
  const setAssetActive = useCallback(async (assetId: string, context: string): Promise<boolean> => {
    try {
      // Deactivate siblings
      await supabase
        .from("brand_assets")
        .update({ is_active: false })
        .eq("asset_context", context);
      
      // Activate this asset
      const { error } = await supabase
        .from("brand_assets")
        .update({ is_active: true })
        .eq("id", assetId);
      
      if (error) throw error;
      
      toast.success("Asset is now live!");
      refreshLiveAssets();
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to activate asset";
      toast.error(message);
      return false;
    }
  }, [refreshLiveAssets]);

  return {
    isGenerating,
    lastResult,
    error,
    pendingOperation,
    isPolling,
    contexts,
    loadingContexts,
    refreshContexts,
    history,
    loadingHistory,
    refreshHistory,
    liveAssets,
    loadingLiveAssets,
    refreshLiveAssets,
    generate,
    pollOperation,
    saveGeneration,
    setAssetActive,
    capabilities,
  };
}
