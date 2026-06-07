import type { SubPart } from "../data/types";
import type { DeconstructionPhotoSet } from "../data/deconstructionImages";

export interface DeconstructionLayerStackProps {
  photoSet: DeconstructionPhotoSet;
  subParts: SubPart[];
}

export function DeconstructionLayerStack({ photoSet, subParts }: DeconstructionLayerStackProps) {
  return (
    <div className="deconstruction-layer-stack">
      {subParts.map((sp) => {
        const src = photoSet.layerSrcBySubPartId[sp.id];
        if (!src) return null;
        return (
          <div key={sp.id} className="deconstruction-layer-slot">
            <img src={src} alt={sp.name} className="deconstruction-layer-img" draggable={false} />
          </div>
        );
      })}
    </div>
  );
}
