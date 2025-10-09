import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Circle, Hand, Edit, PenTool } from 'lucide-react';
import { useAutomationRecording, AutomationRecordMode } from '@/hooks/useAutomationRecording';
import { cn } from '@/lib/utils';

/**
 * Automation Recording Controls
 * Touch, Latch, Write modes for live parameter automation
 */
export const AutomationRecordingControls: React.FC = () => {
  const {
    recordMode,
    isRecording,
    activeParameter,
    setRecordMode,
  } = useAutomationRecording();

  const modes: Array<{ id: AutomationRecordMode; label: string; icon: React.ReactNode; description: string }> = [
    {
      id: 'off',
      label: 'Off',
      icon: <Circle className="w-4 h-4" />,
      description: 'Automation recording disabled',
    },
    {
      id: 'touch',
      label: 'Touch',
      icon: <Hand className="w-4 h-4" />,
      description: 'Record only while touching control',
    },
    {
      id: 'latch',
      label: 'Latch',
      icon: <Edit className="w-4 h-4" />,
      description: 'Record from first touch until stop',
    },
    {
      id: 'write',
      label: 'Write',
      icon: <PenTool className="w-4 h-4" />,
      description: 'Overwrite all automation',
    },
  ];

  const currentMode = modes.find(m => m.id === recordMode) || modes[0];

  return (
    <div className="flex items-center gap-2">
      {/* Record Mode Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={recordMode !== 'off' ? 'default' : 'outline'}
            size="sm"
            className={cn(
              'gap-2 min-w-[100px]',
              isRecording && 'bg-red-600 hover:bg-red-700'
            )}
          >
            {currentMode.icon}
            <span className="text-xs">{currentMode.label}</span>
            {isRecording && (
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          {modes.map((mode) => (
            <DropdownMenuItem
              key={mode.id}
              onClick={() => setRecordMode(mode.id)}
              className="flex flex-col items-start gap-1"
            >
              <div className="flex items-center gap-2 w-full">
                {mode.icon}
                <span className="font-medium">{mode.label}</span>
                {mode.id === recordMode && (
                  <Badge variant="secondary" className="ml-auto text-[10px]">
                    Active
                  </Badge>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {mode.description}
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Active Parameter Display */}
      {isRecording && activeParameter && (
        <Badge
          variant="outline"
          className="text-xs gap-1 animate-pulse border-red-500 text-red-500"
        >
          <Circle className="w-2 h-2 fill-current" />
          Recording: {activeParameter}
        </Badge>
      )}

      {/* Mode Info */}
      {recordMode !== 'off' && !isRecording && (
        <span className="text-xs text-muted-foreground">
          {currentMode.description}
        </span>
      )}
    </div>
  );
};
