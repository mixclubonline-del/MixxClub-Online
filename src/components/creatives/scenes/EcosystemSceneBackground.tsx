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

  if (asset.isVideo) {
    return (
      <div className="absolute inset-0 overflow-hidden">
        <video
          ref={videoRef}
          src={asset.url}
          autoPlay
          loop
          muted
          playsInline
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {tint && (
          <div className={`absolute inset-0 bg-gradient-to-t ${tint} to-transparent opacity-60`} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 animate-[kenBurns_20s_ease-in-out_infinite_alternate]"
        style={{
          backgroundImage: `url(${asset.url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      {tint && (
        <div className={`absolute inset-0 bg-gradient-to-t ${tint} to-transparent opacity-60`} />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
    </div>
  );
}
