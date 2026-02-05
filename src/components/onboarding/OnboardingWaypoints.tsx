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
  variant?: 'artist' | 'engineer' | 'producer' | 'fan';
}

export function OnboardingWaypoints({ 
  steps, 
  currentStep,
  variant = 'artist',
}: OnboardingWaypointsProps) {
  const accentColor = 
    variant === 'artist' ? 'primary' : 
    variant === 'engineer' ? 'accent' : 
    variant === 'producer' ? 'amber' : 
    'pink';
  
  return (
    <div className="absolute bottom-32 max-md:bottom-20 left-0 right-0 px-8 max-md:px-4">
      <div className="max-w-2xl mx-auto max-md:max-w-full">
        {/* Path line connecting waypoints */}
        <div className="relative flex items-center justify-between">
          {/* Background line */}
          <div className="absolute left-0 right-0 h-0.5 bg-white/10" />
          
          {/* Progress line */}
          <motion.div
            className="absolute left-0 h-0.5"
            initial={{ width: '0%' }}
            animate={{ 
              width: `${(currentStep / (steps.length - 1)) * 100}%` 
            }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{
              backgroundColor: 
                variant === 'artist' ? 'hsl(var(--primary))' : 
                variant === 'engineer' ? 'hsl(var(--accent))' : 
                variant === 'producer' ? 'hsl(45, 90%, 50%)' : 
                'hsl(330, 80%, 60%)',
              boxShadow: variant === 'artist' 
                ? '0 0 20px hsl(var(--primary) / 0.5)' 
                : variant === 'engineer'
                  ? '0 0 20px hsl(var(--accent) / 0.5)'
                  : variant === 'producer'
                    ? '0 0 20px hsl(45 90% 50% / 0.5)'
                    : '0 0 20px hsl(330 80% 60% / 0.5)',
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
                  className="w-10 h-10 max-md:w-8 max-md:h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300"
                  style={{
                    backgroundColor: isComplete 
                      ? (variant === 'artist' ? 'hsl(var(--primary))' : 
                         variant === 'engineer' ? 'hsl(var(--accent))' : 
                         variant === 'producer' ? 'hsl(45, 90%, 50%)' : 
                         'hsl(330, 80%, 60%)')
                      : isActive 
                        ? (variant === 'artist' ? 'hsl(var(--primary) / 0.2)' : 
                           variant === 'engineer' ? 'hsl(var(--accent) / 0.2)' : 
                           variant === 'producer' ? 'hsl(45 90% 50% / 0.2)' : 
                           'hsl(330 80% 60% / 0.2)')
                        : 'hsl(var(--background) / 0.5)',
                    borderColor: isComplete || isActive
                      ? (variant === 'artist' ? 'hsl(var(--primary))' : 
                         variant === 'engineer' ? 'hsl(var(--accent))' : 
                         variant === 'producer' ? 'hsl(45, 90%, 50%)' : 
                         'hsl(330, 80%, 60%)')
                      : 'hsl(var(--foreground) / 0.2)',
                  }}
                  animate={isActive ? {
                    boxShadow: [
                      `0 0 0 0 ${
                        variant === 'artist' ? 'hsl(var(--primary) / 0.4)' : 
                        variant === 'engineer' ? 'hsl(var(--accent) / 0.4)' : 
                        variant === 'producer' ? 'hsl(45 90% 50% / 0.4)' : 
                        'hsl(330 80% 60% / 0.4)'
                      }`,
                      `0 0 0 12px ${
                        variant === 'artist' ? 'hsl(var(--primary) / 0)' : 
                        variant === 'engineer' ? 'hsl(var(--accent) / 0)' : 
                        variant === 'producer' ? 'hsl(45 90% 50% / 0)' : 
                        'hsl(330 80% 60% / 0)'
                      }`,
                    ],
                  } : {}}
                  transition={{
                    duration: 1.5,
                    repeat: isActive ? Infinity : 0,
                    ease: 'easeOut',
                  }}
                >
                  {isComplete ? (
                    <CheckCircle className="w-5 h-5 max-md:w-4 max-md:h-4 text-primary-foreground" />
                  ) : (
                    <Icon className={`w-5 h-5 max-md:w-4 max-md:h-4 ${
                      isActive 
                        ? (variant === 'artist' ? 'text-primary' : 
                           variant === 'engineer' ? 'text-accent' : 
                           variant === 'producer' ? 'text-amber-500' : 
                           'text-pink-500')
                        : 'text-white/50'
                    }`} />
                  )}
                </motion.div>
                
                {/* Waypoint label - appears on hover/active */}
                <motion.span
                  className={`
                    absolute -bottom-8 max-md:-bottom-6 whitespace-nowrap text-xs max-md:text-[10px] font-medium
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
