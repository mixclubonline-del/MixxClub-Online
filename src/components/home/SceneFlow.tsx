/**
 * Scene Flow Controller
 * 
 * Manages the immersive scene-based homepage experience.
 * Dissolves between: Hallway (Intrigue) → Demo (Energy) → Information (Clarity)
 * 
 * Uses Zustand state machine for transitions and keyboard navigation.
 */

import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSceneFlowStore } from '@/stores/sceneFlowStore';
import { SceneStage } from '@/components/scene/SceneStage';
import { StudioHallway } from '@/components/scene/StudioHallway';
import { InsiderDemoExperience } from '@/components/demo/InsiderDemoExperience';
import { ClubScene } from '@/components/home/ClubScene';

export function SceneFlow() {
  const scene = useSceneFlowStore((s) => s.scene);
  const go = useSceneFlowStore((s) => s.go);
  const back = useSceneFlowStore((s) => s.back);
  const dissolveMs = useSceneFlowStore((s) => s.dissolveMs);
  const navigate = useNavigate();

  // Keyboard navigation
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'Enter' && scene === 'HALLWAY') {
        e.preventDefault();
        go('DEMO');
      }

      // Press 'I' to skip to info (from Hallway)
      if ((e.key === 'i' || e.key === 'I') && scene === 'HALLWAY') {
        e.preventDefault();
        go('INFO');
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        back();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [scene, go, back]);

  const handleEnterDemo = useCallback(() => go('DEMO'), [go]);
  const handleSkipToInfo = useCallback(() => go('INFO'), [go]);
  const handleLearnMore = useCallback(() => go('INFO'), [go]);
  const handleBackToHallway = useCallback(() => go('HALLWAY'), [go]);
  const handleBackToDemo = useCallback(() => go('DEMO'), [go]);
  const handleJoinNow = useCallback(() => {
    // Dissolve out, then navigate after dissolve completes
    go('HALLWAY');
    setTimeout(() => navigate('/choose-path'), dissolveMs);
  }, [go, navigate, dissolveMs]);

  return (
    <SceneStage>
      {scene === 'HALLWAY' && (
        <StudioHallway fullscreen onEnter={handleEnterDemo} onSkipToInfo={handleSkipToInfo} />
      )}

      {scene === 'DEMO' && (
        <InsiderDemoExperience
          embedded
          onLearnMore={handleLearnMore}
          onBack={handleBackToHallway}
          onJoinNow={handleJoinNow}
        />
      )}

      {scene === 'INFO' && (
        <ClubScene onBack={handleBackToDemo} />
      )}
    </SceneStage>
  );
}
