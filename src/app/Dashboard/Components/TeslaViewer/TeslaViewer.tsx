import React, { Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, useProgress, Html } from '@react-three/drei';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import './TeslaViewer.css';

// Loading component
function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="loader-container">
        <div className="loader-spinner"></div>
        <p className="loader-text">Tesla Model 3 yükleniyor...</p>
        <p className="loader-percent">{progress.toFixed(0)}%</p>
        <div className="loader-bar">
          <div className="loader-bar-fill" style={{ width: `${progress}%` }}></div>
        </div>
      </div>
    </Html>
  );
}

// Tesla Model Component
function TeslaModel() {
  const obj = useLoader(OBJLoader, '/media/Tesla Model.obj');

  React.useEffect(() => {
    console.log('Tesla Model yüklendi!', obj);
    
    // Model boyutunu hesapla
    const box = new THREE.Box3().setFromObject(obj);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    console.log('Model Merkezi:', center);
    console.log('Model Boyutu:', size);
    console.log('Max boyut:', Math.max(size.x, size.y, size.z));
    
    if (obj) {
      obj.traverse((child: THREE.Object3D) => {
        if (child instanceof THREE.Mesh) {
          // Cam parçalarını tespit et (genelde 'glass', 'window' gibi isimler içerir)
          const isGlass = child.name.toLowerCase().includes('glass') || 
                         child.name.toLowerCase().includes('window') ||
                         child.name.toLowerCase().includes('windshield');
          
          if (isGlass) {
            // Camlar - Şeffaf
            child.material = new THREE.MeshPhysicalMaterial({
              color: '#e0f2fe',
              metalness: 0.1,
              roughness: 0.1,
              transparent: true,
              opacity: 0.3,
              transmission: 0.9,
              ior: 1.5,
            });
          } else {
            // Gövde - Beyaz
            child.material = new THREE.MeshStandardMaterial({
              color: '#ffffff',
              metalness: 0.8,
              roughness: 0.2,
            });
          }
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    }
  }, [obj]);

  return (
    <group scale={1} position={[0, 0, 0]} rotation={[0, 0, 0]}>
      <primitive object={obj} />
    </group>
  );
}

// Error Boundary
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Tesla Model yükleme hatası:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Html center>
          <div className="error-container">
            <h3>❌ Model Yüklenemedi</h3>
            <p>{this.state.error?.message}</p>
            <p>Dosya yolu: /media/Tesla Model.obj</p>
          </div>
        </Html>
      );
    }
    return this.props.children;
  }
}

export default function TeslaViewer() {
  return (
    <div className="tesla-viewer">
      <div className="viewer-header">
        <h3>🚗 Tesla Model 3</h3>
        <div className="model-badge">
          <span>OBJ Format</span>
        </div>
      </div>
      
      <div className="canvas-container">
        <Canvas 
          shadows 
          camera={{ position: [10, 5, 10], fov: 60 }}
        >
          <ambientLight intensity={0.6} />
          <directionalLight 
            position={[10, 10, 5]} 
            intensity={1.5} 
            castShadow
          />
          <pointLight position={[-5, 5, -5]} intensity={0.5} color="#3b82f6" />
          <spotLight 
            position={[0, 10, 0]} 
            angle={0.4} 
            penumbra={1} 
            intensity={1.2} 
            castShadow
          />
          
          <ErrorBoundary>
            <Suspense fallback={<Loader />}>
              <TeslaModel />
            </Suspense>
          </ErrorBoundary>
          
          {/* Zemin */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
            <planeGeometry args={[20, 20]} />
            <meshStandardMaterial color="#f1f5f9" />
          </mesh>
          
          <gridHelper args={[20, 20, '#cbd5e1', '#e2e8f0']} position={[0, -0.09, 0]} />
          
          <OrbitControls 
            enableZoom={true}
            enablePan={true}
            minDistance={1}
            maxDistance={50}
            maxPolarAngle={Math.PI / 2}
            autoRotate={false}
          />
          
          <Environment preset="sunset" />
        </Canvas>
      </div>
      
      <div className="viewer-info">
        <div className="info-item">
          <span className="label">Model:</span>
          <span className="value">Tesla Model 3</span>
        </div>
        <div className="info-item">
          <span className="label">Format:</span>
          <span className="value">OBJ</span>
        </div>
        <div className="info-item">
          <span className="label">Durum:</span>
          <span className="value status-live">Canlı</span>
        </div>
      </div>
    </div>
  );
}

