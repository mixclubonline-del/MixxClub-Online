import { useRef, useEffect } from 'react';

interface Props {
  asset: { url: string; isVideo: boolean };
  tint?: string;
}

export function EcosystemSceneBackground({ asset, tint }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    videoRef.current?.play().catch(() => {});
  }, [asset.url]);

  return (
    <div className="absolute inset-0 w-full h-full">
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
          loading="eager"
          className="absolute inset-0 w-full h-full object-cover animate-[kenBurns_20s_ease-in-out_infinite_alternate]"
        />
      )}
      {tint && (
        <div className={`absolute inset-0 bg-gradient-to-t ${tint} to-transparent opacity-60`} />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
    </div>
  );
}
