import { initialHandshake } from "@/lib/ccl"
import { VisualQuery } from "@/components/visual-query"
import { PipelineStats } from "@/components/pipeline-stats"
import { VilmChat } from "@/components/vilm-chat"

const pillars = [
  {
    title: "Logic Core",
    body: "CCL holds the corridor-specific ontology: scenario logic, proof gates, metabolic constraints, and over/under infrastructure reasoning.",
  },
  {
    title: "Spatial Surface",
    body: "Corridor Studio turns that logic into a navigable operator and investor interface rather than leaving it buried in specs.",
  },
  {
    title: "Deployable Shell",
    body: "Next.js and Vercel provide routes, previews, APIs, and product structure without replacing the corridor thesis.",
  },
  {
    title: "Language Layer",
    body: "The model layer translates, plans, narrates proof, and keeps the whole stack coherent across technical and strategic contexts.",
  },
]

export default function VilmPage() {
  return (
    <main className="page">
      <section className="route-grid">
        <div className="card" style={{ gridColumn: "1 / -1" }}>
          <div className="eyebrow">VILM</div>
          <h3>Vertically Integrated Language Model</h3>
          <p>
            A domain-fused intelligence stack for urban infrastructure corridors. Not a chatbot wrapper —
            corridor logic, proof states, spatial geometry, visual design language, and investor translation
            surfaces are all wired into the same typed engine.
          </p>
        </div>

        {pillars.map((pillar) => (
          <div key={pillar.title} className="state-card">
            <h4>{pillar.title}</h4>
            <p>{pillar.body}</p>
          </div>
        ))}
      </section>

      {/* VILM live chat — domain-fused AI over corridor state */}
      <section className="route-grid" style={{ marginTop: "1.5rem" }}>
        <VilmChat />
      </section>

      {/* Visual intelligence query — searchable RAG across 981 classified images */}
      <section className="route-grid" style={{ marginTop: "1.5rem" }}>
        <VisualQuery />
      </section>

      {/* Pipeline stats + engine handshake */}
      <section className="route-grid" style={{ marginTop: "1.5rem" }}>
        <PipelineStats />

        <div className="card">
          <div className="eyebrow">Live Engine Handshake</div>
          <p>
            Mission <strong>{initialHandshake.mission}</strong> · segment{" "}
            <strong>{initialHandshake.segment.segmentLabel}</strong> · scenario{" "}
            <strong>{initialHandshake.segment.scenario}</strong>
          </p>
          <pre className="code-block" style={{ fontSize: "0.7rem" }}>
            {JSON.stringify(initialHandshake, null, 2)}
          </pre>
        </div>
      </section>
    </main>
  )
}
