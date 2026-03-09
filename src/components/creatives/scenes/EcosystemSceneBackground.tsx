import { useRef, useEffect, useState } from 'react';

interface Props {
  asset: { url: string; isVideo: boolean };
  tint?: string;
  fallbackGradient?: string;
}

export function EcosystemSceneBackground({ asset, tint, fallbackGradient }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    videoRef.current?.play().catch(() => {});
  }, [asset.url]);

  // Check if URL looks like a broken import (empty data uri, blob, or very short)
  const isBrokenUrl = !asset.url || asset.url.length < 20;
  const showGradient = (imgFailed || isBrokenUrl) && !asset.isVideo;

  if (asset.isVideo && !isBrokenUrl) {
    return (
      <div className="absolute inset-0 overflow-hidden">
        <video
          ref={videoRef}
          src={asset.url}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
        {tint && (
          <div className={`absolute inset-0 bg-gradient-to-t ${tint} to-transparent opacity-60`} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
      </div>
    );
  }

  if (showGradient && fallbackGradient) {
    return (
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute inset-0 ${fallbackGradient}`} />
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
      {/* Hidden img to detect load failure */}
      <img
        src={asset.url}
        alt=""
        className="hidden"
        onError={() => setImgFailed(true)}
      />
      {tint && (
        <div className={`absolute inset-0 bg-gradient-to-t ${tint} to-transparent opacity-60`} />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
    </div>
  );
}
