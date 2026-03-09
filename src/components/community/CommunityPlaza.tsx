import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';

interface CommunityPlazaProps {
  backgroundAsset: string;
  children: ReactNode;
}

export const CommunityPlaza = ({ backgroundAsset, children }: CommunityPlazaProps) => {
  return (
    <div className="min-h-screen bg-background relative">
      <GlobalHeader />
      
      {/* Full-screen background */}
      <div className="fixed inset-0 -z-10">
        <motion.img
          src={backgroundAsset}
          alt="Community Plaza"
          className="w-full h-full object-cover"
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/30 to-background/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>
      
      {/* Content */}
      <main className="relative pt-20 pb-24 md:pb-8">
        {children}
      </main>
    </div>
  );
};

export default CommunityPlaza;
