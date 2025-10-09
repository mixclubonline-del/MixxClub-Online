import { useState } from 'react';
import { DAWLayout } from '@/components/daw/DAWLayout';
import { DAWTopToolbar } from '@/components/daw/DAWTopToolbar';
import { DAWTransportBar } from '@/components/daw/DAWTransportBar';
import { DAWTrackList } from '@/components/daw/DAWTrackList';
import { DAWArrangement } from '@/components/daw/DAWArrangement';
import { DAWMixerConsole } from '@/components/daw/DAWMixerConsole';
import { DAWTimelineRuler } from '@/components/daw/DAWTimelineRuler';
import { useAIStudioStore } from '@/stores/aiStudioStore';
import { AIMixingAssistant } from '@/components/daw/AIMixingAssistant';
import { StemSeparation } from '@/components/daw/StemSeparation';
import { CloudProjectManager } from '@/components/daw/CloudProjectManager';
import { AudioEngine } from '@/components/daw/AudioEngine';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

const ProDAW = () => {
  const { user } = useAuth();
  const [showMixer, setShowMixer] = useState(false);
  const [showAIMixing, setShowAIMixing] = useState(false);
  const [showStemSeparation, setShowStemSeparation] = useState(false);
  const [showCloudManager, setShowCloudManager] = useState(false);
  
  const tracks = useAIStudioStore((state) => state.tracks);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <DAWLayout>
      {/* Audio Engine - runs in background */}
      <AudioEngine />

      {/* Top Toolbar - File, Edit, Transport Controls, Tools */}
      <DAWTopToolbar
        onToggleMixer={() => setShowMixer(!showMixer)}
        onOpenAIMixing={() => setShowAIMixing(true)}
        onOpenStemSeparation={() => setShowStemSeparation(true)}
        onOpenCloudManager={() => setShowCloudManager(true)}
        showMixer={showMixer}
      />

      {/* Transport Bar - Play, Record, Time Display, BPM */}
      <DAWTransportBar />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Track List */}
        <DAWTrackList />

        {/* Center: Timeline + Arrangement */}
        <div className="flex-1 flex flex-col overflow-hidden border-l border-border">
          {/* Timeline Ruler */}
          <DAWTimelineRuler />
          
          {/* Arrangement View - tracks and regions */}
          <DAWArrangement />
        </div>
      </div>

      {/* Bottom: Mixer Console (Collapsible) */}
      {showMixer && (
        <DAWMixerConsole onClose={() => setShowMixer(false)} />
      )}

      {/* AI Tools Dialogs */}
      <AIMixingAssistant
        isOpen={showAIMixing}
        onClose={() => setShowAIMixing(false)}
      />
      
      <StemSeparation
        isOpen={showStemSeparation}
        onClose={() => setShowStemSeparation(false)}
      />
      
      <CloudProjectManager
        isOpen={showCloudManager}
        onClose={() => setShowCloudManager(false)}
      />
    </DAWLayout>
  );
};

export default ProDAW;
