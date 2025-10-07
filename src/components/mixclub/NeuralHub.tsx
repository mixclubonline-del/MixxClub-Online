import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Music, Headphones, Brain, Activity, Swords, Users, Store, Shield } from 'lucide-react';

interface Node {
  id: string;
  label: string;
  route: string;
  icon: typeof Music;
  angle: number;
  color: string;
  activeUsers?: number;
  features?: string[];
}

const nodes: Node[] = [
  { id: 'artist', label: 'Artist Upload Hub', route: '/artist', icon: Music, angle: 0, color: 'hsl(var(--primary))', activeUsers: 42, features: ['Upload Tracks', 'Project Manager', 'Stem Splitter'] },
  { id: 'engineer', label: 'Engineer Finder', route: '/engineer', icon: Headphones, angle: 45, color: 'hsl(var(--accent-blue))', activeUsers: 28, features: ['Find Engineers', 'Portfolio', 'Book Sessions'] },
  { id: 'ai-studio', label: 'AI Studio', route: '/ai-studio', icon: Brain, angle: 90, color: 'hsl(var(--accent-cyan))', activeUsers: 156, features: ['AI Mixing', 'Auto-Master', 'Smart EQ'] },
  { id: 'pulse', label: 'The Pulse', route: '/pulse', icon: Activity, angle: 135, color: 'hsl(var(--accent-magenta))', activeUsers: 89, features: ['Live Feed', 'Trends', 'Discoveries'] },
  { id: 'arena', label: 'Mixx Arena', route: '/arena', icon: Swords, angle: 180, color: 'hsl(var(--accent))', activeUsers: 64, features: ['Mix Battles', 'Voting', 'Leaderboards'] },
  { id: 'crowd', label: 'The Crowd', route: '/crowd', icon: Users, angle: 225, color: 'hsl(280 70% 60%)', activeUsers: 213, features: ['Community', 'Forums', 'Collaborations'] },
  { id: 'marketplace', label: 'Marketplace', route: '/marketplace', icon: Store, angle: 270, color: 'hsl(320 70% 60%)', activeUsers: 37, features: ['Presets', 'Templates', 'Services'] },
  { id: 'admin', label: 'Control Center', route: '/admin', icon: Shield, angle: 315, color: 'hsl(200 70% 60%)', activeUsers: 5, features: ['Analytics', 'Settings', 'Management'] },
];

export default function NeuralHub() {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const navigate = useNavigate();

  const centerX = 50;
  const centerY = 50;
  const radius = 32;

  return (
    <section className="relative h-screen w-full overflow-hidden bg-[#0a0a1a]">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent-blue/10" />
      
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
            <stop offset="100%" stopColor="hsl(var(--accent-blue))" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* Connection lines */}
        {nodes.map((node, idx) => {
          const x = centerX + radius * Math.cos((node.angle * Math.PI) / 180);
          const y = centerY + radius * Math.sin((node.angle * Math.PI) / 180);
          
          return (
            <motion.line
              key={`line-${node.id}`}
              x1={centerX}
              y1={centerY}
              x2={x}
              y2={y}
              stroke="url(#lineGradient)"
              strokeWidth="0.15"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: hoveredNode === node.id ? 0.8 : 0.4 }}
              transition={{ duration: 1, delay: idx * 0.1 }}
            />
          );
        })}

        {/* Satellite bubbles along connection lines */}
        {nodes.map((node) => {
          const nodeX = centerX + radius * Math.cos((node.angle * Math.PI) / 180);
          const nodeY = centerY + radius * Math.sin((node.angle * Math.PI) / 180);
          const satellites = node.activeUsers ? Math.min(Math.floor(node.activeUsers / 20), 3) : 0;
          
          return [...Array(satellites)].map((_, i) => {
            const progress = 0.3 + (i * 0.2);
            const satX = centerX + (nodeX - centerX) * progress;
            const satY = centerY + (nodeY - centerY) * progress;
            
            return (
              <motion.circle
                key={`sat-${node.id}-${i}`}
                cx={satX}
                cy={satY}
                r="0.4"
                fill={node.color}
                opacity="0.5"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.5 }}
                transition={{ duration: 0.5, delay: 1 + i * 0.1 }}
              />
            );
          });
        })}

        {/* Center node */}
        <motion.circle
          cx={centerX}
          cy={centerY}
          r="4"
          fill="url(#centerGradient)"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
        />
        
        <defs>
          <radialGradient id="centerGradient">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--accent-blue))" />
          </radialGradient>
        </defs>
      </svg>

      {/* Center label */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none z-10"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent-blue))]">
          MixClub Online
        </h1>
        <p className="text-sm text-muted-foreground mt-2">The Neural Network</p>
      </motion.div>

      {/* Node elements */}
      {nodes.map((node, idx) => {
        const x = 50 + 32 * Math.cos((node.angle * Math.PI) / 180);
        const y = 50 + 32 * Math.sin((node.angle * Math.PI) / 180);
        const isHovered = hoveredNode === node.id;

        return (
          <motion.div
            key={node.id}
            className="absolute pointer-events-auto cursor-pointer"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              transform: 'translate(-50%, -50%)',
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: isHovered ? 1.15 : 1 }}
            transition={{ duration: 0.6, delay: idx * 0.1 }}
            onMouseEnter={() => setHoveredNode(node.id)}
            onMouseLeave={() => setHoveredNode(null)}
            onClick={() => navigate(node.route)}
          >
            {/* Node circle */}
            <div className="relative">
              <motion.div
                className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center backdrop-blur-sm border-2"
                style={{
                  backgroundColor: isHovered ? node.color : `${node.color}22`,
                  borderColor: node.color,
                  boxShadow: isHovered ? `0 0 30px ${node.color}` : `0 0 10px ${node.color}66`,
                }}
                animate={{
                  boxShadow: isHovered ? `0 0 40px ${node.color}` : `0 0 10px ${node.color}66`,
                }}
              >
                <node.icon className="w-8 h-8 md:w-10 md:h-10" style={{ color: 'white' }} />
              </motion.div>

              {/* Info panel on hover */}
              {isHovered && (
                <motion.div
                  className="absolute top-full mt-4 left-1/2 -translate-x-1/2 bg-background/95 backdrop-blur-md border border-border rounded-lg p-4 w-56 z-20"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <h3 className="font-semibold text-sm mb-2">{node.label}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <Users className="w-3 h-3" />
                    <span>{node.activeUsers} active</span>
                  </div>
                  {node.features && (
                    <ul className="space-y-1">
                      {node.features.map((feature, i) => (
                        <li key={i} className="text-xs text-muted-foreground">• {feature}</li>
                      ))}
                    </ul>
                  )}
                </motion.div>
              )}

              {/* Label below node */}
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <p className="text-xs font-medium text-foreground">{node.label}</p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </section>
  );
}
