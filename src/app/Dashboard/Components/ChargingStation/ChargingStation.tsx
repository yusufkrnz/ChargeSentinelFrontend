import React, { Suspense, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, useProgress, Html } from '@react-three/drei';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { Expand } from 'lucide-react';
import './ChargingStation.css';

// Loading component
function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="loader-container">
        <div className="loader-spinner"></div>
        <p className="loader-text">Yükleniyor... {progress.toFixed(0)}%</p>
      </div>
    </Html>
  );
}

// Tesla Model
function TeslaModel() {
  const obj = useLoader(OBJLoader, '/media/Tesla Model.obj');

  React.useEffect(() => {
    if (obj) {
      console.log(' Tesla Model yüklendi!', obj);
      obj.traverse((child: THREE.Object3D) => {
        if (child instanceof THREE.Mesh) {
          const name = child.name.toLowerCase();
          
          // 🛞 LASTİKLER - GENİŞ EŞLEŞTİRME (Tire, Tyre, Wheel, Rubber, vb.) - SİYAH
          const isTire = name.includes('tire') || 
                        name.includes('tyre') || 
                        name.includes('wheel') || 
                        name.includes('rubber') ||
                        (name.includes('black') && !name.includes('glass')) ||
                        name.includes('sidewall');
          
          if (isTire) {
            console.log('LASTİK BULUNDU:', child.name);
            child.material = new THREE.MeshStandardMaterial({
              color: '#000000', // SİYAH lastik
              metalness: 0.0,
              roughness: 0.95, // Mat, kauçuk gibi
            });
          }
          // 🪟 CAMLAR (Glass, Window, Windshield) - ÇOK FLU, İÇERİ GÖRÜNMESİN
          else if (name.includes('glass') || name.includes('window') || name.includes('windshield')) {
            console.log('🪟 CAM BULUNDU:', child.name);
            child.material = new THREE.MeshPhysicalMaterial({
              color: '#d0e8ff', // Daha açık, buzlu mavi ton
              metalness: 0,
              roughness: 0.3, // Biraz mat (daha flu görünüm)
              transparent: true,
              opacity: 0.08, // ÇOK FLU - içeri görünmesin
              transmission: 0.4, // Düşük transmission = içeri görünmez
              ior: 1.52, // Cam kırılma indeksi
              clearcoat: 1.0,
              clearcoatRoughness: 0.2,
              thickness: 0.5, // Cam kalınlığı efekti
            });
          }
          // GERİ KALAN HER ŞEY - BEYAZ
          else {
            child.material = new THREE.MeshStandardMaterial({
              color: '#ffffff', // Beyaz
              metalness: 0.1, // Düşük metalness = gümüş değil, beyaz boya
              roughness: 0.15, // Biraz parlak ama çok metalik değil
            });
          }
          
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    }
  }, [obj]);

  return (
    <group scale={0.8} position={[0.5, 0, 0]} rotation={[0, Math.PI / 2 + Math.PI, 0]}>
      <primitive object={obj} />
    </group>
  );
}

// Charge Station Model
function ChargeStationModel() {
  const obj = useLoader(OBJLoader, '/media/Elrctric Vehicle Charger.obj');

  React.useEffect(() => {
    if (obj) {
      console.log(' Şarj İstasyonu yüklendi!');
      obj.traverse((child: THREE.Object3D) => {
        if (child instanceof THREE.Mesh) {
          const childName = child.name.toLowerCase();
          console.log('Mesh:', child.name);
          
          if (childName.includes('cable') || childName.includes('wire') || childName.includes('cord')) {
            child.material = new THREE.MeshStandardMaterial({
              color: '#1a1a1a',
              metalness: 0.3,
              roughness: 0.7,
            });
          }
          else if (childName.includes('body') || childName.includes('case') || childName.includes('housing')) {
            child.material = new THREE.MeshStandardMaterial({
              color: '#ffffff',
              metalness: 0.5,
              roughness: 0.3,
            });
          }
          else if (childName.includes('screen') || childName.includes('panel') || childName.includes('display')) {
            child.material = new THREE.MeshStandardMaterial({
              color: '#2d3436',
              metalness: 0.9,
              roughness: 0.1,
            });
          }
          else {
            const colors = ['#ffffff', '#1A36B0', '#2d3436', '#e8e8e8'];
            const colorIndex = Math.abs(child.id % colors.length);
            
            child.material = new THREE.MeshStandardMaterial({
              color: colors[colorIndex],
              metalness: 0.6,
              roughness: 0.4,
            });
          }
          
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    }
  }, [obj]);

  return (
    <group scale={0.008} position={[0, 0, -1.3]} rotation={[0, Math.PI / 2, 0]}>
      <primitive object={obj} />
    </group>
  );
}


// Camera Controller Component
function CameraController({ onInit }: { onInit: (controls: any) => void }) {
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    if (controlsRef.current) {
      onInit(controlsRef.current);
    }
  }, [onInit]);

  return (
    <OrbitControls 
      ref={controlsRef}
      enableZoom={true}
      enablePan={true}
      enableRotate={true}
      minDistance={2}
      maxDistance={15}
      maxPolarAngle={Math.PI / 2.1}
      autoRotate={false}
      autoRotateSpeed={0}
      enableDamping={true}
      dampingFactor={0.05}
      target={[0.25, 0.5, -0.65]}
    />
  );
}

export default function ChargingStation() {
  const controlsRef = useRef<any>(null);

  // Araç ve şarj istasyonunun orta noktasını hesapla
  const centerX = (0.5 + 0) / 2; // 0.25
  const centerZ = (0 + -1.3) / 2; // -0.65

  const resetCamera = () => {
    if (controlsRef.current) {
      // Target'ı ortala
      controlsRef.current.target.set(centerX, 0.5, centerZ);
      // Kamerayı arabanın önünden göster (Z ekseninde negatif taraftan)
      controlsRef.current.object.position.set(centerX - 2, 3, centerZ - 5);
      controlsRef.current.update();
    }
  };

  const handleControlsInit = (controls: any) => {
    controlsRef.current = controls;
    // İlk yüklemede otomatik ortala
    setTimeout(() => {
      resetCamera();
    }, 500);
  };

  return (
    <div className="charging-station">
      <div className="station-header">
        <h3>🔌 Tesla Model 3 & Şarj İstasyonu</h3>
        <div className="charging-badge-container">
          <div className="charging-badge">
            <div className="charging-icon">⚡</div>
            <span>Şarj Ediliyor</span>
          </div>
          <button 
            className="reset-camera-btn" 
            onClick={resetCamera}
            title="Tam Bakış (Ortala)"
          >
            <Expand size={16} />
            <span>Tam Bakış</span>
          </button>
        </div>
      </div>
      
      <div className="canvas-container">
        <Canvas 
          shadows 
          camera={{ 
            position: [centerX - 2, 3, centerZ - 5], 
            fov: 65,
            near: 0.1,
            far: 1000
          }}
        >
          <ambientLight intensity={0.6} />
          <directionalLight 
            position={[10, 10, 5]} 
            intensity={1.5} 
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <pointLight position={[-10, 5, -5]} intensity={0.6} color="#3b82f6" />
          <spotLight 
            position={[0, 12, 0]} 
            angle={0.4} 
            penumbra={1} 
            intensity={1.2} 
            castShadow
          />
          
          <Suspense fallback={<Loader />}>
            <TeslaModel />
            <ChargeStationModel />
          </Suspense>
          
          {/* Sol Çim Kenarı */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-8, -0.03, 0]} receiveShadow>
            <planeGeometry args={[4, 20]} />
            <meshStandardMaterial 
              color="#2d5016"
              metalness={0.0}
              roughness={1}
            />
          </mesh>
          {/* Sol Çim Yüksekliği */}
          {[...Array(15)].map((_, i) => (
            <mesh 
              key={`grass-left-${i}`}
              position={[-7 + (i % 3) * 0.3, 0.1, -9 + Math.floor(i / 3) * 1.5]} 
              castShadow 
              receiveShadow
            >
              <boxGeometry args={[0.2, 0.3, 0.2]} />
              <meshStandardMaterial color="#4a7c1f" roughness={0.9} />
            </mesh>
          ))}
          
          {/* Sağ Çim Kenarı */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[8, -0.03, 0]} receiveShadow>
            <planeGeometry args={[4, 20]} />
            <meshStandardMaterial 
              color="#2d5016"
              metalness={0.0}
              roughness={1}
            />
          </mesh>
          {/* Sağ Çim Yüksekliği */}
          {[...Array(15)].map((_, i) => (
            <mesh 
              key={`grass-right-${i}`}
              position={[7 + (i % 3) * 0.3, 0.1, -9 + Math.floor(i / 3) * 1.5]} 
              castShadow 
              receiveShadow
            >
              <boxGeometry args={[0.2, 0.3, 0.2]} />
              <meshStandardMaterial color="#4a7c1f" roughness={0.9} />
            </mesh>
          ))}
          
          {/* Asfalt Zemin */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
            <planeGeometry args={[20, 20]} />
            <meshStandardMaterial 
              color="#2d3436"
              metalness={0.1}
              roughness={0.9}
            />
          </mesh>
          
          {/* Yol Çizgileri */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]}>
            <planeGeometry args={[0.15, 20]} />
            <meshStandardMaterial 
              color="#dfe6e9"
              metalness={0}
              roughness={1}
            />
          </mesh>
          
          <CameraController onInit={handleControlsInit} />
          
          <Environment preset="city" />
        </Canvas>
      </div>
      
      <div className="station-info">
        <div className="info-item">
          <span className="label">🚗 Araç</span>
          <span className="value">Tesla Model 3 (Beyaz)</span>
        </div>
        <div className="info-item">
          <span className="label">🔋 Batarya</span>
          <span className="value charging">%45 → %78</span>
        </div>
        <div className="info-item">
          <span className="label">⚡ Güç</span>
          <span className="value">150 kW</span>
        </div>
        <div className="info-item">
          <span className="label">🔌 İstasyon</span>
          <span className="value">OCPP 1.6J</span>
        </div>
        <div className="info-item">
          <span className="label">⏱️ Süre</span>
          <span className="value">18 dakika</span>
        </div>
        <div className="info-item">
          <span className="label">📡 Durum</span>
          <span className="value success">Aktif</span>
        </div>
      </div>
    </div>
  );
}

