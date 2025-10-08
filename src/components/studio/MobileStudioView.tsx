import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ChevronLeft, ChevronRight, Settings, Sliders } from 'lucide-react';
import { useTouchGestures } from '@/hooks/useTouchGestures';
import { QuickVocalChain } from './QuickVocalChain';
import { QuickRecordStrip } from './QuickRecordStrip';
import { Track } from '@/stores/aiStudioStore';
import { cn } from '@/lib/utils';

interface MobileStudioViewProps {
  tracks: Track[];
  currentTrackIndex: number;
  onTrackChange: (index: number) => void;
}

export const MobileStudioView = ({ tracks, currentTrackIndex, onTrackChange }: MobileStudioViewProps) => {
  const [effectsOpen, setEffectsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);

  const gestureRef = useTouchGestures({
    onSwipe: (direction) => {
      if (direction === 'left' && currentTrackIndex < tracks.length - 1) {
        onTrackChange(currentTrackIndex + 1);
      } else if (direction === 'right' && currentTrackIndex > 0) {
        onTrackChange(currentTrackIndex - 1);
      }
    },
    onLongPress: () => {
      setEffectsOpen(true);
    }
  });

  const currentTrack = tracks[currentTrackIndex];

  return (
    <div className="h-screen flex flex-col bg-background safe-area-inset-bottom">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h1 className="text-lg font-bold">Mobile Studio</h1>
        <Button variant="ghost" size="icon">
          <Settings className="w-5 h-5" />
        </Button>
      </div>

      {/* Track Navigation */}
      <div className="flex items-center gap-2 p-4 bg-muted/30">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onTrackChange(Math.max(0, currentTrackIndex - 1))}
          disabled={currentTrackIndex === 0}
          className="touch-manipulation"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        
        <div className="flex-1 text-center">
          <div className="font-semibold">{currentTrack?.name || 'No Track'}</div>
          <div className="text-xs text-muted-foreground">
            Track {currentTrackIndex + 1} of {tracks.length}
          </div>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => onTrackChange(Math.min(tracks.length - 1, currentTrackIndex + 1))}
          disabled={currentTrackIndex === tracks.length - 1}
          className="touch-manipulation"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Main Content - Swipeable */}
      <div ref={gestureRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Quick Vocal Chain */}
        <QuickVocalChain
          trackId={currentTrack?.id || ''}
          onApply={() => {
            // Apply vocal chain to current track
          }}
        />

        {/* Quick Record Strip */}
        <QuickRecordStrip
          trackId={currentTrack?.id || ''}
          isRecording={isRecording}
          hasRecording={hasRecording}
          onRecord={() => setIsRecording(true)}
          onStop={() => {
            setIsRecording(false);
            setHasRecording(true);
          }}
          onPlayback={() => {
            // Play back recorded audio
          }}
        />

        {/* Essential Controls */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase text-muted-foreground">Volume</label>
            <div className="h-40 flex justify-center">
              <input
                type="range"
                min="0"
                max="100"
                className="w-12 touch-manipulation rotate-[-90deg] origin-center"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase text-muted-foreground">Pan</label>
            <div className="h-40 flex items-center justify-center">
              <div className="w-full px-4">
                <input
                  type="range"
                  min="-100"
                  max="100"
                  defaultValue="0"
                  className="w-full touch-manipulation"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Effects Drawer */}
      <Sheet open={effectsOpen} onOpenChange={setEffectsOpen}>
        <SheetTrigger asChild>
          <Button
            className={cn(
              "w-full rounded-t-2xl rounded-b-none h-16 text-lg font-bold",
              "bg-gradient-to-r from-purple-600 to-cyan-600",
              "touch-manipulation"
            )}
          >
            <Sliders className="w-5 h-5 mr-2" />
            Effects & Settings
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[80vh] rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>Track Effects</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              Effects rack and detailed settings would appear here.
            </p>
            {/* Effects would be listed here */}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
