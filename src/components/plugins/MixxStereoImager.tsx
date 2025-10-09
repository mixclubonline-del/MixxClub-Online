import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Maximize2, Power } from 'lucide-react';

interface MixxStereoImagerProps {
  onClose?: () => void;
}

export const MixxStereoImager = ({ onClose }: MixxStereoImagerProps) => {
  const [width, setWidth] = useState(100);
  const [monoLow, setMonoLow] = useState(120);
  const [rotation, setRotation] = useState(0);
  const [balance, setBalance] = useState(50);
  const [bypass, setBypass] = useState(false);

  return (
    <Card className="w-full max-w-md p-6" style={{ background: 'hsl(220, 20%, 14%)' }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ background: 'linear-gradient(135deg, hsl(180, 70%, 50%), hsl(200, 70%, 45%))' }}>
            <Maximize2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg">MixxStereoImager</h3>
            <p className="text-xs text-muted-foreground">Stereo width & spatial control</p>
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
        {/* Stereo Width */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="text-xs">Stereo Width</Label>
            <span className="text-xs font-mono" style={{ color: 'hsl(180, 70%, 60%)' }}>
              {width}%
            </span>
          </div>
          <Slider
            value={[width]}
            onValueChange={(v) => setWidth(v[0])}
            max={200}
            step={1}
          />
          <div className="flex justify-between text-[10px]" style={{ color: 'hsl(220, 20%, 60%)' }}>
            <span>Mono</span>
            <span>Normal</span>
            <span>Wide</span>
          </div>
        </div>

        {/* Mono Low Frequencies */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="text-xs">Mono Below</Label>
            <span className="text-xs font-mono" style={{ color: 'hsl(220, 20%, 70%)' }}>
              {monoLow}Hz
            </span>
          </div>
          <Slider
            value={[monoLow]}
            onValueChange={(v) => setMonoLow(v[0])}
            min={20}
            max={500}
            step={5}
          />
        </div>

        {/* Stereo Rotation */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="text-xs">Rotation</Label>
            <span className="text-xs font-mono" style={{ color: 'hsl(220, 20%, 70%)' }}>
              {rotation > 0 ? '+' : ''}{rotation}°
            </span>
          </div>
          <Slider
            value={[rotation + 180]}
            onValueChange={(v) => setRotation(v[0] - 180)}
            max={360}
            step={1}
          />
        </div>

        {/* Balance */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="text-xs">Balance</Label>
            <span className="text-xs font-mono" style={{ color: 'hsl(220, 20%, 70%)' }}>
              {balance === 50 ? 'Center' : balance > 50 ? `R${balance - 50}` : `L${50 - balance}`}
            </span>
          </div>
          <Slider
            value={[balance]}
            onValueChange={(v) => setBalance(v[0])}
            max={100}
            step={1}
          />
        </div>

        {/* Stereo Field Visualization */}
        <div className="h-32 rounded-lg p-4" style={{ background: 'hsl(220, 20%, 10%)' }}>
          <div className="text-xs text-muted-foreground mb-2 text-center">Stereo Field</div>
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Goniometer-style display */}
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Background circle */}
              <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(220, 20%, 20%)" strokeWidth="1" />
              <circle cx="50" cy="50" r="30" fill="none" stroke="hsl(220, 20%, 22%)" strokeWidth="1" />
              <circle cx="50" cy="50" r="15" fill="none" stroke="hsl(220, 20%, 24%)" strokeWidth="1" />
              
              {/* Center lines */}
              <line x1="5" y1="50" x2="95" y2="50" stroke="hsl(220, 20%, 25%)" strokeWidth="1" />
              <line x1="50" y1="5" x2="50" y2="95" stroke="hsl(220, 20%, 25%)" strokeWidth="1" />
              
              {/* Stereo image indicator */}
              <ellipse
                cx="50"
                cy="50"
                rx={20 * (width / 100)}
                ry="20"
                fill="hsl(180, 70%, 50%)"
                opacity="0.3"
                transform={`rotate(${rotation} 50 50)`}
              />
              <circle cx={50 + (balance - 50) / 3} cy="50" r="5" fill="hsl(180, 100%, 60%)" />
            </svg>
          </div>
        </div>
      </div>
    </Card>
  );
};
