import { useState } from 'react';
import {
  useNavItems,
  useUpsertNavItem,
  useUpdateNavItem,
  useDeleteNavItem,
  useReorderNavItems,
  NAV_DEFAULTS,
  type NavItem,
} from '@/hooks/useNavItems';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Navigation, Plus, Save, Trash2, GripVertical, Eye, EyeOff,
  ExternalLink, Lock, Loader2, RefreshCw, ChevronDown, ChevronUp,
} from 'lucide-react';

type EditDraft = {
  id?: string;
  label: string;
  href: string;
  icon: string;
  is_visible: boolean;
  open_in_new_tab: boolean;
  requires_auth: boolean;
  nav_group: string;
};

const EMPTY_DRAFT: EditDraft = {
  label: '', href: '', icon: '', is_visible: true,
  open_in_new_tab: false, requires_auth: false, nav_group: 'main',
};

const GROUP_LABELS: Record<string, string> = {
  main: 'Main Navigation',
  footer: 'Footer Links',
  mobile: 'Mobile Navigation',
};

export function AdminNavigationEditor() {
  const { data: items = [], isLoading } = useNavItems();
  const upsert = useUpsertNavItem();
  const update = useUpdateNavItem();
  const deleteMut = useDeleteNavItem();
  const reorder = useReorderNavItems();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<EditDraft | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newDraft, setNewDraft] = useState<EditDraft>({ ...EMPTY_DRAFT });

  // Group items by nav_group
  const grouped = items.reduce<Record<string, NavItem[]>>((acc, item) => {
    (acc[item.nav_group] ??= []).push(item);
    return acc;
  }, {});

  const handleEdit = (item: NavItem) => {
    setEditingId(item.id);
    setDraft({
      id: item.id,
      label: item.label,
      href: item.href,
      icon: item.icon ?? '',
      is_visible: item.is_visible,
      open_in_new_tab: item.open_in_new_tab,
      requires_auth: item.requires_auth,
      nav_group: item.nav_group,
    });
  };

  const handleSave = async (d: EditDraft) => {
    if (!d.label.trim() || !d.href.trim()) {
      toast.error('Label and URL are required');
      return;
    }
    try {
      await upsert.mutateAsync({
        id: d.id,
        label: d.label.trim(),
        href: d.href.trim(),
        icon: d.icon.trim() || null,
        is_visible: d.is_visible,
        open_in_new_tab: d.open_in_new_tab,
        requires_auth: d.requires_auth,
        nav_group: d.nav_group,
        sort_order: d.id ? (items.find(i => i.id === d.id)?.sort_order ?? 0) : items.filter(i => i.nav_group === d.nav_group).length,
        parent_id: null,
        metadata: {},
      });
      toast.success(d.id ? 'Nav item updated' : 'Nav item created');
      setEditingId(null);
      setDraft(null);
      setShowNew(false);
      setNewDraft({ ...EMPTY_DRAFT });
    } catch {
      toast.error('Failed to save');
    }
  };

  const handleDelete = async (item: NavItem) => {
    if (!confirm(`Delete "${item.label}"?`)) return;
    try {
      await deleteMut.mutateAsync(item.id);
      toast.success('Deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleToggleVisibility = async (item: NavItem) => {
    try {
      await update.mutateAsync({ id: item.id, is_visible: !item.is_visible });
      toast.success(item.is_visible ? 'Hidden' : 'Visible');
    } catch {
      toast.error('Failed to update');
    }
  };

  const handleMove = async (groupItems: NavItem[], index: number, direction: 'up' | 'down') => {
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= groupItems.length) return;
    const updates = groupItems.map((item, i) => {
      if (i === index) return { id: item.id, sort_order: groupItems[swapIndex].sort_order };
      if (i === swapIndex) return { id: item.id, sort_order: groupItems[index].sort_order };
      return { id: item.id, sort_order: item.sort_order };
    });
    try {
      await reorder.mutateAsync(updates);
    } catch {
      toast.error('Failed to reorder');
    }
  };

  const seedDefaults = async () => {
    let count = 0;
    for (const def of NAV_DEFAULTS) {
      const exists = items.some(i => i.href === def.href && i.nav_group === def.nav_group);
      if (!exists) {
        await upsert.mutateAsync({ ...def, metadata: {} } as any);
        count++;
      }
    }
    if (count > 0) toast.success(`Seeded ${count} navigation items`);
    else toast.info('All default nav items already exist');
  };

  const NavItemRow = ({ item, groupItems, index }: { item: NavItem; groupItems: NavItem[]; index: number }) => {
    const isEditing = editingId === item.id;

    if (isEditing && draft) {
      return (
        <div className="border border-primary/30 rounded-lg p-4 space-y-3 bg-primary/5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Label</Label>
              <Input value={draft.label} onChange={e => setDraft(p => p ? { ...p, label: e.target.value } : p)} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">URL / Path</Label>
              <Input value={draft.href} onChange={e => setDraft(p => p ? { ...p, href: e.target.value } : p)} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Icon (Lucide name)</Label>
              <Input value={draft.icon} onChange={e => setDraft(p => p ? { ...p, icon: e.target.value } : p)} placeholder="e.g. Home, Mic2" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Group</Label>
              <select
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                value={draft.nav_group}
                onChange={e => setDraft(p => p ? { ...p, nav_group: e.target.value } : p)}
              >
                <option value="main">Main</option>
                <option value="footer">Footer</option>
                <option value="mobile">Mobile</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={draft.is_visible} onCheckedChange={v => setDraft(p => p ? { ...p, is_visible: v } : p)} />
              Visible
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={draft.open_in_new_tab} onCheckedChange={v => setDraft(p => p ? { ...p, open_in_new_tab: v } : p)} />
              New Tab
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={draft.requires_auth} onCheckedChange={v => setDraft(p => p ? { ...p, requires_auth: v } : p)} />
              Auth Required
            </label>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={() => { setEditingId(null); setDraft(null); }}>Cancel</Button>
            <Button size="sm" onClick={() => handleSave(draft)} disabled={upsert.isPending}>
              <Save className="w-3 h-3 mr-1" /> Save
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors ${item.is_visible ? 'border-border/40 bg-background' : 'border-border/20 bg-muted/30 opacity-60'}`}>
        <GripVertical className="w-4 h-4 text-muted-foreground/40 shrink-0" />

        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="icon" className="h-6 w-6" disabled={index === 0} onClick={() => handleMove(groupItems, index, 'up')}>
            <ChevronUp className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" disabled={index === groupItems.length - 1} onClick={() => handleMove(groupItems, index, 'down')}>
            <ChevronDown className="w-3 h-3" />
          </Button>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm truncate">{item.label}</span>
            {item.icon && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">{item.icon}</span>
            )}
          </div>
          <span className="text-xs text-muted-foreground font-mono truncate block">{item.href}</span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {item.open_in_new_tab && <ExternalLink className="w-3 h-3 text-muted-foreground" />}
          {item.requires_auth && <Lock className="w-3 h-3 text-muted-foreground" />}

          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleToggleVisibility(item)}>
            {item.is_visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>Edit</Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(item)}>
            <Trash2 className="w-3 h-3 text-destructive" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Navigation className="w-6 h-6 text-primary" />
            Navigation Editor
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Control site navigation — reorder, add, hide, or edit menu items. Changes go live immediately.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={seedDefaults} disabled={upsert.isPending}>
            <RefreshCw className="w-4 h-4 mr-1" /> Seed Defaults
          </Button>
          <Button size="sm" onClick={() => setShowNew(true)}>
            <Plus className="w-4 h-4 mr-1" /> Add Item
          </Button>
        </div>
      </div>

      {/* New item form */}
      {showNew && (
        <Card variant="glass">
          <CardHeader><CardTitle className="text-lg">New Navigation Item</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Label</Label>
                <Input value={newDraft.label} onChange={e => setNewDraft(p => ({ ...p, label: e.target.value }))} placeholder="e.g. Blog" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">URL / Path</Label>
                <Input value={newDraft.href} onChange={e => setNewDraft(p => ({ ...p, href: e.target.value }))} placeholder="e.g. /blog or https://..." />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Icon (Lucide name)</Label>
                <Input value={newDraft.icon} onChange={e => setNewDraft(p => ({ ...p, icon: e.target.value }))} placeholder="e.g. BookOpen" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Group</Label>
                <select
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  value={newDraft.nav_group}
                  onChange={e => setNewDraft(p => ({ ...p, nav_group: e.target.value }))}
                >
                  <option value="main">Main</option>
                  <option value="footer">Footer</option>
                  <option value="mobile">Mobile</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={newDraft.is_visible} onCheckedChange={v => setNewDraft(p => ({ ...p, is_visible: v }))} />
                Visible
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={newDraft.open_in_new_tab} onCheckedChange={v => setNewDraft(p => ({ ...p, open_in_new_tab: v }))} />
                New Tab
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={newDraft.requires_auth} onCheckedChange={v => setNewDraft(p => ({ ...p, requires_auth: v }))} />
                Auth Required
              </label>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setShowNew(false)}>Cancel</Button>
              <Button size="sm" onClick={() => handleSave(newDraft)} disabled={upsert.isPending}>
                <Save className="w-4 h-4 mr-1" /> Create
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && items.length === 0 && (
        <Card variant="glass" className="text-center py-12">
          <Navigation className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No navigation items yet.</p>
          <p className="text-muted-foreground text-sm">Click "Seed Defaults" to populate the default site navigation.</p>
        </Card>
      )}

      {/* Grouped nav items */}
      {Object.entries(grouped).map(([group, groupItems]) => (
        <Card key={group} variant="glass">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Navigation className="w-4 h-4 text-primary" />
              {GROUP_LABELS[group] ?? group}
            </CardTitle>
            <CardDescription>{groupItems.length} item{groupItems.length !== 1 ? 's' : ''}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {groupItems.map((item, idx) => (
              <NavItemRow key={item.id} item={item} groupItems={groupItems} index={idx} />
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
