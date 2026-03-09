import { useRef, useEffect, useState } from 'react';

interface Props {
  asset: { url: string; isVideo: boolean };
  fallbackGradient: string;
  children: React.ReactNode;
}

export function SceneBackground({ asset, fallbackGradient, children }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    videoRef.current?.play().catch(() => {});
  }, [asset.url]);

  useEffect(() => {
    setImgLoaded(false);
    setImgFailed(false);
  }, [asset.url]);

  const hasUrl = asset.url && asset.url.length > 20;
  const showImage = hasUrl && !asset.isVideo && imgLoaded && !imgFailed;

  return (
    <div className="absolute inset-0 w-full h-full">
      {/* Gradient fallback — always present */}
      <div className={`absolute inset-0 ${fallbackGradient}`} />

      {/* Video layer */}
      {asset.isVideo && hasUrl && (
        <video
          ref={videoRef}
          src={asset.url}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Image layer */}
      {hasUrl && !asset.isVideo && (
        <>
          <div
            className="absolute inset-0 transition-opacity duration-700"
            style={{
              backgroundImage: `url(${asset.url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: showImage ? 1 : 0,
            }}
          />
          <img
            src={asset.url}
            alt=""
            className="hidden"
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgFailed(true)}
          />
        </>
      )}

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/20" />

      {/* Content */}
      {children}
    </div>
  );
}
