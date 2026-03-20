import { useState, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  useAllLandingPages,
  useCreateLandingPage,
  useUpdateLandingPage,
  useDeleteLandingPage,
  type LandingPage,
  type LandingBlock,
} from '@/hooks/useLandingPages';
import {
  BLOCK_TYPES,
  getBlockDef,
  getDefaultProps,
  type BlockFieldDef,
} from '@/components/landing-builder/blockRegistry';
import { BlockRenderer } from '@/components/landing-builder/BlockRenderer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Plus, Save, Trash2, ArrowUp, ArrowDown, Eye, EyeOff,
  Loader2, LayoutTemplate, ChevronLeft, Copy, GripVertical,
  Sparkles, LayoutGrid, BarChart3, MessageCircle, Megaphone,
  Columns, Type, Minus, Globe,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ReactNode> = {
  Sparkles: <Sparkles className="w-4 h-4" />,
  LayoutGrid: <LayoutGrid className="w-4 h-4" />,
  BarChart3: <BarChart3 className="w-4 h-4" />,
  MessageCircle: <MessageCircle className="w-4 h-4" />,
  Megaphone: <Megaphone className="w-4 h-4" />,
  Columns: <Columns className="w-4 h-4" />,
  Type: <Type className="w-4 h-4" />,
  Minus: <Minus className="w-4 h-4" />,
};

// ─── PAGE LIST VIEW ───────────────────────────────────
function PageList({
  pages,
  onSelect,
  onCreate,
  onDelete,
  loading,
}: {
  pages: LandingPage[];
  onSelect: (p: LandingPage) => void;
  onCreate: (slug: string, title: string) => void;
  onDelete: (id: string) => void;
  loading: boolean;
}) {
  const [newSlug, setNewSlug] = useState('');
  const [newTitle, setNewTitle] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <LayoutTemplate className="w-6 h-6 text-primary" />
            Landing Page Builder
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Create and manage block-based landing pages.
          </p>
        </div>
      </div>

      {/* Create new */}
      <Card variant="glass">
        <CardContent className="pt-6">
          <div className="flex gap-3 items-end">
            <div className="flex-1 space-y-1">
              <Label className="text-xs">Page Title</Label>
              <Input
                placeholder="My Landing Page"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
              />
            </div>
            <div className="flex-1 space-y-1">
              <Label className="text-xs">URL Slug</Label>
              <Input
                placeholder="my-landing-page"
                value={newSlug}
                onChange={e => setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
              />
            </div>
            <Button
              onClick={() => {
                if (!newSlug.trim() || !newTitle.trim()) {
                  toast.error('Title and slug are required');
                  return;
                }
                onCreate(newSlug.trim(), newTitle.trim());
                setNewSlug('');
                setNewTitle('');
              }}
              disabled={loading}
            >
              <Plus className="w-4 h-4 mr-1" />
              Create
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}

      {!loading && pages.length === 0 && (
        <Card variant="glass" className="text-center py-12">
          <LayoutTemplate className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No landing pages yet. Create one above.</p>
        </Card>
      )}

      <div className="grid gap-4">
        {pages.map(page => (
          <Card key={page.id} variant="glass" className="cursor-pointer hover:border-primary/30 transition-colors" onClick={() => onSelect(page)}>
            <CardContent className="pt-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <LayoutTemplate className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{page.title}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Globe className="w-3 h-3" />
                    /p/{page.slug}
                    <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${page.is_published ? 'bg-green-500/20 text-green-400' : 'bg-muted text-muted-foreground'}`}>
                      {page.is_published ? 'Published' : 'Draft'}
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                <span className="text-xs text-muted-foreground">{page.blocks.length} block{page.blocks.length !== 1 ? 's' : ''}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (confirm(`Delete "${page.title}"?`)) onDelete(page.id);
                  }}
                >
                  <Trash2 className="w-3 h-3 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── BLOCK FIELD EDITOR ───────────────────────────────
function BlockFieldEditor({
  field,
  value,
  onChange,
}: {
  field: BlockFieldDef;
  value: any;
  onChange: (val: any) => void;
}) {
  switch (field.type) {
    case 'text':
      return (
        <div className="space-y-1">
          <Label className="text-xs">{field.label}</Label>
          <Input value={value ?? ''} onChange={e => onChange(e.target.value)} />
        </div>
      );
    case 'textarea':
      return (
        <div className="space-y-1">
          <Label className="text-xs">{field.label}</Label>
          <Textarea value={value ?? ''} onChange={e => onChange(e.target.value)} rows={4} className="font-mono text-sm" />
        </div>
      );
    case 'number':
      return (
        <div className="space-y-1">
          <Label className="text-xs">{field.label}</Label>
          <Input type="number" value={value ?? 0} onChange={e => onChange(Number(e.target.value))} />
        </div>
      );
    case 'select':
      return (
        <div className="space-y-1">
          <Label className="text-xs">{field.label}</Label>
          <select
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            value={value ?? ''}
            onChange={e => onChange(e.target.value)}
          >
            {field.options?.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      );
    case 'toggle':
      return (
        <div className="flex items-center justify-between py-1">
          <Label className="text-xs">{field.label}</Label>
          <Switch checked={!!value} onCheckedChange={onChange} />
        </div>
      );
    case 'image':
      return (
        <div className="space-y-1">
          <Label className="text-xs">{field.label}</Label>
          <Input
            value={value ?? ''}
            onChange={e => onChange(e.target.value)}
            placeholder="Storage path or URL"
          />
          {value && (
            <p className="text-xs text-muted-foreground">Preview: {value}</p>
          )}
        </div>
      );
    case 'color':
      return (
        <div className="space-y-1">
          <Label className="text-xs">{field.label}</Label>
          <Input type="color" value={value ?? '#000000'} onChange={e => onChange(e.target.value)} />
        </div>
      );
    default:
      return null;
  }
}

// ─── PAGE EDITOR VIEW ─────────────────────────────────
function PageEditor({
  page,
  onBack,
  onSave,
  saving,
}: {
  page: LandingPage;
  onBack: () => void;
  onSave: (updates: Partial<LandingPage>) => void;
  saving: boolean;
}) {
  const [title, setTitle] = useState(page.title);
  const [isPublished, setIsPublished] = useState(page.is_published);
  const [blocks, setBlocks] = useState<LandingBlock[]>(page.blocks);
  const [editingBlockIdx, setEditingBlockIdx] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showBlockPicker, setShowBlockPicker] = useState(false);
  const dragIdx = useRef<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const handleDragStart = (idx: number) => {
    dragIdx.current = idx;
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx.current !== null && dragIdx.current !== idx) {
      setDragOverIdx(idx);
    }
  };

  const handleDrop = (idx: number) => {
    if (dragIdx.current === null || dragIdx.current === idx) {
      setDragOverIdx(null);
      dragIdx.current = null;
      return;
    }
    setBlocks(prev => {
      const copy = [...prev];
      const [moved] = copy.splice(dragIdx.current!, 1);
      copy.splice(idx, 0, moved);
      return copy;
    });
    if (editingBlockIdx === dragIdx.current) {
      setEditingBlockIdx(idx);
    } else if (editingBlockIdx !== null) {
      // Adjust editing index if it shifted
      const from = dragIdx.current!;
      const to = idx;
      if (editingBlockIdx > from && editingBlockIdx <= to) {
        setEditingBlockIdx(editingBlockIdx - 1);
      } else if (editingBlockIdx < from && editingBlockIdx >= to) {
        setEditingBlockIdx(editingBlockIdx + 1);
      }
    }
    dragIdx.current = null;
    setDragOverIdx(null);
  };

  const handleDragEnd = () => {
    dragIdx.current = null;
    setDragOverIdx(null);
  };

  const addBlock = (type: string) => {
    const newBlock: LandingBlock = {
      id: crypto.randomUUID(),
      type,
      props: getDefaultProps(type),
    };
    setBlocks(prev => [...prev, newBlock]);
    setEditingBlockIdx(blocks.length);
    setShowBlockPicker(false);
  };

  const updateBlockProps = useCallback((idx: number, key: string, value: any) => {
    setBlocks(prev => prev.map((b, i) =>
      i === idx ? { ...b, props: { ...b.props, [key]: value } } : b
    ));
  }, []);

  const removeBlock = (idx: number) => {
    setBlocks(prev => prev.filter((_, i) => i !== idx));
    setEditingBlockIdx(null);
  };

  const moveBlock = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= blocks.length) return;
    setBlocks(prev => {
      const copy = [...prev];
      [copy[idx], copy[target]] = [copy[target], copy[idx]];
      return copy;
    });
    setEditingBlockIdx(target);
  };

  const duplicateBlock = (idx: number) => {
    const clone: LandingBlock = {
      ...blocks[idx],
      id: crypto.randomUUID(),
      props: { ...blocks[idx].props },
    };
    setBlocks(prev => [...prev.slice(0, idx + 1), clone, ...prev.slice(idx + 1)]);
  };

  const handleSave = () => {
    onSave({ id: page.id, title, is_published: isPublished, blocks });
  };

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <Input
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="font-semibold text-lg w-64"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Label className="text-xs">Published</Label>
            <Switch checked={isPublished} onCheckedChange={setIsPublished} />
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
            {showPreview ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
            {showPreview ? 'Edit' : 'Preview'}
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
            Save
          </Button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        URL: <code className="bg-muted px-2 py-0.5 rounded">/p/{page.slug}</code>
        {' · '}
        {blocks.length} block{blocks.length !== 1 ? 's' : ''}
      </p>

      {/* PREVIEW MODE */}
      {showPreview ? (
        <div className="border border-border rounded-xl overflow-hidden bg-background">
          {blocks.length === 0 ? (
            <div className="py-24 text-center text-muted-foreground">
              No blocks added yet.
            </div>
          ) : (
            blocks.map(block => <BlockRenderer key={block.id} block={block} />)
          )}
        </div>
      ) : (
        <>
          {/* BLOCK LIST */}
          <div className="space-y-3">
            {blocks.map((block, idx) => {
              const def = getBlockDef(block.type);
              const isEditing = editingBlockIdx === idx;

              return (
                <Card key={block.id} variant="glass" className={isEditing ? 'border-primary/40' : ''}>
                  <CardContent className="pt-4">
                    {/* Block header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <GripVertical className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground font-mono">#{idx + 1}</span>
                        {ICON_MAP[def?.icon || ''] || <LayoutTemplate className="w-4 h-4" />}
                        <span className="font-medium text-sm">{def?.label || block.type}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => moveBlock(idx, -1)} disabled={idx === 0}>
                          <ArrowUp className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => moveBlock(idx, 1)} disabled={idx === blocks.length - 1}>
                          <ArrowDown className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => duplicateBlock(idx)}>
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setEditingBlockIdx(isEditing ? null : idx)}>
                          {isEditing ? 'Collapse' : 'Edit'}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => removeBlock(idx)}>
                          <Trash2 className="w-3 h-3 text-destructive" />
                        </Button>
                      </div>
                    </div>

                    {/* Block fields */}
                    {isEditing && def && (() => {
                      const contentFields = def.fields.filter(f => !f.group);
                      const styleFields = def.fields.filter(f => f.group === 'Style');
                      return (
                        <div className="mt-4 space-y-4 pl-6 border-l-2 border-primary/20">
                          {/* Content fields */}
                          <div className="space-y-3">
                            {contentFields.map(field => (
                              <BlockFieldEditor
                                key={field.key}
                                field={field}
                                value={block.props[field.key]}
                                onChange={(val) => updateBlockProps(idx, field.key, val)}
                              />
                            ))}
                          </div>
                          {/* Style fields */}
                          {styleFields.length > 0 && (
                            <details className="group">
                              <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors select-none py-2">
                                ▸ Style Overrides
                              </summary>
                              <div className="mt-2 space-y-3 p-3 rounded-lg bg-muted/30 border border-border/30">
                                {styleFields.map(field => (
                                  <BlockFieldEditor
                                    key={field.key}
                                    field={field}
                                    value={block.props[field.key]}
                                    onChange={(val) => updateBlockProps(idx, field.key, val)}
                                  />
                                ))}
                              </div>
                            </details>
                          )}
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* ADD BLOCK */}
          {showBlockPicker ? (
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="text-lg">Add Block</CardTitle>
                <CardDescription>Choose a block type to add to the page.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {BLOCK_TYPES.map(bt => (
                    <button
                      key={bt.type}
                      onClick={() => addBlock(bt.type)}
                      className="p-4 rounded-xl border border-border/40 bg-background/50 hover:border-primary/40 hover:bg-primary/5 transition-all text-left space-y-1"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {ICON_MAP[bt.icon] || <LayoutTemplate className="w-4 h-4" />}
                        <span className="font-medium text-sm">{bt.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{bt.description}</p>
                    </button>
                  ))}
                </div>
                <div className="mt-4 text-right">
                  <Button variant="ghost" size="sm" onClick={() => setShowBlockPicker(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Button variant="outline" className="w-full border-dashed" onClick={() => setShowBlockPicker(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Block
            </Button>
          )}
        </>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────
export function AdminLandingBuilder() {
  const { user } = useAuth();
  const { data: pages = [], isLoading } = useAllLandingPages();
  const createMut = useCreateLandingPage();
  const updateMut = useUpdateLandingPage();
  const deleteMut = useDeleteLandingPage();
  const [selectedPage, setSelectedPage] = useState<LandingPage | null>(null);

  const handleCreate = async (slug: string, title: string) => {
    try {
      const page = await createMut.mutateAsync({ slug, title, created_by: user?.id });
      setSelectedPage(page);
      toast.success(`Created "${title}"`);
    } catch (err: any) {
      toast.error(err.message?.includes('duplicate') ? 'Slug already exists' : 'Failed to create page');
    }
  };

  const handleSave = async (updates: Partial<LandingPage>) => {
    try {
      await updateMut.mutateAsync({ ...updates, updated_by: user?.id } as any);
      toast.success('Page saved');
      // Update local state
      if (selectedPage && updates.id === selectedPage.id) {
        setSelectedPage({ ...selectedPage, ...updates } as LandingPage);
      }
    } catch {
      toast.error('Failed to save');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMut.mutateAsync(id);
      toast.success('Page deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  if (selectedPage) {
    // Re-fetch the latest version when returning
    const latestPage = pages.find(p => p.id === selectedPage.id) || selectedPage;
    return (
      <PageEditor
        page={latestPage}
        onBack={() => setSelectedPage(null)}
        onSave={handleSave}
        saving={updateMut.isPending}
      />
    );
  }

  return (
    <PageList
      pages={pages}
      onSelect={setSelectedPage}
      onCreate={handleCreate}
      onDelete={handleDelete}
      loading={isLoading}
    />
  );
}
