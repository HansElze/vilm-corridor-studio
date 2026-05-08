"use client"

import { useEffect, useState, useCallback } from "react"
import type { VisualSurface } from "@/lib/visual-surface"
import {
  loadManifest,
  getImagesForSurface,
  imageUrl,
  type ImageEntry,
  type ImageManifest,
} from "@/lib/image-rag"

type Props = {
  surface: VisualSurface | null
  limit?: number
}

export function VisualReferencePanel({ surface, limit = 8 }: Props) {
  const [manifest, setManifest] = useState<ImageManifest | null>(null)
  const [images, setImages] = useState<ImageEntry[]>([])
  const [copied, setCopied] = useState(false)

  const copyPrompt = useCallback(() => {
    if (!surface) return
    navigator.clipboard.writeText(surface.promptFragment).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [surface])

  useEffect(() => {
    loadManifest().then((m) => setManifest(m))
  }, [])

  useEffect(() => {
    if (!manifest || !surface) { setImages([]); return }
    setImages(getImagesForSurface(manifest, surface, limit))
  }, [manifest, surface, limit])

  if (!surface) return null
  if (!manifest) return (
    <div className="workbench-grid">
      <div className="card" style={{ gridColumn: "1 / -1" }}>
        <div className="eyebrow">Visual Reference</div>
        <p>Loading image library...</p>
      </div>
    </div>
  )
  if (images.length === 0) return null

  const layerLabel = surface.layer === "at-grade" ? "At-Grade" :
    surface.layer.charAt(0).toUpperCase() + surface.layer.slice(1)

  return (
    <div className="workbench-grid">
      <div className="card" style={{ gridColumn: "1 / -1" }}>
        <div className="eyebrow">Visual Reference — {layerLabel} Layer</div>

        <div className="pill-row" style={{ marginBottom: 12 }}>
          {surface.primaryMaterials.map((m) => (
            <span key={m} className="pill">{m}</span>
          ))}
          {surface.structuralForms.slice(0, 2).map((f) => (
            <span key={f} className="pill">{f}</span>
          ))}
          {surface.lightingMoods.slice(0, 1).map((l) => (
            <span key={l} className="pill">{l}</span>
          ))}
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: 8,
        }}>
          {images.map((entry) => (
            <div key={entry.filename} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <img
                src={imageUrl(entry)}
                alt={entry.description}
                style={{
                  width: "100%",
                  aspectRatio: "4 / 3",
                  objectFit: "cover",
                  borderRadius: 4,
                  background: "#0a1a22",
                }}
                loading="lazy"
              />
              <p style={{ fontSize: "0.68rem", opacity: 0.6, margin: 0, lineHeight: 1.3 }}>
                {entry.description}
              </p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 16, padding: "10px 12px", background: "rgba(18,247,255,0.04)", borderRadius: 4, border: "1px solid rgba(18,247,255,0.1)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: "0.72rem", opacity: 0.5, textTransform: "uppercase", letterSpacing: "0.05em" }}>World Labs Prompt</span>
            <button
              className="button"
              style={{ fontSize: "0.72rem", padding: "3px 10px" }}
              onClick={copyPrompt}
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <p style={{ fontSize: "0.78rem", fontStyle: "italic", opacity: 0.75, margin: 0, lineHeight: 1.5 }}>
            {surface.promptFragment}
          </p>
        </div>
      </div>
    </div>
  )
}
