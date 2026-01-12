import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface JourneyStep {
  icon: LucideIcon;
  title: string;
  description: string;
  time: string;
}

interface JourneyPathProps {
  steps: JourneyStep[];
  activeStep: number;
  onStepClick: (index: number) => void;
  variant: "artist" | "engineer";
}

const JourneyPath = ({ steps, activeStep, onStepClick, variant }: JourneyPathProps) => {
  const accentColor = variant === "artist" 
    ? "hsl(262 83% 58%)" 
    : "hsl(180 100% 50%)";

  return (
    <div className="relative py-12 px-6">
      {/* Path line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 hidden md:block">
        <div className="h-full bg-gradient-to-b from-transparent via-border to-transparent" />
        <motion.div
          className="absolute top-0 w-full"
          style={{ 
            background: `linear-gradient(to bottom, ${accentColor}, transparent)`,
            height: `${((activeStep + 1) / steps.length) * 100}%`
          }}
          initial={{ height: 0 }}
          animate={{ height: `${((activeStep + 1) / steps.length) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Steps */}
      <div className="max-w-4xl mx-auto space-y-8 md:space-y-16">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === activeStep;
          const isPast = index < activeStep;
          const isFuture = index > activeStep;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative flex items-center gap-8 ${
                index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
              }`}
              onClick={() => onStepClick(index)}
            >
              {/* Milestone marker */}
              <motion.button
                className={`relative z-10 flex-shrink-0 w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all duration-500 cursor-pointer ${
                  isActive
                    ? `border-[${accentColor}] bg-[${accentColor}]/20`
                    : isPast
                    ? "border-primary/50 bg-primary/10"
                    : "border-border bg-card/50"
                }`}
                style={{
                  borderColor: isActive ? accentColor : undefined,
                  backgroundColor: isActive ? `${accentColor}20` : undefined,
                  boxShadow: isActive ? `0 0 30px ${accentColor}40` : undefined,
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className={`w-6 h-6 transition-colors duration-500 ${
                  isActive || isPast ? "text-foreground" : "text-muted-foreground"
                }`} />
                
                {/* Step number */}
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-background border border-border text-xs flex items-center justify-center font-bold">
                  {index + 1}
                </span>
              </motion.button>

              {/* Step content */}
              <motion.div
                className={`flex-1 p-6 rounded-2xl border backdrop-blur-sm transition-all duration-500 ${
                  isActive
                    ? "border-primary/50 bg-card/80"
                    : "border-border/30 bg-card/30"
                } ${isFuture ? "opacity-50" : "opacity-100"}`}
                style={{
                  borderColor: isActive ? `${accentColor}50` : undefined,
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                  <span className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                    {step.time}
                  </span>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default JourneyPath;
