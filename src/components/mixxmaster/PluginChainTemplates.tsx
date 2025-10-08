import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Layers, Save, Trash2, Star } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PluginChainTemplate {
  id: string;
  template_name: string;
  plugin_chain: any;
  category: string;
  downloads_count: number;
  is_public: boolean;
}

export const PluginChainTemplates = () => {
  const [newTemplateName, setNewTemplateName] = useState('');
  const queryClient = useQueryClient();

  const { data: templates, isLoading } = useQuery({
    queryKey: ['plugin-chain-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plugin_chain_templates')
        .select('*')
        .order('downloads_count', { ascending: false });

      if (error) throw error;
      return data as PluginChainTemplate[];
    },
  });

  const createTemplate = useMutation({
    mutationFn: async (name: string) => {
      const user = await supabase.auth.getUser();
      const { error } = await supabase
        .from('plugin_chain_templates')
        .insert({
          creator_id: user.data.user?.id || '',
          template_name: name,
          plugin_chain: {
            chains: [],
            version: '1.0'
          },
          category: 'mixing',
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plugin-chain-templates'] });
      toast.success('Template created');
      setNewTemplateName('');
    },
    onError: () => {
      toast.error('Failed to create template');
    },
  });

  const deleteTemplate = useMutation({
    mutationFn: async (templateId: string) => {
      const { error } = await supabase
        .from('plugin_chain_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plugin-chain-templates'] });
      toast.success('Template deleted');
    },
    onError: () => {
      toast.error('Failed to delete template');
    },
  });

  const toggleFavorite = useMutation({
    mutationFn: async ({ templateId, isPublic }: { templateId: string; isPublic: boolean }) => {
      const { error } = await supabase
        .from('plugin_chain_templates')
        .update({ is_public: !isPublic })
        .eq('id', templateId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plugin-chain-templates'] });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="h-5 w-5" />
          Plugin Chain Templates
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="New template name..."
            value={newTemplateName}
            onChange={(e) => setNewTemplateName(e.target.value)}
          />
          <Button
            onClick={() => createTemplate.mutate(newTemplateName)}
            disabled={!newTemplateName.trim()}
          >
            <Save className="h-4 w-4 mr-2" />
            Create
          </Button>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading templates...</p>
        ) : templates && templates.length > 0 ? (
          <div className="space-y-2">
            {templates.map((template) => (
              <div
                key={template.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{template.template_name}</p>
                    {template.is_public && (
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    )}
                  </div>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      Downloaded {template.downloads_count} times
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {template.category}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleFavorite.mutate({
                      templateId: template.id,
                      isPublic: template.is_public
                    })}
                  >
                    <Star className={`h-4 w-4 ${template.is_public ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteTemplate.mutate(template.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No templates yet. Create your first plugin chain template!
          </p>
        )}
      </CardContent>
    </Card>
  );
};
