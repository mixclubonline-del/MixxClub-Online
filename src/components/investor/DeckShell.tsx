import { useState, useEffect, useCallback, useRef } from 'react';
import { SlideRenderer } from './SlideRenderer';
import { DeckControls } from './DeckControls';
import { PresenterNotesPanel } from './PresenterNotesPanel';

const TOTAL_SLIDES = 12;

export function DeckShell() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const [scale, setScale] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const goTo = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(TOTAL_SLIDES - 1, index));
    setDirection(clamped >= currentSlide ? 1 : -1);
    setCurrentSlide(clamped);
  }, [currentSlide]);

  const next = useCallback(() => { setDirection(1); goTo(currentSlide + 1); }, [currentSlide, goTo]);
  const prev = useCallback(() => { setDirection(-1); goTo(currentSlide - 1); }, [currentSlide, goTo]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); next(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
      if (e.key === 'Escape' && isFullscreen) document.exitFullscreen?.();
      if (e.key === 'n' || e.key === 'N') { e.preventDefault(); setShowNotes(s => !s); }
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen?.();
        } else {
          document.exitFullscreen?.();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [next, prev, isFullscreen]);

  // Fullscreen change detection
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // ResizeObserver for scaling
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      const scaleX = width / 1920;
      const scaleY = height / 1080;
      setScale(Math.min(scaleX, scaleY));
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  return (
    <div className="fixed inset-0 bg-[hsl(262,30%,2%)] flex flex-col overflow-hidden select-none">
      {/* Slide canvas */}
      <div ref={containerRef} className="flex-1 relative overflow-hidden">
        <div
          className="absolute w-[1920px] h-[1080px] left-1/2 top-1/2"
          style={{
            marginLeft: -960,
            marginTop: -540,
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
          }}
        >
          <SlideRenderer slideIndex={currentSlide} direction={direction} />
        </div>

        {/* Click zones for navigation */}
        <div className="absolute inset-0 flex">
          <div className="w-1/3 h-full cursor-w-resize" onClick={prev} />
          <div className="w-1/3 h-full" />
          <div className="w-1/3 h-full cursor-e-resize" onClick={next} />
        </div>
      </div>

      {/* Controls */}
      <DeckControls
        currentSlide={currentSlide}
        totalSlides={TOTAL_SLIDES}
        onGoTo={goTo}
        onToggleFullscreen={toggleFullscreen}
        isFullscreen={isFullscreen}
      />
    </div>
  );
}
