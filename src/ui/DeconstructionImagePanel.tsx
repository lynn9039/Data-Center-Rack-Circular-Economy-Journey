import type { DeconstructionPhotoSet } from "../data/deconstructionImages";

export interface DeconstructionImagePanelProps {
  photoSet: DeconstructionPhotoSet;
}

export function DeconstructionImagePanel({ photoSet }: DeconstructionImagePanelProps) {
  return (
    <div className="deconstruction-image-panel">
      <img
        src={photoSet.assembledSrc}
        alt={`${photoSet.alt} — overall view`}
        className="deconstruction-photo-assembled"
        draggable={false}
      />
    </div>
  );
}
