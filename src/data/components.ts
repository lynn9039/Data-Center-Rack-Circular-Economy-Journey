import type { Chip, Component, ComponentCatalogue, InvalidComponent, Result, CatalogueLoadError } from "./types";

function parseChip(raw: unknown): Chip | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const c = raw as Record<string, unknown>;
  const chip: Chip = {};
  if (typeof c.die === "string") chip.die = c.die;
  if (typeof c.package === "string") chip.package = c.package;
  if (typeof c.pins === "string") chip.pins = c.pins;
  return Object.keys(chip).length ? chip : undefined;
}

function validateEntry(raw: unknown, source: string, index: number): Component | InvalidComponent {
  const loc = `${source}:components[${index}]`;
  if (!raw || typeof raw !== "object") {
    return { id: null, sourceLocation: loc, errorField: "entry", errorMessage: "Invalid entry object" };
  }
  const e = raw as Record<string, unknown>;
  const id = e.id;
  if (typeof id !== "string" || !id || id.length > 128) {
    return { id: typeof id === "string" ? id : null, sourceLocation: loc, errorField: "id", errorMessage: "Invalid id" };
  }
  const displayName = e.displayName;
  if (typeof displayName !== "string" || !displayName || displayName.length > 256) {
    return { id, sourceLocation: loc, errorField: "displayName", errorMessage: "Invalid displayName" };
  }
  const containsChips = e.containsChips === true;
  const subPartsRaw = e.subParts;
  if (!Array.isArray(subPartsRaw) || subPartsRaw.length < 1 || subPartsRaw.length > 100) {
    return { id, sourceLocation: loc, errorField: "subParts", errorMessage: "Invalid subParts" };
  }
  const materialsRaw = e.materials;
  if (!Array.isArray(materialsRaw) || materialsRaw.length < 1 || materialsRaw.length > 100) {
    return { id, sourceLocation: loc, errorField: "materials", errorMessage: "Invalid materials" };
  }
  const functionsRaw = e.functions;
  if (!Array.isArray(functionsRaw) || functionsRaw.length < 1 || functionsRaw.length > 50) {
    return { id, sourceLocation: loc, errorField: "functions", errorMessage: "Invalid functions" };
  }
  const chipInfoRaw = e.chipInfo;
  if (!Array.isArray(chipInfoRaw)) {
    return { id, sourceLocation: loc, errorField: "chipInfo", errorMessage: "Invalid chipInfo" };
  }
  if (!containsChips && chipInfoRaw.length > 0) {
    return { id, sourceLocation: loc, errorField: "chipInfo", errorMessage: "chipInfo must be empty when containsChips is false" };
  }

  const subParts = [];
  for (let i = 0; i < subPartsRaw.length; i++) {
    const sp = subPartsRaw[i] as Record<string, unknown>;
    if (typeof sp.id !== "string" || typeof sp.name !== "string" || sp.name.length < 1 || sp.name.length > 60) {
      return { id, sourceLocation: loc, errorField: `subParts[${i}].name`, errorMessage: "Invalid subPart name" };
    }
    if (typeof sp.primaryMaterial !== "string" || sp.primaryMaterial.length < 1 || sp.primaryMaterial.length > 60) {
      return { id, sourceLocation: loc, errorField: `subParts[${i}].primaryMaterial`, errorMessage: "Invalid primaryMaterial" };
    }
    if (typeof sp.function !== "string" || sp.function.length < 1 || sp.function.length > 200) {
      return { id, sourceLocation: loc, errorField: `subParts[${i}].function`, errorMessage: "Invalid function" };
    }
    const expectsChips = sp.expectsChips === true;
    const chips = Array.isArray(sp.chips) ? sp.chips.map(parseChip).filter((c): c is Chip => !!c) : undefined;
    subParts.push({
      id: sp.id as string,
      name: sp.name as string,
      primaryMaterial: sp.primaryMaterial as string,
      function: sp.function as string,
      expectsChips,
      chips,
    });
  }

  const materials = [];
  for (const m of materialsRaw) {
    const mr = m as Record<string, unknown>;
    if (typeof mr.element !== "string" || typeof mr.massPercent !== "number") {
      return { id, sourceLocation: loc, errorField: "materials", errorMessage: "Invalid material entry" };
    }
    materials.push({
      element: mr.element,
      massPercent: mr.massPercent,
      isRare: mr.isRare === true,
    });
  }

  const functions = functionsRaw.filter((f): f is string => typeof f === "string");
  const chipInfo = chipInfoRaw.map(parseChip).filter((c): c is Chip => !!c);

  return {
    id,
    displayName,
    subParts,
    materials,
    functions,
    chipInfo,
    containsChips,
  };
}

export function parseCatalogue(input: string, source: string): Result<ComponentCatalogue, CatalogueLoadError> {
  let data: unknown;
  try {
    data = JSON.parse(input);
  } catch {
    return { ok: false, error: { kind: "format", sourceLocation: source, message: "JSON parse failed" } };
  }
  if (!data || typeof data !== "object" || !Array.isArray((data as { components?: unknown }).components)) {
    return { ok: false, error: { kind: "format", sourceLocation: source, message: "Missing components array" } };
  }
  const entries = (data as { components: unknown[] }).components;
  if (entries.length > 500) {
    return { ok: false, error: { kind: "format", sourceLocation: source, message: "Too many components" } };
  }
  const valid: Component[] = [];
  const invalid: InvalidComponent[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < entries.length; i++) {
    const result = validateEntry(entries[i], source, i);
    if ("errorField" in result) {
      invalid.push(result);
    } else {
      if (seen.has(result.id)) {
        invalid.push({ id: result.id, sourceLocation: `${source}:components[${i}]`, errorField: "id", errorMessage: "Duplicate id" });
      } else {
        seen.add(result.id);
        valid.push(result);
      }
    }
  }
  return { ok: true, value: { valid, invalid } };
}

export function serializeCatalogue(cat: ComponentCatalogue): string {
  return JSON.stringify({ components: cat.valid }, null, 2);
}
