import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, useProgress, Html } from '@react-three/drei';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';
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
    <group scale={0.8} position={[-0.5, 0, -6]} rotation={[0, Math.PI / 2 + Math.PI, 0]}>
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
    <group scale={0.008} position={[0, 0, -8]} rotation={[0, Math.PI / 2, 0]}>
      <primitive object={obj} />
    </group>
  );
}


export default function ChargingStation() {
  return (
    <div className="charging-station">
      <div className="station-header">
        <h3>🔌 Tesla Model 3 & Şarj İstasyonu</h3>
        <div className="charging-badge">
          <div className="charging-icon">⚡</div>
          <span>Şarj Ediliyor</span>
        </div>
      </div>
      
      <div className="canvas-container">
        <Canvas 
          shadows 
          camera={{ 
            position: [2, 3, -5], 
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
          
          <OrbitControls 
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
            target={[-0.75, 0.5, -8]}
          />
          
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

