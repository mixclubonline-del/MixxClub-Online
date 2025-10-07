import React, { useState } from 'react';
import { PluginWindow } from './shared/PluginWindow';
import { PluginKnob } from './shared/PluginKnob';
import { Switch } from '@/components/ui/switch';

interface MixxDelayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MixxDelay: React.FC<MixxDelayProps> = ({ isOpen, onClose }) => {
  const [bpmSync, setBpmSync] = useState(true);
  const [tempo, setTempo] = useState(120);
  const [delayTime, setDelayTime] = useState(500);
  const [feedback, setFeedback] = useState(40);
  const [mix, setMix] = useState(30);
  const [pingPong, setPingPong] = useState(true);
  const [lowCut, setLowCut] = useState(200);
  const [highCut, setHighCut] = useState(8000);

  const noteValues = ['1/4', '1/8', '1/16', '1/8T', '1/16T'];

  return (
    <PluginWindow
      title="MixxDelay"
      category="Temporal Processor"
      isOpen={isOpen}
      onClose={onClose}
      width={600}
      height={500}
    >
      <div className="space-y-6">
        {/* BPM Sync */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
          <div className="space-y-1">
            <div className="text-sm font-medium">BPM Sync</div>
            <div className="text-xs text-muted-foreground">
              {bpmSync ? `Synced to ${tempo} BPM` : 'Free time mode'}
            </div>
          </div>
          <Switch checked={bpmSync} onCheckedChange={setBpmSync} />
        </div>

        {/* Time Controls */}
        {bpmSync ? (
          <div className="grid grid-cols-5 gap-2">
            {noteValues.map(note => (
              <button
                key={note}
                className="p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 
                  hover:border-primary/30 transition-all text-sm font-mono"
              >
                {note}
              </button>
            ))}
          </div>
        ) : (
          <PluginKnob
            label="Delay Time"
            value={delayTime}
            min={1}
            max={2000}
            unit="ms"
            onChange={setDelayTime}
            size="lg"
          />
        )}

        {/* Main Controls */}
        <div className="grid grid-cols-2 gap-6">
          <PluginKnob
            label="Feedback"
            value={feedback}
            min={0}
            max={100}
            unit="%"
            onChange={setFeedback}
          />
          <PluginKnob
            label="Mix"
            value={mix}
            min={0}
            max={100}
            unit="%"
            onChange={setMix}
          />
        </div>

        {/* Ping Pong */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
          <div className="space-y-1">
            <div className="text-sm font-medium">Ping Pong Mode</div>
            <div className="text-xs text-muted-foreground">
              Stereo bounce effect
            </div>
          </div>
          <Switch checked={pingPong} onCheckedChange={setPingPong} />
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-2 gap-6">
          <PluginKnob
            label="Low Cut"
            value={lowCut}
            min={20}
            max={2000}
            unit="Hz"
            onChange={setLowCut}
            size="sm"
          />
          <PluginKnob
            label="High Cut"
            value={highCut}
            min={1000}
            max={20000}
            unit="Hz"
            onChange={setHighCut}
            size="sm"
            displayValue={(val) => `${(val/1000).toFixed(1)}k`}
          />
        </div>

        {/* Visualization */}
        <div className="p-4 rounded-lg bg-black/40 border border-white/10">
          <div className="flex justify-around items-center h-20">
            {[...Array(8)].map((_, i) => {
              const opacity = Math.pow(feedback / 100, i);
              const xPos = pingPong ? (i % 2 === 0 ? '25%' : '75%') : '50%';
              return (
                <div
                  key={i}
                  className="absolute w-8 h-8 rounded-full bg-primary blur-sm"
                  style={{
                    left: xPos,
                    opacity: opacity,
                    transform: `translateX(-50%) scale(${1 - i * 0.1})`,
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </PluginWindow>
  );
};
