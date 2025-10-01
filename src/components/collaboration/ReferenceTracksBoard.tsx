import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Music, Plus, ExternalLink, X, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface ReferenceTrack {
  id: string;
  title: string;
  artist: string;
  url: string;
  notes: string;
  category: 'vibe' | 'mix' | 'production' | 'vocal';
}

interface ReferenceTracksBoardProps {
  projectId: string;
}

export const ReferenceTracksBoard = ({ projectId }: ReferenceTracksBoardProps) => {
  const [references, setReferences] = useState<ReferenceTrack[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newReference, setNewReference] = useState({
    title: '',
    artist: '',
    url: '',
    notes: '',
    category: 'vibe' as ReferenceTrack['category']
  });

  const handleAddReference = () => {
    if (!newReference.title || !newReference.artist) {
      toast.error('Please fill in track title and artist');
      return;
    }

    const reference: ReferenceTrack = {
      id: Date.now().toString(),
      ...newReference
    };

    setReferences([...references, reference]);
    setNewReference({
      title: '',
      artist: '',
      url: '',
      notes: '',
      category: 'vibe'
    });
    setShowAddForm(false);
    toast.success('Reference track added');
  };

  const handleRemoveReference = (id: string) => {
    setReferences(references.filter(ref => ref.id !== id));
    toast.success('Reference removed');
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      vibe: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      mix: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      production: 'bg-green-500/10 text-green-500 border-green-500/20',
      vocal: 'bg-pink-500/10 text-pink-500 border-pink-500/20'
    };
    return colors[category as keyof typeof colors] || colors.vibe;
  };

  const getCategoryEmoji = (category: string) => {
    const emojis = {
      vibe: '🎵',
      mix: '🎚️',
      production: '🎹',
      vocal: '🎤'
    };
    return emojis[category as keyof typeof emojis] || '🎵';
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Reference Tracks & Mood Board
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Share tracks that inspire the sound and vibe you're going for
            </p>
          </div>
          <Button onClick={() => setShowAddForm(!showAddForm)} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Reference
          </Button>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <Card className="p-4 bg-accent/5 border-dashed">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Track title"
                  value={newReference.title}
                  onChange={(e) => setNewReference({ ...newReference, title: e.target.value })}
                />
                <Input
                  placeholder="Artist name"
                  value={newReference.artist}
                  onChange={(e) => setNewReference({ ...newReference, artist: e.target.value })}
                />
              </div>
              
              <Input
                placeholder="Link (Spotify, YouTube, SoundCloud, etc.)"
                value={newReference.url}
                onChange={(e) => setNewReference({ ...newReference, url: e.target.value })}
              />

              <div className="flex gap-2">
                {(['vibe', 'mix', 'production', 'vocal'] as const).map((cat) => (
                  <Button
                    key={cat}
                    variant={newReference.category === cat ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setNewReference({ ...newReference, category: cat })}
                    className="capitalize"
                  >
                    {getCategoryEmoji(cat)} {cat}
                  </Button>
                ))}
              </div>

              <Textarea
                placeholder="Why this reference? (vibe, mix style, production elements, etc.)"
                value={newReference.notes}
                onChange={(e) => setNewReference({ ...newReference, notes: e.target.value })}
                className="min-h-[80px]"
              />

              <div className="flex gap-2">
                <Button onClick={handleAddReference} className="flex-1">
                  Add Reference
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* References Grid */}
        {references.length === 0 ? (
          <div className="text-center py-12">
            <Music className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h4 className="font-semibold mb-2">No reference tracks yet</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Add tracks that inspire the sound, mix, or vibe you want to achieve
            </p>
            <Button onClick={() => setShowAddForm(true)} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Reference
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {references.map((ref) => (
              <Card key={ref.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate">{ref.title}</h4>
                      <p className="text-sm text-muted-foreground truncate">{ref.artist}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveReference(ref.id)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Category Badge */}
                  <Badge className={`${getCategoryColor(ref.category)} capitalize`}>
                    {getCategoryEmoji(ref.category)} {ref.category} reference
                  </Badge>

                  {/* Notes */}
                  {ref.notes && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{ref.notes}</p>
                  )}

                  {/* Link */}
                  {ref.url && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      asChild
                    >
                      <a href={ref.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Listen
                      </a>
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};