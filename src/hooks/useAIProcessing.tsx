import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "./useAuth";

interface AIProcessingParams {
  [key: string]: number;
}

interface AIProcessingResult {
  success: boolean;
  processedAudio?: Float32Array;
  analysis?: {
    rms: number;
    peak: number;
    dynamicRange: number;
    frequencyBalance: {
      low: number;
      mid: number;
      high: number;
    };
    quality: number;
    effectType: string;
  };
  suggestions?: string[];
  error?: string;
}

export const useAIProcessing = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();

  const processAudio = useCallback(async (
    audioData: Float32Array,
    effectType: 'pitch' | 'harmony' | 'reverb' | 'filter' | 'enhance' | 'spatial',
    parameters: AIProcessingParams,
    trackId: string
  ): Promise<AIProcessingResult> => {
    setIsProcessing(true);
    setProcessingProgress(0);

    try {
      // Simulate processing progress
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const { data, error } = await supabase.functions.invoke('ai-audio-processing', {
        body: {
          audioData: Array.from(audioData), // Convert to regular array for JSON
          effectType,
          parameters,
          trackId,
          userId: user?.id || 'anonymous'
        }
      });

      clearInterval(progressInterval);
      setProcessingProgress(100);

      if (error) {
        throw new Error(error.message || 'AI processing failed');
      }

      if (!data.success) {
        throw new Error(data.error || 'Processing failed');
      }

      // Convert processed audio back to Float32Array
      const processedAudio = data.processedAudio ? new Float32Array(data.processedAudio) : undefined;

      const result: AIProcessingResult = {
        success: true,
        processedAudio,
        analysis: data.analysis,
        suggestions: data.suggestions
      };

      toast({
        title: "AI Processing Complete",
        description: `Successfully applied ${effectType} effect with quality score: ${data.analysis?.quality || 'N/A'}`,
      });

      return result;

    } catch (error) {
      console.error('AI Processing Error:', error);
      
      const result: AIProcessingResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown processing error'
      };

      toast({
        title: "AI Processing Failed",
        description: result.error,
        variant: "destructive"
      });

      return result;

    } finally {
      setIsProcessing(false);
      setTimeout(() => setProcessingProgress(0), 1000);
    }
  }, [toast]);

  const batchProcessAudio = useCallback(async (
    audioDataArray: Float32Array[],
    effectType: 'pitch' | 'harmony' | 'reverb' | 'filter' | 'enhance' | 'spatial',
    parameters: AIProcessingParams,
    trackIds: string[]
  ): Promise<AIProcessingResult[]> => {
    setIsProcessing(true);
    setProcessingProgress(0);

    const results: AIProcessingResult[] = [];
    const total = audioDataArray.length;

    try {
      for (let i = 0; i < audioDataArray.length; i++) {
        const result = await processAudio(
          audioDataArray[i],
          effectType,
          parameters,
          trackIds[i]
        );
        
        results.push(result);
        setProcessingProgress((i + 1) / total * 100);
      }

      toast({
        title: "Batch Processing Complete",
        description: `Processed ${results.length} tracks successfully`,
      });

      return results;

    } catch (error) {
      console.error('Batch Processing Error:', error);
      toast({
        title: "Batch Processing Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
      return results;

    } finally {
      setIsProcessing(false);
      setTimeout(() => setProcessingProgress(0), 1000);
    }
  }, [processAudio, toast]);

  const analyzeAudio = useCallback(async (
    audioData: Float32Array,
    trackId: string
  ): Promise<AIProcessingResult> => {
    try {
      // Use the enhance effect with minimal parameters for analysis
      return await processAudio(audioData, 'enhance', { 
        clarity: 0, 
        warmth: 0, 
        presence: 0 
      }, trackId);
    } catch (error) {
      console.error('Audio Analysis Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Analysis failed'
      };
    }
  }, [processAudio]);

  const getSuggestions = useCallback(async (
    analysis: any,
    effectType: string
  ): Promise<string[]> => {
    // Generate contextual suggestions based on analysis
    const suggestions: string[] = [];

    if (analysis.quality < 60) {
      suggestions.push("Consider improving the source audio quality");
    }

    if (analysis.peak > 0.9) {
      suggestions.push("Audio is close to clipping - reduce gain");
    }

    if (analysis.dynamicRange < 10) {
      suggestions.push("Low dynamic range - try less compression");
    }

    if (analysis.rms < 0.1) {
      suggestions.push("Audio level is low - consider boosting signal");
    }

    // Effect-specific suggestions
    switch (effectType) {
      case 'pitch':
        if (analysis.frequencyBalance.high < 0.2) {
          suggestions.push("Boost high frequencies for clarity after pitch correction");
        }
        break;
      case 'reverb':
        if (analysis.frequencyBalance.mid > 0.6) {
          suggestions.push("High mid content may get muddy with reverb");
        }
        break;
      case 'harmony':
        if (analysis.frequencyBalance.low > 0.5) {
          suggestions.push("Consider high-pass filtering before adding harmonies");
        }
        break;
    }

    return suggestions;
  }, []);

  return {
    isProcessing,
    processingProgress,
    processAudio,
    batchProcessAudio,
    analyzeAudio,
    getSuggestions
  };
};