import { getTwinAlphaState } from "@/lib/digital-twin"
import { getTwinAlphaEngineState } from "@/lib/engine/twin-engine"
import { WorldLabsGallery } from "@/components/world-labs-gallery"

const STATUS_COLOR: Record<string, string> = {
  grounded:    "var(--teal)",
  advancing:   "#7ef7a0",
  constrained: "#f7c97e",
  provisional: "#f7c97e",
  narrative:   "rgba(255,255,255,0.25)",
  blocked:     "#f77e7e",
}

export default function InvestorPage() {
  const twin = getTwinAlphaState()
  const engine = getTwinAlphaEngineState()
  const scenarioA = engine.scenarioReadiness.find(s => s.scenario === "A")
  const scenarioB = engine.scenarioReadiness.find(s => s.scenario === "B")
  const scenarioC = engine.scenarioReadiness.find(s => s.scenario === "C")

  return (
    <main className="page">

      {/* Header */}
      <section className="route-grid">
        <div className="card" style={{ gridColumn: "1 / -1" }}>
          <div className="eyebrow">Investor Translation Surface</div>
          <h3>Philadelphia City Branch / Reading Viaduct — Corridor Investment Thesis</h3>
          <p style={{ maxWidth: 720, opacity: 0.7, lineHeight: 1.7 }}>
            {twin.translationState.investorNarrative}
          </p>
          <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(18,247,255,0.04)", borderRadius: 6, border: "1px solid rgba(18,247,255,0.1)", maxWidth: 680 }}>
            <span style={{ fontSize: "0.75rem", opacity: 0.65, fontStyle: "italic" }}>
              {twin.translationState.sectionFirstPresentation}
            </span>
          </div>
        </div>
      </section>

      {/* Scenario readiness */}
      <section className="route-grid" style={{ marginTop: "1.5rem" }}>
        {[
          { s: scenarioA, label: "Scenario A", desc: "Inherited asset activation — shortest proof path. Under-layer reuse, metabolic trunk, minimal above-grade intervention.", color: "var(--teal)" },
          { s: scenarioB, label: "Scenario B", desc: "Volumetric cap buildout. Unlocked by Scenario A proof. Adds structured over-layer revenue envelope above the corridor.", color: "#7ef7a0" },
          { s: scenarioC, label: "Scenario C", desc: "Integrated buildout. Full over/under expression. Dependent on both A and B proof gates clearing first.", color: "#f7c97e" },
        ].map(({ s, label, desc, color }) => (
          <div key={label} className="card" style={{ gridColumn: "span 4" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div className="eyebrow">{label}</div>
              <span style={{ fontSize: "2rem", fontWeight: 700, color, lineHeight: 1 }}>
                {s?.score ?? "—"}
              </span>
            </div>
            <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, marginBottom: 12 }}>
              <div style={{ height: "100%", width: `${s?.score ?? 0}%`, background: color, borderRadius: 2, opacity: 0.8 }} />
            </div>
            <p style={{ margin: "0 0 8px", fontSize: "0.78rem", opacity: 0.65, lineHeight: 1.5 }}>{desc}</p>
            <div style={{ fontSize: "0.72rem", opacity: 0.5 }}>
              {s?.drivers?.slice(0, 2).map(d => (
                <span key={d} style={{ display: "block", marginBottom: 2 }}>+ {d}</span>
              ))}
            </div>
            {s?.blockers?.length ? (
              <div style={{ marginTop: 8, fontSize: "0.72rem", opacity: 0.4 }}>
                {s.blockers.slice(0, 1).map(b => (
                  <span key={b} style={{ display: "block" }}>⚠ {b}</span>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </section>

      {/* Capital + metabolic */}
      <section className="route-grid" style={{ marginTop: "1.5rem" }}>
        <div className="card" style={{ gridColumn: "span 6" }}>
          <div className="eyebrow">Verified Mile Protocol · PHL-CB-01</div>
          <h4 style={{ margin: "4px 0 14px" }}>Capital Trigger Stack</h4>
          {[
            { label: "T0 — Candidate entry", detail: "Segment registered, bounds defined, stage clock starts", unlocked: true },
            { label: "T1 — Structural validation", detail: "Inherited tunnel and viaduct structural attestation", unlocked: false },
            { label: "T2 — Metabolic readiness", detail: "Thermal yield, hydraulic, and conduit capacity attested", unlocked: false },
            { label: "T3 — Compute layer", detail: "Compute placement and cooling dependency signed off", unlocked: false },
            { label: "T4 — Logistics fit", detail: "Service corridor and access nodes cleared", unlocked: false },
            { label: "T5 — Civic linkage", detail: "Public realm and governance layer attested", unlocked: false },
            { label: "T6 — SIEA disbursement", detail: "$2.5M per Verified Mile at full certification", unlocked: false },
          ].map((t, i) => (
            <div key={i} style={{
              display: "flex",
              gap: 10,
              padding: "8px 0",
              borderBottom: "1px solid rgba(255,255,255,0.04)",
              opacity: t.unlocked ? 1 : 0.5,
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: "50%", marginTop: 5, flexShrink: 0,
                background: t.unlocked ? "var(--teal)" : "rgba(255,255,255,0.15)",
              }} />
              <div>
                <div style={{ fontSize: "0.78rem", fontWeight: 600 }}>{t.label}</div>
                <div style={{ fontSize: "0.7rem", opacity: 0.55, lineHeight: 1.4 }}>{t.detail}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="card" style={{ gridColumn: "span 6" }}>
          <div className="eyebrow">Metabolic Readiness</div>
          <h4 style={{ margin: "4px 0 14px" }}>System health by domain</h4>
          {[
            { label: "Hydraulic", value: engine.corridorHud.leadConstraint, status: "advancing" },
            { label: "Thermal", value: twin.underLayer.thermalSystem.rootStatusClass, status: twin.underLayer.thermalSystem.rootStatusClass },
            { label: "Mobility", value: `${scenarioA?.status} — ${scenarioA?.score}/100`, status: scenarioA?.status ?? "pending" },
            { label: "Governance", value: twin.translationState.rootStatusClass, status: twin.translationState.rootStatusClass },
            { label: "Revenue", value: twin.overLayer.revenueEnvelope.rootStatusClass, status: twin.overLayer.revenueEnvelope.rootStatusClass },
          ].map(m => (
            <div key={m.label} style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 0",
              borderBottom: "1px solid rgba(255,255,255,0.04)",
            }}>
              <span style={{ fontSize: "0.78rem", opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "0.72rem" }}>
                {m.label}
              </span>
              <span style={{
                fontSize: "0.75rem",
                color: STATUS_COLOR[m.status] ?? "var(--muted)",
                fontWeight: 600,
              }}>
                {m.value}
              </span>
            </div>
          ))}

          <div style={{ marginTop: 20 }}>
            <div className="eyebrow" style={{ marginBottom: 10 }}>Revenue Envelope</div>
            {twin.overLayer.revenueEnvelope.items.map(item => (
              <div key={item} style={{ fontSize: "0.76rem", opacity: 0.6, marginBottom: 6, paddingLeft: 12, borderLeft: "2px solid rgba(18,247,255,0.15)" }}>
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* World Labs scenes */}
      <section className="route-grid" style={{ marginTop: "1.5rem" }}>
        <div className="card" style={{ gridColumn: "1 / -1" }}>
          <div className="eyebrow">World Labs — Corridor Visualization Suite</div>
          <h4 style={{ margin: "4px 0 20px" }}>8 corridor scenes across over, at-grade, and under layers</h4>
          <WorldLabsGallery />
        </div>
      </section>

      {/* Translation state */}
      <section className="route-grid" style={{ marginTop: "1.5rem" }}>
        <div className="card" style={{ gridColumn: "1 / -1" }}>
          <div className="eyebrow">Next Best Move</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
            {engine.nextUnlocks.map((unlock, i) => (
              <div key={i} style={{
                padding: "12px 14px",
                background: "rgba(18,247,255,0.03)",
                border: "1px solid rgba(18,247,255,0.1)",
                borderRadius: 8,
                fontSize: "0.8rem",
                lineHeight: 1.5,
                opacity: 0.8,
              }}>
                {unlock}
              </div>
            ))}
          </div>
        </div>
      </section>

    </main>
  )
}
