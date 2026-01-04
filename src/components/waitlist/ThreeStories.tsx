import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Mic2, Sliders, Heart, ChevronLeft, ChevronRight, Music, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';

const stories = [
  {
    id: 'rapper',
    icon: Mic2,
    role: 'Rapper',
    headline: 'Your words deserve production.',
    story: "You've got bars that hit different. Verses that tell your truth. But raw vocals on a basic beat don't show what you're capable of. You need that sound.",
    promise: "Connect with producers and engineers who bring your vision to life.",
    color: 'from-primary to-accent-magenta',
    bgGlow: 'bg-primary/20',
    bgImage: '/assets/promo/studio-console-hero.jpg',
  },
  {
    id: 'producer',
    icon: Music,
    role: 'Producer',
    headline: 'Your beats deserve voices.',
    story: "You craft soundscapes that shake the room. But beats without artists are just instrumentals. Somewhere, a rapper is searching for exactly your sound.",
    promise: "Find the voices that complete your vision.",
    color: 'from-accent-magenta to-accent-blue',
    bgGlow: 'bg-accent-magenta/20',
    bgImage: '/assets/promo/before-after-master.jpg',
  },
  {
    id: 'engineer',
    icon: Sliders,
    role: 'Engineer',
    headline: "You've mixed for legends. Time for the next generation.",
    story: "Whether you're a retired pro or a working professional, your skills deserve more than gathering dust. Artists worldwide are searching for exactly what you offer.",
    promise: "A new stream of revenue and connection to artists globally.",
    color: 'from-accent-blue to-accent-cyan',
    bgGlow: 'bg-accent-blue/20',
    bgImage: '/assets/promo/webrtc-collaboration.jpg',
  },
  {
    id: 'dj',
    icon: Radio,
    role: 'DJ',
    headline: 'Break the next hit before anyone else.',
    story: "You have the ear. You know what's next before the world does. On MixClub, you get first access to tracks being crafted by tomorrow's stars.",
    promise: "Premiere exclusive tracks and build your reputation.",
    color: 'from-accent-cyan to-primary',
    bgGlow: 'bg-accent-cyan/20',
    bgImage: '/assets/prime-studio-main.jpg',
  },
  {
    id: 'fan',
    icon: Heart,
    role: 'Fan',
    headline: 'You knew them before anyone. Here, that counts.',
    story: "You discover artists before they blow up. You support from day one. On MixClub, your early support is recognized, rewarded, and remembered.",
    promise: "Be part of the premiere. Watch music come to life.",
    color: 'from-primary to-accent-magenta',
    bgGlow: 'bg-accent-magenta/20',
    bgImage: '/assets/prime-launch-hero.png',
  },
];

export function ThreeStories() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % stories.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused]);

  // Audio-reactive pulse simulation
  useEffect(() => {
    const pulseInterval = setInterval(() => {
      setPulse(true);
      setTimeout(() => setPulse(false), 200);
    }, 2000);
    return () => clearInterval(pulseInterval);
  }, []);

  const handlePrev = () => {
    setIsPaused(true);
    setActiveIndex((prev) => (prev - 1 + stories.length) % stories.length);
  };

  const handleNext = () => {
    setIsPaused(true);
    setActiveIndex((prev) => (prev + 1) % stories.length);
  };

  const activeStory = stories[activeIndex];

  return (
    <section className="relative w-full py-24 px-6 overflow-hidden">
      {/* Section Header */}
      <div className="text-center mb-16">
        <motion.h2 
          className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Everyone Has a Story
        </motion.h2>
        <motion.p 
          className="text-muted-foreground text-lg max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          No matter your role in hip-hop, MixClub connects you to your people.
        </motion.p>
      </div>

      <div 
        className="relative max-w-5xl mx-auto"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Background glow - enhanced */}
        <motion.div
          key={activeStory.id + '-glow'}
          className={`absolute inset-0 ${activeStory.bgGlow} blur-[100px] rounded-full opacity-40`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: pulse ? 0.6 : 0.4,
            scale: pulse ? 1.1 : 1,
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        />

        {/* Story Card - Enhanced with full background */}
        <div className="relative min-h-[400px] md:min-h-[360px] flex items-center justify-center rounded-3xl overflow-hidden">
          {/* Background image with overlay */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStory.id + '-bg'}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.6 }}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${activeStory.bgImage})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/70" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50" />
            </motion.div>
          </AnimatePresence>

          {/* Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStory.id}
              className="relative z-10 text-center px-8 md:px-16 py-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
            >
              {/* Role Badge */}
              <motion.div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${activeStory.color} mb-6`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                  scale: pulse ? 1.05 : 1, 
                  opacity: 1,
                }}
                transition={{ delay: 0.1, type: "spring" }}
              >
                <activeStory.icon className="w-4 h-4 text-foreground" />
                <span className="text-sm font-semibold text-foreground">{activeStory.role}</span>
              </motion.div>

              {/* Headline */}
              <h3 className={`text-2xl md:text-3xl lg:text-4xl font-bold mb-6 bg-gradient-to-r ${activeStory.color} bg-clip-text text-transparent`}>
                {activeStory.headline}
              </h3>

              {/* Story */}
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-8 max-w-2xl mx-auto">
                {activeStory.story}
              </p>

              {/* Promise */}
              <motion.p 
                className="text-foreground font-semibold text-lg"
                animate={{ 
                  textShadow: pulse ? '0 0 20px hsl(var(--primary))' : '0 0 0px transparent'
                }}
              >
                {activeStory.promise}
              </motion.p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation - Enhanced */}
        <div className="flex items-center justify-center gap-6 mt-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrev}
            className="rounded-full hover:bg-primary/10 border border-primary/20"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          {/* Role indicators instead of just dots */}
          <div className="flex gap-3">
            {stories.map((story, index) => {
              const Icon = story.icon;
              return (
                <button
                  key={story.id}
                  onClick={() => {
                    setIsPaused(true);
                    setActiveIndex(index);
                  }}
                  className={`
                    flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300
                    ${index === activeIndex 
                      ? `bg-gradient-to-r ${story.color} shadow-[0_0_20px_hsl(var(--primary)/0.5)]` 
                      : 'bg-muted/20 hover:bg-muted/40 border border-muted-foreground/20'
                    }
                  `}
                  title={story.role}
                >
                  <Icon className={`w-4 h-4 ${index === activeIndex ? 'text-foreground' : 'text-muted-foreground'}`} />
                </button>
              );
            })}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleNext}
            className="rounded-full hover:bg-primary/10 border border-primary/20"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Progress bar */}
        <div className="mt-6 max-w-md mx-auto">
          <div className="h-1 bg-muted/20 rounded-full overflow-hidden">
            <motion.div
              className={`h-full bg-gradient-to-r ${activeStory.color}`}
              initial={{ width: '0%' }}
              animate={{ width: isPaused ? undefined : '100%' }}
              transition={{ duration: 6, ease: 'linear' }}
              key={activeIndex}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
