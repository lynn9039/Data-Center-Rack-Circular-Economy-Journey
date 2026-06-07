import * as THREE from "three";
import type { DeconstructionViewMode } from "../ComponentExplodedModel";

const FIT_PADDING_ASSEMBLED = 1.2;
const FIT_PADDING_DECONSTRUCTED = 1.05;

export function getVisibleBounds(root: THREE.Object3D): THREE.Box3 {
  const box = new THREE.Box3();
  root.updateWorldMatrix(true, true);
  root.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh) || !obj.visible) return;
    box.expandByObject(obj);
  });
  if (box.isEmpty()) {
    box.setFromCenterAndSize(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1.2, 0.4, 0.8));
  }
  return box;
}

/** Frame the visible assembly — 3/4 product shot with full model in view. */
export function frameDetailAssembly(
  camera: THREE.PerspectiveCamera,
  root: THREE.Object3D | null,
  aspect: number,
  mode: DeconstructionViewMode,
): void {
  if (!root) return;

  const box = getVisibleBounds(root);
  const center = box.getCenter(new THREE.Vector3());
  const sphere = box.getBoundingSphere(new THREE.Sphere());
  const padding = mode === "deconstructed" ? FIT_PADDING_DECONSTRUCTED : FIT_PADDING_ASSEMBLED;
  const radius = sphere.radius * padding;

  const vFov = (camera.fov * Math.PI) / 180;
  const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);
  const distV = radius / Math.sin(vFov / 2);
  const distH = radius / Math.sin(hFov / 2);
  const distance = Math.max(distV, distH);

  const yaw = mode === "assembled" ? 0.5 : 0.12;
  const pitch = mode === "assembled" ? 0.06 : 0;

  camera.position.set(
    center.x + Math.sin(yaw) * distance * 0.92,
    center.y + pitch * distance,
    center.z + Math.cos(yaw) * distance,
  );
  camera.lookAt(center);
  camera.near = 0.02;
  camera.far = Math.max(40, distance * 4);
  camera.updateProjectionMatrix();
}
