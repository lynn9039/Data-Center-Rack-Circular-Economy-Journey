/** Shared palette — scene background + rack PBR (luminance within ~20% UI spec, but readable) */
export const SCENE_BG = "#1c2634";
export const SCENE_FOG = "#1c2634";

export const FRAME_ALUMINUM = 0x9ca8b8;
export const FRAME_PANEL = 0x4a5a6e;
export const BEZEL_COLOR = 0x5c6d82;
export const VENT_COLOR = 0x6b7d94;
export const PORT_COLOR = 0x2d3848;
/** Floor — lighter than scene bg so it reads clearly under the rack */
export const FLOOR_COLOR = 0x5a7088;
export const FLOOR_ALT = 0x6b8498;
export const FLOOR_EMISSIVE = 0x3a5068;
export const ACCENT_STRIPE = 0x3d9eff;

export const COMPONENT_COLORS: Record<
  string,
  { body: number; accent: number; label: string }
> = {
  "switch-1": { body: 0x3d6a9e, accent: 0x5eb0ff, label: "Network Switch" },
  "router-1": { body: 0x4a7ab0, accent: 0x7ec8ff, label: "Core Router" },
  "server-1": { body: 0x5a6578, accent: 0x94a3b8, label: "Compute Server" },
  "gpu-server-1": { body: 0x6b5b9a, accent: 0xa78bfa, label: "GPU Server" },
  "storage-1": { body: 0x3d8a7a, accent: 0x5eead4, label: "Storage" },
  "power-1": { body: 0x9a7b3c, accent: 0xfbbf24, label: "PDU" },
  "cabling-1": { body: 0x4a5568, accent: 0x2a5a72, label: "Cabling" },
  "cooling-1": { body: 0x2d5a6e, accent: 0x3a6a7a, label: "Cooling" },
};
