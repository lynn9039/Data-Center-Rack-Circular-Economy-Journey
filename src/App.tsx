import { useEffect, useCallback, useRef } from "react";
import { LocaleGuard } from "./ui/LocaleGuard";
import { LoadingIndicator, LoadErrorPanel } from "./ui/LoadingIndicator";
import { ComponentPanel } from "./ui/ComponentPanel";
import { DetailPanel } from "./ui/DetailPanel";
import { RotationControl } from "./ui/RotationControl";
import { ResetViewButton } from "./ui/ResetViewButton";
import { SiteIntro } from "./ui/SiteIntro";
import { RackScene } from "./three/RackScene";
import { parseMetalWheel } from "./data/metalWheel";
import { parseCatalogue } from "./data/components";
import { useAppStore, isInvalidComponent } from "./state/store";
import type { Component } from "./data/types";

const LOAD_TIMEOUT_MS = 30000;

async function loadReferenceData() {
  const [wheelRes, compRes] = await Promise.all([
    fetch("/data/metal-wheel.json"),
    fetch("/data/components.json"),
  ]);

  let wheel = null;
  let wheelErr = null;
  if (!wheelRes.ok) {
    wheelErr = { kind: "missing-source" as const, sourceLocation: "/data/metal-wheel.json", message: "File not found" };
  } else {
    const text = await wheelRes.text();
    const parsed = parseMetalWheel(text, "/data/metal-wheel.json");
    if (parsed.ok) wheel = parsed.value;
    else wheelErr = parsed.error;
  }

  let catalogue = { valid: [] as Component[], invalid: [] as import("./data/types").InvalidComponent[] };
  let catErr = null;
  if (!compRes.ok) {
    catErr = { kind: "missing-source" as const, sourceLocation: "/data/components.json", message: "File not found" };
  } else {
    const text = await compRes.text();
    const parsed = parseCatalogue(text, "/data/components.json");
    if (parsed.ok) catalogue = parsed.value;
    else catErr = parsed.error;
  }

  return { wheel, wheelErr, catalogue, catErr };
}

function ExplorerApp() {
  const phase = useAppStore((s) => s.phase);
  const rackReady = useAppStore((s) => s.rackReady);
  const loadErrorMessage = useAppStore((s) => s.loadErrorMessage);
  const layout = useAppStore((s) => s.layout);
  const detailOpen = useAppStore((s) => s.detailOpen);
  const selectedComponentId = useAppStore((s) => s.selectedComponentId);
  const recommendation = useAppStore((s) => s.recommendation);
  const metalWheelError = useAppStore((s) => s.metalWheelError);
  const panelError = useAppStore((s) => s.panelError);

  const setRackReady = useAppStore((s) => s.setRackReady);
  const setLoadError = useAppStore((s) => s.setLoadError);
  const setPhase = useAppStore((s) => s.setPhase);
  const openDetail = useAppStore((s) => s.openDetail);
  const closeDetail = useAppStore((s) => s.closeDetail);
  const setLayoutFromViewport = useAppStore((s) => s.setLayoutFromViewport);

  const loadStarted = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startLoad = useCallback(async () => {
    setPhase("loading");
    setLoadError(null);
    setRackReady(false);
    loadStarted.current = true;

    timeoutRef.current = setTimeout(() => {
      if (!useAppStore.getState().rackReady) {
        setLoadError("The rack could not be loaded within 30 seconds. Please check your connection and try again.");
      }
    }, LOAD_TIMEOUT_MS);

    try {
      const data = await loadReferenceData();
      useAppStore.getState().hydrateData(data.wheel, data.wheelErr, data.catalogue, data.catErr);
    } catch {
      setLoadError("Failed to load reference data.");
    }
  }, [setPhase, setLoadError, setRackReady]);

  useEffect(() => {
    if (!loadStarted.current) startLoad();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [startLoad]);

  const onRackReady = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setRackReady(true);
    setPhase("ready");
    setLoadError(null);
  }, [setRackReady, setPhase, setLoadError]);

  useEffect(() => {
    const onResize = () => setLayoutFromViewport(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [setLayoutFromViewport]);

  const catalogue = useAppStore((s) => s.catalogue);
  const selected = selectedComponentId
    ? catalogue.invalid.find((i) => i.id === selectedComponentId) ??
      catalogue.valid.find((c) => c.id === selectedComponentId) ??
      null
    : null;

  if (phase === "load-error" || loadErrorMessage) {
    return <LoadErrorPanel message={loadErrorMessage ?? "Load failed"} onRetry={startLoad} />;
  }

  const showLoading = phase === "loading" || !rackReady;

  const rackWidthClass = detailOpen && layout === "split" ? "split" : "full";

  const validComponent =
    selected && !isInvalidComponent(selected) ? (selected as Component) : null;

  return (
    <div className="app-layout">
      <div className={`rack-area ${rackWidthClass}`}>
        <RackScene onReady={onRackReady} />
        {rackReady && (
          <div className="rack-controls-br">
            <RotationControl />
            <ResetViewButton />
          </div>
        )}
        {rackReady && !detailOpen && !selectedComponentId && <SiteIntro />}
        {selected && !detailOpen && (
          <ComponentPanel
            component={selected}
            onActivateCircularEconomy={() => openDetail()}
            onClose={() => useAppStore.getState().clearSelection()}
          />
        )}
        {panelError && !detailOpen && (
          <div className="panel" style={{ position: "absolute", bottom: "1rem", left: "1rem", zIndex: 15 }}>
            <p className="error-banner">{panelError}</p>
          </div>
        )}
      </div>

      {detailOpen && validComponent && (
        <DetailPanel
          component={validComponent}
          recommendation={recommendation}
          metalWheelUnavailable={!!metalWheelError}
          layout={layout === "fullscreen-overlay" ? "fullscreen-overlay" : "split"}
          onClose={closeDetail}
        />
      )}

      {showLoading && <LoadingIndicator />}
    </div>
  );
}

export default function App() {
  return (
    <LocaleGuard>
      <ExplorerApp />
    </LocaleGuard>
  );
}
