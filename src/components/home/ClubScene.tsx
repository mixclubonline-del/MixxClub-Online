/**
 * Club Scene
 * 
 * The exclusive, immersive information experience.
 * Replaces InformationScene with a room-by-room "secret club" tour.
 */

import { useRef, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ClubAmbience } from './ClubAmbience';
import { ClubProgress } from './ClubProgress';
import { ListeningRoom } from './rooms/ListeningRoom';
import { GreenRoom } from './rooms/GreenRoom';
import { ControlRoom } from './rooms/ControlRoom';
import { VaultRoom } from './rooms/VaultRoom';
import { VIPBooth } from './rooms/VIPBooth';
import { StageDoor } from './rooms/StageDoor';
import { trackEvent } from '@/lib/analytics';

interface ClubSceneProps {
  onBack?: () => void;
}

const ROOM_IDS = ['listening', 'vault', 'green', 'control', 'vip', 'stage'];

export function ClubScene({ onBack }: ClubSceneProps) {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentRoom, setCurrentRoom] = useState(0);

  // Track which room is in view
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = ROOM_IDS.indexOf(entry.target.id);
            if (index !== -1) {
              setCurrentRoom(index);
            }
          }
        });
      },
      { root: container, threshold: 0.5 }
    );

    ROOM_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Navigate to specific room
  const goToRoom = useCallback((index: number) => {
    const el = document.getElementById(ROOM_IDS[index]);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // Scroll to next room
  const scrollToNext = useCallback(() => {
    if (currentRoom < ROOM_IDS.length - 1) {
      goToRoom(currentRoom + 1);
    }
  }, [currentRoom, goToRoom]);

  // Handle join action
  const handleJoin = useCallback(() => {
    trackEvent('funnel_cta_click', 'funnel', 'info_join_now');
    trackEvent('funnel_conversion_complete', 'funnel', 'choose_path');
    navigate('/choose-path');
  }, [navigate]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case 'ArrowDown':
        case ' ':
          e.preventDefault();
          if (currentRoom < ROOM_IDS.length - 1) goToRoom(currentRoom + 1);
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (currentRoom > 0) goToRoom(currentRoom - 1);
          break;
        case 'Escape':
          e.preventDefault();
          onBack?.();
          break;
        case 'Enter':
          e.preventDefault();
          if (currentRoom === ROOM_IDS.length - 1) handleJoin();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentRoom, goToRoom, onBack, handleJoin]);

  return (
    <section className="relative w-full h-screen overflow-hidden bg-background" aria-label="Club information scene">
      {/* Atmospheric background */}
      <ClubAmbience />

      {/* Back button */}

      {onBack && (
        <motion.button
          onClick={onBack}
          aria-label="Back to demo"
          className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-background/60 backdrop-blur-md border border-border/50 text-muted-foreground hover:text-foreground transition-colors"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </motion.button>
      )}

      {/* Room progress indicator */}
      <ClubProgress currentRoom={currentRoom} onRoomClick={goToRoom} />

      {/* Scrollable room container */}
      <main
        ref={containerRef}
        aria-label="Scrollable club tour rooms"
        className="h-screen overflow-y-auto snap-y snap-mandatory scroll-smooth"
        style={{ scrollbarWidth: 'none' }}
      >
        <ListeningRoom onScrollHint={scrollToNext} />
        <VaultRoom />
        <GreenRoom />
        <ControlRoom />
        <VIPBooth />
        <StageDoor onJoin={handleJoin} />
      </main>
    </section>
  );
}
