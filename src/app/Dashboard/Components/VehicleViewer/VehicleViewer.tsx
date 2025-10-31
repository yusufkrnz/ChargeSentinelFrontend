import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, useProgress, Html } from '@react-three/drei';
import * as THREE from 'three';
import './VehicleViewer.css';

// Loading component
function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="loader-container">
        <div className="loader-spinner"></div>
        <p className="loader-text">Araç yükleniyor... {progress.toFixed(0)}%</p>
      </div>
    </Html>
  );
}

// Simple Car Model
function CarModel() {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <group ref={meshRef} position={[0, 0, 0]}>
      {/* Gövde */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[2, 0.8, 1]} />
        <meshStandardMaterial color="#2563eb" metalness={0.7} roughness={0.3} />
      </mesh>
      
      {/* Üst kabuk */}
      <mesh position={[0, 1, 0]} castShadow>
        <boxGeometry args={[1.2, 0.6, 0.9]} />
        <meshStandardMaterial color="#1e40af" metalness={0.7} roughness={0.3} />
      </mesh>
      
      {/* Camlar */}
      <mesh position={[0.3, 1, 0]} castShadow>
        <boxGeometry args={[0.6, 0.55, 0.85]} />
        <meshStandardMaterial 
          color="#60a5fa" 
          transparent 
          opacity={0.3}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      
      {/* Ön Tekerlek */}
      <group position={[0.7, 0.2, 0.5]}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.25, 0.25, 0.2, 16]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.15, 0.15, 0.21, 16]} />
          <meshStandardMaterial color="#6b7280" metalness={0.9} />
        </mesh>
      </group>
      
      {/* Arka Tekerlek */}
      <group position={[-0.7, 0.2, 0.5]}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.25, 0.25, 0.2, 16]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.15, 0.15, 0.21, 16]} />
          <meshStandardMaterial color="#6b7280" metalness={0.9} />
        </mesh>
      </group>
      
      {/* Ön Tekerlek Diğer Taraf */}
      <group position={[0.7, 0.2, -0.5]}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.25, 0.25, 0.2, 16]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.15, 0.15, 0.21, 16]} />
          <meshStandardMaterial color="#6b7280" metalness={0.9} />
        </mesh>
      </group>
      
      {/* Arka Tekerlek Diğer Taraf */}
      <group position={[-0.7, 0.2, -0.5]}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.25, 0.25, 0.2, 16]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.15, 0.15, 0.21, 16]} />
          <meshStandardMaterial color="#6b7280" metalness={0.9} />
        </mesh>
      </group>
      
      {/* Farlar */}
      <mesh position={[1, 0.4, 0.3]} castShadow>
        <boxGeometry args={[0.05, 0.15, 0.2]} />
        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[1, 0.4, -0.3]} castShadow>
        <boxGeometry args={[0.05, 0.15, 0.2]} />
        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.8} />
      </mesh>
      
      {/* Stop lambası */}
      <mesh position={[-1, 0.5, 0.3]} castShadow>
        <boxGeometry args={[0.05, 0.1, 0.15]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[-1, 0.5, -0.3]} castShadow>
        <boxGeometry args={[0.05, 0.1, 0.15]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} />
      </mesh>
      
      {/* Şarj kapağı */}
      <mesh position={[-0.9, 0.6, -0.5]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.05, 16]} />
        <meshStandardMaterial color="#10b981" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

export default function VehicleViewer() {
  return (
    <div className="vehicle-viewer">
      <div className="viewer-header">
        <h3>🚗 Elektrikli Araç</h3>
        <div className="charging-badge">
          <div className="charging-icon">⚡</div>
          <span>Şarj Oluyor</span>
        </div>
      </div>
      
      <div className="canvas-container">
        <Canvas shadows camera={{ position: [4, 2, 4], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <directionalLight 
            position={[5, 5, 5]} 
            intensity={1} 
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <pointLight position={[-5, 5, -5]} intensity={0.5} color="#3b82f6" />
          <spotLight position={[0, 5, 0]} angle={0.3} penumbra={1} intensity={0.8} castShadow />
          
          <Suspense fallback={<Loader />}>
            <CarModel />
          </Suspense>
          
          {/* Zemin */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
            <planeGeometry args={[10, 10]} />
            <meshStandardMaterial color="#f1f5f9" metalness={0.1} roughness={0.8} />
          </mesh>
          
          <gridHelper args={[10, 10, '#cbd5e1', '#e2e8f0']} position={[0, -0.09, 0]} />
          
          <OrbitControls 
            enableZoom={true}
            enablePan={true}
            minDistance={3}
            maxDistance={10}
            maxPolarAngle={Math.PI / 2}
          />
          
          <Environment preset="sunset" />
        </Canvas>
      </div>
      
      <div className="vehicle-info">
        <div className="info-row">
          <span className="info-label">Model:</span>
          <span className="info-value">Tesla Model 3</span>
        </div>
        <div className="info-row">
          <span className="info-label">Batarya:</span>
          <span className="info-value charging">%45 → %78</span>
        </div>
        <div className="info-row">
          <span className="info-label">Kalan Süre:</span>
          <span className="info-value">18 dakika</span>
        </div>
      </div>
    </div>
  );
}

