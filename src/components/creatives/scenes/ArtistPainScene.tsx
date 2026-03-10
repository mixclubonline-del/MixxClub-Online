import { SceneBackground } from './SceneBackground';

interface Props {
  asset: { url: string; isVideo: boolean };
}

export function ArtistPainScene({ asset }: Props) {
  return (
    <SceneBackground asset={asset} fallbackGradient="bg-gradient-to-br from-purple-800 via-purple-900 to-indigo-950">
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-24 sm:pb-32 px-6">
        <p className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white text-center leading-tight max-w-3xl" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
          47 songs. Zero releases.
        </p>
        <p className="text-lg sm:text-2xl text-white/70 text-center mt-4 max-w-xl" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>
          The mix isn't right and you know it.
        </p>
      </div>
    </SceneBackground>
  );
}
