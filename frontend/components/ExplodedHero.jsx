'use client';
import { Canvas } from '@react-three/fiber';
import { Center, useGLTF, OrbitControls } from '@react-three/drei';

function DishModel() {
  // This looks for your 3D model inside public/models/
  const { scene } = useGLTF('/models/signature-dish.glb');
  return (
    <Center>
      <primitive object={scene} scale={1.2} />
    </Center>
  );
}

export default function ExplodedHero() {
  return (
    <div className="relative w-full h-screen bg-[#050505]">
      {/* Tech HUD Overlay */}
      <div className="absolute top-12 left-12 text-white z-10 font-mono text-sm tracking-widest opacity-90 pointer-events-none">
        <p className="text-red-500 font-bold">REC: 00:00:04:12</p>
        <h1 className="text-4xl font-extrabold mt-2 tracking-tight">03. SIGNATURE DISH</h1>
        <p className="text-gray-400 text-xs mt-1">EXPLODED VIEW // 3D INTERACTIVE</p>
      </div>

      {/* 3D Canvas */}
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={1.5} />
        <directionalLight position={[10, 10, 5]} intensity={2.5} />
        <DishModel />
        {/* Allows you to rotate the model with your mouse for now */}
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  );
}