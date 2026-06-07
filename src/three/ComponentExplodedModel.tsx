import { useEffect, useMemo } from "react";
import type { SubPart } from "../data/types";
import {
  applyViewMode,
  buildComponentAssembly,
} from "./deconstruction/buildComponentAssembly";
import { DetailCameraRig } from "./deconstruction/DetailCameraRig";

export type DeconstructionViewMode = "assembled" | "deconstructed";

export interface ComponentExplodedModelProps {
  componentId: string;
  subParts: SubPart[];
  mode: DeconstructionViewMode;
}

export function ComponentExplodedModel({ componentId, subParts, mode }: ComponentExplodedModelProps) {
  const assembly = useMemo(() => buildComponentAssembly(componentId, subParts), [componentId, subParts]);

  useEffect(() => {
    applyViewMode(assembly.layers, mode);
    assembly.root.rotation.set(0, 0, 0);
  }, [assembly, mode]);

  return (
    <>
      <primitive object={assembly.root} />
      <DetailCameraRig root={assembly.root} mode={mode} />
    </>
  );
}
