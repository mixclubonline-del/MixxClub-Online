import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

interface WaypointStep {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface OnboardingWaypointsProps {
  steps: WaypointStep[];
  currentStep: number;
  variant?: 'artist' | 'engineer';
}

export function OnboardingWaypoints({ 
  steps, 
  currentStep,
  variant = 'artist',
}: OnboardingWaypointsProps) {
  const accentColor = variant === 'artist' ? 'primary' : 'accent';
  
  return (
    <div className="absolute bottom-32 left-0 right-0 px-8">
      <div className="max-w-2xl mx-auto">
        {/* Path line connecting waypoints */}
        <div className="relative flex items-center justify-between">
          {/* Background line */}
          <div className="absolute left-0 right-0 h-0.5 bg-white/10" />
          
          {/* Progress line */}
          <motion.div
            className={`absolute left-0 h-0.5 bg-${accentColor}`}
            initial={{ width: '0%' }}
            animate={{ 
              width: `${(currentStep / (steps.length - 1)) * 100}%` 
            }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{
              boxShadow: variant === 'artist' 
                ? '0 0 20px hsl(var(--primary) / 0.5)' 
                : '0 0 20px hsl(var(--accent) / 0.5)',
            }}
          />
          
          {/* Waypoint markers */}
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isComplete = index < currentStep;
            
            return (
              <motion.div
                key={step.id}
                className="relative z-10 flex flex-col items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {/* Waypoint circle */}
                <motion.div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    border-2 transition-all duration-300
                    ${isComplete 
                      ? `bg-${accentColor} border-${accentColor}` 
                      : isActive 
                        ? `bg-${accentColor}/20 border-${accentColor}` 
                        : 'bg-background/50 border-white/20'}
                  `}
                  animate={isActive ? {
                    boxShadow: [
                      `0 0 0 0 hsl(var(--${accentColor}) / 0.4)`,
                      `0 0 0 12px hsl(var(--${accentColor}) / 0)`,
                    ],
                  } : {}}
                  transition={{
                    duration: 1.5,
                    repeat: isActive ? Infinity : 0,
                    ease: 'easeOut',
                  }}
                >
                  {isComplete ? (
                    <CheckCircle className="w-5 h-5 text-primary-foreground" />
                  ) : (
                    <Icon className={`w-5 h-5 ${
                      isActive ? `text-${accentColor}` : 'text-white/50'
                    }`} />
                  )}
                </motion.div>
                
                {/* Waypoint label - appears on hover/active */}
                <motion.span
                  className={`
                    absolute -bottom-8 whitespace-nowrap text-xs font-medium
                    ${isActive ? 'text-white' : 'text-white/50'}
                  `}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isActive || isComplete ? 1 : 0.5 }}
                >
                  {step.title}
                </motion.span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
