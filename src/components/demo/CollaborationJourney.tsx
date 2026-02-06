import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Upload, Brain, Users, Headphones, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PrimeCharacter } from './PrimeCharacter';
import artistUploadImg from '@/assets/promo/artist-upload-cloud.jpg';
import engineerWorkspaceImg from '@/assets/promo/engineer-workspace-hero.jpg';

interface CollaborationJourneyProps {
  amplitude: number;
  bass: number;
  isPlaying: boolean;
  primeImage?: string;
}

const JOURNEY_STEPS = [
  { id: 'upload', icon: Upload, label: 'Artist Uploads', color: 'from-cyan-500 to-blue-600' },
  { id: 'analyze', icon: Brain, label: 'AI Analyzes', color: 'from-primary to-purple-600' },
  { id: 'match', icon: Users, label: 'Match Found', color: 'from-purple-500 to-pink-600' },
  { id: 'collab', icon: Headphones, label: 'Collaboration', color: 'from-pink-500 to-rose-600' },
  { id: 'master', icon: Sparkles, label: 'Mastered!', color: 'from-amber-500 to-orange-600' },
];

export const CollaborationJourney = ({ amplitude, bass, isPlaying, primeImage }: CollaborationJourneyProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepProgress, setStepProgress] = useState(0);

  // Auto-advance through steps
  useEffect(() => {
    if (!isPlaying) return;

    const stepDuration = 2500;
    let progress = 0;
    
    const interval = setInterval(() => {
      progress += 2;
      setStepProgress(progress);
      
      if (progress >= 100) {
        progress = 0;
        setStepProgress(0);
        setCurrentStep(prev => (prev + 1) % JOURNEY_STEPS.length);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Journey Timeline */}
      <div className="relative flex items-center justify-between mb-12">
        {/* Connection line */}
        <div className="absolute left-0 right-0 top-1/2 h-1 bg-muted-foreground/20 -translate-y-1/2" />
        <motion.div 
          className="absolute left-0 top-1/2 h-1 bg-gradient-to-r from-cyan-500 via-primary to-amber-500 -translate-y-1/2"
          style={{ width: `${(currentStep / (JOURNEY_STEPS.length - 1)) * 100}%` }}
          transition={{ duration: 0.5 }}
        />

        {JOURNEY_STEPS.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStep;
          const isComplete = index < currentStep;
          
          return (
            <motion.div
              key={step.id}
              className="relative z-10 flex flex-col items-center"
              animate={{ 
                scale: isActive ? 1.1 : 1,
                y: isActive && isPlaying ? [-2, 2, -2] : 0
              }}
              transition={{ 
                scale: { duration: 0.3 },
                y: { duration: 0.5, repeat: Infinity }
              }}
            >
              <motion.div
                className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-colors ${
                  isActive
                    ? `bg-gradient-to-br ${step.color} border-white shadow-lg`
                    : isComplete
                      ? 'bg-primary/20 border-primary'
                      : 'bg-muted border-muted-foreground/30'
                }`}
                animate={{
                  boxShadow: isActive && isPlaying
                    ? `0 0 ${20 + (bass / 255) * 20}px rgba(139, 92, 246, 0.5)`
                    : 'none'
                }}
              >
                {isComplete ? (
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                ) : (
                  <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-muted-foreground'}`} />
                )}
              </motion.div>
              
              <span className={`mt-2 text-xs font-medium ${
                isActive ? 'text-foreground' : 'text-muted-foreground'
              }`}>
                {step.label}
              </span>

              {/* Progress indicator for active step */}
              {isActive && (
                <motion.div 
                  className="absolute -bottom-4 w-16"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Progress value={stepProgress} className="h-1" />
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Step Detail Cards */}
      <div className="grid grid-cols-3 gap-6">
        {/* Artist Column */}
        <Card className={`overflow-hidden bg-card/50 backdrop-blur border-cyan-500/30 transition-all ${
          currentStep <= 1 ? 'ring-2 ring-cyan-500/50' : ''
        }`}>
          {/* Image Header */}
          <div className="relative h-[120px] overflow-hidden">
            <img
              src={artistUploadImg}
              alt="Artist uploading"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-card/90" />
          </div>

          <div className="p-6 text-center">
            <h3 className="font-bold text-lg mb-2">Artist</h3>
            <p className="text-sm text-muted-foreground">Uploads raw track with vision notes</p>
            
            {/* Waveform visualization */}
            <div className="mt-4 flex gap-0.5 h-8 items-end">
              {[...Array(16)].map((_, i) => (
                <motion.div
                  key={i}
                  className="flex-1 rounded-t bg-cyan-500"
                  animate={{ 
                    height: currentStep === 0 && isPlaying 
                      ? `${20 + Math.sin(Date.now() / 150 + i * 0.5) * 30 + (amplitude / 255) * 50}%`
                      : '20%'
                  }}
                  transition={{ duration: 0.1 }}
                />
              ))}
            </div>
          </div>
        </Card>

        {/* Prime/AI Column */}
        <Card className={`p-6 bg-card/50 backdrop-blur border-primary/30 transition-all ${
          currentStep >= 1 && currentStep <= 2 ? 'ring-2 ring-primary/50' : ''
        }`}>
          <div className="text-center">
            <div className="mb-4">
              <PrimeCharacter 
                bass={bass} 
                amplitude={amplitude} 
                isPlaying={isPlaying && (currentStep === 1 || currentStep === 2)}
                size="sm"
                imageUrl={primeImage}
              />
            </div>
            <h3 className="font-bold text-lg mb-2">Prime AI</h3>
            <p className="text-sm text-muted-foreground">Analyzes, matches, guides collaboration</p>
            
            {/* Processing visualization */}
            <div className="mt-4 relative h-8">
              <motion.div
                className="absolute inset-0 flex items-center justify-center gap-1"
                animate={{ opacity: currentStep === 1 ? 1 : 0.3 }}
              >
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-primary"
                    animate={{ 
                      scale: currentStep === 1 && isPlaying ? [1, 1.5, 1] : 1,
                      opacity: currentStep === 1 ? [0.3, 1, 0.3] : 0.3
                    }}
                    transition={{ 
                      duration: 0.6, 
                      repeat: Infinity,
                      delay: i * 0.1
                    }}
                  />
                ))}
              </motion.div>
              
              {currentStep === 2 && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </motion.div>
              )}
            </div>
          </div>
        </Card>

        {/* Engineer Column */}
        <Card className={`overflow-hidden bg-card/50 backdrop-blur border-purple-500/30 transition-all ${
          currentStep >= 3 ? 'ring-2 ring-purple-500/50' : ''
        }`}>
          {/* Image Header */}
          <div className="relative h-[120px] overflow-hidden">
            <img
              src={engineerWorkspaceImg}
              alt="Engineer workspace"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-card/90" />
          </div>

          <div className="p-6 text-center">
            <h3 className="font-bold text-lg mb-2">Engineer</h3>
            <p className="text-sm text-muted-foreground">Mixes, masters, delivers professional sound</p>
            
            {/* Output waveform */}
            <div className="mt-4 flex gap-0.5 h-8 items-end">
              {[...Array(16)].map((_, i) => (
                <motion.div
                  key={i}
                  className="flex-1 rounded-t bg-gradient-to-t from-purple-500 to-pink-500"
                  animate={{ 
                    height: currentStep >= 3 && isPlaying 
                      ? `${30 + Math.sin(Date.now() / 120 + i * 0.4) * 25 + (bass / 255) * 45}%`
                      : currentStep >= 4 ? '60%' : '20%'
                  }}
                  transition={{ duration: 0.1 }}
                />
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Result indicator */}
      {currentStep === 4 && (
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/50 backdrop-blur-sm"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span className="font-bold text-amber-400">Professional Master Complete</span>
            <ArrowRight className="w-5 h-5 text-amber-500" />
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};
