import { useRef, useEffect } from 'react';

interface Props {
  asset: { url: string; isVideo: boolean };
  tint?: string; // e.g. 'from-purple-900/60' for role color overlay
}

export function EcosystemSceneBackground({ asset, tint }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    videoRef.current?.play().catch(() => {});
  }, [asset.url]);

  return (
    <>
      {asset.isVideo ? (
        <video
          ref={videoRef}
          src={asset.url}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <img
          src={asset.url}
          alt=""
          className="absolute inset-0 w-full h-full object-cover animate-[kenBurns_20s_ease-in-out_infinite_alternate]"
        />
      )}
      {/* Role-tinted gradient overlay */}
      {tint && (
        <div className={`absolute inset-0 bg-gradient-to-t ${tint} to-transparent`} />
      )}
      {/* Bottom scrim for text */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/40" />
    </>
  );
}
