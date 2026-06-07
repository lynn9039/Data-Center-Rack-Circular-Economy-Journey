import * as THREE from "three";
import type { SubPart } from "../../data/types";
import { COMPONENT_VISUALS } from "../rackModelConfig";
import {
  buildSubPartVisual,
  classifySubPart,
  themeForComponent,
  type SubPartKind,
  type UnitDimensions,
} from "./subPartVisuals";

export interface AssemblyLayer {
  subPart: SubPart;
  kind: SubPartKind;
  group: THREE.Group;
  home: THREE.Vector3;
  explode: THREE.Vector3;
}

export interface ComponentAssembly {
  root: THREE.Group;
  layers: AssemblyLayer[];
  displayScale: number;
}

const DETAIL_SCALE = 1;

const HOME_OFFSET: Partial<Record<SubPartKind, [number, number, number]>> = {
  enclosure: [0, 0, 0],
  pcb: [0, -0.015, 0.04],
  psu: [0.22, -0.03, -0.1],
  heatsink: [0, 0.05, 0.06],
  fan: [0, 0, 0.14],
  module: [-0.08, 0.02, 0.02],
  cable: [0, 0.01, 0.18],
  metal: [0, -0.02, -0.08],
  generic: [0, 0, 0],
};

function explodeOffset(kind: SubPartKind, index: number, total: number): THREE.Vector3 {
  const angle = (index / Math.max(total, 1)) * Math.PI * 2 - Math.PI / 2;
  const radius = 0.55 + (index % 3) * 0.12;
  const presets: Partial<Record<SubPartKind, [number, number, number]>> = {
    enclosure: [-0.85, 0.12, 0.02],
    pcb: [0.82, -0.08, 0.06],
    psu: [0.42, -0.38, -0.18],
    heatsink: [0, 0.58, 0.12],
    fan: [-0.35, 0.22, 0.45],
    module: [0.55, 0.18, -0.12],
    cable: [0, -0.42, 0.35],
    metal: [-0.45, -0.35, -0.22],
  };
  if (presets[kind]) return new THREE.Vector3(...presets[kind]!);
  return new THREE.Vector3(Math.cos(angle) * radius, (index - total / 2) * 0.14, Math.sin(angle) * radius * 0.45);
}

function normalizeDims(componentId: string): UnitDimensions {
  const visual = COMPONENT_VISUALS.find((v) => v.id === componentId);
  if (!visual) return { w: 1.05, h: 0.28, d: 0.62 };
  const [w, h, d] = visual.size;
  const max = Math.max(w, h, d);
  const target = 1.05 / max;
  return { w: w * target, h: h * target, d: d * target };
}

export function buildComponentAssembly(componentId: string, subParts: SubPart[]): ComponentAssembly {
  const theme = themeForComponent(componentId);
  const dims = normalizeDims(componentId);
  const root = new THREE.Group();
  root.name = `assembly-${componentId}`;

  const layers: AssemblyLayer[] = subParts.map((subPart, index) => {
    const kind = classifySubPart(subPart);
    const group = buildSubPartVisual(kind, dims, theme);
    group.name = subPart.id;

    const homeArr = HOME_OFFSET[kind] ?? [0, 0, 0];
    const home = new THREE.Vector3(homeArr[0] * dims.w, homeArr[1] * dims.h, homeArr[2] * dims.d);
    const explode = explodeOffset(kind, index, subParts.length);

    group.position.copy(home);
    root.add(group);

    return { subPart, kind, group, home, explode };
  });

  root.scale.setScalar(DETAIL_SCALE);
  return { root, layers, displayScale: DETAIL_SCALE };
}

export function setLayerHighlight(layer: AssemblyLayer, active: boolean, strength = 1) {
  layer.group.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return;
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
    for (const m of mats) {
      if (!(m instanceof THREE.MeshStandardMaterial)) continue;
      if (!m.userData.baseEmissive) {
        m.userData.baseEmissive = m.emissive.getHex();
        m.userData.baseEmissiveIntensity = m.emissiveIntensity;
      }
      if (active) {
        m.emissive.setHex(0x3d9eff);
        m.emissiveIntensity = 0.18 + 0.22 * strength;
      } else {
        m.emissive.setHex(m.userData.baseEmissive as number);
        m.emissiveIntensity = m.userData.baseEmissiveIntensity as number;
      }
    }
  });
}

export function applyViewMode(layers: AssemblyLayer[], mode: "assembled" | "deconstructed") {
  const hasEnclosure = layers.some((l) => l.kind === "enclosure");
  const count = layers.length;
  /** Even vertical slots — top to bottom, filling the showcase frame. */
  const stackSpan = Math.max(1.15, count * 0.28);
  const step = count > 1 ? stackSpan / (count - 1) : 0;
  const originY = stackSpan / 2;

  layers.forEach((layer, index) => {
    setLayerHighlight(layer, false);
    if (mode === "assembled") {
      layer.group.visible = hasEnclosure ? layer.kind === "enclosure" : index === 0;
      layer.group.position.copy(layer.home);
      layer.group.scale.setScalar(1);
      return;
    }
    layer.group.visible = true;
    layer.group.position.set(0, originY - index * step, 0);
    layer.group.scale.setScalar(0.92);
  });
}

export function resetAssembly(layers: AssemblyLayer[]) {
  applyViewMode(layers, "assembled");
}
