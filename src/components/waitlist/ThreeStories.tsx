import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Mic2, Sliders, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const stories = [
  {
    id: 'artist',
    icon: Mic2,
    headline: '47 songs on your laptop deserve better.',
    story: "You've poured your heart into every track. But they sit there, unmixed, unheard. Not because you lack talent—because you lack the connection to someone who can elevate your sound.",
    promise: "Find engineers who care about your vision as much as you do.",
    color: 'from-primary to-accent-magenta',
    bgGlow: 'bg-primary/20',
  },
  {
    id: 'engineer',
    icon: Sliders,
    headline: "You've mixed for legends. Time for the next generation.",
    story: "Whether you're a retired pro or a working professional, your skills deserve more than gathering dust. Artists worldwide are searching for exactly what you offer—the human touch that no AI can replicate.",
    promise: "A new stream of revenue, income, and connection to artists globally.",
    color: 'from-accent-blue to-accent-cyan',
    bgGlow: 'bg-accent-blue/20',
  },
  {
    id: 'fan',
    icon: Heart,
    headline: 'You knew them before anyone. Here, that counts.',
    story: "You discover artists before they blow up. You support from day one. On MixClub, your early support is recognized, rewarded, and remembered.",
    promise: "Be part of the premiere. Watch music come to life.",
    color: 'from-accent-magenta to-primary',
    bgGlow: 'bg-accent-magenta/20',
  },
];

export function ThreeStories() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % stories.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused]);

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
    <div 
      className="relative w-full max-w-3xl mx-auto"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background glow */}
      <motion.div
        key={activeStory.id + '-glow'}
        className={`absolute inset-0 ${activeStory.bgGlow} blur-3xl rounded-full opacity-30`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      />

      {/* Story Card */}
      <div className="relative min-h-[320px] md:min-h-[280px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStory.id}
            className="text-center px-6 md:px-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            {/* Icon */}
            <motion.div
              className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br ${activeStory.color} p-[2px] mb-6`}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                <activeStory.icon className="w-8 h-8 text-foreground" />
              </div>
            </motion.div>

            {/* Headline */}
            <h3 className={`text-xl md:text-2xl lg:text-3xl font-bold mb-4 bg-gradient-to-r ${activeStory.color} bg-clip-text text-transparent`}>
              {activeStory.headline}
            </h3>

            {/* Story */}
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-6 max-w-2xl mx-auto">
              {activeStory.story}
            </p>

            {/* Promise */}
            <p className="text-foreground font-medium text-sm md:text-base">
              {activeStory.promise}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-4 mt-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePrev}
          className="rounded-full hover:bg-primary/10"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>

        {/* Dots */}
        <div className="flex gap-2">
          {stories.map((story, index) => (
            <button
              key={story.id}
              onClick={() => {
                setIsPaused(true);
                setActiveIndex(index);
              }}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === activeIndex 
                  ? 'w-8 bg-primary' 
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
            />
          ))}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleNext}
          className="rounded-full hover:bg-primary/10"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
