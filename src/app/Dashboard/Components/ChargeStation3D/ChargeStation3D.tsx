import React, { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, useProgress, Html, useGLTF } from '@react-three/drei';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import './ChargeStation3D.css';

// Loading component
function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="loader-container">
        <div className="loader-spinner"></div>
        <p className="loader-text">Model yükleniyor... {progress.toFixed(0)}%</p>
      </div>
    </Html>
  );
}

// GLB Model Component (Blender export)
function GLBStationModel() {
  const meshRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF('/media/charge-station.glb');

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2;
    }
  });

  // Apply materials
  React.useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material.metalness = 0.8;
          child.material.roughness = 0.2;
        }
      }
    });
  }, [scene]);

  return (
    <group ref={meshRef} scale={1} position={[0, -1, 0]}>
      <primitive object={scene} />
    </group>
  );
}

// OBJ Model Component
function OBJStationModel() {
  const meshRef = useRef<THREE.Group>(null);
  const obj = useLoader(OBJLoader, '/media/Elrctric Vehicle Charger.obj');

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2;
    }
  });

  React.useEffect(() => {
    if (obj) {
      obj.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = new THREE.MeshStandardMaterial({
            color: '#1A36B0',
            metalness: 0.8,
            roughness: 0.2,
          });
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    }
  }, [obj]);

  return (
    <group ref={meshRef} scale={0.01} position={[0, -1, 0]}>
      <primitive object={obj} />
    </group>
  );
}

// Fallback simple model
function FallbackStationModel() {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <group ref={meshRef} position={[0, -1, 0]}>
      {/* Ana gövde */}
      <mesh position={[0, 1, 0]} castShadow>
        <boxGeometry args={[0.8, 2, 0.4]} />
        <meshStandardMaterial 
          color="#1A36B0" 
          metalness={0.8} 
          roughness={0.2}
        />
      </mesh>
      
      {/* Ekran */}
      <mesh position={[0, 1.5, 0.21]} castShadow>
        <boxGeometry args={[0.6, 0.8, 0.02]} />
        <meshStandardMaterial 
          color="#0ea5e9" 
          emissive="#0ea5e9"
          emissiveIntensity={0.5}
        />
      </mesh>
      
      {/* Kablo girişi */}
      <mesh position={[0, 0.5, 0.21]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.3, 16]} />
        <meshStandardMaterial 
          color="#64748b" 
          metalness={0.9} 
          roughness={0.1}
        />
      </mesh>
      
      {/* Taban */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.5, 0.6, 0.2, 32]} />
        <meshStandardMaterial 
          color="#334155" 
          metalness={0.5} 
          roughness={0.5}
        />
      </mesh>
      
      {/* Durum LED'i */}
      <mesh position={[0, 2.2, 0.21]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial 
          color="#10b981" 
          emissive="#10b981"
          emissiveIntensity={1.5}
        />
      </mesh>
      
      {/* Şarj kablosu */}
      <mesh position={[0.3, 0.3, 0.25]} rotation={[0, 0, -0.3]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.8, 16]} />
        <meshStandardMaterial 
          color="#2563eb" 
          metalness={0.7} 
          roughness={0.3}
        />
      </mesh>
    </group>
  );
}

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.log('Model yükleme hatası:', error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Model Selector Component
function ModelSelector({ modelType }: { modelType: 'glb' | 'obj' | 'fallback' }) {
  if (modelType === 'glb') {
    return (
      <ErrorBoundary fallback={<FallbackStationModel />}>
        <GLBStationModel />
      </ErrorBoundary>
    );
  } else if (modelType === 'obj') {
    return (
      <ErrorBoundary fallback={<FallbackStationModel />}>
        <OBJStationModel />
      </ErrorBoundary>
    );
  } else {
    return <FallbackStationModel />;
  }
}

export default function ChargeStation3D() {
  const [isActive, setIsActive] = useState(true);
  const [modelType, setModelType] = useState<'glb' | 'obj' | 'fallback'>('fallback');

  return (
    <div className="charge-station-3d">
      <div className="station-header">
        <h3>🔌 Şarj İstasyonu #3</h3>
        <div className={`station-status ${isActive ? 'active' : 'inactive'}`}>
          <div className="status-dot"></div>
          <span>{isActive ? 'Aktif' : 'Pasif'}</span>
        </div>
      </div>
      
      <div className="canvas-container">
        <Canvas shadows camera={{ position: [3, 2, 3], fov: 50 }}>
          {/* Işıklandırma */}
          <ambientLight intensity={0.5} />
          <directionalLight 
            position={[5, 5, 5]} 
            intensity={1} 
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <pointLight position={[-5, 5, -5]} intensity={0.5} color="#0ea5e9" />
          <spotLight 
            position={[0, 5, 0]} 
            angle={0.3} 
            penumbra={1} 
            intensity={0.8} 
            castShadow
          />
          
          {/* 3D Model with Suspense */}
          <Suspense fallback={<Loader />}>
            <ModelSelector modelType={modelType} />
          </Suspense>
          
          {/* Zemin */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
            <planeGeometry args={[10, 10]} />
            <meshStandardMaterial 
              color="#f1f5f9" 
              metalness={0.1} 
              roughness={0.8}
            />
          </mesh>
          
          {/* Grid Helper */}
          <gridHelper args={[10, 10, '#cbd5e1', '#e2e8f0']} position={[0, -0.99, 0]} />
          
          {/* Kontroller */}
          <OrbitControls 
            enableZoom={true}
            enablePan={true}
            minDistance={2}
            maxDistance={8}
            maxPolarAngle={Math.PI / 2}
          />
          
          {/* Çevre */}
          <Environment preset="city" />
        </Canvas>
      </div>
      
      <div className="station-controls">
        <button 
          className={`model-btn ${modelType === 'glb' ? 'active' : ''}`}
          onClick={() => setModelType('glb')}
          title="Blender'dan export edilmiş GLB model"
        >
          🎨 GLB Model
        </button>
        <button 
          className={`model-btn ${modelType === 'obj' ? 'active' : ''}`}
          onClick={() => setModelType('obj')}
          title="OBJ format model"
        >
          📦 OBJ Model
        </button>
        <button 
          className={`model-btn ${modelType === 'fallback' ? 'active' : ''}`}
          onClick={() => setModelType('fallback')}
          title="Basit geometrik model"
        >
          🔷 Basit Model
        </button>
      </div>
      
      <div className="station-info">
        <div className="info-item">
          <span className="info-label">Güç:</span>
          <span className="info-value">150 kW</span>
        </div>
        <div className="info-item">
          <span className="info-label">Protokol:</span>
          <span className="info-value">OCPP 1.6J</span>
        </div>
        <div className="info-item">
          <span className="info-label">Durum:</span>
          <span className="info-value success">Çalışıyor</span>
        </div>
      </div>
      
      {modelType === 'glb' && (
        <div className="model-note">
          💡 GLB modeli yüklenemiyorsa: <a href="/BLENDER_EXPORT_GUIDE.md" target="_blank">Export Rehberi</a>
        </div>
      )}
    </div>
  );
}
