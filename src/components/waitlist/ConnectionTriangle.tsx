import { motion } from 'framer-motion';
import { Mic2, Sliders, Heart } from 'lucide-react';

const nodes = [
  {
    id: 'artist',
    label: 'Artist',
    subtitle: 'Create. Collaborate. Rise.',
    icon: Mic2,
    position: { x: 50, y: 15 },
    color: 'from-primary to-accent-magenta',
    glowColor: 'hsl(var(--primary))',
  },
  {
    id: 'engineer',
    label: 'Engineer',
    subtitle: 'Shape Sound. Build Legacy.',
    icon: Sliders,
    position: { x: 15, y: 75 },
    color: 'from-accent-blue to-accent-cyan',
    glowColor: 'hsl(var(--accent-blue))',
  },
  {
    id: 'fan',
    label: 'Fan',
    subtitle: 'Discover. Support. Earn.',
    icon: Heart,
    position: { x: 85, y: 75 },
    color: 'from-accent-magenta to-primary',
    glowColor: 'hsl(var(--accent-magenta))',
  },
];

export function ConnectionTriangle() {
  return (
    <div className="relative w-full max-w-2xl mx-auto aspect-square">
      {/* Connection Lines SVG */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
        {/* Animated connection lines */}
        <motion.line
          x1="50" y1="20" x2="15" y2="75"
          stroke="url(#gradient1)"
          strokeWidth="0.3"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.6 }}
          transition={{ delay: 0.5, duration: 1.5, ease: "easeInOut" }}
        />
        <motion.line
          x1="15" y1="75" x2="85" y2="75"
          stroke="url(#gradient2)"
          strokeWidth="0.3"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.6 }}
          transition={{ delay: 1, duration: 1.5, ease: "easeInOut" }}
        />
        <motion.line
          x1="85" y1="75" x2="50" y2="20"
          stroke="url(#gradient3)"
          strokeWidth="0.3"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.6 }}
          transition={{ delay: 1.5, duration: 1.5, ease: "easeInOut" }}
        />
        
        {/* Energy pulse on lines */}
        <motion.circle
          r="1"
          fill="hsl(var(--primary))"
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 1, 0],
            cx: [50, 32.5, 15],
            cy: [20, 47.5, 75],
          }}
          transition={{ delay: 2.5, duration: 2, repeat: Infinity, repeatDelay: 3 }}
        />
        <motion.circle
          r="1"
          fill="hsl(var(--accent-blue))"
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 1, 0],
            cx: [15, 50, 85],
            cy: [75, 75, 75],
          }}
          transition={{ delay: 3.5, duration: 2, repeat: Infinity, repeatDelay: 3 }}
        />
        <motion.circle
          r="1"
          fill="hsl(var(--accent-magenta))"
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 1, 0],
            cx: [85, 67.5, 50],
            cy: [75, 47.5, 20],
          }}
          transition={{ delay: 4.5, duration: 2, repeat: Infinity, repeatDelay: 3 }}
        />
        
        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--accent-blue))" />
          </linearGradient>
          <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--accent-blue))" />
            <stop offset="100%" stopColor="hsl(var(--accent-magenta))" />
          </linearGradient>
          <linearGradient id="gradient3" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--accent-magenta))" />
            <stop offset="100%" stopColor="hsl(var(--primary))" />
          </linearGradient>
        </defs>
      </svg>

      {/* Center text */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2, duration: 0.8 }}
      >
        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">The</p>
        <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary via-accent-magenta to-accent-blue bg-clip-text text-transparent">
          Connection
        </h2>
      </motion.div>

      {/* Triangle Nodes */}
      {nodes.map((node, index) => (
        <motion.div
          key={node.id}
          className="absolute"
          style={{
            left: `${node.position.x}%`,
            top: `${node.position.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 + index * 0.3, duration: 0.6, type: "spring" }}
        >
          {/* Glow effect */}
          <motion.div
            className="absolute inset-0 rounded-full blur-xl"
            style={{ backgroundColor: node.glowColor }}
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
          />
          
          {/* Node circle */}
          <div className={`relative w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br ${node.color} p-[2px] group cursor-pointer`}>
            <div className="w-full h-full rounded-full bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center transition-all duration-300 group-hover:bg-background/70">
              <node.icon className="w-6 h-6 md:w-8 md:h-8 text-foreground mb-1" />
              <span className="text-xs md:text-sm font-semibold text-foreground">{node.label}</span>
            </div>
          </div>
          
          {/* Subtitle on hover */}
          <motion.p
            className="absolute top-full mt-2 left-1/2 -translate-x-1/2 text-xs text-muted-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
          >
            {node.subtitle}
          </motion.p>
        </motion.div>
      ))}
    </div>
  );
}
