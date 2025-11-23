import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface EffectPresetManagerProps {
  isOpen: boolean;
  onClose: () => void;
  effectType: string;
  currentParameters?: Record<string, number>;
  onLoadPreset: (parameters: Record<string, number>) => void;
}

export const EffectPresetManager = ({ isOpen, onClose }: EffectPresetManagerProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Effect Preset Manager requires database configuration.
          </AlertDescription>
        </Alert>
      </DialogContent>
    </Dialog>
  );
};
