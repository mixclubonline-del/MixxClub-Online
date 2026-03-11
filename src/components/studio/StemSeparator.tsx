/**
 * StemSeparator — Standalone stem separation UI with GlassPanel design tokens.
 * Uploads audio → selects stems → calls stem-separation edge function → download results.
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import {
  Upload, Mic, Drum, Guitar, Piano, Loader2, Download,
  Play, Pause, CheckCircle, Music2, Scissors, Package,
} from 'lucide-react';
import { toast } from 'sonner';
import JSZip from 'jszip';
import { supabase } from '@/integrations/supabase/client';
import { GlassPanel } from '@/components/crm/design/GlassPanel';
import { HubHeader } from '@/components/crm/design/HubHeader';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type StemType = 'vocals' | 'drums' | 'bass' | 'other';

interface StemResult {
  type: string;
  url: string;
  format?: string;
  sampleRate?: number;
  channels?: number;
  duration?: number;
}

interface SeparationResult {
  success: boolean;
  status: string;
  stems: StemResult[];
  processingTime: number;
  model: string;
  quality: string;
}

const STEM_OPTIONS: { id: StemType; label: string; icon: React.ReactNode; color: string }[] = [
  { id: 'vocals', label: 'Vocals', icon: <Mic className="w-5 h-5" />, color: 'text-pink-400' },
  { id: 'drums', label: 'Drums', icon: <Drum className="w-5 h-5" />, color: 'text-orange-400' },
  { id: 'bass', label: 'Bass', icon: <Guitar className="w-5 h-5" />, color: 'text-blue-400' },
  { id: 'other', label: 'Other', icon: <Piano className="w-5 h-5" />, color: 'text-green-400' },
];

const ACCENT = 'rgba(236, 72, 153, 0.35)';

export const StemSeparator: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [selectedStems, setSelectedStems] = useState<StemType[]>(['vocals', 'drums', 'bass', 'other']);
  const [model, setModel] = useState('htdemucs');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<SeparationResult | null>(null);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [audioEl] = useState(() => new Audio());

  const onDrop = useCallback((files: File[]) => {
    const f = files[0];
    if (!f) return;
    if (f.size > 25 * 1024 * 1024) {
      toast.error('File too large. Maximum 25MB.');
      return;
    }
    setFile(f);
    setResults(null);
    toast.success(`${f.name} ready for stem separation`);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'audio/*': ['.mp3', '.wav', '.flac'] },
    maxFiles: 1,
  });

  const toggleStem = (stem: StemType) => {
    setSelectedStems((prev) =>
      prev.includes(stem) ? prev.filter((s) => s !== stem) : [...prev, stem]
    );
  };

  const startSeparation = async () => {
    if (!file || selectedStems.length === 0) {
      toast.error('Select at least one stem');
      return;
    }

    setIsProcessing(true);
    setProgress(10);

    try {
      // Upload to storage for a public URL
      const fileName = `stem-input/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('audio-files')
        .upload(fileName, file, { contentType: file.type, upsert: false });

      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

      const { data: urlData } = await supabase.storage
        .from('audio-files')
        .createSignedUrl(fileName, 3600);

      if (!urlData?.signedUrl) throw new Error('Failed to create signed URL');

      setProgress(30);

      const { data, error } = await supabase.functions.invoke('stem-separation', {
        body: {
          audioUrl: urlData.signedUrl,
          stems: selectedStems,
          model,
        },
      });

      if (error) throw error;

      setProgress(100);
      setResults(data as SeparationResult);
      toast.success('Stem separation complete!');
    } catch (err: any) {
      toast.error(err.message || 'Stem separation failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const playStem = (index: number, url: string) => {
    if (playingIndex === index) {
      audioEl.pause();
      setPlayingIndex(null);
    } else {
      audioEl.src = url;
      audioEl.play();
      setPlayingIndex(index);
      audioEl.onended = () => setPlayingIndex(null);
    }
  };

  const downloadAll = async () => {
    if (!results?.stems.length) return;
    try {
      const zip = new JSZip();
      for (const stem of results.stems) {
        const resp = await fetch(stem.url);
        if (!resp.ok) continue;
        const blob = await resp.blob();
        zip.file(`${stem.type}.${stem.format || 'wav'}`, blob);
      }
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `stems-${file?.name || 'track'}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Stems downloaded');
    } catch {
      toast.error('Failed to create ZIP');
    }
  };

  const reset = () => {
    audioEl.pause();
    setFile(null);
    setResults(null);
    setProgress(0);
    setPlayingIndex(null);
  };

  return (
    <div className="space-y-6">
      <HubHeader
        icon={<Scissors className="w-5 h-5 text-pink-400" />}
        title="Stem Separator"
        subtitle="Isolate vocals, drums, bass & more with AI"
        accent={ACCENT}
      />

      {/* Upload */}
      {!results && (
        <GlassPanel accent={ACCENT} glow>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-pink-400 bg-pink-500/5' : 'border-border/50 hover:border-pink-400/50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-10 h-10 text-pink-400 mx-auto mb-3" />
            <p className="text-foreground font-medium">
              {file ? file.name : 'Drop your audio file here'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {file ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : 'MP3, WAV, FLAC — Max 25MB'}
            </p>
          </div>
        </GlassPanel>
      )}

      {/* Stem Selection */}
      {file && !results && !isProcessing && (
        <GlassPanel accent={ACCENT}>
          <p className="text-foreground font-medium mb-3">Select Stems to Extract</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {STEM_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => toggleStem(opt.id)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                  selectedStems.includes(opt.id)
                    ? 'border-pink-500 bg-pink-500/10'
                    : 'border-border/30 bg-background/20 hover:border-pink-500/40'
                }`}
              >
                <div className={opt.color}>{opt.icon}</div>
                <span className="text-sm text-foreground font-medium">{opt.label}</span>
                <Checkbox checked={selectedStems.includes(opt.id)} className="pointer-events-none" />
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Model:</span>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger className="w-48 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="htdemucs">HTDemucs (Balanced)</SelectItem>
                  <SelectItem value="htdemucs_ft">HTDemucs FT (Best Quality)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1" />
            <Button onClick={startSeparation} className="bg-pink-600 hover:bg-pink-700 text-white">
              <Scissors className="w-4 h-4 mr-2" /> Separate Stems
            </Button>
          </div>
        </GlassPanel>
      )}

      {/* Processing */}
      {isProcessing && (
        <GlassPanel accent={ACCENT} glow>
          <div className="text-center py-12">
            <div className="relative inline-block mb-4">
              <Loader2 className="w-14 h-14 text-pink-400 animate-spin" />
              <Music2 className="w-5 h-5 text-pink-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="text-foreground font-medium mb-2">Separating stems…</p>
            <p className="text-sm text-muted-foreground mb-4">
              Extracting {selectedStems.join(', ')} using {model === 'htdemucs_ft' ? 'high-quality' : 'balanced'} model
            </p>
            <Progress value={progress} className="max-w-sm mx-auto" />
          </div>
        </GlassPanel>
      )}

      {/* Results */}
      <AnimatePresence>
        {results && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <GlassPanel accent={ACCENT} glow>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <p className="text-foreground font-medium">Stems Ready</p>
                <span className="ml-auto text-xs text-muted-foreground">
                  {results.processingTime ? `${results.processingTime.toFixed(1)}s` : ''} · {results.model}
                </span>
              </div>

              <div className="space-y-2">
                {results.stems.map((stem, i) => {
                  const opt = STEM_OPTIONS.find((o) => o.id === stem.type);
                  return (
                    <div
                      key={stem.type}
                      className="flex items-center gap-3 p-3 rounded-xl bg-background/20 border border-border/20"
                    >
                      <div className={opt?.color || 'text-muted-foreground'}>{opt?.icon || <Music2 className="w-5 h-5" />}</div>
                      <span className="text-sm text-foreground font-medium capitalize flex-1">{stem.type}</span>
                      <button
                        onClick={() => playStem(i, stem.url)}
                        className="p-2 rounded-lg hover:bg-background/40 transition-colors"
                      >
                        {playingIndex === i ? <Pause className="w-4 h-4 text-pink-400" /> : <Play className="w-4 h-4 text-muted-foreground" />}
                      </button>
                      <a
                        href={stem.url}
                        download={`${stem.type}.${stem.format || 'wav'}`}
                        className="p-2 rounded-lg hover:bg-background/40 transition-colors"
                      >
                        <Download className="w-4 h-4 text-muted-foreground" />
                      </a>
                    </div>
                  );
                })}
              </div>
            </GlassPanel>

            <div className="flex gap-3">
              <Button onClick={downloadAll} className="flex-1 bg-pink-600 hover:bg-pink-700 text-white">
                <Package className="w-4 h-4 mr-2" /> Download All (ZIP)
              </Button>
              <Button variant="outline" onClick={reset} className="flex-1">
                Separate Another Track
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
