import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Folder,
  FileAudio,
  Waves,
  Drum,
  Music2,
  Star,
  Clock,
} from 'lucide-react';

const SAMPLE_CATEGORIES = [
  { id: 'drums', label: 'Drums', icon: Drum },
  { id: 'bass', label: 'Bass', icon: Waves },
  { id: 'melody', label: 'Melody', icon: Music2 },
  { id: 'vocals', label: 'Vocals', icon: FileAudio },
];

const SAMPLE_SOUNDS = [
  { id: '1', name: 'Kick - Heavy 808', category: 'drums', bpm: 140 },
  { id: '2', name: 'Snare - Crisp Analog', category: 'drums', bpm: null },
  { id: '3', name: 'Hi-Hat - Closed Metal', category: 'drums', bpm: null },
  { id: '4', name: 'Bass - Deep Sub', category: 'bass', bpm: 128 },
  { id: '5', name: 'Bass - Reese Wobble', category: 'bass', bpm: 140 },
  { id: '6', name: 'Synth - Future Lead', category: 'melody', bpm: 128 },
  { id: '7', name: 'Pad - Ambient Wash', category: 'melody', bpm: null },
  { id: '8', name: 'Vocal - Chop FX', category: 'vocals', bpm: 120 },
];

export const DAWBrowserPanel = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredSounds = SAMPLE_SOUNDS.filter(sound => {
    const matchesSearch = sound.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || sound.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-80 bg-gradient-to-b from-[hsl(235,60%,8%)] to-[hsl(230,55%,6%)] border-r border-[hsl(var(--primary)/0.2)] flex flex-col shadow-xl relative">
      {/* Side glow */}
      <div className="absolute top-0 right-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[hsl(var(--primary)/0.4)] to-transparent" />

      {/* Header */}
      <div className="h-10 border-b border-[hsl(var(--primary)/0.2)] flex items-center px-3 bg-gradient-to-r from-[hsl(230,40%,10%)] to-[hsl(230,35%,8%)]">
        <Folder className="w-4 h-4 mr-2 text-primary" />
        <span className="text-sm font-display font-semibold tracking-wide text-primary">BROWSER</span>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-[hsl(var(--primary)/0.1)]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sounds..."
            className="pl-10 bg-black/30 border-[hsl(var(--primary)/0.2)] focus:border-[hsl(var(--primary)/0.4)] h-9"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="sounds" className="flex-1 flex flex-col">
        <TabsList className="w-full grid grid-cols-3 bg-[hsl(230,35%,10%)] border-b border-[hsl(var(--primary)/0.1)] rounded-none h-10">
          <TabsTrigger value="sounds" className="text-xs font-display">SOUNDS</TabsTrigger>
          <TabsTrigger value="favorites" className="text-xs font-display">
            <Star className="w-3 h-3 mr-1" />
            FAVS
          </TabsTrigger>
          <TabsTrigger value="recent" className="text-xs font-display">
            <Clock className="w-3 h-3 mr-1" />
            RECENT
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sounds" className="flex-1 m-0">
          {/* Category Filters */}
          <div className="flex gap-1 p-2 border-b border-[hsl(var(--primary)/0.1)] bg-[hsl(230,35%,10%/0.5)]">
            <Button
              variant={selectedCategory === null ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className="h-7 text-xs"
            >
              All
            </Button>
            {SAMPLE_CATEGORIES.map(cat => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedCategory(cat.id)}
                className="h-7 text-xs"
              >
                <cat.icon className="w-3 h-3 mr-1" />
                {cat.label}
              </Button>
            ))}
          </div>

          {/* Sound List */}
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {filteredSounds.map(sound => (
                <div
                  key={sound.id}
                  className="group p-2 rounded-md bg-[hsl(230,35%,12%/0.5)] border border-[hsl(230,30%,18%)] hover:bg-[hsl(230,35%,14%/0.7)] hover:border-[hsl(var(--primary)/0.2)] cursor-pointer transition-all"
                  draggable
                >
                  <div className="flex items-center gap-2">
                    <FileAudio className="w-4 h-4 text-primary/60 group-hover:text-primary transition-colors" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate">{sound.name}</div>
                      {sound.bpm && (
                        <div className="text-xs text-muted-foreground">{sound.bpm} BPM</div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Star className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="favorites" className="flex-1 m-0">
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            <div className="text-center">
              <Star className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p>No favorites yet</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="recent" className="flex-1 m-0">
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            <div className="text-center">
              <Clock className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p>No recent items</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
