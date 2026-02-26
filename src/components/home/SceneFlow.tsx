/**
 * Scene Flow Controller
 * 
 * Manages the immersive scene-based homepage experience.
 * Supports two modes:
 *   - vertical (default dissolve transitions)
 *   - horizontal (storybook chapter sliding)
 * 
 * Toggle with Shift+H during development.
 */

import { useEffect, useCallback, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useSceneFlowStore } from '@/stores/sceneFlowStore';
import { SceneStage } from '@/components/scene/SceneStage';
import { StudioHallway } from '@/components/scene/StudioHallway';
import { InsiderDemoExperience } from '@/components/demo/InsiderDemoExperience';
import { ClubScene } from '@/components/home/ClubScene';
import { ChapterShell } from '@/components/storybook/ChapterShell';
import { trackEvent } from '@/lib/analytics';

const ChoosePath = lazy(() => import('@/pages/ChoosePath'));

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
  const mode = useSceneFlowStore((s) => s.mode);
  const go = useSceneFlowStore((s) => s.go);
  const back = useSceneFlowStore((s) => s.back);
  const setMode = useSceneFlowStore((s) => s.setMode);
  const dissolveMs = useSceneFlowStore((s) => s.dissolveMs);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Shift+H to toggle mode during dev
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.shiftKey && e.key === 'H') {
        e.preventDefault();
        setMode(mode === 'vertical' ? 'horizontal' : 'vertical');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mode, setMode]);

  // ─── Horizontal Storybook Mode ───
  if (mode === 'horizontal') {
    const slots = [
      {
        id: 'hallway',
        element: <StudioHallway fullscreen onEnter={() => {
          trackEvent('funnel_cta_click', 'funnel', 'hallway_enter_club');
          // In horizontal mode, chapter nav handles movement
        }} />,
      },
      {
        id: 'demo',
        element: <InsiderDemoExperience
          embedded
          onLearnMore={() => {}}
          onBack={() => {}}
          onJoinNow={() => {
            trackEvent('funnel_cta_click', 'funnel', 'demo_join_now');
            trackEvent('funnel_conversion_complete', 'funnel', 'choose_path');
          }}
        />,
      },
      {
        id: 'club',
        element: <ClubScene onBack={() => {}} />,
      },
      {
        id: 'choose',
        element: (
          <Suspense fallback={<div className="w-full h-full bg-background" />}>
            <ChoosePath />
          </Suspense>
        ),
      },
    ];

    return <ChapterShell slots={slots} />;
  }

  // ─── Vertical Dissolve Mode (original) ───
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

  // URL -> scene sync
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

  // Funnel analytics
  useEffect(() => {
    if (scene === 'HALLWAY') trackEvent('funnel_hallway_view', 'funnel', 'hallway');
    else if (scene === 'DEMO') trackEvent('funnel_demo_enter', 'funnel', 'demo');
    else if (scene === 'INFO') trackEvent('funnel_info_enter', 'funnel', 'info');
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

  const handleLearnMore = useCallback(() => {
    trackEvent('funnel_cta_click', 'funnel', 'demo_learn_more');
    go('INFO');
  }, [go]);

  const handleBackToHallway = useCallback(() => go('HALLWAY'), [go]);
  const handleBackToDemo = useCallback(() => go('DEMO'), [go]);

  const handleJoinNow = useCallback(() => {
    trackEvent('funnel_cta_click', 'funnel', 'demo_join_now');
    trackEvent('funnel_conversion_complete', 'funnel', 'choose_path');
    go('HALLWAY');
    setTimeout(() => navigate('/choose-path'), dissolveMs);
  }, [go, navigate, dissolveMs]);

  return (
    <SceneStage>
      <div className="sr-only" role="status" aria-live="polite">
        {scene === 'HALLWAY' && 'Hallway scene active'}
        {scene === 'DEMO' && 'Demo scene active'}
        {scene === 'INFO' && 'Club information scene active'}
      </div>

      {/* Floating nav pill */}
      <motion.div
        className="mg-panel fixed top-4 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 px-3 py-1.5"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: scene === 'HALLWAY' ? 2 : 0.3 }}
      >
        {scene !== 'HALLWAY' && (
          <>
            <button
              type="button"
              onClick={handleBackToHallway}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Back to home"
            >
              Home
            </button>
            <span className="text-muted-foreground/40">•</span>
          </>
        )}
        <Link
          to="/choose-path"
          className="mg-pill text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
          aria-label="Go to sign up"
        >
          Join Free
        </Link>
      </motion.div>

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
        <ClubScene onBack={handleBackToDemo} />
      )}
    </SceneStage>
  );
}
