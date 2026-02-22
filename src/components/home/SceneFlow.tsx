/**
 * Scene Flow Controller
 * 
 * Manages the immersive scene-based homepage experience.
 * Dissolves between: Hallway (Intrigue) → Demo (Energy) → Information (Clarity)
 * 
 * Uses Zustand state machine for transitions and keyboard navigation.
 */

import { useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSceneFlowStore } from '@/stores/sceneFlowStore';
import { SceneStage } from '@/components/scene/SceneStage';
import { StudioHallway } from '@/components/scene/StudioHallway';
import { InsiderDemoExperience } from '@/components/demo/InsiderDemoExperience';
import { ClubScene } from '@/components/home/ClubScene';
import { trackEvent } from '@/lib/analytics';

const SCENE_TO_QUERY = {
  HALLWAY: 'hallway',
  DEMO: 'demo',
  INFO: 'info',
} as const;

const QUERY_TO_SCENE = {
  hallway: 'HALLWAY',
  demo: 'DEMO',
  info: 'INFO',
} as const;

export function SceneFlow() {
  const scene = useSceneFlowStore((s) => s.scene);
  const go = useSceneFlowStore((s) => s.go);
  const back = useSceneFlowStore((s) => s.back);
  const dissolveMs = useSceneFlowStore((s) => s.dissolveMs);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL -> scene sync (supports /?scene=hallway|demo|info deep links)
  useEffect(() => {
    const queryScene = searchParams.get('scene');
    if (!queryScene) return;

    const normalized = queryScene.toLowerCase() as keyof typeof QUERY_TO_SCENE;
    const nextScene = QUERY_TO_SCENE[normalized];
    if (nextScene && nextScene !== scene) {
      go(nextScene);
    }
  }, [searchParams, scene, go]);

  // scene -> URL sync
  useEffect(() => {
    const currentQueryScene = searchParams.get('scene');
    const target = SCENE_TO_QUERY[scene];

    if (currentQueryScene === target) return;

    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('scene', target);
    setSearchParams(nextParams, { replace: true });
  }, [scene, searchParams, setSearchParams]);

  // Funnel scene analytics
  useEffect(() => {
    if (scene === 'HALLWAY') {
      trackEvent('funnel_hallway_view', 'funnel', 'hallway');
    } else if (scene === 'DEMO') {
      trackEvent('funnel_demo_enter', 'funnel', 'demo');
    } else if (scene === 'INFO') {
      trackEvent('funnel_info_enter', 'funnel', 'info');
    }
  }, [scene]);

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

  const handleEnterDemo = useCallback(() => {
    trackEvent('funnel_cta_click', 'funnel', 'hallway_enter_club');
    go('DEMO');
  }, [go]);

  const handleSkipToInfo = useCallback(() => {
    trackEvent('funnel_cta_click', 'funnel', 'hallway_skip_to_info');
    go('INFO');
  }, [go]);

  const handleLearnMore = useCallback(() => {
    trackEvent('funnel_cta_click', 'funnel', 'demo_learn_more');
    go('INFO');
  }, [go]);

  const handleBackToHallway = useCallback(() => go('HALLWAY'), [go]);
  const handleBackToDemo = useCallback(() => go('DEMO'), [go]);

  const handleJoinNow = useCallback(() => {
    trackEvent('funnel_cta_click', 'funnel', 'demo_join_now');
    trackEvent('funnel_conversion_complete', 'funnel', 'choose_path');
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
