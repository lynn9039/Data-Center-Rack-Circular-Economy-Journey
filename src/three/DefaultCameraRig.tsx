import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useAppStore } from "../state/store";
import { frameRack } from "./rackCamera";

/** Frames the full rack on load, resize, and when the user resets the view. */
export function DefaultCameraRig() {
  const { camera, size } = useThree();
  const viewResetKey = useAppStore((s) => s.viewResetKey);

  useEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return;
    const aspect = size.width / Math.max(size.height, 1);
    frameRack(camera, aspect);
  }, [camera, size.width, size.height, viewResetKey]);

  return null;
}
