import { Link } from 'react-router-dom';

interface Props {
  asset: { url: string; isVideo: boolean };
}

const PATHS = [
  { label: 'Artist', to: '/for-artists', color: 'from-purple-500 to-purple-700', glow: 'shadow-purple-500/40' },
  { label: 'Engineer', to: '/for-engineers', color: 'from-cyan-500 to-cyan-700', glow: 'shadow-cyan-500/40' },
  { label: 'Producer', to: '/for-producers', color: 'from-amber-500 to-amber-700', glow: 'shadow-amber-500/40' },
  { label: 'Fan', to: '/for-fans', color: 'from-pink-500 to-pink-700', glow: 'shadow-pink-500/40' },
];

export function PickPathScene({ asset }: Props) {
  return (
    <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-800 via-purple-800 to-indigo-900">
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6">
        <p className="text-2xl sm:text-4xl font-bold text-white text-center mb-10 animate-fade-in">
          Pick your path.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-2xl w-full">
          {PATHS.map((p) => (
            <Link
              key={p.label}
              to={p.to}
              className={`block w-full aspect-[3/4] rounded-2xl bg-gradient-to-b ${p.color} ${p.glow} shadow-2xl flex items-end justify-center p-4 hover:scale-105 transition-transform duration-300 animate-fade-in`}
            >
              <span className="text-white font-bold text-lg sm:text-xl">{p.label}</span>
            </Link>
          ))}
        </div>

        <div className="mt-8 animate-fade-in">
          <Link
            to="/auth?signup=true"
            className="text-white/60 hover:text-white underline underline-offset-4 text-sm sm:text-base transition-colors"
          >
            Or create your account →
          </Link>
        </div>
      </div>
    </div>
  );
}
