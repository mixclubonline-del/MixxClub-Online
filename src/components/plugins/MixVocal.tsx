import React, { useState } from 'react';
import { PluginWindow } from './shared/PluginWindow';
import { PluginKnob } from './shared/PluginKnob';

interface MixVocalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MixVocal: React.FC<MixVocalProps> = ({ isOpen, onClose }) => {
  const [clarity, setClarity] = useState(50);
  const [presence, setPresence] = useState(50);
  const [body, setBody] = useState(50);
  const [grit, setGrit] = useState(0);

  return (
    <PluginWindow
      title="MixVocal"
      category="Vocal Enhancer"
      isOpen={isOpen}
      onClose={onClose}
      width={500}
      height={400}
    >
      <div className="flex items-center justify-center h-full">
        <div className="grid grid-cols-2 gap-8">
          <PluginKnob
            label="Clarity"
            value={clarity}
            min={0}
            max={100}
            unit="%"
            onChange={setClarity}
            size="lg"
          />
          <PluginKnob
            label="Presence"
            value={presence}
            min={0}
            max={100}
            unit="%"
            onChange={setPresence}
            size="lg"
          />
          <PluginKnob
            label="Body"
            value={body}
            min={0}
            max={100}
            unit="%"
            onChange={setBody}
            size="lg"
          />
          <PluginKnob
            label="Grit"
            value={grit}
            min={0}
            max={100}
            unit="%"
            onChange={setGrit}
            size="lg"
          />
        </div>
      </div>
    </PluginWindow>
  );
};
