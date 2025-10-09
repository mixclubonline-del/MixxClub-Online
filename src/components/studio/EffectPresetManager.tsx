import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Save, Loader2, Star, Sparkles } from 'lucide-react';
import { EffectUnit } from '@/stores/aiStudioStore';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface EffectPresetManagerProps {
  isOpen: boolean;
  onClose: () => void;
  effectType: EffectUnit['type'];
  currentParameters?: Record<string, number>;
  onLoadPreset: (parameters: Record<string, number>) => void;
}

interface Preset {
  id: string;
  preset_name: string;
  parameters: Record<string, number>;
  is_factory: boolean;
  is_public: boolean;
  description?: string;
  tags?: string[];
}

/**
 * Effect preset manager for saving and loading effect configurations
 */
export const EffectPresetManager = ({
  isOpen,
  onClose,
  effectType,
  currentParameters,
  onLoadPreset,
}: EffectPresetManagerProps) => {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetDescription, setNewPresetDescription] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadPresets();
    }
  }, [isOpen, effectType]);

  const loadPresets = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('effect_presets')
        .select('*')
        .eq('effect_type', effectType)
        .order('is_factory', { ascending: false })
        .order('preset_name');

      if (error) throw error;
      
      // Type cast the parameters from Json to Record<string, number>
      const typedPresets = (data || []).map(preset => ({
        ...preset,
        parameters: preset.parameters as Record<string, number>,
      }));
      
      setPresets(typedPresets);
    } catch (error) {
      console.error('Error loading presets:', error);
      toast({
        title: 'Error',
        description: 'Failed to load presets',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreset = async () => {
    if (!newPresetName.trim() || !currentParameters) return;

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('effect_presets')
        .insert({
          user_id: user.id,
          effect_type: effectType,
          preset_name: newPresetName.trim(),
          parameters: currentParameters,
          description: newPresetDescription.trim() || null,
          is_factory: false,
          is_public: false,
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Preset saved successfully',
      });

      setNewPresetName('');
      setNewPresetDescription('');
      loadPresets();
    } catch (error) {
      console.error('Error saving preset:', error);
      toast({
        title: 'Error',
        description: 'Failed to save preset',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLoadPreset = (preset: Preset) => {
    onLoadPreset(preset.parameters);
    toast({
      title: 'Preset Loaded',
      description: `Applied "${preset.preset_name}"`,
    });
    onClose();
  };

  const handleDeletePreset = async (presetId: string) => {
    try {
      const { error } = await supabase
        .from('effect_presets')
        .delete()
        .eq('id', presetId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Preset deleted',
      });
      loadPresets();
    } catch (error) {
      console.error('Error deleting preset:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete preset',
        variant: 'destructive',
      });
    }
  };

  const factoryPresets = presets.filter(p => p.is_factory);
  const userPresets = presets.filter(p => !p.is_factory && !p.is_public);
  const publicPresets = presets.filter(p => p.is_public && !p.is_factory);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-primary" />
            {effectType.toUpperCase()} Presets
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6">
          {/* Preset Browser */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Load Preset</h3>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <ScrollArea className="h-96">
                <div className="space-y-4 pr-4">
                  {/* Factory Presets */}
                  {factoryPresets.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <h4 className="text-xs font-semibold uppercase text-muted-foreground">
                          Factory Presets
                        </h4>
                      </div>
                      <div className="space-y-2">
                        {factoryPresets.map((preset) => (
                          <div
                            key={preset.id}
                            onClick={() => handleLoadPreset(preset)}
                            className={cn(
                              'p-3 rounded-lg cursor-pointer transition-all',
                              'bg-card hover:bg-accent border border-border',
                              'hover:shadow-md hover:scale-[1.02]'
                            )}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h5 className="text-sm font-medium">
                                  {preset.preset_name}
                                </h5>
                                {preset.description && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {preset.description}
                                  </p>
                                )}
                              </div>
                              <Badge variant="secondary" className="text-[10px]">
                                Factory
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* User Presets */}
                  {userPresets.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                        My Presets
                      </h4>
                      <div className="space-y-2">
                        {userPresets.map((preset) => (
                          <div
                            key={preset.id}
                            className={cn(
                              'p-3 rounded-lg transition-all group',
                              'bg-card hover:bg-accent border border-border'
                            )}
                          >
                            <div className="flex items-start justify-between">
                              <div
                                className="flex-1 cursor-pointer"
                                onClick={() => handleLoadPreset(preset)}
                              >
                                <h5 className="text-sm font-medium">
                                  {preset.preset_name}
                                </h5>
                                {preset.description && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {preset.description}
                                  </p>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeletePreset(preset.id);
                                }}
                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                              >
                                ×
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Public Presets */}
                  {publicPresets.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                        Community Presets
                      </h4>
                      <div className="space-y-2">
                        {publicPresets.map((preset) => (
                          <div
                            key={preset.id}
                            onClick={() => handleLoadPreset(preset)}
                            className={cn(
                              'p-3 rounded-lg cursor-pointer transition-all',
                              'bg-card hover:bg-accent border border-border',
                              'hover:shadow-md hover:scale-[1.02]'
                            )}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h5 className="text-sm font-medium">
                                  {preset.preset_name}
                                </h5>
                                {preset.description && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {preset.description}
                                  </p>
                                )}
                              </div>
                              <Badge variant="secondary" className="text-[10px]">
                                Public
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {presets.length === 0 && !loading && (
                    <p className="text-center text-muted-foreground py-8 text-sm">
                      No presets available yet
                    </p>
                  )}
                </div>
              </ScrollArea>
            )}
          </div>

          {/* Save New Preset */}
          <div className="space-y-4 border-l pl-6">
            <h3 className="text-sm font-semibold">Save Current Settings</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="preset-name">Preset Name</Label>
                <Input
                  id="preset-name"
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  placeholder="e.g., Warm Vocals"
                />
              </div>

              <div>
                <Label htmlFor="preset-description">Description (optional)</Label>
                <Textarea
                  id="preset-description"
                  value={newPresetDescription}
                  onChange={(e) => setNewPresetDescription(e.target.value)}
                  placeholder="Describe what this preset does..."
                  rows={3}
                />
              </div>

              {currentParameters && (
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-xs font-semibold mb-2 text-muted-foreground">
                    Current Parameters:
                  </p>
                  <div className="grid grid-cols-2 gap-1 text-xs font-mono">
                    {Object.entries(currentParameters).map(([key, value]) => (
                      <div key={key}>
                        <span className="text-muted-foreground">{key}:</span>{' '}
                        {value.toFixed(2)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button
                onClick={handleSavePreset}
                disabled={!newPresetName.trim() || !currentParameters || saving}
                className="w-full"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Preset
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
