import { Link } from 'react-router-dom';
import { SceneBackground } from './SceneBackground';

interface Props {
  asset: { url: string; isVideo: boolean };
}

const PATHS = [
  {
    label: 'Artist',
    sublabel: 'Create & release music',
    to: '/for-artists',
    color: 'rgba(168,85,247,0.55)',
    hoverColor: 'rgba(168,85,247,0.8)',
  },
  {
    label: 'Engineer',
    sublabel: 'Mix, master & collaborate',
    to: '/for-engineers',
    color: 'rgba(6,182,212,0.55)',
    hoverColor: 'rgba(6,182,212,0.8)',
  },
  {
    label: 'Producer',
    sublabel: 'Build beats & sell sounds',
    to: '/for-producers',
    color: 'rgba(245,158,11,0.55)',
    hoverColor: 'rgba(245,158,11,0.8)',
  },
  {
    label: 'Fan',
    sublabel: 'Discover & support artists',
    to: '/for-fans',
    color: 'rgba(236,72,153,0.55)',
    hoverColor: 'rgba(236,72,153,0.8)',
  },
];

export function PickPathScene({ asset }: Props) {
  return (
    <SceneBackground asset={asset} fallbackGradient="bg-gradient-to-br from-gray-900 via-purple-950 to-indigo-950">
      {/* === Fog layers === */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 4 }}>
        {/* Fog 1 — wide, slow */}
        <div
          className="absolute top-[15%] -left-[50%] w-[200%] h-[35%] opacity-20"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 30%, rgba(255,255,255,0.18) 50%, rgba(255,255,255,0.12) 70%, transparent 100%)',
            filter: 'blur(40px)',
            animation: 'fog-drift 18s linear infinite',
          }}
        />
        {/* Fog 2 — lower, reversed */}
        <div
          className="absolute top-[50%] -left-[50%] w-[200%] h-[30%] opacity-15"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(200,180,255,0.15) 25%, rgba(200,180,255,0.22) 50%, rgba(200,180,255,0.15) 75%, transparent 100%)',
            filter: 'blur(50px)',
            animation: 'fog-drift-reverse 22s linear infinite',
          }}
        />
        {/* Fog 3 — ground haze */}
        <div
          className="absolute bottom-0 -left-[30%] w-[160%] h-[25%] opacity-25"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 40%, rgba(255,255,255,0.15) 60%, transparent 100%)',
            filter: 'blur(60px)',
            animation: 'fog-drift-slow 28s ease-in-out infinite alternate',
          }}
        />
      </div>

      {/* === Content === */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-4 sm:px-6" style={{ zIndex: 10 }}>
        <p
          className="text-2xl sm:text-4xl md:text-5xl font-bold text-white text-center mb-8 sm:mb-12 tracking-tight"
          style={{ textShadow: '0 2px 20px rgba(0,0,0,0.8), 0 0 60px rgba(168,85,247,0.3)' }}
        >
          Pick your path.
        </p>

        {/* Portal grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5 max-w-3xl w-full">
          {PATHS.map((p) => (
            <Link
              key={p.label}
              to={p.to}
              className="group relative flex flex-col items-center justify-end rounded-2xl aspect-[2/3] overflow-hidden transition-all duration-500 cursor-pointer"
              style={{
                '--portal-color': p.color,
                '--portal-hover': p.hoverColor,
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(4px)',
                border: `1px solid ${p.color}`,
                boxShadow: `0 0 20px ${p.color}, inset 0 0 20px ${p.color}`,
                animation: 'portal-glow-pulse 3.5s ease-in-out infinite',
              } as React.CSSProperties}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.border = `1px solid ${p.hoverColor}`;
                el.style.boxShadow = `0 0 45px ${p.hoverColor}, inset 0 0 35px ${p.hoverColor}`;
                el.style.transform = 'scale(1.04)';
                el.style.background = 'rgba(255,255,255,0.06)';
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.border = `1px solid ${p.color}`;
                el.style.boxShadow = `0 0 20px ${p.color}, inset 0 0 20px ${p.color}`;
                el.style.transform = 'scale(1)';
                el.style.background = 'rgba(255,255,255,0.03)';
              }}
            >
              {/* Inner vertical light beam */}
              <div
                className="absolute inset-x-0 top-0 h-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                style={{
                  background: `linear-gradient(to bottom, ${p.hoverColor}, transparent 70%)`,
                }}
              />

              {/* Label area */}
              <div className="relative z-10 p-3 sm:p-4 text-center w-full">
                <span
                  className="block text-white font-bold text-base sm:text-xl tracking-wide"
                  style={{ textShadow: `0 0 20px ${p.color}, 0 2px 8px rgba(0,0,0,0.9)` }}
                >
                  {p.label}
                </span>
                <span
                  className="block text-white/0 group-hover:text-white/80 text-xs sm:text-sm mt-1 transition-all duration-500 translate-y-2 group-hover:translate-y-0"
                  style={{ textShadow: '0 1px 6px rgba(0,0,0,0.8)' }}
                >
                  {p.sublabel}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 sm:mt-10">
          <Link
            to="/auth?signup=true"
            className="text-white/50 hover:text-white underline underline-offset-4 text-sm sm:text-base transition-colors duration-300"
            style={{ textShadow: '0 1px 8px rgba(0,0,0,0.6)' }}
          >
            Or create your account →
          </Link>
        </div>
      </div>
    </SceneBackground>
  );
}
