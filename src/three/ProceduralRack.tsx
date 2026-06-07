import { useRef } from "react";
import * as THREE from "three";
import { useAppStore } from "../state/store";
import { useRackRotation } from "./useRackRotation";
import { COMPONENT_VISUALS } from "./rackModelConfig";
import { FRAME_ALUMINUM, FRAME_PANEL } from "./rackVisualTheme";

function RackFrame() {
  return (
    <group name="rack-frame">
      <mesh position={[0, 0.55, -0.03]} castShadow receiveShadow>
        <boxGeometry args={[1.62, 2.22, 0.07]} />
        <meshStandardMaterial color={`#${FRAME_PANEL.toString(16).padStart(6, "0")}`} metalness={0.55} roughness={0.42} />
      </mesh>
      {[-0.78, 0.78].map((x) => (
        <mesh key={x} position={[x, 0.55, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.06, 2.28, 0.64]} />
          <meshStandardMaterial color={`#${FRAME_ALUMINUM.toString(16).padStart(6, "0")}`} metalness={0.85} roughness={0.22} />
        </mesh>
      ))}
    </group>
  );
}

function RackComponentMesh({
  id,
  position,
  size,
  color,
  metalness,
  roughness,
  onSelect,
}: {
  id: string;
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  metalness: number;
  roughness: number;
  onSelect: (id: string) => void;
}) {
  const selectedId = useAppStore((s) => s.selectedComponentId);
  const consumeRackDrag = useAppStore((s) => s.consumeRackDrag);
  const selected = selectedId === id;

  return (
    <group name={id} position={position}>
      <mesh
        castShadow
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          if (consumeRackDrag()) return;
          onSelect(id);
        }}
        onPointerOver={() => {
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "grab";
        }}
      >
        <boxGeometry args={size} />
        <meshStandardMaterial
          color={selected ? "#5eb0ff" : color}
          metalness={metalness}
          roughness={roughness}
          emissive={selected ? "#2a6aaa" : "#111820"}
          emissiveIntensity={selected ? 0.25 : 0.08}
        />
      </mesh>
    </group>
  );
}

export function ProceduralRack({ angleDeg, pitchDeg }: { angleDeg: number; pitchDeg: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const selectComponent = useAppStore((s) => s.selectComponent);
  useRackRotation(groupRef, angleDeg, pitchDeg);

  return (
    <group ref={groupRef} name="rack-root">
      <RackFrame />
      {COMPONENT_VISUALS.map((c) => (
        <RackComponentMesh key={c.id} {...c} onSelect={selectComponent} />
      ))}
    </group>
  );
}
