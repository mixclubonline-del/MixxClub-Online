import { useState } from 'react';
import { Save, FolderOpen, Copy, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Preset {
  id: string;
  name: string;
  parameters: Record<string, number>;
  createdAt: string;
}

interface PresetManagerProps {
  effectType: string;
  currentParameters: Record<string, number>;
  onLoadPreset: (parameters: Record<string, number>) => void;
  isOpen: boolean;
  onClose: () => void;
}

const FACTORY_PRESETS: Record<string, Preset[]> = {
  eq: [
    { id: 'eq-vocal', name: 'Vocal Clarity', parameters: { band1: 0.4, band2: 0.6, band3: 0.7, band4: 0.5 }, createdAt: '2024-01-01' },
    { id: 'eq-bass', name: 'Bass Boost', parameters: { band1: 0.75, band2: 0.55, band3: 0.45, band4: 0.4 }, createdAt: '2024-01-01' },
    { id: 'eq-air', name: 'Air & Sparkle', parameters: { band1: 0.5, band2: 0.5, band3: 0.65, band4: 0.8 }, createdAt: '2024-01-01' },
  ],
  compressor: [
    { id: 'comp-vocal', name: 'Vocal Glue', parameters: { threshold: 0.55, ratio: 0.4, attack: 0.15, release: 0.35, makeup: 0.6 }, createdAt: '2024-01-01' },
    { id: 'comp-punchy', name: 'Punchy Drums', parameters: { threshold: 0.45, ratio: 0.6, attack: 0.05, release: 0.2, makeup: 0.7 }, createdAt: '2024-01-01' },
    { id: 'comp-master', name: 'Master Bus', parameters: { threshold: 0.65, ratio: 0.25, attack: 0.25, release: 0.5, makeup: 0.5 }, createdAt: '2024-01-01' },
  ],
  reverb: [
    { id: 'rev-room', name: 'Small Room', parameters: { mix: 0.15, decay: 0.3, damping: 0.6 }, createdAt: '2024-01-01' },
    { id: 'rev-hall', name: 'Concert Hall', parameters: { mix: 0.35, decay: 0.75, damping: 0.4 }, createdAt: '2024-01-01' },
    { id: 'rev-plate', name: 'Plate Reverb', parameters: { mix: 0.25, decay: 0.5, damping: 0.7 }, createdAt: '2024-01-01' },
  ],
  delay: [
    { id: 'del-slap', name: 'Slapback', parameters: { time: 0.1, feedback: 0.2, mix: 0.25, filter: 0.6 }, createdAt: '2024-01-01' },
    { id: 'del-eighth', name: '1/8 Note', parameters: { time: 0.3, feedback: 0.45, mix: 0.35, filter: 0.55 }, createdAt: '2024-01-01' },
    { id: 'del-dub', name: 'Dub Echo', parameters: { time: 0.5, feedback: 0.7, mix: 0.4, filter: 0.3 }, createdAt: '2024-01-01' },
  ],
};

export const PresetManager = ({
  effectType,
  currentParameters,
  onLoadPreset,
  isOpen,
  onClose,
}: PresetManagerProps) => {
  const [userPresets, setUserPresets] = useState<Preset[]>([]);
  const [newPresetName, setNewPresetName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const factoryPresets = FACTORY_PRESETS[effectType] || [];

  const handleSavePreset = () => {
    if (!newPresetName.trim()) {
      toast.error('Please enter a preset name');
      return;
    }

    const newPreset: Preset = {
      id: `user-${Date.now()}`,
      name: newPresetName,
      parameters: { ...currentParameters },
      createdAt: new Date().toISOString(),
    };

    setUserPresets([...userPresets, newPreset]);
    setNewPresetName('');
    setShowSaveDialog(false);
    toast.success(`Preset "${newPresetName}" saved`);
  };

  const handleLoadPreset = (preset: Preset) => {
    onLoadPreset(preset.parameters);
    toast.success(`Loaded "${preset.name}"`);
    onClose();
  };

  const handleDeletePreset = (presetId: string) => {
    setUserPresets(userPresets.filter(p => p.id !== presetId));
    toast.success('Preset deleted');
  };

  const handleDuplicatePreset = (preset: Preset) => {
    const duplicate: Preset = {
      id: `user-${Date.now()}`,
      name: `${preset.name} (Copy)`,
      parameters: { ...preset.parameters },
      createdAt: new Date().toISOString(),
    };
    setUserPresets([...userPresets, duplicate]);
    toast.success('Preset duplicated');
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5" />
              {effectType.toUpperCase()} Presets
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Save new preset button */}
            <Button 
              onClick={() => setShowSaveDialog(true)} 
              className="w-full"
              variant="outline"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Current Settings
            </Button>

            {/* Factory Presets */}
            {factoryPresets.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2 text-muted-foreground">Factory Presets</h3>
                <div className="space-y-1">
                  {factoryPresets.map(preset => (
                    <div
                      key={preset.id}
                      className="flex items-center gap-2 p-2 rounded hover:bg-accent cursor-pointer group"
                      onClick={() => handleLoadPreset(preset)}
                    >
                      <FolderOpen className="w-4 h-4 text-muted-foreground" />
                      <span className="flex-1 text-sm">{preset.name}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="opacity-0 group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicatePreset(preset);
                        }}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* User Presets */}
            {userPresets.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2 text-muted-foreground">My Presets</h3>
                <div className="space-y-1">
                  {userPresets.map(preset => (
                    <div
                      key={preset.id}
                      className="flex items-center gap-2 p-2 rounded hover:bg-accent cursor-pointer group"
                      onClick={() => handleLoadPreset(preset)}
                    >
                      <Save className="w-4 h-4 text-primary" />
                      <span className="flex-1 text-sm">{preset.name}</span>
                      <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicatePreset(preset);
                          }}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePreset(preset.id);
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Save Preset Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Save Preset</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Enter preset name..."
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSavePreset()}
            />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowSaveDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSavePreset} className="flex-1">
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
