import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, X, Volume2 } from 'lucide-react';
import { usePluginPreviewStore } from '@/stores/pluginPreviewStore';
import { audioEngine } from '@/services/audioEngine';
import { useAIStudioStore } from '@/stores/aiStudioStore';
import { motion, AnimatePresence } from 'framer-motion';

export const PluginPreviewControl: React.FC = () => {
  const { preview, stopPreview, confirmPreview } = usePluginPreviewStore();
  const addTrackEffect = useAIStudioStore((state) => state.addTrackEffect);

  const handleConfirm = () => {
    if (!preview) return;
    
    // Add effect to track
    addTrackEffect(preview.trackId, {
      id: `${preview.pluginId}_${Date.now()}`,
      name: preview.pluginName,
      type: preview.effectType,
      enabled: true,
      parameters: {},
      rackPosition: 0
    });
    
    audioEngine.stopPluginPreview();
    confirmPreview();
  };

  const handleCancel = () => {
    audioEngine.stopPluginPreview();
    stopPreview();
  };

  return (
    <AnimatePresence>
      {preview && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50"
        >
          <Card className="bg-background/95 backdrop-blur-xl border-primary/20 shadow-2xl p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Volume2 className="w-5 h-5 text-primary animate-pulse" />
                </div>
                <div>
                  <p className="text-sm font-medium">Previewing</p>
                  <p className="text-xs text-muted-foreground">{preview.pluginName}</p>
                </div>
              </div>
              
              <div className="flex gap-2 ml-6">
                <Button
                  onClick={handleConfirm}
                  size="sm"
                  variant="default"
                  className="gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Add to Track
                </Button>
                <Button
                  onClick={handleCancel}
                  size="sm"
                  variant="outline"
                  className="gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
