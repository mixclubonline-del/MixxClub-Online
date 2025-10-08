import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mic2, Headphones, Sparkles, Trophy, Music, Radio, Users, Lightbulb } from 'lucide-react';
import GlassSphere from './GlassSphere';
import ConnectionPath from './ConnectionPath';
import ParticleField from './ParticleField';
import { useMouseParallax } from '@/hooks/useMouseParallax';
import { LucideIcon } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

interface Node {
  id: string;
  label: string;
  route: string;
  icon: LucideIcon;
  angle: number;
  color: string;
  features: string[];
}

const nodes: Node[] = [
  {
    id: 'artist',
    label: 'Artist',
    route: '/artist',
    icon: Mic2,
    angle: 0,
    color: '#6366f1',
    features: ['Upload tracks', 'Collaborate', 'Earn revenue']
  },
  {
    id: 'engineer',
    label: 'Engineer',
    route: '/engineer',
    icon: Headphones,
    angle: 45,
    color: '#8b5cf6',
    features: ['Mix & Master', 'Studio tools', 'Client projects']
  },
  {
    id: 'ai-studio',
    label: 'AI Studio',
    route: '/ai-studio',
    icon: Sparkles,
    angle: 90,
    color: '#d946ef',
    features: ['AI mastering', 'Stem separation', 'Voice synthesis']
  },
  {
    id: 'arena',
    label: 'Arena',
    route: '/arena',
    icon: Trophy,
    angle: 135,
    color: '#ec4899',
    features: ['Battle tracks', 'Compete', 'Win prizes']
  },
  {
    id: 'marketplace',
    label: 'Marketplace',
    route: '/marketplace',
    icon: Music,
    angle: 180,
    color: '#f43f5e',
    features: ['Buy beats', 'Sell services', 'Trade samples']
  },
  {
    id: 'radio',
    label: 'Radio',
    route: '/radio',
    icon: Radio,
    angle: 225,
    color: '#f97316',
    features: ['Live streams', '24/7 music', 'DJ sets']
  },
  {
    id: 'community',
    label: 'Community',
    route: '/feed',
    icon: Users,
    angle: 270,
    color: '#eab308',
    features: ['Connect', 'Share', 'Collaborate']
  },
  {
    id: 'learn',
    label: 'Learn',
    route: '/education',
    icon: Lightbulb,
    angle: 315,
    color: '#22c55e',
    features: ['Tutorials', 'Courses', 'Masterclasses']
  }
];

export default function NeuralHub3D() {
  const mouse = useMouseParallax(0.5);
  
  const centerX = 400;
  const centerY = 400;
  const radius = 280;

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center py-20 px-4">
      {/* Background particle field */}
      <ParticleField />

      {/* Main hub container */}
      <div className="relative" style={{ width: 800, height: 800 }}>
        {/* SVG for connection paths */}
        <svg
          className="absolute inset-0 pointer-events-none"
          viewBox="0 0 800 800"
          style={{ filter: 'drop-shadow(0 0 20px rgba(139, 92, 246, 0.5))' }}
        >
          {nodes.map((node) => {
            const nodeX = centerX + Math.cos((node.angle * Math.PI) / 180) * radius;
            const nodeY = centerY + Math.sin((node.angle * Math.PI) / 180) * radius;
            
            return (
              <ConnectionPath
                key={node.id}
                x1={centerX}
                y1={centerY}
                x2={nodeX}
                y2={nodeY}
                color1="#8b5cf6"
                color2={node.color}
                particleCount={8}
              />
            );
          })}
        </svg>

        {/* Center hub - MIXXCLUB */}
        <Link to="/feed">
          <motion.div
            className="absolute top-1/2 left-1/2 cursor-pointer group"
            style={{
              transform: 'translate(-50%, -50%)',
              willChange: 'transform'
            }}
            whileHover={{ scale: 1.1 }}
            animate={{
              rotateY: mouse.normalizedX * 15,
              rotateX: -mouse.normalizedY * 15,
            }}
            transition={{ type: "spring", stiffness: 100 }}
          >
            {/* Rotating particle rings */}
            <motion.div
              className="absolute inset-0"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              style={{ width: 150, height: 150, left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
            >
              {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-white rounded-full"
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: `rotate(${angle}deg) translateY(-75px)`
                  }}
                  animate={{
                    opacity: [0.3, 1, 0.3],
                    scale: [1, 1.5, 1]
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.2,
                    repeat: Infinity
                  }}
                />
              ))}
            </motion.div>

            <GlassSphere
              size={120}
              color="#8b5cf6"
              label="MIXXCLUB"
              bubbleCount={12}
              glowIntensity={60}
              isCenter={true}
              parallaxX={mouse.normalizedX * 10}
              parallaxY={mouse.normalizedY * 10}
            />
          </motion.div>
        </Link>

        {/* Node spheres */}
        {nodes.map((node, index) => {
          const angle = (node.angle * Math.PI) / 180;
          const x = centerX + Math.cos(angle) * radius - 60;
          const y = centerY + Math.sin(angle) * radius - 60;
          const scale = 1 + (Math.sin(index * 0.5) * 0.1); // Size variation
          
          return (
            <Link 
              key={node.id} 
              to={node.route}
              onClick={() => trackEvent('hub_node_click', 'navigation', node.label)}
            >
              <motion.div
                className="absolute cursor-pointer group"
                style={{
                  left: x,
                  top: y,
                  willChange: 'transform'
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: scale,
                  opacity: 1,
                  rotateY: mouse.normalizedX * 10,
                  rotateX: -mouse.normalizedY * 10,
                }}
                transition={{
                  type: "spring",
                  stiffness: 100,
                  delay: index * 0.1
                }}
                whileHover={{
                  scale: scale * 1.2,
                  z: 50,
                  transition: { duration: 0.2 }
                }}
              >
                <GlassSphere
                  size={120}
                  color={node.color}
                  icon={node.icon}
                  bubbleCount={10}
                  glowIntensity={40}
                  parallaxX={mouse.normalizedX * 20}
                  parallaxY={mouse.normalizedY * 20}
                />

                {/* Label below sphere */}
                <motion.div
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-4 text-center pointer-events-none"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                >
                  <span className="font-bold text-white text-lg tracking-wider drop-shadow-lg">
                    {node.label.toUpperCase()}
                  </span>
                </motion.div>

                {/* Hover info panel */}
                <motion.div
                  className="absolute left-full ml-6 top-1/2 -translate-y-1/2 w-48 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300"
                  style={{
                    background: 'rgba(0, 0, 0, 0.9)',
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${node.color}`,
                    borderRadius: '12px',
                    padding: '16px',
                    boxShadow: `0 0 30px ${node.color}50`
                  }}
                >
                  <h3 className="font-black text-white text-sm mb-2 tracking-wider">
                    {node.label.toUpperCase()}
                  </h3>
                  <ul className="space-y-1">
                    {node.features.map((feature, i) => (
                      <li key={i} className="text-xs text-gray-300 flex items-start">
                        <span className="mr-2" style={{ color: node.color }}>•</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
