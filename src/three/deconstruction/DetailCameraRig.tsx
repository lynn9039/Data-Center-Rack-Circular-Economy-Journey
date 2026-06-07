import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { DeconstructionViewMode } from "../ComponentExplodedModel";
import { frameDetailAssembly } from "./detailCamera";

export function DetailCameraRig({
  root,
  mode,
}: {
  root: THREE.Object3D | null;
  mode: DeconstructionViewMode;
}) {
  const { camera, size } = useThree();

  useEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera) || !root) return;
    const aspect = size.width / Math.max(size.height, 1);
    const id = requestAnimationFrame(() => {
      frameDetailAssembly(camera, root, aspect, mode);
    });
    return () => cancelAnimationFrame(id);
  }, [camera, root, mode, size.width, size.height]);

  return null;
}
