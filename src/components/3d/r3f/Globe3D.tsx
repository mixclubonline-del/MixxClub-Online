import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Sphere, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface LocationMarker {
  lat: number;
  lng: number;
  value: number;
}

const GlobeWithMarkers = ({ markers }: { markers: LocationMarker[] }) => {
  const globeRef = useRef<THREE.Mesh>(null);
  const markersRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (globeRef.current) {
      globeRef.current.rotation.y += 0.002;
    }
    if (markersRef.current) {
      markersRef.current.rotation.y += 0.002;
    }
  });

  // Convert lat/lng to 3D coordinates on sphere
  const latLngToVector3 = (lat: number, lng: number, radius: number) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);

    return new THREE.Vector3(
      -radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );
  };

  return (
    <group>
      {/* Globe */}
      <Sphere ref={globeRef} args={[2, 64, 64]}>
        <meshStandardMaterial
          color="#1a1a2e"
          wireframe
          transparent
          opacity={0.3}
        />
      </Sphere>

      {/* Inner glow sphere */}
      <Sphere args={[1.98, 32, 32]}>
        <meshStandardMaterial
          color="#8b5cf6"
          emissive="#8b5cf6"
          emissiveIntensity={0.5}
          transparent
          opacity={0.2}
        />
      </Sphere>

      {/* Location markers */}
      <group ref={markersRef}>
        {markers.map((marker, i) => {
          const position = latLngToVector3(marker.lat, marker.lng, 2.1);
          return (
            <mesh key={i} position={position}>
              <sphereGeometry args={[0.08 * marker.value, 16, 16]} />
              <meshStandardMaterial
                color="#00ffff"
                emissive="#00ffff"
                emissiveIntensity={2}
              />
            </mesh>
          );
        })}
      </group>
    </group>
  );
};

interface Globe3DProps {
  locations: LocationMarker[];
  className?: string;
}

export const Globe3D = ({ locations, className = '' }: Globe3DProps) => {
  return (
    <div className={className}>
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 6]} />
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
        />
        
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />

        <GlobeWithMarkers markers={locations} />
      </Canvas>
    </div>
  );
};
