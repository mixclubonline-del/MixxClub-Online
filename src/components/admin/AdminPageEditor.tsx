import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  useAllPageContent,
  useUpsertPageContent,
  useDeletePageContent,
  PAGE_CONTENT_DEFAULTS,
  type PageContentEntry,
} from '@/hooks/usePageContent';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  FileText, Plus, Save, Trash2, RefreshCw, Globe, Loader2,
} from 'lucide-react';

type ContentType = 'text' | 'rich_text' | 'image' | 'json';

const CONTENT_TYPE_OPTIONS: { value: ContentType; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'rich_text', label: 'Rich Text' },
  { value: 'image', label: 'Image URL' },
  { value: 'json', label: 'JSON' },
];

interface EditableEntry {
  page_slug: string;
  section_key: string;
  content_type: ContentType;
  content: string;
  metadata: Record<string, unknown>;
  isNew?: boolean;
}

export function AdminPageEditor() {
  const { user } = useAuth();
  const { data: entries = [], isLoading, refetch } = useAllPageContent();
  const upsert = useUpsertPageContent();
  const deleteMut = useDeletePageContent();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<EditableEntry | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newEntry, setNewEntry] = useState<EditableEntry>({
    page_slug: '',
    section_key: '',
    content_type: 'text',
    content: '',
    metadata: {},
    isNew: true,
  });

  const handleEdit = (entry: PageContentEntry) => {
    setEditingId(entry.id);
    setDraft({
      page_slug: entry.page_slug,
      section_key: entry.section_key,
      content_type: entry.content_type as ContentType,
      content: entry.content,
      metadata: entry.metadata ?? {},
    });
  };

  const handleSave = async (entry: EditableEntry) => {
    if (!entry.page_slug.trim() || !entry.section_key.trim()) {
      toast.error('Page slug and section key are required');
      return;
    }
    try {
      await upsert.mutateAsync({
        page_slug: entry.page_slug.trim(),
        section_key: entry.section_key.trim(),
        content_type: entry.content_type,
        content: entry.content,
        metadata: entry.metadata,
        updated_by: user?.id,
      });
      toast.success('Content saved');
      setEditingId(null);
      setDraft(null);
      setShowNew(false);
      setNewEntry({ page_slug: '', section_key: '', content_type: 'text', content: '', metadata: {}, isNew: true });
    } catch {
      toast.error('Failed to save content');
    }
  };

  const handleDelete = async (entry: PageContentEntry) => {
    if (!confirm(`Delete "${entry.page_slug}/${entry.section_key}"?`)) return;
    try {
      await deleteMut.mutateAsync(entry.id);
      toast.success('Content deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const seedDefaults = async () => {
    let count = 0;
    for (const [slug, sections] of Object.entries(PAGE_CONTENT_DEFAULTS)) {
      for (const [key, val] of Object.entries(sections)) {
        const exists = entries.some(e => e.page_slug === slug && e.section_key === key);
        if (!exists) {
          await upsert.mutateAsync({
            page_slug: slug,
            section_key: key,
            content_type: val.content_type,
            content: val.content,
            updated_by: user?.id,
          });
          count++;
        }
      }
    }
    if (count > 0) {
      toast.success(`Seeded ${count} default content entries`);
    } else {
      toast.info('All defaults already exist');
    }
  };

  // Group entries by page_slug
  const grouped = entries.reduce<Record<string, PageContentEntry[]>>((acc, e) => {
    (acc[e.page_slug] ??= []).push(e);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            Page Content Editor
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Edit site content directly — changes go live immediately.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={seedDefaults} disabled={upsert.isPending}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Seed Defaults
          </Button>
          <Button size="sm" onClick={() => setShowNew(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Add Section
          </Button>
        </div>
      </div>

      {/* New entry form */}
      {showNew && (
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="text-lg">New Content Block</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="Page slug (e.g. home)"
                value={newEntry.page_slug}
                onChange={e => setNewEntry(p => ({ ...p, page_slug: e.target.value }))}
              />
              <Input
                placeholder="Section key (e.g. hero_title)"
                value={newEntry.section_key}
                onChange={e => setNewEntry(p => ({ ...p, section_key: e.target.value }))}
              />
            </div>
            <select
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              value={newEntry.content_type}
              onChange={e => setNewEntry(p => ({ ...p, content_type: e.target.value as ContentType }))}
            >
              {CONTENT_TYPE_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <Textarea
              placeholder="Content..."
              rows={4}
              value={newEntry.content}
              onChange={e => setNewEntry(p => ({ ...p, content: e.target.value }))}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setShowNew(false)}>Cancel</Button>
              <Button size="sm" onClick={() => handleSave(newEntry)} disabled={upsert.isPending}>
                <Save className="w-4 h-4 mr-1" />
                Save
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && entries.length === 0 && (
        <Card variant="glass" className="text-center py-12">
          <Globe className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No content entries yet.</p>
          <p className="text-muted-foreground text-sm">Click "Seed Defaults" to populate initial site content.</p>
        </Card>
      )}

      {/* Grouped content */}
      {Object.entries(grouped).map(([slug, items]) => (
        <Card key={slug} variant="glass">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              /{slug}
            </CardTitle>
            <CardDescription>{items.length} section{items.length !== 1 ? 's' : ''}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map(entry => {
              const isEditing = editingId === entry.id;
              return (
                <div key={entry.id} className="border border-border/40 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-sm font-semibold text-primary">
                        {entry.section_key}
                      </span>
                      <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        {entry.content_type}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {!isEditing ? (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(entry)}>
                            Edit
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(entry)}>
                            <Trash2 className="w-3 h-3 text-destructive" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => { setEditingId(null); setDraft(null); }}>
                            Cancel
                          </Button>
                          <Button size="sm" onClick={() => draft && handleSave(draft)} disabled={upsert.isPending}>
                            <Save className="w-3 h-3 mr-1" />
                            Save
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {isEditing && draft ? (
                    <Textarea
                      rows={4}
                      value={draft.content}
                      onChange={e => setDraft(p => p ? { ...p, content: e.target.value } : p)}
                      className="font-mono text-sm"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-3">
                      {entry.content || '(empty)'}
                    </p>
                  )}

                  <p className="text-xs text-muted-foreground/60">
                    Updated {new Date(entry.updated_at).toLocaleDateString()}
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
