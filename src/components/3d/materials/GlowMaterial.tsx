import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface GlowMaterialProps {
  color?: string;
  intensity?: number;
  speed?: number;
}

export const GlowMaterial = ({ 
  color = '#8b5cf6', 
  intensity = 1,
  speed = 1 
}: GlowMaterialProps) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime * speed;
    }
  });

  const vertexShader = `
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float time;
    uniform vec3 color;
    uniform float intensity;
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    void main() {
      // Pulsing glow
      float pulse = sin(time * 2.0) * 0.5 + 0.5;
      
      // Fresnel for edge glow
      vec3 viewDirection = normalize(cameraPosition - vPosition);
      float fresnel = pow(1.0 - abs(dot(viewDirection, vNormal)), 3.0);
      
      vec3 glow = color * (fresnel + pulse * 0.3) * intensity;
      float alpha = fresnel * 0.8;
      
      gl_FragColor = vec4(glow, alpha);
    }
  `;

  return (
    <shaderMaterial
      ref={materialRef}
      vertexShader={vertexShader}
      fragmentShader={fragmentShader}
      uniforms={{
        time: { value: 0 },
        color: { value: new THREE.Color(color) },
        intensity: { value: intensity }
      }}
      transparent
      blending={THREE.AdditiveBlending}
      side={THREE.BackSide}
    />
  );
};
