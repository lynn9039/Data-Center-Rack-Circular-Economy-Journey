import * as THREE from "three";

import { FLOOR_EMISSIVE } from "./rackVisualTheme";

/** Runtime pass: mipmaps + anisotropic filtering on all maps (fixes rotation shimmer). */
export function upgradeMaterialTextures(root: THREE.Object3D, maxAnisotropy: number) {
  const aniso = Math.min(maxAnisotropy, 16);
  const tune = (tex: THREE.Texture) => {
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = true;
    tex.anisotropy = aniso;
    tex.needsUpdate = true;
  };

  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    if (child.geometry instanceof THREE.BufferGeometry) {
      child.geometry.computeVertexNormals();
    }

    const mats = Array.isArray(child.material) ? child.material : [child.material];
    mats.forEach((mat) => {
      if (!(mat instanceof THREE.MeshStandardMaterial)) return;
      if (mat.map) tune(mat.map);
      if (mat.alphaMap) tune(mat.alphaMap);
      if (mat.normalMap) tune(mat.normalMap);
      mat.flatShading = false;
      if (child.name === "floor") {
        mat.color.setHex(0xffffff);
        mat.emissive.setHex(FLOOR_EMISSIVE);
        mat.emissiveIntensity = 0.28;
        mat.metalness = 0;
        mat.roughness = 0.95;
        if ("envMapIntensity" in mat) {
          (mat as THREE.MeshStandardMaterial & { envMapIntensity: number }).envMapIntensity = 0.45;
        }
        return;
      }
      mat.needsUpdate = true;
    });
  });
}
