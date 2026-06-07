import { COMPONENT_COLORS } from "./rackVisualTheme";

/** Rack component node names — must match ids in public/data/components.json */
export const RACK_COMPONENT_IDS = [
  "switch-1",
  "router-1",
  "server-1",
  "gpu-server-1",
  "storage-1",
  "power-1",
  "cabling-1",
  "cooling-1",
] as const;

export type RackComponentId = (typeof RACK_COMPONENT_IDS)[number];

export const RACK_GLB_URL = "/models/rack.glb";

export interface ComponentVisual {
  id: RackComponentId;
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  metalness: number;
  roughness: number;
}

function hex(n: number) {
  return `#${n.toString(16).padStart(6, "0")}`;
}

const LAYOUT: Record<RackComponentId, { position: [number, number, number]; size: [number, number, number] }> = {
  "switch-1": { position: [-0.35, 1.2, 0.28], size: [0.7, 0.18, 0.42] },
  "router-1": { position: [0.35, 1.2, 0.28], size: [0.7, 0.18, 0.42] },
  "server-1": { position: [-0.35, 0.85, 0.28], size: [0.7, 0.22, 0.44] },
  "gpu-server-1": { position: [0.35, 0.85, 0.28], size: [0.7, 0.28, 0.44] },
  "storage-1": { position: [-0.35, 0.5, 0.28], size: [0.7, 0.2, 0.42] },
  "power-1": { position: [0.35, 0.5, 0.28], size: [0.7, 0.15, 0.38] },
  "cabling-1": { position: [0, 0.15, 0.36], size: [1.42, 0.08, 0.16] },
  "cooling-1": { position: [0, -0.15, 0.32], size: [1.52, 0.12, 0.52] },
};

export const COMPONENT_VISUALS: ComponentVisual[] = RACK_COMPONENT_IDS.map((id) => ({
  id,
  ...LAYOUT[id],
  color: hex(COMPONENT_COLORS[id].body),
  metalness: 0.5,
  roughness: 0.4,
}));

export const SELECTION_COLOR = "#5eb0ff";
export const SELECTION_EMISSIVE = "#2a6aaa";
