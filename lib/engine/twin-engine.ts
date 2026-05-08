import {
  type ArchitectureSubsystem,
  type DigitalTwinState,
  type ProofBurden,
  type RootStatusClass,
  type TwinDependency,
  getTwinAlphaState,
} from "@/lib/digital-twin"

type EngineStatus = "ready" | "advancing" | "constrained" | "blocked"

type EngineObjectKind =
  | "anchor"
  | "flood"
  | "under-layer"
  | "over-layer"
  | "proof"
  | "translation"

export type EngineDependencyNode = {
  id: string
  label: string
  kind: TwinDependency["kind"]
  status: EngineStatus
  referencedBy: string[]
  blockingCount: number
}

export type EngineObjectStatus = {
  id: string
  label: string
  kind: EngineObjectKind
  status: EngineStatus
  blockingDependencies: string[]
  resolvedDependencies: string[]
  linkedProofs: string[]
  nextBestMove: string
}

export type EngineScenarioReadiness = {
  scenario: "A" | "B" | "C"
  score: number
  status: EngineStatus
  drivers: string[]
  blockers: string[]
}

export type EngineHudState = {
  activeAnchor: string
  activeScenario: "A" | "B" | "C"
  leadConstraint: string
  primaryBlocker: string
  nextUnlock: string
  investorSignal: string
}

export type TwinEngineState = {
  contractId: string
  evaluatedAt: string
  dependencyGraph: EngineDependencyNode[]
  objectStatuses: EngineObjectStatus[]
  scenarioReadiness: EngineScenarioReadiness[]
  proofPressure: {
    open: number
    holding: number
    advancing: number
  }
  corridorHud: EngineHudState
  nextUnlocks: string[]
}

type DependableObject = {
  id: string
  label: string
  dependencies: TwinDependency[]
  proofBurdenLinks?: string[]
  rootStatusClass: RootStatusClass
  nextBestMove: string
}

const ROOT_STATUS_WEIGHT: Record<RootStatusClass, number> = {
  grounded: 1,
  advancing: 0.75,
  provisional: 0.45,
  constrained: 0.3,
  blocked: 0.05,
  narrative: 0.2,
}

function toEngineStatus(rootStatusClass: RootStatusClass): EngineStatus {
  if (rootStatusClass === "grounded") return "ready"
  if (rootStatusClass === "advancing") return "advancing"
  if (rootStatusClass === "blocked") return "blocked"
  return "constrained"
}

function burdenPressure(burden: ProofBurden): number {
  if (burden.currentState === "advancing") return 0.75
  if (burden.currentState === "holding") return 0.4
  return 0.15
}

function buildProofIndex(twin: DigitalTwinState): Map<string, ProofBurden> {
  return new Map(twin.proofBurdens.map((burden) => [burden.id, burden]))
}

function dependencyStatus(
  dependencyId: string,
  proofIndex: Map<string, ProofBurden>,
  objects: DependableObject[],
): EngineStatus {
  const linkedObjects = objects.filter((object) => object.dependencies.some((dep) => dep.id === dependencyId))
  const linkedProofs = linkedObjects.flatMap((object) => object.proofBurdenLinks ?? [])

  if (linkedObjects.some((object) => object.rootStatusClass === "blocked")) return "blocked"
  if (
    linkedProofs.some((proofId) => {
      const proof = proofIndex.get(proofId)
      return proof?.currentState === "open"
    })
  ) {
    return "blocked"
  }
  if (
    linkedObjects.some((object) => object.rootStatusClass === "constrained" || object.rootStatusClass === "narrative") ||
    linkedProofs.some((proofId) => {
      const proof = proofIndex.get(proofId)
      return proof?.currentState === "holding"
    })
  ) {
    return "constrained"
  }
  if (
    linkedObjects.some((object) => object.rootStatusClass === "advancing" || object.rootStatusClass === "provisional") ||
    linkedProofs.some((proofId) => {
      const proof = proofIndex.get(proofId)
      return proof?.currentState === "advancing"
    })
  ) {
    return "advancing"
  }
  return "ready"
}

function evaluateObject(
  object: DependableObject,
  kind: EngineObjectKind,
  dependencyGraph: EngineDependencyNode[],
): EngineObjectStatus {
  const blockingDependencies = object.dependencies
    .filter((dependency) => {
      const node = dependencyGraph.find((candidate) => candidate.id === dependency.id)
      return node?.status === "blocked" || node?.status === "constrained"
    })
    .map((dependency) => dependency.label)

  const resolvedDependencies = object.dependencies
    .filter((dependency) => {
      const node = dependencyGraph.find((candidate) => candidate.id === dependency.id)
      return node?.status === "ready" || node?.status === "advancing"
    })
    .map((dependency) => dependency.label)

  let status = toEngineStatus(object.rootStatusClass)
  if (blockingDependencies.length > 1) status = "blocked"
  else if (blockingDependencies.length === 1 && status !== "blocked") status = "constrained"

  return {
    id: object.id,
    label: object.label,
    kind,
    status,
    blockingDependencies,
    resolvedDependencies,
    linkedProofs: object.proofBurdenLinks ?? [],
    nextBestMove: object.nextBestMove,
  }
}

function flattenObjects(twin: DigitalTwinState): Array<{ kind: EngineObjectKind; object: DependableObject }> {
  const underSubsystems: ArchitectureSubsystem[] = [
    twin.underLayer.inheritedAssets,
    twin.underLayer.metabolicTrunk,
    twin.underLayer.thermalSystem,
    twin.underLayer.computeSystem,
    twin.underLayer.accessAndVentilation,
  ]
  const overSubsystems: ArchitectureSubsystem[] = [
    twin.overLayer.capStrategy,
    twin.overLayer.deckingAndSpanLogic,
    twin.overLayer.revenueEnvelope,
    twin.overLayer.civicInterface,
  ]

  return [
    ...twin.anchors.map((object) => ({ kind: "anchor" as const, object })),
    ...twin.floodConstraints.map((object) => ({ kind: "flood" as const, object })),
    ...underSubsystems.map((object) => ({ kind: "under-layer" as const, object })),
    ...overSubsystems.map((object) => ({ kind: "over-layer" as const, object })),
    ...twin.proofBurdens.map((object) => ({
      kind: "proof" as const,
      object: {
        id: object.id,
        label: object.title,
        dependencies: object.dependencies,
        proofBurdenLinks: [object.id],
        rootStatusClass: object.rootStatusClass,
        nextBestMove: object.nextBestMove,
      },
    })),
    {
      kind: "translation" as const,
      object: {
        id: "translation-state",
        label: "Translation state",
        dependencies: twin.translationState.dependencies,
        proofBurdenLinks: [],
        rootStatusClass: twin.translationState.rootStatusClass,
        nextBestMove: twin.translationState.nextBestMove,
      },
    },
  ]
}

function scoreScenarioA(twin: DigitalTwinState, objectStatuses: EngineObjectStatus[]): EngineScenarioReadiness {
  const inherited = objectStatuses.find((object) => object.id === "under.inherited-assets")
  const geometry = objectStatuses.find((object) => object.id === "geometry-proof")
  const asset = objectStatuses.find((object) => object.id === "asset-clarity")
  const flood = objectStatuses.find((object) => object.id === "flood-fit")
  const geometryBurden = twin.proofBurdens.find((burden) => burden.id === "geometry-proof")
  const assetBurden = twin.proofBurdens.find((burden) => burden.id === "asset-clarity")
  const score = Math.round(
    ((ROOT_STATUS_WEIGHT[twin.underLayer.currentReadiness] +
      ROOT_STATUS_WEIGHT[twin.anchors[0]?.rootStatusClass ?? "narrative"] +
      burdenPressure(geometryBurden ?? twin.proofBurdens[0]) +
      burdenPressure(assetBurden ?? twin.proofBurdens[0])) /
      4) *
      100,
  )

  return {
    scenario: "A",
    score,
    status: score >= 75 ? "ready" : score >= 45 ? "advancing" : "constrained",
    drivers: [inherited?.label, geometry?.label, flood?.label].filter(Boolean) as string[],
    blockers: [asset?.label, twin.underLayer.accessAndVentilation.label].filter(Boolean) as string[],
  }
}

function scoreScenarioB(twin: DigitalTwinState, objectStatuses: EngineObjectStatus[]): EngineScenarioReadiness {
  const cap = objectStatuses.find((object) => object.id === "over.cap-strategy")
  const revenue = objectStatuses.find((object) => object.id === "over.revenue-envelope")
  const overProof = objectStatuses.find((object) => object.id === "over-layer-proof")
  const scenarioA = scoreScenarioA(twin, objectStatuses)
  const overLayerBurden = twin.proofBurdens.find((burden) => burden.id === "over-layer-proof")
  const score = Math.round(
    ((scenarioA.score / 100 +
      ROOT_STATUS_WEIGHT[twin.overLayer.currentReadiness] +
      burdenPressure(overLayerBurden ?? twin.proofBurdens[0])) /
      3) *
      100,
  )

  return {
    scenario: "B",
    score,
    status: score >= 72 ? "ready" : score >= 42 ? "advancing" : "constrained",
    drivers: [cap?.label, revenue?.label].filter(Boolean) as string[],
    blockers: [overProof?.label, "Scenario A proof threshold"],
  }
}

function scoreScenarioC(twin: DigitalTwinState, objectStatuses: EngineObjectStatus[]): EngineScenarioReadiness {
  const deck = objectStatuses.find((object) => object.id === "over.decking-span")
  const civic = objectStatuses.find((object) => object.id === "over.civic-interface")
  const operatorStory = objectStatuses.find((object) => object.id === "operator-story")
  const scenarioB = scoreScenarioB(twin, objectStatuses)
  const score = Math.round(
    ((scenarioB.score / 100 +
      ROOT_STATUS_WEIGHT[twin.translationState.rootStatusClass] +
      ROOT_STATUS_WEIGHT[twin.overLayer.deckingAndSpanLogic.rootStatusClass]) /
      3) *
      100,
  )

  return {
    scenario: "C",
    score,
    status: score >= 70 ? "ready" : score >= 38 ? "advancing" : "constrained",
    drivers: [civic?.label, operatorStory?.label].filter(Boolean) as string[],
    blockers: [deck?.label ?? "Decking and span logic", "Integrated buildout proof stack"],
  }
}

function buildHudState(
  twin: DigitalTwinState,
  dependencyGraph: EngineDependencyNode[],
  scenarioReadiness: EngineScenarioReadiness[],
): EngineHudState {
  const activeAnchor = twin.anchors
    .slice()
    .sort((left, right) => ROOT_STATUS_WEIGHT[right.rootStatusClass] - ROOT_STATUS_WEIGHT[left.rootStatusClass])[0]

  const primaryBlocker =
    dependencyGraph
      .filter((dependency) => dependency.status === "blocked" || dependency.status === "constrained")
      .sort((left, right) => right.blockingCount - left.blockingCount)[0]?.label ?? "No blocker detected"

  const leadScenario = scenarioReadiness.slice().sort((left, right) => right.score - left.score)[0]

  return {
    activeAnchor: activeAnchor?.label ?? twin.name,
    activeScenario: leadScenario?.scenario ?? twin.scenario,
    leadConstraint: twin.floodConstraints.find((constraint) => constraint.impact === "constraint")?.relevance ?? "Constraint pending",
    primaryBlocker,
    nextUnlock:
      twin.proofBurdens.find((burden) => burden.currentState === "open")?.unlockIfResolved ?? twin.meta.nextBestMove,
    investorSignal: twin.translationState.investorNarrative,
  }
}

export function evaluateTwinState(twin: DigitalTwinState): TwinEngineState {
  const flattened = flattenObjects(twin)
  const proofIndex = buildProofIndex(twin)
  const dependencyMap = new Map<string, TwinDependency>()

  flattened.forEach(({ object }) => {
    object.dependencies.forEach((dependency) => {
      dependencyMap.set(dependency.id, dependency)
    })
  })

  const dependencyGraph = Array.from(dependencyMap.values()).map((dependency) => {
    const referencedBy = flattened
      .filter(({ object }) => object.dependencies.some((candidate) => candidate.id === dependency.id))
      .map(({ object }) => object.label)

    const status = dependencyStatus(dependency.id, proofIndex, flattened.map(({ object }) => object))

    return {
      id: dependency.id,
      label: dependency.label,
      kind: dependency.kind,
      status,
      referencedBy,
      blockingCount: referencedBy.length,
    }
  })

  const objectStatuses = flattened.map(({ kind, object }) => evaluateObject(object, kind, dependencyGraph))
  const scenarioReadiness = [
    scoreScenarioA(twin, objectStatuses),
    scoreScenarioB(twin, objectStatuses),
    scoreScenarioC(twin, objectStatuses),
  ]
  const corridorHud = buildHudState(twin, dependencyGraph, scenarioReadiness)
  const nextUnlocks = twin.proofBurdens
    .filter((burden) => burden.currentState !== "advancing")
    .map((burden) => `${burden.title}: ${burden.unlockIfResolved}`)
    .slice(0, 4)

  return {
    contractId: twin.meta.contractId,
    evaluatedAt: twin.meta.lastUpdated,
    dependencyGraph,
    objectStatuses,
    scenarioReadiness,
    proofPressure: {
      open: twin.proofBurdens.filter((burden) => burden.currentState === "open").length,
      holding: twin.proofBurdens.filter((burden) => burden.currentState === "holding").length,
      advancing: twin.proofBurdens.filter((burden) => burden.currentState === "advancing").length,
    },
    corridorHud,
    nextUnlocks,
  }
}

export function getTwinAlphaEngineState(): TwinEngineState {
  return evaluateTwinState(getTwinAlphaState())
}
