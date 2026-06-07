/**
 * Generates public/models/rack.glb — textured PBR rack with detailed geometry.
 */
if (typeof globalThis.document === "undefined") {
  const { createCanvas, ImageData } = await import("canvas");
  globalThis.ImageData = ImageData;
  function makeCanvas(w = 256, h = 256) {
    const c = createCanvas(w, h);
    c.convertToBlob = ({ type = "image/png" } = {}) =>
      new Promise((resolve, reject) => {
        if (typeof c.toBlob === "function") {
          c.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))), type);
          return;
        }
        const buf = type.includes("jpeg") ? c.toBuffer("image/jpeg") : c.toBuffer("image/png");
        resolve(new Blob([buf], { type }));
      });
    return c;
  }
  globalThis.document = {
    createElement(tag) {
      if (tag === "canvas") return makeCanvas();
      return {};
    },
  };
}

if (typeof globalThis.FileReader === "undefined") {
  globalThis.FileReader = class FileReader {
    result = null;
    onload = null;
    onloadend = null;
    onerror = null;
    readAsArrayBuffer(blob) {
      blob
        .arrayBuffer()
        .then((buffer) => {
          this.result = buffer;
          const evt = { target: this };
          this.onload?.(evt);
          this.onloadend?.(evt);
        })
        .catch((err) => this.onerror?.(err));
    }
  };
}

import * as THREE from "three";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  createBrushedMetalMap,
  createGrilleAlphaMap,
  createPanelGradientMap,
  createFloorTileMap,
  createLabelTexture,
  createPerforatedPanelMap,
} from "./rack-textures.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "public", "models");
const outFile = path.join(outDir, "rack.glb");

const COMPONENTS = [
  { id: "switch-1", label: "SW-01", position: [-0.35, 1.2, 0.28], size: [0.7, 0.18, 0.42], body: 0x3d6a9e, accent: 0x5eb0ff },
  { id: "router-1", label: "RT-01", position: [0.35, 1.2, 0.28], size: [0.7, 0.18, 0.42], body: 0x4a7ab0, accent: 0x7ec8ff },
  { id: "server-1", label: "SRV-01", position: [-0.35, 0.85, 0.28], size: [0.7, 0.22, 0.44], body: 0x5a6578, accent: 0x94a3b8 },
  { id: "gpu-server-1", label: "GPU-01", position: [0.35, 0.85, 0.28], size: [0.7, 0.28, 0.44], body: 0x6b5b9a, accent: 0xa78bfa },
  { id: "storage-1", label: "STO-01", position: [-0.35, 0.5, 0.28], size: [0.7, 0.2, 0.42], body: 0x3d8a7a, accent: 0x5eead4 },
  { id: "power-1", label: "PDU-01", position: [0.35, 0.5, 0.28], size: [0.7, 0.15, 0.38], body: 0x9a7b3c, accent: 0xfbbf24 },
  { id: "cabling-1", label: "CBL-01", position: [0, 0.15, 0.36], size: [1.42, 0.08, 0.16], body: 0x4a5568, accent: 0x2a5a72 },
  { id: "cooling-1", label: "CLG-01", position: [0, -0.15, 0.32], size: [1.52, 0.12, 0.52], body: 0x2d5a6e, accent: 0x3a6a7a },
];

// Shared textures (reused across meshes)
const TEX = {
  metal: createBrushedMetalMap(512, 512, [165, 175, 188]),
  panel: createPanelGradientMap(512, 128, [95, 115, 138]),
  grille: createGrilleAlphaMap(256, 256),
  perforated: createPerforatedPanelMap(256, 256),
  floor: createFloorTileMap(512, 512),
};

function matPbr(opts) {
  const params = {
    metalness: opts.metalness ?? 0.55,
    roughness: opts.roughness ?? 0.42,
    emissive: opts.emissive ?? 0x000000,
    emissiveIntensity: opts.emissiveIntensity ?? 0,
  };
  if (opts.color != null) params.color = opts.color;
  if (opts.map) {
    opts.map.colorSpace = THREE.SRGBColorSpace;
    params.map = opts.map;
  }
  if (opts.alphaMap) {
    params.alphaMap = opts.alphaMap;
    params.transparent = true;
    params.side = THREE.DoubleSide;
  }
  if (opts.transparent) params.transparent = true;
  return new THREE.MeshStandardMaterial(params);
}

function add(parent, geo, material, pos, name, rot) {
  const mesh = new THREE.Mesh(geo, material);
  mesh.position.set(...pos);
  if (rot) mesh.rotation.set(...rot);
  mesh.castShadow = mesh.receiveShadow = true;
  if (name) mesh.name = name;
  parent.add(mesh);
  return mesh;
}

function addPerforatedPanel(parent, w, h, z, name) {
  const plateMat = matPbr({
    color: 0xffffff,
    map: TEX.perforated,
    metalness: 0.38,
    roughness: 0.55,
  });
  add(parent, new THREE.BoxGeometry(w, h, 0.012, 2, 2, 1), plateMat, [0, 0, z], name);
}

function addFan(parent, radius, depth, pos, name, bladeColor = 0x3d4a5c) {
  const g = new THREE.Group();
  g.name = name;
  const housingMat = matPbr({ color: 0x5a6a7e, map: TEX.metal,  metalness: 0.65 });
  add(g, new THREE.CylinderGeometry(radius, radius, depth, 24), housingMat, [0, 0, 0]);
  const bladeMat = matPbr({ color: bladeColor, metalness: 0.4, roughness: 0.55 });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    add(
      g,
      new THREE.BoxGeometry(radius * 0.85, 0.008, radius * 0.22),
      bladeMat,
      [Math.sin(a) * radius * 0.2, Math.cos(a) * radius * 0.2, depth / 2 + 0.002],
      undefined,
      [0, 0, a],
    );
  }
  g.position.set(...pos);
  parent.add(g);
}

function addCableBundle(parent, start, end, color, name) {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(...start),
    new THREE.Vector3(start[0] * 0.5, start[1] + 0.08, start[2] + 0.12),
    new THREE.Vector3(end[0] * 0.5, end[1] + 0.05, end[2] + 0.08),
    new THREE.Vector3(...end),
  ]);
  const geo = new THREE.TubeGeometry(curve, 20, 0.012, 8, false);
  const m = matPbr({ color, metalness: 0.25, roughness: 0.65 });
  add(parent, geo, m, [0, 0, 0], name);
}

function createRackUnit({ id, label, position, size, bodyColor, accentColor }) {
  const g = new THREE.Group();
  g.name = id;
  const [w, h, d] = size;
  const softBay = id === "cooling-1" || id === "cabling-1";

  const bodyMat = matPbr({
    color: bodyColor,
    map: createBrushedMetalMap(256, 256, [
      (bodyColor >> 16) & 0xff,
      (bodyColor >> 8) & 0xff,
      bodyColor & 0xff,
    ]),
    metalness: 0.32,
    roughness: 0.52,
  });

  add(g, new THREE.BoxGeometry(w, h, d, 4, 4, 4), bodyMat, [0, 0, 0], `${id}-chassis`);

  addPerforatedPanel(g, w * 0.92, h * 0.75, d / 2 + 0.02, `${id}-front-grille`);

  const bezelMat = matPbr({
    color: 0x5c6d82,
    map: TEX.panel,
    metalness: softBay ? 0.28 : 0.38,
    roughness: softBay ? 0.55 : 0.48,
  });
  add(g, new THREE.BoxGeometry(w * 0.98, h * 0.94, 0.018), bezelMat, [0, 0, d / 2 + 0.008], `${id}-bezel`);

  const accentMat = matPbr({
    color: accentColor,
    metalness: softBay ? 0.28 : 0.35,
    roughness: softBay ? 0.58 : 0.45,
    emissive: softBay ? 0x1a2838 : accentColor,
    emissiveIntensity: softBay ? 0.04 : 0.15,
  });
  add(g, new THREE.BoxGeometry(w * 0.99, 0.014, 0.015), accentMat, [0, h / 2 - 0.008, d / 2 + 0.025], `${id}-stripe`);

  const labelMat = matPbr({
    color: 0xffffff,
    map: createLabelTexture(label),
    metalness: 0.2,
    roughness: 0.6,
  });
  add(g, new THREE.PlaneGeometry(w * 0.35, 0.05), labelMat, [-w * 0.22, h * 0.28, d / 2 + 0.03], `${id}-label`);

  const portMat = matPbr({ color: 0x2a3544, metalness: 0.35, roughness: 0.65 });
  const portCols = 10;
  const portW = (w * 0.5) / portCols;
  for (let i = 0; i < portCols; i++) {
    const px = -w * 0.25 + i * (portW + 0.006);
    add(g, new THREE.BoxGeometry(portW, h * 0.1, 0.02), portMat, [px, -h * 0.18, d / 2 + 0.035], `${id}-port-${i}`);
    if (i % 2 === 0) {
      const ledMat = matPbr({
        color: 0x4ade80,
        emissive: 0x22c55e,
        emissiveIntensity: 1.4,
        metalness: 0.1,
        roughness: 0.4,
      });
      add(g, new THREE.SphereGeometry(0.008, 8, 8), ledMat, [px, -h * 0.08, d / 2 + 0.038], `${id}-port-led-${i}`);
    }
  }

  const ventGrilleMat = matPbr({
    color: softBay ? 0x4a5a6a : 0x6b7d94,
    alphaMap: TEX.grille,
    transparent: true,
    metalness: softBay ? 0.45 : 0.7,
    roughness: softBay ? 0.52 : 0.35,
  });
  add(g, new THREE.PlaneGeometry(w * 0.78, h * 0.55), ventGrilleMat, [0, 0, d / 2 + 0.028], `${id}-vent-grille`);

  [-1, 1].forEach((side, i) => {
    const earMat = matPbr({ color: 0x8a96a8, map: TEX.metal,  metalness: 0.82 });
    add(g, new THREE.BoxGeometry(0.025, h * 0.96, d * 0.88), earMat, [side * (w / 2 + 0.012), 0, 0], `${id}-ear-${i}`);
    for (let hole = 0; hole < 4; hole++) {
      add(
        g,
        new THREE.CylinderGeometry(0.012, 0.012, 0.03, 10),
        matPbr({ color: 0x1e2836, metalness: 0.5, roughness: 0.5 }),
        [side * (w / 2 + 0.02), -h * 0.3 + hole * (h * 0.2), 0],
        `${id}-screw-${i}-${hole}`,
        [Math.PI / 2, 0, 0],
      );
    }
  });

  if (id === "gpu-server-1") {
    for (let f = 0; f < 3; f++) {
      addFan(g, 0.045, 0.02, [-0.14 + f * 0.14, 0, d / 2 + 0.05], `${id}-fan-${f}`, 0x4a5568);
    }
  }
  if (id === "cooling-1") {
    for (let f = 0; f < 5; f++) {
      addFan(g, 0.055, 0.022, [-0.5 + f * 0.25, 0.02, d / 2 + 0.05], `${id}-fan-${f}`, 0x3a4a52);
    }
  }
  if (id === "cabling-1") {
    addCableBundle(g, [-0.5, 0, d / 2], [0.5, 0.02, d / 2 + 0.05], 0x2a4a62, `${id}-cable-a`);
    addCableBundle(g, [-0.3, -0.02, d / 2], [0.4, 0.04, d / 2 + 0.08], 0x2a5248, `${id}-cable-b`);
    addCableBundle(g, [0.2, 0.01, d / 2], [0.55, -0.03, d / 2 + 0.06], 0x5a3838, `${id}-cable-c`);
  }

  g.position.set(...position);
  return g;
}

function createRackFrame() {
  const frame = new THREE.Group();
  frame.name = "rack-frame";

  const railMat = matPbr({
    color: 0x9ca8b8,
    map: TEX.metal,
    metalness: 0.88,
    roughness: 0.22,
  });
  const panelMat = matPbr({
    color: 0x4a5a6e,
    map: TEX.panel,
    metalness: 0.5,
    roughness: 0.45,
  });
  const shelfMat = matPbr({ color: 0x5a6a7e, map: TEX.metal,  metalness: 0.6, roughness: 0.4 });

  [-0.78, 0.78].forEach((x) => {
    add(frame, new THREE.BoxGeometry(0.07, 2.3, 0.66), railMat, [x, 0.55, 0]);
  });
  add(frame, new THREE.BoxGeometry(1.66, 0.09, 0.66), railMat, [0, 1.72, 0]);
  add(frame, new THREE.BoxGeometry(1.66, 0.09, 0.66), railMat, [0, -0.62, 0]);
  add(frame, new THREE.BoxGeometry(1.64, 2.24, 0.08), panelMat, [0, 0.55, -0.04]);

  [0.35, 0.7, 1.05, 1.4].forEach((y, i) => {
    add(frame, new THREE.BoxGeometry(1.52, 0.018, 0.6), shelfMat, [0, y, 0.02], `shelf-${i}`);
  });

  const placard = matPbr({ color: 0x2a3848, map: createLabelTexture("RACK A-01", 128, 32), metalness: 0.3, roughness: 0.6 });
  add(frame, new THREE.PlaneGeometry(0.35, 0.08), placard, [0, 1.78, 0.34], "rack-placard");

  return frame;
}

function buildRackScene() {
  const root = new THREE.Group();
  root.name = "rack-root";
  root.add(createRackFrame());
  for (const c of COMPONENTS) {
    root.add(createRackUnit(c));
  }

  const floorMat = matPbr({
    color: 0xffffff,
    map: TEX.floor,
    metalness: 0,
    roughness: 0.95,
    emissive: 0x3a5068,
    emissiveIntensity: 0.22,
  });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(5.5, 5.5), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.62;
  floor.receiveShadow = true;
  floor.name = "floor";
  root.add(floor);

  return root;
}

async function exportGlb(root) {
  const exporter = new GLTFExporter();
  const result = await exporter.parseAsync(root, { binary: true });
  if (result instanceof ArrayBuffer) return Buffer.from(result);
  throw new Error("Expected binary GLB output");
}

try {
  fs.mkdirSync(outDir, { recursive: true });
  const buffer = await exportGlb(buildRackScene());
  fs.writeFileSync(outFile, buffer);
  console.log(`Wrote ${outFile} (${buffer.length} bytes)`);
} catch (e) {
  console.error(e);
  process.exit(1);
}
