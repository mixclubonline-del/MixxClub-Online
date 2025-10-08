import { Mic } from 'lucide-react';

interface RecordingIndicatorProps {
  isRecording: boolean;
  trackName?: string;
}

export const RecordingIndicator = ({ isRecording, trackName }: RecordingIndicatorProps) => {
  if (!isRecording) return null;

  return (
    <div className="fixed top-20 right-6 z-50 animate-fade-in">
      <div className="bg-gradient-to-r from-destructive to-destructive/80 text-white px-6 py-3 rounded-lg shadow-2xl border border-destructive/50 animate-pulse-glow">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-4 h-4 bg-white rounded-full animate-pulse" />
            <div className="absolute inset-0 w-4 h-4 bg-white rounded-full animate-ping opacity-75" />
          </div>
          <div>
            <div className="flex items-center gap-2 font-bold text-sm">
              <Mic className="w-4 h-4" />
              RECORDING
            </div>
            {trackName && (
              <div className="text-xs text-white/90 mt-0.5">
                {trackName}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
