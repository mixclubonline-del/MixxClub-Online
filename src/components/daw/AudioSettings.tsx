import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

interface AudioSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentSettings: AudioSettingsState;
  onApply: (settings: AudioSettingsState) => void;
}

export interface AudioSettingsState {
  sampleRate: 44100 | 48000 | 96000;
  bufferSize: 128 | 256 | 512 | 1024 | 2048;
  latencyCompensation: boolean;
  autoLatencyDetection: boolean;
  manualLatencyMs: number;
}

export const AudioSettings = ({
  open,
  onOpenChange,
  currentSettings,
  onApply,
}: AudioSettingsProps) => {
  const [settings, setSettings] = useState<AudioSettingsState>(currentSettings);

  const handleApply = () => {
    onApply(settings);
    onOpenChange(false);
  };

  const estimatedLatency = calculateLatency(settings.sampleRate, settings.bufferSize);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Audio Settings</DialogTitle>
          <DialogDescription>
            Configure sample rate, buffer size, and latency compensation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Sample Rate */}
          <div className="space-y-2">
            <Label htmlFor="sampleRate">Sample Rate</Label>
            <Select
              value={settings.sampleRate.toString()}
              onValueChange={(value) =>
                setSettings({ ...settings, sampleRate: parseInt(value) as any })
              }
            >
              <SelectTrigger id="sampleRate">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="44100">44.1 kHz (CD Quality)</SelectItem>
                <SelectItem value="48000">48 kHz (Professional)</SelectItem>
                <SelectItem value="96000">96 kHz (High Resolution)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Higher sample rates increase CPU usage and file size
            </p>
          </div>

          {/* Buffer Size */}
          <div className="space-y-2">
            <Label htmlFor="bufferSize">Buffer Size</Label>
            <Select
              value={settings.bufferSize.toString()}
              onValueChange={(value) =>
                setSettings({ ...settings, bufferSize: parseInt(value) as any })
              }
            >
              <SelectTrigger id="bufferSize">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="128">128 samples (Lowest latency)</SelectItem>
                <SelectItem value="256">256 samples (Low latency)</SelectItem>
                <SelectItem value="512">512 samples (Balanced)</SelectItem>
                <SelectItem value="1024">1024 samples (Stable)</SelectItem>
                <SelectItem value="2048">2048 samples (Most stable)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Estimated latency: {estimatedLatency.toFixed(1)}ms
            </p>
          </div>

          {/* Latency Compensation */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="latencyComp">Latency Compensation</Label>
                <p className="text-xs text-muted-foreground">
                  Automatically align tracks to compensate for processing delay
                </p>
              </div>
              <Switch
                id="latencyComp"
                checked={settings.latencyCompensation}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, latencyCompensation: checked })
                }
              />
            </div>

            {settings.latencyCompensation && (
              <div className="flex items-center justify-between pl-4">
                <div className="space-y-0.5">
                  <Label htmlFor="autoLatency">Auto-Detect Latency</Label>
                  <p className="text-xs text-muted-foreground">
                    Measure actual system latency automatically
                  </p>
                </div>
                <Switch
                  id="autoLatency"
                  checked={settings.autoLatencyDetection}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, autoLatencyDetection: checked })
                  }
                />
              </div>
            )}
          </div>

          {/* Warning for high settings */}
          {(settings.sampleRate >= 96000 || settings.bufferSize <= 256) && (
            <div className="rounded-lg border border-warning/50 bg-warning/10 p-3">
              <p className="text-sm text-warning-foreground">
                ⚠️ Current settings may cause audio dropouts on slower systems
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleApply}>Apply Settings</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

function calculateLatency(sampleRate: number, bufferSize: number): number {
  return (bufferSize / sampleRate) * 1000;
}
