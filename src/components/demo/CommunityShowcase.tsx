import { motion } from 'framer-motion';
import { useCommunityShowcase } from '@/hooks/useCommunityShowcase';
import { Mic2, Headphones, MapPin } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface CommunityShowcaseProps {
  amplitude: number;
  bass: number;
  isPlaying: boolean;
}

export const CommunityShowcase = ({ amplitude, bass, isPlaying }: CommunityShowcaseProps) => {
  const { members, isLoading } = useCommunityShowcase(6);

  // Generate random positions in 3D space for floating effect
  const getCardPosition = (index: number) => {
    const positions = [
      { x: -280, y: -120, z: 0 },
      { x: 280, y: -80, z: 10 },
      { x: -200, y: 100, z: 5 },
      { x: 200, y: 140, z: 15 },
      { x: -320, y: 40, z: 8 },
      { x: 320, y: -20, z: 12 },
    ];
    return positions[index] || { x: 0, y: 0, z: 0 };
  };

  if (isLoading) {
    return (
      <div className="relative w-full h-[500px] flex items-center justify-center">
        <motion.div
          className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  return (
    <div className="relative w-full h-[500px] flex items-center justify-center overflow-visible">
      {/* Connection lines between members */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
        {members.map((member, i) => {
          const pos1 = getCardPosition(i);
          const nextIndex = (i + 1) % members.length;
          const pos2 = getCardPosition(nextIndex);
          
          return (
            <motion.line
              key={`line-${i}`}
              x1={`calc(50% + ${pos1.x}px)`}
              y1={`calc(50% + ${pos1.y}px)`}
              x2={`calc(50% + ${pos2.x}px)`}
              y2={`calc(50% + ${pos2.y}px)`}
              stroke="url(#connectionGradient)"
              strokeWidth={isPlaying ? 1 + (bass / 255) * 2 : 1}
              strokeOpacity={isPlaying ? 0.3 + (amplitude / 255) * 0.4 : 0.2}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, delay: i * 0.2 }}
            />
          );
        })}
        <defs>
          <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="50%" stopColor="hsl(280 100% 60%)" />
            <stop offset="100%" stopColor="hsl(200 100% 60%)" />
          </linearGradient>
        </defs>
      </svg>

      {/* Floating member cards */}
      {members.map((member, index) => {
        const pos = getCardPosition(index);
        const isArtist = member.role === 'artist';
        
        return (
          <motion.div
            key={member.id}
            className="absolute"
            style={{ 
              left: `calc(50% + ${pos.x}px)`,
              top: `calc(50% + ${pos.y}px)`,
              transform: 'translate(-50%, -50%)',
              zIndex: pos.z,
            }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              y: isPlaying ? [0, -10, 0] : 0,
            }}
            transition={{ 
              opacity: { duration: 0.5, delay: index * 0.15 },
              scale: { duration: 0.5, delay: index * 0.15 },
              y: { duration: 2 + index * 0.3, repeat: Infinity, ease: 'easeInOut' }
            }}
          >
            <motion.div
              className={`relative p-4 rounded-2xl backdrop-blur-md border shadow-xl ${
                isArtist 
                  ? 'bg-cyan-950/40 border-cyan-500/30 shadow-cyan-500/10' 
                  : 'bg-purple-950/40 border-purple-500/30 shadow-purple-500/10'
              }`}
              whileHover={{ scale: 1.05, zIndex: 50 }}
              animate={{
                boxShadow: isPlaying 
                  ? `0 0 ${20 + (bass / 255) * 30}px ${isArtist ? 'rgba(6, 182, 212, 0.3)' : 'rgba(168, 85, 247, 0.3)'}`
                  : undefined
              }}
            >
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12 border-2 border-white/20">
                  <AvatarImage src={member.avatar_url || undefined} />
                  <AvatarFallback className={`${isArtist ? 'bg-cyan-600' : 'bg-purple-600'} text-white`}>
                    {member.full_name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm truncate">{member.full_name}</h4>
                    {isArtist ? (
                      <Mic2 className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                    ) : (
                      <Headphones className="w-3 h-3 text-purple-400 flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{member.location}</span>
                  </div>
                </div>
              </div>

              {/* Audio waveform under each card */}
              <div className="mt-3 flex gap-0.5 h-4">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className={`flex-1 rounded-full ${isArtist ? 'bg-cyan-500' : 'bg-purple-500'}`}
                    animate={{ 
                      scaleY: isPlaying ? 0.2 + Math.sin(Date.now() / 200 + i) * 0.3 + (amplitude / 255) * 0.5 : 0.2
                    }}
                    style={{ originY: 1 }}
                    transition={{ duration: 0.1 }}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
};
