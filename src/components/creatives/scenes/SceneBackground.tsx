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
    <div style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Gradient fallback */}
      <div className={fallbackGradient} style={{ position: 'absolute', inset: 0 }} />

      {/* Video layer */}
      {asset.isVideo && hasUrl && (
        <video
          ref={videoRef}
          src={asset.url}
          autoPlay
          loop
          muted
          playsInline
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 2 }}
        />
      )}

      {/* Image layer */}
      {hasUrl && !asset.isVideo && (
        <>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${asset.url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: showImage ? 1 : 0,
              transition: 'opacity 700ms',
              zIndex: 2,
            }}
          />
          <img
            src={asset.url}
            alt=""
            style={{ display: 'none' }}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgFailed(true)}
          />
        </>
      )}

      {/* Dark overlay for text readability */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.6), rgba(0,0,0,0.2), rgba(0,0,0,0.1))',
          zIndex: 3,
        }}
      />

      {/* Content */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 10 }}>
        {children}
      </div>
    </div>
  );
}
