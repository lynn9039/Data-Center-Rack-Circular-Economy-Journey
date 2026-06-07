import { useMemo, useEffect, useRef } from "react";
import { type ThreeEvent, useThree } from "@react-three/fiber";
import { useRackRotation } from "./useRackRotation";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useAppStore } from "../state/store";
import {
  RACK_COMPONENT_IDS,
  RACK_GLB_URL,
  SELECTION_COLOR,
  SELECTION_EMISSIVE,
  type RackComponentId,
} from "./rackModelConfig";
import { upgradeMaterialTextures } from "./upgradeTextures";

useGLTF.preload(RACK_GLB_URL);

const COMPONENT_ID_SET = new Set<string>(RACK_COMPONENT_IDS);

function resolveComponentId(object: THREE.Object3D): RackComponentId | null {
  let current: THREE.Object3D | null = object;
  while (current) {
    if (COMPONENT_ID_SET.has(current.name)) {
      return current.name as RackComponentId;
    }
    current = current.parent;
  }
  return null;
}

const SOFT_TOP_UNITS = new Set<RackComponentId>(["cooling-1", "cabling-1"]);

const MAX_METALNESS = 0.32;
const MIN_ROUGHNESS = 0.52;
const ENV_INTENSITY = 0.35;

/** Cap specular / environment reflections across the whole rack. */
function capReflections(root: THREE.Object3D) {
  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh) || child.name === "floor") return;
    const mats = Array.isArray(child.material) ? child.material : [child.material];
    mats.forEach((mat) => {
      if (!(mat instanceof THREE.MeshStandardMaterial)) return;
      mat.metalness = Math.min(mat.metalness, MAX_METALNESS);
      mat.roughness = Math.max(mat.roughness, MIN_ROUGHNESS);
      if ("envMapIntensity" in mat) {
        (mat as THREE.MeshStandardMaterial & { envMapIntensity: number }).envMapIntensity = ENV_INTENSITY;
      }
    });
  });
}

/** Cooling / cabling upper faces (stripe, fans, cables) — extra matte finish. */
function toneDownSoftBayUnits(root: THREE.Object3D) {
  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    const compId = resolveComponentId(child);
    if (!compId || !SOFT_TOP_UNITS.has(compId)) return;

    const n = child.name;
    const isTopDetail =
      n.includes("stripe") ||
      n.includes("label") ||
      n.includes("fan") ||
      n.includes("cable") ||
      n.includes("vent-grille") ||
      n.includes("bezel");

    const mats = Array.isArray(child.material) ? child.material : [child.material];
    mats.forEach((mat) => {
      if (!(mat instanceof THREE.MeshStandardMaterial)) return;
      mat.color.multiplyScalar(isTopDetail ? 0.65 : 0.82);
      mat.emissiveIntensity *= isTopDetail ? 0.12 : 0.35;
      mat.metalness = Math.min(mat.metalness, isTopDetail ? 0.22 : 0.28);
      mat.roughness = Math.max(mat.roughness, isTopDetail ? 0.68 : 0.58);
      if ("envMapIntensity" in mat) {
        (mat as THREE.MeshStandardMaterial & { envMapIntensity: number }).envMapIntensity = isTopDetail
          ? 0.15
          : 0.25;
      }
    });
  });
}

function applySelectionHighlight(root: THREE.Object3D, selectedId: string | null) {
  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    const compId = resolveComponentId(child);
    if (!compId) return;

    const mats = Array.isArray(child.material) ? child.material : [child.material];
    mats.forEach((mat) => {
      if (!(mat instanceof THREE.MeshStandardMaterial)) return;
      if (!mat.userData.baseColor) {
        mat.userData.baseColor = mat.color.getHex();
        mat.userData.baseEmissive = mat.emissive.getHex();
        mat.userData.baseEmissiveIntensity = mat.emissiveIntensity;
      }
      if (compId === selectedId) {
        mat.color.set(SELECTION_COLOR);
        mat.emissive.set(SELECTION_EMISSIVE);
        mat.emissiveIntensity = 0.45;
      } else {
        mat.color.setHex(mat.userData.baseColor as number);
        mat.emissive.setHex(mat.userData.baseEmissive as number);
        mat.emissiveIntensity = mat.userData.baseEmissiveIntensity as number;
      }
    });
  });
}

interface RackGltfModelProps {
  angleDeg: number;
  pitchDeg: number;
}

export function RackGltfModel({ angleDeg, pitchDeg }: RackGltfModelProps) {
  const { scene } = useGLTF(RACK_GLB_URL);
  const { gl } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  useRackRotation(groupRef, angleDeg, pitchDeg);
  const selectedId = useAppStore((s) => s.selectedComponentId);
  const selectComponent = useAppStore((s) => s.selectComponent);
  const consumeRackDrag = useAppStore((s) => s.consumeRackDrag);

  const model = useMemo(() => {
    const clone = scene.clone(true);
    const maxAniso = gl.capabilities.getMaxAnisotropy();
    upgradeMaterialTextures(clone, maxAniso);
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach((mat) => {
          if (mat instanceof THREE.MeshStandardMaterial && mat.map) {
            mat.map.colorSpace = THREE.SRGBColorSpace;
          }
        });
      }
    });
    capReflections(clone);
    toneDownSoftBayUnits(clone);
    return clone;
  }, [scene, gl]);

  useEffect(() => {
    applySelectionHighlight(model, selectedId);
  }, [model, selectedId]);

  return (
    <group ref={groupRef}>
      <primitive
        object={model}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          if (consumeRackDrag()) return;
          const id = resolveComponentId(e.object);
          if (id) selectComponent(id);
        }}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => {
          const id = resolveComponentId(e.object);
          if (id) document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "grab";
        }}
      />
    </group>
  );
}
