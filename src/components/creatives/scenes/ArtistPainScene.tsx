import { SceneBackground } from './SceneBackground';

interface Props {
  asset: { url: string; isVideo: boolean };
}

export function ArtistPainScene({ asset }: Props) {
  return (
    <SceneBackground asset={asset} fallbackGradient="bg-gradient-to-br from-purple-800 via-purple-900 to-indigo-950">
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-24 sm:pb-32 px-6" style={{ zIndex: 100 }}>
        <p style={{ color: '#ffffff', fontSize: '3rem', fontWeight: 'bold', textShadow: '0 2px 10px rgba(0,0,0,0.8)' }} className="text-center leading-tight max-w-3xl">
          47 songs. Zero releases.
        </p>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.25rem', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }} className="text-center mt-4 max-w-xl">
          The mix isn't right and you know it.
        </p>
      </div>
    </SceneBackground>
  );
}
