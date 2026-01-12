/**
 * Live Room Window
 * 
 * A "window" into an active session, showing real collaboration in progress.
 * Auto-rotates between active public sessions.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Radio, Users, Mic, Headphones, Play, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useStudios, useFeaturedSession } from '@/hooks/useSceneSystem';

// Session state labels
const SESSION_STATES = {
  recording: { label: 'Recording', icon: Mic, color: 'text-red-400' },
  mixing: { label: 'Mixing', icon: Headphones, color: 'text-primary' },
  playback: { label: 'Playback', icon: Play, color: 'text-emerald-400' },
  idle: { label: 'In Session', icon: Radio, color: 'text-secondary' },
};

export function LiveRoomWindow() {
  const { studios, activeCount } = useStudios();
  const { featuredSession, rotate } = useFeaturedSession();
  const [waveformBars, setWaveformBars] = useState<number[]>([]);
  
  // Generate simulated waveform
  useEffect(() => {
    const generateBars = () => {
      setWaveformBars(Array.from({ length: 24 }, () => 
        Math.random() * 0.7 + 0.3
      ));
    };
    
    generateBars();
    const interval = setInterval(generateBars, 150);
    return () => clearInterval(interval);
  }, []);
  
  // Auto-rotate featured session
  useEffect(() => {
    if (activeCount > 1) {
      const interval = setInterval(rotate, 10000);
      return () => clearInterval(interval);
    }
  }, [activeCount, rotate]);
  
  const activeStudios = studios.filter(s => s.state === 'active' && s.visibility === 'public');
  const currentSession = featuredSession?.room || activeStudios[0];
  
  // Get session state info
  const stateInfo = SESSION_STATES.idle;
  const StateIcon = stateInfo.icon;
  
  // No active sessions fallback
  if (!currentSession || activeCount === 0) {
    return (
      <section className="relative px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-2xl border border-border/50
                       bg-card/50 backdrop-blur-sm p-8 text-center"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
            
            <div className="relative z-10">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 
                              flex items-center justify-center">
                <Radio className="w-8 h-8 text-muted-foreground" />
              </div>
              
              <h3 className="text-xl font-semibold mb-2">Studio is Quiet</h3>
              <p className="text-muted-foreground mb-6">
                No live sessions right now. Be the first to start a session!
              </p>
              
              <Link to="/auth?mode=signup">
                <Button className="bg-primary hover:bg-primary/90">
                  Start a Session
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }
  
  return (
    <section className="relative px-6 py-16">
      <div className="max-w-4xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full 
                          bg-primary/10 border border-primary/20 mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span className="text-sm font-medium text-primary">Live Now</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-2">
            See What's Happening
          </h2>
          <p className="text-muted-foreground">
            Real collaboration, real-time
          </p>
        </motion.div>
        
        {/* Live Room Window */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative"
        >
          {/* Window frame */}
          <div className="relative overflow-hidden rounded-2xl border border-primary/30
                          bg-gradient-to-br from-card via-card/95 to-card/90
                          shadow-[0_0_60px_hsl(var(--primary)/0.15)]">
            
            {/* Window header */}
            <div className="flex items-center justify-between px-6 py-4 
                            border-b border-border/50 bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
                </div>
                <div className="h-4 w-px bg-border" />
                <span className="text-sm text-muted-foreground font-mono">
                  studio://live
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <StateIcon className={`w-4 h-4 ${stateInfo.color}`} />
                <span className={stateInfo.color}>{stateInfo.label}</span>
              </div>
            </div>
            
            {/* Window content */}
            <div className="p-6 md:p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSession.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Session info */}
                  <div className="flex flex-col md:flex-row md:items-center 
                                  justify-between gap-6 mb-8">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-14 h-14 border-2 border-primary/30">
                        <AvatarImage src={currentSession.hostAvatar} />
                        <AvatarFallback className="bg-primary/20 text-primary">
                          {currentSession.hostName?.charAt(0) || 'H'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <h3 className="text-xl font-semibold">
                          {currentSession.title || 'Untitled Session'}
                        </h3>
                        <p className="text-muted-foreground">
                          Hosted by {currentSession.hostName || 'Anonymous'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {/* Participants */}
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">
                          {currentSession.maxParticipants || 1}
                        </span>
                      </div>
                      
                      {/* Join button */}
                      {currentSession.sessionId && (
                        <Link to={`/session/${currentSession.sessionId}`}>
                          <Button className="bg-primary hover:bg-primary/90">
                            Join Session
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                  
                  {/* Simulated waveform */}
                  <div className="flex items-end justify-center gap-1 h-24 
                                  px-4 py-4 rounded-xl bg-muted/30">
                    {waveformBars.map((height, i) => (
                      <motion.div
                        key={i}
                        className="w-2 bg-gradient-to-t from-primary to-primary/50 rounded-full"
                        animate={{ height: `${height * 100}%` }}
                        transition={{ duration: 0.1 }}
                      />
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
            
            {/* Rotation indicator */}
            {activeCount > 1 && (
              <div className="absolute bottom-4 right-4 flex gap-1">
                {activeStudios.slice(0, 5).map((studio, i) => (
                  <div
                    key={studio.id}
                    className={`w-2 h-2 rounded-full transition-all ${
                      studio.id === currentSession.id 
                        ? 'bg-primary w-4' 
                        : 'bg-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
