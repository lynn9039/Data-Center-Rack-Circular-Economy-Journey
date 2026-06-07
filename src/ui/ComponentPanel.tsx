import type { Component, InvalidComponent } from "../data/types";
import { isInvalidComponent } from "../state/store";

export interface ComponentPanelProps {
  component: Component | InvalidComponent;
  onActivateCircularEconomy: () => void;
  onClose: () => void;
}

export function ComponentPanel({ component, onActivateCircularEconomy }: ComponentPanelProps) {
  if (isInvalidComponent(component)) {
    return (
      <div className="panel" style={{ position: "absolute", top: "1rem", left: "1rem", maxWidth: 360, zIndex: 20 }}>
        <h2>Component Error</h2>
        <p className="error-banner">
          {component.id ?? "Unknown"}: {component.errorField} - {component.errorMessage}
        </p>
        <button type="button" style={{ marginTop: "0.75rem" }} onClick={onActivateCircularEconomy}>
          Circular Economy Life
        </button>
      </div>
    );
  }

  const name = component.displayName?.trim() || null;
  const fn = component.functions[0]?.trim() || null;
  const materials = component.materials?.length
    ? component.materials.slice(0, 10).map((m) => `${m.element} (${(m.massPercent * 100).toFixed(1)}%)`)
    : null;

  return (
    <div
      className="panel"
      style={{ position: "absolute", top: "1rem", left: "1rem", maxWidth: 380, zIndex: 20 }}
      onClick={(e) => e.stopPropagation()}
      role="dialog"
      aria-label="Component information"
    >
      <h2>{name ?? <span className="placeholder">Name unavailable</span>}</h2>
      <p>
        <strong style={{ color: "var(--fg)" }}>Function: </strong>
        {fn ?? <span className="placeholder">Function unavailable</span>}
      </p>
      <p style={{ marginTop: "0.5rem" }}>
        <strong style={{ color: "var(--fg)" }}>Materials:</strong>
      </p>
      {materials ? (
        <ul>
          {materials.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      ) : (
        <p className="placeholder">Materials unavailable</p>
      )}
      <button type="button" style={{ marginTop: "1rem", width: "100%" }} onClick={onActivateCircularEconomy}>
        Circular Economy Life
      </button>
    </div>
  );
}
