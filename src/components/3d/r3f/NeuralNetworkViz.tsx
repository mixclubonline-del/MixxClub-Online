import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';

interface Node {
  position: [number, number, number];
  active: boolean;
}

const NeuralNetwork = ({ isProcessing }: { isProcessing: boolean }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  const nodes = useMemo<Node[]>(() => {
    const nodeArray: Node[] = [];
    // Create 3 layers of nodes
    for (let layer = 0; layer < 3; layer++) {
      const nodesInLayer = layer === 1 ? 6 : 4;
      for (let i = 0; i < nodesInLayer; i++) {
        const x = (layer - 1) * 3;
        const y = (i - nodesInLayer / 2) * 1.5;
        nodeArray.push({
          position: [x, y, 0],
          active: Math.random() > 0.3
        });
      }
    }
    return nodeArray;
  }, []);

  useFrame((state) => {
    if (!groupRef.current || !isProcessing) return;
    
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
    
    // Animate node positions slightly
    groupRef.current.children.forEach((child, i) => {
      if (child instanceof THREE.Mesh) {
        const time = state.clock.elapsedTime;
        child.position.y += Math.sin(time * 2 + i) * 0.001;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {/* Nodes */}
      {nodes.map((node, i) => (
        <Sphere
          key={`node-${i}`}
          position={node.position}
          args={[0.15, 16, 16]}
        >
          <meshStandardMaterial
            color={node.active ? '#8b5cf6' : '#4a4a6a'}
            emissive={node.active ? '#8b5cf6' : '#000000'}
            emissiveIntensity={isProcessing ? 1 : 0.3}
          />
        </Sphere>
      ))}

      {/* Connections */}
      {nodes.map((node, i) => {
        return nodes
          .filter((_, j) => j > i && Math.abs(node.position[0] - nodes[j].position[0]) === 3)
          .map((targetNode, j) => (
            <Line
              key={`line-${i}-${j}`}
              points={[node.position, targetNode.position]}
              color={isProcessing ? '#8b5cf6' : '#2a2a4a'}
              lineWidth={1}
              opacity={0.6}
              transparent
            />
          ));
      })}
    </group>
  );
};

interface NeuralNetworkVizProps {
  isProcessing: boolean;
  className?: string;
}

export const NeuralNetworkViz = ({ isProcessing, className = '' }: NeuralNetworkVizProps) => {
  return (
    <div className={className}>
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 10]} />
        
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#8b5cf6" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />

        <NeuralNetwork isProcessing={isProcessing} />
      </Canvas>
    </div>
  );
};
