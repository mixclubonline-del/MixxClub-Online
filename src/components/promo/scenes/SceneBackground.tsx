import { useRef, useEffect } from 'react';

interface Props {
  asset: { url: string | null; isVideo: boolean };
  fallbackSrc?: string;
  kenBurns?: boolean;
}

export function SceneBackground({ asset, fallbackSrc, kenBurns = true }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    videoRef.current?.play().catch(() => {});
  }, [asset.url]);

  const kenBurnsClass = kenBurns
    ? 'animate-[kenBurns_20s_ease-in-out_infinite_alternate]'
    : '';

  const imgSrc = asset.url || fallbackSrc;

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
      ) : imgSrc ? (
        <img
          src={imgSrc}
          alt=""
          className={`absolute inset-0 w-full h-full object-cover ${kenBurnsClass}`}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-700 via-zinc-800 to-zinc-700" />
      )}
      {/* Bottom gradient scrim for text readability — NOT full overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
    </>
  );
}
