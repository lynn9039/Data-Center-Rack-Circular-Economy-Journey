export type MaterialCategory = "precious" | "critical" | "technology";

export type RecoveryOutlook = "typically-recovered" | "partial" | "often-lost";

export type SupplyRisk = "high" | "medium" | "low";

export interface StrategicMaterialEntry {
  symbol: string;
  name: string;
  category: MaterialCategory;
  /** Approximate mass share or qualitative abundance in this unit type */
  massNote: string;
  locationInUnit: string;
  function: string;
  recoveryRoute: string;
  recoveryOutlook: RecoveryOutlook;
  supplyRisk: SupplyRisk;
  /** Supply-chain / national-security framing (educational, not policy advice) */
  supplyInsight: string;
  policyTags?: string[];
}

const STRATEGIC_MATERIALS: Record<string, StrategicMaterialEntry[]> = {
  "switch-1": [
    {
      symbol: "Au",
      name: "Gold",
      category: "precious",
      massNote: "~0.2% (modeled)",
      locationInUnit: "Switch PCB — BGA pads, edge fingers, ENIG finish",
      function: "Oxidation-resistant contacts for ASIC and high-speed ports",
      recoveryRoute: "Cu-carrier smelting → anode slime / precious-metal refinery",
      recoveryOutlook: "typically-recovered",
      supplyRisk: "medium",
      supplyInsight:
        "Not on most critical-mineral lists, but strategically sensitive as a by-product of copper smelting capacity. U.S. refinery output depends on global Cu infrastructure.",
      policyTags: ["By-product of Cu refining"],
    },
    {
      symbol: "Ag",
      name: "Silver",
      category: "precious",
      massNote: "Trace (solder & contacts)",
      locationInUnit: "PCB solder joints, RF shielding, connector plating",
      function: "Conductivity in solder alloys and EMI shielding",
      recoveryRoute: "Co-recovered with Cu pyrometallurgy (B-class companion) or hydrometallurgical PCB leach",
      recoveryOutlook: "typically-recovered",
      supplyRisk: "low",
      supplyInsight: "Industrial demand ties Ag recovery to the same WEEE→Cu chain as data-center electronics.",
    },
    {
      symbol: "Pd",
      name: "Palladium",
      category: "precious",
      massNote: "Trace (select finishes)",
      locationInUnit: "Connector and PCB surface finishes on high-end switch boards",
      function: "Alternative to hard gold on selective plating layers",
      recoveryRoute: "Precious-metal refinery from anode slime or dedicated e-scrap concentrate",
      recoveryOutlook: "partial",
      supplyRisk: "high",
      supplyInsight:
        "Pd supply is concentrated (Russia, South Africa). E-scrap is a growing secondary source, but only if boards reach precious-metal refining—not steel shredding.",
    },
    {
      symbol: "Ga",
      name: "Gallium",
      category: "critical",
      massNote: "Micrograms per ASIC (die-level)",
      locationInUnit: "Switch ASIC — compound-semiconductor or GaAs/GaN PHY sub-circuits",
      function: "High-frequency port electronics and optical transceiver chips",
      recoveryRoute: "Specialized chip/pre-concentrate routes; lost in bulk Cu/Fe smelting",
      recoveryOutlook: "often-lost",
      supplyRisk: "high",
      supplyInsight:
        "On U.S. and EU critical-mineral lists. By-product of bauxite/alumina; China dominates refining. Rack switches embed Ga in dies that standard smelting never captures.",
      policyTags: ["US Critical Minerals", "EU CRM"],
    },
    {
      symbol: "Sn",
      name: "Tin",
      category: "technology",
      massNote: "Low % in solder",
      locationInUnit: "Solder on PCB and component attach",
      function: "Lead-free solder (SAC alloys) binding components to board",
      recoveryRoute: "Cu smelting (A-class companion on Cu carrier) or solder-focused recycling",
      recoveryOutlook: "partial",
      supplyRisk: "medium",
      supplyInsight:
        "Indonesia and China dominate tin supply. Recovery is feasible in Cu infrastructure but disperses into slag if boards are not separated.",
    },
  ],
  "router-1": [
    {
      symbol: "Au",
      name: "Gold",
      category: "precious",
      massNote: "Trace in line cards",
      locationInUnit: "Line-card PCB — FCBGA pads, backplane connectors",
      function: "Signal integrity on multi-Tbps NP/ASIC packages",
      recoveryRoute: "Cu-carrier pyrometallurgy → anode slime",
      recoveryOutlook: "typically-recovered",
      supplyRisk: "medium",
      supplyInsight: "Backbone routers concentrate Au in removable line cards—modular design aids targeted e-scrap collection.",
    },
    {
      symbol: "Ag",
      name: "Silver",
      category: "precious",
      massNote: "Trace",
      locationInUnit: "PCB solder, power plane plating",
      function: "Conductive paths and solder",
      recoveryRoute: "Co-recovered in Cu smelting stream",
      recoveryOutlook: "typically-recovered",
      supplyRisk: "low",
      supplyInsight: "Secondary Ag supply supports telecom hardware circularity when cards are segregated.",
    },
    {
      symbol: "In",
      name: "Indium",
      category: "critical",
      massNote: "Die-level trace",
      locationInUnit: "Packet-processor die — InP/InGaAs photonic or high-speed I/O regions",
      function: "Optical WAN interfaces and high-speed serdes",
      recoveryRoute: "Requires chip-level or hydrometallurgical WEEE; lost in ferrous/aluminum bulk routes",
      recoveryOutlook: "often-lost",
      supplyRisk: "high",
      supplyInsight:
        "U.S. critical mineral; zinc-mining by-product with concentrated refining in China. National-security relevance for export-controlled backbone gear.",
      policyTags: ["US Critical Minerals", "EU CRM"],
    },
    {
      symbol: "W",
      name: "Tungsten",
      category: "critical",
      massNote: "Trace (vias/heats spreaders)",
      locationInUnit: "Line-card PCB heavy copper/tungsten composite areas",
      function: "Heat spreading and dense interconnect",
      recoveryRoute: "Specialized hard-metal or slag reprocessing; poor recovery in standard Cu melt",
      recoveryOutlook: "partial",
      supplyRisk: "high",
      supplyInsight: "China dominates tungsten supply. Defense and telecom supply chains monitor W access for advanced packaging.",
      policyTags: ["US Critical Minerals"],
    },
    {
      symbol: "Co",
      name: "Cobalt",
      category: "critical",
      massNote: "Trace in passives",
      locationInUnit: "MLCC capacitors and power-filter components on line cards",
      function: "Stable capacitance in power-decoupling networks",
      recoveryRoute: "Hydrometallurgical PCB processing or slag treatment; limited in pyro-only routes",
      recoveryOutlook: "partial",
      supplyRisk: "high",
      supplyInsight:
        "DRC-dominated primary supply; critical for electronics though rack routers use less Co than EVs. Still relevant to CRM policy and conflict-mineral due diligence.",
      policyTags: ["US Critical Minerals", "EU CRM", "Conflict minerals"],
    },
  ],
  "server-1": [
    {
      symbol: "Au",
      name: "Gold",
      category: "precious",
      massNote: "~0.08% (modeled)",
      locationInUnit: "DIMM contacts, CPU socket, motherboard ENIG",
      function: "Low-resistance, corrosion-proof edge connections",
      recoveryRoute: "Cu-carrier smelting → anode slime; higher yield if DIMMs removed first",
      recoveryOutlook: "typically-recovered",
      supplyRisk: "medium",
      supplyInsight: "Servers are Au-rich per kg of PCB; hyperscale retirements are a strategic secondary-Au feedstock if segregated.",
    },
    {
      symbol: "Ag",
      name: "Silver",
      category: "precious",
      massNote: "Trace",
      locationInUnit: "Solder, PCIe fingers, PSU contacts",
      function: "Solder and connector conductivity",
      recoveryRoute: "Cu pyrometallurgy co-product",
      recoveryOutlook: "typically-recovered",
      supplyRisk: "low",
      supplyInsight: "Co-travels with Au in e-scrap concentrates sent to integrated Cu–precious refineries.",
    },
    {
      symbol: "Pd",
      name: "Palladium",
      category: "precious",
      massNote: "Trace",
      locationInUnit: "Select connector finishes on motherboard and PSU",
      function: "Plating on high-cycle connectors",
      recoveryRoute: "Precious-metal refinery from e-scrap concentrate",
      recoveryOutlook: "partial",
      supplyRisk: "high",
      supplyInsight: "Pd geopolitics (Russia, South Africa) make server e-scrap a debated strategic reserve feed.",
    },
    {
      symbol: "Ga",
      name: "Gallium",
      category: "critical",
      massNote: "Die-level",
      locationInUnit: "CPU voltage-regulator and chipset dies",
      function: "Power-stage and I/O compound semiconductors",
      recoveryRoute: "Lost in bulk melt unless chips are pre-concentrated",
      recoveryOutlook: "often-lost",
      supplyRisk: "high",
      supplyInsight: "Critical for advanced compute; embedded in CPU packages that standard rack shredding does not recover.",
      policyTags: ["US Critical Minerals", "EU CRM"],
    },
    {
      symbol: "REE",
      name: "Rare Earth Elements",
      category: "critical",
      massNote: "Grams per server (HDD motors, fans)",
      locationInUnit: "NdPr in fan/HDD spindle motors (if present)",
      function: "Permanent-magnet motors in cooling and storage",
      recoveryRoute: "Magnet-focused recycling (hydrometallurgy) or often lost in steel stream",
      recoveryOutlook: "partial",
      supplyRisk: "high",
      supplyInsight:
        "China dominates separation/refining. Data-center REE mass is small but strategically highlighted in U.S.–China tech competition.",
      policyTags: ["US Critical Minerals", "EU CRM"],
    },
    {
      symbol: "Co",
      name: "Cobalt",
      category: "critical",
      massNote: "Trace in MLCCs",
      locationInUnit: "Motherboard and DIMM decoupling capacitors",
      function: "Stable power delivery to DRAM and CPU",
      recoveryRoute: "Hydrometallurgical PCB routes; partial in Cu smelting slags",
      recoveryOutlook: "partial",
      supplyRisk: "high",
      supplyInsight: "Supply-chain due diligence (OECD, EU Battery Regulation spillover) applies to server boards.",
      policyTags: ["US Critical Minerals", "Conflict minerals"],
    },
  ],
  "gpu-server-1": [
    {
      symbol: "Au",
      name: "Gold",
      category: "precious",
      massNote: "~0.1% (modeled)",
      locationInUnit: "GPU BGA pads, HBM stacks, PCIe gold fingers",
      function: "High-pin-count interconnect for AI accelerators",
      recoveryRoute: "Cu smelting → anode slime; best if GPU modules harvested intact",
      recoveryOutlook: "typically-recovered",
      supplyRisk: "medium",
      supplyInsight:
        "AI rack retirements concentrate Au in removable GPU trays—strategic for secondary precious-metal supply if decommissioning is tracked.",
    },
    {
      symbol: "Ag",
      name: "Silver",
      category: "precious",
      massNote: "Trace",
      locationInUnit: "Solder on GPU board and power delivery",
      function: "Solder alloy component",
      recoveryRoute: "Cu pyrometallurgy co-product",
      recoveryOutlook: "typically-recovered",
      supplyRisk: "low",
      supplyInsight: "Co-recovered when GPU boards enter integrated smelters, not when shells go to Al remelting alone.",
    },
    {
      symbol: "Ga",
      name: "Gallium",
      category: "critical",
      massNote: "Die-level (GPU & VR)",
      locationInUnit: "GPU die power stages, voltage regulators",
      function: "High-efficiency power conversion at extreme TDP",
      recoveryRoute: "Requires chip/scrap concentrate routes",
      recoveryOutlook: "often-lost",
      supplyRisk: "high",
      supplyInsight:
        "AI compute drives Ga demand via GaN power devices. National AI infrastructure plans treat Ga supply as a bottleneck.",
      policyTags: ["US Critical Minerals", "EU CRM"],
    },
    {
      symbol: "Co",
      name: "Cobalt",
      category: "critical",
      massNote: "Trace in passives",
      locationInUnit: "GPU board MLCC banks",
      function: "Decoupling for high transient current",
      recoveryRoute: "Hydrometallurgical PCB leach preferred",
      recoveryOutlook: "partial",
      supplyRisk: "high",
      supplyInsight: "CRM relevance rises with GPU board count per rack; conflict-mineral reporting may apply.",
      policyTags: ["US Critical Minerals", "Conflict minerals"],
    },
    {
      symbol: "Hf",
      name: "Hafnium",
      category: "technology",
      massNote: "Sub-microgram per advanced node die",
      locationInUnit: "Advanced-node GPU transistor gate stacks",
      function: "High-k gate dielectric co-produced with Zr",
      recoveryRoute: "Not economically recovered from EoL chips today",
      recoveryOutlook: "often-lost",
      supplyRisk: "medium",
      supplyInsight:
        "Illustrates technology metals embedded in AI silicon with no industrial EoL loop—relevant to long-term material security debates.",
    },
    {
      symbol: "Ta",
      name: "Tantalum",
      category: "critical",
      massNote: "Trace in capacitors",
      locationInUnit: "Tantalum polymer capacitors on GPU power rails",
      function: "Bulk capacitance under high ripple current",
      recoveryRoute: "Hydrometallurgical capacitor focus or slag loss",
      recoveryOutlook: "partial",
      supplyRisk: "high",
      supplyInsight:
        "DRC-centric supply; conflict-mineral rules historically targeted Ta in electronics—still salient for GPU power design.",
      policyTags: ["US Critical Minerals", "Conflict minerals"],
    },
  ],
  "storage-1": [
    {
      symbol: "Ag",
      name: "Silver",
      category: "precious",
      massNote: "Trace",
      locationInUnit: "RAID controller PCB, backplane connectors",
      function: "Solder and connector plating",
      recoveryRoute: "Cu smelting co-product when electronics separated",
      recoveryOutlook: "typically-recovered",
      supplyRisk: "low",
      supplyInsight: "Controller boards are the main precious-metal carrier; drive steel bays alone carry none.",
    },
    {
      symbol: "Au",
      name: "Gold",
      category: "precious",
      massNote: "Trace",
      locationInUnit: "SAS backplane fingers, controller BGA",
      function: "High-speed storage interconnect",
      recoveryRoute: "Cu pyrometallurgy → anode slime",
      recoveryOutlook: "typically-recovered",
      supplyRisk: "medium",
      supplyInsight: "Backplane Au is recoverable if backplanes are not shredded with ferrous bays.",
    },
    {
      symbol: "Pt",
      name: "Platinum",
      category: "precious",
      massNote: "Milligrams per HDD (if HDDs present)",
      locationInUnit: "Hard-disk media coatings in drives mounted in bays",
      function: "Magnetic recording layer component in some HDD stacks",
      recoveryRoute: "Specialized HDD recycling or PGM refinery; lost if drives shredded with steel",
      recoveryOutlook: "partial",
      supplyRisk: "high",
      supplyInsight:
        "South Africa / Russia dominate primary Pt. Storage arrays link data retention hardware to PGM supply debates.",
    },
    {
      symbol: "Co",
      name: "Cobalt",
      category: "critical",
      massNote: "Grams per SSD/HDD (media & controller)",
      locationInUnit: "SSD controllers and some HDD components",
      function: "Magnetic media alloys and controller passives",
      recoveryRoute: "Drive-specific hydrometallurgy; poor in steel shredding",
      recoveryOutlook: "partial",
      supplyRisk: "high",
      supplyInsight: "CRM Act and U.S. critical lists highlight Co for storage + battery supply chains.",
      policyTags: ["US Critical Minerals", "EU CRM"],
    },
    {
      symbol: "REE",
      name: "Rare Earth Elements",
      category: "critical",
      massNote: "Grams per drive spindle motor",
      locationInUnit: "NdFeB magnets in HDD spindle motors (hybrid/ HDD-heavy arrays)",
      function: "Spindle rotation in mechanical drives",
      recoveryRoute: "Magnet recycling (emerging) or lost in shredded drive waste",
      recoveryOutlook: "partial",
      supplyRisk: "high",
      supplyInsight:
        "Strategic for storage hardware even as SSD share grows; magnet recycling is a national-laboratory priority area.",
      policyTags: ["US Critical Minerals", "EU CRM"],
    },
    {
      symbol: "In",
      name: "Indium",
      category: "critical",
      massNote: "Die-level in controller",
      locationInUnit: "RAID SoC high-speed I/O",
      function: "Serdes and optical storage-network interfaces",
      recoveryRoute: "Chip/scrap concentrate; lost in bulk ferrous processing",
      recoveryOutlook: "often-lost",
      supplyRisk: "high",
      supplyInsight: "Indium tin oxide and semiconductor uses compete for limited global supply.",
      policyTags: ["US Critical Minerals", "EU CRM"],
    },
  ],
  "power-1": [
    {
      symbol: "Ag",
      name: "Silver",
      category: "precious",
      massNote: "Trace on contacts",
      locationInUnit: "Outlet contacts, metering module switches",
      function: "Low-resistance switching contacts",
      recoveryRoute: "Cu/contact concentrate → precious refinery",
      recoveryOutlook: "partial",
      supplyRisk: "low",
      supplyInsight: "PDUs are Cu-dominant; Ag is minor but recoverable if contact assemblies are segregated.",
    },
    {
      symbol: "W",
      name: "Tungsten",
      category: "critical",
      massNote: "Trace in arcing contacts (if present)",
      locationInUnit: "High-power breaker or switch contacts in metering paths",
      function: "Arc-resistant contact material",
      recoveryRoute: "Hard-metal recycler; rarely targeted in PDU shredding",
      recoveryOutlook: "partial",
      supplyRisk: "high",
      supplyInsight: "Illustrates critical metals in power infrastructure, not just compute boards.",
      policyTags: ["US Critical Minerals"],
    },
    {
      symbol: "Cu",
      name: "Copper",
      category: "technology",
      massNote: "~45% (modeled bulk)",
      locationInUnit: "Busbars, conductors, metering shunts",
      function: "Primary current carrier—economically dominant material",
      recoveryRoute: "Direct Cu scrap re-melting (often no pyro carrier needed)",
      recoveryOutlook: "typically-recovered",
      supplyRisk: "medium",
      supplyInsight:
        "Copper is on U.S. critical lists due to grid and data-center demand, not scarcity—strategic from infrastructure dependency.",
      policyTags: ["US Critical Minerals"],
    },
  ],
  "cabling-1": [
    {
      symbol: "Au",
      name: "Gold",
      category: "precious",
      massNote: "Milligrams per transceiver (if optics deployed)",
      locationInUnit: "Pluggable optical transceiver modules (often cabled separately)",
      function: "Laser driver and high-speed optical interface contacts",
      recoveryRoute: "Module harvest → e-scrap refinery",
      recoveryOutlook: "typically-recovered",
      supplyRisk: "medium",
      supplyInsight: "Fiber trunks embed optics at endpoints; national networks treat transceiver e-scrap as high-value.",
    },
    {
      symbol: "Ag",
      name: "Silver",
      category: "precious",
      massNote: "Low in copper conductors",
      locationInUnit: "Copper patch cords (silver-bearing alloys in some contacts)",
      function: "Conductivity",
      recoveryRoute: "Cu wire reprocessing",
      recoveryOutlook: "typically-recovered",
      supplyRisk: "low",
      supplyInsight: "Cu cabling recovery is mature; Ag rides along in refined Cu.",
    },
    {
      symbol: "Ge",
      name: "Germanium",
      category: "critical",
      massNote: "Trace in fiber optics",
      locationInUnit: "Fiber core dopants and IR optics in transceivers",
      function: "Optical network transmission",
      recoveryRoute: "Specialized optical scrap; not recovered from Cu shredding",
      recoveryOutlook: "often-lost",
      supplyRisk: "high",
      supplyInsight:
        "U.S. critical mineral; China and Russia dominate supply. Data-center fiber build-outs tie to Ge security.",
      policyTags: ["US Critical Minerals", "EU CRM"],
    },
    {
      symbol: "In",
      name: "Indium",
      category: "critical",
      massNote: "In optical chips",
      locationInUnit: "Indium phosphide lasers in transceivers",
      function: "1310/1550 nm optical emission",
      recoveryRoute: "Transceiver module recycling only",
      recoveryOutlook: "often-lost",
      supplyRisk: "high",
      supplyInsight: "Critical for optical interconnect; lost if fiber cable is treated as glass waste only.",
      policyTags: ["US Critical Minerals", "EU CRM"],
    },
  ],
  "cooling-1": [
    {
      symbol: "REE",
      name: "Rare Earth Elements",
      category: "critical",
      massNote: "Tens of grams per CRAC/fan assembly",
      locationInUnit: "NdFeB permanent magnets in fan motors",
      function: "Efficient motor torque in CRAC and rack fans",
      recoveryRoute: "Magnet-to-magnet recycling (emerging) or landfilled with motor scrap",
      recoveryOutlook: "partial",
      supplyRisk: "high",
      supplyInsight:
        "Cooling is ~40% of data-center energy; REE magnets in rotating equipment are a hidden CRM dependency.",
      policyTags: ["US Critical Minerals", "EU CRM"],
    },
    {
      symbol: "Cu",
      name: "Copper",
      category: "technology",
      massNote: "~15% in coils",
      locationInUnit: "CRAC evaporator/condenser coils",
      function: "Heat exchange",
      recoveryRoute: "Cu tubing scrap — high recovery rate",
      recoveryOutlook: "typically-recovered",
      supplyRisk: "medium",
      supplyInsight: "HVAC copper is among the highest-yield recycling streams in facility decommissioning.",
      policyTags: ["US Critical Minerals"],
    },
    {
      symbol: "Li",
      name: "Lithium",
      category: "critical",
      massNote: "Only if battery-backed CRAC/UPS integrated",
      locationInUnit: "Facility UPS/battery strings (peripheral to rack cooling loop)",
      function: "Backup power for cooling controls",
      recoveryRoute: "Battery recycling (hydrometallurgy)",
      recoveryOutlook: "typically-recovered",
      supplyRisk: "high",
      supplyInsight:
        "Illustrates facility-level CRM beyond rack gear—relevant to holistic data-center material security.",
      policyTags: ["US Critical Minerals", "EU CRM", "Battery supply chain"],
    },
  ],
};

export function getStrategicMaterials(componentId: string): StrategicMaterialEntry[] {
  return STRATEGIC_MATERIALS[componentId] ?? [];
}

export function outlookLabel(outlook: RecoveryOutlook): string {
  switch (outlook) {
    case "typically-recovered":
      return "Typically recovered (if electronics reach proper smelter/refinery)";
    case "partial":
      return "Partial recovery — depends on pre-sorting and specialized routes";
    case "often-lost":
      return "Often lost in bulk ferrous/Cu routes without chip-level treatment";
  }
}

export function riskLabel(risk: SupplyRisk): string {
  switch (risk) {
    case "high":
      return "High supply concentration / policy sensitivity";
    case "medium":
      return "Moderate strategic exposure";
    case "low":
      return "Lower direct supply-chain risk";
  }
}

export function categoryLabel(category: MaterialCategory): string {
  switch (category) {
    case "precious":
      return "Precious metal";
    case "critical":
      return "Critical mineral";
    case "technology":
      return "Technology metal";
  }
}
