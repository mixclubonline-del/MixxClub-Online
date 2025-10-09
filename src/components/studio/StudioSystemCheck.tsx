import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertCircle, Copy, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { WaveformGenerator } from "@/services/waveformGenerator";

interface SystemCheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
  details?: string;
}

export const StudioSystemCheck = () => {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<SystemCheckResult[]>([]);

  const runSystemCheck = async () => {
    setIsRunning(true);
    const checks: SystemCheckResult[] = [];

    // 1. Audio Context Check
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      checks.push({
        name: 'Audio Context',
        status: 'pass',
        message: `Initialized successfully`,
        details: `Sample Rate: ${ctx.sampleRate}Hz, State: ${ctx.state}, Latency: ${(ctx.baseLatency * 1000).toFixed(2)}ms`
      });
      await ctx.close();
    } catch (error) {
      checks.push({
        name: 'Audio Context',
        status: 'fail',
        message: 'Failed to create AudioContext',
        details: String(error)
      });
    }

    // 2. Decode & Waveform Test
    try {
      const offlineCtx = new OfflineAudioContext(1, 44100, 44100);
      const buffer = offlineCtx.createBuffer(1, 44100, 44100);
      const channel = buffer.getChannelData(0);
      
      // Generate 1 second of sine wave
      for (let i = 0; i < 44100; i++) {
        channel[i] = Math.sin(2 * Math.PI * 440 * i / 44100) * 0.5;
      }

      const { peaks, rms } = WaveformGenerator.generateFromBuffer(buffer, { width: 100, normalize: true });
      
      if (peaks.length > 0 && peaks.some(p => p > 0)) {
        checks.push({
          name: 'Waveform Generation',
          status: 'pass',
          message: `Generated ${peaks.length} peaks`,
          details: `Peak range: ${Math.min(...peaks).toFixed(3)} to ${Math.max(...peaks).toFixed(3)}, RMS: ${rms.length} samples`
        });
      } else {
        checks.push({
          name: 'Waveform Generation',
          status: 'warn',
          message: 'Waveform generated but no peaks detected',
          details: `Peaks: ${peaks.length}, Max: ${Math.max(...peaks)}`
        });
      }
    } catch (error) {
      checks.push({
        name: 'Waveform Generation',
        status: 'fail',
        message: 'Failed to generate test waveform',
        details: String(error)
      });
    }

    // 3. Canvas Rendering Test
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 50;
      const ctx2d = canvas.getContext('2d');
      
      if (ctx2d) {
        ctx2d.fillStyle = '#8B5CF6';
        ctx2d.fillRect(0, 0, 100, 50);
        const imageData = ctx2d.getImageData(50, 25, 1, 1);
        const hasColor = imageData.data[0] > 0 || imageData.data[1] > 0 || imageData.data[2] > 0;
        
        checks.push({
          name: 'Canvas Rendering',
          status: hasColor ? 'pass' : 'warn',
          message: hasColor ? 'Canvas drawing works correctly' : 'Canvas rendered but pixel data unclear',
          details: `Pixel RGBA: [${imageData.data[0]}, ${imageData.data[1]}, ${imageData.data[2]}, ${imageData.data[3]}]`
        });
      } else {
        checks.push({
          name: 'Canvas Rendering',
          status: 'fail',
          message: 'Failed to get 2D context'
        });
      }
    } catch (error) {
      checks.push({
        name: 'Canvas Rendering',
        status: 'fail',
        message: 'Canvas test failed',
        details: String(error)
      });
    }

    // 4. Media Permissions Check
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices.filter(d => d.kind === 'audioinput');
        
        checks.push({
          name: 'Media Devices',
          status: audioInputs.length > 0 ? 'pass' : 'warn',
          message: `${audioInputs.length} audio input(s) found`,
          details: audioInputs.length > 0 
            ? audioInputs.map((d, i) => `Input ${i + 1}: ${d.label || 'Unknown'}`).join(', ')
            : 'No audio inputs detected or permissions not granted'
        });
      } else {
        checks.push({
          name: 'Media Devices',
          status: 'warn',
          message: 'Media Devices API not available'
        });
      }
    } catch (error) {
      checks.push({
        name: 'Media Devices',
        status: 'warn',
        message: 'Could not enumerate devices',
        details: String(error)
      });
    }

    setResults(checks);
    setIsRunning(false);

    const failCount = checks.filter(c => c.status === 'fail').length;
    if (failCount === 0) {
      toast({
        title: "System Check Passed ✓",
        description: "All audio systems operational"
      });
    } else {
      toast({
        title: "System Issues Detected",
        description: `${failCount} check(s) failed`,
        variant: "destructive"
      });
    }
  };

  const copyDiagnostics = () => {
    const report = results.map(r => 
      `[${r.status.toUpperCase()}] ${r.name}: ${r.message}${r.details ? `\n  Details: ${r.details}` : ''}`
    ).join('\n\n');
    
    navigator.clipboard.writeText(report);
    toast({
      title: "Copied to Clipboard",
      description: "Diagnostics report copied"
    });
  };

  const getStatusIcon = (status: SystemCheckResult['status']) => {
    switch (status) {
      case 'pass': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'fail': return <XCircle className="w-5 h-5 text-destructive" />;
      case 'warn': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Studio System Check</h3>
          <p className="text-sm text-muted-foreground">Validate audio environment and capabilities</p>
        </div>
        <div className="flex gap-2">
          {results.length > 0 && (
            <Button variant="outline" size="sm" onClick={copyDiagnostics}>
              <Copy className="w-4 h-4 mr-2" />
              Copy Report
            </Button>
          )}
          <Button onClick={runSystemCheck} disabled={isRunning}>
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Running...
              </>
            ) : (
              'Run System Check'
            )}
          </Button>
        </div>
      </div>

      {results.length > 0 && (
        <div className="space-y-3">
          {results.map((result, idx) => (
            <div 
              key={idx}
              className="p-4 rounded-lg border bg-card/50 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(result.status)}
                  <div>
                    <div className="font-medium">{result.name}</div>
                    <div className="text-sm text-muted-foreground">{result.message}</div>
                  </div>
                </div>
                <Badge 
                  variant={result.status === 'pass' ? 'default' : result.status === 'fail' ? 'destructive' : 'outline'}
                >
                  {result.status}
                </Badge>
              </div>
              {result.details && (
                <div className="text-xs text-muted-foreground font-mono bg-muted/50 p-2 rounded">
                  {result.details}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {results.length === 0 && !isRunning && (
        <div className="text-center py-12 text-muted-foreground">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Click "Run System Check" to validate your audio environment</p>
        </div>
      )}
    </Card>
  );
};
