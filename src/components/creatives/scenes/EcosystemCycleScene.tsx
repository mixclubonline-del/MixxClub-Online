import { SceneBackground } from './SceneBackground';

interface Props {
  asset: { url: string; isVideo: boolean };
}

export function EcosystemCycleScene({ asset }: Props) {
  return (
    <SceneBackground asset={asset} fallbackGradient="bg-gradient-to-br from-indigo-800 via-purple-800 to-cyan-900">
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-24 sm:pb-32 px-6">
        <div className="text-center">
          <p className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white">
            You keep <span className="text-primary">70%</span>. Period.
          </p>
          <p className="text-base sm:text-xl text-white/60 mt-4 max-w-lg mx-auto">
            Every transaction feeds the ecosystem. Artists, engineers, producers, fans — connected.
          </p>
        </div>
      </div>
    </SceneBackground>
  );
}
