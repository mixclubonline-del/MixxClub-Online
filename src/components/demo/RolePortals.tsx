import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mic2, Headphones, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RolePortalsProps {
  amplitude: number;
  bass: number;
  isPlaying: boolean;
}

export const RolePortals = ({ amplitude, bass, isPlaying }: RolePortalsProps) => {
  const navigate = useNavigate();

  const portals = [
    {
      id: 'artist',
      title: 'I Make Music',
      subtitle: 'Artist Portal',
      description: 'Upload your tracks, find your engineer, build your sound.',
      icon: Mic2,
      gradient: 'from-cyan-500 via-cyan-400 to-blue-500',
      bgGlow: 'cyan',
      hoverPath: '/for-artists',
      particles: [...Array(20)].map((_, i) => ({
        size: Math.random() * 4 + 2,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 2 + Math.random() * 2,
      })),
    },
    {
      id: 'engineer',
      title: 'I Shape Sound',
      subtitle: 'Engineer Portal',
      description: 'Find artists, grow your business, master the craft.',
      icon: Headphones,
      gradient: 'from-purple-500 via-pink-500 to-rose-500',
      bgGlow: 'purple',
      hoverPath: '/for-engineers',
      particles: [...Array(20)].map((_, i) => ({
        size: Math.random() * 4 + 2,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 2 + Math.random() * 2,
      })),
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {portals.map((portal, index) => {
          const Icon = portal.icon;
          
          return (
            <motion.div
              key={portal.id}
              className="relative group cursor-pointer"
              initial={{ opacity: 0, x: index === 0 ? -50 : 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              onClick={() => navigate(portal.hoverPath)}
            >
              {/* Glow effect */}
              <motion.div
                className={`absolute inset-0 rounded-3xl blur-xl opacity-30 bg-gradient-to-br ${portal.gradient}`}
                animate={{
                  opacity: isPlaying ? [0.2, 0.4, 0.2] : 0.2,
                  scale: isPlaying ? [1, 1.05, 1] : 1,
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />

              {/* Main portal container */}
              <motion.div
                className={`relative overflow-hidden rounded-3xl border-2 transition-colors ${
                  portal.id === 'artist' 
                    ? 'border-cyan-500/40 group-hover:border-cyan-400' 
                    : 'border-purple-500/40 group-hover:border-purple-400'
                } bg-background/80 backdrop-blur-md`}
                whileHover={{ scale: 1.02, y: -5 }}
                animate={{
                  boxShadow: isPlaying
                    ? `0 0 ${30 + (bass / 255) * 40}px ${portal.bgGlow === 'cyan' ? 'rgba(6, 182, 212, 0.4)' : 'rgba(168, 85, 247, 0.4)'}`
                    : 'none'
                }}
              >
                {/* Floating particles inside portal */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  {portal.particles.map((particle, i) => (
                    <motion.div
                      key={i}
                      className={`absolute rounded-full ${
                        portal.id === 'artist' ? 'bg-cyan-400' : 'bg-purple-400'
                      }`}
                      style={{
                        width: particle.size,
                        height: particle.size,
                        left: `${particle.x}%`,
                        top: `${particle.y}%`,
                      }}
                      animate={{
                        y: isPlaying ? [0, -50, 0] : 0,
                        opacity: isPlaying ? [0, 0.8, 0] : 0.2,
                        scale: isPlaying ? [0.5, 1, 0.5] : 0.5,
                      }}
                      transition={{
                        duration: particle.duration,
                        repeat: Infinity,
                        delay: particle.delay,
                      }}
                    />
                  ))}
                </div>

                {/* Portal content */}
                <div className="relative p-8 text-center">
                  {/* Icon container */}
                  <motion.div
                    className={`w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${portal.gradient} flex items-center justify-center shadow-2xl`}
                    animate={{
                      scale: isPlaying ? [1, 1.05, 1] : 1,
                      rotate: isPlaying ? [0, 2, -2, 0] : 0,
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Icon className="w-12 h-12 text-white" />
                  </motion.div>

                  {/* Text */}
                  <h3 className={`text-2xl font-black mb-1 bg-gradient-to-r ${portal.gradient} bg-clip-text text-transparent`}>
                    {portal.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">{portal.subtitle}</p>
                  <p className="text-muted-foreground mb-6">{portal.description}</p>

                  {/* CTA Button */}
                  <Button
                    variant="outline"
                    className={`group/btn ${
                      portal.id === 'artist'
                        ? 'border-cyan-500/50 hover:bg-cyan-500/20 hover:border-cyan-400'
                        : 'border-purple-500/50 hover:bg-purple-500/20 hover:border-purple-400'
                    }`}
                  >
                    Enter Portal
                    <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>

                  {/* Audio reactive bars at bottom */}
                  <div className="mt-6 flex gap-1 h-6 items-end justify-center">
                    {[...Array(12)].map((_, i) => (
                      <motion.div
                        key={i}
                        className={`w-1.5 rounded-t ${
                          portal.id === 'artist' ? 'bg-cyan-500' : 'bg-purple-500'
                        }`}
                        animate={{
                          height: isPlaying
                            ? `${20 + Math.sin(Date.now() / 150 + i * 0.5) * 30 + (amplitude / 255) * 50}%`
                            : '20%',
                        }}
                        transition={{ duration: 0.1 }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Center convergence indicator */}
      <motion.div
        className="flex justify-center mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <div className="flex items-center gap-4 text-muted-foreground">
          <motion.div
            className="w-12 h-0.5 bg-gradient-to-r from-cyan-500 to-transparent"
            animate={{ scaleX: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <span className="text-sm">Both paths lead to community</span>
          <motion.div
            className="w-12 h-0.5 bg-gradient-to-l from-purple-500 to-transparent"
            animate={{ scaleX: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </div>
  );
};
