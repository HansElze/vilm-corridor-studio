/**
 * index-image-library.ts
 * One-time indexing pass: classifies every image in the RAG folder
 * using Claude Haiku vision and writes public/image-manifest.json.
 *
 * Run:  npm run index-images
 * Resume: safe to re-run — already-indexed filenames are skipped.
 *
 * Requires: ANTHROPIC_API_KEY in environment or .env.local
 */

import Anthropic from "@anthropic-ai/sdk"
import fs from "fs"
import path from "path"

// Load .env.local so the script works without shell env setup
;(function loadEnvLocal() {
  const envPath = path.join(process.cwd(), ".env.local")
  if (!fs.existsSync(envPath)) return
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const eq = line.indexOf("=")
    if (eq < 1) continue
    const key = line.slice(0, eq).trim()
    const val = line.slice(eq + 1).trim()
    if (key && !(key in process.env)) process.env[key] = val
  }
})()

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const RAG_DIR =
  process.env.RAG_IMAGE_DIR ??
  "C:/Users/dvdel/OneDrive/Desktop/architectural RAG for Multi-Model Model"

const MANIFEST_PATH = path.join(process.cwd(), "public", "image-manifest.json")
const BATCH_SIZE = 5
const DELAY_MS = 800  // between batches — stays under Haiku rate limit

const SUPPORTED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"])

// ---------------------------------------------------------------------------
// Types (duplicated here so the script has no lib imports)
// ---------------------------------------------------------------------------

type ImageCategory =
  | "elevated-civic"
  | "biophilic-trench"
  | "underground-infrastructure"
  | "concourse-interior"
  | "basalt-material"
  | "parametric-structure"
  | "industrial-reuse"
  | "biophilic-integration"

type MaterialClass =
  | "basalt-composite" | "light-oak" | "structural-glass"
  | "historic-stone" | "weathered-iron"

type StructuralForm =
  | "parametric-rib" | "exoskeleton-nervous-system" | "metabolic-node"
  | "vaulted-shell" | "open-trench" | "elevated-viaduct"

type BiophilicElement =
  | "cascading-greenery" | "vertical-living-wall" | "natural-light-well"
  | "planted-alcove" | "terrace-planting"

type LightingMood =
  | "golden-hour" | "urban-morning" | "ambient-led-trail"
  | "textural-side-light" | "daylight-shaft"

type CorridorLayer = "over" | "at-grade" | "under"

export type ImageEntry = {
  filename: string
  categories: ImageCategory[]
  materials: MaterialClass[]
  structuralForms: StructuralForm[]
  biophilicElements: BiophilicElement[]
  lightingMoods: LightingMood[]
  layer: CorridorLayer
  description: string
}

type ImageManifest = {
  version: "1.0"
  indexedAt: string
  ragDir: string
  totalImages: number
  images: ImageEntry[]
}

// ---------------------------------------------------------------------------
// Classification prompt
// ---------------------------------------------------------------------------

const CLASSIFICATION_PROMPT = `
You are classifying architectural reference images for the Cuttlefish Labs Over/Under corridor project.
The project is an urban infrastructure proposal for Philadelphia combining elevated viaducts, open-air trenches, and underground tunnels.

For EACH image (labelled Image 1, Image 2, etc.), classify using ONLY the exact string values listed below.

categories — pick 1-3 that best describe the primary subject:
  "elevated-civic"            viaduct, elevated promenade, rooftop public realm
  "biophilic-trench"          open-air cut or trench with ecology and planting
  "underground-infrastructure" tunnel, underground space, subsurface infrastructure
  "concourse-interior"        transit hall, civic interior, station concourse
  "basalt-material"           dark matte stone, tectonic composite panels, rough textured surfaces
  "parametric-structure"      ribs, exoskeleton forms, flowing structural geometry
  "industrial-reuse"          adaptive reuse of historic rail, factory, or industrial shells
  "biophilic-integration"     greenery or planting embedded into architecture (walls, floors, structure)

materials — pick any that visibly appear:
  "basalt-composite"  "light-oak"  "structural-glass"  "historic-stone"  "weathered-iron"

structuralForms — pick any that visibly appear:
  "parametric-rib"  "exoskeleton-nervous-system"  "metabolic-node"
  "vaulted-shell"   "open-trench"                 "elevated-viaduct"

biophilicElements — pick any that visibly appear:
  "cascading-greenery"  "vertical-living-wall"  "natural-light-well"
  "planted-alcove"      "terrace-planting"

lightingMoods — pick the closest match:
  "golden-hour"  "urban-morning"  "ambient-led-trail"  "textural-side-light"  "daylight-shaft"

layer — pick one based on where in the Over/Under stack this image belongs:
  "over"     above-grade civic / elevated structures
  "at-grade" ground-level, trench, concourse, transitional spaces
  "under"    below-grade tunnel, underground, subsurface

Return ONLY a valid JSON array — no markdown, no explanation. One object per image in order:
[
  {
    "index": 0,
    "categories": ["..."],
    "materials": ["..."],
    "structuralForms": ["..."],
    "biophilicElements": ["..."],
    "lightingMoods": ["..."],
    "layer": "...",
    "description": "10-word description of the image"
  }
]
`.trim()

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function mediaType(filename: string): "image/jpeg" | "image/png" | "image/webp" {
  const ext = path.extname(filename).toLowerCase()
  if (ext === ".png") return "image/png"
  if (ext === ".webp") return "image/webp"
  return "image/jpeg"
}

function loadManifest(): ImageManifest {
  if (fs.existsSync(MANIFEST_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8")) as ImageManifest
    } catch {
      // corrupt manifest — start fresh
    }
  }
  return { version: "1.0", indexedAt: "", ragDir: RAG_DIR, totalImages: 0, images: [] }
}

function saveManifest(manifest: ImageManifest) {
  fs.mkdirSync(path.dirname(MANIFEST_PATH), { recursive: true })
  manifest.indexedAt = new Date().toISOString()
  manifest.totalImages = manifest.images.length
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), "utf-8")
}

async function classifyBatch(
  filenames: string[],
  client: Anthropic,
): Promise<(Omit<ImageEntry, "filename"> | null)[]> {
  // Build content array: [image1, "Image 1:", image2, "Image 2:", ..., prompt]
  const content: Anthropic.MessageParam["content"] = []

  for (let i = 0; i < filenames.length; i++) {
    const filepath = path.join(RAG_DIR, filenames[i])
    const data = fs.readFileSync(filepath).toString("base64")
    content.push({
      type: "image",
      source: { type: "base64", media_type: mediaType(filenames[i]), data },
    })
    content.push({ type: "text", text: `Image ${i + 1}:` })
  }

  content.push({ type: "text", text: CLASSIFICATION_PROMPT })

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    messages: [{ role: "user", content }],
  })

  const raw = message.content.find((b) => b.type === "text")?.text ?? ""

  // Strip any accidental markdown fences
  const jsonText = raw.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim()

  let parsed: { index: number; categories: string[]; materials: string[]; structuralForms: string[]; biophilicElements: string[]; lightingMoods: string[]; layer: string; description: string }[]
  try {
    parsed = JSON.parse(jsonText)
  } catch {
    console.warn("  JSON parse failed for batch, skipping")
    return filenames.map(() => null)
  }

  return filenames.map((_, i) => {
    const item = parsed.find((p) => p.index === i)
    if (!item) return null
    return {
      categories: (item.categories ?? []) as ImageCategory[],
      materials: (item.materials ?? []) as MaterialClass[],
      structuralForms: (item.structuralForms ?? []) as StructuralForm[],
      biophilicElements: (item.biophilicElements ?? []) as BiophilicElement[],
      lightingMoods: (item.lightingMoods ?? []) as LightingMood[],
      layer: (item.layer ?? "at-grade") as CorridorLayer,
      description: item.description ?? "",
    }
  })
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.error("ANTHROPIC_API_KEY is not set. Add it to .env.local or your shell environment.")
    process.exit(1)
  }

  if (!fs.existsSync(RAG_DIR)) {
    console.error(`RAG directory not found: ${RAG_DIR}`)
    process.exit(1)
  }

  const client = new Anthropic({ apiKey })
  const manifest = loadManifest()
  const indexed = new Set(manifest.images.map((e) => e.filename))

  const allFiles = fs
    .readdirSync(RAG_DIR)
    .filter((f) => SUPPORTED_EXTENSIONS.has(path.extname(f).toLowerCase()))
    .sort()

  const MAX_BYTES = 4 * 1024 * 1024 // 4 MB — skip oversized images
  const toIndex = allFiles.filter((f) => {
    if (indexed.has(f)) return false
    const size = fs.statSync(path.join(RAG_DIR, f)).size
    if (size > MAX_BYTES) { console.warn(`  Skipping ${f} (${(size / 1024 / 1024).toFixed(1)} MB > 4 MB limit)`) ; return false }
    return true
  })

  console.log(`\nRAG directory : ${RAG_DIR}`)
  console.log(`Total images  : ${allFiles.length}`)
  console.log(`Already indexed: ${indexed.size}`)
  console.log(`To index now  : ${toIndex.length}\n`)

  if (toIndex.length === 0) {
    console.log("Nothing to do. Manifest is up to date.")
    return
  }

  const batches: string[][] = []
  for (let i = 0; i < toIndex.length; i += BATCH_SIZE) {
    batches.push(toIndex.slice(i, i + BATCH_SIZE))
  }

  let done = 0
  let failed = 0

  for (let b = 0; b < batches.length; b++) {
    const batch = batches[b]
    process.stdout.write(
      `Batch ${b + 1}/${batches.length} (${done + indexed.size}/${allFiles.length} done)... `,
    )

    try {
      const results = await classifyBatch(batch, client)
      for (let i = 0; i < batch.length; i++) {
        const result = results[i]
        if (result) {
          manifest.images.push({ filename: batch[i], ...result })
          done++
        } else {
          failed++
        }
      }
      // Save after every batch so progress survives a crash
      saveManifest(manifest)
      console.log("ok")
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.warn(`error: ${msg}`)
      failed += batch.length
    }

    if (b < batches.length - 1) await sleep(DELAY_MS)
  }

  console.log(`\nDone. Indexed: ${done}  Failed/skipped: ${failed}`)
  console.log(`Manifest: ${MANIFEST_PATH}`)
  console.log(`Total entries: ${manifest.images.length}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
