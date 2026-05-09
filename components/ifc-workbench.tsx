"use client"

import { type ChangeEvent, type MutableRefObject, useEffect, useRef, useState } from "react"
import * as THREE from "three"
import * as OBC from "@thatopen/components"
import { type TwinScenario, getTwinAlphaState } from "@/lib/digital-twin"
import { getTwinAlphaEngineState } from "@/lib/engine/twin-engine"
import { createProceduralCorridorModel, getCorridorTracks, type ProceduralSelectionMeta, type CorridorTrack } from "@/lib/model/procedural-corridor"
import { ANCHOR_VISUAL_SURFACES, VISUAL_SURFACE_OVER_LAYER, VISUAL_SURFACE_UNDER_LAYER, type VisualSurface } from "@/lib/visual-surface"
import { VisualReferencePanel } from "@/components/visual-reference-panel"

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

function visualSurfaceForMeta(meta: ProceduralSelectionMeta | null): VisualSurface | null {
  if (!meta) return null
  if (ANCHOR_VISUAL_SURFACES[meta.id]) return ANCHOR_VISUAL_SURFACES[meta.id]
  if (meta.id.startsWith("under.")) return VISUAL_SURFACE_UNDER_LAYER
  if (meta.id.startsWith("over.")) return VISUAL_SURFACE_OVER_LAYER
  if (meta.id.startsWith("flood-")) return VISUAL_SURFACE_UNDER_LAYER
  return VISUAL_SURFACE_OVER_LAYER
}

const BUS_COLOR = "#12f7ff"
const BUS_COLORS: Record<string, string> = { tunnel: "#12f7ff", viaduct: "#ffd966", cut: "#7ef7a0" }

function createBusMesh(section: CorridorTrack["section"]): THREE.Object3D {
  const color = BUS_COLORS[section] ?? BUS_COLOR
  const emissiveIntensity = section === "tunnel" ? 0.9 : 0.6
  const group = new THREE.Group()
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.68, 0.48, 1.8),
    new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity, roughness: 0.3, metalness: 0.5 }),
  )
  const cab = new THREE.Mesh(
    new THREE.BoxGeometry(0.52, 0.32, 0.42),
    new THREE.MeshStandardMaterial({ color: "#dffcff", emissive: color, emissiveIntensity: 1.4, roughness: 0.15, metalness: 0.6, transparent: true, opacity: 0.82 }),
  )
  cab.position.set(0, 0.28, 0.72)
  group.add(body, cab)
  return group
}

export function IfcWorkbench() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const componentsRef = useRef<OBC.Components | null>(null)
  const worldRef = useRef<any>(null)
  const loaderRef = useRef<OBC.IfcLoader | null>(null)
  const currentModelRef = useRef<THREE.Object3D | null>(null)
  const raycasterRef = useRef(new THREE.Raycaster())
  const frameObserverRef = useRef<ResizeObserver | null>(null)
  const selectedMeshRef = useRef<THREE.Mesh | null>(null)
  const origMatRef = useRef<THREE.Material | THREE.Material[] | null>(null)
  const busGroupRef = useRef<THREE.Group | null>(null)
  const busDataRef = useRef<Array<{ mesh: THREE.Object3D; curve: THREE.CatmullRomCurve3; t: number; speed: number }>>([])
  const animFrameRef = useRef<number>(0)
  const pulseMeshesRef = useRef<THREE.Mesh[]>([])
  const lastInteractionRef = useRef<number>(0)
  const orbitActiveRef = useRef<boolean>(false)
  const tourIndexRef = useRef<number>(-1)
  const scanPlaneRef = useRef<THREE.Mesh | null>(null)
  const demoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const schuylkillGroupRef = useRef<THREE.Group | null>(null)
  const [showSchuylkill, setShowSchuylkill] = useState(false)
  const [status, setStatus] = useState<ViewerStatus>("booting")
  const [statusMessage, setStatusMessage] = useState("Booting IFC workbench...")
  const [modelName, setModelName] = useState("Twin procedural scaffold")
  const [mode, setMode] = useState<WorkbenchMode>("procedural")
  const [proceduralScenario, setProceduralScenario] = useState<TwinScenario>("A")
  const [selectedMeta, setSelectedMeta] = useState<ProceduralSelectionMeta | null>(null)
  const [popup, setPopup] = useState<{ x: number; y: number; meta: ProceduralSelectionMeta } | null>(null)
  const [isOrbitActive, setIsOrbitActive] = useState(false)
  const [tourSection, setTourSection] = useState<string | null>(null)
  const [isDemoMode, setIsDemoMode] = useState(false)

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
      world.camera.controls.setLookAt(24, 18, 24, 0, 0, 0)

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

      // Atmosphere
      world.scene.three.background = new THREE.Color("#030e18")
      world.scene.three.fog = new THREE.FogExp2("#030e18", 0.016)

      // Better lighting
      const ambient = new THREE.AmbientLight("#8bc8e8", 0.9)
      const sun = new THREE.DirectionalLight("#c8e8ff", 1.6)
      sun.position.set(30, 45, 15)
      const rimLight = new THREE.DirectionalLight("#12f7ff", 0.3)
      rimLight.position.set(-20, 10, -30)
      world.scene.three.add(ambient, sun, rimLight)

      const proceduralTwin = createProceduralCorridorModel(twin, engine, "A")
      world.scene.three.add(proceduralTwin)
      currentModelRef.current = proceduralTwin

      frameWhenReady(world, proceduralTwin, container, frameObserverRef)
      setSelectedMeta(defaultSceneMeta("A"))

      // Collect pulse meshes for beacon/anchor animation
      const pulseMeshes: THREE.Mesh[] = []
      proceduralTwin.traverse((obj) => {
        if (!(obj instanceof THREE.Mesh)) return
        const meta = obj.userData?.proceduralMeta as ProceduralSelectionMeta | undefined
        if (meta && (meta.category === "beacon" || meta.category === "anchor" || meta.category === "pilot-node")) {
          pulseMeshes.push(obj)
        }
      })
      pulseMeshesRef.current = pulseMeshes
      lastInteractionRef.current = performance.now()

      // Moving point lights (one per section lead bus)
      const tunnelLight = new THREE.PointLight("#12f7ff", 3.5, 18)
      const viaductLight = new THREE.PointLight("#ffd966", 2.5, 14)
      world.scene.three.add(tunnelLight, viaductLight)

      // Bus animation with trails
      const busGroup = new THREE.Group()
      busGroup.name = "animated-vehicles"
      world.scene.three.add(busGroup)
      busGroupRef.current = busGroup

      // Scan plane — sweeps vertically to show corridor is "live"
      const scanPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(300, 200),
        new THREE.MeshBasicMaterial({ color: "#12f7ff", transparent: true, opacity: 0.022, side: THREE.DoubleSide, depthWrite: false }),
      )
      scanPlane.rotation.x = -Math.PI / 2
      world.scene.three.add(scanPlane)
      scanPlaneRef.current = scanPlane

      const TRAIL_LEN = 12
      type BusEntry = { mesh: THREE.Object3D; curve: THREE.CatmullRomCurve3; t: number; speed: number; trailLine: THREE.Line; trailPos: Float32Array }

      const tracks = getCorridorTracks()
      const busData: BusEntry[] = []

      tracks.forEach((track, i) => {
        for (const offset of [0, 0.5]) {
          const bus = createBusMesh(track.section)
          busGroup.add(bus)

          // Trail line
          const trailPos = new Float32Array(TRAIL_LEN * 3)
          const trailGeom = new THREE.BufferGeometry()
          trailGeom.setAttribute("position", new THREE.BufferAttribute(trailPos, 3))
          const trailColor = BUS_COLORS[track.section] ?? BUS_COLOR
          const trailLine = new THREE.Line(
            trailGeom,
            new THREE.LineBasicMaterial({ color: trailColor, transparent: true, opacity: 0.35 }),
          )
          busGroup.add(trailLine)

          busData.push({ mesh: bus, curve: track.curve, t: (i * 0.33 + offset) % 1, speed: track.speed, trailLine, trailPos })
        }
      })

      busDataRef.current = busData

      let last = performance.now()
      function animateBuses() {
        animFrameRef.current = requestAnimationFrame(animateBuses)
        const now = performance.now()
        const dt = Math.min((now - last) / 1000, 0.05)
        last = now

        for (let bi = 0; bi < busData.length; bi++) {
          const bus = busData[bi]
          bus.t = (bus.t + bus.speed * dt) % 1

          const pos = bus.curve.getPoint(bus.t)
          const tan = bus.curve.getTangent(bus.t)
          bus.mesh.position.copy(pos)
          bus.mesh.lookAt(pos.clone().add(tan))

          // Shift trail positions back and prepend current
          const tp = bus.trailPos
          for (let j = TRAIL_LEN - 1; j > 0; j--) {
            tp[j * 3]     = tp[(j - 1) * 3]
            tp[j * 3 + 1] = tp[(j - 1) * 3 + 1]
            tp[j * 3 + 2] = tp[(j - 1) * 3 + 2]
          }
          tp[0] = pos.x; tp[1] = pos.y; tp[2] = pos.z
          bus.trailLine.geometry.attributes.position.needsUpdate = true

          // Move point lights with lead buses (bi 0 = tunnel, bi 2 = viaduct)
          if (bi === 0) tunnelLight.position.copy(pos).y += 1.5
          if (bi === 2) viaductLight.position.copy(pos).y += 1.5
        }

        // Pulse beacons / anchors / pilot nodes
        const t = now * 0.001
        const pulseList = pulseMeshesRef.current
        for (let pi = 0; pi < pulseList.length; pi++) {
          const mat = pulseList[pi].material as THREE.MeshStandardMaterial
          mat.emissiveIntensity = 0.18 + Math.sin(t * 2.0 + pi * 1.1) * 0.12
        }

        // Scan plane sweep
        if (scanPlaneRef.current) {
          scanPlaneRef.current.position.y = Math.sin(now * 0.00035) * 7 + 5
        }

        // Auto-orbit after 12 s of idle
        const idleMs = now - lastInteractionRef.current
        const shouldOrbit = idleMs > 12_000
        if (shouldOrbit !== orbitActiveRef.current) {
          orbitActiveRef.current = shouldOrbit
          setIsOrbitActive(shouldOrbit)
        }
        if (shouldOrbit && worldRef.current) {
          worldRef.current.camera.controls.rotate(0.004, 0, false)
        }
      }
      animateBuses()

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
      cancelAnimationFrame(animFrameRef.current)
      if (demoTimerRef.current) { clearInterval(demoTimerRef.current); demoTimerRef.current = null }
      frameObserverRef.current?.disconnect()
      frameObserverRef.current = null
      currentModelRef.current = null
      busGroupRef.current = null
      busDataRef.current = []
      pulseMeshesRef.current = []
      scanPlaneRef.current = null
      schuylkillGroupRef.current = null
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

    // Re-collect pulse meshes from new twin
    const pulseMeshes: THREE.Mesh[] = []
    proceduralTwin.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) return
      const meta = obj.userData?.proceduralMeta as ProceduralSelectionMeta | undefined
      if (meta && (meta.category === "beacon" || meta.category === "anchor" || meta.category === "pilot-node")) {
        pulseMeshes.push(obj)
      }
    })
    pulseMeshesRef.current = pulseMeshes
    lastInteractionRef.current = performance.now()

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

  const TOUR_LABELS = ["Tunnel", "Viaduct", "Cut"]

  function handleTour() {
    const world = worldRef.current
    if (!world) return
    const tracks = getCorridorTracks()
    if (!tracks.length) return
    const nextIdx = (tourIndexRef.current + 1) % tracks.length
    tourIndexRef.current = nextIdx
    const track = tracks[nextIdx]
    const target = track.curve.getPoint(0.5)
    const pb = track.section === "viaduct" ? 14 : track.section === "tunnel" ? 10 : 12
    world.camera.controls.setLookAt(
      target.x + pb * 0.6,
      target.y + pb * 0.9,
      target.z + pb * 0.6,
      target.x, target.y, target.z,
      true,
    )
    lastInteractionRef.current = performance.now()
    setTourSection(TOUR_LABELS[nextIdx])
  }

  function handleDemoToggle() {
    if (demoTimerRef.current) {
      clearInterval(demoTimerRef.current)
      demoTimerRef.current = null
      setIsDemoMode(false)
      return
    }
    handleTour()
    setIsDemoMode(true)
    demoTimerRef.current = setInterval(() => handleTour(), 7_000)
  }

  async function handleSchuylkillToggle() {
    const world = worldRef.current
    if (!world) return

    if (schuylkillGroupRef.current) {
      world.scene.three.remove(schuylkillGroupRef.current)
      schuylkillGroupRef.current = null
      // Restore original fog density
      if (world.scene.three.fog instanceof THREE.FogExp2) {
        world.scene.three.fog.density = 0.016
      }
      setShowSchuylkill(false)
      return
    }

    const data = await fetch("/schuylkill-tunnel.json").then(r => r.json())
    const pts: [number, number, number][] = data.alignment_pts

    // Centre and scale — target ~110 scene units for full alignment
    const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length
    const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length
    const scale = 110 / data.length_ft
    const depthScale = scale * 10  // exaggerate depth so tunnel reads underground

    const curvePoints = pts.map(p => new THREE.Vector3(
      (p[0] - cx) * scale,
      p[2] * depthScale,
      (p[1] - cy) * scale,
    ))
    const curve = new THREE.CatmullRomCurve3(curvePoints)

    const group = new THREE.Group()
    group.name = "schuylkill-tunnel"
    group.position.set(0, 0, 35)

    // Concrete material — matches the precast segment reference
    const concreteMat = new THREE.MeshStandardMaterial({
      color: "#8a9199",
      emissive: "#3a4855",
      emissiveIntensity: 0.5,
      roughness: 0.85,
      metalness: 0.05,
    })
    // Slightly darker for joint faces
    const jointMat = new THREE.MeshStandardMaterial({
      color: "#5a6570",
      emissive: "#1a2530",
      emissiveIntensity: 0.4,
      roughness: 0.9,
      metalness: 0.0,
    })

    // One BoxGeometry per module — width × height scaled from real 40ft × 22ft cross-section
    const moduleBoxW = (40 / data.length_ft) * 110   // ~0.38 → scaled up for visibility
    const moduleBoxH = (22 / data.length_ft) * 110
    const BOX_W = Math.max(moduleBoxW * 4, 2.8)
    const BOX_H = Math.max(moduleBoxH * 4, 1.5)

    data.modules.forEach((m: { start_station: number; end_station: number; length_ft: number }) => {
      const tMid = ((m.start_station + m.end_station) / 2) / data.length_ft
      const tStart = m.start_station / data.length_ft
      const tEnd = m.end_station / data.length_ft
      const pos = curve.getPoint(tMid)
      const tan = curve.getTangent(tMid)

      // Segment length in scene units
      const startPos = curve.getPoint(tStart)
      const endPos = curve.getPoint(tEnd)
      const segLen = startPos.distanceTo(endPos)

      const box = new THREE.Mesh(
        new THREE.BoxGeometry(BOX_W, BOX_H, segLen - 0.05),
        concreteMat.clone(),
      )
      box.position.copy(pos)
      box.lookAt(pos.clone().add(tan))
      group.add(box)

      // Joint plane at module end
      const jointPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(BOX_W + 0.05, BOX_H + 0.05),
        jointMat.clone(),
      )
      jointPlane.position.copy(curve.getPoint(tEnd))
      jointPlane.lookAt(curve.getPoint(tEnd).clone().add(tan))
      group.add(jointPlane)
    })

    // Thin alignment spine so the curve reads at distance
    const spineMat = new THREE.MeshBasicMaterial({ color: "#c0c8d0", transparent: true, opacity: 0.18 })
    group.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 200, 0.08, 4, false), spineMat))

    world.scene.three.add(group)
    schuylkillGroupRef.current = group

    // Thin the fog so the tunnel is visible at its offset distance
    if (world.scene.three.fog instanceof THREE.FogExp2) {
      world.scene.three.fog.density = 0.007
    }

    setShowSchuylkill(true)
    lastInteractionRef.current = performance.now()
  }

  function handleViewerPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    lastInteractionRef.current = performance.now()
    if (mode !== "procedural") return

    const world = worldRef.current
    const model = currentModelRef.current
    const container = containerRef.current

    if (!world || !model || !container) return

    const rect = container.getBoundingClientRect()
    const px = event.clientX - rect.left
    const py = event.clientY - rect.top
    const pointer = new THREE.Vector2(
      (px / rect.width) * 2 - 1,
      -(py / rect.height) * 2 + 1,
    )

    const camera = world.camera?.three as THREE.Camera | undefined
    if (!camera) return

    raycasterRef.current.setFromCamera(pointer, camera)
    const hits = raycasterRef.current.intersectObject(model, true)
    const hit = hits.find(h => getProceduralMeta(h.object))
    const meta = hit ? getProceduralMeta(hit.object) : null

    // Restore previous highlight
    if (selectedMeshRef.current && origMatRef.current) {
      selectedMeshRef.current.material = origMatRef.current
      selectedMeshRef.current = null
      origMatRef.current = null
    }

    if (meta && hit) {
      // Highlight hit mesh
      const mesh = hit.object as THREE.Mesh
      if (mesh.isMesh && !Array.isArray(mesh.material)) {
        origMatRef.current = mesh.material
        selectedMeshRef.current = mesh
        const hl = (mesh.material as THREE.MeshStandardMaterial).clone()
        hl.emissive = new THREE.Color("#12f7ff")
        hl.emissiveIntensity = 1.2
        mesh.material = hl
      }

      setSelectedMeta(meta)
      setStatusMessage(`Selected ${meta.label}.`)

      // Show popup near click, keep inside container
      const popupX = Math.min(px + 12, rect.width - 280)
      const popupY = Math.min(py + 12, rect.height - 140)
      setPopup({ x: popupX, y: popupY, meta })
    } else {
      setPopup(null)
    }
  }

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Full-height viewer */}
      <div style={{ position: "relative", height: "calc(100vh - 120px)", minHeight: 520, borderRadius: 16, overflow: "hidden", border: "1px solid rgba(18,247,255,0.14)", background: "#050b11" }}>
        <div
          ref={containerRef}
          style={{ width: "100%", height: "100%" }}
          onPointerDown={handleViewerPointerDown}
        />

        {/* Top-left: scenario + import */}
        <div style={{ position: "absolute", top: 10, left: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
          {(["A", "B", "C"] as TwinScenario[]).map((s) => (
            <button
              key={s}
              type="button"
              className="button"
              onClick={() => restoreProceduralTwin(s)}
              style={{
                fontSize: "0.72rem",
                padding: "4px 12px",
                minHeight: 30,
                background: proceduralScenario === s && mode === "procedural" ? "rgba(18,247,255,0.15)" : "rgba(4,16,24,0.8)",
                borderColor: proceduralScenario === s && mode === "procedural" ? "rgba(18,247,255,0.5)" : "rgba(255,255,255,0.1)",
                color: proceduralScenario === s && mode === "procedural" ? "var(--teal)" : "var(--muted)",
                backdropFilter: "blur(8px)",
              }}
            >
              Scenario {s}
            </button>
          ))}
          <button
            type="button"
            className="button"
            onClick={handleSchuylkillToggle}
            style={{
              fontSize: "0.72rem", padding: "4px 12px", minHeight: 30,
              background: showSchuylkill ? "rgba(255,0,204,0.15)" : "rgba(4,16,24,0.8)",
              borderColor: showSchuylkill ? "rgba(255,0,204,0.5)" : "rgba(255,255,255,0.1)",
              color: showSchuylkill ? "#ff00cc" : "var(--muted)",
              backdropFilter: "blur(8px)",
            }}
          >
            {showSchuylkill ? "● Schuylkill" : "Schuylkill"}
          </button>

          <label style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            fontSize: "0.72rem", padding: "4px 12px", minHeight: 30, borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.1)", color: "var(--muted)",
            background: "rgba(4,16,24,0.8)", backdropFilter: "blur(8px)", cursor: "pointer",
            position: "relative",
          }}>
            Import IFC
            <input type="file" accept=".ifc" onChange={handleIfcSelect} disabled={status === "booting" || status === "loading"} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }} />
          </label>
          {mode === "ifc" && (
            <button type="button" className="button" onClick={() => restoreProceduralTwin()} style={{ fontSize: "0.72rem", padding: "4px 12px", minHeight: 30, backdropFilter: "blur(8px)", background: "rgba(4,16,24,0.8)" }}>
              ← Twin
            </button>
          )}
        </div>

        {/* Top-right: camera controls + status */}
        <div style={{ position: "absolute", top: 10, right: 10, display: "flex", gap: 6, alignItems: "center" }}>
          {status === "booting" || status === "loading" ? (
            <span style={{ fontSize: "0.68rem", opacity: 0.5, background: "rgba(4,16,24,0.8)", padding: "4px 10px", borderRadius: 999, backdropFilter: "blur(8px)" }}>
              {status === "booting" ? "Loading..." : "Importing..."}
            </span>
          ) : null}
          <button type="button" className="button" onClick={handleFitView} disabled={status === "booting" || status === "loading"}
            style={{ fontSize: "0.72rem", padding: "4px 12px", minHeight: 30, background: "rgba(4,16,24,0.8)", backdropFilter: "blur(8px)" }}>
            Fit
          </button>
          <button type="button" className="button" onClick={handleReset} disabled={status === "booting" || status === "loading"}
            style={{ fontSize: "0.72rem", padding: "4px 12px", minHeight: 30, background: "rgba(4,16,24,0.8)", backdropFilter: "blur(8px)" }}>
            Reset
          </button>
          <button type="button" className="button" onClick={handleTour} disabled={status === "booting" || status === "loading"}
            style={{ fontSize: "0.72rem", padding: "4px 12px", minHeight: 30, background: "rgba(4,16,24,0.8)", backdropFilter: "blur(8px)", color: "var(--teal)", borderColor: "rgba(18,247,255,0.3)" }}>
            {tourSection ? `▶ ${tourSection}` : "Tour"}
          </button>
          <button type="button" className="button" onClick={handleDemoToggle} disabled={status === "booting" || status === "loading"}
            style={{ fontSize: "0.72rem", padding: "4px 12px", minHeight: 30, background: isDemoMode ? "rgba(18,247,255,0.12)" : "rgba(4,16,24,0.8)", backdropFilter: "blur(8px)", color: isDemoMode ? "var(--teal)" : "var(--muted)", borderColor: isDemoMode ? "rgba(18,247,255,0.4)" : "rgba(255,255,255,0.1)" }}>
            {isDemoMode ? "● Demo" : "Demo"}
          </button>
          {isOrbitActive && (
            <span style={{ fontSize: "0.65rem", opacity: 0.6, color: "var(--teal)", background: "rgba(4,16,24,0.8)", padding: "4px 10px", borderRadius: 999, backdropFilter: "blur(8px)", border: "1px solid rgba(18,247,255,0.2)" }}>
              Auto-orbit
            </span>
          )}
        </div>

        {/* Demo mode section caption */}
        {isDemoMode && tourSection && (
          <div style={{
            position: "absolute", bottom: 48, left: "50%", transform: "translateX(-50%)",
            background: "rgba(3,10,18,0.9)", border: "1px solid rgba(18,247,255,0.28)",
            borderRadius: 10, padding: "10px 24px", pointerEvents: "none",
            backdropFilter: "blur(14px)", textAlign: "center",
          }}>
            <div style={{ fontSize: "0.55rem", color: "var(--teal)", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 3 }}>Philadelphia City Branch · Digital Twin</div>
            <div style={{ fontSize: "1rem", fontWeight: 700, letterSpacing: "0.06em" }}>{tourSection.toUpperCase()} SECTION</div>
          </div>
        )}

        {/* Click popup */}
        {popup && (
          <div style={{
            position: "absolute", left: popup.x, top: popup.y, width: 272,
            background: "rgba(3,10,18,0.96)", border: "1px solid rgba(18,247,255,0.32)",
            borderRadius: 10, padding: "12px 14px", pointerEvents: "none",
            backdropFilter: "blur(12px)", boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
          }}>
            <div style={{ fontSize: "0.58rem", color: "var(--teal)", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 3 }}>
              {popup.meta.category}
            </div>
            <div style={{ fontSize: "0.88rem", fontWeight: 700, marginBottom: 5, lineHeight: 1.25 }}>
              {popup.meta.label}
            </div>
            {popup.meta.status && (
              <span style={{ fontSize: "0.63rem", padding: "1px 8px", borderRadius: 999, border: "1px solid rgba(18,247,255,0.25)", color: "var(--teal)", display: "inline-block", marginBottom: 7 }}>
                {popup.meta.status}
              </span>
            )}
            <p style={{ margin: 0, fontSize: "0.74rem", opacity: 0.72, lineHeight: 1.5 }}>
              {popup.meta.summary.slice(0, 140)}{popup.meta.summary.length > 140 ? "…" : ""}
            </p>
            {popup.meta.nextBestMove && (
              <p style={{ margin: "8px 0 0", fontSize: "0.68rem", opacity: 0.45, lineHeight: 1.4, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 7 }}>
                Next: {popup.meta.nextBestMove.slice(0, 100)}
              </p>
            )}
          </div>
        )}

        {/* Bottom-left: legend */}
        {mode === "procedural" && (
          <div style={{ position: "absolute", bottom: 10, left: 10, display: "flex", flexDirection: "column", gap: 5, pointerEvents: "none" }}>
            {[
              { color: "#ffd966", label: "Viaduct" },
              { color: "#ffb347", label: "Cut section" },
              { color: "#ff4fd8", label: "Tunnel" },
              { color: "#ff9a3c", label: "Metabolic trunk" },
              { color: "#1f4dff", label: "Flood zone" },
            ].map(item => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: item.color, flexShrink: 0 }} />
                <span style={{ fontSize: "0.6rem", opacity: 0.55, color: "var(--text)", background: "rgba(3,10,18,0.6)", padding: "1px 5px", borderRadius: 3 }}>{item.label}</span>
              </div>
            ))}
            {showSchuylkill && (
              <div style={{ marginTop: 4, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 5 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: "#ff00cc", boxShadow: "0 0 5px #ff00cc" }} />
                  <span style={{ fontSize: "0.6rem", opacity: 0.55, color: "var(--text)", background: "rgba(3,10,18,0.6)", padding: "1px 5px", borderRadius: 3 }}>Schuylkill Tunnel · 38 modules</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: "#ff00cc", opacity: 0.4 }} />
                  <span style={{ fontSize: "0.6rem", opacity: 0.55, color: "var(--text)", background: "rgba(3,10,18,0.6)", padding: "1px 5px", borderRadius: 3 }}>Module joints · AASHTO 2018</span>
                </div>
              </div>
            )}
            <div style={{ marginTop: 4, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 5 }}>
              {[
                { color: "#12f7ff", label: "Bus · Tunnel" },
                { color: "#ffd966", label: "Bus · Viaduct" },
                { color: "#7ef7a0", label: "Bus · Cut" },
              ].map(b => (
                <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: b.color, boxShadow: `0 0 5px ${b.color}` }} />
                  <span style={{ fontSize: "0.6rem", opacity: 0.55, color: "var(--text)", background: "rgba(3,10,18,0.6)", padding: "1px 5px", borderRadius: 3 }}>{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom-right: selected object quick-read */}
        {selectedMeta && (
          <div style={{
            position: "absolute", bottom: 10, right: 10, width: 240,
            background: "rgba(3,10,18,0.88)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 8, padding: "10px 12px", pointerEvents: "none", backdropFilter: "blur(8px)",
          }}>
            <div style={{ fontSize: "0.58rem", opacity: 0.4, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 3 }}>Selected</div>
            <div style={{ fontSize: "0.78rem", fontWeight: 600, marginBottom: 4 }}>{selectedMeta.label}</div>
            {selectedMeta.dependencies?.length ? (
              <div style={{ fontSize: "0.65rem", opacity: 0.45, lineHeight: 1.4 }}>
                {selectedMeta.dependencies.slice(0, 2).join(" · ")}
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Compact inspector strip below viewer */}
      {selectedMeta && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div className="card" style={{ padding: "14px 16px" }}>
            <div className="eyebrow" style={{ marginBottom: 6 }}>Inspector · {selectedMeta.category}</div>
            <h4 style={{ margin: "0 0 6px", fontSize: "0.9rem" }}>{selectedMeta.label}</h4>
            <p style={{ margin: "0 0 8px", fontSize: "0.78rem", opacity: 0.7, lineHeight: 1.5 }}>{selectedMeta.summary}</p>
            {selectedMeta.blockingRisk && (
              <p style={{ margin: "0 0 4px", fontSize: "0.72rem", opacity: 0.5 }}>⚠ {selectedMeta.blockingRisk}</p>
            )}
            {selectedMeta.nextBestMove && (
              <p style={{ margin: 0, fontSize: "0.72rem", opacity: 0.45 }}>→ {selectedMeta.nextBestMove}</p>
            )}
          </div>
          <div className="card" style={{ padding: "14px 16px" }}>
            <div className="eyebrow" style={{ marginBottom: 6 }}>Dependencies · Proof</div>
            {(selectedMeta.dependencies?.length
              ? selectedMeta.dependencies
              : ["No dependencies attached yet."]
            ).map(d => (
              <div key={d} style={{ fontSize: "0.74rem", opacity: 0.6, marginBottom: 4, paddingLeft: 8, borderLeft: "2px solid rgba(18,247,255,0.2)" }}>{d}</div>
            ))}
            {selectedMeta.linkedProofs?.map(p => (
              <div key={p} style={{ fontSize: "0.72rem", opacity: 0.45, marginBottom: 3, paddingLeft: 8, borderLeft: "2px solid rgba(255,217,102,0.3)" }}>{p}</div>
            ))}
          </div>
        </div>
      )}

      <VisualReferencePanel surface={visualSurfaceForMeta(selectedMeta)} />

    </section>
  )
}
