import { useRef, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { 
  RotateCcw, 
  Maximize,
  Minimize,
  Settings,
  Sparkles,
  Volume2,
  Eye,
  EyeOff
} from "lucide-react";
import * as THREE from "three";
import type { Track } from "@/pages/HybridDAW";

interface DAW3DViewProps {
  tracks: Track[];
  isPlaying: boolean;
  currentTime: number;
}

const DAW3DView: React.FC<DAW3DViewProps> = ({
  tracks,
  isPlaying,
  currentTime
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const trackMeshesRef = useRef<{ [trackId: string]: THREE.Group }>({});
  
  const [cameraDistance, setCameraDistance] = useState(20);
  const [autoRotate, setAutoRotate] = useState(true);
  const [showWaveforms, setShowWaveforms] = useState(true);
  const [particlesEnabled, setParticlesEnabled] = useState(true);

  // Initialize 3D Scene
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0f);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 10, cameraDistance);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Add point lights for atmosphere
    const pointLight1 = new THREE.PointLight(0x6366f1, 1, 50);
    pointLight1.position.set(-10, 5, 0);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x8b5cf6, 1, 50);
    pointLight2.position.set(10, 5, 0);
    scene.add(pointLight2);

    // Ground plane
    const groundGeometry = new THREE.PlaneGeometry(50, 50);
    const groundMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x1a1a2e,
      transparent: true,
      opacity: 0.3
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Grid helper
    const gridHelper = new THREE.GridHelper(50, 50, 0x6366f1, 0x404040);
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.2;
    scene.add(gridHelper);

    // Particle system for ambiance
    if (particlesEnabled) {
      const particlesGeometry = new THREE.BufferGeometry();
      const particlesCount = 500;
      const posArray = new Float32Array(particlesCount * 3);

      for (let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 100;
      }

      particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

      const particlesMaterial = new THREE.PointsMaterial({
        size: 0.3,
        color: 0x6366f1,
        transparent: true,
        opacity: 0.6
      });

      const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
      scene.add(particlesMesh);
    }

    // Handle window resize
    const handleResize = () => {
      if (!mountRef.current || !camera || !renderer) return;
      
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      if (autoRotate && camera) {
        camera.position.x = Math.cos(Date.now() * 0.0005) * cameraDistance;
        camera.position.z = Math.sin(Date.now() * 0.0005) * cameraDistance;
        camera.lookAt(0, 0, 0);
      }

      // Animate track objects
      Object.values(trackMeshesRef.current).forEach((trackGroup, index) => {
        if (isPlaying) {
          trackGroup.rotation.y += 0.01;
          trackGroup.position.y = Math.sin(Date.now() * 0.003 + index) * 0.5 + 2;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      renderer.dispose();
    };
  }, [autoRotate, cameraDistance, particlesEnabled]);

  // Update camera distance
  useEffect(() => {
    if (cameraRef.current && !autoRotate) {
      cameraRef.current.position.setLength(cameraDistance);
    }
  }, [cameraDistance, autoRotate]);

  // Create 3D objects for tracks
  useEffect(() => {
    if (!sceneRef.current) return;

    // Clear existing track meshes
    Object.values(trackMeshesRef.current).forEach(mesh => {
      sceneRef.current?.remove(mesh);
    });
    trackMeshesRef.current = {};

    // Create new track objects
    tracks.forEach((track, index) => {
      const trackGroup = new THREE.Group();
      
      // Main track body
      const geometry = new THREE.BoxGeometry(8, 1, 2);
      const material = new THREE.MeshPhongMaterial({ 
        color: new THREE.Color(track.color),
        transparent: true,
        opacity: 0.8
      });
      const trackMesh = new THREE.Mesh(geometry, material);
      trackMesh.castShadow = true;
      trackMesh.receiveShadow = true;
      
      // Position tracks in a circle
      const angle = (index / tracks.length) * Math.PI * 2;
      const radius = 8;
      trackGroup.position.x = Math.cos(angle) * radius;
      trackGroup.position.z = Math.sin(angle) * radius;
      trackGroup.position.y = 2;
      
      trackGroup.add(trackMesh);

      // Add regions as smaller cubes
      track.regions.forEach((region, regionIndex) => {
        const regionGeometry = new THREE.BoxGeometry(
          (region.end - region.start) * 0.5, 
          0.5, 
          1
        );
        const regionMaterial = new THREE.MeshPhongMaterial({ 
          color: new THREE.Color(track.color).offsetHSL(0, 0, 0.2),
          transparent: true,
          opacity: 0.9
        });
        const regionMesh = new THREE.Mesh(regionGeometry, regionMaterial);
        regionMesh.position.set(
          region.start * 0.1 - 2,
          0.8,
          regionIndex * 0.2 - 0.5
        );
        regionMesh.castShadow = true;
        trackGroup.add(regionMesh);
      });

      // Add glow effect if track has effects
      if (Object.keys(track.effects).length > 0) {
        const glowGeometry = new THREE.SphereGeometry(1.5, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({ 
          color: new THREE.Color(track.color),
          transparent: true,
          opacity: 0.3
        });
        const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
        glowMesh.position.y = 1;
        trackGroup.add(glowMesh);
      }

      // Add floating text
      if (showWaveforms) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (context) {
          canvas.width = 256;
          canvas.height = 64;
          context.fillStyle = track.color;
          context.font = '16px Arial';
          context.fillText(track.name, 10, 30);
          
          const texture = new THREE.CanvasTexture(canvas);
          const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
          const sprite = new THREE.Sprite(spriteMaterial);
          sprite.position.y = 3;
          sprite.scale.set(4, 1, 1);
          trackGroup.add(sprite);
        }
      }

      sceneRef.current.add(trackGroup);
      trackMeshesRef.current[track.id] = trackGroup;
    });
  }, [tracks, showWaveforms]);

  // Reset camera position
  const resetCamera = () => {
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 10, cameraDistance);
      cameraRef.current.lookAt(0, 0, 0);
      setAutoRotate(true);
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* 3D Controls */}
      <div className="border-b border-border bg-card/30 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              3D Immersive View
            </h3>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {tracks.length} Track{tracks.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={autoRotate ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoRotate(!autoRotate)}
              className="text-xs"
            >
              Auto Rotate
            </Button>
            
            <Button
              variant={showWaveforms ? "default" : "outline"}
              size="sm"
              onClick={() => setShowWaveforms(!showWaveforms)}
              className="text-xs gap-1"
            >
              {showWaveforms ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              Labels
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={resetCamera}
              className="text-xs gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Reset View
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Distance:</span>
            <Slider
              value={[cameraDistance]}
              onValueChange={(value) => setCameraDistance(value[0])}
              min={5}
              max={50}
              step={1}
              className="w-20"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Time:</span>
            <div className="text-xs font-mono bg-card/50 px-2 py-1 rounded">
              {Math.floor(currentTime / 60).toString().padStart(2, '0')}:
              {Math.floor(currentTime % 60).toString().padStart(2, '0')}
            </div>
          </div>

          {isPlaying && (
            <Badge variant="default" className="animate-pulse bg-green-500">
              Playing
            </Badge>
          )}
        </div>
      </div>

      {/* 3D Viewport */}
      <div className="flex-1 relative bg-gradient-to-b from-background to-card">
        <div 
          ref={mountRef} 
          className="w-full h-full"
          style={{ minHeight: '400px' }}
        />

        {tracks.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Card className="p-8 bg-card/80 backdrop-blur">
              <div className="text-center space-y-4">
                <Sparkles className="w-12 h-12 mx-auto text-primary opacity-50" />
                <h3 className="text-lg font-semibold">3D Workspace Ready</h3>
                <p className="text-muted-foreground">
                  Add tracks to see them visualized in immersive 3D space.
                  Watch as your music comes to life with real-time effects and animations.
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div>• Real-time audio visualization</div>
                  <div>• Interactive track manipulation</div>
                  <div>• AI effect particles</div>
                  <div>• Collaborative cursors</div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Overlay Info */}
        {tracks.length > 0 && (
          <div className="absolute top-4 left-4 space-y-2">
            {tracks.map((track) => (
              <div
                key={track.id}
                className="flex items-center gap-2 bg-card/80 backdrop-blur rounded-lg px-3 py-2"
              >
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: track.color }}
                />
                <span className="text-sm font-medium">{track.name}</span>
                {track.mute && <Volume2 className="w-3 h-3 text-muted-foreground opacity-50" />}
                {track.solo && <Volume2 className="w-3 h-3 text-primary" />}
                {Object.keys(track.effects).length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {Object.keys(track.effects).length} FX
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Performance Info */}
        <div className="absolute bottom-4 right-4 text-xs text-muted-foreground bg-card/60 backdrop-blur rounded px-2 py-1">
          WebGL Accelerated • Three.js
        </div>
      </div>
    </div>
  );
};

export default DAW3DView;