'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Property } from '@/types';
import { RotateCw, Sun, Moon, Layers, Compass, RotateCcw } from 'lucide-react';

interface Property3DVisualizerProps {
  property: Property;
  className?: string;
}

function isWebGLAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

export const Property3DVisualizer: React.FC<Property3DVisualizerProps> = ({
  property,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const reqIdRef = useRef<number | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);

  const [webglSupported, setWebglSupported] = useState(true);
  const [isNightMode, setIsNightMode] = useState(true);
  const [isWireframe, setIsWireframe] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);

  // Property structural dimensions
  const isLand =
    property.property_type === 'commercial_land' ||
    property.property_type === 'agriculture_land';

  const frontage = property.land_details?.frontage_meter || 10;
  const depth =
    property.land_details?.depth_meter ||
    (property.area_sqm ? Math.max(12, Math.round(property.area_sqm / frontage)) : 20);
  const floors = property.floors || (property.property_type === 'building' ? 5 : 2);

  // Check reduced motion preference & WebGL capability
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!isWebGLAvailable()) {
        setWebglSupported(false);
        return;
      }
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced) {
        setAutoRotate(false);
      }
    }
  }, []);

  const handleResetCamera = () => {
    if (cameraRef.current && modelGroupRef.current) {
      cameraRef.current.position.set(30, 24, 34);
      cameraRef.current.lookAt(0, 4, 0);
      modelGroupRef.current.rotation.set(0, 0, 0);
    }
  };

  useEffect(() => {
    if (!webglSupported) return;

    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 400;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(isNightMode ? 0x090d16 : 0x1e293b);
    scene.fog = new THREE.FogExp2(isNightMode ? 0x090d16 : 0x1e293b, 0.018);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    cameraRef.current = camera;
    camera.position.set(30, 24, 34);
    camera.lookAt(0, 4, 0);

    // 3. Renderer
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      setWebglSupported(false);
      return;
    }
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(
      isNightMode ? 0x475569 : 0xffffff,
      isNightMode ? 0.9 : 1.2
    );
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(
      isNightMode ? 0x38bdf8 : 0xfef08a,
      isNightMode ? 1.5 : 2.2
    );
    dirLight.position.set(25, 40, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    // Ground Grid
    const gridHelper = new THREE.GridHelper(60, 30, 0xd97706, 0x1e293b);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // Group for rotatable architectural elements
    const modelGroup = new THREE.Group();
    modelGroupRef.current = modelGroup;
    scene.add(modelGroup);

    // Ground Parcel Outline (Lot Boundary)
    const lotWidth = Math.min(Math.max(frontage, 6), 30);
    const lotLength = Math.min(Math.max(depth, 8), 40);

    const parcelGeo = new THREE.BoxGeometry(lotWidth, 0.2, lotLength);
    const parcelMat = new THREE.MeshStandardMaterial({
      color: isLand ? 0x15803d : 0x0f172a,
      roughness: 0.8,
      wireframe: isWireframe,
    });
    const parcelMesh = new THREE.Mesh(parcelGeo, parcelMat);
    parcelMesh.position.y = 0.1;
    parcelMesh.receiveShadow = true;
    modelGroup.add(parcelMesh);

    // Boundary edge highlight
    const parcelEdges = new THREE.EdgesGeometry(parcelGeo);
    const edgeLine = new THREE.LineSegments(
      parcelEdges,
      new THREE.LineBasicMaterial({ color: 0xf59e0b, linewidth: 2 })
    );
    parcelMesh.add(edgeLine);

    if (isLand) {
      // Land parcel visualization: Boundary stakes & survey pins
      const stakeGeo = new THREE.CylinderGeometry(0.2, 0.2, 2.5, 8);
      const stakeMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3 });

      const corners = [
        [-lotWidth / 2, -lotLength / 2],
        [lotWidth / 2, -lotLength / 2],
        [-lotWidth / 2, lotLength / 2],
        [lotWidth / 2, lotLength / 2],
      ];

      corners.forEach(([cx, cz]) => {
        const stake = new THREE.Mesh(stakeGeo, stakeMat);
        stake.position.set(cx, 1.25, cz);
        stake.castShadow = true;
        modelGroup.add(stake);

        const topGeo = new THREE.SphereGeometry(0.4, 8, 8);
        const topMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
        const top = new THREE.Mesh(topGeo, topMat);
        top.position.set(cx, 2.5, cz);
        modelGroup.add(top);
      });
    } else {
      // Building / Villa / House architectural volume
      const buildingWidth = Math.max(lotWidth * 0.75, 4);
      const buildingLength = Math.max(lotLength * 0.7, 5);
      const floorHeight = 2.8;
      const totalBuildingHeight = floors * floorHeight;

      const buildingGeo = new THREE.BoxGeometry(
        buildingWidth,
        totalBuildingHeight,
        buildingLength
      );
      const buildingMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.2,
        roughness: 0.4,
        wireframe: isWireframe,
      });
      const buildingMesh = new THREE.Mesh(buildingGeo, buildingMat);
      buildingMesh.position.set(0, totalBuildingHeight / 2 + 0.2, 0);
      buildingMesh.castShadow = true;
      buildingMesh.receiveShadow = true;
      modelGroup.add(buildingMesh);

      // Windows and floor bands
      for (let i = 0; i < floors; i++) {
        const floorY = 0.2 + i * floorHeight + floorHeight / 2;

        const winGeo = new THREE.BoxGeometry(buildingWidth * 0.65, 1.2, 0.1);
        const winMat = new THREE.MeshStandardMaterial({
          color: isNightMode ? 0xfef08a : 0x38bdf8,
          emissive: isNightMode ? 0xf59e0b : 0x0284c7,
          emissiveIntensity: isNightMode ? 0.7 : 0.2,
          roughness: 0.1,
          metalness: 0.9,
        });
        const winMesh = new THREE.Mesh(winGeo, winMat);
        winMesh.position.set(0, floorY, buildingLength / 2 + 0.05);
        modelGroup.add(winMesh);

        const bandGeo = new THREE.BoxGeometry(buildingWidth + 0.3, 0.2, buildingLength + 0.3);
        const bandMat = new THREE.MeshStandardMaterial({ color: 0xd97706 });
        const bandMesh = new THREE.Mesh(bandGeo, bandMat);
        bandMesh.position.set(0, 0.2 + (i + 1) * floorHeight, 0);
        modelGroup.add(bandMesh);
      }

      // Roof parapet
      const parapetGeo = new THREE.BoxGeometry(buildingWidth, 0.8, buildingLength);
      const parapetMat = new THREE.MeshStandardMaterial({ color: 0x334155, wireframe: isWireframe });
      const parapetMesh = new THREE.Mesh(parapetGeo, parapetMat);
      parapetMesh.position.set(0, totalBuildingHeight + 0.4, 0);
      modelGroup.add(parapetMesh);
    }

    // Street Indicator
    const streetGeo = new THREE.BoxGeometry(lotWidth + 10, 0.1, 4);
    const streetMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
    const streetMesh = new THREE.Mesh(streetGeo, streetMat);
    streetMesh.position.set(0, 0.05, lotLength / 2 + 2.5);
    modelGroup.add(streetMesh);

    // Mouse Interaction
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      modelGroup.rotation.y += deltaX * 0.008;
      camera.position.y = Math.max(8, Math.min(45, camera.position.y - deltaY * 0.1));
      camera.lookAt(0, 4, 0);
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY * 0.03;
      camera.position.z = Math.max(15, Math.min(80, camera.position.z + zoomFactor));
    };

    // Touch Interaction
    let touchStartX = 0;
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - touchStartX;
        modelGroup.rotation.y += deltaX * 0.008;
        touchStartX = e.touches[0].clientX;
      }
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domElem.addEventListener('wheel', onWheel, { passive: false });
    domElem.addEventListener('touchstart', onTouchStart, { passive: true });
    domElem.addEventListener('touchmove', onTouchMove, { passive: true });

    // Animation loop
    const animate = () => {
      reqIdRef.current = requestAnimationFrame(animate);
      if (autoRotate && !isDragging) {
        modelGroup.rotation.y += 0.004;
      }
      renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup WebGL resources
    return () => {
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', handleResize);
      domElem.removeEventListener('mousedown', onMouseDown);
      domElem.removeEventListener('wheel', onWheel);
      domElem.removeEventListener('touchstart', onTouchStart);
      domElem.removeEventListener('touchmove', onTouchMove);

      renderer.dispose();
      scene.clear();
    };
  }, [property, isNightMode, isWireframe, autoRotate, frontage, depth, floors, isLand, webglSupported]);

  // Non-3D Fallback if WebGL unavailable
  if (!webglSupported) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 rounded-2xl glass-panel border border-slate-800 text-center text-slate-400 ${className}`}>
        <Compass className="w-10 h-10 text-amber-500 mb-3" />
        <h4 className="font-bold text-white mb-1">بینەری ٣D لەم ئامێرەدا بەردەست نییە</h4>
        <p className="text-xs max-w-sm mb-4">
          ئامێرەکەت یان وێبگەڕەکەت خێرایی گرافیکی WebGL چالاک نەکردووە. زانیارییەکان لە خوارەوە پێشان دراون:
        </p>
        <div className="flex items-center gap-3 text-xs bg-slate-900 px-4 py-2 rounded-xl border border-slate-800 text-amber-400">
          <span>ڕووبەر: <strong>{property.area_sqm} م²</strong></span>
          <span>•</span>
          <span>بەرە: <strong>{frontage}م</strong></span>
          <span>•</span>
          <span>قووڵی: <strong>{depth}م</strong></span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden glass-panel border border-slate-700/80 ${className}`}>
      {/* Three.js Canvas Container */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating HUD Controls */}
      <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-slate-900/85 backdrop-blur-md border border-amber-500/40 text-amber-400">
          <Compass className="w-3.5 h-3.5" />
          {isLand ? 'نەخشەی ئەندازیاری ٣D' : 'مۆدێلی نیشتەجێبوون ٣D'}
        </span>
        <span className="text-[10px] text-amber-300/80 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded border border-amber-500/20">
          * مۆدێلی گریمانەیی بەپێی پێوانە ڕاستەقینەکان
        </span>
      </div>

      <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
        {/* Reset Camera */}
        <button
          type="button"
          onClick={handleResetCamera}
          title="گەڕاندنەوەی گۆشەی بینین"
          className="p-2 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700 text-slate-300 hover:text-amber-400 hover:border-amber-500 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Toggle Night / Day Lighting */}
        <button
          type="button"
          onClick={() => setIsNightMode(!isNightMode)}
          title={isNightMode ? 'ڕۆژ' : 'شەو'}
          className="p-2 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700 text-slate-300 hover:text-amber-400 hover:border-amber-500 transition-all"
        >
          {isNightMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-400" />}
        </button>

        {/* Toggle Wireframe */}
        <button
          type="button"
          onClick={() => setIsWireframe(!isWireframe)}
          title="شێوازی تەلەبەندی / Wireframe"
          className={`p-2 rounded-xl backdrop-blur-md border transition-all ${
            isWireframe
              ? 'bg-amber-500/20 text-amber-400 border-amber-500'
              : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:border-amber-500'
          }`}
        >
          <Layers className="w-4 h-4" />
        </button>

        {/* Toggle Auto Rotation */}
        <button
          type="button"
          onClick={() => setAutoRotate(!autoRotate)}
          title="سوڕانەوەی خۆکار"
          className={`p-2 rounded-xl backdrop-blur-md border transition-all ${
            autoRotate
              ? 'bg-amber-500/20 text-amber-400 border-amber-500'
              : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:border-amber-500'
          }`}
        >
          <RotateCw className="w-4 h-4" />
        </button>
      </div>

      {/* Lot Dimension Overlay */}
      <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800 text-xs text-slate-300">
          <span>ڕووبەر: <strong className="text-amber-400">{property.area_sqm} م²</strong></span>
          <span>•</span>
          <span>بەرە: <strong className="text-amber-400">{frontage} م</strong></span>
          <span>•</span>
          <span>قووڵی: <strong className="text-amber-400">{depth} م</strong></span>
        </div>

        <span className="hidden sm:inline-block text-[11px] text-slate-400 px-2.5 py-1 rounded-lg bg-slate-950/60 backdrop-blur-sm">
          بۆ سوڕاندن دەست لێبدە یان مشک بخشێنە
        </span>
      </div>
    </div>
  );
};
