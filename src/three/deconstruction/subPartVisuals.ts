import * as THREE from "three";
import type { SubPart } from "../../data/types";
import { BEZEL_COLOR, COMPONENT_COLORS, PORT_COLOR } from "../rackVisualTheme";

export type SubPartKind =
  | "enclosure"
  | "pcb"
  | "psu"
  | "heatsink"
  | "fan"
  | "module"
  | "cable"
  | "metal"
  | "generic";

export interface SubPartTheme {
  body: number;
  accent: number;
}

export interface UnitDimensions {
  w: number;
  h: number;
  d: number;
}

function mat(color: number, opts: { metalness?: number; roughness?: number; emissive?: number; emissiveIntensity?: number } = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    metalness: opts.metalness ?? 0.45,
    roughness: opts.roughness ?? 0.48,
    emissive: opts.emissive ?? 0x000000,
    emissiveIntensity: opts.emissiveIntensity ?? 0,
  });
}

export function classifySubPart(sp: SubPart): SubPartKind {
  const text = `${sp.id} ${sp.name} ${sp.primaryMaterial} ${sp.function}`.toLowerCase();
  if (/enclosure|chassis|housing|bay|frame|form factor/.test(text)) return "enclosure";
  if (/pcb|board|mobo|motherboard|line.?card|controller|backplane|dimm|memory|raid/.test(text)) return "pcb";
  if (/psu|power module|power unit|busbar|metering/.test(text)) return "psu";
  if (/heat|sink|dissip/.test(text)) return "heatsink";
  if (/fan|cooling fan|convection/.test(text)) return "fan";
  if (/gpu|module|line card|drive|controller/.test(text)) return "module";
  if (/fiber|copper|cable|trunk|patch|sas backplane/.test(text)) return "cable";
  if (/bar|metal|steel|al/.test(text)) return "metal";
  return "generic";
}

export function themeForComponent(componentId: string): SubPartTheme {
  const c = COMPONENT_COLORS[componentId];
  if (c) return { body: c.body, accent: c.accent };
  return { body: 0x5a6578, accent: 0x94a3b8 };
}

function addMesh(
  group: THREE.Group,
  geo: THREE.BufferGeometry,
  material: THREE.Material,
  pos: [number, number, number],
  rot?: [number, number, number],
) {
  const mesh = new THREE.Mesh(geo, material);
  mesh.position.set(...pos);
  if (rot) mesh.rotation.set(...rot);
  mesh.castShadow = mesh.receiveShadow = true;
  group.add(mesh);
  return mesh;
}

const STEEL_BODY = 0x8a939f;
const STEEL_DARK = 0x5c6572;
const STEEL_LIGHT = 0xa8b0ba;
const GALV_EDGE = 0x707986;

function brushedSteel(intensity = 1) {
  return mat(STEEL_BODY, { metalness: 0.78 * intensity, roughness: 0.34 });
}

function buildEnclosure(group: THREE.Group, dims: UnitDimensions, theme: SubPartTheme) {
  const { w, h, d } = dims;
  const steel = brushedSteel();
  const steelDark = mat(STEEL_DARK, { metalness: 0.82, roughness: 0.3 });
  const steelLight = mat(STEEL_LIGHT, { metalness: 0.85, roughness: 0.26 });
  const rail = mat(GALV_EDGE, { metalness: 0.88, roughness: 0.22 });
  const bezel = mat(BEZEL_COLOR, { metalness: 0.55, roughness: 0.42 });
  const port = mat(PORT_COLOR, { metalness: 0.55, roughness: 0.48 });
  const vent = mat(0x4a5562, { metalness: 0.62, roughness: 0.45 });

  addMesh(group, new THREE.BoxGeometry(w, h, d, 4, 2, 4), steel, [0, 0, 0]);
  addMesh(group, new THREE.BoxGeometry(w * 0.98, 0.008, d * 0.96), steelLight, [0, h / 2 - 0.004, 0]);
  addMesh(group, new THREE.BoxGeometry(w * 0.98, 0.008, d * 0.96), steelDark, [0, -h / 2 + 0.004, 0]);

  addMesh(group, new THREE.BoxGeometry(w * 0.9, h * 0.52, 0.01), vent, [0, h * 0.1, d / 2 + 0.004]);
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 14; col++) {
      if ((row + col) % 2 === 0) continue;
      addMesh(
        group,
        new THREE.CylinderGeometry(0.004, 0.004, 0.012, 6),
        mat(0x2a3038, { metalness: 0.5, roughness: 0.55 }),
        [-w * 0.38 + col * (w * 0.058), h * 0.1, d / 2 + 0.012],
        [Math.PI / 2, 0, 0],
      );
    }
  }

  addMesh(group, new THREE.BoxGeometry(w * 0.88, h * 0.28, 0.014), bezel, [0, -h * 0.14, d / 2 + 0.006]);
  addMesh(
    group,
    new THREE.BoxGeometry(w * 0.96, 0.01, 0.012),
    mat(theme.accent, { emissive: theme.accent, emissiveIntensity: 0.1, metalness: 0.35, roughness: 0.45 }),
    [0, h / 2 - 0.012, d / 2 + 0.014],
  );
  addMesh(group, new THREE.BoxGeometry(w * 0.22, h * 0.12, 0.008), mat(0x2a3544, { metalness: 0.3, roughness: 0.6 }), [-w * 0.28, h * 0.22, d / 2 + 0.01]);

  for (let p = 0; p < 12; p++) {
    const px = -w * 0.34 + p * (w * 0.062);
    addMesh(group, new THREE.BoxGeometry(w * 0.038, h * 0.08, 0.018), port, [px, -h * 0.16, d / 2 + 0.012]);
    if (p % 2 === 0) {
      addMesh(
        group,
        new THREE.SphereGeometry(0.004, 8, 8),
        mat(0x4ade80, { emissive: 0x22c55e, emissiveIntensity: 0.9 }),
        [px, -h * 0.08, d / 2 + 0.022],
      );
    }
  }

  [-1, 1].forEach((side) => {
    addMesh(group, new THREE.BoxGeometry(0.018, h, d * 0.92), rail, [side * (w / 2 + 0.009), 0, 0]);
    addMesh(group, new THREE.BoxGeometry(0.006, h * 0.92, d * 0.85), steelDark, [side * (w / 2 + 0.002), 0, 0]);
    for (let hole = 0; hole < 4; hole++) {
      addMesh(
        group,
        new THREE.CylinderGeometry(0.008, 0.008, 0.022, 10),
        mat(0x1e2836, { metalness: 0.55, roughness: 0.5 }),
        [side * (w / 2 + 0.014), -h * 0.28 + hole * (h * 0.18), 0],
        [Math.PI / 2, 0, 0],
      );
    }
  });
}

function buildPcb(group: THREE.Group, dims: UnitDimensions, theme: SubPartTheme) {
  const { w, d } = dims;
  const board = mat(0x1a5c38, { metalness: 0.18, roughness: 0.68 });
  const trace = mat(0xb8860b, { metalness: 0.78, roughness: 0.32 });
  const chip = mat(0x1a1a22, { metalness: 0.4, roughness: 0.38 });
  const chipCap = mat(theme.accent, { emissive: theme.accent, emissiveIntensity: 0.06 });

  addMesh(group, new THREE.BoxGeometry(w * 0.86, 0.008, d * 0.74), board, [0, 0, 0]);
  for (let i = 0; i < 8; i++) {
    addMesh(group, new THREE.BoxGeometry(w * 0.62, 0.0015, 0.006), trace, [0, 0.005, -d * 0.3 + i * d * 0.085]);
  }
  addMesh(group, new THREE.BoxGeometry(w * 0.2, 0.022, d * 0.2), chip, [0, 0.014, 0.02]);
  addMesh(group, new THREE.BoxGeometry(w * 0.07, 0.012, d * 0.07), chipCap, [-w * 0.17, 0.018, -d * 0.1]);
  addMesh(group, new THREE.BoxGeometry(w * 0.05, 0.01, d * 0.05), chip, [w * 0.15, 0.016, d * 0.06]);
  addMesh(group, new THREE.BoxGeometry(w * 0.72, 0.012, 0.018), mat(PORT_COLOR, { metalness: 0.5, roughness: 0.55 }), [0, 0.006, d * 0.36]);
  for (let p = 0; p < 10; p++) {
    addMesh(
      group,
      new THREE.BoxGeometry(0.012, 0.008, 0.01),
      mat(0xb8c0c8, { metalness: 0.85, roughness: 0.25 }),
      [-w * 0.3 + p * (w * 0.065), 0.012, d * 0.37],
    );
  }
}

function buildPsu(group: THREE.Group, dims: UnitDimensions) {
  const { w, h, d } = dims;
  const housing = mat(0x4a5568, { metalness: 0.62, roughness: 0.42 });
  const coil = mat(0xb87333, { metalness: 0.75, roughness: 0.32 });
  addMesh(group, new THREE.BoxGeometry(w * 0.3, h * 0.5, d * 0.34, 2, 2, 2), housing, [0, 0, 0]);
  addMesh(group, new THREE.BoxGeometry(w * 0.2, h * 0.32, d * 0.24), coil, [0, 0.008, -0.01]);
  addMesh(group, new THREE.CylinderGeometry(w * 0.035, w * 0.035, h * 0.1, 14), mat(0x2a3544, { metalness: 0.52, roughness: 0.48 }), [w * 0.07, 0, d * 0.06], [Math.PI / 2, 0, 0]);
  addMesh(group, new THREE.BoxGeometry(w * 0.08, 0.006, d * 0.06), mat(0x6a7585, { metalness: 0.7, roughness: 0.35 }), [0, h * 0.26, d * 0.12]);
}

function buildHeatsink(group: THREE.Group, dims: UnitDimensions) {
  const { w, d } = dims;
  const finH = Math.min(d * 0.28, 0.11);
  const base = mat(0x9ca8b8, { metalness: 0.82, roughness: 0.26 });
  const fin = mat(0xb8c4d4, { metalness: 0.86, roughness: 0.2 });
  addMesh(group, new THREE.BoxGeometry(w * 0.4, 0.01, d * 0.44), base, [0, 0, 0]);
  for (let i = 0; i < 16; i++) {
    addMesh(group, new THREE.BoxGeometry(0.005, finH, d * 0.36), fin, [-w * 0.17 + i * (w * 0.022), finH / 2 + 0.005, 0]);
  }
}

function buildFan(group: THREE.Group, dims: UnitDimensions, theme: SubPartTheme) {
  const r = Math.min(dims.w, dims.h) * 0.22;
  const housing = mat(0x5a6a7e, { metalness: 0.65, roughness: 0.42 });
  const blade = mat(0x3d4a5c, { metalness: 0.4, roughness: 0.55 });
  addMesh(group, new THREE.CylinderGeometry(r, r, 0.022, 24), housing, [0, 0, 0]);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    addMesh(
      group,
      new THREE.BoxGeometry(r * 0.85, 0.006, r * 0.22),
      blade,
      [Math.sin(a) * r * 0.18, Math.cos(a) * r * 0.18, 0.012],
      [0, 0, a],
    );
  }
  addMesh(group, new THREE.SphereGeometry(0.012, 8, 8), mat(theme.accent, { emissive: theme.accent, emissiveIntensity: 0.2 }), [0, 0, 0.014]);
}

function buildModule(group: THREE.Group, dims: UnitDimensions, theme: SubPartTheme) {
  const { w, h, d } = dims;
  addMesh(group, new THREE.BoxGeometry(w * 0.42, h * 0.65, d * 0.38), mat(theme.body, { metalness: 0.48, roughness: 0.46 }), [0, 0, 0]);
  addMesh(group, new THREE.BoxGeometry(w * 0.28, 0.02, d * 0.24), mat(0x1a1a22, { metalness: 0.35, roughness: 0.42 }), [0, h * 0.18, 0.02]);
  addMesh(group, new THREE.BoxGeometry(w * 0.44, 0.008, 0.012), mat(theme.accent, { emissive: theme.accent, emissiveIntensity: 0.1 }), [0, h * 0.34, d * 0.19]);
}

function buildCable(group: THREE.Group, dims: UnitDimensions, theme: SubPartTheme) {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-dims.w * 0.35, 0, -dims.d * 0.1),
    new THREE.Vector3(-dims.w * 0.1, dims.h * 0.4, dims.d * 0.05),
    new THREE.Vector3(dims.w * 0.15, dims.h * 0.2, dims.d * 0.15),
    new THREE.Vector3(dims.w * 0.35, 0, dims.d * 0.22),
  ]);
  const geo = new THREE.TubeGeometry(curve, 24, 0.014, 8, false);
  addMesh(group, geo, mat(theme.body, { metalness: 0.25, roughness: 0.65 }), [0, 0, 0]);
  addMesh(group, new THREE.BoxGeometry(dims.w * 0.08, 0.02, 0.03), mat(0x2a3544, { metalness: 0.45, roughness: 0.5 }), [dims.w * 0.38, 0, dims.d * 0.24]);
}

function buildMetal(group: THREE.Group, dims: UnitDimensions) {
  const { w, h, d } = dims;
  addMesh(group, new THREE.BoxGeometry(w * 0.55, h * 0.18, d * 0.12), mat(0xb87333, { metalness: 0.88, roughness: 0.18 }), [0, 0, 0]);
  addMesh(group, new THREE.BoxGeometry(w * 0.12, h * 0.14, d * 0.1), mat(0xc9955a, { metalness: 0.85, roughness: 0.22 }), [w * 0.22, 0.02, 0]);
}

function buildGeneric(group: THREE.Group, dims: UnitDimensions, theme: SubPartTheme) {
  addMesh(group, new THREE.BoxGeometry(dims.w * 0.5, dims.h * 0.55, dims.d * 0.4), mat(theme.body, { metalness: 0.5, roughness: 0.45 }), [0, 0, 0]);
}

export function buildSubPartVisual(kind: SubPartKind, dims: UnitDimensions, theme: SubPartTheme): THREE.Group {
  const group = new THREE.Group();
  switch (kind) {
    case "enclosure":
      buildEnclosure(group, dims, theme);
      break;
    case "pcb":
      buildPcb(group, dims, theme);
      break;
    case "psu":
      buildPsu(group, dims);
      break;
    case "heatsink":
      buildHeatsink(group, dims);
      break;
    case "fan":
      buildFan(group, dims, theme);
      break;
    case "module":
      buildModule(group, dims, theme);
      break;
    case "cable":
      buildCable(group, dims, theme);
      break;
    case "metal":
      buildMetal(group, dims);
      break;
    default:
      buildGeneric(group, dims, theme);
  }
  return group;
}
