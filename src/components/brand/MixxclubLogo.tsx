import { motion } from 'framer-motion';

interface MixxclubLogoProps {
  variant?: 'full' | 'symbol-only' | 'wordmark-only' | 'full-with-tagline';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  className?: string;
}

const sizeMap = {
  xs: { symbol: 24, text: 12, gap: 4 },
  sm: { symbol: 48, text: 16, gap: 6 },
  md: { symbol: 96, text: 24, gap: 12 },
  lg: { symbol: 144, text: 36, gap: 16 },
  xl: { symbol: 240, text: 48, gap: 24 },
};

export const MixxclubLogo = ({ 
  variant = 'full', 
  size = 'md',
  animated = true,
  className = '' 
}: MixxclubLogoProps) => {
  const dimensions = sizeMap[size];
  const showSymbol = variant === 'full' || variant === 'symbol-only' || variant === 'full-with-tagline';
  const showWordmark = variant === 'full' || variant === 'wordmark-only' || variant === 'full-with-tagline';
  const showTagline = variant === 'full-with-tagline';

  const LogoContent = (
    <div className={`flex flex-col items-center ${className}`}>
      {showSymbol && (
        <svg
          width={dimensions.symbol}
          height={dimensions.symbol * 0.6}
          viewBox="0 0 200 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={animated ? 'animate-glow-pulse' : ''}
        >
          <defs>
            {/* Main gradient: Pink -> Lavender -> Cyan */}
            <linearGradient id="mixx-gradient" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#FF70D0" />
              <stop offset="50%" stopColor="#C5A3FF" />
              <stop offset="100%" stopColor="#70E6FF" />
            </linearGradient>

            {/* Glow filter */}
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>

            {/* Inner shadow for 3D depth */}
            <filter id="inner-shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
              <feOffset dx="0" dy="2" result="offsetblur"/>
              <feFlood floodColor="#000000" floodOpacity="0.3"/>
              <feComposite in2="offsetblur" operator="in"/>
              <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Background glow layer (subtle) */}
          <path
            d="M 50 60 C 50 40, 70 30, 100 30 C 130 30, 150 40, 150 60 C 150 80, 130 90, 100 90 C 70 90, 50 80, 50 60 Z M 100 30 C 130 30, 150 40, 150 60 C 150 80, 130 90, 100 90 C 130 90, 150 80, 150 60 C 150 40, 130 30, 100 30 Z"
            fill="url(#mixx-gradient)"
            opacity="0.3"
            filter="url(#glow)"
          />

          {/* Main infinity symbol */}
          <path
            d="M 40 60 Q 40 35, 65 35 Q 85 35, 100 50 Q 115 35, 135 35 Q 160 35, 160 60 Q 160 85, 135 85 Q 115 85, 100 70 Q 85 85, 65 85 Q 40 85, 40 60 Z M 65 45 Q 50 45, 50 60 Q 50 75, 65 75 Q 80 75, 92 62 L 100 60 L 108 62 Q 120 75, 135 75 Q 150 75, 150 60 Q 150 45, 135 45 Q 120 45, 108 58 L 100 60 L 92 58 Q 80 45, 65 45 Z"
            fill="url(#mixx-gradient)"
            filter="url(#inner-shadow)"
            strokeWidth="0"
          />

          {/* Top highlight for 3D effect */}
          <path
            d="M 65 40 Q 55 40, 52 50 Q 52 48, 54 46 Q 58 42, 65 42 Q 78 42, 88 52 L 100 60 L 112 52 Q 122 42, 135 42 Q 142 42, 146 46 Q 148 48, 148 50 Q 145 40, 135 40 Q 120 40, 106 54 L 100 60 L 94 54 Q 80 40, 65 40 Z"
            fill="white"
            opacity="0.15"
          />

          {/* Outer glow */}
          <path
            d="M 40 60 Q 40 35, 65 35 Q 85 35, 100 50 Q 115 35, 135 35 Q 160 35, 160 60 Q 160 85, 135 85 Q 115 85, 100 70 Q 85 85, 65 85 Q 40 85, 40 60 Z"
            fill="none"
            stroke="url(#mixx-gradient)"
            strokeWidth="2"
            opacity="0.5"
            filter="url(#glow)"
          />
        </svg>
      )}

      {showWordmark && (
        <div 
          className="flex flex-col items-center"
          style={{ marginTop: showSymbol ? dimensions.gap : 0 }}
        >
          <span 
            className="font-bold text-white tracking-tight"
            style={{ fontSize: dimensions.text, lineHeight: 1.2 }}
          >
            Mixxclub
          </span>
          {showTagline && (
            <span 
              className="text-muted-foreground font-medium"
              style={{ fontSize: dimensions.text * 0.5, marginTop: dimensions.gap * 0.5 }}
            >
              Powered by Prime AI
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {LogoContent}
      </motion.div>
    );
  }

  return LogoContent;
};
