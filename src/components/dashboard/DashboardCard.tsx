import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAudioVisualization } from "@/hooks/useAudioVisualization";
import { useState } from "react";
import { usePrime } from "@/contexts/PrimeContext";
import PrimeGlow from "@/components/prime/PrimeGlow";

interface DashboardCardProps {
  icon: string;
  title: string;
  description: string;
  route: string;
  aiLog: string;
  xpValue?: number;
  xpMax?: number;
  tierLabel?: string;
  gradient: string;
  delay?: number;
}

export default function DashboardCard({
  icon,
  title,
  description,
  route,
  aiLog,
  xpValue,
  xpMax,
  tierLabel,
  gradient,
  delay = 0
}: DashboardCardProps) {
  const { audioData } = useAudioVisualization();
  const { accentColor } = usePrime();
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples(prev => [...prev, { x, y, id }]);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 600);
  };

  return (
    <PrimeGlow intensity={0.5}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="relative"
      >
        <Link to={route}>
        <div 
          onClick={handleClick}
          className="relative group h-full p-6 rounded-xl bg-card/30 backdrop-blur-sm border border-white/5 hover:border-white/20 transition-all duration-300 overflow-hidden"
          style={{
            background: `linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)`,
          }}
        >
          {/* Ripple effects */}
          {ripples.map(ripple => (
            <motion.div
              key={ripple.id}
              className="absolute rounded-full border border-primary/50"
              style={{
                left: ripple.x,
                top: ripple.y,
              }}
              initial={{ width: 0, height: 0, x: 0, y: 0 }}
              animate={{ 
                width: 300, 
                height: 300, 
                x: -150, 
                y: -150,
                opacity: 0 
              }}
              transition={{ duration: 0.6 }}
            />
          ))}

          {/* Gradient border glow */}
          <div 
            className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: `linear-gradient(135deg, ${gradient})`,
              padding: '1px',
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
            }}
          />

          {/* Icon */}
          <div className="text-4xl mb-3">{icon}</div>

          {/* Title */}
          <h3 className="text-xl font-semibold mb-2" style={{ 
            background: `linear-gradient(135deg, ${gradient})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            {title}
          </h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground mb-4">{description}</p>

          {/* Mini waveform */}
          <div className="flex items-end gap-0.5 h-8 mb-3">
            {audioData.slice(0, 12).map((value, i) => (
              <div
                key={i}
                className="flex-1 rounded-sm transition-all duration-100"
                style={{
                  height: `${Math.max(value * 100, 10)}%`,
                  background: `linear-gradient(to top, ${gradient})`,
                  opacity: 0.6
                }}
              />
            ))}
          </div>

          {/* AI Activity Log */}
          <div className="text-xs text-accent-cyan mb-3 font-mono">
            <span className="inline-block w-2 h-2 bg-accent-cyan rounded-full animate-pulse mr-2" />
            {aiLog}
          </div>

          {/* XP Bar if provided */}
          {xpValue && xpMax && tierLabel && (
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">{tierLabel}</span>
                <span className="text-muted-foreground">{xpValue}/{xpMax}</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div 
                  className="h-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${gradient})`,
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(xpValue / xpMax) * 100}%` }}
                  transition={{ duration: 1, delay: delay + 0.3 }}
                />
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="mt-4 text-sm font-medium text-foreground/80 group-hover:text-foreground transition-colors">
            Enter →
          </div>
          </div>
        </Link>
      </motion.div>
    </PrimeGlow>
  );
}
