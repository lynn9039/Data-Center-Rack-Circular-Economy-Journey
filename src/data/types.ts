export type Classification = "A" | "B" | "C";

export interface CarrierAttributes {
  recoverableYield: number;
  technicalDifficulty: number;
  capitalInvestment: number;
  saleValue: number;
}

export interface Companion {
  symbol: string;
  classification: Classification;
}

export interface CarrierMetal {
  symbol: string;
  name: string;
  attributes: CarrierAttributes;
  companions: Companion[];
}

export interface MetalWheel {
  carriers: CarrierMetal[];
}

export interface Material {
  element: string;
  massPercent: number;
  isRare?: boolean;
}

export interface Chip {
  die?: string;
  package?: string;
  pins?: string;
}

export interface SubPart {
  id: string;
  name: string;
  primaryMaterial: string;
  function: string;
  chips?: Chip[];
  expectsChips: boolean;
}

export interface Component {
  id: string;
  displayName: string;
  subParts: SubPart[];
  materials: Material[];
  functions: string[];
  chipInfo: Chip[];
  containsChips: boolean;
}

export interface InvalidComponent {
  id: string | null;
  sourceLocation: string;
  errorField: string;
  errorMessage: string;
}

export interface ComponentCatalogue {
  valid: Component[];
  invalid: InvalidComponent[];
}

export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

export type LoadError = {
  kind: "missing-source" | "unreadable" | "schema";
  field?: string;
  sourceLocation: string;
  message: string;
};

export type CatalogueLoadError = {
  kind: "missing-source" | "unreadable" | "format";
  sourceLocation: string;
  message: string;
};
