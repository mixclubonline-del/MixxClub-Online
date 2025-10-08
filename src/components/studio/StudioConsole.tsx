import { useState } from 'react';
import { ChannelStrip } from './ChannelStrip';
import { EnhancedVUMeter } from './EnhancedVUMeter';
import { CPUMonitor } from './CPUMonitor';
import { LatencyMonitor } from './LatencyMonitor';
import { GroupManager } from './GroupManager';
import { FreezeDialog } from './FreezeDialog';
import { Button } from '@/components/ui/button';
import { useAIStudioStore } from '@/stores/aiStudioStore';
import { cn } from '@/lib/utils';

export const StudioConsole = () => {
  const {
    tracks,
    selectedTrackId,
    masterVolume,
    masterPeakLevel,
    busGroups,
    vcaGroups,
    totalLatency,
    latencyCompensation,
    setSelectedTrack,
    updateTrack,
    setMasterVolume,
    addTrackEffect,
    updateTrackSend,
    createBusGroup,
    createVCAGroup,
    deleteBusGroup,
    deleteVCAGroup,
    freezeTrack,
    unfreezeTrack,
    calculateTotalLatency,
  } = useAIStudioStore();

  const [isDraggingMaster, setIsDraggingMaster] = useState(false);
  const [groupManagerOpen, setGroupManagerOpen] = useState(false);
  const [freezeDialogOpen, setFreezeDialogOpen] = useState(false);
  const [selectedFreezeTrackId, setSelectedFreezeTrackId] = useState<string | null>(null);

  const handleMasterFaderMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDraggingMaster(true);
    updateMasterFader(e);
  };

  const handleMasterFaderMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingMaster) return;
    updateMasterFader(e);
  };

  const updateMasterFader = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;
    const newVolume = Math.max(0, Math.min(1, 1 - (y / height)));
    setMasterVolume(newVolume);
  };

  const handleFreezeTrack = (trackId: string) => {
    setSelectedFreezeTrackId(trackId);
    setFreezeDialogOpen(true);
  };

  const handleDeleteGroup = (groupId: string, type: 'bus' | 'vca') => {
    if (type === 'bus') {
      deleteBusGroup(groupId);
    } else {
      deleteVCAGroup(groupId);
    }
  };

  const selectedFreezeTrack = tracks.find(t => t.id === selectedFreezeTrackId);

  return (
    <div 
      className="rounded p-4"
      style={{
        background: 'var(--panel-gradient)',
        boxShadow: 'var(--shadow-raised)',
        borderTop: '1px solid var(--border-highlight-top)',
        borderBottom: '1px solid var(--border-highlight-bottom)',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-mono uppercase tracking-wider text-[hsl(var(--studio-text))]">
          Mixing Console
        </h3>
        <div className="flex items-center gap-3">
          <CPUMonitor />
          <LatencyMonitor 
            totalLatency={totalLatency} 
            compensated={latencyCompensation}
          />
          <Button
            size="sm"
            variant="outline"
            onClick={() => setGroupManagerOpen(true)}
            className="text-xs"
          >
            Groups
          </Button>
          <span className="text-[9px] font-mono text-[hsl(var(--studio-text-dim))]">
            {tracks.length} Channels
          </span>
          <div 
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{
              background: 'hsl(var(--led-green))',
              boxShadow: 'var(--shadow-glow-led-green)',
            }}
          />
        </div>
      </div>

      <div 
        className="flex gap-2 overflow-x-auto pb-2"
        onMouseUp={() => setIsDraggingMaster(false)}
        onMouseLeave={() => setIsDraggingMaster(false)}
      >
        {/* Channel strips */}
        <div className="flex gap-1.5">
          {tracks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-8 text-center">
              <div className="w-10 h-10 rounded bg-[hsl(var(--studio-panel-raised))] border border-[hsl(var(--studio-border))] flex items-center justify-center mb-2">
                <span className="text-lg">🎛️</span>
              </div>
              <p className="text-xs text-[hsl(var(--studio-text-dim))] mb-2">
                No tracks loaded
              </p>
              <Button
                variant="default"
                size="sm"
                className="text-xs"
              >
                Add Track
              </Button>
            </div>
          ) : (
            tracks.map((track) => (
              <ChannelStrip
                key={track.id}
                track={track}
                isSelected={selectedTrackId === track.id}
                onSelect={() => setSelectedTrack(track.id)}
                onVolumeChange={(volume) => 
                  updateTrack(track.id, { volume })
                }
                onPanChange={(pan) => 
                  updateTrack(track.id, { pan })
                }
                onAddTrackEffect={addTrackEffect}
                onUpdateTrackSend={updateTrackSend}
                onMuteToggle={() => 
                  updateTrack(track.id, { mute: !track.mute })
                }
                onSoloToggle={() => 
                  updateTrack(track.id, { solo: !track.solo })
                }
              />
            ))
          )}
        </div>

        {/* Master section - also more compact */}
        {tracks.length > 0 && (
          <div
            className={cn(
              'flex flex-col items-center gap-1.5 p-1.5 rounded ml-2',
              'w-16 h-[360px] flex-shrink-0'
            )}
            style={{
              background: 'var(--panel-gradient-raised)',
              boxShadow: 'var(--shadow-raised-lg), 0 0 20px hsl(var(--studio-accent) / 0.3)',
              borderTop: '2px solid hsl(var(--studio-accent))',
              borderLeft: '1px solid var(--border-highlight-top)',
              borderRight: '1px solid var(--border-highlight-bottom)',
            }}
          >
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--studio-accent))]">
                Master
              </span>
              <span className="text-[7px] text-[hsl(var(--studio-text-dim))] uppercase">
                Stereo Out
              </span>
            </div>

            {/* Master Enhanced VU meters with LUFS */}
            <div className="flex gap-1">
              <EnhancedVUMeter 
                level={masterPeakLevel * 0.95} 
                size="lg"
                label="L"
                vertical
                showRMS={true}
                showLUFS={true}
                showPeakDb={true}
              />
              <EnhancedVUMeter 
                level={masterPeakLevel} 
                size="lg"
                label="R"
                vertical
                showRMS={true}
                showLUFS={true}
                showPeakDb={true}
              />
            </div>

            {/* Master fader */}
            <div className="flex-1 flex flex-col items-center w-full">
              <div 
                className="relative h-full w-4 rounded cursor-ns-resize"
                style={{
                  background: 'var(--fader-gradient)',
                  boxShadow: 'var(--shadow-recessed-deep)',
                  border: '2px solid hsl(var(--studio-accent))',
                }}
                onMouseDown={handleMasterFaderMouseDown}
                onMouseMove={handleMasterFaderMouseMove}
              >
                {/* Fader rail highlight */}
                <div className="absolute inset-y-0 left-0 w-px bg-[hsl(0_0%_18%/0.5)]" />
                
                {/* Master fader cap - larger and more prominent */}
                <div
                  className={cn(
                    'absolute left-1/2 -translate-x-1/2 w-10 h-6 rounded transition-all',
                    isDraggingMaster && 'scale-110'
                  )}
                  style={{
                    top: `${(1 - masterVolume) * 100}%`,
                    transform: 'translate(-50%, -50%)',
                    background: 'linear-gradient(180deg, hsl(180 100% 55%), hsl(180 100% 45%))',
                    boxShadow: 'var(--shadow-raised-lg), var(--shadow-glow-cyan)',
                    borderTop: '1px solid hsl(180 100% 70%)',
                    borderBottom: '1px solid hsl(180 100% 35%)',
                  }}
                >
                  {/* Cap detail lines */}
                  <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex flex-col gap-0.5">
                    <div className="h-px bg-white/20" />
                    <div className="h-px bg-black/20" />
                  </div>
                </div>
              </div>
              <span className="text-[8px] font-mono text-[hsl(var(--studio-text-dim))] mt-1">
                {Math.round(masterVolume * 100)}
              </span>
            </div>

            {/* Output LED */}
            <div className="flex flex-col items-center gap-1">
              <div 
                className={cn(
                  'w-3 h-3 rounded-full animate-pulse',
                  masterPeakLevel > 0.95 ? 'bg-[hsl(var(--led-red))]' : 'bg-[hsl(var(--led-green))]'
                )}
                style={{
                  boxShadow: masterPeakLevel > 0.95 
                    ? 'var(--shadow-glow-led-red), inset 0 -1px 2px hsl(0 100% 30%)'
                    : 'var(--shadow-glow-led-green), inset 0 -1px 2px hsl(142 100% 30%)',
                  border: '0.5px solid rgba(255,255,255,0.3)',
                }}
              />
              <span className="text-[7px] text-[hsl(var(--studio-text-dim))]">OUT</span>
            </div>
          </div>
        )}
      </div>

      {/* Group Manager Dialog */}
      <GroupManager
        tracks={tracks}
        busGroups={busGroups}
        vcaGroups={vcaGroups}
        onCreateBusGroup={createBusGroup}
        onCreateVCAGroup={createVCAGroup}
        onDeleteGroup={handleDeleteGroup}
        isOpen={groupManagerOpen}
        onClose={() => setGroupManagerOpen(false)}
      />

      {/* Freeze Track Dialog */}
      {selectedFreezeTrack && (
        <FreezeDialog
          trackName={selectedFreezeTrack.name}
          effectsCount={selectedFreezeTrack.effects.length}
          isOpen={freezeDialogOpen}
          onClose={() => {
            setFreezeDialogOpen(false);
            setSelectedFreezeTrackId(null);
          }}
          onFreeze={async () => {
            if (selectedFreezeTrackId) {
              await freezeTrack(selectedFreezeTrackId);
            }
          }}
          onUnfreeze={() => {
            if (selectedFreezeTrackId) {
              unfreezeTrack(selectedFreezeTrackId);
            }
          }}
          isFrozen={selectedFreezeTrack.frozen || false}
        />
      )}
    </div>
  );
};
