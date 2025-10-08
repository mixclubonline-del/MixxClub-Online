import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Music, Headphones, Sparkles, Activity, 
  Trophy, Users, ShoppingBag, Settings 
} from "lucide-react";

interface Node {
  id: string;
  label: string;
  route: string;
  icon: any;
  angle: number;
  color: string;
  activeUsers: number;
  features: string[];
  bubbles: { x: number; y: number; size: number; delay: number }[];
}

// Generate random internal bubbles for each node
const generateBubbles = () => {
  const count = 3 + Math.floor(Math.random() * 3); // 3-5 bubbles
  return Array.from({ length: count }, () => ({
    x: 20 + Math.random() * 60, // 20-80% from left
    y: 20 + Math.random() * 60, // 20-80% from top
    size: 12 + Math.random() * 10, // 12-22px
    delay: Math.random() * 2
  }));
};

// Calculate color based on angle (blue on left, purple on right)
const getNodeColor = (angle: number): string => {
  // Normalize angle to 0-360
  const normalizedAngle = ((angle % 360) + 360) % 360;
  
  // Left side (270-90 via 0): Blue tones
  // Right side (90-270): Purple/magenta tones
  if (normalizedAngle >= 270 || normalizedAngle <= 90) {
    // Blue spectrum
    const blueHue = 200 + (normalizedAngle <= 90 ? normalizedAngle : normalizedAngle - 360) * 0.2;
    return `hsl(${blueHue}, 80%, 60%)`;
  } else {
    // Purple spectrum
    const purpleHue = 260 + (normalizedAngle - 90) * 0.2;
    return `hsl(${purpleHue}, 70%, 60%)`;
  }
};

const nodes: Node[] = [
  { id: 'artist', label: 'Artist', route: '/artist', icon: Music, angle: 0, color: getNodeColor(0), activeUsers: 42, features: ['Upload Tracks', 'AI Mastering', 'Collaboration'], bubbles: generateBubbles() },
  { id: 'engineer', label: 'Engineer', route: '/engineer', icon: Headphones, angle: 45, color: getNodeColor(45), activeUsers: 28, features: ['Mix Projects', 'Presets', 'Stem Access'], bubbles: generateBubbles() },
  { id: 'ai-studio', label: 'AI Studio', route: '/ai-studio', icon: Sparkles, angle: 90, color: getNodeColor(90), activeUsers: 156, features: ['AI Mixing', 'Smart EQ', 'Auto-Master'], bubbles: generateBubbles() },
  { id: 'pulse', label: 'The Pulse', route: '/pulse', icon: Activity, angle: 135, color: getNodeColor(135), activeUsers: 89, features: ['Live Feed', 'Trending', 'Discover'], bubbles: generateBubbles() },
  { id: 'arena', label: 'Mixx Arena', route: '/arena', icon: Trophy, angle: 180, color: getNodeColor(180), activeUsers: 67, features: ['Competitions', 'Voting', 'Prizes'], bubbles: generateBubbles() },
  { id: 'crowd', label: 'The Crowd', route: '/crowd', icon: Users, angle: 225, color: getNodeColor(225), activeUsers: 234, features: ['Community', 'Forums', 'Events'], bubbles: generateBubbles() },
  { id: 'marketplace', label: 'Marketplace', route: '/marketplace', icon: ShoppingBag, angle: 270, color: getNodeColor(270), activeUsers: 45, features: ['Buy Presets', 'Sell Work', 'Licenses'], bubbles: generateBubbles() },
  { id: 'admin', label: 'Admin', route: '/admin', icon: Settings, angle: 315, color: getNodeColor(315), activeUsers: 3, features: ['Dashboard', 'Analytics', 'Management'], bubbles: generateBubbles() },
];

export default function NeuralHub() {
  const centerX = 50; // percentage
  const centerY = 50; // percentage
  const radius = 38; // percentage of viewport
  
  return (
    <section className="relative h-[80vh] w-full overflow-hidden bg-gradient-radial from-[#0f0a2a] via-[#1a0a2a] to-[#0a0a1a]">
      {/* SVG Background with connections */}
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="centerGlow" cx="50%" cy="50%">
            <stop offset="0%" stopColor="rgba(139, 92, 246, 0.6)" />
            <stop offset="50%" stopColor="rgba(139, 92, 246, 0.3)" />
            <stop offset="100%" stopColor="rgba(139, 92, 246, 0)" />
          </radialGradient>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(139, 92, 246, 0.6)" />
            <stop offset="100%" stopColor="rgba(59, 130, 246, 0.6)" />
          </linearGradient>
        </defs>
        
        {/* Central glow */}
        <motion.circle
          cx={`${centerX}%`}
          cy={`${centerY}%`}
          r="12%"
          fill="url(#centerGlow)"
          animate={{
            r: ["10%", "14%", "10%"],
            opacity: [0.8, 1, 0.8]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Connection lines to nodes */}
        {nodes.map((node) => {
          const angleRad = (node.angle - 90) * (Math.PI / 180);
          const nodeX = centerX + radius * Math.cos(angleRad);
          const nodeY = centerY + radius * Math.sin(angleRad);
          
          return (
            <g key={`connection-${node.id}`}>
              {/* Main connection line - thicker */}
              <motion.line
                x1={`${centerX}%`}
                y1={`${centerY}%`}
                x2={`${nodeX}%`}
                y2={`${nodeY}%`}
                stroke={node.color}
                strokeWidth="0.5"
                opacity="0.4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1, opacity: [0.4, 0.7, 0.4] }}
                transition={{
                  pathLength: { duration: 1.5, delay: node.angle * 0.01 },
                  opacity: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                }}
                filter={`drop-shadow(0 0 8px ${node.color})`}
              />
              
              {/* Traveling light particles */}
              {Array.from({ length: 3 }).map((_, i) => {
                const progress = (i * 0.33);
                
                return (
                  <motion.circle
                    key={`particle-${node.id}-${i}`}
                    cx={`${centerX}%`}
                    cy={`${centerY}%`}
                    r="0.4%"
                    fill={node.color}
                    opacity="0"
                    animate={{
                      cx: [`${centerX}%`, `${nodeX}%`],
                      cy: [`${centerY}%`, `${nodeY}%`],
                      opacity: [0, 1, 1, 0],
                      r: ["0.3%", "0.6%", "0.3%"]
                    }}
                    transition={{
                      duration: 3,
                      delay: i * 1 + node.angle * 0.01,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                );
              })}
            </g>
          );
        })}
      </svg>

      {/* Content Layer */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        {/* Center Hub - Larger and More Prominent */}
        <motion.div
          className="absolute"
          style={{
            left: `${centerX}%`,
            top: `${centerY}%`,
            transform: 'translate(-50%, -50%)'
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
        >
          <motion.div 
            className="relative"
            animate={{
              filter: [
                'drop-shadow(0 0 40px rgba(139, 92, 246, 0.6))',
                'drop-shadow(0 0 80px rgba(139, 92, 246, 0.8))',
                'drop-shadow(0 0 40px rgba(139, 92, 246, 0.6))'
              ]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="w-44 h-44 md:w-52 md:h-52 rounded-full bg-gradient-to-br from-[hsl(var(--primary))]/30 via-[hsl(var(--accent-blue))]/20 to-[hsl(var(--primary))]/30 backdrop-blur-xl border-2 border-[hsl(var(--primary))]/40 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[hsl(var(--primary))] via-[hsl(var(--accent-blue))] to-[hsl(var(--primary))] drop-shadow-[0_0_20px_rgba(139,92,246,0.5)]">
                  Mixxclub
                </h1>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Interactive Nodes - Much Larger with Glass Effect */}
        {nodes.map((node) => {
          const angleRad = (node.angle - 90) * (Math.PI / 180);
          const nodeX = centerX + radius * Math.cos(angleRad);
          const nodeY = centerY + radius * Math.sin(angleRad);
          const Icon = node.icon;
          
          return (
            <motion.div
              key={node.id}
              className="absolute group cursor-pointer"
              style={{
                left: `${nodeX}%`,
                top: `${nodeY}%`,
                transform: 'translate(-50%, -50%)'
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.6,
                delay: node.angle * 0.005,
                type: "spring",
                stiffness: 200
              }}
              whileHover={{ 
                scale: 1.2,
                rotate: 2,
                transition: { duration: 0.3 }
              }}
            >
              <Link to={node.route}>
                {/* Node Circle - Properly sized with Glassmorphism */}
                <motion.div
                  className="relative w-24 h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center backdrop-blur-xl overflow-hidden"
                  style={{
                    border: `3px solid ${node.color}`,
                    background: `radial-gradient(circle at 30% 30%, ${node.color}25, ${node.color}08, transparent)`,
                  }}
                  animate={{
                    boxShadow: [
                      `0 0 30px ${node.color}60, inset 0 0 30px ${node.color}20`,
                      `0 0 50px ${node.color}80, inset 0 0 40px ${node.color}30`,
                      `0 0 30px ${node.color}60, inset 0 0 30px ${node.color}20`
                    ]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  whileHover={{
                    boxShadow: `0 0 60px ${node.color}, inset 0 0 50px ${node.color}40`,
                    borderColor: node.color,
                    filter: 'brightness(1.3)'
                  }}
                >
                  {/* Internal Bubble Clusters */}
                  {node.bubbles.map((bubble, i) => (
                    <motion.div
                      key={`bubble-${i}`}
                      className="absolute rounded-full"
                      style={{
                        left: `${bubble.x}%`,
                        top: `${bubble.y}%`,
                        width: `${bubble.size}px`,
                        height: `${bubble.size}px`,
                        background: `radial-gradient(circle at 30% 30%, ${node.color}60, ${node.color}20)`,
                        border: `1px solid ${node.color}40`
                      }}
                      animate={{
                        y: [0, -8, 0],
                        x: [0, Math.random() * 6 - 3, 0],
                        opacity: [0.4, 0.7, 0.4],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{
                        duration: 4 + Math.random() * 2,
                        delay: bubble.delay,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  ))}
                  
                  {/* Icon */}
                  <Icon 
                    className="w-10 h-10 md:w-12 md:h-12 relative z-10 group-hover:scale-110 transition-transform drop-shadow-[0_0_10px_currentColor]" 
                    style={{ color: node.color }}
                  />
                </motion.div>
                
                {/* Label */}
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <p 
                    className="text-sm md:text-base font-bold drop-shadow-[0_0_8px_currentColor]" 
                    style={{ color: node.color }}
                  >
                    {node.label}
                  </p>
                </div>
                
                {/* Info Panel on Hover */}
                <motion.div
                  className="absolute left-1/2 -translate-x-1/2 top-full mt-16 w-52 p-4 rounded-lg backdrop-blur-xl border opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300 z-50"
                  style={{
                    background: `radial-gradient(circle at top, ${node.color}15, rgba(10, 10, 26, 0.95))`,
                    borderColor: node.color,
                    boxShadow: `0 0 40px ${node.color}40`
                  }}
                >
                  <h3 className="font-bold mb-2 text-lg" style={{ color: node.color }}>
                    {node.label}
                  </h3>
                  <ul className="text-xs text-muted-foreground space-y-1 mb-3">
                    {node.features.map((feature, i) => (
                      <li key={i}>• {feature}</li>
                    ))}
                  </ul>
                  <div className="text-xs font-mono font-bold" style={{ color: node.color }}>
                    {node.activeUsers} active users
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
