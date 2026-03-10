import { SceneBackground } from './SceneBackground';

interface Props {
  asset: { url: string; isVideo: boolean };
}

export function ConnectionScene({ asset }: Props) {
  return (
    <SceneBackground asset={asset} fallbackGradient="bg-gradient-to-br from-purple-700 via-cyan-800 to-amber-900">
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
        <p className="text-4xl sm:text-6xl lg:text-8xl font-black text-white text-center" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.8)' }}>
          What if everyone ate?
        </p>
      </div>
    </SceneBackground>
  );
}
