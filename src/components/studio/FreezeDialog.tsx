import { useState } from 'react';
import { Snowflake, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface FreezeDialogProps {
  trackName: string;
  effectsCount: number;
  isOpen: boolean;
  onClose: () => void;
  onFreeze: () => Promise<void>;
  onUnfreeze: () => void;
  isFrozen: boolean;
}

export const FreezeDialog = ({
  trackName,
  effectsCount,
  isOpen,
  onClose,
  onFreeze,
  onUnfreeze,
  isFrozen,
}: FreezeDialogProps) => {
  const [freezing, setFreezing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFreeze = async () => {
    setFreezing(true);
    setProgress(0);
    setError(null);

    try {
      // Simulate progressive freeze with progress updates
      const steps = 10;
      for (let i = 0; i <= steps; i++) {
        setProgress((i / steps) * 100);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      await onFreeze();
      setProgress(100);
      
      setTimeout(() => {
        onClose();
        setFreezing(false);
        setProgress(0);
      }, 500);
    } catch (err) {
      setError('Failed to freeze track. Please try again.');
      setFreezing(false);
    }
  };

  const handleUnfreeze = () => {
    onUnfreeze();
    onClose();
  };

  const estimatedCPUSaved = effectsCount * 15; // Rough estimate: 15% per effect

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Snowflake className="w-5 h-5" />
            {isFrozen ? 'Unfreeze Track' : 'Freeze Track'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!isFrozen ? (
            <>
              <div className="p-4 rounded-lg bg-muted space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Track:</span>
                  <span className="font-medium">{trackName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Effects:</span>
                  <span className="font-medium">{effectsCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Est. CPU Saved:</span>
                  <span className="font-medium text-green-600">~{estimatedCPUSaved}%</span>
                </div>
              </div>

              <div className="text-sm text-muted-foreground space-y-2">
                <p>🎯 Freezing will:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Render track with all effects to audio</li>
                  <li>Bypass all effects (saves CPU)</li>
                  <li>Allow unfreezing to edit later</li>
                </ul>
              </div>

              {freezing && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Freezing track...
                    </span>
                    <span className="font-mono">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 p-3 rounded bg-red-500/10 border border-red-500/20">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-500">{error}</span>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={onClose}
                  disabled={freezing}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleFreeze}
                  disabled={freezing}
                >
                  {freezing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Freezing...
                    </>
                  ) : (
                    <>
                      <Snowflake className="w-4 h-4 mr-2" />
                      Freeze Track
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center py-8">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Track is Frozen</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Effects are bypassed, playing rendered audio
                    </p>
                  </div>
                </div>
              </div>

              <Button className="w-full" onClick={handleUnfreeze}>
                Unfreeze & Edit
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
