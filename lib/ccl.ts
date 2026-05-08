import { getTwinAlphaState } from "@/lib/digital-twin"
import { getTwinAlphaEngineState } from "@/lib/engine/twin-engine"

export type CorridorScenario = "A" | "B" | "C"

export type CorridorSegmentState = {
  id: string
  corridorName: string
  scenario: CorridorScenario
  segmentLabel: string
  operatorMode: "inherited_assets" | "volumetric_cap" | "integrated_buildout"
  proofStatus: string
  activeTraceTarget: string
  investorFraming: string
}

export type ProofGate = {
  id: string
  label: string
  burden: string
  currentStatus: "holding" | "needs-work" | "manual"
  nextCollapseStep: string
}

export type MetabolicReadiness = {
  hydraulic: string
  thermal: string
  mobility: string
  governance: string
  revenue: string
}

export type CclHandshake = {
  mission: string
  segment: CorridorSegmentState
  proofGates: ProofGate[]
  readiness: MetabolicReadiness
  notes: string[]
}

export function getInitialHandshake(): CclHandshake {
  const twin = getTwinAlphaState()
  const engine = getTwinAlphaEngineState()
  const leadScenario = engine.scenarioReadiness[0]

  return {
    mission: "corridor-engine-next-shell",
    segment: {
      id: twin.id,
      corridorName: twin.corridor,
      scenario: engine.corridorHud.activeScenario,
      segmentLabel: twin.name,
      operatorMode: "inherited_assets",
      proofStatus: engine.corridorHud.primaryBlocker,
      activeTraceTarget: engine.corridorHud.activeAnchor,
      investorFraming: engine.corridorHud.investorSignal,
    },
    proofGates: twin.proofBurdens.slice(0, 3).map((burden) => ({
      id: burden.id,
      label: burden.id,
      burden: burden.whyItMatters,
      currentStatus:
        burden.currentState === "holding"
          ? "holding"
          : burden.currentState === "advancing"
            ? "manual"
            : "needs-work",
      nextCollapseStep: burden.nextModelingMove,
    })),
    readiness: {
      hydraulic: twin.floodConstraints.find((constraint) => constraint.impact === "constraint")?.rootStatusClass ?? "constraint pending",
      thermal: twin.underLayer.thermalSystem.rootStatusClass,
      mobility: `${leadScenario.status} / ${leadScenario.score}`,
      governance: twin.translationState.rootStatusClass,
      revenue: twin.overLayer.revenueEnvelope.rootStatusClass,
    },
    notes: [...twin.modelingNotes, ...engine.nextUnlocks.slice(0, 2)],
  }
}

export const initialHandshake = getInitialHandshake()
