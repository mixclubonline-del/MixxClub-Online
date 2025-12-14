import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Users, Star, CheckCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Engineer {
  id: string;
  name: string;
  specialty: string;
  avatar: string;
  rating: number;
  matchScore: number;
}

const DEMO_ENGINEERS: Engineer[] = [
  { id: '1', name: 'Marcus Cole', specialty: 'Hip-Hop Mixing', avatar: '🎧', rating: 4.9, matchScore: 96 },
  { id: '2', name: 'Sarah Chen', specialty: 'Vocal Production', avatar: '🎤', rating: 4.8, matchScore: 91 },
  { id: '3', name: 'DJ Phantom', specialty: 'Trap Beats', avatar: '🔊', rating: 4.7, matchScore: 87 },
  { id: '4', name: 'Nina Williams', specialty: 'R&B Mastering', avatar: '💿', rating: 4.9, matchScore: 82 },
  { id: '5', name: 'Alex Rivera', specialty: 'EDM Production', avatar: '🎹', rating: 4.6, matchScore: 78 },
];

export const EngineerMatchingDemo = () => {
  const [isMatching, setIsMatching] = useState(false);
  const [matchedEngineers, setMatchedEngineers] = useState<Engineer[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const startMatching = () => {
    setIsMatching(true);
    setMatchedEngineers([]);
    setCurrentIndex(0);
  };

  useEffect(() => {
    if (isMatching && currentIndex < DEMO_ENGINEERS.length) {
      const timer = setTimeout(() => {
        setMatchedEngineers(prev => [...prev, DEMO_ENGINEERS[currentIndex]]);
        setCurrentIndex(prev => prev + 1);
      }, 600);
      return () => clearTimeout(timer);
    } else if (currentIndex >= DEMO_ENGINEERS.length) {
      setIsMatching(false);
    }
  }, [isMatching, currentIndex]);

  const reset = () => {
    setMatchedEngineers([]);
    setCurrentIndex(0);
    setIsMatching(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass-near rounded-2xl p-6 border border-[hsl(var(--glass-border))] hover:border-[hsl(var(--glass-border-glow))] transition-all overflow-hidden relative"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[hsl(210,100%,60%)] to-[hsl(270,100%,60%)] flex items-center justify-center">
          <Users className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold">AI Engineer Matching</h3>
          <p className="text-sm text-muted-foreground">Find your perfect collaborator</p>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-[220px]">
        {matchedEngineers.length === 0 && !isMatching ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-full py-8"
          >
            <motion.div
              className="relative w-24 h-24 mb-4"
              whileHover={{ scale: 1.05 }}
            >
              {/* Orbiting avatars */}
              {['🎧', '🎤', '🔊'].map((emoji, i) => (
                <motion.div
                  key={i}
                  className="absolute w-8 h-8 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent-blue))] flex items-center justify-center text-sm"
                  animate={{
                    x: Math.cos((i / 3) * Math.PI * 2 + Date.now() / 2000) * 35,
                    y: Math.sin((i / 3) * Math.PI * 2 + Date.now() / 2000) * 35,
                  }}
                  style={{
                    left: '50%',
                    top: '50%',
                    marginLeft: '-16px',
                    marginTop: '-16px',
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                >
                  {emoji}
                </motion.div>
              ))}
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-[hsl(var(--primary))]" />
              </div>
            </motion.div>
            <Button onClick={startMatching} className="glass-pill">
              <Users className="w-4 h-4 mr-2" />
              Find Engineers
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {/* Matching animation */}
            {isMatching && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-[hsl(var(--primary))] mb-4"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Sparkles className="w-4 h-4" />
                </motion.div>
                <span className="text-sm">AI matching in progress...</span>
              </motion.div>
            )}

            {/* Matched engineers */}
            <AnimatePresence>
              {matchedEngineers.map((engineer, index) => (
                <motion.div
                  key={engineer.id}
                  initial={{ opacity: 0, x: -30, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 30 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center justify-between glass-pill rounded-xl p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[hsl(var(--primary)/0.3)] to-[hsl(var(--accent-blue)/0.3)] flex items-center justify-center text-xl">
                      {engineer.avatar}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{engineer.name}</div>
                      <div className="text-xs text-muted-foreground">{engineer.specialty}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <motion.div
                      className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent-cyan))]"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, type: 'spring' }}
                    >
                      {engineer.matchScore}%
                    </motion.div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                      {engineer.rating}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Complete state */}
            {!isMatching && matchedEngineers.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="pt-4"
              >
                <div className="flex items-center gap-2 text-green-500 mb-3">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">5 engineers matched!</span>
                </div>
                <Button onClick={reset} variant="outline" className="w-full glass-pill">
                  Search Again
                </Button>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};
