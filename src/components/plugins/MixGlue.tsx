import React, { useState } from 'react';
import { PluginWindow } from './shared/PluginWindow';
import { CircularMeter } from './shared/CircularMeter';

interface MixGlueProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MixGlue: React.FC<MixGlueProps> = ({ isOpen, onClose }) => {
  const [ratio, setRatio] = useState(4.2);

  return (
    <PluginWindow
      title="MixGlue"
      category="Bus Compressor"
      isOpen={isOpen}
      onClose={onClose}
      width={400}
      height={400}
    >
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <CircularMeter
            value={ratio}
            max={20}
            size={180}
            label="Bus Compressor"
            unit=":1"
          />
          <input
            type="range"
            min="1"
            max="20"
            step="0.1"
            value={ratio}
            onChange={(e) => setRatio(parseFloat(e.target.value))}
            className="w-full mt-8"
          />
        </div>
      </div>
    </PluginWindow>
  );
};
