import { SceneBackground } from './SceneBackground';

interface Props {
  asset: { url: string; isVideo: boolean };
}

export function EngineerPainScene({ asset }: Props) {
  return (
    <SceneBackground asset={asset} fallbackGradient="bg-gradient-to-br from-cyan-800 via-teal-900 to-slate-950">
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-24 sm:pb-32 px-6">
        <p className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white text-center leading-tight max-w-3xl">
          $12,000 in gear. $200/month in plugins.
        </p>
        <p className="text-lg sm:text-2xl text-white/70 text-center mt-4 max-w-xl">
          Zero clients this week.
        </p>
      </div>
    </SceneBackground>
  );
}
