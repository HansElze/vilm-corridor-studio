/**
 * image-rag.ts
 * Manifest loader and lookup functions for the visual RAG layer.
 * Loaded lazily — if the manifest doesn't exist yet, all lookups return [].
 */

import type { VisualSurface, ImageCategory, CorridorLayer } from "./visual-surface"

// ---------------------------------------------------------------------------
// Types (must stay in sync with the indexing script)
// ---------------------------------------------------------------------------

export type ImageEntry = {
  filename: string
  categories: ImageCategory[]
  materials: string[]
  structuralForms: string[]
  biophilicElements: string[]
  lightingMoods: string[]
  layer: CorridorLayer
  description: string
}

export type ImageManifest = {
  version: "1.0"
  indexedAt: string
  ragDir: string
  totalImages: number
  images: ImageEntry[]
}

// ---------------------------------------------------------------------------
// Manifest loading (client-safe — fetches /image-manifest.json)
// ---------------------------------------------------------------------------

let _manifest: ImageManifest | null = null
let _loadPromise: Promise<ImageManifest | null> | null = null

export async function loadManifest(): Promise<ImageManifest | null> {
  if (_manifest) return _manifest
  if (_loadPromise) return _loadPromise

  _loadPromise = fetch("/image-manifest.json")
    .then((res) => {
      if (!res.ok) return null
      return res.json() as Promise<ImageManifest>
    })
    .then((data) => {
      _manifest = data
      return data
    })
    .catch(() => null)

  return _loadPromise
}

/** Synchronous access — only valid after loadManifest() has resolved. */
export function getManifest(): ImageManifest | null {
  return _manifest
}

// ---------------------------------------------------------------------------
// Lookup functions
// ---------------------------------------------------------------------------

/**
 * Returns up to `limit` images whose categories overlap with the surface's
 * imageCategories, ranked by number of matching categories.
 */
export function getImagesForSurface(
  manifest: ImageManifest,
  surface: VisualSurface,
  limit = 8,
): ImageEntry[] {
  return getImagesForCategories(manifest, surface.imageCategories, limit)
}

/**
 * Returns up to `limit` images ranked by number of matching categories.
 */
export function getImagesForCategories(
  manifest: ImageManifest,
  categories: ImageCategory[],
  limit = 8,
): ImageEntry[] {
  if (categories.length === 0) return []
  const targetSet = new Set<string>(categories)

  const scored = manifest.images
    .map((entry) => ({
      entry,
      score: entry.categories.filter((c) => targetSet.has(c)).length,
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)

  return scored.slice(0, limit).map(({ entry }) => entry)
}

/**
 * Returns up to `limit` images for a specific corridor layer.
 */
export function getImagesForLayer(
  manifest: ImageManifest,
  layer: CorridorLayer,
  limit = 8,
): ImageEntry[] {
  return manifest.images.filter((e) => e.layer === layer).slice(0, limit)
}

/**
 * URL for serving an image entry through the local dev API route.
 */
export function imageUrl(entry: ImageEntry): string {
  return `/api/rag-image?file=${encodeURIComponent(entry.filename)}`
}

/**
 * Free-text search across category, material, form, mood, layer, and description fields.
 * Tokens are scored independently; results ranked by total score.
 */
export function searchImages(
  manifest: ImageManifest,
  query: string,
  limit = 12,
): ImageEntry[] {
  const tokens = query.toLowerCase().split(/\s+/).filter((t) => t.length > 1)
  if (tokens.length === 0) return []

  const scored = manifest.images.map((entry) => {
    let score = 0
    for (const token of tokens) {
      if (entry.categories.some((c) => c.includes(token)))          score += 4
      if (entry.materials.some((m) => m.includes(token)))           score += 2
      if (entry.structuralForms.some((f) => f.includes(token)))     score += 2
      if (entry.biophilicElements.some((b) => b.includes(token)))   score += 2
      if (entry.lightingMoods.some((l) => l.includes(token)))       score += 2
      if (entry.layer.includes(token))                               score += 1
      if (entry.description.toLowerCase().includes(token))          score += 1
    }
    return { entry, score }
  })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)

  return scored.slice(0, limit).map(({ entry }) => entry)
}

/** Category counts across the full manifest — for stats display. */
export function categoryStats(manifest: ImageManifest): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const entry of manifest.images) {
    for (const cat of entry.categories) {
      counts[cat] = (counts[cat] ?? 0) + 1
    }
  }
  return counts
}
