import type { Chip } from "../data/types";

export interface ChipViewProps {
  chip: Chip;
  onClose: () => void;
}

export function ChipView({ chip, onClose }: ChipViewProps) {
  const elements: { key: string; label: string; value?: string }[] = [
    { key: "die", label: "Die", value: chip.die },
    { key: "package", label: "Package", value: chip.package },
    { key: "pins", label: "Pins", value: chip.pins },
  ];

  return (
    <div className="chip-view" role="dialog" aria-label="Chip view">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3>Chip View</h3>
        <button type="button" className="secondary" onClick={onClose} aria-label="Close chip view">
          Close
        </button>
      </div>
      {elements.map(({ key, label, value }) => (
        <div key={key} className="chip-element">
          <strong>{label}</strong>
          {value ? (
            <p>{value}</p>
          ) : (
            <p className="placeholder">{label} data unavailable</p>
          )}
        </div>
      ))}
    </div>
  );
}
