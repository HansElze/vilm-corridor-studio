import { NextResponse } from "next/server"
import { getTwinAlphaState } from "@/lib/digital-twin"
import { getTwinAlphaEngineState } from "@/lib/engine/twin-engine"

export async function GET() {
  const twin = getTwinAlphaState()
  const engine = getTwinAlphaEngineState()

  return NextResponse.json({
    status: "ok",
    sourceOfTruth: {
      contractId: twin.meta.contractId,
      version: twin.meta.version,
      lastUpdated: twin.meta.lastUpdated,
    },
    twin,
    engine,
  })
}
