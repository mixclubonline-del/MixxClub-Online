import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Search, Folder, Music, Radio } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Track, useAIStudioStore } from '@/stores/aiStudioStore';

export const BrowserSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'tracks' | 'sounds' | 'presets'>('tracks');
  const { tracks, addTrack } = useAIStudioStore();

  if (isCollapsed) {
    return (
      <div className="w-10 bg-[hsl(var(--studio-panel))] border-r border-[hsl(var(--studio-border))] flex flex-col items-center py-4 gap-3">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-1 hover:bg-[hsl(var(--studio-panel-raised))] rounded transition"
        >
          <ChevronRight className="w-4 h-4 text-[hsl(var(--studio-text-dim))]" />
        </button>
        <div className="flex flex-col gap-2">
          <Folder className="w-4 h-4 text-[hsl(var(--studio-text-dim))]" />
          <Music className="w-4 h-4 text-[hsl(var(--studio-text-dim))]" />
          <Radio className="w-4 h-4 text-[hsl(var(--studio-text-dim))]" />
        </div>
      </div>
    );
  }

  return (
    <div 
      className="w-64 border-r flex flex-col glass-studio"
      style={{
        borderColor: 'hsl(var(--studio-border) / 0.4)',
      }}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between p-3 border-b"
        style={{
          borderColor: 'hsl(var(--studio-border) / 0.3)',
          background: 'linear-gradient(135deg, hsl(var(--primary) / 0.08), transparent)',
        }}
      >
        <span className="text-xs font-mono uppercase tracking-wider text-[hsl(var(--studio-text))]">
          Browser
        </span>
        <button
          onClick={() => setIsCollapsed(true)}
          className="p-1 hover:bg-[hsl(var(--studio-panel-raised))] rounded transition"
        >
          <ChevronLeft className="w-4 h-4 text-[hsl(var(--studio-text-dim))]" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b" style={{ borderColor: 'hsl(var(--studio-border) / 0.3)' }}>
        {(['tracks', 'sounds', 'presets'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'flex-1 py-2 text-[10px] font-mono uppercase transition-all',
              activeTab === tab
                ? 'text-[hsl(var(--studio-accent))]'
                : 'text-[hsl(var(--studio-text-dim))] hover:text-[hsl(var(--studio-text))]'
            )}
            style={activeTab === tab ? {
              background: 'linear-gradient(135deg, hsl(var(--studio-accent) / 0.15), hsl(var(--studio-accent) / 0.05))',
              borderBottom: '2px solid hsl(var(--studio-accent))',
              boxShadow: '0 0 20px hsl(var(--studio-accent) / 0.3)',
            } : {}}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'tracks' && (
          <div className="p-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[hsl(var(--studio-text-dim))]" />
                <input
                  type="text"
                  placeholder="Search tracks..."
                  className="w-full pl-7 pr-2 py-1.5 text-xs bg-[hsl(var(--studio-black))] border border-[hsl(var(--studio-border))] rounded text-[hsl(var(--studio-text))] placeholder:text-[hsl(var(--studio-text-dim))] focus:outline-none focus:border-[hsl(var(--studio-accent))]"
                />
              </div>
              <button
                onClick={() => {
                  const newTrack: Track = {
                    id: `track-${Date.now()}`,
                    name: `Track ${tracks.length + 1}`,
                    type: 'other',
                    volume: 0.75,
                    pan: 0,
                    mute: false,
                    solo: false,
                    peakLevel: 0,
                    rmsLevel: 0,
                  };
                  addTrack(newTrack);
                }}
                className="p-1.5 bg-[hsl(var(--studio-accent))] hover:bg-[hsl(var(--studio-accent))] rounded transition"
              >
                <Plus className="w-3 h-3 text-black" />
              </button>
            </div>

            <div className="space-y-1">
              {tracks.map((track) => (
                <div
                  key={track.id}
                  className="p-2 rounded bg-[hsl(var(--studio-black))] border border-[hsl(var(--studio-border))] hover:border-[hsl(var(--studio-panel-raised))] transition cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ 
                        backgroundColor: track.type === 'vocal' ? 'hsl(var(--wave-vocal))' :
                                       track.type === 'drums' ? 'hsl(var(--wave-drums))' :
                                       track.type === 'bass' ? 'hsl(var(--wave-bass))' :
                                       track.type === 'keys' ? 'hsl(var(--wave-keys))' :
                                       track.type === 'guitar' ? 'hsl(var(--wave-guitar))' :
                                       'hsl(var(--wave-other))'
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[hsl(var(--studio-text))] truncate">
                        {track.name}
                      </p>
                      <p className="text-[9px] text-[hsl(var(--studio-text-dim))] uppercase">
                        {track.type}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'sounds' && (
          <div className="p-3">
            <p className="text-xs text-[hsl(var(--studio-text-dim))] text-center py-8">
              Sound library coming soon
            </p>
          </div>
        )}

        {activeTab === 'presets' && (
          <div className="p-3">
            <div className="space-y-2">
              <div className="p-3 rounded bg-[hsl(var(--studio-black))] border border-[hsl(var(--studio-border))] hover:border-[hsl(var(--studio-accent))] transition cursor-pointer">
                <p className="text-xs text-[hsl(var(--studio-text))] mb-1">✨ AI Vocal Clarity</p>
                <p className="text-[9px] text-[hsl(var(--studio-text-dim))]">
                  Prime-enhanced vocal processing
                </p>
              </div>
              <div className="p-3 rounded bg-[hsl(var(--studio-black))] border border-[hsl(var(--studio-border))] hover:border-[hsl(var(--studio-accent))] transition cursor-pointer">
                <p className="text-xs text-[hsl(var(--studio-text))] mb-1">🥁 Punchy Drums</p>
                <p className="text-[9px] text-[hsl(var(--studio-text-dim))]">
                  Transient-focused drum mix
                </p>
              </div>
              <div className="p-3 rounded bg-[hsl(var(--studio-black))] border border-[hsl(var(--studio-border))] hover:border-[hsl(var(--studio-accent))] transition cursor-pointer">
                <p className="text-xs text-[hsl(var(--studio-text))] mb-1">🎸 Wide Stereo</p>
                <p className="text-[9px] text-[hsl(var(--studio-text-dim))]">
                  Expanded stereo field
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
