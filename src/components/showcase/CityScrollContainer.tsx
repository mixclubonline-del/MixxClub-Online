import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { Building2, Music, Sparkles, Brain, Radio, ArrowDown, ChevronLeft, Maximize2, Drum, Music2, Mic2, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { StemDrillDown } from './StemDrillDown';
import { AuthMorphOverlay } from './AuthMorphOverlay';

import cityGatesImg from '@/assets/city/city_gates.png';
import pulsePlazaImg from '@/assets/city/pulse_plaza.png';
import rsdChamberImg from '@/assets/city/rsd_chamber.png';
import neuralEngineImg from '@/assets/city/neural_engine.png';
import broadcastTowerImg from '@/assets/city/broadcast_tower.png';

// City Districts Data - Mapped to Scroll Sections
const CITY_SECTIONS = [
  {
    id: 'gates',
    title: 'City Gates',
    subtitle: 'Begin Your Journey',
    color: 'from-blue-500 to-cyan-500',
    icon: Building2,
    image: cityGatesImg,
    description: 'Welcome to the metropolis of sound. Your career starts here.',
    bgOffset: 0
  },
  {
    id: 'plaza',
    title: 'Pulse Plaza',
    subtitle: 'The Community Heartbeat',
    color: 'from-purple-500 to-pink-500',
    icon: Music,
    image: pulsePlazaImg,
    description: 'Connect with artists, join mix battles, and feel the rhythm of the crowd.',
    bgOffset: 20
  },
  {
    id: 'studio',
    title: 'RSD Chamber',
    subtitle: 'The Hybrid Studio',
    color: 'from-orange-500 to-red-500',
    icon: Sparkles,
    image: rsdChamberImg,
    description: 'Create with AI-powered tools in a space that reacts to your sound.',
    bgOffset: 40
  },
  {
    id: 'neural',
    title: 'Neural Engine',
    subtitle: 'Prime Intelligence',
    color: 'from-cyan-500 to-blue-500',
    icon: Brain,
    image: neuralEngineImg,
    description: 'Harness the power of the Superconscious Brain for stem separation and mastering.',
    bgOffset: 60
  },
  {
    id: 'broadcast',
    title: 'Broadcast Tower',
    subtitle: 'Global Distribution',
    color: 'from-indigo-500 to-purple-500',
    icon: Radio,
    image: broadcastTowerImg,
    description: 'Release your tracks to the world and track your ascent.',
    bgOffset: 80
  }
];

export function CityScrollContainer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  const [activeSection, setActiveSection] = useState(0);
  
  // Interactive Focus State
  const [focusedDistrict, setFocusedDistrict] = useState<string | null>(null);
  const isFocused = !!focusedDistrict;

  // Mock Mixer State for RSD Chamber
  const [mixerTracks, setMixerTracks] = useState([
    { id: 'drums', name: 'Prime Drums', icon: Drum, color: '#ef4444', volume: 0.8 },
    { id: 'bass', name: '808 Sub', icon: Music2, color: '#f97316', volume: 0.7 },
    { id: 'melody', name: 'Dark Piano', icon: Mic2, color: '#8b5cf6', volume: 0.6 },
  ]);

  const updateVolume = (id: string, volume: number) => {
    setMixerTracks(prev => prev.map(t => t.id === id ? { ...t, volume } : t));
  };

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (isFocused) return;
    const sectionIndex = Math.floor(latest * CITY_SECTIONS.length);
    setActiveSection(Math.min(sectionIndex, CITY_SECTIONS.length - 1));
  });

  // Parallax Transforms
  const cityY = useTransform(smoothProgress, [0, 1], ['0%', '-20%']); // Subtle parallax
  const glowOpacity = useTransform(smoothProgress, 
    [0, 0.2, 0.4, 0.6, 0.8, 1], 
    [0.5, 0.8, 0.4, 0.9, 0.3, 0.6]
  );
  
  return (
    <div 
      ref={containerRef} 
      className={cn(
        "relative h-[500vh] bg-black transition-colors duration-700",
        isFocused ? "bg-black/95" : "bg-black"
      )}
    >
      {/* Sticky Viewport */}
      <div className="sticky top-0 h-screen overflow-hidden text-white">
        
        {/* Dynamic Background Images - Crossfading */}
        <div className="absolute inset-0 bg-black">
          {CITY_SECTIONS.map((section, idx) => (
            <motion.div
              key={section.id}
              className="absolute inset-0 w-full h-full"
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: activeSection === idx ? (isFocused ? 0.3 : 1) : 0,
                scale: activeSection === idx ? (isFocused ? 1.2 : 1.1) : 1,
                filter: isFocused ? 'blur(10px)' : 'blur(0px)'
              }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            >
              <img 
                src={section.image} 
                alt={section.title}
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            </motion.div>
          ))}
        </div>

        {/* City Grids Overlay */}
        <motion.div 
          className="absolute bottom-0 left-0 right-0 h-[100vh] bg-gradient-to-t from-primary/10 via-transparent to-transparent opacity-20 pointer-events-none"
          style={{ y: cityY }}
        >
          <div className="absolute inset-0 bg-[linear-gradient(transparent_95%,rgba(var(--primary),0.3)_100%)] bg-[size:100%_80px]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_95%,rgba(var(--primary),0.3)_100%)] bg-[size:80px_100%] [transform:perspective(1000px)_rotateX(60deg)] origin-bottom" />
        </motion.div>

        {/* HUD UI - Hidden when focused */}
        <AnimatePresence>
          {!isFocused && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute top-1/2 left-8 md:left-24 -translate-y-1/2 z-20 hidden md:block"
            >
              <div className="flex flex-col gap-4">
                {CITY_SECTIONS.map((section, idx) => (
                  <motion.div
                    key={section.id}
                    className="flex items-center gap-4 cursor-pointer"
                    animate={{
                      opacity: activeSection === idx ? 1 : 0.3,
                      x: activeSection === idx ? 0 : -20,
                    }}
                  >
                    <div className={cn("w-3 h-3 rounded-full bg-gradient-to-r", section.color)} />
                    <span className="font-mono text-sm tracking-widest uppercase text-white/80">
                      0{idx + 1} // {section.id}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Back Button (Focus Mode) */}
        <AnimatePresence>
          {isFocused && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-10 left-10 z-50 text-white"
            >
              <Button 
                variant="ghost" 
                className="text-white gap-2 hover:bg-white/10"
                onClick={() => setFocusedDistrict(null)}
              >
                <ChevronLeft className="w-5 h-5" />
                Back to Flyover
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Central Content Stage */}
        <div className="absolute inset-0 flex items-center justify-center">
          {CITY_SECTIONS.map((section, idx) => {
            const isSectionActive = activeSection === idx;
            const isSectionFocused = focusedDistrict === section.id;
            
            return (
              <motion.div
                key={section.id}
                className={cn(
                  "absolute flex flex-col items-center text-center px-6 w-full h-full justify-center text-white",
                  isSectionFocused ? "z-40 pointer-events-auto" : "z-10 pointer-events-none"
                )}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: isSectionActive ? 1 : 0,
                  scale: isSectionFocused ? 1 : (isSectionActive ? 1 : 0.8),
                  y: isSectionFocused ? 0 : (isSectionActive ? 0 : 100),
                  filter: !isSectionFocused && isFocused ? 'blur(20px)' : 'blur(0px)',
                }}
                transition={{ duration: 0.8 }}
              >
                {/* Regular View */}
                {!isFocused && isSectionActive && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl">
                    <motion.div
                      className={cn("w-24 h-24 mx-auto mb-8 rounded-3xl flex items-center justify-center bg-gradient-to-br shadow-[0_0_100px_rgba(0,0,0,0.5)]", section.color)}
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 6, repeat: Infinity }}
                    >
                      <section.icon className="w-12 h-12 text-white" />
                    </motion.div>
                    
                    <h2 className="text-5xl md:text-7xl font-bold mb-4 tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">
                      {section.title}
                    </h2>
                    <p className="text-xl md:text-2xl text-primary font-light mb-6 tracking-wide uppercase">
                      {section.subtitle}
                    </p>
                    <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed mb-8">
                      {section.description}
                    </p>

                    <Button 
                      size="lg" 
                      className="rounded-full gap-2 px-8 py-6 h-auto bg-primary/20 backdrop-blur-md border border-primary/50 text-primary hover:bg-primary hover:text-white transition-all pointer-events-auto shadow-[0_0_40px_rgba(var(--primary),0.2)] font-bold"
                      onClick={() => setFocusedDistrict(section.id)}
                    >
                      <Maximize2 className="w-5 h-5" />
                      Enter {section.title}
                    </Button>
                  </motion.div>
                )}

                {/* Drill-Down: RSD Chamber (Studio) */}
                {isSectionFocused && section.id === 'studio' && (
                  <div className="w-full h-full flex items-center justify-center gap-12 max-w-7xl mx-auto flex-col lg:flex-row p-12">
                    <div className="flex-1 w-full scale-90 lg:scale-100">
                      <h3 className="text-left text-3xl font-bold mb-6 flex items-center gap-3 backdrop-blur-sm bg-black/40 p-4 rounded-xl border border-white/10 w-fit">
                        <span className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center"><Sparkles className="w-4 h-4 text-white" /></span>
                        Live Session Simulation
                      </h3>
                      <PrimeSimSession />
                    </div>
                    
                    <StudioMiniMixer 
                      tracks={mixerTracks}
                      onUpdateVolume={updateVolume}
                      className="mt-8 lg:mt-0"
                    />
                  </div>
                )}

                {/* Drill-Down: Neural Engine (Stems) */}
                {isSectionFocused && section.id === 'neural' && (
                  <div className="w-full h-full flex items-center justify-center animate-in fade-in zoom-in duration-500">
                    <div className="max-w-5xl w-full">
                      <StemDrillDown />
                    </div>
                  </div>
                )}

                {/* Drill-Down Placeholder for others */}
                {isSectionFocused && section.id !== 'studio' && section.id !== 'neural' && (
                  <div className="p-12 rounded-3xl border border-white/20 bg-black/40 backdrop-blur-3xl max-w-xl">
                    <h3 className="text-3xl font-bold mb-4">{section.title} Terminal</h3>
                    <p className="text-muted-foreground mb-8">This immersive experience is being initialized by Prime. Please check back shortly.</p>
                    <div className="flex justify-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                    </div>
                  </div>
                )}

                {/* Phase 5: Auth Morph (Seamless Conversion) */}
                {!isFocused && section.id === 'broadcast' && isSectionActive && (
                  <motion.div 
                    className="absolute top-[60%] left-0 right-0 z-50 pointer-events-auto"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <AuthMorphOverlay />
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Atmosphere Particles */}
        <motion.div className="absolute inset-0 pointer-events-none" style={{ opacity: glowOpacity }}>
           <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] mix-blend-screen" />
           <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] mix-blend-screen" />
        </motion.div>

        {/* Scroll Prompt */}
        {!isFocused && (
          <motion.div 
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50"
            animate={{ opacity: activeSection === CITY_SECTIONS.length - 1 ? 0 : 1 }}
          >
            <span className="text-xs uppercase tracking-[0.2em]">Explore the City</span>
            <ArrowDown className="w-4 h-4 animate-bounce" />
          </motion.div>
        )}
      </div>
    </div>
  );
}
