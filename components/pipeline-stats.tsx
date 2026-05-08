"use client"

import { useEffect, useState } from "react"
import { loadManifest, categoryStats, type ImageManifest } from "@/lib/image-rag"

const CATEGORY_LABELS: Record<string, string> = {
  "elevated-civic":             "Elevated Civic",
  "biophilic-trench":           "Biophilic Trench",
  "underground-infrastructure": "Underground Infrastructure",
  "concourse-interior":         "Concourse Interior",
  "basalt-material":            "Basalt Material",
  "parametric-structure":       "Parametric Structure",
  "industrial-reuse":           "Industrial Reuse",
  "biophilic-integration":      "Biophilic Integration",
}

export function PipelineStats() {
  const [manifest, setManifest] = useState<ImageManifest | null>(null)

  useEffect(() => {
    loadManifest().then(setManifest)
  }, [])

  if (!manifest) return (
    <div className="card">
      <div className="eyebrow">AMD Pipeline</div>
      <p style={{ opacity: 0.5 }}>Loading stats...</p>
    </div>
  )

  const stats = categoryStats(manifest)
  const maxCount = Math.max(...Object.values(stats))
  const indexedAt = new Date(manifest.indexedAt).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  })

  return (
    <div className="card">
      <div className="eyebrow">AMD GPU-Accelerated Visual Pipeline</div>
      <h4 style={{ margin: "4px 0 4px" }}>{manifest.totalImages} images classified</h4>
      <p style={{ opacity: 0.5, fontSize: "0.75rem", margin: "0 0 16px" }}>
        Claude Haiku vision · batched inference · indexed {indexedAt}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {Object.entries(stats)
          .sort((a, b) => b[1] - a[1])
          .map(([cat, count]) => (
            <div key={cat}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", marginBottom: 2 }}>
                <span style={{ opacity: 0.8 }}>{CATEGORY_LABELS[cat] ?? cat}</span>
                <span style={{ opacity: 0.5 }}>{count}</span>
              </div>
              <div style={{ height: 4, background: "rgba(18,247,255,0.08)", borderRadius: 2 }}>
                <div style={{
                  height: "100%",
                  width: `${(count / maxCount) * 100}%`,
                  background: "var(--teal)",
                  borderRadius: 2,
                  opacity: 0.7,
                }} />
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}
