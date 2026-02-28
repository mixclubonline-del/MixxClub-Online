 import React, { useState } from 'react';
 import { motion } from 'framer-motion';
 import { Button } from '@/components/ui/button';
 import { Card } from '@/components/ui/card';
 import { Film, Check, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
 import { useDreamEngine } from '@/hooks/useDreamEngine';
 import { toast } from 'sonner';
 
 interface PhaseConfig {
   id: string;
   name: string;
   context: string;
   prompt: string;
 }
 
 const DEMO_PHASES: PhaseConfig[] = [
   {
     id: 'problem',
     name: 'The Problem',
     context: 'demo_phase_problem',
     prompt: 'Cinematic wide shot of a music producer alone at 3am in a small bedroom studio. Multiple monitors showing DAW with unfinished projects. Hard drives stacked on desk. The weight of unreleased music visible in their tired posture. Purple-blue mood lighting. Documentary style, real moment. 8K photorealistic.',
   },
   {
     id: 'discovery',
     name: 'The Discovery',
     context: 'demo_phase_discovery',
     prompt: 'Abstract cinematic visualization of hope dawning. Infinity symbol (Mixxclub logo shape) forming from light particles in dark space. Colors shifting from deep purple to warm gold. Digital gateway opening. The moment of realization. 8K digital art, premium quality. No people, pure concept.',
   },
   {
     id: 'connection',
     name: 'The Connection',
     context: 'demo_phase_connection',
     prompt: 'Split composition cinematic shot: Young Black male artist in home bedroom studio (Brooklyn aesthetic) on left, professional female engineer at mixing console (Lagos studio) on right. Subtle beam of musical energy/data visualization connecting them across the frame. Both focused, both real. Warm collaboration energy. Documentary photography style. 8K cinematic.',
   },
   {
     id: 'transformation',
     name: 'The Transformation',
     context: 'demo_phase_transformation',
     prompt: 'Abstract visualization of audio transformation. Raw chaotic waveform on left side morphing into clean, professional mastered waveform on right. LUFS meter climbing. Frequency spectrum analysis visible. The craft of audio engineering visualized. Purple, cyan, and gold color palette. 8K digital visualization. No people, pure audio art.',
   },
   {
     id: 'tribe',
     name: 'The Tribe',
     context: 'demo_phase_tribe',
     prompt: 'Global network visualization with real human elements. Glowing circular portrait nodes of diverse music creators around the world (different ages, ethnicities, genders) connected by pulsing light streams forming infinity symbol pattern. Community constellation floating in space. Purple, cyan, and gold connection lines. Some faces in focus, others abstract. 8K cinematic digital art.',
   },
   {
     id: 'invitation',
     name: 'The Invitation',
     context: 'demo_phase_invitation',
     prompt: 'Cinematic shot of ornate studio door opening into a vibrant, professional recording studio. Warm golden light spilling out into dark purple hallway. Inside: mixing console, monitors, instruments, plants. An empty chair at the desk — waiting for the viewer. The threshold to belonging. Welcoming, aspirational. 8K photorealistic.',
   },
 ];
 
 type PhaseStatus = 'pending' | 'generating' | 'complete' | 'error';
 
 interface PhaseState {
   status: PhaseStatus;
   imageUrl?: string;
   error?: string;
 }
 
 export function DemoPhaseGenerator() {
   const { generate, saveGeneration, refreshLiveAssets } = useDreamEngine();
   const [phaseStates, setPhaseStates] = useState<Record<string, PhaseState>>(
     Object.fromEntries(DEMO_PHASES.map(p => [p.id, { status: 'pending' }]))
   );
   const [isRunning, setIsRunning] = useState(false);
   const [currentIndex, setCurrentIndex] = useState(0);
 
   const completedCount = Object.values(phaseStates).filter(s => s.status === 'complete').length;
   const errorCount = Object.values(phaseStates).filter(s => s.status === 'error').length;
 
   const updatePhaseState = (id: string, state: Partial<PhaseState>) => {
     setPhaseStates(prev => ({
       ...prev,
       [id]: { ...prev[id], ...state },
     }));
   };
 
   const generatePhase = async (phase: PhaseConfig): Promise<boolean> => {
     updatePhaseState(phase.id, { status: 'generating' });
     
     try {
       const result = await generate('image', phase.prompt, phase.context, { style: 'cinematic' });
       
       if (!result?.url) {
         throw new Error('No image generated');
       }
 
       // Auto-save with makeActive = true
       await saveGeneration(
         result.url,
         phase.context,
         'image',
         phase.prompt,
         `Demo Phase: ${phase.name}`,
         true // makeActive
       );
 
       updatePhaseState(phase.id, { status: 'complete', imageUrl: result.url });
       return true;
     } catch (err) {
       const message = err instanceof Error ? err.message : 'Generation failed';
       updatePhaseState(phase.id, { status: 'error', error: message });
       return false;
     }
   };
 
   const generateAll = async () => {
     setIsRunning(true);
     
     // Reset all to pending
     setPhaseStates(Object.fromEntries(DEMO_PHASES.map(p => [p.id, { status: 'pending' }])));
     
     for (let i = 0; i < DEMO_PHASES.length; i++) {
       setCurrentIndex(i);
       await generatePhase(DEMO_PHASES[i]);
     }
     
     setIsRunning(false);
     refreshLiveAssets();
     
     const finalCompleted = Object.values(phaseStates).filter(s => s.status === 'complete').length;
     if (finalCompleted === DEMO_PHASES.length) {
       toast.success('All 6 demo phase backgrounds generated!');
     } else {
       toast.info(`Generated ${finalCompleted}/6 backgrounds. Some failed.`);
     }
   };
 
   const retryFailed = async () => {
     setIsRunning(true);
     
     const failedPhases = DEMO_PHASES.filter(p => phaseStates[p.id].status === 'error');
     
     for (const phase of failedPhases) {
       await generatePhase(phase);
     }
     
     setIsRunning(false);
     refreshLiveAssets();
   };
 
   const getStatusIcon = (status: PhaseStatus) => {
     switch (status) {
       case 'complete':
         return <Check className="w-5 h-5 text-primary" />;
       case 'generating':
         return <Loader2 className="w-5 h-5 text-primary animate-spin" />;
       case 'error':
         return <AlertCircle className="w-5 h-5 text-destructive" />;
       default:
         return <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />;
     }
   };
 
   return (
     <Card className="p-6 space-y-6 bg-card/50 border-border/50">
       <div className="flex items-center justify-between">
         <div>
           <h3 className="text-lg font-semibold flex items-center gap-2">
             <Film className="w-5 h-5 text-primary" />
             Demo Phase Backgrounds
           </h3>
           <p className="text-sm text-muted-foreground">
             Generate all 6 cinematic backgrounds for the demo experience
           </p>
         </div>
         
         <div className="text-sm text-muted-foreground">
           {completedCount}/{DEMO_PHASES.length} done
         </div>
       </div>
 
       {/* Phase Grid */}
       <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
         {DEMO_PHASES.map((phase, index) => {
           const state = phaseStates[phase.id];
           const isActive = isRunning && index === currentIndex;
           
           return (
             <motion.div
               key={phase.id}
               className={`
                 relative p-4 rounded-lg border transition-all
                 ${state.status === 'complete' ? 'border-primary/50 bg-primary/5' : ''}
                 ${state.status === 'generating' ? 'border-primary bg-primary/10' : ''}
                 ${state.status === 'error' ? 'border-destructive/50 bg-destructive/5' : ''}
                 ${state.status === 'pending' ? 'border-border bg-muted/20' : ''}
               `}
               animate={isActive ? { scale: [1, 1.02, 1] } : {}}
               transition={{ duration: 0.5, repeat: isActive ? Infinity : 0 }}
             >
               {/* Preview thumbnail */}
               {state.imageUrl && (
                 <div className="absolute inset-0 rounded-lg overflow-hidden opacity-20">
                   <img src={state.imageUrl} alt="" className="w-full h-full object-cover" />
                 </div>
               )}
               
               <div className="relative flex items-start gap-3">
                 {getStatusIcon(state.status)}
                 <div className="min-w-0 flex-1">
                   <div className="font-medium text-sm truncate">{phase.name}</div>
                   <div className="text-xs text-muted-foreground capitalize">
                     {state.status === 'generating' ? 'Generating...' : state.status}
                   </div>
                 </div>
               </div>
             </motion.div>
           );
         })}
       </div>
 
       {/* Actions */}
       <div className="flex items-center gap-3">
         <Button
           onClick={generateAll}
           disabled={isRunning}
           className="flex-1"
         >
           {isRunning ? (
             <>
               <Loader2 className="w-4 h-4 mr-2 animate-spin" />
               Generating ({currentIndex + 1}/{DEMO_PHASES.length})...
             </>
           ) : (
             <>
               <Film className="w-4 h-4 mr-2" />
               Generate All Demo Backgrounds
             </>
           )}
         </Button>
         
         {errorCount > 0 && !isRunning && (
           <Button variant="outline" onClick={retryFailed}>
             <RefreshCw className="w-4 h-4 mr-2" />
             Retry Failed ({errorCount})
           </Button>
         )}
       </div>
 
       {/* Time estimate */}
       {!isRunning && completedCount === 0 && (
         <p className="text-xs text-muted-foreground text-center">
           Estimated time: 1-2 minutes for all 6 images
         </p>
       )}
     </Card>
   );
 }