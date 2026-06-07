import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type * as THREE from "three";

/** Applies yaw (Y) then pitch (X) to the rack root group. */
export function useRackRotation(
  groupRef: React.RefObject<THREE.Group | null>,
  angleDeg: number,
  pitchDeg: number,
) {
  useFrame(() => {
    const g = groupRef.current;
    if (!g) return;
    g.rotation.order = "YXZ";
    g.rotation.y = (angleDeg * Math.PI) / 180;
    g.rotation.x = (pitchDeg * Math.PI) / 180;
  });
}

export function useRackRotationRef(angleDeg: number, pitchDeg: number) {
  const groupRef = useRef<THREE.Group>(null);
  useRackRotation(groupRef, angleDeg, pitchDeg);
  return groupRef;
}
