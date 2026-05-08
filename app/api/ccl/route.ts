import { NextResponse } from "next/server"
import { getInitialHandshake } from "@/lib/ccl"
import { getTwinAlphaState } from "@/lib/digital-twin"
import { getTwinAlphaEngineState } from "@/lib/engine/twin-engine"

export async function GET() {
  const twin = getTwinAlphaState()
  const engine = getTwinAlphaEngineState()
  const handshake = getInitialHandshake()

  return NextResponse.json({
    status: "ok",
    engine: "CCL",
    surface: "Corridor Studio",
    sourceOfTruth: {
      contractId: twin.meta.contractId,
      version: twin.meta.version,
      twinId: twin.id,
      lastUpdated: twin.meta.lastUpdated,
    },
    handshake,
    computed: {
      leadScenario: engine.scenarioReadiness[0],
      corridorHud: engine.corridorHud,
      nextUnlocks: engine.nextUnlocks,
    },
  })
}
