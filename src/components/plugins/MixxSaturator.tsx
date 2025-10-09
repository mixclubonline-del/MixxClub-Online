import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Flame, Power } from 'lucide-react';

interface MixxSaturatorProps {
  onClose?: () => void;
}

export const MixxSaturator = ({ onClose }: MixxSaturatorProps) => {
  const [drive, setDrive] = useState(50);
  const [mix, setMix] = useState(100);
  const [tone, setTone] = useState(50);
  const [mode, setMode] = useState('warm');
  const [bypass, setBypass] = useState(false);

  return (
    <Card className="w-full max-w-md p-6" style={{ background: 'hsl(220, 20%, 14%)' }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ background: 'linear-gradient(135deg, hsl(25, 100%, 50%), hsl(15, 100%, 45%))' }}>
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg">MixxSaturator</h3>
            <p className="text-xs text-muted-foreground">Harmonic saturation & warmth</p>
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
        {/* Saturation Mode */}
        <div className="space-y-2">
          <Label className="text-xs">Mode</Label>
          <Select value={mode} onValueChange={setMode}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="warm">Warm (Tube)</SelectItem>
              <SelectItem value="crisp">Crisp (Tape)</SelectItem>
              <SelectItem value="heavy">Heavy (Tube Overdrive)</SelectItem>
              <SelectItem value="subtle">Subtle (Transistor)</SelectItem>
              <SelectItem value="digital">Digital (Bit Crush)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Drive */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="text-xs">Drive</Label>
            <span className="text-xs font-mono" style={{ color: 'hsl(25, 100%, 60%)' }}>
              {drive}%
            </span>
          </div>
          <Slider
            value={[drive]}
            onValueChange={(v) => setDrive(v[0])}
            max={100}
            step={1}
          />
        </div>

        {/* Tone */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="text-xs">Tone</Label>
            <span className="text-xs font-mono" style={{ color: 'hsl(220, 20%, 70%)' }}>
              {tone > 50 ? 'Bright' : tone < 50 ? 'Dark' : 'Neutral'}
            </span>
          </div>
          <Slider
            value={[tone]}
            onValueChange={(v) => setTone(v[0])}
            max={100}
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

        {/* Visual Feedback */}
        <div className="h-24 rounded-lg p-4 flex items-center justify-center" style={{ background: 'hsl(220, 20%, 10%)' }}>
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-2">Harmonic Content</div>
            <div className="flex gap-1 items-end justify-center h-12">
              {[30, 50, 70, 60, 40, 55, 45, 35].map((height, i) => (
                <div
                  key={i}
                  className="w-2 rounded-t transition-all"
                  style={{
                    height: `${height * (drive / 100)}%`,
                    background: `hsl(${25 + i * 10}, ${70 + drive / 3}%, 50%)`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
