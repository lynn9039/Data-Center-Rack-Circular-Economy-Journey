import { useEffect, useState } from "react";
import type { SubPart } from "../data/types";
import { getDeconstructionPhotoSet, showcaseBgForComponent } from "../data/deconstructionImages";
import { DeconstructionImagePanel } from "./DeconstructionImagePanel";
import { DeconstructionLayerStack } from "./DeconstructionLayerStack";
import { DeconstructionViewport } from "./DeconstructionViewport";

function hasAllLayerPhotos(photoSet: ReturnType<typeof getDeconstructionPhotoSet>, subParts: SubPart[]): boolean {
  if (!photoSet) return false;
  return subParts.every((sp) => !!photoSet.layerSrcBySubPartId[sp.id]);
}

interface DeconstructionStageProps {
  componentId: string;
  subParts: SubPart[];
}

export function DeconstructionStage({ componentId, subParts }: DeconstructionStageProps) {
  const [deconstructed, setDeconstructed] = useState(false);
  const photoSet = getDeconstructionPhotoSet(componentId);
  const usePhotos = photoSet && hasAllLayerPhotos(photoSet, subParts);

  useEffect(() => {
    setDeconstructed(false);
  }, [componentId]);

  const mode = deconstructed ? "deconstructed" : "assembled";
  const phaseLabel = deconstructed
    ? "Deconstructed layers (top → bottom)"
    : photoSet
      ? `${photoSet.alt} — overall view`
      : "Assembled unit";

  const renderVisual = () => {
    if (!usePhotos || !photoSet) {
      return <DeconstructionViewport componentId={componentId} subParts={subParts} mode={mode} />;
    }
    if (deconstructed) {
      return <DeconstructionLayerStack photoSet={photoSet} subParts={subParts} />;
    }
    return <DeconstructionImagePanel photoSet={photoSet} />;
  };

  const showcaseBg = showcaseBgForComponent(componentId);

  return (
    <div className="deconstruction-block">
      <div className="deconstruction-toolbar">
        <button type="button" className="deconstruction-toggle" onClick={() => setDeconstructed((v) => !v)}>
          {deconstructed ? "Show assembled unit" : "Show deconstructed layers"}
        </button>
      </div>

      <div
        className={`deconstruction-stage${deconstructed ? " is-deconstructed" : " is-assembled"}${usePhotos ? " uses-photo" : ""}`}
        style={{
          ["--layer-count" as string]: subParts.length,
          ["--product-showcase-bg" as string]: showcaseBg,
          ["--product-showcase-border" as string]: showcaseBg,
        }}
      >
        <div className="deconstruction-visual" aria-label={phaseLabel}>
          {renderVisual()}
          <div className="deconstruction-phase-label">{phaseLabel}</div>
        </div>

        {deconstructed && (
          <div className="deconstruction-cards">
            {subParts.map((sp, i) => (
              <div key={sp.id} className="subpart-card deconstruction-card is-visible">
                <span className="deconstruction-layer-index">Layer {i + 1}</span>
                <strong>{sp.name || <span className="placeholder">Name unavailable</span>}</strong>
                <p className="deconstruction-card-material">
                  Material: {sp.primaryMaterial || <span className="placeholder">Material unavailable</span>}
                </p>
                <p className="deconstruction-card-function">
                  Function: {sp.function || <span className="placeholder">Function unavailable</span>}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
