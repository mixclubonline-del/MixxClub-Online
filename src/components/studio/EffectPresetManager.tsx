import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Search, Save, Trash2, Globe, Lock, Download, Upload } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

interface EffectPresetManagerProps {
  isOpen: boolean;
  onClose: () => void;
  effectType: string;
  currentParameters?: Record<string, number>;
  onLoadPreset: (parameters: Record<string, number>) => void;
}

interface Preset {
  id: string;
  preset_name: string;
  parameters: Record<string, number>;
  is_public: boolean;
  created_at: string;
  user_id: string;
}

type DatabasePreset = {
  id: string;
  preset_name: string;
  parameters: unknown;
  is_public: boolean;
  created_at: string;
  user_id: string;
  effect_type: string;
};

export const EffectPresetManager = ({
  isOpen,
  onClose,
  effectType,
  currentParameters = {},
  onLoadPreset,
}: EffectPresetManagerProps) => {
  const { toast } = useToast();
  const [presets, setPresets] = useState<Preset[]>([]);
  const [publicPresets, setPublicPresets] = useState<Preset[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [saveName, setSaveName] = useState('');
  const [saving, setSaving] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadPresets();
      getCurrentUser();
    }
  }, [isOpen, effectType]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  };

  const loadPresets = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load user's presets
      const { data: userPresets, error: userError } = await supabase
        .from('effect_presets')
        .select('*')
        .eq('effect_type', effectType)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (userError) throw userError;

      // Load public presets from other users
      const { data: publicPresetsData, error: publicError } = await supabase
        .from('effect_presets')
        .select('*')
        .eq('effect_type', effectType)
        .eq('is_public', true)
        .neq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (publicError) throw publicError;

      // Cast parameters from JSON to the expected type
      const mapPresets = (data: DatabasePreset[]): Preset[] =>
        data.map(p => ({
          ...p,
          parameters: p.parameters as Record<string, number>,
        }));

      setPresets(mapPresets(userPresets || []));
      setPublicPresets(mapPresets(publicPresetsData || []));
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

  const handleSavePreset = async (isPublic: boolean = false) => {
    if (!saveName.trim()) {
      toast({
        title: 'Name required',
        description: 'Please enter a name for your preset',
        variant: 'destructive',
      });
      return;
    }

    if (!currentUserId) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to save presets',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('effect_presets')
        .insert({
          user_id: currentUserId,
          effect_type: effectType,
          preset_name: saveName.trim(),
          parameters: currentParameters,
          is_public: isPublic,
        });

      if (error) throw error;

      toast({
        title: 'Preset saved',
        description: `"${saveName}" saved successfully${isPublic ? ' and shared with community' : ''}`,
      });

      setSaveName('');
      loadPresets();
    } catch (error: any) {
      console.error('Error saving preset:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save preset',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLoadPreset = (preset: Preset) => {
    onLoadPreset(preset.parameters);
    toast({
      title: 'Preset loaded',
      description: `"${preset.preset_name}" applied successfully`,
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
        title: 'Preset deleted',
        description: 'Preset removed successfully',
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

  const filteredPresets = presets.filter(p =>
    p.preset_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPublicPresets = publicPresets.filter(p =>
    p.preset_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>
            {effectType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Presets
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Save Current Settings */}
          <Card className="p-4 bg-muted/50">
            <h3 className="text-sm font-semibold mb-3">Save Current Settings</h3>
            <div className="flex gap-2">
              <Input
                placeholder="Preset name..."
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSavePreset()}
              />
              <Button onClick={() => handleSavePreset()} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button onClick={() => handleSavePreset(true)} disabled={saving} variant="outline">
                <Globe className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </Card>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search presets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Presets Tabs */}
          <Tabs defaultValue="my-presets" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="my-presets">
                <Lock className="w-4 h-4 mr-2" />
                My Presets ({filteredPresets.length})
              </TabsTrigger>
              <TabsTrigger value="community">
                <Globe className="w-4 h-4 mr-2" />
                Community ({filteredPublicPresets.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="my-presets">
              <ScrollArea className="h-[300px] pr-4">
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading presets...</div>
                ) : filteredPresets.length === 0 ? (
                  <div className="text-center py-12">
                    <Save className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {searchQuery ? 'No presets match your search' : 'No saved presets yet'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Save your current settings to create your first preset
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredPresets.map((preset) => (
                      <Card key={preset.id} className="p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{preset.preset_name}</h4>
                              {preset.is_public && (
                                <Badge variant="secondary" className="gap-1">
                                  <Globe className="w-3 h-3" />
                                  Public
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {new Date(preset.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleLoadPreset(preset)}
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Load
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeletePreset(preset.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="community">
              <ScrollArea className="h-[300px] pr-4">
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading presets...</div>
                ) : filteredPublicPresets.length === 0 ? (
                  <div className="text-center py-12">
                    <Globe className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {searchQuery
                        ? 'No community presets match your search'
                        : 'No community presets available yet'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Share your presets to help the community!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredPublicPresets.map((preset) => (
                      <Card key={preset.id} className="p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium">{preset.preset_name}</h4>
                            <p className="text-xs text-muted-foreground">
                              {new Date(preset.created_at).toLocaleDateString()} • Community preset
                            </p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleLoadPreset(preset)}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Load
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};
