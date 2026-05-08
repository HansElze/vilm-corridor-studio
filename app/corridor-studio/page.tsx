"use client"

import { useRef, useState } from "react"
import { getTwinAlphaState } from "@/lib/digital-twin"
import { getTwinAlphaEngineState } from "@/lib/engine/twin-engine"

const twin = getTwinAlphaState()
const engine = getTwinAlphaEngineState()
const leadScenario = engine.scenarioReadiness[0]

export default function CorridorStudioPage() {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [hudVisible, setHudVisible] = useState(true)
  const [presentation, setPresentation] = useState(false)

  function injectStyle(css: string) {
    const doc = iframeRef.current?.contentDocument
    if (!doc) return
    let el = doc.getElementById("__next-inject__") as HTMLStyleElement | null
    if (!el) {
      el = doc.createElement("style")
      el.id = "__next-inject__"
      doc.head.appendChild(el)
    }
    el.textContent = css
  }

  function toggleHud() {
    const next = !hudVisible
    setHudVisible(next)
    if (next) {
      injectStyle("")
    } else {
      injectStyle(".hud-panel { display: none !important; }")
    }
  }

  function togglePresentation() {
    const next = !presentation
    setPresentation(next)
    const win = iframeRef.current?.contentWindow as any
    if (win?.togglePresentationMode) win.togglePresentationMode(next)
  }

  function onLoad() {
    if (!hudVisible) injectStyle(".hud-panel { display: none !important; }")
    if (presentation) {
      const win = iframeRef.current?.contentWindow as any
      if (win?.togglePresentationMode) win.togglePresentationMode(true)
    }
  }

  return (
    <main style={{ padding: "12px 24px", maxWidth: 1440, marginInline: "auto", display: "flex", flexDirection: "column", gap: 10 }}>

      {/* Status + controls strip */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 1 }}>Corridor Studio</div>
          <div style={{ fontSize: "0.78rem", opacity: 0.5 }}>{twin.name}</div>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginLeft: "auto" }}>
          <span className="pill" style={{ fontSize: "0.65rem" }}>Scenario {twin.scenario}</span>
          <span className="pill" style={{ fontSize: "0.65rem" }}>A: {leadScenario.score}/100</span>
          <span className="pill" style={{ fontSize: "0.65rem", color: "#f7c97e", borderColor: "rgba(247,201,126,0.3)" }}>
            ⚠ {engine.corridorHud.primaryBlocker}
          </span>
          <button
            className="pill"
            style={{ cursor: "pointer", color: presentation ? "var(--teal)" : undefined, borderColor: presentation ? "rgba(18,247,255,0.3)" : undefined }}
            onClick={togglePresentation}
          >
            Presentation {presentation ? "ON" : "OFF"}
          </button>
          <button
            className="pill"
            style={{ cursor: "pointer", color: hudVisible ? undefined : "#f7c97e", borderColor: hudVisible ? undefined : "rgba(247,201,126,0.3)" }}
            onClick={toggleHud}
          >
            HUD {hudVisible ? "ON" : "OFF"}
          </button>
        </div>
      </div>

      {/* Map */}
      <div style={{
        height: "calc(100vh - 130px)",
        minHeight: 500,
        borderRadius: 16,
        overflow: "hidden",
        border: "1px solid rgba(18,247,255,0.16)",
        background: "#050b11",
      }}>
        <iframe
          ref={iframeRef}
          src="/prototype/index.html"
          onLoad={onLoad}
          style={{ width: "100%", height: "100%", border: 0, display: "block" }}
          title="Corridor Studio"
        />
      </div>

    </main>
  )
}
