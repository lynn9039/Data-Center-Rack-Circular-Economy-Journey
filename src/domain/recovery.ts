import type { Component, CarrierAttributes, CarrierMetal, MetalWheel } from "../data/types";
import type { Result } from "../data/types";
import { METAL_WHEEL_EDU_LINK } from "../data/metalWheelLinks";

export interface Cost {
  value: number;
  currency: string;
  basis: "per-component" | "per-kilogram";
}

/** Educational index only — not a live market or tolling quote. */
export interface CostEstimate extends Cost {
  note: string;
}

export interface RejectedCarrier {
  symbol: string;
  name: string;
  scorePercent: number;
  massPercent: number;
  explanation: string;
}

export interface TargetMetalNote {
  symbol: string;
  name: string;
  explanation: string;
}

export interface SelectedCarrier {
  symbol: string;
  name: string;
  scorePercent: number;
}

/** A parallel EoL route — bulk metals are often recovered alongside the pyrometallurgical carrier. */
export interface RecoveryStream {
  label: string;
  massPercent: number;
  method: string;
  metals: string[];
  explanation: string;
}

export interface CoRecoveredCompanion {
  symbol: string;
  name: string;
  classification: "A" | "B";
  explanation: string;
}

export interface RecoveryRecommendation {
  method: string;
  reasoning: string;
  cost: Cost;
  costNote?: string;
  tier: "full" | "tiered";
  lostCompanions: { symbol: string; classification: "B" | "C" }[];
  selectedCarrier?: SelectedCarrier;
  recoveryStreams?: RecoveryStream[];
  coRecoveredCompanions?: CoRecoveredCompanion[];
  rejectedCarriers?: RejectedCarrier[];
  targetMetalNotes?: TargetMetalNote[];
  educationalLink?: { label: string; href: string };
}
export type RecoveryError =
  | { kind: "empty-composition" }
  | { kind: "no-recognized-elements" };

const EDU_LINK = METAL_WHEEL_EDU_LINK;

function roundCost(value: number): number {
  return Math.round(value * 10) / 10;
}

/**
 * Illustrative processing-cost index (USD/kg) for teaching—not sourced from live tolling or LCA databases.
 * Scales with Metal Wheel difficulty, capital intensity, yield loss, and number of parallel streams.
 */
function estimateFullRecoveryCost(carrier: CarrierMetal, streamCount: number): CostEstimate {
  const a = carrier.attributes;
  const pyroIndex =
    6 + a.technicalDifficulty * 8 + a.capitalInvestment * 6 + (1 - a.recoverableYield) * 4;
  const logisticsIndex = Math.max(0, streamCount - 1) * 1.5;
  const value = roundCost(pyroIndex + logisticsIndex);

  return {
    value,
    currency: "USD",
    basis: "per-kilogram",
    note: `Index derived from this explorer’s Metal Wheel attributes for ${carrier.symbol} (technical difficulty ${(a.technicalDifficulty * 100).toFixed(0)}%, capital intensity ${(a.capitalInvestment * 100).toFixed(0)}%, recoverable yield ${(a.recoverableYield * 100).toFixed(0)}%) plus ${streamCount} parallel stream${streamCount > 1 ? "s" : ""}. Real WEEE tolling varies widely by region, grade, and smelter (often ~$5–$50+/kg treated mass in industry reports)—this is not a price quote.`,
  };
}

function estimateTieredCost(): CostEstimate {
  return {
    value: 8.5,
    currency: "USD",
    basis: "per-kilogram",
    note: "Placeholder index when the Metal Wheel is unavailable: assumes bulk sort + preliminary recovery only, without full thermodynamic routing analysis. Not a market quote.",
  };
}

function estimateRareMetalCost(rareCount: number): CostEstimate {
  return {
    value: roundCost(32 + rareCount * 8),
    currency: "USD",
    basis: "per-kilogram",
    note: "Illustrative index for dedicated hydrometallurgical / rare-metal capture (higher CAPEX and reagent cost than bulk pyrometallurgy). Actual plant economics depend on feed grade and offtake contracts—not modeled here.",
  };
}

const ELEMENT_NAMES: Record<string, string> = {
  Fe: "Iron",
  Cu: "Copper",
  Al: "Aluminum",
  Au: "Gold",
  Ag: "Silver",
  Sn: "Tin",
  Pb: "Lead",
  Mg: "Magnesium",
  C: "Carbon",
};

function elementName(symbol: string): string {
  return ELEMENT_NAMES[symbol] ?? symbol;
}

function hasElectronicFraction(component: Component): boolean {
  return (
    component.containsChips ||
    component.subParts.some(
      (sp) => sp.expectsChips || /fr-4|pcb|laminate|trace/i.test(sp.primaryMaterial),
    )
  );
}

function buildCoRecoveredCompanions(carrier: CarrierMetal, component: Component): CoRecoveredCompanion[] {
  const elems = elementSet(component);
  return carrier.companions
    .filter(
      (c) =>
        c.symbol !== carrier.symbol &&
        elems.has(c.symbol) &&
        (c.classification === "A" || c.classification === "B"),
    )
    .map((c) => ({
      symbol: c.symbol,
      name: elementName(c.symbol),
      classification: c.classification as "A" | "B",
      explanation:
        c.classification === "A"
          ? `${elementName(c.symbol)} follows ${carrier.symbol} efficiently in the same smelter infrastructure (A-class companion).`
          : `${elementName(c.symbol)} is partially captured downstream from the ${carrier.symbol} fraction—e.g. in anode slimes or refining—despite higher thermodynamic losses (B-class companion).`,
    }));
}

function buildParallelStream(
  material: { element: string; massPercent: number; isRare?: boolean },
  selectedCarrier: CarrierMetal,
): RecoveryStream | null {
  const { element, massPercent } = material;
  if (element === selectedCarrier.symbol || material.isRare) return null;

  if (element === "Fe" && massPercent >= 0.12) {
    return {
      label: "Ferrous structural fraction",
      massPercent,
      method: "Mechanical sort → electric-arc furnace (EAF) steel remelting",
      metals: ["Fe"],
      explanation: `Steel chassis, bays, and enclosures (~${(massPercent * 100).toFixed(0)}% of mass) are recovered in a dedicated ferrous scrap stream. This runs in parallel with—not through—the ${selectedCarrier.symbol} pyrometallurgical route.`,
    };
  }

  if (element === "Al" && massPercent >= 0.12) {
    return {
      label: "Aluminum fraction",
      massPercent,
      method: "Mechanical sort → secondary aluminum remelting",
      metals: ["Al"],
      explanation: `Aluminum heat sinks, sheet metal, and extrusions (~${(massPercent * 100).toFixed(0)}%) are typically hand- or sensor-sorted and remelted in dedicated Al furnaces without entering the copper smelter.`,
    };
  }

  if (element === "Cu" && massPercent >= 0.12 && selectedCarrier.symbol !== "Cu") {
    return {
      label: "Copper-dominant fraction",
      massPercent,
      method: "Wire/copper sort → copper refining or Cu-carrier smelting",
      metals: ["Cu"],
      explanation: `High-copper fractions (busbars, wiring, backplanes) can be separated before the main ${selectedCarrier.symbol} route and processed via copper-focused recycling.`,
    };
  }

  return null;
}

function buildPyroStream(
  component: Component,
  carrier: CarrierMetal,
  carrierScore: number,
  coRecovered: CoRecoveredCompanion[],
): RecoveryStream {
  const cu = massPercentFor(component, "Cu");
  const electronics = hasElectronicFraction(component);
  const rareMass = component.materials.filter((m) => m.isRare).reduce((s, m) => s + m.massPercent, 0);
  const estMass = Math.min(Math.max(cu, electronics ? 0.08 : 0.05) + rareMass, 0.45);

  const metals = [...new Set([carrier.symbol, ...coRecovered.map((c) => c.symbol)])];

  return {
    label: "Complex / electronic fraction",
    massPercent: estMass,
    method: `${carrier.name} (${carrier.symbol}) carrier pyrometallurgy — Metal Wheel score ${Math.round(carrierScore * 100)}%`,
    metals,
    explanation: `PCBs, connectors, and mixed metallics enter a pyrometallurgical smelter where ${carrier.symbol} anchors the melt. Companion metals are co-recovered in slimes, anode sludge, or off-gas treatment—they are not discarded because ${carrier.symbol} was chosen as carrier.`,
  };
}

function buildRecoveryStreams(
  component: Component,
  carrier: CarrierMetal,
  carrierScore: number,
  coRecovered: CoRecoveredCompanion[],
): RecoveryStream[] {
  const parallel = component.materials
    .map((m) => buildParallelStream(m, carrier))
    .filter((s): s is RecoveryStream => s !== null)
    .sort((a, b) => b.massPercent - a.massPercent);

  const cu = massPercentFor(component, "Cu");
  const needsPyro = cu >= 0.04 || hasElectronicFraction(component) || coRecovered.length > 0;

  if (!needsPyro && parallel.length > 0) {
    return parallel;
  }

  return [...parallel, buildPyroStream(component, carrier, carrierScore, coRecovered)];
}

function carrierScore(c: MetalWheel["carriers"][0]): number {
  const a = c.attributes;
  return (a.recoverableYield + a.technicalDifficulty + a.capitalInvestment + a.saleValue) / 4;
}

function massPercentFor(component: Component, symbol: string): number {
  return component.materials.find((m) => m.element === symbol)?.massPercent ?? 0;
}

function companionConflictText(carrier: CarrierMetal, component: Component): string | null {
  const elems = elementSet(component);
  const conflicts = carrier.companions.filter(
    (c) => c.symbol !== carrier.symbol && elems.has(c.symbol) && (c.classification === "B" || c.classification === "C"),
  );
  if (conflicts.length === 0) return null;
  return `Using ${carrier.symbol} as carrier classifies co-located ${conflicts.map((c) => `${c.symbol} (${c.classification})`).join(", ")} as thermodynamically disadvantaged companions, reducing overall recovery opportunity.`;
}

function mainScoreGapText(candidate: CarrierMetal, selected: CarrierMetal): string | null {
  const labels: Record<keyof CarrierAttributes, string> = {
    recoverableYield: "recoverable yield",
    technicalDifficulty: "process feasibility",
    capitalInvestment: "capital intensity",
    saleValue: "downstream sale value",
  };
  let worstKey: keyof CarrierAttributes | null = null;
  let worstGap = 0;

  (Object.keys(labels) as (keyof CarrierAttributes)[]).forEach((key) => {
    const selectedVal = selected.attributes[key];
    const candidateVal = candidate.attributes[key];
    const gap =
      key === "technicalDifficulty" || key === "capitalInvestment"
        ? candidateVal - selectedVal
        : selectedVal - candidateVal;
    if (gap > worstGap) {
      worstGap = gap;
      worstKey = key;
    }
  });

  if (!worstKey || worstGap < 0.05) return null;
  return `Largest score gap vs ${selected.symbol}: lower ${labels[worstKey]} (${(candidate.attributes[worstKey] * 100).toFixed(0)}% vs ${(selected.attributes[worstKey] * 100).toFixed(0)}% on the Metal Wheel scale).`;
}

function buildRejectedCarrier(
  candidate: CarrierMetal,
  selected: CarrierMetal,
  component: Component,
): RejectedCarrier {
  const candidateScore = carrierScore(candidate);
  const selectedScore = carrierScore(selected);
  const candidateMass = massPercentFor(component, candidate.symbol);
  const selectedMass = massPercentFor(component, selected.symbol);
  const parts: string[] = [];

  if (candidateMass > selectedMass) {
    parts.push(
      `${candidate.name} is the largest mass fraction here (${(candidateMass * 100).toFixed(1)}% vs ${selected.symbol}'s ${(selectedMass * 100).toFixed(1)}%), but carrier routing is driven by Metal Wheel recoverability—not bulk share alone.`,
    );
  }

  parts.push(
    `Combined Metal Wheel score ${(candidateScore * 100).toFixed(0)}% vs ${(selectedScore * 100).toFixed(0)}% for ${selected.name} (${selected.symbol}).`,
  );

  const gap = mainScoreGapText(candidate, selected);
  if (gap) parts.push(gap);

  const companion = companionConflictText(candidate, component);
  if (companion) parts.push(companion);

  return {
    symbol: candidate.symbol,
    name: candidate.name,
    scorePercent: Math.round(candidateScore * 100),
    massPercent: candidateMass,
    explanation: parts.join(" "),
  };
}

function rejectedCompositionCarriers(
  component: Component,
  relevant: CarrierMetal[],
  selected: CarrierMetal,
): RejectedCarrier[] {
  const elems = elementSet(component);
  return relevant
    .filter((c) => c.symbol !== selected.symbol && elems.has(c.symbol))
    .map((c) => buildRejectedCarrier(c, selected, component))
    .sort((a, b) => b.massPercent - a.massPercent);
}

function mentionsGold(component: Component): boolean {
  const inMaterials = component.materials.some((m) => m.element === "Au");
  const inSubParts = component.subParts.some((sp) => /au|gold/i.test(sp.primaryMaterial));
  return inMaterials || inSubParts;
}

function goldMassPercent(component: Component): number | null {
  const au = component.materials.find((m) => m.element === "Au");
  return au ? au.massPercent : null;
}

function buildGoldTargetNote(component: Component, wheel: MetalWheel, selected: CarrierMetal): TargetMetalNote {
  const mass = goldMassPercent(component);
  const massText =
    mass !== null
      ? ` (~${(mass * 100).toFixed(2)}% by mass in this unit's composition`
      : " (trace amounts in connector plating and PCB finishes";
  const locations = component.subParts
    .filter((sp) => /au|gold/i.test(sp.primaryMaterial))
    .map((sp) => sp.name);
  const locationText =
    locations.length > 0 ? `, e.g. ${locations.join(", ")})` : mass !== null ? ")" : " on memory and board contacts)";

  const cuCarrier = wheel.carriers.find((c) => c.symbol === "Cu");
  const auOnCu = cuCarrier?.companions.find((c) => c.symbol === "Au");
  const companionText =
    auOnCu && selected.symbol === "Cu"
      ? ` When ${selected.symbol} is the carrier, Au is a ${auOnCu.classification}-class companion—recovered from the copper fraction rather than acting as the melt anchor.`
      : auOnCu
        ? ` On copper-based routes, Au is typically a ${auOnCu.classification}-class companion captured downstream—not a carrier.`
        : "";

  const parts = [
    `Gold${massText}${locationText}. Au is never selected as a carrier metal in the Metal Wheel framework: only bulk metals (Cu, Fe, Al) can anchor industrial pyrometallurgical melts at tonne scale.`,
    `Despite Au's very high market price per gram, that value is exactly why it is a recovery target, not a carrier—you would not dissolve scrap into a gold bath to recover cheaper metals.`,
    `Au's mass share is far too small to physically support a smelting route; using it as carrier would mean sacrificing the most valuable material in the product stream.${companionText}`,
  ];

  return { symbol: "Au", name: "Gold", explanation: parts.join(" ") };
}

function buildTargetMetalNotes(
  component: Component,
  wheel: MetalWheel,
  selected: CarrierMetal,
): TargetMetalNote[] {
  const notes: TargetMetalNote[] = [];
  if (mentionsGold(component)) {
    notes.push(buildGoldTargetNote(component, wheel, selected));
  }
  return notes;
}
function elementSet(component: Component): Set<string> {
  return new Set(component.materials.map((m) => m.element));
}

function rareMetalOverride(component: Component, wheel: MetalWheel): boolean {
  const rares = component.materials.filter((m) => m.isRare);
  if (rares.length === 0) return false;
  return rares.every((r) =>
    wheel.carriers.every((c) => {
      const comp = c.companions.find((x) => x.symbol === r.element);
      return comp && (comp.classification === "B" || comp.classification === "C");
    }),
  );
}

function tieredRecommendation(component: Component, caveat: string): RecoveryRecommendation {
  const sorted = [...component.materials].sort((a, b) => b.massPercent - a.massPercent);
  const top = sorted[0];
  const breakdown = sorted.map((m) => `${m.element} (${(m.massPercent * 100).toFixed(1)}%)`).join(", ");
  const cost = estimateTieredCost();
  return {
    method: `Preliminary ${top.element}-based recovery`,
    reasoning: `Material breakdown: ${breakdown}. ${caveat}`,
    cost,
    costNote: cost.note,
    tier: "tiered",
    lostCompanions: [],
    educationalLink: EDU_LINK,
  };
}

export function recommend(
  component: Component,
  wheel: MetalWheel | null,
): Result<RecoveryRecommendation, RecoveryError> {
  if (!component.materials.length) {
    return { ok: false, error: { kind: "empty-composition" } };
  }

  if (!wheel || wheel.carriers.length === 0) {
    const caveat =
      wheel && wheel.carriers.length === 0
        ? "No carrier metals are available for the recovery analysis."
        : "This recommendation does not account for inter-element recovery trade-offs, carrier metal routing conflicts, or thermodynamic loss pathways.";
    return { ok: true, value: tieredRecommendation(component, caveat) };
  }

  const elems = elementSet(component);
  const relevant = wheel.carriers.filter((c) =>
    c.companions.some((comp) => elems.has(comp.symbol)) || elems.has(c.symbol),
  );

  if (relevant.length === 0) {
    return { ok: false, error: { kind: "no-recognized-elements" } };
  }

  if (rareMetalOverride(component, wheel)) {
    const rares = component.materials.filter((m) => m.isRare).map((m) => m.element);
    const cost = estimateRareMetalCost(rares.length);
    return {
      ok: true,
      value: {
        method: "Rare-metal priority hydrometallurgical route",
        reasoning: `Rare metals/REEs (${rares.join(", ")}) are classified B or C against every carrier metal. Prioritizing dedicated capture of these elements over standard carrier-metal routing.`,
        cost,
        costNote: cost.note,
        tier: "full",
        lostCompanions: [],
      },
    };
  }

  let best = relevant[0];
  let bestScore = carrierScore(best);
  for (const c of relevant.slice(1)) {
    const s = carrierScore(c);
    if (s > bestScore || (s === bestScore && c.attributes.recoverableYield > best.attributes.recoverableYield)) {
      best = c;
      bestScore = s;
    }
  }

  const lostCompanions = best.companions
    .filter((comp) => elems.has(comp.symbol) && comp.classification === "C")
    .map((comp) => ({ symbol: comp.symbol, classification: comp.classification as "C" }));

  const coRecoveredCompanions = buildCoRecoveredCompanions(best, component);
  const recoveryStreams = buildRecoveryStreams(component, best, bestScore, coRecoveredCompanions);

  const massDesc = component.materials
    .map((m) => `${m.element} (${(m.massPercent * 100).toFixed(1)}%)`)
    .join(", ");

  const lostText =
    lostCompanions.length > 0
      ? ` Elements at highest risk in this route (C-class): ${lostCompanions.map((l) => l.symbol).join(", ")}.`
      : "";

  const streamCount = recoveryStreams.length;
  const cost = estimateFullRecoveryCost(best, streamCount);

  return {
    ok: true,
    value: {
      method: `Multi-stream recovery (${streamCount} parallel route${streamCount > 1 ? "s" : ""})`,
      reasoning: `${component.displayName} composition: ${massDesc}. Recovery is not exclusive to one metal—dismantling enables ${streamCount} parallel stream${streamCount > 1 ? "s" : ""}. Bulk Fe/Al fractions can be remelted separately while the complex/electronic fraction uses ${best.symbol} as pyrometallurgical carrier (Metal Wheel score ${(bestScore * 100).toFixed(0)}%).${lostText}`,
      cost,
      costNote: cost.note,
      tier: "full",
      lostCompanions,
      selectedCarrier: {
        symbol: best.symbol,
        name: best.name,
        scorePercent: Math.round(bestScore * 100),
      },
      recoveryStreams,
      coRecoveredCompanions,
      rejectedCarriers: rejectedCompositionCarriers(component, relevant, best),
      targetMetalNotes: buildTargetMetalNotes(component, wheel, best),
      educationalLink: EDU_LINK,
    },
  };
}

export function selectSubPartsForExploded(subParts: Component["subParts"]): Component["subParts"] {
  if (subParts.length <= 12) {
    if (subParts.length >= 3) return subParts;
    return [...subParts, ...subParts, ...subParts].slice(0, 3);
  }
  return subParts.slice(0, 12);
}
