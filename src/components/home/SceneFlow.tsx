/**
 * Scene Flow Controller
 * 
 * Hybrid flow: vertical dissolve for Hallway/Demo,
 * then horizontal storybook chapters for Club + Choose Path.
 */

import { useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSceneFlowStore } from '@/stores/sceneFlowStore';
import { useChapterStore } from '@/stores/chapterStore';
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
  return <VerticalSceneFlow />;
}

/** Original vertical dissolve implementation, extracted for clarity */
function VerticalSceneFlow() {
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
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'Enter' && scene === 'HALLWAY') { e.preventDefault(); go('DEMO'); }
      if (e.key === 'Escape') { e.preventDefault(); back(); }
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
    setTimeout(() => navigate('/how-it-works'), dissolveMs);
  }, [go, navigate, dissolveMs]);

  return (
    <SceneStage>
      <div className="sr-only" role="status" aria-live="polite">
        {scene === 'HALLWAY' && 'Hallway scene active'}
        {scene === 'DEMO' && 'Demo scene active'}
        {scene === 'INFO' && 'Club information scene active'}
      </div>


      {scene === 'HALLWAY' && (
        <StudioHallway fullscreen onEnter={handleEnterDemo} />
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
        <ChapterShell
          slots={[
            {
              id: 'club',
              element: <ClubScene onBack={handleBackToDemo} />,
            },
            {
              id: 'features',
              element: (
                <Suspense fallback={<div className="w-full h-full bg-background" />}>
                  <FeaturesChapter />
                </Suspense>
              ),
            },
            {
              id: 'pricing',
              element: (
                <Suspense fallback={<div className="w-full h-full bg-background" />}>
                  <PricingChapter />
                </Suspense>
              ),
            },
            {
              id: 'choose',
              element: (
                <Suspense fallback={<div className="w-full h-full bg-background" />}>
                  <ChoosePath />
                </Suspense>
              ),
            },
          ]}
        />
      )}
    </SceneStage>
  );
}
