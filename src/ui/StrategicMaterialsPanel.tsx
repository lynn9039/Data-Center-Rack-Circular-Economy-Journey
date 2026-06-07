import type { Component } from "../data/types";
import {
  categoryLabel,
  getStrategicMaterials,
  outlookLabel,
  riskLabel,
  type MaterialCategory,
} from "../data/strategicMaterials";

export interface StrategicMaterialsPanelProps {
  component: Component;
}

const CATEGORY_ORDER: MaterialCategory[] = ["critical", "precious", "technology"];

export function StrategicMaterialsPanel({ component }: StrategicMaterialsPanelProps) {
  const entries = getStrategicMaterials(component.id);
  if (entries.length === 0) return null;

  const criticalCount = entries.filter((e) => e.category === "critical").length;
  const preciousCount = entries.filter((e) => e.category === "precious").length;
  const technologyCount = entries.filter((e) => e.category === "technology").length;
  const oftenLostEntries = entries.filter((e) => e.recoveryOutlook === "often-lost");

  const formatOftenLostNote = () => {
    if (oftenLostEntries.length === 0) return null;
    const names = oftenLostEntries.map((e) => e.symbol);
    const subject =
      names.length === 1
        ? names[0]
        : names.length === 2
          ? `${names[0]} and ${names[1]}`
          : `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
    return `, but ${subject} often lost without specialized pre-processing`;
  };

  const symbolsFor = (category: MaterialCategory) =>
    entries.filter((e) => e.category === category).map((e) => e.symbol);

  const formatCategorySummary = (count: number, labelSingular: string, symbols: string[]) => {
    if (count === 0) return null;
    const label = count === 1 ? labelSingular : `${labelSingular}s`;
    return `${count} ${label} (${symbols.join(", ")})`;
  };

  const categoryParts = [
    formatCategorySummary(criticalCount, "critical mineral", symbolsFor("critical")),
    formatCategorySummary(preciousCount, "precious metal", symbolsFor("precious")),
    formatCategorySummary(technologyCount, "technology metal", symbolsFor("technology")),
  ].filter(Boolean);

  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    items: entries.filter((e) => e.category === cat),
  })).filter((g) => g.items.length > 0);

  return (
    <section className="strategic-materials-section">
      <h3>Critical &amp; precious metals in this unit</h3>
      <p className="strategic-materials-intro">
        Data-center racks embed small but strategically significant quantities of precious and critical materials—mostly
        in PCBs, connectors, drives, optics, and magnets—not in steel enclosures. This inventory highlights where they
        sit, how they are usually recovered, and where they are at risk of being lost during bulk recycling.
      </p>
      <p className="strategic-materials-summary">
        <strong>{entries.length}</strong> materials tracked — {categoryParts.join(", ")}
        {formatOftenLostNote()}.
      </p>

      {grouped.map(({ category, items }) => (
        <div key={category} className="strategic-materials-group">
          <h4>{categoryLabel(category)}s</h4>
          <ul className="strategic-materials-list">
            {items.map((m) => (
              <li key={m.symbol} className="strategic-material-card">
                <div className="strategic-material-header">
                  <strong>
                    {m.name} ({m.symbol})
                  </strong>
                  <span className={`strategic-badge strategic-badge-${m.recoveryOutlook}`}>
                    {outlookLabel(m.recoveryOutlook).split("—")[0].trim()}
                  </span>
                </div>
                <dl className="strategic-material-details">
                  <div>
                    <dt>Abundance</dt>
                    <dd>{m.massNote}</dd>
                  </div>
                  <div>
                    <dt>Location in unit</dt>
                    <dd>{m.locationInUnit}</dd>
                  </div>
                  <div>
                    <dt>Function</dt>
                    <dd>{m.function}</dd>
                  </div>
                  <div>
                    <dt>Typical recovery route</dt>
                    <dd>{m.recoveryRoute}</dd>
                  </div>
                  <div>
                    <dt>Supply-chain insight</dt>
                    <dd>{m.supplyInsight}</dd>
                  </div>
                  <div>
                    <dt>Recovery outlook</dt>
                    <dd>{outlookLabel(m.recoveryOutlook)}</dd>
                  </div>
                  <div>
                    <dt>Supply risk</dt>
                    <dd>{riskLabel(m.supplyRisk)}</dd>
                  </div>
                </dl>
                {m.policyTags && m.policyTags.length > 0 && (
                  <div className="strategic-policy-tags">
                    {m.policyTags.map((tag) => (
                      <span key={tag} className="strategic-policy-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
