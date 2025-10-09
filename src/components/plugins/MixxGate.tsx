import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { DoorOpen, Power } from 'lucide-react';

interface MixxGateProps {
  onClose?: () => void;
}

export const MixxGate = ({ onClose }: MixxGateProps) => {
  const [threshold, setThreshold] = useState(30);
  const [attack, setAttack] = useState(5);
  const [release, setRelease] = useState(50);
  const [hold, setHold] = useState(20);
  const [range, setRange] = useState(60);
  const [bypass, setBypass] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="w-full max-w-md p-6" style={{ background: 'hsl(220, 20%, 14%)' }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ background: 'linear-gradient(135deg, hsl(280, 70%, 50%), hsl(260, 70%, 45%))' }}>
            <DoorOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg">MixxGate</h3>
            <p className="text-xs text-muted-foreground">Noise gate & dynamics</p>
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
        {/* Threshold */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="text-xs">Threshold</Label>
            <span className="text-xs font-mono" style={{ color: 'hsl(280, 70%, 60%)' }}>
              -{threshold}dB
            </span>
          </div>
          <Slider
            value={[threshold]}
            onValueChange={(v) => setThreshold(v[0])}
            max={80}
            step={1}
          />
        </div>

        {/* Attack */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="text-xs">Attack</Label>
            <span className="text-xs font-mono" style={{ color: 'hsl(220, 20%, 70%)' }}>
              {attack}ms
            </span>
          </div>
          <Slider
            value={[attack]}
            onValueChange={(v) => setAttack(v[0])}
            max={100}
            step={1}
          />
        </div>

        {/* Hold */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="text-xs">Hold</Label>
            <span className="text-xs font-mono" style={{ color: 'hsl(220, 20%, 70%)' }}>
              {hold}ms
            </span>
          </div>
          <Slider
            value={[hold]}
            onValueChange={(v) => setHold(v[0])}
            max={500}
            step={5}
          />
        </div>

        {/* Release */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="text-xs">Release</Label>
            <span className="text-xs font-mono" style={{ color: 'hsl(220, 20%, 70%)' }}>
              {release}ms
            </span>
          </div>
          <Slider
            value={[release]}
            onValueChange={(v) => setRelease(v[0])}
            max={1000}
            step={10}
          />
        </div>

        {/* Range */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="text-xs">Range</Label>
            <span className="text-xs font-mono" style={{ color: 'hsl(220, 20%, 70%)' }}>
              -{range}dB
            </span>
          </div>
          <Slider
            value={[range]}
            onValueChange={(v) => setRange(v[0])}
            max={80}
            step={1}
          />
        </div>

        {/* Gate Status Indicator */}
        <div className="h-20 rounded-lg p-4 flex flex-col items-center justify-center" style={{ background: 'hsl(220, 20%, 10%)' }}>
          <div className="text-xs text-muted-foreground mb-3">Gate Status</div>
          <div className="flex items-center gap-3">
            <div
              className="w-16 h-16 rounded-full transition-all duration-200"
              style={{
                background: isOpen
                  ? 'radial-gradient(circle, hsl(120, 70%, 50%), hsl(120, 70%, 30%))'
                  : 'radial-gradient(circle, hsl(0, 70%, 50%), hsl(0, 70%, 30%))',
                boxShadow: isOpen
                  ? '0 0 20px hsl(120, 70%, 50%)'
                  : '0 0 20px hsl(0, 70%, 50%)',
              }}
            />
            <div className="text-sm font-mono">
              {isOpen ? 'OPEN' : 'CLOSED'}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
