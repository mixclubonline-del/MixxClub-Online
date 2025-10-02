import { useState, useEffect } from 'react';
import { FileText, Plus, Pencil, Trash2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export const ApplicationTemplates = () => {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [formData, setFormData] = useState({
    template_name: '',
    cover_letter: '',
    experience_summary: '',
    is_default: false,
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('application_templates')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching templates:', error);
      return;
    }

    setTemplates(data || []);
    setLoading(false);
  };

  const saveTemplate = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (editingTemplate) {
      const { error } = await supabase
        .from('application_templates')
        .update(formData)
        .eq('id', editingTemplate.id);

      if (error) {
        toast.error('Failed to update template');
        return;
      }
      toast.success('Template updated');
    } else {
      const { error } = await supabase
        .from('application_templates')
        .insert({ ...formData, user_id: user.id });

      if (error) {
        toast.error('Failed to create template');
        return;
      }
      toast.success('Template created');
    }

    setOpen(false);
    setEditingTemplate(null);
    setFormData({
      template_name: '',
      cover_letter: '',
      experience_summary: '',
      is_default: false,
    });
    fetchTemplates();
  };

  const deleteTemplate = async (id: string) => {
    const { error } = await supabase
      .from('application_templates')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete template');
      return;
    }

    toast.success('Template deleted');
    fetchTemplates();
  };

  const editTemplate = (template: any) => {
    setEditingTemplate(template);
    setFormData({
      template_name: template.template_name,
      cover_letter: template.cover_letter,
      experience_summary: template.experience_summary,
      is_default: template.is_default,
    });
    setOpen(true);
  };

  if (loading) {
    return <div className="text-center py-8">Loading templates...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Application Templates</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? 'Edit Template' : 'Create Template'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Template Name</Label>
                <Input
                  value={formData.template_name}
                  onChange={(e) => setFormData({ ...formData, template_name: e.target.value })}
                  placeholder="e.g., Standard Application"
                />
              </div>
              <div>
                <Label>Cover Letter</Label>
                <Textarea
                  value={formData.cover_letter}
                  onChange={(e) => setFormData({ ...formData, cover_letter: e.target.value })}
                  placeholder="Your cover letter template..."
                  rows={8}
                />
              </div>
              <div>
                <Label>Experience Summary</Label>
                <Textarea
                  value={formData.experience_summary}
                  onChange={(e) => setFormData({ ...formData, experience_summary: e.target.value })}
                  placeholder="Brief summary of your experience..."
                  rows={4}
                />
              </div>
              <Button onClick={saveTemplate} className="w-full">
                {editingTemplate ? 'Update Template' : 'Create Template'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {templates.length === 0 ? (
        <Card className="p-8 text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Templates</h3>
          <p className="text-muted-foreground mb-4">
            Create templates to quickly apply to jobs
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {templates.map((template) => (
            <Card key={template.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">{template.template_name}</h4>
                    {template.is_default && (
                      <Badge variant="secondary">
                        <Star className="w-3 h-3 mr-1 fill-current" />
                        Default
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {template.cover_letter}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => editTemplate(template)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteTemplate(template.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
