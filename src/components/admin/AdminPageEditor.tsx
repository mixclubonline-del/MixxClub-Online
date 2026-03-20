import { useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  useAllPageContent,
  useUpsertPageContent,
  useDeletePageContent,
  PAGE_CONTENT_DEFAULTS,
  type PageContentEntry,
} from '@/hooks/usePageContent';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  FileText, Plus, Save, Trash2, RefreshCw, Globe, Loader2,
  Upload, Image as ImageIcon, X,
} from 'lucide-react';

type ContentType = 'text' | 'rich_text' | 'image' | 'json';

const CONTENT_TYPE_OPTIONS: { value: ContentType; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'rich_text', label: 'Rich Text' },
  { value: 'image', label: 'Image' },
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

const BUCKET = 'page-content-images';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

function getPublicUrl(path: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
}

/**
 * Upload image to page-content-images bucket and return the storage path.
 */
async function uploadImage(file: File, pageSlug: string, sectionKey: string): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const storagePath = `${pageSlug}/${sectionKey}_${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file, {
      cacheControl: '31536000',
      upsert: true,
    });

  if (error) throw error;
  return storagePath;
}

function ImageUploader({
  currentPath,
  onUpload,
  uploading,
}: {
  currentPath: string;
  onUpload: (file: File) => void;
  uploading: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const publicUrl = currentPath ? getPublicUrl(currentPath) : '';

  return (
    <div className="space-y-3">
      {currentPath && (
        <div className="relative rounded-lg overflow-hidden border border-border/40 bg-muted/30">
          <img
            src={publicUrl}
            alt="Content preview"
            className="w-full max-h-48 object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <div className="absolute bottom-2 left-2 right-2 text-xs font-mono text-muted-foreground bg-background/80 backdrop-blur-sm rounded px-2 py-1 truncate">
            {currentPath}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
          ) : (
            <Upload className="w-4 h-4 mr-1" />
          )}
          {currentPath ? 'Replace Image' : 'Upload Image'}
        </Button>
        {currentPath && (
          <span className="text-xs text-muted-foreground truncate max-w-[200px]">
            {currentPath.split('/').pop()}
          </span>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            if (file.size > 10 * 1024 * 1024) {
              toast.error('Image must be under 10MB');
              return;
            }
            onUpload(file);
          }
          e.target.value = '';
        }}
      />
    </div>
  );
}

export function AdminPageEditor() {
  const { user } = useAuth();
  const { data: entries = [], isLoading, refetch } = useAllPageContent();
  const upsert = useUpsertPageContent();
  const deleteMut = useDeletePageContent();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<EditableEntry | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [uploading, setUploading] = useState(false);
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

  const handleImageUpload = async (file: File, entry: EditableEntry, isNewEntry: boolean) => {
    setUploading(true);
    try {
      const storagePath = await uploadImage(file, entry.page_slug, entry.section_key);
      if (isNewEntry) {
        setNewEntry(p => ({ ...p, content: storagePath }));
      } else {
        setDraft(p => p ? { ...p, content: storagePath } : p);
      }
      toast.success('Image uploaded');
    } catch (err: any) {
      toast.error(`Upload failed: ${err.message ?? 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (entry: PageContentEntry) => {
    if (!confirm(`Delete "${entry.page_slug}/${entry.section_key}"?`)) return;
    try {
      // If it's an image, also delete from storage
      if (entry.content_type === 'image' && entry.content) {
        await supabase.storage.from(BUCKET).remove([entry.content]);
      }
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

  const renderContentEditor = (entry: EditableEntry, isNewEntry: boolean) => {
    if (entry.content_type === 'image') {
      return (
        <ImageUploader
          currentPath={entry.content}
          uploading={uploading}
          onUpload={(file) => handleImageUpload(file, entry, isNewEntry)}
        />
      );
    }
    return (
      <Textarea
        placeholder="Content..."
        rows={4}
        value={isNewEntry ? newEntry.content : (draft?.content ?? '')}
        onChange={e => {
          if (isNewEntry) {
            setNewEntry(p => ({ ...p, content: e.target.value }));
          } else {
            setDraft(p => p ? { ...p, content: e.target.value } : p);
          }
        }}
        className="font-mono text-sm"
      />
    );
  };

  const renderContentPreview = (entry: PageContentEntry) => {
    if (entry.content_type === 'image' && entry.content) {
      const url = getPublicUrl(entry.content);
      return (
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-md overflow-hidden border border-border/40 bg-muted/30 shrink-0">
            <img
              src={url}
              alt={entry.section_key}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '';
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
          <span className="text-xs text-muted-foreground font-mono truncate">{entry.content}</span>
        </div>
      );
    }
    return (
      <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-3">
        {entry.content || '(empty)'}
      </p>
    );
  };

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
            Edit site content and images directly — changes go live immediately.
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
              onChange={e => setNewEntry(p => ({ ...p, content_type: e.target.value as ContentType, content: '' }))}
            >
              {CONTENT_TYPE_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            {renderContentEditor(newEntry, true)}

            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setShowNew(false)}>Cancel</Button>
              <Button size="sm" onClick={() => handleSave(newEntry)} disabled={upsert.isPending || uploading}>
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
            <CardDescription>
              {items.length} section{items.length !== 1 ? 's' : ''}
              {items.some(i => i.content_type === 'image') && (
                <span className="ml-2 inline-flex items-center gap-1 text-xs">
                  <ImageIcon className="w-3 h-3" />
                  {items.filter(i => i.content_type === 'image').length} image{items.filter(i => i.content_type === 'image').length !== 1 ? 's' : ''}
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map(entry => {
              const isEditing = editingId === entry.id;
              return (
                <div key={entry.id} className="border border-border/40 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-semibold text-primary">
                        {entry.section_key}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        entry.content_type === 'image'
                          ? 'bg-accent/20 text-accent-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {entry.content_type === 'image' && <ImageIcon className="w-2.5 h-2.5 inline mr-1" />}
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
                          <Button size="sm" onClick={() => draft && handleSave(draft)} disabled={upsert.isPending || uploading}>
                            <Save className="w-3 h-3 mr-1" />
                            Save
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {isEditing && draft ? (
                    renderContentEditor(draft, false)
                  ) : (
                    renderContentPreview(entry)
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
