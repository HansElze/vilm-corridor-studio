"use client"

import { useEffect, useRef, useState } from "react"
import {
  loadManifest,
  searchImages,
  imageUrl,
  type ImageEntry,
  type ImageManifest,
} from "@/lib/image-rag"

const QUICK_FILTERS: { label: string; query: string }[] = [
  { label: "Viaduct",    query: "elevated civic viaduct" },
  { label: "Tunnel",     query: "underground infrastructure tunnel" },
  { label: "Trench",     query: "biophilic trench" },
  { label: "Concourse",  query: "concourse interior" },
  { label: "Basalt",     query: "basalt material" },
  { label: "Parametric", query: "parametric structure rib" },
  { label: "Reuse",      query: "industrial reuse" },
  { label: "Biophilic",  query: "biophilic integration greenery" },
]

function ImageAnalysisPanel({
  entry,
  onClose,
}: {
  entry: ImageEntry
  onClose: () => void
}) {
  const [analysis, setAnalysis] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setAnalysis("")
    setLoading(true)
    fetch(`/api/analyze-image?file=${encodeURIComponent(entry.filename)}`)
      .then(async (res) => {
        if (!res.body) throw new Error("no stream")
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let text = ""
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          text += decoder.decode(value, { stream: true })
          setAnalysis(text)
        }
        setLoading(false)
      })
      .catch(() => {
        setAnalysis("Analysis unavailable.")
        setLoading(false)
      })
  }, [entry.filename])

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.75)",
      zIndex: 100,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
    }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--bg-soft, #0a1822)",
          border: "1px solid rgba(18,247,255,0.15)",
          borderRadius: 8,
          maxWidth: 640,
          width: "100%",
          overflow: "hidden",
          boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={imageUrl(entry)}
          alt={entry.description}
          style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", display: "block" }}
        />
        <div style={{ padding: "16px 20px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: 2 }}>VILM Vision Analysis</div>
              <div className="pill-row">
                <span className="pill" style={{ fontSize: "0.65rem" }}>{entry.layer}</span>
                {entry.categories[0] && <span className="pill" style={{ fontSize: "0.65rem" }}>{entry.categories[0]}</span>}
              </div>
            </div>
            <button className="pill" style={{ cursor: "pointer", fontSize: "0.7rem" }} onClick={onClose}>
              close ✕
            </button>
          </div>
          <p style={{ fontSize: "0.82rem", opacity: 0.7, margin: "0 0 10px", lineHeight: 1.4 }}>
            {entry.description}
          </p>
          <div style={{
            padding: "12px 14px",
            background: "rgba(18,247,255,0.04)",
            borderRadius: 4,
            border: "1px solid rgba(18,247,255,0.1)",
            minHeight: 80,
          }}>
            <div style={{ fontSize: "0.65rem", opacity: 0.4, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
              Claude Haiku Vision · Corridor Context
            </div>
            <p style={{ margin: 0, fontSize: "0.82rem", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
              {analysis || (loading ? "▍" : "No analysis.")}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function VisualQuery() {
  const [manifest, setManifest] = useState<ImageManifest | null>(null)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<ImageEntry[]>([])
  const [selected, setSelected] = useState<ImageEntry | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadManifest().then(setManifest)
  }, [])

  useEffect(() => {
    if (!manifest || !query.trim()) { setResults([]); return }
    setResults(searchImages(manifest, query, 12))
  }, [manifest, query])

  function runQuery(q: string) {
    setQuery(q)
    inputRef.current?.focus()
  }

  return (
    <>
      {selected && (
        <ImageAnalysisPanel entry={selected} onClose={() => setSelected(null)} />
      )}

      <div className="card" style={{ gridColumn: "1 / -1" }}>
        <div className="eyebrow">Visual Intelligence Query</div>
        <h4 style={{ margin: "4px 0 12px" }}>Search 981 classified architectural references — click any image for VILM vision analysis</h4>

        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="basalt tunnel compute layer, biophilic trench, elevated civic..."
            style={{
              flex: 1,
              background: "rgba(18,247,255,0.05)",
              border: "1px solid rgba(18,247,255,0.2)",
              borderRadius: 4,
              padding: "8px 12px",
              color: "var(--text)",
              fontFamily: "inherit",
              fontSize: "0.85rem",
            }}
          />
          {query && (
            <button className="button" onClick={() => setQuery("")}>Clear</button>
          )}
        </div>

        <div className="pill-row" style={{ marginBottom: 16 }}>
          {QUICK_FILTERS.map((f) => (
            <button
              key={f.label}
              className={`pill ${query === f.query ? "active" : ""}`}
              style={{ cursor: "pointer", background: query === f.query ? "rgba(18,247,255,0.15)" : undefined }}
              onClick={() => runQuery(query === f.query ? "" : f.query)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {!manifest && (
          <p style={{ opacity: 0.6 }}>Loading image library...</p>
        )}

        {manifest && !query && (
          <p style={{ opacity: 0.5, fontSize: "0.85rem" }}>
            {manifest.totalImages} images indexed — type a corridor concept or use a quick filter above.
          </p>
        )}

        {results.length > 0 && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: 8,
          }}>
            {results.map((entry) => (
              <div
                key={entry.filename}
                style={{ display: "flex", flexDirection: "column", gap: 4, cursor: "pointer" }}
                onClick={() => setSelected(entry)}
                title="Click to analyze with VILM vision"
              >
                <div style={{ position: "relative" }}>
                  <img
                    src={imageUrl(entry)}
                    alt={entry.description}
                    style={{
                      width: "100%",
                      aspectRatio: "4 / 3",
                      objectFit: "cover",
                      borderRadius: 4,
                      background: "#0a1a22",
                      display: "block",
                      transition: "opacity 0.15s",
                    }}
                    loading="lazy"
                  />
                  <div style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 4,
                    background: "rgba(18,247,255,0.0)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: 0,
                    transition: "opacity 0.15s",
                  }}
                    className="img-hover-overlay"
                  >
                    <span style={{ fontSize: "0.7rem", color: "var(--teal)", fontWeight: 600 }}>Analyze ↗</span>
                  </div>
                  <div className="pill-row" style={{ position: "absolute", bottom: 4, left: 4, gap: 3 }}>
                    <span className="pill" style={{ fontSize: "0.6rem", padding: "1px 5px" }}>{entry.layer}</span>
                  </div>
                </div>
                <p style={{ fontSize: "0.68rem", opacity: 0.6, margin: 0, lineHeight: 1.3 }}>
                  {entry.description}
                </p>
              </div>
            ))}
          </div>
        )}

        {manifest && query && results.length === 0 && (
          <p style={{ opacity: 0.5, fontSize: "0.85rem" }}>No matches — try different terms.</p>
        )}
      </div>
    </>
  )
}
