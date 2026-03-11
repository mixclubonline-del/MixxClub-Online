import { useState } from 'react';
import { GlassPanel, HubHeader, HubSkeleton } from '@/components/crm/design';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Package, Plus, Trash2, Download, Eye, Music } from 'lucide-react';
import { useProducerBeats, type ProducerBeat } from '@/hooks/useProducerBeats';
import { useSamplePacks, type SamplePackItem } from '@/hooks/useSamplePacks';

type Step = 'select' | 'details' | 'preview';

export function SamplePackBuilder() {
  const { beats, isLoading: beatsLoading } = useProducerBeats();
  const { packs, isLoading: packsLoading, createPack, publishPack, deletePack, downloadPackAsZip } = useSamplePacks();

  const [step, setStep] = useState<Step>('select');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priceCents, setPriceCents] = useState(999);
  const [isCreating, setIsCreating] = useState(false);

  const toggleBeat = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectedBeats = beats.filter(b => selectedIds.has(b.id));

  const handleCreate = async () => {
    if (!title.trim() || selectedBeats.length === 0) return;
    setIsCreating(true);
    try {
      const items: SamplePackItem[] = selectedBeats.map(b => ({
        beat_id: b.id,
        title: b.title,
        audio_url: b.audio_url || undefined,
        type: 'beat' as const,
      }));
      await createPack.mutateAsync({ title, description, price_cents: priceCents, items });
      setStep('select');
      setSelectedIds(new Set());
      setTitle('');
      setDescription('');
    } finally {
      setIsCreating(false);
    }
  };

  if (beatsLoading || packsLoading) return <HubSkeleton variant="cards" count={3} />;

  return (
    <div className="space-y-6">
      <HubHeader
        icon={<Package className="h-5 w-5 text-orange-400" />}
        title="Sample Packs"
        subtitle={`${packs.length} packs created`}
        accent="rgba(249, 115, 22, 0.5)"
        action={
          <Button onClick={() => setStep('select')} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Pack
          </Button>
        }
      />

      {/* Existing packs */}
      {packs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {packs.map(pack => (
            <GlassPanel key={pack.id} accent="rgba(249, 115, 22, 0.3)" padding="p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{pack.title}</h3>
                    <p className="text-xs text-muted-foreground">{pack.items.length} items</p>
                  </div>
                  <Badge variant={pack.status === 'published' ? 'default' : 'secondary'}>
                    {pack.status}
                  </Badge>
                </div>
                <p className="text-lg font-bold">${(pack.price_cents / 100).toFixed(2)}</p>
                <div className="flex gap-2">
                  {pack.status === 'draft' && (
                    <Button size="sm" variant="secondary" onClick={() => publishPack.mutate(pack.id)}>
                      <Eye className="h-3 w-3 mr-1" />
                      Publish
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => downloadPackAsZip(pack)}>
                    <Download className="h-3 w-3 mr-1" />
                    ZIP
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deletePack.mutate(pack.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </GlassPanel>
          ))}
        </div>
      )}

      {/* Builder wizard */}
      <GlassPanel padding="p-6">
        {step === 'select' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Select Beats for Pack</h3>
            {beats.length === 0 ? (
              <p className="text-muted-foreground text-sm">Upload beats to your catalog first.</p>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[400px] overflow-y-auto">
                  {beats.map(beat => (
                    <label
                      key={beat.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border/30 hover:bg-white/5 cursor-pointer transition-colors"
                    >
                      <Checkbox
                        checked={selectedIds.has(beat.id)}
                        onCheckedChange={() => toggleBeat(beat.id)}
                      />
                      <Music className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{beat.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {beat.bpm && `${beat.bpm} BPM`} {beat.genre && `· ${beat.genre}`}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm text-muted-foreground">{selectedIds.size} selected</span>
                  <Button disabled={selectedIds.size === 0} onClick={() => setStep('details')}>
                    Next: Pack Details
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {step === 'details' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Pack Details</h3>
            <div className="space-y-3">
              <Input placeholder="Pack Title" value={title} onChange={e => setTitle(e.target.value)} />
              <Input placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} />
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Price ($)</label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={(priceCents / 100).toFixed(2)}
                  onChange={e => setPriceCents(Math.round(parseFloat(e.target.value || '0') * 100))}
                />
              </div>
            </div>
            <div className="flex justify-between pt-2">
              <Button variant="ghost" onClick={() => setStep('select')}>Back</Button>
              <Button onClick={() => setStep('preview')} disabled={!title.trim()}>Preview</Button>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Review & Create</h3>
            <div className="space-y-2">
              <p className="font-medium">{title}</p>
              {description && <p className="text-sm text-muted-foreground">{description}</p>}
              <p className="text-lg font-bold">${(priceCents / 100).toFixed(2)}</p>
              <div className="space-y-1">
                {selectedBeats.map(b => (
                  <div key={b.id} className="flex items-center gap-2 text-sm">
                    <Music className="h-3 w-3 text-muted-foreground" />
                    <span>{b.title}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-between pt-2">
              <Button variant="ghost" onClick={() => setStep('details')}>Back</Button>
              <Button onClick={handleCreate} disabled={isCreating}>
                {isCreating ? 'Creating…' : 'Create Pack'}
              </Button>
            </div>
          </div>
        )}
      </GlassPanel>
    </div>
  );
}
