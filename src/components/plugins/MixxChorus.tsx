import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Waves, Power } from 'lucide-react';

interface MixxChorusProps {
  onClose?: () => void;
}

export const MixxChorus = ({ onClose }: MixxChorusProps) => {
  const [rate, setRate] = useState(50);
  const [depth, setDepth] = useState(50);
  const [delay, setDelay] = useState(20);
  const [feedback, setFeedback] = useState(30);
  const [mix, setMix] = useState(50);
  const [voices, setVoices] = useState(2);
  const [bypass, setBypass] = useState(false);

  return (
    <Card className="w-full max-w-md p-6" style={{ background: 'hsl(220, 20%, 14%)' }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ background: 'linear-gradient(135deg, hsl(260, 70%, 55%), hsl(280, 70%, 50%))' }}>
            <Waves className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg">MixxChorus</h3>
            <p className="text-xs text-muted-foreground">Rich chorus & ensemble</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setBypass(!bypass)}
          className={bypass ? 'opacity-50' : ''}
        >
          <Power className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-6">
        {/* Voices */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="text-xs">Voices</Label>
            <span className="text-xs font-mono" style={{ color: 'hsl(270, 70%, 60%)' }}>
              {voices}
            </span>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((v) => (
              <Button
                key={v}
                variant={voices === v ? 'default' : 'outline'}
                size="sm"
                onClick={() => setVoices(v)}
                className="flex-1"
              >
                {v}
              </Button>
            ))}
          </div>
        </div>

        {/* Rate (LFO Speed) */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="text-xs">Rate</Label>
            <span className="text-xs font-mono" style={{ color: 'hsl(220, 20%, 70%)' }}>
              {(rate / 10).toFixed(1)}Hz
            </span>
          </div>
          <Slider
            value={[rate]}
            onValueChange={(v) => setRate(v[0])}
            max={100}
            step={1}
          />
        </div>

        {/* Depth */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="text-xs">Depth</Label>
            <span className="text-xs font-mono" style={{ color: 'hsl(220, 20%, 70%)' }}>
              {depth}%
            </span>
          </div>
          <Slider
            value={[depth]}
            onValueChange={(v) => setDepth(v[0])}
            max={100}
            step={1}
          />
        </div>

        {/* Delay */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="text-xs">Delay</Label>
            <span className="text-xs font-mono" style={{ color: 'hsl(220, 20%, 70%)' }}>
              {delay}ms
            </span>
          </div>
          <Slider
            value={[delay]}
            onValueChange={(v) => setDelay(v[0])}
            max={50}
            step={1}
          />
        </div>

        {/* Feedback */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="text-xs">Feedback</Label>
            <span className="text-xs font-mono" style={{ color: 'hsl(220, 20%, 70%)' }}>
              {feedback}%
            </span>
          </div>
          <Slider
            value={[feedback]}
            onValueChange={(v) => setFeedback(v[0])}
            max={80}
            step={1}
          />
        </div>

        {/* Mix */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="text-xs">Mix</Label>
            <span className="text-xs font-mono" style={{ color: 'hsl(220, 20%, 70%)' }}>
              {mix}%
            </span>
          </div>
          <Slider
            value={[mix]}
            onValueChange={(v) => setMix(v[0])}
            max={100}
            step={1}
          />
        </div>

        {/* LFO Visualization */}
        <div className="h-20 rounded-lg p-4" style={{ background: 'hsl(220, 20%, 10%)' }}>
          <div className="text-xs text-muted-foreground mb-2 text-center">LFO Waveform</div>
          <svg viewBox="0 0 200 40" className="w-full h-12">
            {/* Draw sine waves for each voice */}
            {Array.from({ length: voices }).map((_, i) => {
              const points = Array.from({ length: 100 }, (_, x) => {
                const phase = (i * Math.PI) / voices;
                const y = 20 + Math.sin((x / 100) * Math.PI * 4 + phase) * (depth / 100) * 15;
                return `${x * 2},${y}`;
              }).join(' ');
              
              return (
                <polyline
                  key={i}
                  points={points}
                  fill="none"
                  stroke={`hsl(${260 + i * 20}, 70%, ${60 - i * 10}%)`}
                  strokeWidth="2"
                  opacity="0.7"
                />
              );
            })}
          </svg>
        </div>
      </div>
    </Card>
  );
};
