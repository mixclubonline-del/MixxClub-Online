import { useState } from 'react';
import { motion } from 'framer-motion';
import { Circle, Settings, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Track } from '@/stores/aiStudioStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TrackControlsProps {
  track: Track;
  isRecordArmed?: boolean;
  onToggleRecordArm: () => void;
  onOpenEffects: () => void;
  onDelete: () => void;
  onUpdate: (updates: Partial<Track>) => void;
}

export const TrackControls = ({
  track,
  isRecordArmed = false,
  onToggleRecordArm,
  onOpenEffects,
  onDelete,
  onUpdate,
}: TrackControlsProps) => {
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  return (
    <div className="flex items-center gap-2">
      {/* Record Arm Button */}
      <motion.button
        onClick={onToggleRecordArm}
        className={cn(
          'w-6 h-6 rounded-full flex items-center justify-center transition-all',
          isRecordArmed
            ? 'bg-[hsl(0,100%,60%)] shadow-[0_0_12px_hsl(0,100%,60%/0.6)]'
            : 'bg-[hsl(var(--studio-panel-raised))] hover:bg-[hsl(var(--studio-panel))]'
        )}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title="Record Arm"
      >
        <Circle
          className={cn('w-3 h-3', isRecordArmed ? 'text-white' : 'text-[hsl(var(--studio-text-dim))]')}
          fill={isRecordArmed ? 'currentColor' : 'none'}
        />
      </motion.button>

      {/* Solo Button */}
      <button
        onClick={() => onUpdate({ solo: !track.solo })}
        className={cn(
          'w-6 h-6 text-[10px] font-bold rounded transition-all',
          track.solo
            ? 'bg-[hsl(var(--led-yellow))] text-black shadow-[0_0_8px_hsl(var(--led-yellow)/0.6)]'
            : 'bg-[hsl(var(--studio-panel-raised))] text-[hsl(var(--studio-text-dim))] hover:text-[hsl(var(--studio-text))]'
        )}
        title="Solo"
      >
        S
      </button>

      {/* Mute Button */}
      <button
        onClick={() => onUpdate({ mute: !track.mute })}
        className={cn(
          'w-6 h-6 text-[10px] font-bold rounded transition-all',
          track.mute
            ? 'bg-[hsl(var(--led-red))] text-white shadow-[0_0_8px_hsl(var(--led-red)/0.6)]'
            : 'bg-[hsl(var(--studio-panel-raised))] text-[hsl(var(--studio-text-dim))] hover:text-[hsl(var(--studio-text))]'
        )}
        title="Mute"
      >
        M
      </button>

      {/* Track Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="w-6 h-6 rounded flex items-center justify-center bg-[hsl(var(--studio-panel-raised))] hover:bg-[hsl(var(--studio-panel))] transition-all"
            title="Track Settings"
          >
            <Settings className="w-3 h-3 text-[hsl(var(--studio-text-dim))]" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-[hsl(var(--studio-panel))] border-[hsl(var(--studio-border))]">
          <DropdownMenuItem
            onClick={onOpenEffects}
            className="text-[hsl(var(--studio-text))] hover:bg-[hsl(var(--studio-panel-raised))]"
          >
            <Settings className="w-4 h-4 mr-2" />
            Effects & Plugins
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={onDelete}
            className="text-[hsl(var(--led-red))] hover:bg-[hsl(var(--studio-panel-raised))]"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Track
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
