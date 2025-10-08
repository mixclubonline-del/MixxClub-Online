import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAIStudioStore } from '@/stores/aiStudioStore';
import { usePluginStore } from '@/stores/pluginStore';
import { useRealTimePresence } from '@/hooks/useRealTimePresence';
import { useSessionSync } from '@/hooks/useSessionSync';
import { useStudioKeyboardShortcuts } from '@/hooks/useStudioKeyboardShortcuts';
import { useTransportEngine } from '@/hooks/useTransportEngine';
import { useToast } from '@/hooks/use-toast';

// Studio Components
import { StudioConsole } from '@/components/studio/StudioConsole';
import { WaveformTimeline } from '@/components/studio/WaveformTimeline';
import { AIAssistantPanel } from '@/components/studio/AIAssistantPanel';
import { InspectorSidebar } from '@/components/studio/InspectorSidebar';
import { BrowserSidebar } from '@/components/studio/BrowserSidebar';
import { PrimeBotAssistant } from '@/components/studio/PrimeBotAssistant';
import { MobileStudioView } from '@/components/studio/MobileStudioView';
import { TransportControls } from '@/components/studio/TransportControls';
import { PluginManager } from '@/components/studio/PluginManager';

// UI Components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users, LogOut, Save, ChevronLeft, ChevronRight } from 'lucide-react';

export default function AIStudioWorkspace() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const sessionId = searchParams.get('session');
  const [sessionData, setSessionData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [rightPanelMode, setRightPanelMode] = useState<'inspector' | 'ai'>('inspector');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Store access
  const { tracks, addTrack, isPlaying, setPlaying, currentTime, setCurrentTime, updateTrack, removeTrack, setRecording, isRecording } = useAIStudioStore();
  const { openPlugins, activePlugin } = usePluginStore();

  // Real-time collaboration
  const { onlineUsers, isConnected } = useRealTimePresence(sessionId || 'solo-session');
  
  // Auto-save and sync
  useSessionSync(sessionId);
  
  // Transport playback engine
  useTransportEngine();
  
  // Keyboard shortcuts
  useStudioKeyboardShortcuts();

  // Show PrimeBot when plugin is active
  const showPrimeBot = activePlugin && openPlugins.length > 0;

  // Load session data
  useEffect(() => {
    const loadSession = async () => {
      if (!sessionId || !user) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch session details
        const { data: session, error: sessionError } = await supabase
          .from('collaboration_sessions')
          .select('*')
          .eq('id', sessionId)
          .single();

        if (sessionError) throw sessionError;

        setSessionData(session);

        // Fetch audio files for this session
        const { data: audioFiles, error: filesError } = await supabase
          .from('audio_files')
          .select('*')
          .eq('project_id', session.project_id || sessionId);

        if (filesError) throw filesError;

        // Convert audio files to tracks
        audioFiles?.forEach((file, index) => {
          addTrack({
            id: file.id,
            name: file.file_name,
            type: (file.stem_type as any) || 'other',
            volume: 0.75,
            pan: 0,
            mute: false,
            solo: false,
            peakLevel: 0,
            rmsLevel: 0,
            color: `hsl(${(index * 60) % 360}, 70%, 50%)`,
            regions: [],
            effects: [],
            sends: {},
          });
        });

        toast({
          title: "Session Loaded",
          description: `${session.session_name} - ${audioFiles?.length || 0} tracks loaded`,
        });

      } catch (error: any) {
        console.error('Error loading session:', error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, [sessionId, user, addTrack, toast]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Save and leave session
  const handleLeaveSession = async () => {
    setIsSaving(true);
    
    // Auto-save is handled by useSessionSync hook
    await new Promise(resolve => setTimeout(resolve, 1000)); // Give time for final save

    toast({
      title: "Session Saved",
      description: "All changes have been saved",
    });

    // Navigate based on user role
    const hasEngineerRole = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user?.id)
      .eq('role', 'engineer')
      .single();

    if (hasEngineerRole.data) {
      navigate('/engineer-crm');
    } else {
      navigate('/artist-crm');
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-lg text-muted-foreground">Loading Studio...</p>
        </div>
      </div>
    );
  }

  // Mobile view (simplified for now)
  if (isMobile) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background p-4">
        <div className="text-center space-y-4">
          <p className="text-lg text-muted-foreground">Mobile studio view coming soon!</p>
          <Button onClick={() => setIsMobile(false)}>
            View Desktop Version
          </Button>
        </div>
      </div>
    );
  }

  // Desktop view
  return (
    <div className="h-screen w-full flex flex-col bg-background overflow-hidden">
      {/* Top Bar - Session Info & Transport */}
      <div className="h-16 border-b border-border flex items-center justify-between px-4 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-foreground">
            {sessionData?.session_name || 'Mixx Club Studio'}
          </h1>
          {sessionId && (
            <Badge variant="outline" className="gap-2">
              <Users className="h-3 w-3" />
              {onlineUsers.length} Online
              {isConnected && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />}
            </Badge>
          )}
        </div>

        <div className="flex-1 max-w-2xl mx-8">
          <TransportControls />
        </div>

        <div className="flex items-center gap-2">
          {isSaving && (
            <Badge variant="secondary" className="gap-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              Saving...
            </Badge>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleLeaveSession}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            Save & Exit
          </Button>

          {sessionId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLeaveSession}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Leave Session
            </Button>
          )}
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Browser */}
        <div 
          className={`border-r border-border transition-all duration-300 ${
            leftSidebarOpen ? 'w-80' : 'w-0'
          } overflow-hidden flex`}
        >
          <BrowserSidebar />
        </div>

        {/* Left Sidebar Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-0 top-1/2 z-10 rounded-r-lg rounded-l-none h-16 w-6"
          onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
        >
          {leftSidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>

        {/* Center - Timeline & Console */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Timeline Area */}
          <div className="flex-1 overflow-hidden">
            <WaveformTimeline
              tracks={tracks}
              currentTime={currentTime}
              duration={180}
              isPlaying={isPlaying}
              onTimeChange={setCurrentTime}
              onTrackUpdate={updateTrack}
              recordArmedTracks={new Set()}
              onToggleRecordArm={() => {}}
              onOpenTrackEffects={() => {}}
              onDeleteTrack={removeTrack}
            />
          </div>

          {/* Console Area */}
          <div className="h-80 border-t border-border overflow-hidden">
            <StudioConsole />
          </div>
        </div>

        {/* Right Sidebar Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-1/2 z-10 rounded-l-lg rounded-r-none h-16 w-6"
          onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
        >
          {rightSidebarOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>

        {/* Right Sidebar - Inspector / AI Assistant */}
        <div 
          className={`border-l border-border transition-all duration-300 ${
            rightSidebarOpen ? 'w-96' : 'w-0'
          } overflow-hidden flex flex-col`}
        >
          {/* Tab Switcher */}
          <div className="flex border-b border-border">
            <Button
              variant={rightPanelMode === 'inspector' ? 'default' : 'ghost'}
              className="flex-1 rounded-none"
              onClick={() => setRightPanelMode('inspector')}
            >
              Inspector
            </Button>
            <Button
              variant={rightPanelMode === 'ai' ? 'default' : 'ghost'}
              className="flex-1 rounded-none"
              onClick={() => setRightPanelMode('ai')}
            >
              AI Assistant
            </Button>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-hidden">
            {rightPanelMode === 'inspector' ? (
              <InspectorSidebar />
            ) : (
              <AIAssistantPanel />
            )}
          </div>
        </div>
      </div>

      {/* Plugin Windows Manager */}
      <PluginManager />

      {/* PrimeBot Assistant Overlay */}
      {showPrimeBot && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
          <PrimeBotAssistant activePlugin={activePlugin} />
        </div>
      )}
    </div>
  );
}
