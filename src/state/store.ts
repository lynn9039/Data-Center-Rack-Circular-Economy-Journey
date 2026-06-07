import { create } from "zustand";
import type { Component, ComponentCatalogue, InvalidComponent, LoadError, MetalWheel, CatalogueLoadError } from "../data/types";
import type { RecoveryRecommendation, RecoveryError } from "../domain/recovery";
import { recommend } from "../domain/recovery";
import { normalizeAngle, applyYawDelta, applyPitchDelta as addPitch, type RotationState } from "../domain/rotation";

export type Layout = "rack-only" | "split" | "fullscreen-overlay";
export type Phase = "loading" | "ready" | "load-error";

export interface AppState {
  phase: Phase;
  layout: Layout;
  selectedComponentId: string | null;
  detailOpen: boolean;
  rotation: RotationState;
  metalWheel: MetalWheel | null;
  metalWheelError: LoadError | null;
  catalogue: ComponentCatalogue;
  catalogueError: CatalogueLoadError | null;
  rackReady: boolean;
  loadErrorMessage: string | null;
  replayKey: number;
  recommendation: RecoveryRecommendation | RecoveryError | null;
  panelError: string | null;
  /** True when the user dragged the rack view (suppresses component click). */
  rackDragMoved: boolean;
  viewResetKey: number;
}

interface AppActions {
  setPhase: (phase: Phase) => void;
  setRackReady: (ready: boolean) => void;
  setLoadError: (message: string | null) => void;
  hydrateData: (wheel: MetalWheel | null, wheelErr: LoadError | null, cat: ComponentCatalogue, catErr: CatalogueLoadError | null) => void;
  selectComponent: (id: string) => void;
  clearSelection: () => void;
  openDetail: () => boolean;
  closeDetail: () => void;
  setRotation: (angle: number) => void;
  applyRotationDelta: (delta: number) => void;
  applyPitchDelta: (delta: number) => void;
  triggerReplay: () => void;
  setLayoutFromViewport: (width: number) => void;
  setRackDragMoved: (moved: boolean) => void;
  consumeRackDrag: () => boolean;
  resetRackView: () => void;
}

const initialCatalogue: ComponentCatalogue = { valid: [], invalid: [] };

export const useAppStore = create<AppState & AppActions>((set, get) => ({
  phase: "loading",
  layout: "rack-only",
  selectedComponentId: null,
  detailOpen: false,
  rotation: { angleDeg: 0, pitchDeg: 0 },
  metalWheel: null,
  metalWheelError: null,
  catalogue: initialCatalogue,
  catalogueError: null,
  rackReady: false,
  loadErrorMessage: null,
  replayKey: 0,
  recommendation: null,
  panelError: null,
  rackDragMoved: false,
  viewResetKey: 0,

  setPhase: (phase) => set({ phase }),
  resetRackView: () =>
    set((s) => ({
      rotation: { angleDeg: 0, pitchDeg: 0 },
      viewResetKey: s.viewResetKey + 1,
    })),
  setRackDragMoved: (moved) => set({ rackDragMoved: moved }),
  consumeRackDrag: () => {
    const moved = get().rackDragMoved;
    if (moved) set({ rackDragMoved: false });
    return moved;
  },
  setRackReady: (ready) => set({ rackReady: ready, phase: ready ? "ready" : get().phase }),
  setLoadError: (message) => set({ loadErrorMessage: message, phase: message ? "load-error" : get().phase }),

  hydrateData: (wheel, wheelErr, cat, catErr) =>
    set({ metalWheel: wheel, metalWheelError: wheelErr, catalogue: cat, catalogueError: catErr }),

  selectComponent: (id) => {
    const { catalogue, metalWheel, metalWheelError } = get();
    const invalid = catalogue.invalid.find((i) => i.id === id);
    if (invalid) {
      set({
        selectedComponentId: id,
        panelError: `${invalid.id ?? "Unknown"}: ${invalid.errorField} - ${invalid.errorMessage}`,
        recommendation: null,
      });
      return;
    }
    const comp = catalogue.valid.find((c) => c.id === id);
    let recommendation: RecoveryRecommendation | RecoveryError | null = null;
    if (comp) {
      if (metalWheelError) {
        recommendation = null;
      } else {
        const r = recommend(comp, metalWheel);
        recommendation = r.ok ? r.value : r.error;
      }
    }
    set({ selectedComponentId: id, panelError: null, recommendation });
  },

  clearSelection: () => set({ selectedComponentId: null, panelError: null, recommendation: null }),

  openDetail: () => {
    const { selectedComponentId, catalogue } = get();
    if (!selectedComponentId) {
      set({ panelError: "Select a rack component first." });
      return false;
    }
    const comp = catalogue.valid.find((c) => c.id === selectedComponentId);
    if (!comp) return false;
    const width = typeof window !== "undefined" ? window.innerWidth : 1200;
    const layout: Layout = width < 768 ? "fullscreen-overlay" : "split";
    set({ detailOpen: true, layout, panelError: null });
    return true;
  },

  closeDetail: () =>
    set({
      detailOpen: false,
      layout: "rack-only",
      selectedComponentId: null,
      recommendation: null,
      panelError: null,
    }),

  setRotation: (angle) =>
    set((s) => ({ rotation: { ...s.rotation, angleDeg: normalizeAngle(angle) } })),
  applyRotationDelta: (delta) => {
    const { rotation } = get();
    set({ rotation: applyYawDelta(rotation, delta) });
  },
  applyPitchDelta: (delta) => {
    const { rotation } = get();
    set({ rotation: addPitch(rotation, delta) });
  },

  triggerReplay: () => set((s) => ({ replayKey: s.replayKey + 1 })),

  setLayoutFromViewport: (width) => {
    const { detailOpen } = get();
    if (!detailOpen) return;
    set({ layout: width < 768 ? "fullscreen-overlay" : "split" });
  },
}));

export function getSelectedComponent(state: AppState): Component | InvalidComponent | null {
  if (!state.selectedComponentId) return null;
  const inv = state.catalogue.invalid.find((i) => i.id === state.selectedComponentId);
  if (inv) return inv;
  return state.catalogue.valid.find((c) => c.id === state.selectedComponentId) ?? null;
}

export function isInvalidComponent(c: Component | InvalidComponent): c is InvalidComponent {
  return "errorField" in c;
}
