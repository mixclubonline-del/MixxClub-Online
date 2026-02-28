import { useRef, useEffect } from 'react';

interface Props {
  asset: { url: string | null; isVideo: boolean };
  kenBurns?: boolean;
}

export function SceneBackground({ asset, kenBurns = true }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    videoRef.current?.play().catch(() => {});
  }, [asset.url]);

  const kenBurnsClass = kenBurns
    ? 'animate-[kenBurns_20s_ease-in-out_infinite_alternate]'
    : '';

  return (
    <>
      {asset.url && asset.isVideo ? (
        <video
          ref={videoRef}
          src={asset.url}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : asset.url ? (
        <img
          src={asset.url}
          alt=""
          className={`absolute inset-0 w-full h-full object-cover ${kenBurnsClass}`}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
      )}
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30" />
    </>
  );
}
