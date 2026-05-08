import { getTwinAlphaState } from "@/lib/digital-twin"
import { getTwinAlphaEngineState } from "@/lib/engine/twin-engine"

export default function TwinPage() {
  const twin = getTwinAlphaState()
  const engine = getTwinAlphaEngineState()

  return (
    <main className="page">
      <section className="route-grid">
        <div className="card" style={{ gridColumn: "1 / -1" }}>
          <div className="eyebrow">Digital Twin Modeling</div>
          <h3>Twin Alpha state contract / engine surface</h3>
          <p>
            This route now reads from the canonical Twin Alpha contract instead of acting like a smart presentation layer.
            The object is the source of truth, the API exposes it, and the UI renders structured sections from it.
          </p>
          <div className="pill-row">
            <span className="pill">Scenario {twin.scenario}</span>
            <span className="pill">{twin.segmentLengthMiles} mi pilot</span>
            <span className="pill">Contract {twin.meta.version}</span>
            <span className="pill">Status {twin.meta.rootStatusClass}</span>
            <span className="pill">Engine {engine.corridorHud.activeScenario}</span>
          </div>
        </div>

        <div className="card" style={{ gridColumn: "span 8" }}>
          <div className="eyebrow">Engine Status</div>
          <div className="state-grid">
            {engine.scenarioReadiness.map((scenario) => (
              <div key={scenario.scenario} className="state-card">
                <h4>Scenario {scenario.scenario}</h4>
                <p>
                  <strong>Status:</strong> {scenario.status}
                </p>
                <p>
                  <strong>Readiness:</strong> {scenario.score}/100
                </p>
                <p>
                  <strong>Drivers:</strong> {scenario.drivers.join(" / ")}
                </p>
                <p>
                  <strong>Blockers:</strong> {scenario.blockers.join(" / ")}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ gridColumn: "span 4" }}>
          <div className="eyebrow">HUD Outputs</div>
          <div className="state-card">
            <p>
              <strong>Active anchor:</strong> {engine.corridorHud.activeAnchor}
            </p>
            <p>
              <strong>Primary blocker:</strong> {engine.corridorHud.primaryBlocker}
            </p>
            <p>
              <strong>Lead constraint:</strong> {engine.corridorHud.leadConstraint}
            </p>
            <p>
              <strong>Next unlock:</strong> {engine.corridorHud.nextUnlock}
            </p>
          </div>
        </div>

        <div className="card" style={{ gridColumn: "span 4" }}>
          <div className="eyebrow">Corridor Anchors</div>
          <ul className="bullet-list">
            {twin.anchors.map((anchor) => (
              <li key={anchor.id}>
                <strong>{anchor.label}</strong> / {anchor.kind} / {anchor.evidence} / {anchor.confidenceClass}
              </li>
            ))}
          </ul>
        </div>

        <div className="card" style={{ gridColumn: "span 4" }}>
          <div className="eyebrow">Flood Constraints</div>
          <ul className="bullet-list">
            {twin.floodConstraints.map((flood) => (
              <li key={`${flood.annualChance}-${flood.impact}`}>
                <strong>{flood.annualChance}</strong> / {flood.impact} / {flood.relevance}
              </li>
            ))}
          </ul>
        </div>

        <div className="card" style={{ gridColumn: "span 4" }}>
          <div className="eyebrow">Live Feeds</div>
          <ul className="bullet-list">
            {twin.liveDataFeeds.map((feed) => (
              <li key={feed}>{feed}</li>
            ))}
          </ul>
        </div>

        <div className="card" style={{ gridColumn: "1 / -1" }}>
          <div className="eyebrow">Dependency Graph</div>
          <div className="state-grid">
            {engine.dependencyGraph.map((dependency) => (
              <div key={dependency.id} className="state-card">
                <h4>{dependency.label}</h4>
                <p>
                  <strong>Status:</strong> {dependency.status}
                </p>
                <p>
                  <strong>Kind:</strong> {dependency.kind}
                </p>
                <p>
                  <strong>Referenced by:</strong> {dependency.referencedBy.join(" / ")}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ gridColumn: "span 6" }}>
          <div className="eyebrow">Under Layer</div>
          <h3>{twin.underLayer.currentReadiness} / Scenario A engine core</h3>
          <ul className="bullet-list">
            {twin.underLayer.inheritedAssets.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
            {twin.underLayer.metabolicTrunk.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
            {twin.underLayer.thermalSystem.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="card" style={{ gridColumn: "span 6" }}>
          <div className="eyebrow">Over Layer</div>
          <h3>{twin.overLayer.currentReadiness} / Scenario B/C expansion logic</h3>
          <ul className="bullet-list">
            {twin.overLayer.capStrategy.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
            {twin.overLayer.revenueEnvelope.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
            {twin.overLayer.civicInterface.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="card" style={{ gridColumn: "1 / -1" }}>
          <div className="eyebrow">Proof Burdens</div>
          <div className="state-grid">
            {twin.proofBurdens.map((burden) => (
              <div key={burden.id} className="state-card">
                <h4>{burden.title}</h4>
                <p>
                  <strong>Status:</strong> {burden.currentState} / {burden.rootStatusClass}
                </p>
                <p>{burden.whyItMatters}</p>
                <p>
                  <strong>Blocking risk:</strong> {burden.blockingRisk}
                </p>
                <p>
                  <strong>Next modeling move:</strong> {burden.nextModelingMove}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ gridColumn: "span 6" }}>
          <div className="eyebrow">Translation State</div>
          <div className="state-card">
            <h4>{twin.translationState.rootStatusClass}</h4>
            <p>
              <strong>Operator:</strong> {twin.translationState.operatorNarrative}
            </p>
            <p>
              <strong>Investor:</strong> {twin.translationState.investorNarrative}
            </p>
            <p>
              <strong>Section-first:</strong> {twin.translationState.sectionFirstPresentation}
            </p>
            <p>
              <strong>Next best move:</strong> {twin.translationState.nextBestMove}
            </p>
          </div>
        </div>

        <div className="card" style={{ gridColumn: "span 6" }}>
          <div className="eyebrow">Contract Meta</div>
          <div className="state-card">
            <h4>{twin.meta.contractId}</h4>
            <p>
              <strong>Version:</strong> {twin.meta.version}
            </p>
            <p>
              <strong>Last updated:</strong> {twin.meta.lastUpdated}
            </p>
            <p>
              <strong>Next best move:</strong> {twin.meta.nextBestMove}
            </p>
            <p>
              <strong>Computed unlocks:</strong> {engine.nextUnlocks.join(" / ")}
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
