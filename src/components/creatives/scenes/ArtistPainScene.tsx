interface Props {
  asset: { url: string; isVideo: boolean };
}

export function ArtistPainScene({ asset }: Props) {
  return (
    <div className="absolute inset-0 w-full h-full bg-purple-800">
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6">
        <p className="text-4xl font-bold text-white text-center">
          47 songs. Zero releases.
        </p>
        <p className="text-xl text-white/70 text-center mt-4">
          The mix isn't right and you know it.
        </p>
      </div>
    </div>
  );
}
