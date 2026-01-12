import { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface ServicePortalProps {
  id: string;
  label: string;
  description: string;
  price: string;
  icon: ReactNode;
  link: string;
  gradient: string;
  position?: 'left' | 'center-left' | 'center-right' | 'right';
}

export function ServicePortal({ 
  id, 
  label, 
  description, 
  price, 
  icon, 
  link,
  gradient,
  position = 'center-left'
}: ServicePortalProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link to={link}>
      <motion.div
        className="relative group cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Portal glow effect */}
        <motion.div
          className={`absolute -inset-4 rounded-3xl bg-gradient-to-br ${gradient} blur-xl`}
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 0.4 : 0.15 }}
          transition={{ duration: 0.3 }}
        />

        {/* Main portal container */}
        <motion.div
          className="relative p-8 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 overflow-hidden"
          animate={{
            borderColor: isHovered ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
          }}
        >
          {/* Animated background gradient */}
          <motion.div
            className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0`}
            animate={{ opacity: isHovered ? 0.15 : 0 }}
            transition={{ duration: 0.3 }}
          />

          {/* Icon with glow */}
          <motion.div
            className="relative w-16 h-16 mb-6 mx-auto"
            animate={{ 
              scale: isHovered ? 1.1 : 1,
              filter: isHovered ? 'drop-shadow(0 0 20px hsl(var(--accent)))' : 'none'
            }}
          >
            <div className="w-full h-full flex items-center justify-center text-accent">
              {icon}
            </div>
          </motion.div>

          {/* Label */}
          <h3 className="text-xl font-bold text-center mb-2 text-foreground group-hover:text-accent transition-colors">
            {label}
          </h3>

          {/* Description - shows on hover */}
          <AnimatePresence>
            {isHovered && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-sm text-muted-foreground text-center mb-4"
              >
                {description}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Price badge */}
          <motion.div
            className="text-center"
            animate={{ y: isHovered ? 0 : 0 }}
          >
            <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r ${gradient} text-white`}>
              {price}
            </span>
          </motion.div>

          {/* Enter indicator */}
          <motion.div
            className="absolute bottom-4 left-0 right-0 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
          >
            <span className="text-xs text-accent font-mono">ENTER →</span>
          </motion.div>
        </motion.div>
      </motion.div>
    </Link>
  );
}
