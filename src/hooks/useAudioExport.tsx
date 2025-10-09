import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Track } from "@/stores/aiStudioStore";

type ExportFormat = 'wav' | 'mp3' | 'stems' | 'project';
type ExportQuality = 'low' | 'medium' | 'high';

interface ExportOptions {
  format: ExportFormat;
  quality: ExportQuality;
  sampleRate: 44100 | 48000 | 96000;
  bitDepth: 16 | 24 | 32;
}

interface ExportResult {
  success: boolean;
  downloadUrl?: string;
  filename?: string;
  fileSize?: number;
  duration?: number;
  stems?: Array<{
    trackId: string;
    trackName: string;
    downloadUrl: string;
    fileSize: number;
  }>;
  error?: string;
}

export const useAudioExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const { toast } = useToast();

  const exportAudio = useCallback(async (
    tracks: Track[],
    masterVolume: number,
    options: ExportOptions
  ): Promise<ExportResult> => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      // Simulate export progress
      const progressInterval = setInterval(() => {
        setExportProgress(prev => Math.min(prev + 5, 90));
      }, 200);

      // Prepare track data for export
      const exportData = {
        tracks: tracks.map(track => ({
          id: track.id,
          name: track.name,
          regions: track.regions.map(region => ({
            id: region.id,
            audioData: region.blob ? [] : [], // Simplified for now - TODO: implement blob conversion
            start: region.start,
            end: region.end,
            gain: region.gain
          })),
          effects: track.effects,
          volume: track.volume,
          mute: track.mute,
          solo: track.solo
        })),
        format: options.format,
        quality: options.quality,
        sampleRate: options.sampleRate,
        bitDepth: options.bitDepth,
        masterVolume
      };

      const { data, error } = await supabase.functions.invoke('export-audio', {
        body: exportData
      });

      clearInterval(progressInterval);
      setExportProgress(100);

      if (error) {
        throw new Error(error.message || 'Export failed');
      }

      if (!data.success) {
        throw new Error(data.error || 'Export processing failed');
      }

      const result: ExportResult = {
        success: true,
        downloadUrl: data.downloadUrl,
        filename: data.filename || `export-${Date.now()}.${options.format}`,
        fileSize: data.fileSize,
        duration: data.duration,
        stems: data.stems
      };

      toast({
        title: "Export Complete",
        description: `Successfully exported ${options.format.toUpperCase()} file`,
      });

      return result;

    } catch (error) {
      console.error('Export Error:', error);
      
      const result: ExportResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown export error'
      };

      toast({
        title: "Export Failed",
        description: result.error,
        variant: "destructive"
      });

      return result;

    } finally {
      setIsExporting(false);
      setTimeout(() => setExportProgress(0), 1000);
    }
  }, [toast]);

  const downloadFile = useCallback((downloadUrl: string, filename: string) => {
    try {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Download Started",
        description: `Downloading ${filename}`,
      });

    } catch (error) {
      console.error('Download Error:', error);
      toast({
        title: "Download Failed",
        description: "Failed to start download",
        variant: "destructive"
      });
    }
  }, [toast]);

  const exportMixdown = useCallback(async (
    tracks: Track[],
    masterVolume: number,
    options: Omit<ExportOptions, 'format'> & { format: 'wav' | 'mp3' }
  ) => {
    return exportAudio(tracks, masterVolume, options);
  }, [exportAudio]);

  const exportStems = useCallback(async (
    tracks: Track[],
    masterVolume: number,
    options: Omit<ExportOptions, 'format'>
  ) => {
    return exportAudio(tracks, masterVolume, { ...options, format: 'stems' });
  }, [exportAudio]);

  const exportProject = useCallback(async (
    tracks: Track[],
    masterVolume: number,
    options: Omit<ExportOptions, 'format'>
  ) => {
    return exportAudio(tracks, masterVolume, { ...options, format: 'project' });
  }, [exportAudio]);

  const getRecommendedSettings = useCallback((
    format: ExportFormat,
    purpose: 'streaming' | 'cd' | 'mastering' | 'demo'
  ): ExportOptions => {
    const settings: { [key: string]: ExportOptions } = {
      streaming: {
        format: format === 'project' ? 'mp3' : format,
        quality: 'medium',
        sampleRate: 44100,
        bitDepth: 16
      },
      cd: {
        format: format === 'project' ? 'wav' : format,
        quality: 'high',
        sampleRate: 44100,
        bitDepth: 16
      },
      mastering: {
        format: format === 'project' ? 'wav' : format,
        quality: 'high',
        sampleRate: 96000,
        bitDepth: 24
      },
      demo: {
        format: format === 'project' ? 'mp3' : format,
        quality: 'low',
        sampleRate: 44100,
        bitDepth: 16
      }
    };

    return settings[purpose] || settings.streaming;
  }, []);

  return {
    isExporting,
    exportProgress,
    exportAudio,
    exportMixdown,
    exportStems,
    exportProject,
    downloadFile,
    getRecommendedSettings
  };
};

// Helper function to convert blob to Float32Array
async function blobToFloatArray(blob: Blob): Promise<number[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const arrayBuffer = reader.result as ArrayBuffer;
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        audioContext.decodeAudioData(arrayBuffer)
          .then(audioBuffer => {
            const channelData = audioBuffer.getChannelData(0);
            resolve(Array.from(channelData));
          })
          .catch(reject);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(blob);
  });
}