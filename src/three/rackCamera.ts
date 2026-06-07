import * as THREE from "three";

/** Axis-aligned bounds of the generated rack model (world space). */
export const RACK_BOX = new THREE.Box3(
  new THREE.Vector3(-0.88, -0.68, -0.12),
  new THREE.Vector3(0.88, 1.82, 0.48),
);

export const RACK_CENTER = new THREE.Vector3(0, 0.55, 0.12);

/** < 1 = closer camera, rack appears larger (still fits full bounds at 0° / 0° tilt). */
const FIT_PADDING = 0.88;

/**
 * Position a perspective camera to frame the full rack on load / resize.
 */
export function frameRack(
  camera: THREE.PerspectiveCamera,
  aspect: number,
  target = RACK_CENTER,
): void {
  const sphere = RACK_BOX.getBoundingSphere(new THREE.Sphere());
  const center = target.clone();
  const radius = sphere.radius * FIT_PADDING;

  const vFov = (camera.fov * Math.PI) / 180;
  const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);

  const distV = radius / Math.sin(vFov / 2);
  const distH = radius / Math.sin(hFov / 2);
  const distance = Math.max(distV, distH);

  camera.position.set(center.x, center.y, center.z + distance);
  camera.lookAt(center);
  camera.near = 0.1;
  camera.far = Math.max(50, distance * 3);
  camera.updateProjectionMatrix();
}
