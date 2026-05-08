import Link from "next/link"
import { initialHandshake } from "@/lib/ccl"
import { twinAlphaState } from "@/lib/digital-twin"
import { WorldLabsGallery } from "@/components/world-labs-gallery"
import { MiniVilm } from "@/components/mini-vilm"

const STACK_LAYERS = [
  {
    label: "CCL",
    title: "Civilizational Logic Core",
    body: "Corridor ontology, proof gates, metabolic constraints, over/under infrastructure reasoning, and scenario sequencing for the Philadelphia City Branch / Reading Viaduct corridor.",
    href: "/ccl",
  },
  {
    label: "VILM",
    title: "Vertically Integrated Language Model",
    body: "Domain-fused AI with the full twin state as context. Ask about proof gates, thermal systems, or investor sequencing — the model answers from the corridor engine, not general knowledge.",
    href: "/vilm",
  },
  {
    label: "Vision Pipeline",
    title: "AMD GPU-Accelerated Visual RAG",
    body: "981 architectural reference images classified by Claude Haiku vision into 8 corridor-specific categories. Instant retrieval by corridor element, material, or structural form.",
    href: "/vilm",
  },
  {
    label: "Proof",
    title: "Live Corridor Proof Dashboard",
    body: "Verified Mile Protocol (CCL-VMP-001) with 6 proof gates, 5 layer attestations, capital trigger tracking, and over/under subsystem health — all live from the digital twin.",
    href: "/proof",
  },
]

export default function HomePage() {
  const burdensSummary = twinAlphaState.proofBurdens
    .slice(0, 3)
    .map(b => `${b.title} — ${b.rootStatusClass}`)

  return (
    <main className="page">

      {/* Hero */}
      <section className="hero-grid">
        <article className="card hero-intro">
          <div className="eyebrow">AMD Developer Hackathon · Vision &amp; Multimodal AI · Cuttlefish Labs</div>
          <h1 className="headline">A Vertically Integrated Language Model for Urban Infrastructure Corridors</h1>
          <p className="lede">
            The VILM is not a chatbot wrapper. Corridor proof logic, typed metabolic constraints,
            flood-aware dependency chains, 981 GPU-classified architectural references, and a live
            digital twin are fused into the same typed engine — then surfaced as a navigable
            operator and investor interface.
          </p>
          <div className="cta-row">
            <Link className="button primary" href="/vilm">
              Query the VILM
            </Link>
            <Link className="button secondary" href="/proof">
              View Proof Gates
            </Link>
            <Link className="button secondary" href="/model">
              3D Corridor Model
            </Link>
          </div>
          <div className="stat-grid">
            <div className="stat">
              <span className="stat-label">Corridor</span>
              <span className="stat-value">Philadelphia City Branch / Reading Viaduct</span>
            </div>
            <div className="stat">
              <span className="stat-label">Segment Length</span>
              <span className="stat-value">{twinAlphaState.segmentLengthMiles} miles · Over/Under</span>
            </div>
            <div className="stat">
              <span className="stat-label">Visual RAG</span>
              <span className="stat-value">981 images · 8 categories · Claude Haiku vision</span>
            </div>
            <div className="stat">
              <span className="stat-label">Active Scenario</span>
              <span className="stat-value">Scenario {initialHandshake.segment.scenario} · Inherited Assets</span>
            </div>
          </div>
        </article>

        <aside className="card hero-side route-card">
          <div className="eyebrow">Live Proof Status</div>
          <h3>Active Gates</h3>
          <ul className="route-list">
            {twinAlphaState.proofBurdens.map(b => (
              <li key={b.id} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <span style={{
                  display: "inline-block",
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  marginTop: 5,
                  flexShrink: 0,
                  background: b.rootStatusClass === "grounded" ? "var(--teal)"
                    : b.rootStatusClass === "advancing" ? "#7ef7a0"
                    : b.rootStatusClass === "constrained" ? "#f7c97e"
                    : "rgba(255,255,255,0.2)",
                }} />
                <span style={{ fontSize: "0.8rem", lineHeight: 1.5 }}>
                  <strong>{b.title}</strong>
                  <span style={{ opacity: 0.5 }}> · {b.rootStatusClass}</span>
                </span>
              </li>
            ))}
          </ul>
          <Link className="button" href="/proof" style={{ marginTop: 12, display: "inline-block", fontSize: "0.78rem" }}>
            Full proof dashboard →
          </Link>
        </aside>
      </section>

      {/* Live VILM query */}
      <section className="route-grid" style={{ marginTop: "1.5rem" }}>
        <div className="card" style={{ gridColumn: "1 / -1", borderColor: "rgba(18,247,255,0.18)", background: "rgba(18,247,255,0.02)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div className="eyebrow" style={{ marginBottom: 0 }}>Live VILM Query</div>
            <span style={{ fontSize: "0.6rem", opacity: 0.35, textTransform: "uppercase", letterSpacing: "0.1em", marginLeft: "auto" }}>
              Claude Haiku · AMD Accelerated
            </span>
          </div>
          <MiniVilm />
        </div>
      </section>

      {/* Hackathon quick-entry */}
      <section className="route-grid" style={{ marginTop: "1.5rem" }}>
        <div className="card" style={{ gridColumn: "1 / -1", borderColor: "rgba(247,201,126,0.2)", background: "rgba(247,201,126,0.02)", padding: "16px 22px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#f7c97e", boxShadow: "0 0 8px #f7c97e" }} />
              <span style={{ fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.16em", color: "#f7c97e" }}>
                AMD Developer Hackathon 2026 · Vision &amp; Multimodal AI
              </span>
            </div>
            <span style={{ opacity: 0.4, fontSize: "0.7rem" }}>Judge entry:</span>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginLeft: "auto" }}>
              {[
                { href: "/hackathon", label: "Submission narrative" },
                { href: "/vilm", label: "VILM Chat + Vision RAG" },
                { href: "/model", label: "3D Twin · Demo Mode" },
                { href: "/proof", label: "Proof Simulation" },
              ].map(link => (
                <a key={link.href} href={link.href} style={{
                  fontSize: "0.7rem", padding: "4px 12px", borderRadius: 999,
                  border: "1px solid rgba(247,201,126,0.25)", color: "#f7c97e",
                  textDecoration: "none", background: "rgba(247,201,126,0.05)",
                }}>
                  {link.label} →
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stack */}
      <section className="route-grid" style={{ marginTop: "1.5rem" }}>
        {STACK_LAYERS.map((layer) => (
          <Link key={layer.label} href={layer.href} className="state-card" style={{ textDecoration: "none", cursor: "pointer" }}>
            <div className="eyebrow">{layer.label}</div>
            <h4>{layer.title}</h4>
            <p style={{ opacity: 0.65, fontSize: "0.82rem", lineHeight: 1.6 }}>{layer.body}</p>
          </Link>
        ))}
      </section>

      {/* Over / Under */}
      <section className="route-grid" style={{ marginTop: "1.5rem" }}>
        <div className="card">
          <div className="eyebrow">Under-Layer · {twinAlphaState.underLayer.currentReadiness}</div>
          <h4>Subsurface Infrastructure</h4>
          <p style={{ opacity: 0.6, fontSize: "0.82rem", lineHeight: 1.6 }}>
            City Branch tunnel reuse as metabolic backbone: basalt-composite dual-bore conduit,
            immersion-cooled compute modules, thermal exchange loop, and logistics spine.
            Evidence class: public-reference + candidate-trace.
          </p>
          <div className="pill-row" style={{ marginTop: 8 }}>
            {["Inherited Assets", "Metabolic Trunk", "Thermal", "Compute", "Access"].map(s => (
              <span key={s} className="pill" style={{ fontSize: "0.65rem" }}>{s}</span>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="eyebrow">Over-Layer · {twinAlphaState.overLayer.currentReadiness}</div>
          <h4>Civic + Revenue Surface</h4>
          <p style={{ opacity: 0.6, fontSize: "0.82rem", lineHeight: 1.6 }}>
            Reading Viaduct elevated promenade with basalt exosystem cap, public realm,
            Scenario B/C volumetric buildout envelope, district revenue logic, and
            municipal uplift framing — all dependent on Scenario A proof.
          </p>
          <div className="pill-row" style={{ marginTop: 8 }}>
            {["Cap Strategy", "Decking", "Revenue Envelope", "Civic Interface"].map(s => (
              <span key={s} className="pill" style={{ fontSize: "0.65rem" }}>{s}</span>
            ))}
          </div>
        </div>
      </section>

      {/* World Labs scenes */}
      <section className="route-grid" style={{ marginTop: "1.5rem" }}>
        <div className="card" style={{ gridColumn: "1 / -1" }}>
          <div className="eyebrow">World Labs — Corridor Visualization Suite</div>
          <h4 style={{ margin: "4px 0 6px" }}>8 corridor 3D scenes across over, at-grade, and under layers</h4>
          <p style={{ margin: "0 0 20px", opacity: 0.5, fontSize: "0.8rem" }}>
            Generated from the VILM design language — basalt standard, industrial-biophilic modernism.
          </p>
          <WorldLabsGallery />
        </div>
      </section>

    </main>
  )
}
