interface Props {
  asset: { url: string; isVideo: boolean };
}

export function ConnectionScene({ asset }: Props) {
  return (
    <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-purple-700 via-cyan-800 to-amber-900">
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6">
        <p className="text-4xl sm:text-6xl lg:text-8xl font-black text-white text-center animate-fade-in">
          What if everyone ate?
        </p>
      </div>
    </div>
  );
}
