import { useRef, useEffect, useState } from 'react';

interface Props {
  asset: { url: string; isVideo: boolean };
  tint?: string;
  fallbackGradient?: string;
}

export function EcosystemSceneBackground({ asset, tint, fallbackGradient }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    videoRef.current?.play().catch(() => {});
  }, [asset.url]);

  // Reset state when asset changes
  useEffect(() => {
    setImgLoaded(false);
    setImgFailed(false);
  }, [asset.url]);

  const isBrokenUrl = !asset.url || asset.url.length < 20;
  // Show gradient if: URL is broken, image failed, or image hasn't loaded yet and we have a fallback
  const useGradient = !asset.isVideo && (isBrokenUrl || imgFailed || !imgLoaded);

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
          <div className={`absolute inset-0 bg-gradient-to-t ${tint} to-transparent opacity-40`} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Gradient fallback — always rendered, fades out when image loads */}
      {fallbackGradient && (
        <div
          className={`absolute inset-0 transition-opacity duration-700 ${fallbackGradient}`}
          style={{ opacity: useGradient ? 1 : 0 }}
        />
      )}

      {/* Image layer — loads on top of gradient */}
      {!isBrokenUrl && (
        <div
          className="absolute inset-0 animate-[kenBurns_20s_ease-in-out_infinite_alternate] transition-opacity duration-700"
          style={{
            backgroundImage: `url(${asset.url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: imgLoaded && !imgFailed ? 1 : 0,
          }}
        />
      )}

      {/* Hidden img to detect load success/failure */}
      {!isBrokenUrl && (
        <img
          src={asset.url}
          alt=""
          className="hidden"
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgFailed(true)}
        />
      )}

      {tint && (
        <div className={`absolute inset-0 bg-gradient-to-t ${tint} to-transparent opacity-40`} />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />
    </div>
  );
}
