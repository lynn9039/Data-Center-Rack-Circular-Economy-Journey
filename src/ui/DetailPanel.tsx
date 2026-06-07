import type { Component } from "../data/types";
import type { RecoveryRecommendation, RecoveryError } from "../domain/recovery";
import { selectSubPartsForExploded } from "../domain/recovery";
import { DeconstructionStage } from "./DeconstructionStage";
import { MetalWheelIntro } from "./MetalWheelIntro";
import { StrategicMaterialsPanel } from "./StrategicMaterialsPanel";

export interface DetailPanelProps {
  component: Component;
  recommendation: RecoveryRecommendation | RecoveryError | null;
  metalWheelUnavailable: boolean;
  layout: "split" | "fullscreen-overlay";
  onClose: () => void;
}

export function DetailPanel({
  component,
  recommendation,
  metalWheelUnavailable,
  layout,
  onClose,
}: DetailPanelProps) {
  const subParts = selectSubPartsForExploded(component.subParts);

  return (
    <div className={`detail-area ${layout === "fullscreen-overlay" ? "overlay" : ""}`}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
        <h2>{component.displayName}</h2>
        <button type="button" className="secondary" onClick={onClose} aria-label="Close">
          Close
        </button>
      </div>

      <p style={{ color: "var(--fg-muted)", fontSize: "0.85rem" }}>
        Start with the assembled product photo. Click{" "}
        <strong style={{ color: "var(--fg)", fontWeight: 600 }}>Show deconstructed layers</strong> to explore
        its main components and how the unit is built.
      </p>

      <DeconstructionStage componentId={component.id} subParts={subParts} />

      <StrategicMaterialsPanel component={component} />

      <MetalWheelIntro recommendation={recommendation} metalWheelUnavailable={metalWheelUnavailable} />

      <section className="recovery-section">
        <h3>Recovery Recommendation</h3>
        {metalWheelUnavailable && (
          <p className="error-banner" style={{ marginTop: "0.5rem" }}>
            Recovery data is unavailable. Metal Wheel reference could not be loaded.
          </p>
        )}
        {recommendation && "kind" in recommendation ? (
          <p className="error-banner">
            Recovery analysis cannot be performed without a valid material composition.
          </p>
        ) : recommendation ? (
          <>
            <p style={{ marginTop: "0.5rem" }}>
              <strong style={{ color: "var(--accent)" }}>{recommendation.method}</strong>
            </p>
            <p style={{ marginTop: "0.5rem" }}>{recommendation.reasoning}</p>
            {recommendation.recoveryStreams && recommendation.recoveryStreams.length > 0 && (
              <div className="recovery-alternatives recovery-streams">
                <h4>Parallel recovery streams (non-exclusive)</h4>
                <p className="recovery-streams-intro">
                  Choosing a carrier for the pyrometallurgical fraction does not mean other metals are wasted.
                  Dismantling and sorting let multiple routes run at the same time.
                </p>
                <ul>
                  {recommendation.recoveryStreams.map((stream, i) => (
                    <li key={stream.label}>
                      <strong>
                        Stream {i + 1}: {stream.label}
                      </strong>{" "}
                      (~{(stream.massPercent * 100).toFixed(0)}% mass)
                      <br />
                      <span className="recovery-stream-method">{stream.method}</span>
                      <br />
                      Metals recovered: {stream.metals.join(", ")}. {stream.explanation}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {recommendation.coRecoveredCompanions && recommendation.coRecoveredCompanions.length > 0 && (
              <div className="recovery-alternatives recovery-co-recovered">
                <h4>Co-recovered with the carrier melt</h4>
                <ul>
                  {recommendation.coRecoveredCompanions.map((comp) => (
                    <li key={comp.symbol}>
                      <strong>
                        {comp.name} ({comp.symbol})
                      </strong>{" "}
                      — {comp.classification}-class. {comp.explanation}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {recommendation.lostCompanions && recommendation.lostCompanions.length > 0 && (
              <div className="recovery-alternatives recovery-at-risk">
                <h4>At highest thermodynamic risk (C-class)</h4>
                <ul>
                  {recommendation.lostCompanions.map((comp) => (
                    <li key={comp.symbol}>
                      <strong>{comp.symbol}</strong> — largely lost in this carrier route unless pre-sorted or
                      hydrometallurgically treated.
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {recommendation.rejectedCarriers && recommendation.rejectedCarriers.length > 0 && (
              <div className="recovery-alternatives">
                <h4>Why not the other carrier metals for the pyro fraction?</h4>
                <ul>
                  {recommendation.rejectedCarriers.map((alt) => (
                    <li key={alt.symbol}>
                      <strong>
                        {alt.name} ({alt.symbol})
                      </strong>{" "}
                      — Metal Wheel score {alt.scorePercent}%. {alt.explanation}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {recommendation.targetMetalNotes && recommendation.targetMetalNotes.length > 0 && (
              <div className="recovery-alternatives recovery-target-metals">
                <h4>Why not gold (Au) as a carrier metal?</h4>
                <ul>
                  {recommendation.targetMetalNotes.map((note) => (
                    <li key={note.symbol}>
                      <strong>
                        {note.name} ({note.symbol})
                      </strong>{" "}
                      — {note.explanation}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <p style={{ marginTop: "0.5rem" }}>
              Illustrative processing-cost index: {recommendation.cost.value} {recommendation.cost.currency} (
              {recommendation.cost.basis === "per-kilogram" ? "per kg treated mass" : "per component"})
            </p>
            {recommendation.costNote && <p className="recovery-cost-note">{recommendation.costNote}</p>}
            {recommendation.educationalLink && (
              <a
                href={recommendation.educationalLink.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--accent)", display: "block", marginTop: "0.75rem" }}
              >
                {recommendation.educationalLink.label}
              </a>
            )}
          </>
        ) : (
          <p className="placeholder">Computing recommendation...</p>
        )}
      </section>
    </div>
  );
}
