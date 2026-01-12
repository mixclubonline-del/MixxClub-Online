import { motion } from "framer-motion";
import { ReactNode } from "react";

interface JourneyPortalProps {
  children: ReactNode;
  backgroundAsset: string;
}

const JourneyPortal = ({ children, backgroundAsset }: JourneyPortalProps) => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Fixed cinematic background */}
      <div className="fixed inset-0 z-0">
        <motion.img
          src={backgroundAsset}
          alt="Journey Path"
          className="w-full h-full object-cover"
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        
        {/* Gradient overlays for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/40 to-background/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-[hsl(180_100%_50%)]/10" />
        
        {/* Ambient glow */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[150px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[hsl(180_100%_50%)]/20 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
      </div>
      
      {/* Content layer */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default JourneyPortal;
