import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "@/hooks/use-toast";

interface AudioAnalysisResult {
  bpm: number;
  timeSignature: string;
  keySignature: string;
  genre: string;
  confidence: number;
  audioQuality: string;
  duration: number;
  instruments: string[];
  rhythmPattern: string;
  recommendations: {
    sessionBpm: number;
    sessionTimeSignature: string;
    suggestedEffects: string[];
  };
}

interface ImportedAudioFile {
  id: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  duration?: number;
  sampleRate?: number;
  channels?: number;
  url?: string;
  analysis?: AudioAnalysisResult;
}

interface AudioAnalysis {
  duration: number;
  sampleRate: number;
  channels: number;
  peaks: number[];
}

export const useAudioImport = (sessionId: string) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();

  const analyzeAudioFile = useCallback(async (file: File): Promise<AudioAnalysis> => {
    return new Promise((resolve, reject) => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const fileReader = new FileReader();

      fileReader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          
          // Generate peaks for waveform visualization
          const peaks: number[] = [];
          const channelData = audioBuffer.getChannelData(0);
          const peakSamples = 1000; // Number of peaks to generate
          const samplesPerPeak = Math.floor(channelData.length / peakSamples);
          
          for (let i = 0; i < peakSamples; i++) {
            let peak = 0;
            for (let j = 0; j < samplesPerPeak; j++) {
              const sample = Math.abs(channelData[i * samplesPerPeak + j] || 0);
              peak = Math.max(peak, sample);
            }
            peaks.push(peak);
          }

          resolve({
            duration: audioBuffer.duration,
            sampleRate: audioBuffer.sampleRate,
            channels: audioBuffer.numberOfChannels,
            peaks
          });
        } catch (error) {
          reject(error);
        }
      };

      fileReader.onerror = () => reject(new Error('Failed to read file'));
      fileReader.readAsArrayBuffer(file);
    });
  }, []);

  const importAudioFile = useCallback(async (file: File): Promise<ImportedAudioFile> => {
    if (!user) {
      throw new Error('User must be authenticated');
    }

    // Validate file type
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/flac', 'audio/aac', 'audio/ogg', 'audio/webm'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Invalid audio file type. Supported formats: MP3, WAV, FLAC, AAC, OGG, WEBM');
    }

    // Validate file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      throw new Error('File size must be less than 50MB');
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Analyze audio file
      toast({
        title: "Analyzing audio...",
        description: "Getting audio file information",
      });

      const analysis = await analyzeAudioFile(file);

      // Create file path with user ID for security
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = `${user.id}/${sessionId}/${fileName}`;

      // Upload to Supabase Storage
      toast({
        title: "Uploading audio...",
        description: "Uploading your audio file to the cloud",
      });

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('audio-files')
        .upload(filePath, file);

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Store file metadata in database
      const { data: dbData, error: dbError } = await supabase
        .from('daw_imported_files')
        .insert({
          user_id: user.id,
          session_id: sessionId,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          duration_seconds: analysis.duration,
          sample_rate: analysis.sampleRate,
          channels: analysis.channels
        })
        .select()
        .single();

      if (dbError) {
        // Clean up uploaded file if database insert fails
        await supabase.storage.from('audio-files').remove([filePath]);
        throw new Error(`Database error: ${dbError.message}`);
      }

      // Get signed URL for playback
      const { data: urlData } = await supabase.storage
        .from('audio-files')
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      // Start BPM analysis in background
      const analysisPromise = analyzeBPM(dbData.id, filePath, file.name);

      const importedFile: ImportedAudioFile = {
        id: dbData.id,
        fileName: file.name,
        filePath: filePath,
        fileSize: file.size,
        duration: analysis.duration,
        sampleRate: analysis.sampleRate,
        channels: analysis.channels,
        url: urlData?.signedUrl
      };

      // Try to get BPM analysis quickly
      try {
        const bpmAnalysis = await Promise.race([
          analysisPromise,
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000)) // 3 second timeout
        ]);
        
        if (bpmAnalysis) {
          importedFile.analysis = bpmAnalysis;
        }
      } catch (error) {
        console.warn('BPM analysis failed or timed out:', error);
      }

      toast({
        title: "Import successful!",
        description: `${file.name} has been imported and is ready to use`,
      });

      return importedFile;

    } catch (error: any) {
      toast({
        title: "Import failed",
        description: error.message || "Failed to import audio file",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [user, sessionId, analyzeAudioFile, toast]);

  const getImportedFiles = useCallback(async (): Promise<ImportedAudioFile[]> => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('daw_imported_files')
        .select('*')
        .eq('user_id', user.id)
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      // Get signed URLs for all files
      const filesWithUrls = await Promise.all(
        data.map(async (file) => {
          const { data: urlData } = await supabase.storage
            .from('audio-files')
            .createSignedUrl(file.file_path, 3600);

          return {
            id: file.id,
            fileName: file.file_name,
            filePath: file.file_path,
            fileSize: file.file_size,
            duration: file.duration_seconds,
            sampleRate: file.sample_rate,
            channels: file.channels,
            url: urlData?.signedUrl
          };
        })
      );

      return filesWithUrls;

    } catch (error: any) {
      console.error('Error fetching imported files:', error);
      return [];
    }
  }, [user, sessionId]);

  const deleteImportedFile = useCallback(async (fileId: string, filePath: string): Promise<void> => {
    if (!user) {
      throw new Error('User must be authenticated');
    }

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('audio-files')
        .remove([filePath]);

      if (storageError) {
        console.error('Storage deletion error:', storageError);
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('daw_imported_files')
        .delete()
        .eq('id', fileId)
        .eq('user_id', user.id);

      if (dbError) {
        throw new Error(`Failed to delete file record: ${dbError.message}`);
      }

      toast({
        title: "File deleted",
        description: "Audio file has been removed from your session",
      });

    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete audio file",
        variant: "destructive"
      });
      throw error;
    }
  }, [user, toast]);

  const analyzeBPM = useCallback(async (fileId: string, filePath: string, fileName: string): Promise<AudioAnalysisResult | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('analyze-audio', {
        body: {
          fileId,
          filePath,
          fileName
        }
      });

      if (error) {
        console.error('Error analyzing BPM:', error);
        return null;
      }

      return data?.analysis || null;
    } catch (error) {
      console.error('Error in BPM analysis:', error);
      return null;
    }
  }, []);

  return {
    importAudioFile,
    getImportedFiles,
    deleteImportedFile,
    analyzeBPM,
    isUploading,
    uploadProgress
  };
};