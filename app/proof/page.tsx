"use client"

import { useEffect, useRef, useState } from "react"
import { twinAlphaState } from "@/lib/digital-twin"
import { makePhlCb01Candidate, STAGE_ORDER, VerifiedMileStage } from "@/lib/verified-mile"

const STATUS_COLOR: Record<string, string> = {
  grounded:    "var(--teal)",
  advancing:   "#7ef7a0",
  constrained: "#f7c97e",
  provisional: "#f7c97e",
  "needs-work":"#f7a07e",
  narrative:   "rgba(255,255,255,0.25)",
  blocked:     "#f77e7e",
  holding:     "#7eb4f7",
  open:        "rgba(255,255,255,0.25)",
}

const STAGE_LABEL: Record<VerifiedMileStage, string> = {
  [VerifiedMileStage.CANDIDATE]:              "Candidate",
  [VerifiedMileStage.SURVEYED]:               "Surveyed",
  [VerifiedMileStage.STRUCTURALLY_VALIDATED]: "Struct. Valid.",
  [VerifiedMileStage.METABOLIC_READY]:        "Metabolic",
  [VerifiedMileStage.COMPUTE_READY]:          "Compute",
  [VerifiedMileStage.LOGISTICS_READY]:        "Logistics",
  [VerifiedMileStage.CIVIC_LINKED]:           "Civic",
  [VerifiedMileStage.VERIFIED_MILE]:          "Verified Mile",
}

function StatusDot({ status }: { status: string }) {
  return (
    <span style={{
      display: "inline-block",
      width: 8, height: 8, borderRadius: "50%",
      background: STATUS_COLOR[status] ?? "rgba(255,255,255,0.2)",
      flexShrink: 0,
    }} />
  )
}

function StatusPill({ status }: { status: string }) {
  return (
    <span className="pill" style={{
      fontSize: "0.65rem",
      color: STATUS_COLOR[status] ?? "inherit",
      borderColor: STATUS_COLOR[status] ?? undefined,
      opacity: 0.9,
    }}>
      {status}
    </span>
  )
}

export default function ProofPage() {
  const twin = twinAlphaState
  const vmp = makePhlCb01Candidate()
  const realStageIdx = STAGE_ORDER.indexOf(vmp.stage)

  const [simStageIdx, setSimStageIdx] = useState<number | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)
  const simTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const displayedStageIdx = simStageIdx !== null ? simStageIdx : realStageIdx

  function handleSimulate() {
    if (isSimulating) {
      if (simTimerRef.current) { clearInterval(simTimerRef.current); simTimerRef.current = null }
      setIsSimulating(false)
      setSimStageIdx(null)
      return
    }
    setIsSimulating(true)
    setSimStageIdx(0)
    let i = 0
    simTimerRef.current = setInterval(() => {
      i++
      if (i >= STAGE_ORDER.length) {
        clearInterval(simTimerRef.current!)
        simTimerRef.current = null
        setTimeout(() => {
          setIsSimulating(false)
          setSimStageIdx(null)
        }, 1200)
      } else {
        setSimStageIdx(i)
      }
    }, 800)
  }

  useEffect(() => {
    return () => { if (simTimerRef.current) clearInterval(simTimerRef.current) }
  }, [])

  return (
    <main className="page">

      {/* Header */}
      <section className="route-grid">
        <div className="card" style={{ gridColumn: "1 / -1" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
            <div>
              <div className="eyebrow">CCL-VMP-001 · Proof State</div>
              <h3>Corridor Proof Dashboard — {twin.name}</h3>
              <p style={{ opacity: 0.65, maxWidth: 680, margin: "4px 0 8px" }}>
                Live proof gate status across the {twin.corridor}. Each gate must hold before capital triggers unlock.
                Scenario A is the proof-first path; B and C remain structurally dependent on A.
              </p>
              <div className="pill-row">
                <span className="pill">Scenario {twin.scenario}</span>
                <StatusPill status={twin.meta.rootStatusClass} />
                <span className="pill">{twin.segmentLengthMiles} mi corridor</span>
              </div>
            </div>
            <button
              type="button"
              className="button"
              onClick={handleSimulate}
              style={{
                padding: "8px 18px", fontSize: "0.78rem", marginTop: 4,
                color: isSimulating ? "var(--teal)" : undefined,
                borderColor: isSimulating ? "rgba(18,247,255,0.4)" : undefined,
                background: isSimulating ? "rgba(18,247,255,0.08)" : undefined,
              }}
            >
              {isSimulating ? "◼ Stop" : "▶ Simulate Progression"}
            </button>
          </div>
        </div>
      </section>

      {/* Verified Mile Stage Ladder */}
      <section className="route-grid" style={{ marginTop: "1.5rem" }}>
        <div className="card" style={{ gridColumn: "1 / -1" }}>
          <div className="eyebrow">Verified Mile Protocol · PHL-CB-01</div>
          <h4 style={{ margin: "4px 0 20px" }}>Stage Progression</h4>
          <div style={{ display: "flex", gap: 0, alignItems: "stretch" }}>
            {STAGE_ORDER.map((stage, i) => {
              const reached = i <= displayedStageIdx
              const active = i === displayedStageIdx
              const simActive = isSimulating && active
              return (
                <div key={stage} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{
                    width: "100%", height: 4,
                    background: reached ? (simActive ? "#7ef7a0" : "var(--teal)") : "rgba(18,247,255,0.08)",
                    opacity: active ? 1 : reached ? 0.6 : 0.3,
                    transition: "background 0.4s ease, opacity 0.4s ease",
                  }} />
                  <div style={{
                    marginTop: 8,
                    width: active ? 14 : 10,
                    height: active ? 14 : 10,
                    borderRadius: "50%",
                    background: active ? (simActive ? "#7ef7a0" : "var(--teal)") : reached ? "rgba(18,247,255,0.5)" : "rgba(255,255,255,0.12)",
                    border: active ? `2px solid ${simActive ? "#7ef7a0" : "var(--teal)"}` : "none",
                    boxShadow: active ? `0 0 ${simActive ? 14 : 8}px ${simActive ? "#7ef7a0" : "var(--teal)"}` : "none",
                    transition: "all 0.35s ease",
                  }} />
                  <span style={{
                    marginTop: 6, fontSize: "0.6rem", textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    opacity: active ? 1 : reached ? 0.6 : 0.25,
                    textAlign: "center", lineHeight: 1.3,
                    color: active && simActive ? "#7ef7a0" : undefined,
                    fontWeight: active ? 700 : 400,
                    transition: "all 0.35s ease",
                  }}>
                    {STAGE_LABEL[stage]}
                  </span>
                </div>
              )
            })}
          </div>
          <div style={{ marginTop: 20, padding: "10px 14px", background: "rgba(18,247,255,0.04)", borderRadius: 6, display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: "0.75rem", opacity: 0.6 }}>
              {isSimulating
                ? <>Simulating: <strong style={{ color: "#7ef7a0" }}>{STAGE_LABEL[STAGE_ORDER[displayedStageIdx]]}</strong></>
                : <>Current stage: <strong style={{ color: "var(--teal)" }}>{vmp.stage}</strong></>
              }
            </span>
            <span style={{ fontSize: "0.75rem", opacity: 0.6 }}>
              Capital triggers: <strong>{vmp.capital_triggers_unlocked}/6</strong>
            </span>
            <span style={{ fontSize: "0.75rem", opacity: 0.6 }}>
              SIEA eligible: <strong>{vmp.siea_disbursement_eligible ? "yes" : "not yet"}</strong>
            </span>
          </div>
        </div>
      </section>

      {/* Proof Burdens */}
      <section className="route-grid" style={{ marginTop: "1.5rem" }}>
        <div className="card" style={{ gridColumn: "1 / -1" }}>
          <div className="eyebrow">Proof Gates</div>
          <h4 style={{ margin: "4px 0 16px" }}>Active Burden Ledger</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {twin.proofBurdens.map((burden) => (
              <div key={burden.id} style={{
                padding: "12px 14px",
                background: "rgba(255,255,255,0.02)",
                borderRadius: 4,
                borderLeft: `3px solid ${STATUS_COLOR[burden.rootStatusClass] ?? "rgba(255,255,255,0.1)"}`,
                marginBottom: 4,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <StatusDot status={burden.rootStatusClass} />
                  <span style={{ fontWeight: 600, fontSize: "0.85rem" }}>{burden.title}</span>
                  <StatusPill status={burden.currentState} />
                  <StatusPill status={burden.rootStatusClass} />
                </div>
                <p style={{ margin: "0 0 4px", fontSize: "0.78rem", opacity: 0.7, lineHeight: 1.5 }}>
                  {burden.whyItMatters}
                </p>
                <p style={{ margin: 0, fontSize: "0.74rem", opacity: 0.5 }}>
                  Next: {burden.nextModelingMove}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Under / Over layer readiness */}
      <section className="route-grid" style={{ marginTop: "1.5rem" }}>
        <div className="card" style={{ gridColumn: "span 6" }}>
          <div className="eyebrow">Under-Layer</div>
          <h4 style={{ margin: "4px 0 12px" }}>
            Readiness: <StatusPill status={twin.underLayer.currentReadiness} />
          </h4>
          {[
            twin.underLayer.inheritedAssets,
            twin.underLayer.metabolicTrunk,
            twin.underLayer.thermalSystem,
            twin.underLayer.computeSystem,
            twin.underLayer.accessAndVentilation,
          ].map((sub) => (
            <div key={sub.id} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                <StatusDot status={sub.rootStatusClass} />
                <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>{sub.label}</span>
              </div>
              <p style={{ margin: 0, fontSize: "0.72rem", opacity: 0.55, lineHeight: 1.4, paddingLeft: 14 }}>
                {sub.blockingRisk}
              </p>
            </div>
          ))}
        </div>

        <div className="card" style={{ gridColumn: "span 6" }}>
          <div className="eyebrow">Over-Layer</div>
          <h4 style={{ margin: "4px 0 12px" }}>
            Readiness: <StatusPill status={twin.overLayer.currentReadiness} />
          </h4>
          {[
            twin.overLayer.capStrategy,
            twin.overLayer.deckingAndSpanLogic,
            twin.overLayer.revenueEnvelope,
            twin.overLayer.civicInterface,
          ].map((sub) => (
            <div key={sub.id} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                <StatusDot status={sub.rootStatusClass} />
                <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>{sub.label}</span>
              </div>
              <p style={{ margin: 0, fontSize: "0.72rem", opacity: 0.55, lineHeight: 1.4, paddingLeft: 14 }}>
                {sub.blockingRisk}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Anchors */}
      <section className="route-grid" style={{ marginTop: "1.5rem" }}>
        {twin.anchors.map((anchor) => (
          <div key={anchor.id} className="state-card">
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <StatusDot status={anchor.rootStatusClass} />
              <span style={{ fontSize: "0.65rem", textTransform: "uppercase", opacity: 0.5 }}>{anchor.kind}</span>
            </div>
            <h4 style={{ margin: "0 0 4px", fontSize: "0.88rem" }}>{anchor.label}</h4>
            <div className="pill-row" style={{ marginBottom: 8 }}>
              <StatusPill status={anchor.rootStatusClass} />
              <span className="pill" style={{ fontSize: "0.65rem" }}>{anchor.confidenceClass} confidence</span>
              <span className="pill" style={{ fontSize: "0.65rem" }}>{anchor.evidence}</span>
            </div>
            <p style={{ margin: "0 0 4px", fontSize: "0.74rem", opacity: 0.6 }}>{anchor.blockingRisk}</p>
            <p style={{ margin: 0, fontSize: "0.7rem", opacity: 0.45 }}>Unlock: {anchor.unlockIfResolved}</p>
          </div>
        ))}
      </section>

      {/* Flood */}
      <section className="route-grid" style={{ marginTop: "1.5rem" }}>
        <div className="card" style={{ gridColumn: "1 / -1" }}>
          <div className="eyebrow">Flood Constraints</div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {twin.floodConstraints.map((f) => (
              <div key={f.id} style={{
                flex: "1 1 280px", padding: "12px 14px",
                background: "rgba(255,255,255,0.02)", borderRadius: 4,
                borderLeft: `3px solid ${f.impact === "constraint" ? "#f7c97e" : "rgba(18,247,255,0.3)"}`,
              }}>
                <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4 }}>
                  <span className="pill" style={{ fontSize: "0.65rem" }}>{f.annualChance}</span>
                  <span className="pill" style={{ fontSize: "0.65rem" }}>{f.impact}</span>
                  <StatusPill status={f.rootStatusClass} />
                </div>
                <p style={{ margin: "0 0 4px", fontSize: "0.78rem", opacity: 0.7 }}>{f.relevance}</p>
                <p style={{ margin: 0, fontSize: "0.7rem", opacity: 0.45 }}>{f.blockingRisk}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </main>
  )
}
