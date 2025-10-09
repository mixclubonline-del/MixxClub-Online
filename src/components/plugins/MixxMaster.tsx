import React, { useState } from 'react';
import { PluginWindow } from './shared/PluginWindow';
import { PluginKnob } from './shared/PluginKnob';
import { Button } from '@/components/ui/button';
import { Sparkles, Download } from 'lucide-react';

interface MixxMasterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MixxMaster: React.FC<MixxMasterProps> = ({ isOpen, onClose }) => {
  const [lufs, setLufs] = useState(-14);
  const [truePeak, setTruePeak] = useState(-1);
  const [stereoWidth, setStereoWidth] = useState(100);
  const [currentLUFS, setCurrentLUFS] = useState(-18.4);
  const [currentPeak, setCurrentPeak] = useState(-3.2);

  return (
    <PluginWindow
      title="MixxMaster"
      category="Mastering Suite"
      isOpen={isOpen}
      onClose={onClose}
      width={700}
      height={550}
    >
      <div className="space-y-6">
        {/* LUFS Metering */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground uppercase tracking-wider">Target LUFS</div>
            <div className="text-4xl font-bold font-mono text-primary">{lufs.toFixed(1)}</div>
            <div className="text-xs text-muted-foreground">Integrated loudness target</div>
          </div>
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground uppercase tracking-wider">Current LUFS</div>
            <div className="text-4xl font-bold font-mono">{currentLUFS.toFixed(1)}</div>
            <div className={`text-xs ${Math.abs(currentLUFS - lufs) < 1 ? 'text-green-500' : 'text-yellow-500'}`}>
              {Math.abs(currentLUFS - lufs) < 1 ? '✓ On target' : `${(currentLUFS - lufs).toFixed(1)} LU away`}
            </div>
          </div>
        </div>

        {/* Peak Meters */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">True Peak</span>
            <span className="font-mono">{currentPeak.toFixed(2)} dB</span>
          </div>
          <div className="h-4 bg-black/40 rounded-full overflow-hidden border border-white/10">
            <div 
              className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all duration-100"
              style={{ width: `${Math.min((currentPeak + 60) / 60 * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Main Controls */}
        <div className="grid grid-cols-3 gap-6">
          <PluginKnob
            label="Target LUFS"
            value={lufs}
            min={-23}
            max={-8}
            unit=" LU"
            onChange={setLufs}
          />
          <PluginKnob
            label="True Peak"
            value={truePeak}
            min={-3}
            max={0}
            unit="dB"
            onChange={setTruePeak}
          />
          <PluginKnob
            label="Stereo Width"
            value={stereoWidth}
            min={0}
            max={150}
            unit="%"
            onChange={setStereoWidth}
          />
        </div>

        {/* Mastering Chain */}
        <div className="space-y-3">
          <div className="text-sm font-medium">Mastering Chain</div>
          <div className="space-y-2">
            {[
              { name: 'Multi-band Compression', active: true },
              { name: 'Harmonic Exciter', active: true },
              { name: 'Stereo Imager', active: true },
              { name: 'Limiting & Ceiling', active: true },
              { name: 'Dithering', active: false },
            ].map((processor, i) => (
              <div
                key={i}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  processor.active 
                    ? 'bg-white/5 border-primary/20' 
                    : 'bg-black/20 border-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${processor.active ? 'bg-primary shadow-glow' : 'bg-white/20'}`} />
                  <span className={processor.active ? 'text-foreground' : 'text-muted-foreground'}>
                    {processor.name}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {processor.active ? 'Active' : 'Bypassed'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button className="flex-1 bg-mixx-gradient text-white font-bold hover:opacity-90">
            <Sparkles className="w-4 h-4 mr-2" />
            AI Master
          </Button>
          <Button variant="outline" className="flex-1 border-mixx-cyan/30 text-mixx-cyan hover:bg-mixx-cyan/10">
            <Download className="w-4 h-4 mr-2" />
            Export Master
          </Button>
        </div>
      </div>
    </PluginWindow>
  );
};
