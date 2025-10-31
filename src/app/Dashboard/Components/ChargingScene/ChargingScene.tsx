import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, useProgress, Html } from '@react-three/drei';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import './ChargingScene.css';

// Loading component
function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="loader-container">
        <div className="loader-spinner"></div>
        <p className="loader-text">Modeller yükleniyor... {progress.toFixed(0)}%</p>
      </div>
    </Html>
  );
}

// Tesla Model (OBJ)
function TeslaModel() {
  const obj = useLoader(OBJLoader, '/media/Tesla Model.obj');

  React.useEffect(() => {
    if (obj) {
      obj.traverse((child: THREE.Object3D) => {
        if (child instanceof THREE.Mesh) {
          child.material = new THREE.MeshStandardMaterial({
            color: '#2563eb',
            metalness: 0.7,
            roughness: 0.3,
          });
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    }
  }, [obj]);

  return (
    <group scale={0.01} position={[-2, 0, 0]} rotation={[0, Math.PI / 4, 0]}>
      <primitive object={obj} />
    </group>
  );
}

// Charge Station Model (OBJ)
function ChargeStationModel() {
  const obj = useLoader(OBJLoader, '/media/Elrctric Vehicle Charger.obj');

  React.useEffect(() => {
    if (obj) {
      obj.traverse((child: THREE.Object3D) => {
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
    <group scale={0.01} position={[2, 0, 0]} rotation={[0, -Math.PI / 4, 0]}>
      <primitive object={obj} />
    </group>
  );
}

// Charging cable connecting them
function ChargingCable() {
  return (
    <group>
      {/* Cable from station to car */}
      <mesh position={[0, 0.5, 0]} rotation={[0, 0, -0.2]}>
        <cylinderGeometry args={[0.03, 0.03, 4, 16]} />
        <meshStandardMaterial color="#2563eb" metalness={0.8} roughness={0.3} />
      </mesh>
      
      {/* Connector plug */}
      <mesh position={[-1.8, 0.3, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.2, 16]} />
        <meshStandardMaterial 
          color="#10b981" 
          emissive="#10b981" 
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  );
}

export default function ChargingScene() {
  return (
    <div className="charging-scene">
      <div className="scene-header">
        <h3>🔌 Şarj İstasyonu & Tesla Model 3</h3>
        <div className="scene-status">
          <div className="status-indicator charging"></div>
          <span>Şarj Ediliyor</span>
        </div>
      </div>
      
      <div className="canvas-container">
        <Canvas 
          shadows 
          camera={{ position: [5, 3, 5], fov: 50 }}
        >
          {/* Işıklandırma */}
          <ambientLight intensity={0.5} />
          <directionalLight 
            position={[5, 5, 5]} 
            intensity={1} 
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <pointLight position={[-5, 5, -5]} intensity={0.5} color="#3b82f6" />
          <spotLight 
            position={[0, 8, 0]} 
            angle={0.4} 
            penumbra={1} 
            intensity={1} 
            castShadow
          />
          
          {/* 3D Models */}
          <Suspense fallback={<Loader />}>
            <TeslaModel />
            <ChargeStationModel />
            <ChargingCable />
          </Suspense>
          
          {/* Zemin */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
            <planeGeometry args={[15, 15]} />
            <meshStandardMaterial 
              color="#f1f5f9" 
              metalness={0.1} 
              roughness={0.8}
            />
          </mesh>
          
          {/* Grid */}
          <gridHelper args={[15, 15, '#cbd5e1', '#e2e8f0']} position={[0, -0.09, 0]} />
          
          {/* Kontroller - Otomatik döndürme KAPALI */}
          <OrbitControls 
            enableZoom={true}
            enablePan={true}
            minDistance={4}
            maxDistance={15}
            maxPolarAngle={Math.PI / 2}
            autoRotate={false}
          />
          
          {/* Çevre */}
          <Environment preset="city" />
        </Canvas>
      </div>
      
      <div className="scene-info">
        <div className="info-item">
          <span className="info-label">🚗 Tesla Batarya</span>
          <span className="info-value charging">%45 → %78</span>
        </div>
        
        <div className="info-item">
          <span className="info-label">⚡ Şarj Gücü</span>
          <span className="info-value">150 kW</span>
        </div>
        
        <div className="info-item">
          <span className="info-label">⏱️ Kalan Süre</span>
          <span className="info-value">18 dakika</span>
        </div>
        
        <div className="info-item">
          <span className="info-label">🔌 Protokol</span>
          <span className="info-value">OCPP 1.6J</span>
        </div>
        
        <div className="info-item">
          <span className="info-label">📡 Durum</span>
          <span className="info-value success">Aktif</span>
        </div>
        
        <div className="info-item">
          <span className="info-label">🛡️ Güvenlik</span>
          <span className="info-value success">Normal</span>
        </div>
      </div>
    </div>
  );
}

