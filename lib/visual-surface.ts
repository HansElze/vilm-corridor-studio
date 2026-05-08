/**
 * visual-surface.ts
 * Cuttlefish Labs — VILM Visual Surface Layer
 * Connects typed corridor state objects to design language, World Labs scenes,
 * and the Inspirational Architecture image library categories.
 *
 * Design language source: Philadelphia_Corridor_VILM_GPT_Pack/11_WORLDLABS_VISUAL_AND_TRANSLATION_SUPERDOC.md
 * Image library: Desktop/Insperation architecture/ (~4,585 images)
 * RAG subset:    Desktop/architectural RAG for Multi-Model Model/ (~1,049 images)
 */

// ---------------------------------------------------------------------------
// Design language primitives
// ---------------------------------------------------------------------------

/** The singular aesthetic mode of the Cuttlefish corridor. */
export type CorridorAesthetic = "industrial-biophilic-modernism"

/**
 * Material classes drawn from the Basalt Standard.
 * primary → basalt-composite; secondary → light-oak; accent → structural-glass;
 * base → historic masonry and weathered iron preserved from original corridor shell.
 */
export type MaterialClass =
  | "basalt-composite"
  | "light-oak"
  | "structural-glass"
  | "historic-stone"
  | "weathered-iron"

/**
 * Structural form vocabulary for new and inherited corridor interventions.
 * New insertions use parametric / exoskeleton language.
 * Inherited conditions use vaulted-shell / open-trench / elevated-viaduct.
 */
export type StructuralForm =
  | "parametric-rib"
  | "exoskeleton-nervous-system"
  | "metabolic-node"
  | "vaulted-shell"
  | "open-trench"
  | "elevated-viaduct"

/**
 * Biophilic integration elements — how ecology is embedded into the basalt structure.
 */
export type BiophilicElement =
  | "cascading-greenery"
  | "vertical-living-wall"
  | "natural-light-well"
  | "planted-alcove"
  | "terrace-planting"

/**
 * Lighting and atmospheric mood targets for visualization and prompt generation.
 */
export type LightingMood =
  | "golden-hour"
  | "urban-morning"
  | "ambient-led-trail"
  | "textural-side-light"
  | "daylight-shaft"

// ---------------------------------------------------------------------------
// Over / Under / At-Grade layer assignment
// ---------------------------------------------------------------------------

export type CorridorLayer = "over" | "at-grade" | "under"

// ---------------------------------------------------------------------------
// Image library categories
// Categories tag which image corpus segments are relevant to a given surface.
// Used as input to RAG retrieval and future image-index passes.
// ---------------------------------------------------------------------------

export type ImageCategory =
  | "elevated-civic"          // viaduct promenade, public realm above grade
  | "biophilic-trench"        // open-air cut with ecology and terracing
  | "underground-infrastructure" // tunnel reuse, compute, logistics, metabolic
  | "concourse-interior"      // civic transit hall, human-facing interface
  | "basalt-material"         // material reference: basalt-composite surfaces
  | "parametric-structure"    // ribs, exoskeleton, flowing structural forms
  | "industrial-reuse"        // adaptive reuse of historic rail/industrial shells
  | "biophilic-integration"   // greenery embedded into architecture

// ---------------------------------------------------------------------------
// World Labs scene registry
// ---------------------------------------------------------------------------

export type WorldLabsSceneMode = "hero" | "section"

export type WorldLabsScene = {
  id: string
  label: string
  url: string
  mode: WorldLabsSceneMode
  layer: CorridorLayer
  /** Corridor anchor this scene primarily represents. */
  anchorId: string
  oneLineSummary: string
}

export const WORLD_LABS_SCENES: readonly WorldLabsScene[] = [
  // --- Over layer / east viaduct ---
  {
    id: "viaduct-section-v1",
    label: "Reading Viaduct Section Study v1",
    url: "https://marble.worldlabs.ai/world/f71277b9-b090-42bf-808c-980d307d27ba",
    mode: "section",
    layer: "over",
    anchorId: "east-viaduct",
    oneLineSummary: "Historic shell + basalt exosystem + public promenade + service logic in one close sectional read.",
  },
  {
    id: "viaduct-flagship-v2",
    label: "Reading Viaduct Flagship v2",
    url: "https://marble.worldlabs.ai/world/c188de81-c494-4b2b-84d1-cc020fa746fb",
    mode: "hero",
    layer: "over",
    anchorId: "east-viaduct",
    oneLineSummary: "Investor-grade hero exterior of the reimagined Reading Viaduct as a civic promenade.",
  },
  // --- At-grade / cut section ---
  {
    id: "trench-section-v1",
    label: "Biophilic Trench Section Study v1",
    url: "https://marble.worldlabs.ai/world/8cf41c77-66b2-4ca0-8eec-e8de3d12c0ea",
    mode: "section",
    layer: "at-grade",
    anchorId: "cut-section",
    oneLineSummary: "Retaining walls, ecology, bridges, terraces, and mobility/service lane in one integrated trench section.",
  },
  {
    id: "trench-flagship",
    label: "Mid-Corridor Biophilic Trench",
    url: "https://marble.worldlabs.ai/world/db5fbc50-a38d-42c2-a115-99890dcd2f00",
    mode: "hero",
    layer: "at-grade",
    anchorId: "cut-section",
    oneLineSummary: "Open-air trench world showing the corridor as a lush mobility and green-infrastructure spine.",
  },
  // --- Under layer / west tunnel ---
  {
    id: "underground-flagship-v2",
    label: "Underground AI Cluster Flagship v2",
    url: "https://marble.worldlabs.ai/world/aa22b333-3b97-43e9-8425-d0e5730981a5",
    mode: "section",
    layer: "under",
    anchorId: "west-tunnel",
    oneLineSummary: "Adaptive reuse of tunnel space as secure AI infrastructure, mobility, and environmental control.",
  },
  {
    id: "underground-flagship-v1",
    label: "Underground AI Cluster Original",
    url: "https://marble.worldlabs.ai/world/702d723c-3bdb-4cae-bbdf-d07e5f464f41",
    mode: "hero",
    layer: "under",
    anchorId: "west-tunnel",
    oneLineSummary: "Original underground render proving the corridor can host compute and logistics below grade.",
  },
  // --- Human interface / 30th Street ---
  {
    id: "concourse-section-v1",
    label: "30th Street Concourse Section / Interior Cut v1",
    url: "https://marble.worldlabs.ai/world/0efb970c-0f4d-46c1-bf02-979c4f1aab82",
    mode: "section",
    layer: "at-grade",
    anchorId: "pilot-node-30th",
    oneLineSummary: "Historic vaults, basalt civic exosystem, public circulation, and embedded service logic in one interior section.",
  },
  {
    id: "concourse-flagship-v2",
    label: "30th Street Concourse Flagship v2",
    url: "https://marble.worldlabs.ai/world/a1a0ffa8-0235-464c-82ce-af1a640d903f",
    mode: "hero",
    layer: "at-grade",
    anchorId: "pilot-node-30th",
    oneLineSummary: "Hero civic interior showing the public-facing interface of the corridor at 30th Street.",
  },
] as const

/** Convenience: scenes for a specific anchor, optionally filtered by mode. */
export function scenesForAnchor(
  anchorId: string,
  mode?: WorldLabsSceneMode,
): WorldLabsScene[] {
  return WORLD_LABS_SCENES.filter(
    (s) => s.anchorId === anchorId && (mode == null || s.mode === mode),
  )
}

/** Convenience: scenes for a corridor layer. */
export function scenesForLayer(
  layer: CorridorLayer,
  mode?: WorldLabsSceneMode,
): WorldLabsScene[] {
  return WORLD_LABS_SCENES.filter(
    (s) => s.layer === layer && (mode == null || s.mode === mode),
  )
}

// ---------------------------------------------------------------------------
// Visual surface — the main type attached to corridor state objects
// ---------------------------------------------------------------------------

export type VisualSurface = {
  aesthetic: CorridorAesthetic
  layer: CorridorLayer
  primaryMaterials: MaterialClass[]
  structuralForms: StructuralForm[]
  biophilicElements: BiophilicElement[]
  lightingMoods: LightingMood[]
  imageCategories: ImageCategory[]
  worldLabsScenes: WorldLabsScene[]
  /** Condensed master prompt fragment for World Labs / image generation. */
  promptFragment: string
}

// ---------------------------------------------------------------------------
// Pre-built surfaces — one per corridor anchor
// ---------------------------------------------------------------------------

export const VISUAL_SURFACE_EAST_VIADUCT: VisualSurface = {
  aesthetic: "industrial-biophilic-modernism",
  layer: "over",
  primaryMaterials: ["basalt-composite", "light-oak", "structural-glass", "historic-stone", "weathered-iron"],
  structuralForms: ["elevated-viaduct", "parametric-rib", "exoskeleton-nervous-system"],
  biophilicElements: ["cascading-greenery", "terrace-planting"],
  lightingMoods: ["golden-hour", "ambient-led-trail"],
  imageCategories: ["elevated-civic", "basalt-material", "parametric-structure", "industrial-reuse"],
  worldLabsScenes: scenesForAnchor("east-viaduct"),
  promptFragment:
    "Historic steel and masonry Reading Viaduct shell with dark matte basalt-composite exoskeleton ribs, lush elevated promenade, native plantings, and discreet mobility/service lane. Industrial-biophilic modernism, soft golden hour, investor-grade.",
}

export const VISUAL_SURFACE_CUT_SECTION: VisualSurface = {
  aesthetic: "industrial-biophilic-modernism",
  layer: "at-grade",
  primaryMaterials: ["basalt-composite", "structural-glass", "light-oak", "historic-stone"],
  structuralForms: ["open-trench", "parametric-rib", "metabolic-node"],
  biophilicElements: ["cascading-greenery", "vertical-living-wall", "planted-alcove", "terrace-planting"],
  lightingMoods: ["urban-morning", "ambient-led-trail"],
  imageCategories: ["biophilic-trench", "biophilic-integration", "parametric-structure", "industrial-reuse"],
  worldLabsScenes: scenesForAnchor("cut-section"),
  promptFragment:
    "City Branch open-air trench with dark basalt retaining walls, integrated vertical gardens, glass bridges, curved oak seating, pedestrian terraces, and central autonomous mobility lane. Adaptive reuse section, premium civic infrastructure, soft urban morning.",
}

export const VISUAL_SURFACE_WEST_TUNNEL: VisualSurface = {
  aesthetic: "industrial-biophilic-modernism",
  layer: "under",
  primaryMaterials: ["basalt-composite", "historic-stone", "structural-glass", "light-oak"],
  structuralForms: ["vaulted-shell", "exoskeleton-nervous-system", "metabolic-node"],
  biophilicElements: ["natural-light-well", "planted-alcove"],
  lightingMoods: ["ambient-led-trail", "textural-side-light", "daylight-shaft"],
  imageCategories: ["underground-infrastructure", "basalt-material", "industrial-reuse", "parametric-structure"],
  worldLabsScenes: scenesForAnchor("west-tunnel"),
  promptFragment:
    "Historic Philadelphia tunnel shell with rail-era vaulting, dark basalt exosystem ribs, water-cooled compute modules docked as architectural elements, autonomous service pods, moss and planted alcoves near light wells. Cool, secure, investor-grade hidden infrastructure.",
}

export const VISUAL_SURFACE_PILOT_NODE_30TH: VisualSurface = {
  aesthetic: "industrial-biophilic-modernism",
  layer: "at-grade",
  primaryMaterials: ["historic-stone", "basalt-composite", "light-oak", "structural-glass"],
  structuralForms: ["vaulted-shell", "parametric-rib", "metabolic-node"],
  biophilicElements: ["vertical-living-wall", "planted-alcove", "natural-light-well"],
  lightingMoods: ["urban-morning", "ambient-led-trail", "daylight-shaft"],
  imageCategories: ["concourse-interior", "biophilic-integration", "basalt-material", "industrial-reuse"],
  worldLabsScenes: scenesForAnchor("pilot-node-30th"),
  promptFragment:
    "Monumental 30th Street concourse with historic stone vaults, dark basalt civic exosystem ribs, curved oak walkways, transparent glass balustrades, planted alcoves, and discreet embedded mobility and service infrastructure. Premium civic interior, calm and investor-grade.",
}

// ---------------------------------------------------------------------------
// Layer-level surfaces — for OverLayerArchitecture and UnderLayerArchitecture
// ---------------------------------------------------------------------------

export const VISUAL_SURFACE_OVER_LAYER: VisualSurface = {
  aesthetic: "industrial-biophilic-modernism",
  layer: "over",
  primaryMaterials: ["basalt-composite", "light-oak", "structural-glass", "historic-stone"],
  structuralForms: ["elevated-viaduct", "parametric-rib", "exoskeleton-nervous-system", "metabolic-node"],
  biophilicElements: ["cascading-greenery", "terrace-planting", "vertical-living-wall"],
  lightingMoods: ["golden-hour", "ambient-led-trail"],
  imageCategories: ["elevated-civic", "parametric-structure", "biophilic-integration", "industrial-reuse"],
  worldLabsScenes: scenesForLayer("over"),
  promptFragment:
    "Elevated corridor over-layer: civic promenade, basalt exosystem cap, lush public realm, and phased revenue envelope above existing rail/highway infrastructure. Industrial-biophilic modernism, premium, grounded in Philadelphia.",
}

export const VISUAL_SURFACE_UNDER_LAYER: VisualSurface = {
  aesthetic: "industrial-biophilic-modernism",
  layer: "under",
  primaryMaterials: ["basalt-composite", "historic-stone", "structural-glass"],
  structuralForms: ["vaulted-shell", "exoskeleton-nervous-system", "metabolic-node"],
  biophilicElements: ["natural-light-well", "planted-alcove"],
  lightingMoods: ["ambient-led-trail", "textural-side-light", "daylight-shaft"],
  imageCategories: ["underground-infrastructure", "basalt-material", "industrial-reuse", "parametric-structure"],
  worldLabsScenes: scenesForLayer("under"),
  promptFragment:
    "Subsurface metabolic corridor: inherited tunnel shell activated with basalt compute nodes, thermal conduits, logistics spine, and environmental control. Hidden infrastructure elegance, cool and secure, adaptive reuse rather than greenfield.",
}

// ---------------------------------------------------------------------------
// Anchor → surface lookup
// ---------------------------------------------------------------------------

export const ANCHOR_VISUAL_SURFACES: Record<string, VisualSurface> = {
  "east-viaduct":    VISUAL_SURFACE_EAST_VIADUCT,
  "cut-section":     VISUAL_SURFACE_CUT_SECTION,
  "west-tunnel":     VISUAL_SURFACE_WEST_TUNNEL,
  "pilot-node-30th": VISUAL_SURFACE_PILOT_NODE_30TH,
}
