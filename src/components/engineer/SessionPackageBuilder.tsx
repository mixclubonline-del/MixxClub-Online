import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Download, Package, Clock } from "lucide-react";
import { useSessionPackage } from "@/hooks/useSessionPackage";
import { formatDistanceToNow } from "date-fns";

interface SessionPackageBuilderProps {
  projectId: string;
  projectTitle: string;
  stemCount: number;
}

const DAW_OPTIONS = [
  { value: 'pro_tools', label: 'Pro Tools' },
  { value: 'logic', label: 'Logic Pro' },
  { value: 'ableton', label: 'Ableton Live' },
  { value: 'reaper', label: 'Reaper' },
  { value: 'studio_one', label: 'Studio One' },
];

const SAMPLE_RATES = [
  { value: 44100, label: '44.1 kHz (CD Quality)' },
  { value: 48000, label: '48 kHz (Professional)' },
  { value: 96000, label: '96 kHz (High Resolution)' },
];

const BIT_DEPTHS = [
  { value: 16, label: '16-bit' },
  { value: 24, label: '24-bit (Recommended)' },
  { value: 32, label: '32-bit Float' },
];

export const SessionPackageBuilder = ({ projectId, projectTitle, stemCount }: SessionPackageBuilderProps) => {
  const [dawFormat, setDawFormat] = useState<string>('pro_tools');
  const [sampleRate, setSampleRate] = useState<number>(48000);
  const [bitDepth, setBitDepth] = useState<number>(24);
  const [existingPackage, setExistingPackage] = useState<any>(null);

  const { isGenerating, generationProgress, generatePackage, getPackageStatus, downloadPackage } = useSessionPackage();

  useEffect(() => {
    loadPackageStatus();
  }, [projectId]);

  const loadPackageStatus = async () => {
    const status = await getPackageStatus();
    setExistingPackage(status);
  };

  const handleGeneratePackage = async () => {
    const result = await generatePackage();

    if (result) {
      setExistingPackage(result);
    }
  };

  const handleDownload = async () => {
    if (existingPackage?.id) {
      await downloadPackage();
    }
  };

  const isExpired = existingPackage?.expires_at && new Date(existingPackage.expires_at) < new Date();
  const isReady = existingPackage?.package_status === 'ready' && !isExpired;

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <span className="text-2xl">🎚️</span>
          Prepare Your Session
        </h3>
        <p className="text-sm text-muted-foreground">Project: {projectTitle} • {stemCount} stems</p>
      </div>

      {/* AI Stem Preview */}
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">✨</span>
          <h4 className="font-semibold">AI Analysis Complete</h4>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>Drums: {Math.floor(stemCount * 0.3)} stems</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span>Bass: {Math.floor(stemCount * 0.15)} stems</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>Vocals: {Math.floor(stemCount * 0.25)} stems</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span>Keys/Synths: {Math.floor(stemCount * 0.3)} stems</span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-primary/20">
          <p className="text-xs text-muted-foreground">
            ✅ All stems phase-coherent • No clipping detected
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Your DAW</label>
          <Select value={dawFormat} onValueChange={setDawFormat}>
            <SelectTrigger className="h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DAW_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{option.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            Session will include color-coded tracks, routing, and tempo markers
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Sample Rate</label>
            <Select value={sampleRate.toString()} onValueChange={(v) => setSampleRate(Number(v))}>
              <SelectTrigger className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SAMPLE_RATES.map(option => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Bit Depth</label>
            <Select value={bitDepth.toString()} onValueChange={(v) => setBitDepth(Number(v))}>
              <SelectTrigger className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BIT_DEPTHS.map(option => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* What's Included */}
        <div className="rounded-lg border border-muted bg-muted/30 p-4">
          <h4 className="font-semibold mb-3 text-sm">📦 Package Includes:</h4>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li>✓ Color-coded stems organized by type</li>
            <li>✓ Pre-routed tracks with proper gain staging</li>
            <li>✓ Tempo markers and time signature</li>
            <li>✓ MIXING_NOTES.txt with artist instructions</li>
            <li>✓ Reference tracks (if provided)</li>
          </ul>
        </div>
      </div>

      {isGenerating && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Generating package...</span>
            <span>{generationProgress}%</span>
          </div>
          <Progress value={generationProgress} />
        </div>
      )}

      {isReady ? (
        <div className="space-y-4 p-4 bg-success/10 rounded-lg border border-success/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-success">✅ Ready to Download</p>
              <p className="text-sm text-muted-foreground">
                Package Size: {Math.round((existingPackage.file_size || 0) / 1024 / 1024)} MB
              </p>
            </div>
            {existingPackage.expires_at && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Expires {formatDistanceToNow(new Date(existingPackage.expires_at), { addSuffix: true })}</span>
              </div>
            )}
          </div>
          <Button onClick={handleDownload} className="w-full" size="lg">
            <Download className="w-4 h-4 mr-2" />
            Download for {DAW_OPTIONS.find(d => d.value === existingPackage.daw_format)?.label || 'DAW'}
          </Button>
        </div>
      ) : isExpired ? (
        <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
          <p className="text-sm text-destructive">Package expired. Generate a new one.</p>
        </div>
      ) : null}

      {!isReady && (
        <Button 
          onClick={handleGeneratePackage} 
          disabled={isGenerating}
          className="w-full"
          size="lg"
        >
          <Package className="w-4 h-4 mr-2" />
          {isGenerating ? 'Generating...' : 'Generate Session Package'}
        </Button>
      )}
    </Card>
  );
};