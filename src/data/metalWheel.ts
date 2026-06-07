import type { CarrierMetal, Classification, MetalWheel, Result, LoadError } from "./types";

const BASIC_LATIN = /^[\x20-\x7E]+$/;
const CLASS: Classification[] = ["A", "B", "C"];

function isNum01(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n) && n >= 0 && n <= 1;
}

function parseCarrier(raw: unknown, idx: number, source: string): Result<CarrierMetal, LoadError> {
  if (!raw || typeof raw !== "object") {
    return { ok: false, error: { kind: "schema", sourceLocation: source, field: `carriers[${idx}]`, message: "Invalid carrier object" } };
  }
  const c = raw as Record<string, unknown>;
  const symbol = c.symbol;
  const name = c.name;
  if (typeof symbol !== "string" || !symbol || symbol.length > 8 || !BASIC_LATIN.test(symbol)) {
    return { ok: false, error: { kind: "schema", sourceLocation: source, field: `carriers[${idx}].symbol`, message: "Invalid symbol" } };
  }
  if (typeof name !== "string" || !name || name.length > 64 || !BASIC_LATIN.test(name)) {
    return { ok: false, error: { kind: "schema", sourceLocation: source, field: `carriers[${idx}].name`, message: "Invalid name" } };
  }
  const attrs = c.attributes as Record<string, unknown> | undefined;
  if (!attrs || !isNum01(attrs.recoverableYield) || !isNum01(attrs.technicalDifficulty) || !isNum01(attrs.capitalInvestment) || !isNum01(attrs.saleValue)) {
    return { ok: false, error: { kind: "schema", sourceLocation: source, field: `carriers[${idx}].attributes`, message: "Invalid attributes" } };
  }
  const companionsRaw = c.companions;
  if (!Array.isArray(companionsRaw) || companionsRaw.length > 30) {
    return { ok: false, error: { kind: "schema", sourceLocation: source, field: `carriers[${idx}].companions`, message: "Invalid companions array" } };
  }
  const companions = [];
  for (let i = 0; i < companionsRaw.length; i++) {
    const comp = companionsRaw[i] as Record<string, unknown>;
    if (typeof comp.symbol !== "string" || !comp.symbol || !BASIC_LATIN.test(comp.symbol)) {
      return { ok: false, error: { kind: "schema", sourceLocation: source, field: `carriers[${idx}].companions[${i}].symbol`, message: "Invalid companion symbol" } };
    }
    if (!CLASS.includes(comp.classification as Classification)) {
      return { ok: false, error: { kind: "schema", sourceLocation: source, field: `carriers[${idx}].companions[${i}].classification`, message: "Invalid classification" } };
    }
    companions.push({ symbol: comp.symbol, classification: comp.classification as Classification });
  }
  return {
    ok: true,
    value: {
      symbol,
      name,
      attributes: {
        recoverableYield: attrs.recoverableYield,
        technicalDifficulty: attrs.technicalDifficulty,
        capitalInvestment: attrs.capitalInvestment,
        saleValue: attrs.saleValue,
      },
      companions,
    },
  };
}

export function parseMetalWheel(input: string, source: string): Result<MetalWheel, LoadError> {
  let data: unknown;
  try {
    data = JSON.parse(input);
  } catch {
    return { ok: false, error: { kind: "unreadable", sourceLocation: source, message: "JSON parse failed" } };
  }
  if (!data || typeof data !== "object" || !Array.isArray((data as { carriers?: unknown }).carriers)) {
    return { ok: false, error: { kind: "schema", sourceLocation: source, message: "Missing carriers array" } };
  }
  const carriersRaw = (data as { carriers: unknown[] }).carriers;
  if (carriersRaw.length > 50) {
    return { ok: false, error: { kind: "schema", sourceLocation: source, field: "carriers", message: "Too many carriers" } };
  }
  const carriers: CarrierMetal[] = [];
  for (let i = 0; i < carriersRaw.length; i++) {
    const r = parseCarrier(carriersRaw[i], i, source);
    if (!r.ok) return r;
    carriers.push(r.value);
  }
  return { ok: true, value: { carriers } };
}

export function serializeMetalWheel(wheel: MetalWheel): string {
  return JSON.stringify(wheel, null, 2);
}
