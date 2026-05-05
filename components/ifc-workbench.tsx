"use client"

import { type ChangeEvent, type MutableRefObject, useEffect, useRef, useState } from "react"
import * as THREE from "three"
import * as OBC from "@thatopen/components"
import { type TwinScenario, getTwinAlphaState } from "@/lib/digital-twin"
import { getTwinAlphaEngineState } from "@/lib/engine/twin-engine"
import { createProceduralCorridorModel, type ProceduralSelectionMeta } from "@/lib/model/procedural-corridor"

type ViewerStatus = "booting" | "ready" | "loading" | "loaded" | "error"
type WorkbenchMode = "procedural" | "ifc"

const twin = getTwinAlphaState()
const engine = getTwinAlphaEngineState()

function clearCurrentModel(currentModelRef: MutableRefObject<THREE.Object3D | null>) {
  if (currentModelRef.current) {
    currentModelRef.current.removeFromParent()
    currentModelRef.current = null
  }
}

function frameObject(world: any, object: THREE.Object3D) {
  const bbox = new THREE.Box3().setFromObject(object)
  if (bbox.isEmpty()) return
  const center = bbox.getCenter(new THREE.Vector3())
  const size = bbox.getSize(new THREE.Vector3())
  const span = Math.max(size.x, size.y, size.z, 12)

  world.camera.controls.setLookAt(
    center.x + span * 1.5,
    center.y + span * 1.1,
    center.z + span * 1.5,
    center.x,
    center.y,
    center.z,
    true,
  )
}

/**
 * Defers frameObject until the container has non-zero dimensions.
 * Uses a ResizeObserver as the primary trigger, with rAF + two timeout
 * safety nets in case the observer fires too late or not at all.
 */
function frameWhenReady(
  world: any,
  object: THREE.Object3D,
  container: HTMLDivElement,
  observerRef: MutableRefObject<ResizeObserver | null>,
) {
  function tryFrame(): boolean {
    if (container.clientWidth > 0 && container.clientHeight > 0) {
      frameObject(world, object)
      return true
    }
    return false
  }

  if (tryFrame()) return

  const observer = new ResizeObserver(() => {
    if (tryFrame()) {
      observer.disconnect()
      if (observerRef.current === observer) observerRef.current = null
    }
  })
  observer.observe(container)
  observerRef.current = observer

  requestAnimationFrame(() => tryFrame())
  setTimeout(() => tryFrame(), 300)
  setTimeout(() => tryFrame(), 800)
}

function getProceduralMeta(object: THREE.Object3D | null): ProceduralSelectionMeta | null {
  let current: THREE.Object3D | null = object

  while (current) {
    const meta = current.userData?.proceduralMeta as ProceduralSelectionMeta | undefined
    if (meta) return meta
    current = current.parent
  }

  return null
}

function defaultSceneMeta(scenario: TwinScenario): ProceduralSelectionMeta {
  return {
    id: `scene.default.${scenario}`,
    label: `Twin corridor scene / Scenario ${scenario}`,
    category: "reference",
    status: scenario,
    summary: "Click route sections, flood bands, beacons, anchors, access markers, or assets to inspect engine-backed corridor state.",
    nextBestMove: engine.corridorHud.nextUnlock,
    blockingRisk: engine.corridorHud.primaryBlocker,
    dependencies: [engine.corridorHud.leadConstraint],
  }
}

export function IfcWorkbench() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const componentsRef = useRef<OBC.Components | null>(null)
  const worldRef = useRef<any>(null)
  const loaderRef = useRef<OBC.IfcLoader | null>(null)
  const currentModelRef = useRef<THREE.Object3D | null>(null)
  const raycasterRef = useRef(new THREE.Raycaster())
  const frameObserverRef = useRef<ResizeObserver | null>(null)
  const [status, setStatus] = useState<ViewerStatus>("booting")
  const [statusMessage, setStatusMessage] = useState("Booting IFC workbench...")
  const [modelName, setModelName] = useState("Twin procedural scaffold")
  const [mode, setMode] = useState<WorkbenchMode>("procedural")
  const [proceduralScenario, setProceduralScenario] = useState<TwinScenario>("A")
  const [selectedMeta, setSelectedMeta] = useState<ProceduralSelectionMeta | null>(null)

  useEffect(() => {
    let disposed = false

    async function boot() {
      const container = containerRef.current
      if (!container) return

      setStatus("booting")
      setStatusMessage("Creating scene and BIM import pipeline...")

      const components = new OBC.Components()
      const worlds = components.get(OBC.Worlds)
      const world = worlds.create<
        OBC.SimpleScene,
        OBC.SimpleCamera,
        OBC.SimpleRenderer
      >()

      world.scene = new OBC.SimpleScene(components)
      world.renderer = new OBC.SimpleRenderer(components, container)
      world.camera = new OBC.SimpleCamera(components)

      components.init()
      world.scene.setup()
      world.scene.three.background = new THREE.Color("#061018")
      world.camera.controls.setLookAt(24, 18, 24, 0, 0, 0)

      const ambient = new THREE.AmbientLight("#9fd9ff", 1.5)
      const directional = new THREE.DirectionalLight("#ffffff", 2.25)
      directional.position.set(25, 35, 12)
      world.scene.three.add(ambient, directional)

      const grids = components.get(OBC.Grids)
      grids.create(world)

      const fragments = components.get(OBC.FragmentsManager)
      fragments.init(await OBC.FragmentsManager.getWorker())

      const ifcLoader = components.get(OBC.IfcLoader)
      await ifcLoader.setup({ autoSetWasm: true })

      if (disposed) {
        components.dispose()
        return
      }

      componentsRef.current = components
      worldRef.current = world
      loaderRef.current = ifcLoader

      const proceduralTwin = createProceduralCorridorModel(twin, engine, "A")
      world.scene.three.add(proceduralTwin)
      currentModelRef.current = proceduralTwin

      frameWhenReady(world, proceduralTwin, container, frameObserverRef)
      setSelectedMeta(defaultSceneMeta("A"))

      setStatus("ready")
      setStatusMessage("Workbench ready. The procedural corridor twin is live, and you can replace it with an IFC import.")
    }

    boot().catch((error) => {
      console.error(error)
      setStatus("error")
      setStatusMessage(error instanceof Error ? error.message : "Failed to initialize IFC workbench.")
    })

    return () => {
      disposed = true
      frameObserverRef.current?.disconnect()
      frameObserverRef.current = null
      currentModelRef.current = null
      loaderRef.current = null
      worldRef.current = null
      componentsRef.current?.dispose()
      componentsRef.current = null
    }
  }, [])

  async function handleIfcSelect(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    const loader = loaderRef.current
    const world = worldRef.current

    if (!file || !loader || !world) return

    setStatus("loading")
    setStatusMessage(`Importing ${file.name}...`)

    try {
      clearCurrentModel(currentModelRef)

      const bytes = new Uint8Array(await file.arrayBuffer())
      const model = await loader.load(bytes, true, file.name.replace(/\.ifc$/i, ""))
      model.name = file.name
      world.scene.three.add(model)
      currentModelRef.current = model
      setTimeout(() => frameObject(world, model), 100)

      setMode("ifc")
      setModelName(file.name)
      setSelectedMeta({
        id: "ifc.import",
        label: file.name,
        category: "reference",
        status: "imported",
        summary: "IFC geometry imported. Procedural corridor inspection is unavailable until you restore the twin scaffold.",
        nextBestMove: "Restore the twin scaffold to inspect corridor-specific engine objects again.",
      })
      setStatus("loaded")
      setStatusMessage("IFC model loaded. The corridor twin now has a real 3D geometry surface.")
    } catch (error) {
      console.error(error)
      setStatus("error")
      setStatusMessage(error instanceof Error ? error.message : `Failed to import ${file.name}.`)
    } finally {
      event.target.value = ""
    }
  }

  function restoreProceduralTwin(scenario = proceduralScenario) {
    const world = worldRef.current
    if (!world) return

    clearCurrentModel(currentModelRef)

    const proceduralTwin = createProceduralCorridorModel(twin, engine, scenario)
    world.scene.three.add(proceduralTwin)
    currentModelRef.current = proceduralTwin
    setTimeout(() => frameObject(world, proceduralTwin), 100)

    setProceduralScenario(scenario)
    setMode("procedural")
    setModelName(`Twin procedural scaffold / Scenario ${scenario}`)
    setSelectedMeta(defaultSceneMeta(scenario))
    setStatus("ready")
    setStatusMessage(`Procedural corridor twin rebuilt from shared twin/engine state for Scenario ${scenario}.`)
  }

  function handleFitView() {
    const world = worldRef.current
    const model = currentModelRef.current
    if (world && model) frameObject(world, model)
  }

  function handleReset() {
    const world = worldRef.current
    if (world) world.camera.controls.setLookAt(24, 18, 24, 0, 0, 0, true)
  }

  function handleViewerPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (mode !== "procedural") return

    const world = worldRef.current
    const model = currentModelRef.current
    const container = containerRef.current

    if (!world || !model || !container) return

    const rect = container.getBoundingClientRect()
    const pointer = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1,
    )

    const camera = world.camera?.three as THREE.Camera | undefined
    if (!camera) return

    raycasterRef.current.setFromCamera(pointer, camera)
    const hits = raycasterRef.current.intersectObject(model, true)
    const meta = hits.map((hit) => getProceduralMeta(hit.object)).find(Boolean) ?? null

    if (meta) {
      setSelectedMeta(meta)
      setStatusMessage(`Selected ${meta.label}.`)
    }
  }

  return (
    <section className="workbench-layout">

      {/* Viewer first — 600 px tall, Fit View + Reset anchored top-right */}
      <div style={{ position: "relative", height: 600, marginBottom: "1.5rem" }}>
        <div
          ref={containerRef}
          className="viewer-canvas"
          style={{ width: "100%", height: "100%" }}
          onPointerDown={handleViewerPointerDown}
        />
        <div style={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 8 }}>
          <button
            type="button"
            className="button"
            onClick={handleFitView}
            disabled={status === "booting" || status === "loading"}
          >
            Fit View
          </button>
          <button
            type="button"
            className="button"
            onClick={handleReset}
            disabled={status === "booting" || status === "loading"}
          >
            Reset
          </button>
        </div>
      </div>

      <div className="workbench-grid">
        <div className="card">
          <div className="eyebrow">3D Twin Direction</div>
          <h3>Open-source parametric stack</h3>
          <ul className="bullet-list">
            <li>FreeCAD for constrained real-world parametric solids.</li>
            <li>Blender Geometry Nodes for procedural corridor massing.</li>
            <li>IfcOpenShell / Bonsai for open BIM authoring and IFC exchange.</li>
            <li>That Open + web-ifc here in the browser for import and interaction.</li>
          </ul>
          <p>
            This route now does three useful things: it renders a procedural corridor scaffold directly from the twin,
            it can accept a real IFC model when you have one, and it lets you inspect corridor objects as engine-backed
            entities instead of decorative geometry.
          </p>
        </div>

        <div className="card">
          <div className="eyebrow">Import Control</div>
          <h3>IFC corridor workbench</h3>
          <p>
            Load an IFC model exported from FreeCAD, Blender + Bonsai, or any IFC-capable BIM tool. This is the right
            exchange layer for a corridor digital twin because it preserves infrastructure objects and relationships, not
            just triangles.
          </p>
          <label className="upload-button">
            <span>Import IFC model</span>
            <input
              type="file"
              accept=".ifc"
              onChange={handleIfcSelect}
              disabled={status === "booting" || status === "loading"}
            />
          </label>
          <div className="cta-row">
            <button type="button" className="button secondary" onClick={restoreProceduralTwin}>
              Restore twin scaffold
            </button>
          </div>
          <div className="cta-row">
            {(["A", "B", "C"] as TwinScenario[]).map((scenario) => (
              <button
                key={scenario}
                type="button"
                className={`button ${proceduralScenario === scenario && mode === "procedural" ? "primary" : ""}`}
                onClick={() => restoreProceduralTwin(scenario)}
              >
                Scenario {scenario}
              </button>
            ))}
          </div>
          <div className="pill-row">
            <span className="pill">Status {status}</span>
            <span className="pill">Mode {mode}</span>
            <span className="pill">{modelName}</span>
          </div>
          <p>{statusMessage}</p>
        </div>
      </div>

      <div className="workbench-grid">
        <div className="card">
          <div className="eyebrow">Engine Coupling</div>
          <ul className="bullet-list">
            <li>Lead scenario: {engine.scenarioReadiness[0]?.scenario}</li>
            <li>Scenario A readiness: {engine.scenarioReadiness[0]?.score}/100</li>
            <li>Primary blocker: {engine.corridorHud.primaryBlocker}</li>
            <li>Next unlock: {engine.corridorHud.nextUnlock}</li>
          </ul>
        </div>
        <div className="card">
          <div className="eyebrow">3D Scaffold Legend</div>
          <ul className="bullet-list">
            <li>Yellow reference, cyan trace, and orange delta links distinguish the inherited spine from the active traced corridor.</li>
            <li>Blue flood ribbons represent broader and shallower flood bands on the river side of the pilot.</li>
            <li>Magenta beacons, green access markers, and yellow asset rings now carry click-through corridor metadata.</li>
            <li>Orange trunk follows the traced corridor under-layer spine and exposes its dependency stack when selected.</li>
            <li>Scenario B/C add over-layer massing above the same corridor path rather than drifting into a separate model.</li>
          </ul>
        </div>
      </div>

      <div className="workbench-grid">
        <div className="card">
          <div className="eyebrow">Selection Inspector</div>
          <h3>{selectedMeta?.label ?? "Nothing selected yet"}</h3>
          <p>{selectedMeta?.summary ?? "Click a corridor object to inspect its engine-backed state."}</p>
          <div className="pill-row">
            {selectedMeta?.category ? <span className="pill">Category {selectedMeta.category}</span> : null}
            {selectedMeta?.status ? <span className="pill">Status {selectedMeta.status}</span> : null}
          </div>
          {selectedMeta?.blockingRisk ? (
            <>
              <div className="eyebrow">Blocking Risk</div>
              <p>{selectedMeta.blockingRisk}</p>
            </>
          ) : null}
          {selectedMeta?.unlockIfResolved ? (
            <>
              <div className="eyebrow">Unlock If Resolved</div>
              <p>{selectedMeta.unlockIfResolved}</p>
            </>
          ) : null}
          {selectedMeta?.nextBestMove ? (
            <>
              <div className="eyebrow">Next Best Move</div>
              <p>{selectedMeta.nextBestMove}</p>
            </>
          ) : null}
        </div>

        <div className="card">
          <div className="eyebrow">Dependencies And Proof</div>
          <ul className="bullet-list">
            {(selectedMeta?.dependencies?.length ? selectedMeta.dependencies : ["Select a corridor object to see its dependencies."]).map((item) => (
              <li key={`dep-${item}`}>{item}</li>
            ))}
          </ul>
          <div className="eyebrow">Linked Proof Burdens</div>
          <ul className="bullet-list">
            {(selectedMeta?.linkedProofs?.length ? selectedMeta.linkedProofs : ["No linked proof burden attached to this object yet."]).map((item) => (
              <li key={`proof-${item}`}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

    </section>
  )
}
