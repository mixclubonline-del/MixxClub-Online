import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface HolographicMaterialProps {
  color?: string;
  speed?: number;
}

export const HolographicMaterial = ({ 
  color = '#8b5cf6', 
  speed = 1 
}: HolographicMaterialProps) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime * speed;
    }
  });

  const vertexShader = `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float time;
    uniform vec3 color;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    void main() {
      // Holographic scan lines
      float scanLine = sin(vUv.y * 100.0 + time * 5.0) * 0.5 + 0.5;
      
      // Rainbow shift
      vec3 rainbow = vec3(
        sin(vUv.y * 10.0 + time) * 0.5 + 0.5,
        sin(vUv.y * 10.0 + time + 2.0) * 0.5 + 0.5,
        sin(vUv.y * 10.0 + time + 4.0) * 0.5 + 0.5
      );
      
      // Fresnel effect
      vec3 viewDirection = normalize(cameraPosition - vPosition);
      float fresnel = pow(1.0 - abs(dot(viewDirection, vNormal)), 2.0);
      
      // Combine effects
      vec3 finalColor = mix(color, rainbow, 0.3);
      finalColor *= scanLine * 0.5 + 0.5;
      finalColor += fresnel * 0.5;
      
      float alpha = fresnel * 0.7 + scanLine * 0.3;
      
      gl_FragColor = vec4(finalColor, alpha);
    }
  `;

  return (
    <shaderMaterial
      ref={materialRef}
      vertexShader={vertexShader}
      fragmentShader={fragmentShader}
      uniforms={{
        time: { value: 0 },
        color: { value: new THREE.Color(color) }
      }}
      transparent
      side={THREE.DoubleSide}
    />
  );
};
