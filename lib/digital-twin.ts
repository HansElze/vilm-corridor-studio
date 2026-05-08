export type { VerifiedMileSegment, LayerStatus, LayerStatusValue, GeoJsonPolygon, GeoJsonPosition } from "./verified-mile"
export { VerifiedMileStage, STAGE_ORDER, PENDING_LAYER, stageIndex, hasReachedStage, makePhlCb01Candidate, PHL_CB_01_ID } from "./verified-mile"

export type { VisualSurface, CorridorAesthetic, MaterialClass, StructuralForm, BiophilicElement, LightingMood, CorridorLayer, ImageCategory, WorldLabsScene, WorldLabsSceneMode } from "./visual-surface"
export { WORLD_LABS_SCENES, ANCHOR_VISUAL_SURFACES, VISUAL_SURFACE_OVER_LAYER, VISUAL_SURFACE_UNDER_LAYER, scenesForAnchor, scenesForLayer } from "./visual-surface"

import type { VisualSurface } from "./visual-surface"
import { VISUAL_SURFACE_EAST_VIADUCT, VISUAL_SURFACE_CUT_SECTION, VISUAL_SURFACE_WEST_TUNNEL, VISUAL_SURFACE_PILOT_NODE_30TH, VISUAL_SURFACE_OVER_LAYER, VISUAL_SURFACE_UNDER_LAYER } from "./visual-surface"

export type TwinScenario = "A" | "B" | "C"
export type ConfidenceClass = "high" | "medium" | "low"
export type RootStatusClass = "grounded" | "provisional" | "advancing" | "constrained" | "blocked" | "narrative"

export type TwinDependency = {
  id: string
  label: string
  kind: "asset" | "data" | "geometry" | "ownership" | "thermal" | "revenue" | "governance" | "presentation"
}

export type TwinStateMeta = {
  contractId: string
  version: "0.2.0"
  rootStatusClass: RootStatusClass
  lastUpdated: string
  nextBestMove: string
}

export type CorridorAnchor = {
  id: string
  label: string
  kind: "viaduct" | "cut" | "tunnel" | "node" | "portal"
  latitude: number
  longitude: number
  evidence: "public-reference" | "candidate-trace" | "provisional" | "engine-derived"
  confidenceClass: ConfidenceClass
  dependencies: TwinDependency[]
  proofBurdenLinks: string[]
  affectedObjects: string[]
  blockingRisk: string
  unlockIfResolved: string
  rootStatusClass: RootStatusClass
  lastUpdated: string
  nextBestMove: string
  visualSurface?: VisualSurface
}

export type FloodConstraint = {
  id: string
  source: string
  annualChance: "0.2%" | "1%"
  impact: "context" | "constraint"
  relevance: string
  confidenceClass: ConfidenceClass
  dependencies: TwinDependency[]
  proofBurdenLinks: string[]
  affectedObjects: string[]
  blockingRisk: string
  unlockIfResolved: string
  rootStatusClass: RootStatusClass
  lastUpdated: string
  nextBestMove: string
}

export type ArchitectureSubsystem = {
  id: string
  label: string
  items: string[]
  dependencies: TwinDependency[]
  proofBurdenLinks: string[]
  affectedObjects: string[]
  blockingRisk: string
  unlockIfResolved: string
  rootStatusClass: RootStatusClass
  lastUpdated: string
  nextBestMove: string
  visualSurface?: VisualSurface
}

export type UnderLayerArchitecture = {
  currentReadiness: RootStatusClass
  inheritedAssets: ArchitectureSubsystem
  metabolicTrunk: ArchitectureSubsystem
  thermalSystem: ArchitectureSubsystem
  computeSystem: ArchitectureSubsystem
  accessAndVentilation: ArchitectureSubsystem
  visualSurface?: VisualSurface
}

export type OverLayerArchitecture = {
  currentReadiness: RootStatusClass
  capStrategy: ArchitectureSubsystem
  deckingAndSpanLogic: ArchitectureSubsystem
  revenueEnvelope: ArchitectureSubsystem
  civicInterface: ArchitectureSubsystem
  visualSurface?: VisualSurface
}

export type ProofBurden = {
  id: string
  title: string
  currentState: "open" | "holding" | "advancing"
  whyItMatters: string
  nextModelingMove: string
  dependencies: TwinDependency[]
  affectedObjects: string[]
  blockingRisk: string
  unlockIfResolved: string
  rootStatusClass: RootStatusClass
  lastUpdated: string
  nextBestMove: string
}

export type TranslationState = {
  operatorNarrative: string
  investorNarrative: string
  sectionFirstPresentation: string
  translationStatus: RootStatusClass
  dependencies: TwinDependency[]
  affectedObjects: string[]
  blockingRisk: string
  unlockIfResolved: string
  rootStatusClass: RootStatusClass
  lastUpdated: string
  nextBestMove: string
}

export type DigitalTwinState = {
  meta: TwinStateMeta
  id: string
  name: string
  scenario: TwinScenario
  corridor: string
  segmentLengthMiles: number
  anchors: CorridorAnchor[]
  floodConstraints: FloodConstraint[]
  underLayer: UnderLayerArchitecture
  overLayer: OverLayerArchitecture
  proofBurdens: ProofBurden[]
  liveDataFeeds: string[]
  translationState: TranslationState
  modelingNotes: string[]
  /** Verified Mile protocol state for the primary segment. CCL-VMP-001. */
  verifiedMile: import("./verified-mile").VerifiedMileSegment | null
}

const NOW = "2026-04-25T10:58:00-04:00"

const dependency = (
  id: string,
  label: string,
  kind: TwinDependency["kind"],
): TwinDependency => ({ id, label, kind })

const subsystem = (
  id: string,
  label: string,
  items: string[],
  options: Omit<ArchitectureSubsystem, "id" | "label" | "items">,
): ArchitectureSubsystem => ({
  id,
  label,
  items,
  ...options,
})

export const twinAlphaState: DigitalTwinState = {
  meta: {
    contractId: "twin-alpha-state-contract",
    version: "0.2.0",
    rootStatusClass: "advancing",
    lastUpdated: NOW,
    nextBestMove: "Bind selected Corridor Studio HUD fields and investor framing panels to the twin contract instead of shell-local summaries.",
  },
  id: "city-branch-twin-alpha",
  name: "City Branch / Reading Viaduct Twin Alpha",
  scenario: "A",
  corridor: "Reading Viaduct / City Branch / 30th Street corridor",
  segmentLengthMiles: 1.76,
  anchors: [
    {
      id: "east-viaduct",
      label: "East viaduct segment",
      kind: "viaduct",
      latitude: 39.9601,
      longitude: -75.1609,
      evidence: "candidate-trace",
      confidenceClass: "medium",
      dependencies: [
        dependency("public-rail-ref", "Philadelphia rail reference geometry", "geometry"),
        dependency("ownership-audit", "Ownership / ROW audit", "ownership"),
      ],
      proofBurdenLinks: ["geometry-proof", "asset-clarity"],
      affectedObjects: ["under.inherited-assets", "translation-state", "investor-route"],
      blockingRisk: "If this anchor remains only candidate-grade, the inherited-assets thesis stays visually persuasive but structurally weak.",
      unlockIfResolved: "A grounded east anchor lets the twin drive credible segment geometry, lease-path proof, and phased demo framing.",
      rootStatusClass: "advancing",
      lastUpdated: NOW,
      nextBestMove: "Upgrade to parcel- and evidence-linked segment object rather than trace label only.",
      visualSurface: VISUAL_SURFACE_EAST_VIADUCT,
    },
    {
      id: "cut-section",
      label: "Central cut section",
      kind: "cut",
      latitude: 39.9621,
      longitude: -75.1684,
      evidence: "candidate-trace",
      confidenceClass: "medium",
      dependencies: [
        dependency("trace-delta", "Trace delta markers", "geometry"),
        dependency("flood-context", "Flood overlay validation", "data"),
      ],
      proofBurdenLinks: ["geometry-proof", "flood-fit"],
      affectedObjects: ["flood-constraints", "under.access-ventilation"],
      blockingRisk: "Weak cut-section proof keeps flood-fit and access logic abstract.",
      unlockIfResolved: "Lets the twin express section-specific constraints instead of corridor-wide prose.",
      rootStatusClass: "advancing",
      lastUpdated: NOW,
      nextBestMove: "Attach flood depth and access burden flags to this anchor.",
      visualSurface: VISUAL_SURFACE_CUT_SECTION,
    },
    {
      id: "west-tunnel",
      label: "West tunnel section",
      kind: "tunnel",
      latitude: 39.9652,
      longitude: -75.1791,
      evidence: "public-reference",
      confidenceClass: "high",
      dependencies: [dependency("city-branch-docs", "City Branch public tunnel references", "asset")],
      proofBurdenLinks: ["under-layer-proof", "asset-clarity"],
      affectedObjects: ["under.inherited-assets", "under.compute-system"],
      blockingRisk: "Without tunnel-specific activation state, the under-layer remains concept-heavy and not constraint-aware.",
      unlockIfResolved: "Moves inherited tunnel activation from narrative claim toward engine surface.",
      rootStatusClass: "grounded",
      lastUpdated: NOW,
      nextBestMove: "Add tunnel capacity, clearance, and intervention classes.",
      visualSurface: VISUAL_SURFACE_WEST_TUNNEL,
    },
    {
      id: "pilot-node-30th",
      label: "30th Street pilot node",
      kind: "node",
      latitude: 39.9556,
      longitude: -75.182,
      evidence: "provisional",
      confidenceClass: "low",
      dependencies: [
        dependency("institutional-fit", "Institutional fit and access validation", "governance"),
        dependency("operator-packaging", "Investor/operator packaging", "presentation"),
      ],
      proofBurdenLinks: ["operator-story", "over-layer-proof"],
      affectedObjects: ["over.revenue-envelope", "translation-state", "investor-route"],
      blockingRisk: "If the node stays provisional, the twin cannot cleanly connect corridor proof to deployment and revenue logic.",
      unlockIfResolved: "Creates a real pilot hinge between corridor proof, operator mode, and investor-safe sequencing.",
      rootStatusClass: "provisional",
      lastUpdated: NOW,
      nextBestMove: "Promote from symbolic pilot node to phased deployment object.",
      visualSurface: VISUAL_SURFACE_PILOT_NODE_30TH,
    },
  ],
  floodConstraints: [
    {
      id: "flood-500",
      source: "Philadelphia public ArcGIS flood layer",
      annualChance: "0.2%",
      impact: "context",
      relevance: "Shapes shallower flood interpretation and resilience framing.",
      confidenceClass: "high",
      dependencies: [dependency("arcgis-flood", "Philadelphia ArcGIS flood data", "data")],
      proofBurdenLinks: ["flood-fit"],
      affectedObjects: ["under.thermal-system", "translation-state"],
      blockingRisk: "Context-only flood treatment can drift into decorative layer use rather than scenario burden.",
      unlockIfResolved: "Supports evidence-backed resiliency framing in operator and investor surfaces.",
      rootStatusClass: "grounded",
      lastUpdated: NOW,
      nextBestMove: "Bind this constraint to segment and anchor-specific exposure.",
    },
    {
      id: "flood-100",
      source: "Philadelphia public ArcGIS flood layer",
      annualChance: "1%",
      impact: "constraint",
      relevance: "Defines deeper flood burden for access, under-layer thermal, and revenue-risk logic.",
      confidenceClass: "high",
      dependencies: [dependency("arcgis-flood", "Philadelphia ArcGIS flood data", "data")],
      proofBurdenLinks: ["flood-fit", "under-layer-proof", "over-layer-proof"],
      affectedObjects: ["under.access-ventilation", "over.revenue-envelope", "investor-route"],
      blockingRisk: "If this constraint is not attached to affected systems, the twin will understate engineering and financing burden.",
      unlockIfResolved: "Allows flood-aware dependency chains across under, over, and investor translation logic.",
      rootStatusClass: "advancing",
      lastUpdated: NOW,
      nextBestMove: "Attach risk weighting to under-layer and over-layer affected objects.",
    },
  ],
  underLayer: {
    currentReadiness: "advancing",
    inheritedAssets: subsystem(
      "under.inherited-assets",
      "Inherited assets",
      ["City Branch tunnel reuse", "Arch Street subterranean continuity", "Dormant corridor volume activation"],
      {
        dependencies: [
          dependency("asset-proof", "Inherited asset proof", "asset"),
          dependency("ownership-audit", "Ownership / ROW audit", "ownership"),
        ],
        proofBurdenLinks: ["asset-clarity", "under-layer-proof"],
        affectedObjects: ["east-viaduct", "west-tunnel", "translation-state"],
        blockingRisk: "Until inherited assets are typed as reusable system objects, Scenario A remains rhetorical rather than operational.",
        unlockIfResolved: "Turns inherited asset reuse into a real engine primitive that can drive phasing and costs.",
        rootStatusClass: "advancing",
        lastUpdated: NOW,
        nextBestMove: "Promote each inherited asset into its own constrained object with reuse class and intervention type.",
      },
    ),
    metabolicTrunk: subsystem(
      "under.metabolic-trunk",
      "Metabolic trunk",
      ["Basalt-composite dual-bore metabolic conduit", "Fiber and utility co-location spine", "District energy routing path"],
      {
        dependencies: [
          dependency("geometry-proof", "Segment geometry proof", "geometry"),
          dependency("thermal-proof", "Thermal exchange proof", "thermal"),
        ],
        proofBurdenLinks: ["under-layer-proof"],
        affectedObjects: ["flood-100", "west-tunnel", "pilot-node-30th"],
        blockingRisk: "Without capacities and failure modes, the trunk is still a concept and not an engine surface.",
        unlockIfResolved: "Enables machine-readable under-layer capacities and dependencies.",
        rootStatusClass: "advancing",
        lastUpdated: NOW,
        nextBestMove: "Add throughput, segment capacity, and intervention classes.",
      },
    ),
    thermalSystem: subsystem(
      "under.thermal-system",
      "Thermal system",
      ["River-linked cooling logic", "Phase-change buffer nodes", "Greywater and heat-exchange loop assumptions"],
      {
        dependencies: [
          dependency("flood-fit", "Flood-fit proof", "data"),
          dependency("river-thermal", "River thermal assumptions", "thermal"),
        ],
        proofBurdenLinks: ["flood-fit", "under-layer-proof"],
        affectedObjects: ["flood-100", "under.compute-system"],
        blockingRisk: "Thermal claims can overrun available evidence if not tied to explicit dependencies.",
        unlockIfResolved: "Lets thermal logic become scenario-aware and anchor-aware.",
        rootStatusClass: "constrained",
        lastUpdated: NOW,
        nextBestMove: "Introduce typed thermal yield, cooling burden, and resilience thresholds.",
      },
    ),
    computeSystem: subsystem(
      "under.compute-system",
      "Compute system",
      ["Sub-river or corridor-adjacent compute node logic", "Immersion-cooled module assumptions", "Twin-sync data spine"],
      {
        dependencies: [
          dependency("thermal-proof", "Thermal exchange proof", "thermal"),
          dependency("governance-stack", "Governance and billing logic", "governance"),
        ],
        proofBurdenLinks: ["under-layer-proof"],
        affectedObjects: ["under.thermal-system", "translation-state"],
        blockingRisk: "Compute logic without explicit dependency gates turns the engine into techno-poetry.",
        unlockIfResolved: "Allows the twin to model compute placement and district-service dependencies honestly.",
        rootStatusClass: "narrative",
        lastUpdated: NOW,
        nextBestMove: "Add placement class, cooling dependency, and governance dependency fields.",
      },
    ),
    accessAndVentilation: subsystem(
      "under.access-ventilation",
      "Access and ventilation",
      ["Provisional access markers from current prototype", "Ventilation and egress candidate nodes", "Service corridor checkpoints"],
      {
        dependencies: [
          dependency("flood-fit", "Flood-fit proof", "data"),
          dependency("geometry-proof", "Geometry and anchor proof", "geometry"),
        ],
        proofBurdenLinks: ["geometry-proof", "under-layer-proof"],
        affectedObjects: ["cut-section", "flood-100"],
        blockingRisk: "Access logic remains decorative until tied to real segment burdens and constraints.",
        unlockIfResolved: "Makes the twin materially useful for feasibility and risk.",
        rootStatusClass: "provisional",
        lastUpdated: NOW,
        nextBestMove: "Create access-node objects with flood and service dependencies.",
      },
    ),
    visualSurface: VISUAL_SURFACE_UNDER_LAYER,
  },
  overLayer: {
    currentReadiness: "advancing",
    capStrategy: subsystem(
      "over.cap-strategy",
      "Cap strategy",
      ["Scenario B volumetric capping", "Scenario C integrated buildout envelope", "Investor-safe phased expansion above Scenario A proof"],
      {
        dependencies: [
          dependency("scenario-a-proof", "Scenario A proof threshold", "presentation"),
          dependency("geometry-proof", "Geometry and anchor proof", "geometry"),
        ],
        proofBurdenLinks: ["over-layer-proof", "operator-story"],
        affectedObjects: ["translation-state", "investor-route", "pilot-node-30th"],
        blockingRisk: "If cap logic is not explicitly phase-coupled to Scenario A, the over-layer will drift into generic development language.",
        unlockIfResolved: "Lets Scenario B/C remain dependent on corridor proof rather than replacing it.",
        rootStatusClass: "advancing",
        lastUpdated: NOW,
        nextBestMove: "Add explicit phase gates and unlock thresholds.",
      },
    ),
    deckingAndSpanLogic: subsystem(
      "over.decking-span",
      "Decking and span logic",
      ["Geodesic / modular span concepts", "Basalt or BFRP decking assumptions", "Non-interference framing over live rail contexts"],
      {
        dependencies: [
          dependency("structural-proof", "Structural proof inputs", "geometry"),
          dependency("rail-clearance", "Rail clearance and interference proof", "asset"),
        ],
        proofBurdenLinks: ["over-layer-proof"],
        affectedObjects: ["over.cap-strategy"],
        blockingRisk: "These remain visual claims until tied to explicit interference and structural rules.",
        unlockIfResolved: "Supports real over-layer feasibility classes.",
        rootStatusClass: "narrative",
        lastUpdated: NOW,
        nextBestMove: "Introduce span class, interference class, and constructability flags.",
      },
    ),
    revenueEnvelope: subsystem(
      "over.revenue-envelope",
      "Revenue envelope",
      ["Hotel / residential / logistics revenue layers", "District-as-a-service operating arbitrage", "Municipal uplift framing"],
      {
        dependencies: [
          dependency("cap-strategy", "Cap strategy phase logic", "revenue"),
          dependency("flood-100", "Flood constraint", "data"),
        ],
        proofBurdenLinks: ["over-layer-proof", "operator-story"],
        affectedObjects: ["investor-route", "pilot-node-30th"],
        blockingRisk: "Revenue narrative can outrun engineering proof and flood burden if not linked to affected objects.",
        unlockIfResolved: "Creates a credible investor-safe route rather than hype text.",
        rootStatusClass: "constrained",
        lastUpdated: NOW,
        nextBestMove: "Add revenue class, risk weight, and dependency chain fields.",
      },
    ),
    civicInterface: subsystem(
      "over.civic-interface",
      "Civic interface",
      ["At-grade public realm continuity", "Metabolic kiosk logic", "Rail Park and public engagement bridge"],
      {
        dependencies: [
          dependency("public-fit", "Public realm fit", "governance"),
          dependency("operator-story", "Operator/investor translation fidelity", "presentation"),
        ],
        proofBurdenLinks: ["operator-story"],
        affectedObjects: ["translation-state", "investor-route"],
        blockingRisk: "Public interface rhetoric can turn decorative if it is not grounded in deployment sequencing.",
        unlockIfResolved: "Lets civic and investor framing stay coupled to corridor truth.",
        rootStatusClass: "advancing",
        lastUpdated: NOW,
        nextBestMove: "Add civic outcome objects tied to scenario phase and public evidence.",
      },
    ),
    visualSurface: VISUAL_SURFACE_OVER_LAYER,
  },
  proofBurdens: [
    {
      id: "geometry-proof",
      title: "Geometry and alignment proof",
      currentState: "advancing",
      whyItMatters: "The twin must stop relying on prose-only corridor claims and attach each segment to explicit anchors.",
      nextModelingMove: "Convert the current trace and anchor system into segment objects with evidence tags.",
      dependencies: [
        dependency("public-rail-ref", "Philadelphia rail reference geometry", "geometry"),
        dependency("trace-delta", "Trace delta markers", "geometry"),
      ],
      affectedObjects: ["east-viaduct", "cut-section", "under.inherited-assets"],
      blockingRisk: "Without geometry proof, both under- and over-layer claims remain spatially soft.",
      unlockIfResolved: "Enables segment-aware under/over architecture and stronger investor-safe proof.",
      rootStatusClass: "advancing",
      lastUpdated: NOW,
      nextBestMove: "Add segment objects and evidence classes.",
    },
    {
      id: "asset-clarity",
      title: "Asset and lease-path proof",
      currentState: "open",
      whyItMatters: "Inherited asset reuse needs ownership, access, and dormant-volume clarity to become an engine primitive.",
      nextModelingMove: "Turn provisional ownership/ROW bands into explicit parcel and easement evidence.",
      dependencies: [dependency("ownership-audit", "Ownership / ROW audit", "ownership")],
      affectedObjects: ["east-viaduct", "west-tunnel", "under.inherited-assets"],
      blockingRisk: "Scenario A remains persuasive but not decision-grade.",
      unlockIfResolved: "Lets inherited-assets logic drive actual system objects.",
      rootStatusClass: "constrained",
      lastUpdated: NOW,
      nextBestMove: "Create asset and easement status fields on anchors and subsystems.",
    },
    {
      id: "flood-fit",
      title: "Flood and resilience fit",
      currentState: "holding",
      whyItMatters: "Flood layers must become actual constraint drivers across under-layer, over-layer, and presentation logic.",
      nextModelingMove: "Move flood overlays from descriptive HUD text into structured metrics and object links.",
      dependencies: [dependency("arcgis-flood", "Philadelphia ArcGIS flood data", "data")],
      affectedObjects: ["flood-500", "flood-100", "under.thermal-system", "under.access-ventilation"],
      blockingRisk: "Flood data stays decorative instead of operational.",
      unlockIfResolved: "Makes resilience logic and investor-safe risk framing far more credible.",
      rootStatusClass: "advancing",
      lastUpdated: NOW,
      nextBestMove: "Attach constraint weights to affected objects.",
    },
    {
      id: "under-layer-proof",
      title: "Under-layer feasibility proof",
      currentState: "open",
      whyItMatters: "The metabolic trunk cannot remain only a narrative if the twin is to become an engine.",
      nextModelingMove: "Introduce typed capacities, constraints, and failure modes for inherited tunnel activation.",
      dependencies: [
        dependency("asset-proof", "Inherited asset proof", "asset"),
        dependency("thermal-proof", "Thermal exchange proof", "thermal"),
      ],
      affectedObjects: ["under.metabolic-trunk", "under.compute-system", "under.access-ventilation"],
      blockingRisk: "Under-layer remains concept art for infrastructure.",
      unlockIfResolved: "Creates a genuine engine surface for Scenario A.",
      rootStatusClass: "constrained",
      lastUpdated: NOW,
      nextBestMove: "Add capacity, constraint, and failure-mode fields.",
    },
    {
      id: "over-layer-proof",
      title: "Over-layer ROI and phasing proof",
      currentState: "open",
      whyItMatters: "Scenario B/C must remain structurally tied to Scenario A rather than drifting into generic development rhetoric.",
      nextModelingMove: "Add phasing envelopes, deployment dependencies, and revenue-risk state objects.",
      dependencies: [
        dependency("scenario-a-proof", "Scenario A proof threshold", "presentation"),
        dependency("flood-100", "Flood constraint", "data"),
      ],
      affectedObjects: ["over.cap-strategy", "over.revenue-envelope", "pilot-node-30th"],
      blockingRisk: "The twin will separate corridor truth from growth rhetoric.",
      unlockIfResolved: "Makes investor mode and over-layer planning coherent with the engine.",
      rootStatusClass: "constrained",
      lastUpdated: NOW,
      nextBestMove: "Add phase gates, dependency chains, and risk weights.",
    },
    {
      id: "operator-story",
      title: "Operator and investor translation fidelity",
      currentState: "advancing",
      whyItMatters: "The shell must preserve weird, corridor-specific logic while becoming a real product.",
      nextModelingMove: "Bind route-level summaries to shared twin state instead of shell-local text.",
      dependencies: [dependency("twin-contract", "Twin Alpha state contract", "presentation")],
      affectedObjects: ["translation-state", "corridor-route", "investor-route"],
      blockingRisk: "Routes become polished parallel narratives rather than a shared engine surface.",
      unlockIfResolved: "Creates one product architecture instead of several explanations.",
      rootStatusClass: "advancing",
      lastUpdated: NOW,
      nextBestMove: "Drive shell panels from the twin contract.",
    },
  ],
  liveDataFeeds: [
    "Philadelphia flood GeoJSON layers",
    "Philadelphia rail reference geometry",
    "Candidate trace and checkpoint overlays",
  ],
  translationState: {
    operatorNarrative: "Scenario A is strongest where inherited corridor geometry and evidence already converge, with the under-layer carrying the proof burden.",
    investorNarrative: "Inherited asset reuse is the shortest path to corridor proof; Scenario B/C remain expansion layers unlocked by that proof rather than speculative replacements for it.",
    sectionFirstPresentation: "Lead with the corridor section and proof burden, then show how under-layer and over-layer unlock each other.",
    translationStatus: "advancing",
    dependencies: [
      dependency("twin-contract", "Twin Alpha state contract", "presentation"),
      dependency("operator-story", "Operator/investor translation fidelity", "presentation"),
    ],
    affectedObjects: ["corridor-route", "investor-route", "pilot-node-30th"],
    blockingRisk: "If translation is not contract-backed, operator and investor routes become separate narratives.",
    unlockIfResolved: "Lets routes share state and stay faithful to the same engine.",
    rootStatusClass: "advancing",
    lastUpdated: NOW,
    nextBestMove: "Feed route panels and selected HUD labels from shared twin state.",
  },
  modelingNotes: [
    "Twin Alpha v0.2 is the first canonical state contract, not just a presentation object.",
    "The next threshold is to let selected Corridor Studio and investor shell fields read directly from this contract.",
    "After that, the under/over architecture can evolve from structured narrative into computed object relationships.",
  ],
  verifiedMile: null,  // null until PHL-CB-01 reaches SURVEYED stage; seed with makePhlCb01Candidate()
}

export function getTwinAlphaState(): DigitalTwinState {
  return twinAlphaState
}
