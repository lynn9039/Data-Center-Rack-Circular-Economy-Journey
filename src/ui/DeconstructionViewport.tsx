import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment } from "@react-three/drei";
import * as THREE from "three";
import type { SubPart } from "../data/types";
import { SCENE_BG } from "../three/rackVisualTheme";
import { ComponentExplodedModel, type DeconstructionViewMode } from "../three/ComponentExplodedModel";

export interface DeconstructionViewportProps {
  componentId: string;
  subParts: SubPart[];
  mode: DeconstructionViewMode;
}

export function DeconstructionViewport({ componentId, subParts, mode }: DeconstructionViewportProps) {
  return (
    <Canvas
      camera={{ fov: 30, near: 0.05, far: 30, position: [0, 0, 4] }}
      dpr={[1, 2]}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.08,
      }}
      style={{ width: "100%", height: "100%", background: SCENE_BG }}
    >
      <color attach="background" args={[SCENE_BG]} />
      <Environment preset="warehouse" environmentIntensity={0.48} />
      <ambientLight intensity={mode === "deconstructed" ? 0.62 : 0.52} />
      <hemisphereLight args={["#d8e4f0", "#5a7088", mode === "deconstructed" ? 0.62 : 0.55]} />
      <directionalLight position={[2.5, 5, 3.5]} intensity={mode === "deconstructed" ? 1.35 : 1.15} castShadow />
      <directionalLight position={[-4, 2.5, -1.5]} intensity={0.45} color="#a8bdd0" />
      <directionalLight position={[0, 0, 4]} intensity={mode === "deconstructed" ? 0.55 : 0.2} color="#c8d8e8" />
      <pointLight position={[0, 0.4, 2]} intensity={0.15} color="#5eb0ff" distance={6} />
      <ContactShadows position={[0, -0.55, 0]} opacity={0.1} blur={2.5} scale={5} far={2} color="#6b8498" />
      <Suspense fallback={null}>
        <ComponentExplodedModel componentId={componentId} subParts={subParts} mode={mode} />
      </Suspense>
    </Canvas>
  );
}

export type { DeconstructionViewMode };
