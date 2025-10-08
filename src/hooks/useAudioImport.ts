import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

// Minimal in-memory storage for imported files per session
// Persisting large audio in localStorage is unsafe; we keep in-memory for the app session
const importedStore: Map<string, ImportedAudioFile[]> = new Map();

export interface ImportedAudioFile {
  id: string;
  fileName: string;
  filePath: string; // synthetic path for display
  fileSize: number;
  duration?: number;
  sampleRate?: number;
  channels?: number;
  url?: string; // object URL
  analysis?: any; // optional analysis payload
}

interface UseAudioImportReturn {
  importAudioFile: (file: File) => Promise<ImportedAudioFile>;
  getImportedFiles: () => Promise<ImportedAudioFile[]>;
  deleteImportedFile: (id: string, filePath?: string) => Promise<void>;
  analyzeBPM: (file: ImportedAudioFile) => Promise<number | null>;
  isUploading: boolean;
  uploadProgress: number;
}

export function useAudioImport(sessionId: string): UseAudioImportReturn {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const revokeOnUnmount = useRef<string[]>([]);

  const ensureSessionList = useCallback(() => {
    if (!importedStore.has(sessionId)) importedStore.set(sessionId, []);
    return importedStore.get(sessionId)!;
  }, [sessionId]);

  const decodeFile = async (file: File): Promise<Pick<ImportedAudioFile, "duration" | "sampleRate" | "channels">> => {
    // Use Web Audio API to decode and extract metadata
    const arrayBuffer = await file.arrayBuffer();
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const buffer = await audioCtx.decodeAudioData(arrayBuffer.slice(0));
    return {
      duration: buffer.duration,
      sampleRate: buffer.sampleRate,
      channels: buffer.numberOfChannels,
    };
  };

  const importAudioFile = useCallback(async (file: File): Promise<ImportedAudioFile> => {
    setIsUploading(true);
    setUploadProgress(0);
    try {
      // Simulate progressive upload feedback
      setUploadProgress(20);
      const url = URL.createObjectURL(file);
      revokeOnUnmount.current.push(url);
      setUploadProgress(60);

      const meta = await decodeFile(file).catch(() => ({ duration: undefined, sampleRate: undefined, channels: undefined }));
      setUploadProgress(90);

      const item: ImportedAudioFile = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        fileName: file.name,
        filePath: `/local/${file.name}`,
        fileSize: file.size,
        url,
        ...meta,
      };

      const list = ensureSessionList();
      list.push(item);
      setUploadProgress(100);

      toast({ title: "Imported", description: `${file.name} ready to add to session` });
      return item;
    } catch (e: any) {
      console.error(e);
      toast({ title: "Import failed", description: e?.message || "Could not read audio file", variant: "destructive" });
      throw e;
    } finally {
      // reset shortly after to hide the bar
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 400);
    }
  }, [ensureSessionList, toast]);

  const getImportedFiles = useCallback(async () => {
    return ensureSessionList();
  }, [ensureSessionList]);

  const deleteImportedFile = useCallback(async (id: string) => {
    const list = ensureSessionList();
    const index = list.findIndex(f => f.id === id);
    if (index !== -1) {
      const [removed] = list.splice(index, 1);
      if (removed?.url) {
        try { URL.revokeObjectURL(removed.url); } catch {}
      }
    }
  }, [ensureSessionList]);

  const analyzeBPM = useCallback(async (_file: ImportedAudioFile): Promise<number | null> => {
    // Placeholder: simple heuristic not to block UX
    return null;
  }, []);

  // Cleanup created object URLs when the hook consumer unmounts
  useEffect(() => {
    return () => {
      revokeOnUnmount.current.forEach((u) => {
        try { URL.revokeObjectURL(u); } catch {}
      });
      revokeOnUnmount.current = [];
    };
  }, []);

  return useMemo(() => ({
    importAudioFile,
    getImportedFiles,
    deleteImportedFile,
    analyzeBPM,
    isUploading,
    uploadProgress,
  }), [importAudioFile, getImportedFiles, deleteImportedFile, analyzeBPM, isUploading, uploadProgress]);
}
