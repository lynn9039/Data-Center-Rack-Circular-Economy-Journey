import { useState } from "react";

const STORAGE_KEY = "rack-ce-intro-dismissed";

function wasDismissedBefore(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function SiteIntro() {
  const [dismissed, setDismissed] = useState(wasDismissedBefore);

  if (dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  return (
    <aside className="site-intro panel" aria-label="About this explorer">
      <div className="site-intro-header">
        <h1>Data Center Rack Explorer</h1>
        <button type="button" className="secondary site-intro-close" onClick={dismiss} aria-label="Dismiss introduction">
          ×
        </button>
      </div>
      <p>
        This page presents a typical <strong>data center rack</strong> and the equipment it hosts — network gear, compute,
        GPU servers, storage, power distribution, cabling, and cooling.
      </p>
      <p>
        The goal is to explore <strong>circular economy</strong> questions at end-of-life: what each unit contains, how it
        can be taken apart, which materials matter strategically, and how recovery might work in practice.
      </p>
      <ul>
        <li>
          <strong>Click a rack unit</strong> to see its function and material breakdown.
        </li>
        <li>
          Open <strong>Circular Economy Life</strong> for deconstructed photos, strategic materials, and recovery paths
          informed by the Metal Wheel.
        </li>
        <li>
          Use the <strong>rotation wheel</strong> (bottom-right) to turn the rack, or reset the view at any time.
        </li>
      </ul>
      <button type="button" className="site-intro-cta" onClick={dismiss}>
        Start exploring
      </button>
    </aside>
  );
}
