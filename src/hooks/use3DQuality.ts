import { useState, useEffect } from 'react';

export type QualityLevel = 'low' | 'medium' | 'high';

interface DeviceCapabilities {
  hasWebGL2: boolean;
  maxTextureSize: number;
  gpuTier: number;
  isMobile: boolean;
}

export const use3DQuality = () => {
  const [quality, setQuality] = useState<QualityLevel>('medium');
  const [capabilities, setCapabilities] = useState<DeviceCapabilities>({
    hasWebGL2: false,
    maxTextureSize: 2048,
    gpuTier: 1,
    isMobile: false
  });

  useEffect(() => {
    const detectCapabilities = () => {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      
      if (!gl) {
        setQuality('low');
        return;
      }

      const hasWebGL2 = !!canvas.getContext('webgl2');
      const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      // Simple GPU tier detection
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : '';
      
      let gpuTier = 1;
      if (renderer.includes('NVIDIA') || renderer.includes('AMD') || renderer.includes('Radeon')) {
        gpuTier = 3;
      } else if (renderer.includes('Intel') && !isMobile) {
        gpuTier = 2;
      }

      const caps: DeviceCapabilities = {
        hasWebGL2,
        maxTextureSize,
        gpuTier,
        isMobile
      };

      setCapabilities(caps);

      // Determine quality level
      if (isMobile || gpuTier === 1) {
        setQuality('low');
      } else if (gpuTier === 2) {
        setQuality('medium');
      } else {
        setQuality('high');
      }
    };

    detectCapabilities();
  }, []);

  return { quality, capabilities, setQuality };
};
