/**
 * Studio Hallway Component
 * 
 * The living visualization of MixClub's active sessions.
 * Shows lit rooms for active sessions, dark rooms when empty.
 * Built on the Scene System for real-time data.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Music, Users, Mic, Headphones } from 'lucide-react';
import { useStudios, useFeaturedSession, useSceneSystemInit } from '@/hooks/useSceneSystem';
import { useDynamicHallwayAssets } from '@/hooks/useDynamicHallwayAssets';
import { HallwayVideoBackground } from './HallwayVideoBackground';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { StudioRoom } from '@/types/scene';

// ============================================
// STUDIO ROOM CARD
// ============================================

interface StudioRoomCardProps {
  room: StudioRoom;
  isFeatured?: boolean;
  onClick: () => void;
}

function StudioRoomCard({ room, isFeatured, onClick }: StudioRoomCardProps) {
  const isActive = room.state !== 'idle' && room.state !== 'waiting';
  const isRecording = room.state === 'recording';
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={`
        relative cursor-pointer rounded-xl overflow-hidden
        transition-all duration-500
        ${isFeatured ? 'col-span-2 row-span-2' : ''}
        ${isActive 
          ? 'bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 shadow-lg shadow-primary/10' 
          : 'bg-muted/30 border border-border/50 hover:border-border'
        }
      `}
    >
      {/* Glow effect for active rooms */}
      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent pointer-events-none" />
      )}
      
      {/* Recording indicator */}
      {isRecording && (
        <motion.div
          className="absolute top-3 right-3 flex items-center gap-2 px-2 py-1 bg-destructive/90 rounded-full"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="w-2 h-2 rounded-full bg-white" />
          <span className="text-xs font-medium text-white">REC</span>
        </motion.div>
      )}
      
      {/* Content */}
      <div className={`p-4 ${isFeatured ? 'p-6' : ''}`}>
        {/* Room icon */}
        <div className={`
          w-10 h-10 rounded-lg flex items-center justify-center mb-3
          ${isActive ? 'bg-primary/20' : 'bg-muted'}
        `}>
          {isRecording ? (
            <Mic className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
          ) : room.state === 'mixing' ? (
            <Headphones className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
          ) : (
            <Music className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
          )}
        </div>
        
        {/* Title */}
        <h3 className={`font-semibold truncate mb-1 ${isFeatured ? 'text-lg' : 'text-sm'}`}>
          {room.title}
        </h3>
        
        {/* Status */}
        <p className="text-xs text-muted-foreground mb-3">
          {room.state === 'idle' && 'Available'}
          {room.state === 'waiting' && 'Waiting to start'}
          {room.state === 'active' && 'In session'}
          {room.state === 'recording' && 'Recording'}
          {room.state === 'mixing' && 'Mixing'}
          {room.state === 'playback' && 'Playback'}
        </p>
        
        {/* Participants */}
        {isActive && (
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {Array.from({ length: Math.min(room.participantCount, 3) }).map((_, i) => (
                <Avatar key={i} className="w-6 h-6 border-2 border-background">
                  <AvatarFallback className="text-xs bg-primary/20">
                    {String.fromCharCode(65 + i)}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              <Users className="w-3 h-3 inline mr-1" />
              {room.participantCount}
            </span>
          </div>
        )}
      </div>
      
      {/* Activity bar */}
      {isActive && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${room.activityLevel}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      )}
    </motion.div>
  );
}

// ============================================
// EMPTY STATE
// ============================================

function EmptyHallway() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-20"
    >
      <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-muted/50 flex items-center justify-center">
        <Music className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold mb-2 text-muted-foreground">
        The studio is quiet
      </h3>
      <p className="text-muted-foreground/70 max-w-md mx-auto">
        No active sessions right now. Be the first to start one and light up the hallway.
      </p>
    </motion.div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function StudioHallway() {
  const navigate = useNavigate();
  const { isConnected } = useSceneSystemInit();
  const { studios, activeCount } = useStudios();
  const { featuredSession } = useFeaturedSession();
  const { getBackgroundUrl, isVideo } = useDynamicHallwayAssets();
  
  const hasActiveSessions = activeCount > 0;
  const backgroundUrl = getBackgroundUrl(hasActiveSessions);
  const isVideoBg = isVideo(hasActiveSessions);
  
  const handleRoomClick = (room: StudioRoom) => {
    if (room.visibility === 'public' && room.sessionId) {
      navigate(`/session/${room.sessionId}`);
    }
  };
  
  return (
    <section className="relative py-16 px-6 overflow-hidden min-h-[400px]">
      {/* AI-generated background */}
      <HallwayVideoBackground url={backgroundUrl} isVideo={isVideoBg} />
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold mb-1">Studio Hallway</h2>
            <p className="text-muted-foreground">
              {activeCount > 0 
                ? `${activeCount} studio${activeCount !== 1 ? 's' : ''} in session`
                : 'Waiting for the first session'
              }
            </p>
          </div>
          
          {/* Connection indicator */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <motion.div
              className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-muted'}`}
              animate={isConnected ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            />
            {isConnected ? 'Live' : 'Connecting...'}
          </div>
        </div>
        
        {/* Studios Grid */}
        {studios.length === 0 ? (
          <EmptyHallway />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <AnimatePresence mode="popLayout">
              {studios.map(room => (
                <StudioRoomCard
                  key={room.id}
                  room={room}
                  isFeatured={featuredSession?.room.id === room.id}
                  onClick={() => handleRoomClick(room)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
}
