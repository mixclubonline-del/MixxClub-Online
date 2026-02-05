 /**
  * PhaseBackground - Cinematic phase-aware background for demo experience
  * 
  * Layer Stack:
  * 1. Cinematic Image (cross-fades between phases)
  * 2. Darkening Gradient Overlay (ensures text readability)
  * 3. Audio-Reactive Glow Layer (pulses with bass/amplitude)
  */
 
 import { motion, AnimatePresence } from 'framer-motion';
 import { useDemoPhaseAssets, DemoPhaseId } from '@/hooks/useDemoPhaseAssets';
 
 interface PhaseBackgroundProps {
   phaseId: DemoPhaseId;
   amplitude: number;
   bass: number;
   mid?: number;
   high?: number;
   isPlaying: boolean;
 }
 
 // Phase-specific fallback gradient palettes (no prime_* assets)
 const PHASE_GRADIENTS: Record<DemoPhaseId, string> = {
   problem: `
     radial-gradient(ellipse at 30% 20%, hsl(280 60% 15% / 0.8) 0%, transparent 50%),
     radial-gradient(ellipse at 70% 80%, hsl(0 70% 20% / 0.4) 0%, transparent 40%),
     radial-gradient(ellipse at 50% 50%, hsl(260 50% 8%) 0%, hsl(260 50% 3%) 100%)
   `,
   discovery: `
     radial-gradient(ellipse at 50% 40%, hsl(45 90% 50% / 0.15) 0%, transparent 50%),
     radial-gradient(ellipse at 30% 70%, hsl(280 70% 30% / 0.5) 0%, transparent 50%),
     radial-gradient(ellipse at 70% 30%, hsl(280 60% 20% / 0.6) 0%, transparent 60%)
   `,
   connection: `
     radial-gradient(ellipse at 20% 50%, hsl(330 70% 40% / 0.3) 0%, transparent 50%),
     radial-gradient(ellipse at 80% 50%, hsl(190 80% 40% / 0.3) 0%, transparent 50%),
     radial-gradient(ellipse at 50% 50%, hsl(280 40% 15% / 0.8) 0%, transparent 70%)
   `,
   transformation: `
     linear-gradient(90deg, hsl(280 60% 20% / 0.6) 0%, hsl(45 80% 40% / 0.2) 100%),
     radial-gradient(ellipse at 50% 50%, hsl(280 50% 12%) 0%, hsl(260 50% 5%) 100%)
   `,
   tribe: `
     radial-gradient(ellipse at 20% 20%, hsl(280 70% 40% / 0.3) 0%, transparent 30%),
     radial-gradient(ellipse at 80% 30%, hsl(190 80% 50% / 0.2) 0%, transparent 25%),
     radial-gradient(ellipse at 50% 80%, hsl(45 90% 50% / 0.15) 0%, transparent 35%),
     radial-gradient(ellipse at 30% 60%, hsl(320 70% 40% / 0.2) 0%, transparent 25%),
     radial-gradient(ellipse at 70% 70%, hsl(200 80% 40% / 0.2) 0%, transparent 30%)
   `,
   invitation: `
     radial-gradient(ellipse at 50% 50%, hsl(45 80% 50% / 0.25) 0%, transparent 40%),
     radial-gradient(ellipse at 50% 50%, hsl(280 50% 20% / 0.6) 40%, hsl(280 60% 8%) 100%)
   `,
 };
 
 export function PhaseBackground({ 
   phaseId, 
   amplitude, 
   bass, 
   mid = 0, 
   high = 0,
   isPlaying 
 }: PhaseBackgroundProps) {
   const { getAssetForPhase, isLoading } = useDemoPhaseAssets();
   const imageUrl = getAssetForPhase(phaseId);
   const fallbackGradient = PHASE_GRADIENTS[phaseId];
 
   // Audio-reactive glow intensity
   const bassGlow = isPlaying ? (bass / 255) * 0.25 : 0;
   const midGlow = isPlaying ? (mid / 255) * 0.15 : 0;
   const highGlow = isPlaying ? (high / 255) * 0.1 : 0;
 
   return (
     <div className="fixed inset-0 pointer-events-none overflow-hidden">
       {/* Layer 1: Cinematic Image or Fallback Gradient */}
       <AnimatePresence mode="wait">
         {imageUrl ? (
           <motion.div
             key={`image-${phaseId}`}
             className="absolute inset-0"
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             transition={{ duration: 0.8, ease: 'easeInOut' }}
           >
             <img
               src={imageUrl}
               alt=""
               className="w-full h-full object-cover"
               style={{ opacity: 0.55 }}
             />
           </motion.div>
         ) : (
           <motion.div
             key={`gradient-${phaseId}`}
             className="absolute inset-0"
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             transition={{ duration: 0.8, ease: 'easeInOut' }}
             style={{ background: fallbackGradient }}
           />
         )}
       </AnimatePresence>
 
       {/* Layer 2: Darkening Gradient Overlay for readability */}
       <div 
         className="absolute inset-0"
         style={{
           background: `
             linear-gradient(to bottom, 
               hsl(var(--background) / 0.7) 0%, 
               hsl(var(--background) / 0.4) 30%,
               hsl(var(--background) / 0.5) 70%,
               hsl(var(--background) / 0.85) 100%
             )
           `
         }}
       />
 
       {/* Layer 3: Audio-Reactive Glow */}
       <motion.div 
         className="absolute inset-0"
         animate={{
           opacity: isPlaying ? 1 : 0.5,
         }}
         transition={{ duration: 0.3 }}
         style={{
           background: `
             radial-gradient(circle at 30% 20%, hsl(var(--primary) / ${0.1 + bassGlow}) 0%, transparent 50%),
             radial-gradient(circle at 70% 80%, hsl(280 100% 50% / ${0.08 + midGlow}) 0%, transparent 50%),
             radial-gradient(circle at 50% 50%, hsl(200 100% 50% / ${0.05 + highGlow}) 0%, transparent 70%)
           `
         }}
       />
     </div>
   );
 }