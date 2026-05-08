import Link from "next/link"
import { twinAlphaState } from "@/lib/digital-twin"
import { WORLD_LABS_SCENES } from "@/lib/visual-surface"

const ARCH_LAYERS = [
  {
    id: "CCL",
    title: "Corridor Computational Logic (CCL)",
    color: "var(--teal)",
    items: [
      "Typed proof gate ledger — 6 burdens, each with rootStatusClass, blockingRisk, and capital unlock conditions",
      "Over/Under infrastructure model — 5 under-layer subsystems, 4 over-layer subsystems, readiness scoring",
      "Anchor state machine — 4 anchors (east-viaduct, cut-section, west-tunnel, 30th-pilot-node) with evidence classes",
      "Scenario graph — Scenario A (proof-first), B (early build), C (full integrated), sequencing constraints between them",
      "Flood constraint engine — 500-yr and 100-yr bands with dependency and proof links",
      "Verified Mile Protocol — CCL-VMP-001, 8 discrete stages from candidate to verified-mile",
    ],
  },
  {
    id: "VILM",
    title: "Vertically Integrated Language Model (VILM)",
    color: "#d98cff",
    items: [
      "Claude Haiku (claude-haiku-4-5) with full digital twin state injected as system prompt context",
      "Live corridor state — twin anchors, proof burdens, flood constraints, under/over readiness — all wired into every response",
      "Streaming response via ReadableStream with text/plain content type for low-latency output",
      "Keyword → image category mapping — 15 terms (tunnel, basalt, viaduct, compute…) auto-surface relevant RAG images inline",
      "Corridor-specific persona: answers as a corridor navigator, not a general assistant",
    ],
  },
  {
    id: "VISION",
    title: "AMD GPU-Accelerated Vision Pipeline",
    color: "#f7c97e",
    items: [
      "981 architectural reference images classified by Claude Haiku vision into 8 corridor-specific categories",
      "Categories: underground infrastructure tunnel, elevated viaduct, basalt/volcanic material, biophilic architecture, industrial adaptive reuse, urban mobility, data center / compute infrastructure, civic promenade",
      "Instant semantic retrieval — search returns matching images in <100ms from the pre-built manifest",
      "Click-to-analyze: any image streams a Claude vision analysis scoped to the corridor (which layer it speaks to, design language, proof element it supports)",
      "AMD inference target: vision classification and streaming inference are GPU-bound operations targetable to AMD Instinct/Radeon hardware",
    ],
  },
  {
    id: "TWIN",
    title: "Digital Twin + Procedural 3D Corridor",
    color: "#7ef7a0",
    items: [
      "Three.js procedural model built directly from typed CCL state — no static mesh, the model reflects live proof status",
      "3 animated electric bus fleets (tunnel / viaduct / cut sections) with CatmullRomCurve3 path tracking, trail lines, and per-section point lights",
      "Fog, atmospheric depth, pulsing beacon emissive animation, auto-orbit idle mode, scan plane sweep",
      "Click-to-inspect: raycaster intersects proceduralMeta on every mesh, popups show twin-backed proof data",
      "Tunnel shell + viaduct deck geometry — TubeGeometry overlays showing infrastructure envelope",
      "Demo Mode: auto-tours between sections every 7s with section caption overlay",
      "World Labs 3D scenes: 8 corridor scenes (section studies + hero renders) across over, at-grade, and under layers",
      "SketchUp cross-section model generated via MCP from CCL geometry: 13 named components (tunnel bore, metabolic trunk, viaduct columns, basalt cap)",
    ],
  },
]

const METRICS = [
  { label: "Corridor", value: "1.76 miles" },
  { label: "Alignment", value: "Philadelphia City Branch / Reading Viaduct" },
  { label: "Scenario graph", value: "A → B → C (proof-first sequencing)" },
  { label: "Proof gates", value: `6 burdens · ${twinAlphaState.proofBurdens.filter(b => b.rootStatusClass === "advancing" || b.rootStatusClass === "grounded").length} advancing or grounded` },
  { label: "Vision RAG", value: "981 images · 8 categories · Claude Haiku vision" },
  { label: "World Labs scenes", value: `${WORLD_LABS_SCENES.length} corridor 3D renders` },
  { label: "Active scenario", value: `Scenario ${twinAlphaState.scenario}` },
  { label: "Verified Mile stage", value: "Candidate (CCL-VMP-001)" },
  { label: "3D asset", value: "SketchUp corridor model · 13 components · MCP-generated" },
]

const DEMO_STEPS = [
  { step: "1", href: "/vilm", label: "VILM Chat", desc: "Ask about the tunnel thermal system, capital triggers, or basalt conduit specs. The model answers from the corridor engine, not training data. Paste an image from the gallery into the chat." },
  { step: "2", href: "/proof", label: "Proof Dashboard", desc: "Hit 'Simulate Progression' to animate through all 8 Verified Mile stages. See how proof gates sequence toward capital unlock." },
  { step: "3", href: "/model", label: "3D Twin", desc: "Hit 'Demo Mode' — camera auto-tours tunnel, viaduct, and cut sections. Click any mesh for engine-backed proof data. Watch buses with trails and pulsing anchor beacons." },
  { step: "4", href: "/investor", label: "Investor Readiness", desc: "Scenario A/B/C capital trigger stack. T0–T6 unlock conditions. Metabolic readiness by domain. World Labs corridor scenes." },
  { step: "5", href: "/corridor-studio", label: "Corridor Studio", desc: "Leaflet map of the 1.76-mile alignment with HUD overlay toggling and presentation mode." },
]

export default function HackathonPage() {
  return (
    <main className="page">

      {/* Header */}
      <section className="route-grid">
        <div className="card" style={{ gridColumn: "1 / -1", borderColor: "rgba(18,247,255,0.25)", background: "rgba(18,247,255,0.03)" }}>
          <div className="eyebrow" style={{ color: "var(--teal)" }}>AMD Developer Hackathon 2026 · Vision &amp; Multimodal AI Track</div>
          <h2 style={{ margin: "6px 0 8px" }}>VILM — Closing the Intelligence Gap Between Dormant Infrastructure and Actionable Capital</h2>
          <p style={{ opacity: 0.7, maxWidth: 820, lineHeight: 1.7, margin: "0 0 12px" }}>
            Cities sit on dormant corridors — tunnels, viaducts, elevated rail beds — that have real infrastructure
            value but no activation layer. The VILM closes that gap: a domain-fused AI stack that fuses Claude Haiku
            with a typed corridor logic engine, AMD GPU-accelerated visual RAG (981 architectural references),
            and a live procedural digital twin — surfaced as an operator and investor-grade interface for the
            Philadelphia City Branch / Reading Viaduct proof case.
          </p>
          <div className="pill-row">
            <span className="pill" style={{ color: "var(--teal)", borderColor: "rgba(18,247,255,0.3)" }}>Cuttlefish Labs</span>
            <span className="pill">Philadelphia City Branch · Reading Viaduct</span>
            <span className="pill">1.76 miles · Over/Under</span>
            <span className="pill">Claude Haiku · Vision RAG · Three.js</span>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="route-grid" style={{ marginTop: "1.5rem" }}>
        <div className="card" style={{ gridColumn: "span 7" }}>
          <div className="eyebrow">The Problem</div>
          <h4>Dormant Urban Infrastructure Has No Activation Layer</h4>
          <p style={{ opacity: 0.7, lineHeight: 1.7, margin: "8px 0 12px" }}>
            Cities sit on dormant corridors — tunnels, viaducts, elevated rail beds — that have infrastructure
            value but no activation path. The Philadelphia City Branch is a 1.76-mile former freight corridor
            running from 30th Street through Center City, with a tunnel bore below and a historic viaduct (the
            Reading Viaduct) above.
          </p>
          <p style={{ opacity: 0.7, lineHeight: 1.7, margin: 0 }}>
            Activating it requires proving geometry, access, flood tolerance, service logic, and capital readiness
            simultaneously across an over/under infrastructure stack — a problem that general-purpose AI and static
            documents cannot solve. It needs a domain-fused model that understands the corridor engine natively.
          </p>
        </div>
        <div className="card" style={{ gridColumn: "span 5" }}>
          <div className="eyebrow">Key Metrics</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
            {METRICS.map(m => (
              <div key={m.label} style={{ display: "flex", flexDirection: "column", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <span style={{ fontSize: "0.62rem", opacity: 0.4, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>{m.label}</span>
                <span style={{ fontSize: "0.82rem", fontWeight: 600 }}>{m.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Architecture */}
      <section className="route-grid" style={{ marginTop: "1.5rem" }}>
        <div className="card" style={{ gridColumn: "1 / -1" }}>
          <div className="eyebrow">Technical Architecture</div>
          <h4 style={{ margin: "4px 0 20px" }}>Four integrated layers, each domain-specific</h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
            {ARCH_LAYERS.map(layer => (
              <div key={layer.id} style={{ padding: "16px", background: "rgba(255,255,255,0.02)", borderRadius: 10, borderLeft: `3px solid ${layer.color}` }}>
                <div style={{ fontSize: "0.62rem", color: layer.color, textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 6 }}>{layer.id}</div>
                <div style={{ fontSize: "0.88rem", fontWeight: 700, marginBottom: 12, lineHeight: 1.3 }}>{layer.title}</div>
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                  {layer.items.map((item, i) => (
                    <li key={i} style={{ fontSize: "0.74rem", opacity: 0.65, lineHeight: 1.5, display: "flex", gap: 7 }}>
                      <span style={{ color: layer.color, flexShrink: 0, marginTop: 2 }}>·</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AMD GPU Role */}
      <section className="route-grid" style={{ marginTop: "1.5rem" }}>
        <div className="card" style={{ gridColumn: "1 / -1", borderColor: "rgba(247,201,126,0.2)", background: "rgba(247,201,126,0.02)" }}>
          <div className="eyebrow" style={{ color: "#f7c97e" }}>AMD GPU Acceleration</div>
          <h4 style={{ margin: "4px 0 12px" }}>Vision classification + streaming inference on AMD hardware</h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {[
              {
                label: "Visual RAG — Bulk Classification",
                body: "981 architectural images classified by Claude Haiku vision in a single overnight batch. AMD GPU inference (via Anthropic API) processes each image at scale to produce the 8-category manifest used for corridor-aware retrieval.",
              },
              {
                label: "Streaming VILM Inference",
                body: "Each VILM chat request runs Claude Haiku with the full twin state as context — a large system prompt. AMD GPU backends accelerate the time-to-first-token and streaming throughput that makes the interface feel live.",
              },
              {
                label: "Vision Analysis on Demand",
                body: "Click-to-analyze sends any corridor image to Claude vision. The GPU-backed inference produces a real-time analysis scoped to: which infrastructure layer the image speaks to, which proof element it supports, and its design language alignment.",
              },
              {
                label: "3D Twin Rendering",
                body: "The Three.js digital twin with animated buses, fog, moving point lights, and per-frame trail updates runs GPU-accelerated in WebGL. AMD discrete GPUs (Radeon RX series) provide the rendering throughput for smooth 60fps corridor visualization.",
              },
            ].map(item => (
              <div key={item.label} style={{ padding: "14px", background: "rgba(247,201,126,0.04)", borderRadius: 8 }}>
                <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#f7c97e", marginBottom: 8 }}>{item.label}</div>
                <p style={{ margin: 0, fontSize: "0.74rem", opacity: 0.65, lineHeight: 1.6 }}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SketchUp Model */}
      <section className="route-grid" style={{ marginTop: "1.5rem" }}>
        <div className="card" style={{ gridColumn: "1 / -1", borderColor: "rgba(93,255,139,0.2)", background: "rgba(93,255,139,0.02)" }}>
          <div className="eyebrow" style={{ color: "var(--lime)" }}>3D Corridor Asset · Generated by VILM</div>
          <h4 style={{ margin: "4px 0 6px" }}>Philadelphia City Branch Corridor — SketchUp Cross-Section Model</h4>
          <p style={{ opacity: 0.6, fontSize: "0.8rem", lineHeight: 1.6, margin: "0 0 16px", maxWidth: 720 }}>
            Procedurally generated from corridor domain knowledge: tunnel bore at −12.5 ft, metabolic trunk
            (teal basalt-composite conduit), dual retaining walls, tapered viaduct columns, deck, and
            bowed basalt exosystem cap. 13 named components. Built via SketchUp MCP from CCL geometry data.
          </p>
          <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
            <img
              src="https://api.sketchup.com/mcp/v1/sketchup/dl/16a9c860-a920-4f54-a85d-1a32db37cd33/002-save/philadelphia_city_branch_corridor.skp.thumbnail.png?t=PGofl4KO_MoZdNj01UiZBQ"
              alt="Philadelphia City Branch corridor SketchUp model thumbnail"
              style={{ width: 320, height: "auto", borderRadius: 8, border: "1px solid rgba(93,255,139,0.2)", display: "block" }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "Tunnel Shell", note: "Concrete outer bore, R=11ft, at −12.5 ft below grade" },
                { label: "Metabolic Trunk", note: "Teal basalt-composite conduit — compute + thermal spine" },
                { label: "Access Shaft", note: "Vertical green shaft from grade to tunnel" },
                { label: "Cut Retaining Walls", note: "Left and right walls flanking the at-grade trench" },
                { label: "Viaduct Columns", note: "Tapered west + east columns rising 31 ft above deck" },
                { label: "Viaduct Deck", note: "Civic promenade surface at +31 ft" },
                { label: "Basalt Exosystem Cap", note: "Bowed structural cap at +35.5 ft — crown 6 ft above deck" },
              ].map(item => (
                <div key={item.label} style={{ display: "flex", gap: 8, fontSize: "0.74rem" }}>
                  <span style={{ color: "var(--lime)", flexShrink: 0 }}>·</span>
                  <span><strong>{item.label}</strong> <span style={{ opacity: 0.5 }}>— {item.note}</span></span>
                </div>
              ))}
              <a
                href="https://api.sketchup.com/mcp/v1/sketchup/dl/16a9c860-a920-4f54-a85d-1a32db37cd33/002-save/philadelphia_city_branch_corridor.skp?t=ILrobjOnAe9hTo-6udag9w"
                className="button"
                style={{ marginTop: 8, display: "inline-flex", width: "fit-content", color: "var(--lime)", borderColor: "rgba(93,255,139,0.3)", background: "rgba(93,255,139,0.06)", fontSize: "0.78rem" }}
              >
                Download .skp model →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Flow */}
      <section className="route-grid" style={{ marginTop: "1.5rem" }}>
        <div className="card" style={{ gridColumn: "1 / -1" }}>
          <div className="eyebrow">Demo Flow — 5 steps for judges</div>
          <h4 style={{ margin: "4px 0 20px" }}>Start anywhere, but this sequence tells the full story</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {DEMO_STEPS.map(step => (
              <div key={step.step} style={{
                display: "flex", gap: 14, padding: "14px 16px",
                background: "rgba(255,255,255,0.02)", borderRadius: 8,
                alignItems: "flex-start",
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: "rgba(18,247,255,0.1)", border: "1px solid rgba(18,247,255,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.72rem", fontWeight: 700, color: "var(--teal)",
                  flexShrink: 0, marginTop: 2,
                }}>
                  {step.step}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>{step.label}</span>
                    <Link href={step.href} style={{ fontSize: "0.65rem", color: "var(--teal)", border: "1px solid rgba(18,247,255,0.3)", padding: "2px 10px", borderRadius: 999, textDecoration: "none" }}>
                      Open →
                    </Link>
                  </div>
                  <p style={{ margin: 0, fontSize: "0.78rem", opacity: 0.65, lineHeight: 1.6 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why this matters */}
      <section className="route-grid" style={{ marginTop: "1.5rem" }}>
        <div className="card" style={{ gridColumn: "span 6" }}>
          <div className="eyebrow">What makes this different</div>
          <h4>Domain fusion, not prompt wrapping</h4>
          <p style={{ opacity: 0.7, lineHeight: 1.7, margin: "8px 0 0" }}>
            The VILM doesn't wrap Claude with a corridor description. The typed CCL engine —
            proof gates, anchor state machines, flood constraints, scenario graphs — is the
            substrate. Claude is fused into it so that every inference is corridor-aware at
            the data-structure level, not just the prompt level.
          </p>
        </div>
        <div className="card" style={{ gridColumn: "span 6" }}>
          <div className="eyebrow">The proof case</div>
          <h4>Philadelphia City Branch / Reading Viaduct</h4>
          <p style={{ opacity: 0.7, lineHeight: 1.7, margin: "8px 0 0" }}>
            A real, dormant corridor with a real activation problem. Every proof gate,
            every anchor, every flood constraint, every capital trigger in the VILM is
            grounded in the actual Philadelphia City Branch geometry, ownership structure,
            and infrastructure reuse logic. This is not a demo scenario — it is the scenario.
          </p>
        </div>
      </section>

    </main>
  )
}
