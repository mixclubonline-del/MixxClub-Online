interface Props {
  asset: { url: string; isVideo: boolean };
}

export function ProducerPainScene({ asset }: Props) {
  return (
    <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-amber-700 via-amber-900 to-stone-950">
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-end pb-24 sm:pb-32 px-6">
        <p className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white text-center leading-tight max-w-3xl animate-fade-in">
          347 type beats. 12 subscribers.
        </p>
        <p className="text-lg sm:text-2xl text-white/70 text-center mt-4 max-w-xl animate-fade-in [animation-delay:0.5s]">
          No one's calling.
        </p>
      </div>
    </div>
  );
}
