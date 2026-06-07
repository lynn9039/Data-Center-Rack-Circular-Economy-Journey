/** Dominant neutral background across product PNG edges (32,32,32). */
export const PRODUCT_SHOWCASE_BG = "#202020";

export interface DeconstructionPhotoSet {
  assembledSrc: string;
  alt: string;
  /** Per-product background sampled from renders; falls back to PRODUCT_SHOWCASE_BG. */
  showcaseBg?: string;
  /** subPart id → layer image (top → bottom order in UI follows subParts array) */
  layerSrcBySubPartId: Record<string, string>;
}

export const DECONSTRUCTION_PHOTOS: Record<string, DeconstructionPhotoSet> = {
  "switch-1": {
    assembledSrc: "/images/deconstruction/switch-1-assembled.png",
    alt: "Network switch",
    showcaseBg: "#202020",
    layerSrcBySubPartId: {
      "switch-1.enclosure": "/images/deconstruction/switch-1-enclosure.png",
      "switch-1.pcb": "/images/deconstruction/switch-1-pcb.png",
      "switch-1.psu": "/images/deconstruction/switch-1-psu.png",
      "switch-1.heat": "/images/deconstruction/switch-1-heatsink.png",
    },
  },
  "router-1": {
    assembledSrc: "/images/deconstruction/router-1-assembled.png",
    alt: "Core router",
    showcaseBg: "#202020",
    layerSrcBySubPartId: {
      "router-1.chassis": "/images/deconstruction/router-1-chassis.png",
      "router-1.linecard": "/images/deconstruction/router-1-linecard.png",
      "router-1.fan": "/images/deconstruction/router-1-fan.png",
    },
  },
  "server-1": {
    assembledSrc: "/images/deconstruction/server-1-assembled.png",
    alt: "Compute server",
    showcaseBg: "#202020",
    layerSrcBySubPartId: {
      "server-1.chassis": "/images/deconstruction/server-1-chassis.png",
      "server-1.mobo": "/images/deconstruction/server-1-mobo.png",
      "server-1.dimm": "/images/deconstruction/server-1-dimm.png",
      "server-1.psu": "/images/deconstruction/server-1-psu.png",
    },
  },
  "gpu-server-1": {
    assembledSrc: "/images/deconstruction/gpu-server-1-assembled.png",
    alt: "GPU server",
    showcaseBg: "#202020",
    layerSrcBySubPartId: {
      "gpu-server-1.enclosure": "/images/deconstruction/gpu-server-1-enclosure.png",
      "gpu-server-1.pcb": "/images/deconstruction/gpu-server-1-pcb.png",
      "gpu-server-1.gpu": "/images/deconstruction/gpu-server-1-gpu.png",
      "gpu-server-1.psu": "/images/deconstruction/gpu-server-1-psu.png",
    },
  },
  "storage-1": {
    assembledSrc: "/images/deconstruction/storage-1-assembled.png",
    alt: "Storage array",
    showcaseBg: "#202020",
    layerSrcBySubPartId: {
      "storage-1.bay": "/images/deconstruction/storage-1-bay.png",
      "storage-1.controller": "/images/deconstruction/storage-1-controller.png",
      "storage-1.backplane": "/images/deconstruction/storage-1-backplane.png",
    },
  },
  "power-1": {
    assembledSrc: "/images/deconstruction/power-1-assembled.png",
    alt: "Rack PDU",
    showcaseBg: "#202020",
    layerSrcBySubPartId: {
      "power-1.housing": "/images/deconstruction/power-1-housing.png",
      "power-1.busbars": "/images/deconstruction/power-1-busbars.png",
      "power-1.meter": "/images/deconstruction/power-1-meter.png",
    },
  },
  "cabling-1": {
    assembledSrc: "/images/deconstruction/cabling-1-assembled.png",
    alt: "Fiber/copper cabling",
    showcaseBg: "#202020",
    layerSrcBySubPartId: {
      "cabling-1.fiber": "/images/deconstruction/cabling-1-fiber.png",
      "cabling-1.copper": "/images/deconstruction/cabling-1-copper.png",
      "cabling-1.manager": "/images/deconstruction/cabling-1-manager.png",
    },
  },
  "cooling-1": {
    assembledSrc: "/images/deconstruction/cooling-1-assembled.png",
    alt: "Cooling system",
    showcaseBg: "#202020",
    layerSrcBySubPartId: {
      "cooling-1.crac": "/images/deconstruction/cooling-1-crac.png",
      "cooling-1.fans": "/images/deconstruction/cooling-1-fans.png",
      "cooling-1.duct": "/images/deconstruction/cooling-1-duct.png",
    },
  },
};

export function getDeconstructionPhotoSet(componentId: string): DeconstructionPhotoSet | null {
  return DECONSTRUCTION_PHOTOS[componentId] ?? null;
}

export function showcaseBgForComponent(componentId: string): string {
  return DECONSTRUCTION_PHOTOS[componentId]?.showcaseBg ?? PRODUCT_SHOWCASE_BG;
}
