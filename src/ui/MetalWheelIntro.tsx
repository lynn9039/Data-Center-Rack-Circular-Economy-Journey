import type { RecoveryRecommendation, RecoveryError } from "../domain/recovery";
import { METAL_WHEEL_EDU_LINK } from "../data/metalWheelLinks";

export interface MetalWheelIntroProps {
  recommendation: RecoveryRecommendation | RecoveryError | null;
  metalWheelUnavailable: boolean;
}

export function MetalWheelIntro({ recommendation, metalWheelUnavailable }: MetalWheelIntroProps) {
  if (metalWheelUnavailable) return null;

  const fullRec =
    recommendation && !("kind" in recommendation) && recommendation.tier === "full" ? recommendation : null;

  return (
    <section className="metal-wheel-section">
      <h3>Metal Wheel</h3>
      <p>
        The Metal Wheel (developed by Markus Reuter and colleagues at Wageningen University &amp; Research, widely
        published via the UNEP International Resource Panel) models how metals behave during end-of-life smelting. A{" "}
        <strong>carrier metal</strong> (Cu, Fe, or Al in this explorer) anchors the pyrometallurgical route: bulk
        feedstock dissolves into the melt while companion elements follow different thermodynamic pathways.
      </p>
      <p>
        Companion elements are classified as <strong>A</strong> (recovered efficiently with the carrier),{" "}
        <strong>B</strong> (partially lost or diverted), or <strong>C</strong> (largely lost). Precious metals such
        as Au are targets to capture downstream—not carriers themselves.
      </p>
      <p>
        <strong>Recovery is not exclusive.</strong> In practice, steel and aluminum fractions are often sorted out
        and remelted in parallel while PCBs and mixed scrap follow a pyrometallurgical carrier route—recovering
        copper does not prevent recovering iron or aluminum from the same product.
      </p>
      <div className="metal-wheel-score-box">
        <h4>Metal Wheel score</h4>
        <p>
          For each candidate carrier, the score is the average of four normalized attributes (0–100% each): recoverable
          yield, process feasibility, capital intensity, and downstream sale value. The route with the{" "}
          <strong>highest combined score</strong> is recommended—not simply the metal with the largest mass share.
        </p>
        {fullRec?.selectedCarrier && (
          <p className="metal-wheel-score-highlight">
            Pyrometallurgical carrier for the complex fraction:{" "}
            <strong>
              {fullRec.selectedCarrier.name} ({fullRec.selectedCarrier.symbol})
            </strong>{" "}
            — Metal Wheel score <strong>{fullRec.selectedCarrier.scorePercent}%</strong>.
            {fullRec.recoveryStreams && fullRec.recoveryStreams.length > 1 && (
              <> Other metals may still be recovered via additional parallel streams below.</>
            )}
          </p>
        )}
      </div>
      <a
        href={METAL_WHEEL_EDU_LINK.href}
        target="_blank"
        rel="noopener noreferrer"
        className="metal-wheel-link"
      >
        {METAL_WHEEL_EDU_LINK.label}
      </a>
    </section>
  );
}
