"use client"

import { useState } from "react"
import { WORLD_LABS_SCENES, type WorldLabsScene, type CorridorLayer } from "@/lib/visual-surface"

const LAYER_COLOR: Record<CorridorLayer, string> = {
  "over":     "var(--teal)",
  "at-grade": "#7ef7a0",
  "under":    "#7eb4f7",
}

const LAYER_LABEL: Record<CorridorLayer, string> = {
  "over":     "Over-Layer",
  "at-grade": "At-Grade",
  "under":    "Under-Layer",
}

const ANCHOR_LABEL: Record<string, string> = {
  "east-viaduct":    "East Viaduct",
  "cut-section":     "Central Cut",
  "west-tunnel":     "West Tunnel",
  "pilot-node-30th": "30th St Node",
}

function SceneCard({ scene, active, onSelect }: { scene: WorldLabsScene; active: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      style={{
        display: "flex",
        flexDirection: "column",
        background: active ? "rgba(18,247,255,0.06)" : "rgba(255,255,255,0.02)",
        border: `1px solid ${active ? "rgba(18,247,255,0.35)" : "rgba(255,255,255,0.07)"}`,
        borderRadius: 12,
        overflow: "hidden",
        textDecoration: "none",
        color: "inherit",
        transition: "border-color 0.2s, transform 0.2s",
        cursor: "pointer",
        textAlign: "left",
        padding: 0,
        width: "100%",
      }}
    >
      {/* Visual placeholder keyed to layer */}
      <div style={{
        aspectRatio: "16/9",
        background: `linear-gradient(135deg, rgba(4,16,24,1) 0%, ${LAYER_COLOR[scene.layer]}22 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderBottom: `1px solid ${LAYER_COLOR[scene.layer]}22`,
        position: "relative",
      }}>
        <span style={{
          fontSize: "0.65rem",
          textTransform: "uppercase",
          letterSpacing: "0.15em",
          color: LAYER_COLOR[scene.layer],
          opacity: active ? 1 : 0.7,
        }}>
          {active ? "● Embedded" : "Click to embed"}
        </span>
        <div style={{ position: "absolute", top: 8, left: 8, display: "flex", gap: 4 }}>
          <span style={{
            fontSize: "0.6rem", padding: "2px 7px", borderRadius: 999,
            border: `1px solid ${LAYER_COLOR[scene.layer]}44`,
            color: LAYER_COLOR[scene.layer],
            background: `${LAYER_COLOR[scene.layer]}11`,
            textTransform: "uppercase", letterSpacing: "0.1em",
          }}>
            {LAYER_LABEL[scene.layer]}
          </span>
          <span style={{
            fontSize: "0.6rem", padding: "2px 7px", borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.4)",
            textTransform: "uppercase", letterSpacing: "0.1em",
          }}>
            {scene.mode}
          </span>
        </div>
      </div>

      <div style={{ padding: "12px 14px 14px" }}>
        <div style={{ fontSize: "0.65rem", opacity: 0.4, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>
          {ANCHOR_LABEL[scene.anchorId] ?? scene.anchorId}
        </div>
        <div style={{ fontSize: "0.82rem", fontWeight: 600, marginBottom: 6, lineHeight: 1.3 }}>
          {scene.label}
        </div>
        <p style={{ margin: 0, fontSize: "0.72rem", opacity: 0.55, lineHeight: 1.5 }}>
          {scene.oneLineSummary}
        </p>
      </div>
    </button>
  )
}

function SceneEmbed({ scene, onClose }: { scene: WorldLabsScene; onClose: () => void }) {
  const [embedFailed, setEmbedFailed] = useState(false)

  return (
    <div style={{
      borderRadius: 14,
      overflow: "hidden",
      border: "1px solid rgba(18,247,255,0.25)",
      background: "#050b11",
      marginBottom: 24,
    }}>
      {/* Embed header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
        borderBottom: "1px solid rgba(18,247,255,0.1)",
        background: "rgba(4,16,24,0.8)",
      }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: LAYER_COLOR[scene.layer] }} />
        <span style={{ fontSize: "0.72rem", fontWeight: 600, flex: 1 }}>{scene.label}</span>
        <span style={{ fontSize: "0.65rem", opacity: 0.4, textTransform: "uppercase", letterSpacing: "0.1em" }}>
          {ANCHOR_LABEL[scene.anchorId]} · {LAYER_LABEL[scene.layer]}
        </span>
        <a
          href={scene.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          style={{ fontSize: "0.68rem", color: "var(--teal)", textDecoration: "none", padding: "3px 10px", borderRadius: 999, border: "1px solid rgba(18,247,255,0.3)", marginLeft: 8 }}
        >
          Open ↗
        </a>
        <button
          type="button"
          onClick={onClose}
          style={{
            background: "none", border: "none", color: "rgba(255,255,255,0.35)",
            cursor: "pointer", fontSize: "1rem", lineHeight: 1, padding: "0 4px",
          }}
        >
          ✕
        </button>
      </div>

      {/* iframe */}
      {!embedFailed ? (
        <div style={{ position: "relative", width: "100%", aspectRatio: "16/7" }}>
          <iframe
            src={scene.url}
            title={scene.label}
            allow="fullscreen"
            style={{ width: "100%", height: "100%", border: 0, display: "block" }}
            onError={() => setEmbedFailed(true)}
          />
        </div>
      ) : (
        <div style={{
          aspectRatio: "16/7", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 10,
          background: "rgba(4,16,24,0.6)",
        }}>
          <span style={{ fontSize: "0.8rem", opacity: 0.5 }}>Embed blocked by World Labs. Open in new tab to view.</span>
          <a
            href={scene.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: "0.78rem", color: "var(--teal)", border: "1px solid rgba(18,247,255,0.35)", padding: "6px 16px", borderRadius: 999, textDecoration: "none" }}
          >
            Open in World Labs ↗
          </a>
        </div>
      )}
    </div>
  )
}

export function WorldLabsGallery() {
  const [activeScene, setActiveScene] = useState<WorldLabsScene | null>(null)

  const byAnchor: Record<string, WorldLabsScene[]> = {}
  for (const scene of WORLD_LABS_SCENES) {
    if (!byAnchor[scene.anchorId]) byAnchor[scene.anchorId] = []
    byAnchor[scene.anchorId].push(scene)
  }

  const anchorOrder = ["east-viaduct", "cut-section", "west-tunnel", "pilot-node-30th"]

  function handleSelect(scene: WorldLabsScene) {
    setActiveScene(prev => prev?.id === scene.id ? null : scene)
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {/* Embed panel — shown when a scene is selected */}
      {activeScene && (
        <SceneEmbed scene={activeScene} onClose={() => setActiveScene(null)} />
      )}

      {anchorOrder.map(anchorId => {
        const scenes = byAnchor[anchorId]
        if (!scenes?.length) return null
        const layer = scenes[0].layer
        return (
          <div key={anchorId} style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: LAYER_COLOR[layer] }} />
              <span style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.12em", color: LAYER_COLOR[layer] }}>
                {ANCHOR_LABEL[anchorId]}
              </span>
              <span style={{ fontSize: "0.7rem", opacity: 0.35 }}>—</span>
              <span style={{ fontSize: "0.7rem", opacity: 0.35, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                {LAYER_LABEL[layer]}
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
              {scenes.map(scene => (
                <SceneCard
                  key={scene.id}
                  scene={scene}
                  active={activeScene?.id === scene.id}
                  onSelect={() => handleSelect(scene)}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
