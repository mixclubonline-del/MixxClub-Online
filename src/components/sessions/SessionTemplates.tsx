import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Mic, SlidersHorizontal, CheckCircle, Music, Plus, Sparkles, ClipboardList, Rocket,
  Save, Trash2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const fromAny = (table: string) => (supabase.from as any)(table);

interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

interface SessionTemplate {
  id: string;
  name: string;
  description: string | null;
  session_type: string;
  checklist: ChecklistItem[];
  default_settings: Record<string, any>;
  icon: string;
  is_system: boolean;
  created_by: string | null;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  mic: <Mic className="h-5 w-5" />,
  'sliders-horizontal': <SlidersHorizontal className="h-5 w-5" />,
  'check-circle': <CheckCircle className="h-5 w-5" />,
  music: <Music className="h-5 w-5" />,
};

const SESSION_TYPES = [
  { value: 'recording', label: 'Recording' },
  { value: 'mixing', label: 'Mixing' },
  { value: 'mastering', label: 'Mastering' },
  { value: 'production', label: 'Production' },
  { value: 'review', label: 'Review' },
];

export const SessionTemplates: React.FC<{
  onApplyTemplate?: (template: SessionTemplate) => void;
}> = ({ onApplyTemplate }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['session-templates'],
    queryFn: async () => {
      const { data, error } = await fromAny('session_templates')
        .select('*')
        .order('is_system', { ascending: false })
        .order('name');
      if (error) throw error;
      return (data || []).map((t: any) => ({
        ...t,
        checklist: Array.isArray(t.checklist) ? t.checklist : JSON.parse(t.checklist || '[]'),
        default_settings: typeof t.default_settings === 'object' ? t.default_settings : JSON.parse(t.default_settings || '{}'),
      })) as SessionTemplate[];
    },
  });

  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await fromAny('session_templates').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session-templates'] });
      toast.success('Template deleted');
    },
  });

  const systemTemplates = templates.filter((t) => t.is_system);
  const customTemplates = templates.filter((t) => !t.is_system);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            Session Templates
          </h2>
          <p className="text-sm text-muted-foreground">
            Start sessions with pre-configured checklists and settings.
          </p>
        </div>
        <CreateTemplateDialog />
      </div>

      {/* System Templates */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5" /> Built-in Templates
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {systemTemplates.map((template, i) => (
            <TemplateCard
              key={template.id}
              template={template}
              index={i}
              onApply={onApplyTemplate}
            />
          ))}
        </div>
      </div>

      {/* Custom Templates */}
      {customTemplates.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Your Templates
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {customTemplates.map((template, i) => (
              <TemplateCard
                key={template.id}
                template={template}
                index={i}
                onApply={onApplyTemplate}
                onDelete={() => deleteTemplate.mutate(template.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

function TemplateCard({
  template,
  index,
  onApply,
  onDelete,
}: {
  template: SessionTemplate;
  index: number;
  onApply?: (t: SessionTemplate) => void;
  onDelete?: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const completedCount = template.checklist.filter((c) => c.done).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card variant="glass" hover="lift" className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
              {ICON_MAP[template.icon] || <Music className="h-5 w-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-sm">{template.name}</h4>
                <Badge variant="secondary" className="text-xs capitalize">{template.session_type}</Badge>
                {template.is_system && (
                  <Badge className="bg-primary/20 text-primary text-xs">Built-in</Badge>
                )}
              </div>
              {template.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">{template.description}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {template.checklist.length} steps • {template.default_settings.max_participants || 5} max participants
              </p>
            </div>
          </div>

          {/* Checklist preview */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-primary mt-2 hover:underline"
          >
            {expanded ? 'Hide checklist' : `View ${template.checklist.length}-step checklist`}
          </button>

          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-2"
            >
              <ScrollArea className="max-h-48">
                <div className="space-y-1.5">
                  {template.checklist.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 text-xs">
                      <div className={cn(
                        'w-4 h-4 rounded border flex items-center justify-center shrink-0',
                        'border-border/50'
                      )}>
                        {item.done && <CheckCircle className="h-3 w-3 text-primary" />}
                      </div>
                      <span className="text-muted-foreground">{item.label}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </motion.div>
          )}

          <div className="flex gap-2 mt-3">
            {onApply && (
              <Button size="sm" onClick={() => onApply(template)} className="flex-1">
                <Rocket className="h-3.5 w-3.5 mr-1" /> Use Template
              </Button>
            )}
            {onDelete && (
              <Button size="sm" variant="ghost" onClick={onDelete} className="text-destructive">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function CreateTemplateDialog() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sessionType, setSessionType] = useState('mixing');
  const [checklistText, setChecklistText] = useState('');

  const createTemplate = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const checklist = checklistText
        .split('\n')
        .filter((line) => line.trim())
        .map((label, i) => ({ id: String(i + 1), label: label.trim(), done: false }));

      const { error } = await fromAny('session_templates').insert({
        name,
        description: description || null,
        session_type: sessionType,
        checklist,
        default_settings: { audio_quality: 'high', max_participants: 5, visibility: 'private' },
        icon: sessionType === 'recording' ? 'mic' : sessionType === 'mastering' ? 'check-circle' : 'sliders-horizontal',
        is_system: false,
        created_by: user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session-templates'] });
      toast.success('Template created');
      setOpen(false);
      setName('');
      setDescription('');
      setChecklistText('');
    },
    onError: () => toast.error('Failed to create template'),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="h-3.5 w-3.5 mr-1" /> New Template
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Session Template</DialogTitle>
          <DialogDescription>
            Define a reusable template with a checklist for consistent session workflows.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <Input
            placeholder="Template name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
          <Select value={sessionType} onValueChange={setSessionType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SESSION_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div>
            <label className="text-sm font-medium mb-1 block">Checklist (one step per line)</label>
            <Textarea
              placeholder={"Set up mic and preamp\nCheck headphone levels\nRecord room tone\n..."}
              value={checklistText}
              onChange={(e) => setChecklistText(e.target.value)}
              rows={6}
            />
          </div>
          <Button
            onClick={() => createTemplate.mutate()}
            disabled={!name.trim() || !checklistText.trim() || createTemplate.isPending}
            className="w-full"
          >
            <Save className="h-4 w-4 mr-1" />
            {createTemplate.isPending ? 'Creating...' : 'Create Template'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
