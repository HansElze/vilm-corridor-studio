import { initialHandshake } from "@/lib/ccl"

export default function CclPage() {
  return (
    <main className="page">
      <section className="route-grid">
        <div className="card" style={{ gridColumn: "1 / -1" }}>
          <div className="eyebrow">CCL Handshake</div>
          <h3>Initial typed state objects</h3>
          <p>
            This is the first bridge between the logic engine and the spatial app. It does not pretend the engine is
            already fully wired. It defines the objects that can start replacing manual HUD text without breaking the
            prototype.
          </p>
        </div>

        <div className="card" style={{ gridColumn: "1 / -1" }}>
          <div className="state-grid">
            <div className="state-card">
              <h4>segment</h4>
              <code>{JSON.stringify(initialHandshake.segment, null, 2)}</code>
            </div>
            <div className="state-card">
              <h4>readiness</h4>
              <code>{JSON.stringify(initialHandshake.readiness, null, 2)}</code>
            </div>
          </div>
        </div>

        <div className="card" style={{ gridColumn: "1 / -1" }}>
          <h3>proof gates</h3>
          <div className="state-grid">
            {initialHandshake.proofGates.map((gate) => (
              <div key={gate.id} className="state-card">
                <h4>{gate.label}</h4>
                <code>{JSON.stringify(gate, null, 2)}</code>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
