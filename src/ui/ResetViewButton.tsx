import { useAppStore } from "../state/store";

export function ResetViewButton() {
  const resetRackView = useAppStore((s) => s.resetRackView);

  return (
    <button
      type="button"
      className="reset-view-btn secondary"
      onClick={resetRackView}
      aria-label="Reset view to default angle and zoom"
      title="Reset view (0°, 0° tilt)"
    >
      Reset view
    </button>
  );
}
