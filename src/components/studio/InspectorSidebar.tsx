import { useState } from 'react';
import { ChevronLeft, ChevronRight, Sliders, Sparkles, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAIStudioStore } from '@/stores/aiStudioStore';

export const InspectorSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'inspector' | 'effects' | 'ai'>('inspector');
  const { tracks, selectedTrackId, effects } = useAIStudioStore();

  const selectedTrack = tracks.find(t => t.id === selectedTrackId);

  if (isCollapsed) {
    return (
      <div className="w-10 bg-[hsl(var(--studio-panel))] border-l border-[hsl(var(--studio-border))] flex flex-col items-center py-4 gap-3">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-1 hover:bg-[hsl(var(--studio-panel-raised))] rounded transition"
        >
          <ChevronLeft className="w-4 h-4 text-[hsl(var(--studio-text-dim))]" />
        </button>
        <div className="flex flex-col gap-2">
          <Info className="w-4 h-4 text-[hsl(var(--studio-text-dim))]" />
          <Sliders className="w-4 h-4 text-[hsl(var(--studio-text-dim))]" />
          <Sparkles className="w-4 h-4 text-[hsl(var(--studio-text-dim))]" />
        </div>
      </div>
    );
  }

  return (
    <div 
      className="w-80 border-l flex flex-col glass-studio"
      style={{
        borderColor: 'hsl(var(--studio-border) / 0.4)',
      }}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between p-3 border-b"
        style={{
          borderColor: 'hsl(var(--studio-border) / 0.3)',
          background: 'linear-gradient(135deg, transparent, hsl(var(--accent) / 0.08))',
        }}
      >
        <span className="text-xs font-mono uppercase tracking-wider text-[hsl(var(--studio-text))]">
          Inspector
        </span>
        <button
          onClick={() => setIsCollapsed(true)}
          className="p-1 hover:bg-[hsl(var(--studio-panel-raised))] rounded transition"
        >
          <ChevronRight className="w-4 h-4 text-[hsl(var(--studio-text-dim))]" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b" style={{ borderColor: 'hsl(var(--studio-border) / 0.3)' }}>
        {([
          { id: 'inspector' as const, icon: Info, label: 'Track' },
          { id: 'effects' as const, icon: Sliders, label: 'FX' },
          { id: 'ai' as const, icon: Sparkles, label: 'AI' }
        ]).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex-1 py-2 text-[10px] font-mono uppercase transition-all flex items-center justify-center gap-1',
              activeTab === tab.id
                ? 'text-[hsl(var(--studio-accent))]'
                : 'text-[hsl(var(--studio-text-dim))] hover:text-[hsl(var(--studio-text))]'
            )}
            style={activeTab === tab.id ? {
              background: 'linear-gradient(135deg, hsl(var(--studio-accent) / 0.15), hsl(var(--studio-accent) / 0.05))',
              borderBottom: '2px solid hsl(var(--studio-accent))',
              boxShadow: '0 0 20px hsl(var(--studio-accent) / 0.3)',
            } : {}}
          >
            <tab.icon className="w-3 h-3" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === 'inspector' && (
          <div className="space-y-4">
            {selectedTrack ? (
              <>
                <div>
                  <h4 className="text-xs font-mono uppercase text-[hsl(var(--studio-text))] mb-2">
                    Track Details
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-[hsl(var(--studio-text-dim))]">Name</span>
                      <span className="text-[hsl(var(--studio-text))] font-medium">{selectedTrack.name}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[hsl(var(--studio-text-dim))]">Type</span>
                      <span className="text-[hsl(var(--studio-text))] uppercase">{selectedTrack.type}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[hsl(var(--studio-text-dim))]">Volume</span>
                      <span className="text-[hsl(var(--studio-text))]">{Math.round(selectedTrack.volume * 100)}%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[hsl(var(--studio-text-dim))]">Pan</span>
                      <span className="text-[hsl(var(--studio-text))]">
                        {selectedTrack.pan === 0 ? 'Center' : selectedTrack.pan > 0 ? `${Math.round(selectedTrack.pan * 100)}% R` : `${Math.round(Math.abs(selectedTrack.pan) * 100)}% L`}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-mono uppercase text-[hsl(var(--studio-text))] mb-2">
                    Routing
                  </h4>
                  <div className="p-3 rounded bg-[hsl(var(--studio-black))] border border-[hsl(var(--studio-border))]">
                    <div className="text-[10px] text-[hsl(var(--studio-text-dim))]">
                      Input: Audio 1<br />
                      Output: Master
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-mono uppercase text-[hsl(var(--studio-text))] mb-2">
                    Track Color
                  </h4>
                  <div className="flex gap-2">
                    {['vocal', 'drums', 'bass', 'keys', 'guitar', 'other'].map((type) => (
                      <button
                        key={type}
                        className="w-6 h-6 rounded border border-[hsl(var(--studio-border))] hover:scale-110 transition"
                        style={{
                          backgroundColor: type === 'vocal' ? 'hsl(var(--wave-vocal))' :
                                         type === 'drums' ? 'hsl(var(--wave-drums))' :
                                         type === 'bass' ? 'hsl(var(--wave-bass))' :
                                         type === 'keys' ? 'hsl(var(--wave-keys))' :
                                         type === 'guitar' ? 'hsl(var(--wave-guitar))' :
                                         'hsl(var(--wave-other))'
                        }}
                      />
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Info className="w-8 h-8 text-[hsl(var(--studio-text-dim))] mb-2" />
                <p className="text-xs text-[hsl(var(--studio-text-dim))]">
                  No track selected
                </p>
                <p className="text-[10px] text-[hsl(var(--studio-text-dim))] mt-1">
                  Select a track to view details
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'effects' && (
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase text-[hsl(var(--studio-text))] mb-2">
              Effect Chain
            </h4>
            {effects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Sliders className="w-8 h-8 text-[hsl(var(--studio-text-dim))] mb-2" />
                <p className="text-xs text-[hsl(var(--studio-text-dim))]">
                  No effects
                </p>
                <p className="text-[10px] text-[hsl(var(--studio-text-dim))] mt-1">
                  Add effects from the rack
                </p>
              </div>
            ) : (
              effects.map((effect) => (
                <div
                  key={effect.id}
                  className="p-3 rounded bg-[hsl(var(--studio-black))] border border-[hsl(var(--studio-border))]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-[hsl(var(--studio-text))] font-medium">
                      {effect.name}
                    </span>
                    <div className={cn(
                      'w-2 h-2 rounded-full',
                      effect.enabled ? 'bg-[hsl(var(--led-green))]' : 'bg-[hsl(var(--led-off))]'
                    )} />
                  </div>
                  <p className="text-[9px] text-[hsl(var(--studio-text-dim))] uppercase">
                    {effect.type}
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase text-[hsl(var(--studio-text))] mb-2 flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-[hsl(var(--studio-accent))]" />
              Prime Analysis
            </h4>
            <div className="space-y-2 text-xs text-[hsl(var(--studio-text))] leading-relaxed">
              <div className="p-3 rounded bg-[hsl(var(--studio-black))] border border-[hsl(var(--studio-border))]">
                <p className="text-[hsl(var(--studio-accent))] mb-1">• Vocal Clarity</p>
                <p className="text-[10px] text-[hsl(var(--studio-text-dim))]">
                  Boost +2.5 dB @ 3.2 kHz (Q 1.1)
                </p>
              </div>
              <div className="p-3 rounded bg-[hsl(var(--studio-black))] border border-[hsl(var(--studio-border))]">
                <p className="text-[hsl(var(--studio-accent))] mb-1">• Transient Control</p>
                <p className="text-[10px] text-[hsl(var(--studio-text-dim))]">
                  Fast attack on drum bus (3–5 ms)
                </p>
              </div>
              <div className="p-3 rounded bg-[hsl(var(--studio-black))] border border-[hsl(var(--studio-border))]">
                <p className="text-[hsl(var(--studio-accent))] mb-1">• Stereo Width</p>
                <p className="text-[10px] text-[hsl(var(--studio-text-dim))]">
                  +8% above 8 kHz, mono below 120 Hz
                </p>
              </div>
            </div>
            
            <button className="w-full py-2 rounded bg-gradient-to-r from-[hsl(var(--studio-accent))] to-[hsl(var(--led-blue))] text-black text-xs font-bold hover:shadow-[0_0_16px_hsl(var(--studio-accent-glow)/0.5)] transition">
              Apply All Suggestions
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
