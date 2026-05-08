import * as THREE from "three"
import { type DigitalTwinState, type RootStatusClass, type TwinScenario } from "@/lib/digital-twin"
import { type TwinEngineState } from "@/lib/engine/twin-engine"

type RoutePoint = {
  lat: number
  lng: number
}

type RouteSection = {
  id: string
  label: string
  color: string
  zOffset: number
  points: RoutePoint[]
}

type NamedRoutePoint = RoutePoint & {
  label: string
  color?: string
}

export type ProceduralSelectionMeta = {
  id: string
  label: string
  category:
    | "boundary"
    | "flood"
    | "reference"
    | "trace"
    | "delta"
    | "under-layer"
    | "section"
    | "beacon"
    | "anchor"
    | "access"
    | "asset"
    | "pilot-node"
  status?: string
  summary: string
  blockingRisk?: string
  unlockIfResolved?: string
  nextBestMove?: string
  dependencies?: string[]
  linkedProofs?: string[]
}

const phase16Alignment: RoutePoint[] = [
  { lat: 39.96015, lng: -75.1611 },
  { lat: 39.96055, lng: -75.1634 },
  { lat: 39.96105, lng: -75.1663 },
  { lat: 39.96185, lng: -75.1702 },
  { lat: 39.96285, lng: -75.1746 },
  { lat: 39.96375, lng: -75.1788 },
  { lat: 39.9648, lng: -75.1832 },
  { lat: 39.9656, lng: -75.1874 },
  { lat: 39.9662, lng: -75.1911 },
]

const tracedRoute: RoutePoint[] = [
  { lat: 39.9599, lng: -75.15908 },
  { lat: 39.9601, lng: -75.16088 },
  { lat: 39.96044, lng: -75.16272 },
  { lat: 39.9609, lng: -75.16512 },
  { lat: 39.96172, lng: -75.1691 },
  { lat: 39.96298, lng: -75.17378 },
  { lat: 39.96402, lng: -75.17808 },
  { lat: 39.96505, lng: -75.1826 },
  { lat: 39.9657, lng: -75.18655 },
  { lat: 39.96602, lng: -75.18978 },
]

const viaductSection: RouteSection = {
  id: "viaduct",
  label: "VIADUCT",
  color: "#ffd966",
  zOffset: 9.5,
  points: tracedRoute.slice(0, 4),
}

const cutSection: RouteSection = {
  id: "cut",
  label: "CUT",
  color: "#ffb347",
  zOffset: 6.5,
  points: tracedRoute.slice(3, 8),
}

const tunnelSection: RouteSection = {
  id: "tunnel",
  label: "TUNNEL",
  color: "#ff4fd8",
  zOffset: 3.8,
  points: tracedRoute.slice(7),
}

const floodRibbon: RoutePoint[] = [
  { lat: 39.9558, lng: -75.1652 },
  { lat: 39.9578, lng: -75.1672 },
  { lat: 39.9606, lng: -75.1685 },
  { lat: 39.9638, lng: -75.1716 },
  { lat: 39.9662, lng: -75.1762 },
]

const floodShallowRibbon: RoutePoint[] = [
  { lat: 39.9567, lng: -75.1629 },
  { lat: 39.9587, lng: -75.1655 },
  { lat: 39.9612, lng: -75.1673 },
  { lat: 39.9642, lng: -75.1712 },
  { lat: 39.9665, lng: -75.1753 },
]

const traceBeacons: NamedRoutePoint[] = [
  { lat: 39.96017, lng: -75.1612, label: "①", color: "#ff4fd8" },
  { lat: 39.96108, lng: -75.1662, label: "②", color: "#ff4fd8" },
  { lat: 39.96287, lng: -75.17435, label: "③", color: "#ff4fd8" },
  { lat: 39.96486, lng: -75.18315, label: "④", color: "#ff4fd8" },
  { lat: 39.96619, lng: -75.19082, label: "⑤", color: "#ff4fd8" },
]

const accessMarkers: NamedRoutePoint[] = [
  { lat: 39.96034, lng: -75.16045, label: "East access", color: "#5dff8b" },
  { lat: 39.96182, lng: -75.17016, label: "Broad access", color: "#5dff8b" },
  { lat: 39.96508, lng: -75.18272, label: "Tunnel entry", color: "#5dff8b" },
  { lat: 39.96555, lng: -75.18605, label: "Vent / egress A", color: "#5dff8b" },
  { lat: 39.96602, lng: -75.189, label: "Vent / egress B", color: "#5dff8b" },
]

const sectionLabels: NamedRoutePoint[] = [
  { lat: 39.96055, lng: -75.1627, label: "VIADUCT", color: "#ffd966" },
  { lat: 39.96315, lng: -75.1762, label: "CUT", color: "#ffb347" },
  { lat: 39.96585, lng: -75.1892, label: "TUNNEL", color: "#ff4fd8" },
]

const pilotBoundary: RoutePoint[] = [
  { lat: 39.95935, lng: -75.1578 },
  { lat: 39.9612, lng: -75.1712 },
  { lat: 39.9634, lng: -75.1799 },
  { lat: 39.96685, lng: -75.1921 },
  { lat: 39.9642, lng: -75.1944 },
  { lat: 39.95995, lng: -75.1815 },
]

const undergroundAssets: Array<RoutePoint & { label: string }> = [
  { lat: 39.96485, lng: -75.1879, label: "City Branch tunnel vault" },
  { lat: 39.96195, lng: -75.1682, label: "Broad freight-air-rights zone" },
  { lat: 39.9558, lng: -75.1652, label: "Center City concourse segment" },
  { lat: 39.95595, lng: -75.1822, label: "30th lower-level tunnel" },
]

function statusColor(status: RootStatusClass) {
  if (status === "grounded") return "#5dff8b"
  if (status === "advancing") return "#12f7ff"
  if (status === "provisional") return "#ffd966"
  if (status === "constrained") return "#ff9a3c"
  if (status === "blocked") return "#ff5c6d"
  return "#8c7dff"
}

function scenarioHeightMultiplier(scenario: TwinScenario) {
  if (scenario === "A") return 0.2
  if (scenario === "B") return 0.65
  return 1
}

function makeLocalProjector(points: RoutePoint[]) {
  const minLat = Math.min(...points.map((point) => point.lat))
  const maxLat = Math.max(...points.map((point) => point.lat))
  const minLng = Math.min(...points.map((point) => point.lng))
  const maxLng = Math.max(...points.map((point) => point.lng))
  const centerLat = (minLat + maxLat) / 2
  const centerLng = (minLng + maxLng) / 2
  const lngScale = Math.cos((centerLat * Math.PI) / 180) * 111_320
  const latScale = 111_320

  return (point: RoutePoint, elevation = 0) =>
    new THREE.Vector3(
      (point.lng - centerLng) * lngScale * -0.065,
      elevation,
      (point.lat - centerLat) * latScale * 0.065,
    )
}

function createLabelSprite(text: string, width = 512) {
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = 128
  const context = canvas.getContext("2d")
  if (!context) {
    return new THREE.Sprite(new THREE.SpriteMaterial({ color: "#b9fbff" }))
  }

  context.clearRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = "rgba(4,16,24,0.82)"
  context.strokeStyle = "rgba(18,247,255,0.45)"
  context.lineWidth = 4
  context.roundRect(16, 16, canvas.width - 32, 96, 18)
  context.fill()
  context.stroke()
  context.font = "32px JetBrains Mono, monospace"
  context.fillStyle = "#dffcff"
  context.textAlign = "center"
  context.textBaseline = "middle"
  context.fillText(text, canvas.width / 2, 64)

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
    }),
  )
  sprite.scale.set(7.5, 1.9, 1)
  return sprite
}

function curveFromPoints(points: THREE.Vector3[]) {
  return new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.1)
}

function createPolyline(points: THREE.Vector3[], color: string, opacity = 1) {
  return new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(points),
    new THREE.LineBasicMaterial({
      color,
      transparent: opacity < 1,
      opacity,
    }),
  )
}

function createRouteTube(points: THREE.Vector3[], color: string, radius: number) {
  const curve = curveFromPoints(points)
  return new THREE.Mesh(
    new THREE.TubeGeometry(curve, Math.max(points.length * 16, 32), radius, 16, false),
    new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.08,
      roughness: 0.58,
      metalness: 0.18,
    }),
  )
}

function ribbonGeometry(points: THREE.Vector3[], width: number) {
  const left: THREE.Vector3[] = []
  const right: THREE.Vector3[] = []

  for (let index = 0; index < points.length; index += 1) {
    const current = points[index]
    const prev = points[Math.max(index - 1, 0)]
    const next = points[Math.min(index + 1, points.length - 1)]
    const tangent = next.clone().sub(prev).normalize()
    const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize()
    left.push(current.clone().addScaledVector(normal, width / 2))
    right.push(current.clone().addScaledVector(normal, -width / 2))
  }

  const vertices: number[] = []
  const indices: number[] = []
  const all = [...left, ...right]
  all.forEach((point) => vertices.push(point.x, point.y, point.z))

  for (let index = 0; index < left.length - 1; index += 1) {
    const a = index
    const b = index + 1
    const c = right.length + index
    const d = right.length + index + 1
    indices.push(a, b, c, b, d, c)
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}

function createSectionLabel(section: RouteSection, points: THREE.Vector3[]) {
  const midpoint = points[Math.floor(points.length / 2)].clone()
  const label = createLabelSprite(section.label, 420)
  label.position.copy(midpoint.add(new THREE.Vector3(0, 2.2, 0)))
  return label
}

function createPointLabel(point: THREE.Vector3, text: string, width = 420) {
  const label = createLabelSprite(text, width)
  label.position.copy(point)
  return label
}

function drawPolyline(
  context: CanvasRenderingContext2D,
  points: Array<{ x: number; y: number }>,
  color: string,
  width: number,
  alpha = 1,
) {
  if (points.length < 2) return
  context.save()
  context.globalAlpha = alpha
  context.strokeStyle = color
  context.lineWidth = width
  context.lineJoin = "round"
  context.lineCap = "round"
  context.beginPath()
  context.moveTo(points[0].x, points[0].y)
  for (let index = 1; index < points.length; index += 1) {
    context.lineTo(points[index].x, points[index].y)
  }
  context.stroke()
  context.restore()
}

function createBasemapPlane(
  routePoints: RoutePoint[],
  floodPoints: RoutePoint[],
  project: (point: RoutePoint, elevation?: number) => THREE.Vector3,
) {
  const size = 2048
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext("2d")

  if (!context) {
    return null
  }

  context.fillStyle = "#5f666f"
  context.fillRect(0, 0, size, size)

  const routeProjected = routePoints.map((point) => project(point, 0))
  const floodProjected = floodPoints.map((point) => project(point, 0))
  const allGeoPoints = [...routePoints, ...floodPoints]
  const minLat = Math.min(...allGeoPoints.map((point) => point.lat))
  const maxLat = Math.max(...allGeoPoints.map((point) => point.lat))
  const minLng = Math.min(...allGeoPoints.map((point) => point.lng))
  const maxLng = Math.max(...allGeoPoints.map((point) => point.lng))
  const latPad = 0.008
  const lngPad = 0.01
  const bbox = {
    north: maxLat + latPad,
    south: minLat - latPad,
    west: minLng - lngPad,
    east: maxLng + lngPad,
  }

  const allProjected = [...routeProjected, ...floodProjected]
  const minX = Math.min(...allProjected.map((point) => point.x))
  const maxX = Math.max(...allProjected.map((point) => point.x))
  const minZ = Math.min(...allProjected.map((point) => point.z))
  const maxZ = Math.max(...allProjected.map((point) => point.z))
  const pad = 18
  const spanX = Math.max(maxX - minX, 1)
  const spanZ = Math.max(maxZ - minZ, 1)

  const mapPoint = (point: THREE.Vector3) => ({
    x: ((point.x - minX + pad) / (spanX + pad * 2)) * size,
    y: size - (((point.z - minZ + pad) / (spanZ + pad * 2)) * size),
  })

  const mapGeoPoint = (lat: number, lng: number) => ({
    x: ((lng - bbox.west) / (bbox.east - bbox.west)) * size,
    y: ((bbox.north - lat) / (bbox.north - bbox.south)) * size,
  })

  const routeCanvasPoints = routeProjected.map(mapPoint)
  const floodCanvasPoints = floodProjected.map(mapPoint)

  const zoom = 14
  const tileSize = 256
  const lonToTileX = (lng: number, level: number) => ((lng + 180) / 360) * 2 ** level
  const latToTileY = (lat: number, level: number) => {
    const rad = (lat * Math.PI) / 180
    return ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * 2 ** level
  }
  const tileXToLon = (x: number, level: number) => (x / 2 ** level) * 360 - 180
  const tileYToLat = (y: number, level: number) => {
    const n = Math.PI - (2 * Math.PI * y) / 2 ** level
    return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)))
  }

  const minTileX = Math.floor(lonToTileX(bbox.west, zoom))
  const maxTileX = Math.floor(lonToTileX(bbox.east, zoom))
  const minTileY = Math.floor(latToTileY(bbox.north, zoom))
  const maxTileY = Math.floor(latToTileY(bbox.south, zoom))

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  texture.anisotropy = 8

  const drawTile = (url: string, alpha = 1) => {
    for (let x = minTileX; x <= maxTileX; x += 1) {
      for (let y = minTileY; y <= maxTileY; y += 1) {
        const west = tileXToLon(x, zoom)
        const east = tileXToLon(x + 1, zoom)
        const north = tileYToLat(y, zoom)
        const south = tileYToLat(y + 1, zoom)
        const topLeft = mapGeoPoint(north, west)
        const bottomRight = mapGeoPoint(south, east)
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = () => {
          context.save()
          context.globalAlpha = alpha
          context.drawImage(
            img,
            topLeft.x,
            topLeft.y,
            Math.max(bottomRight.x - topLeft.x, tileSize * 0.2),
            Math.max(bottomRight.y - topLeft.y, tileSize * 0.2),
          )
          context.restore()
          drawOverlay()
          texture.needsUpdate = true
        }
        img.src = url.replace("{z}", String(zoom)).replace("{y}", String(y)).replace("{x}", String(x))
      }
    }
  }

  const drawOverlay = () => {
    context.save()
    context.fillStyle = "rgba(44,65,90,0.62)"
    context.beginPath()
    context.moveTo(floodCanvasPoints[0].x - 120, floodCanvasPoints[0].y + 150)
    floodCanvasPoints.forEach((point) => context.lineTo(point.x, point.y))
    context.lineTo(floodCanvasPoints[floodCanvasPoints.length - 1].x + 160, floodCanvasPoints[floodCanvasPoints.length - 1].y + 220)
    context.lineTo(floodCanvasPoints[0].x - 160, floodCanvasPoints[0].y + 240)
    context.closePath()
    context.fill()
    context.restore()

    drawPolyline(context, routeCanvasPoints, "rgba(230,236,242,0.18)", 12, 1)
    drawPolyline(context, routeCanvasPoints, "rgba(255,255,255,0.08)", 4, 1)

    context.fillStyle = "rgba(255,255,255,0.36)"
    context.font = "88px JetBrains Mono, monospace"
    context.fillText("Philadelphia", size * 0.58, size * 0.8)
  }

  drawOverlay()
  drawTile(
    "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    1,
  )
  drawTile(
    "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}",
    0.95,
  )

  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(220, 180),
    new THREE.MeshStandardMaterial({
      map: texture,
      transparent: true,
      opacity: 0.94,
      roughness: 0.95,
      metalness: 0.02,
    }),
  )
  plane.rotation.x = -Math.PI / 2
  plane.position.set(0, -0.45, 0)
  plane.receiveShadow = false
  return plane
}

function makeMeta(
  id: string,
  label: string,
  category: ProceduralSelectionMeta["category"],
  summary: string,
  options: Omit<ProceduralSelectionMeta, "id" | "label" | "category" | "summary"> = {},
): ProceduralSelectionMeta {
  return {
    id,
    label,
    category,
    summary,
    ...options,
  }
}

function applyMeta(object: THREE.Object3D, meta: ProceduralSelectionMeta) {
  object.userData.proceduralMeta = meta
  return object
}

export type CorridorTrack = {
  curve: THREE.CatmullRomCurve3
  section: "viaduct" | "cut" | "tunnel"
  elevation: number
  speed: number
}

export function getCorridorTracks(): CorridorTrack[] {
  const allPoints = [
    ...phase16Alignment, ...tracedRoute, ...floodRibbon,
    ...floodShallowRibbon, ...undergroundAssets, ...traceBeacons,
    ...accessMarkers, ...sectionLabels, ...pilotBoundary,
  ]
  const project = makeLocalProjector(allPoints)
  return [
    {
      curve: new THREE.CatmullRomCurve3(tunnelSection.points.map(p => project(p, tunnelSection.zOffset - 1.2)), false, "catmullrom", 0.1),
      section: "tunnel",
      elevation: tunnelSection.zOffset - 1.2,
      speed: 0.055,
    },
    {
      curve: new THREE.CatmullRomCurve3(viaductSection.points.map(p => project(p, viaductSection.zOffset - 0.8)), false, "catmullrom", 0.1),
      section: "viaduct",
      elevation: viaductSection.zOffset - 0.8,
      speed: 0.04,
    },
    {
      curve: new THREE.CatmullRomCurve3(cutSection.points.map(p => project(p, cutSection.zOffset - 0.8)), false, "catmullrom", 0.1),
      section: "cut",
      elevation: cutSection.zOffset - 0.8,
      speed: 0.045,
    },
  ]
}

export function createProceduralCorridorModel(
  twin: DigitalTwinState,
  engine: TwinEngineState,
  scenario: TwinScenario,
) {
  const group = new THREE.Group()
  group.name = `Twin procedural scaffold / Scenario ${scenario}`

  const allPoints = [
    ...phase16Alignment,
    ...tracedRoute,
    ...floodRibbon,
    ...floodShallowRibbon,
    ...undergroundAssets,
    ...traceBeacons,
    ...accessMarkers,
    ...sectionLabels,
    ...pilotBoundary,
  ]
  const project = makeLocalProjector(allPoints)
  const objectStatusMap = new Map(engine.objectStatuses.map((item) => [item.id, item]))
  const proofMap = new Map(twin.proofBurdens.map((burden) => [burden.id, burden]))
  const overHeightMultiplier = scenarioHeightMultiplier(scenario)

  const basemapPlane = createBasemapPlane(phase16Alignment, floodRibbon, project)
  if (basemapPlane) {
    group.add(
      applyMeta(
        basemapPlane,
        makeMeta(
          "philly.basemap",
          "Philadelphia basemap",
          "reference",
          "Grayscale city reference plane under the corridor so the twin stays anchored to the existing city fabric.",
          {
            status: "reference",
            nextBestMove: "Replace the procedural grayscale plane with a real georeferenced tile or parcel basemap when the stack is ready.",
          },
        ),
      ),
    )
  }

  const sectionMeta = {
    viaduct: makeMeta(
      "section.viaduct",
      "Viaduct section",
      "section",
      "East viaduct alignment where inherited corridor proof is visually strongest and lease-path proof still matters most.",
      {
        status: objectStatusMap.get("east-viaduct")?.status,
        blockingRisk: twin.anchors[0]?.blockingRisk,
        unlockIfResolved: twin.anchors[0]?.unlockIfResolved,
        nextBestMove: twin.anchors[0]?.nextBestMove,
        dependencies: twin.anchors[0]?.dependencies.map((dependency) => dependency.label),
        linkedProofs: twin.anchors[0]?.proofBurdenLinks.map((proofId) => proofMap.get(proofId)?.title ?? proofId),
      },
    ),
    cut: makeMeta(
      "section.cut",
      "Cut section",
      "section",
      "Mid-corridor open cut where flood, geometry, and access logic start to converge into a real constraint stack.",
      {
        status: objectStatusMap.get("cut-section")?.status,
        blockingRisk: twin.anchors[1]?.blockingRisk,
        unlockIfResolved: twin.anchors[1]?.unlockIfResolved,
        nextBestMove: twin.anchors[1]?.nextBestMove,
        dependencies: twin.anchors[1]?.dependencies.map((dependency) => dependency.label),
        linkedProofs: twin.anchors[1]?.proofBurdenLinks.map((proofId) => proofMap.get(proofId)?.title ?? proofId),
      },
    ),
    tunnel: makeMeta(
      "section.tunnel",
      "Tunnel section",
      "section",
      "West tunnel and covered continuation where inherited asset reuse is strongest but access and service proof still gate activation.",
      {
        status: objectStatusMap.get("west-tunnel")?.status,
        blockingRisk: twin.anchors[2]?.blockingRisk,
        unlockIfResolved: twin.anchors[2]?.unlockIfResolved,
        nextBestMove: twin.anchors[2]?.nextBestMove,
        dependencies: twin.anchors[2]?.dependencies.map((dependency) => dependency.label),
        linkedProofs: twin.anchors[2]?.proofBurdenLinks.map((proofId) => proofMap.get(proofId)?.title ?? proofId),
      },
    ),
  }

  const boundaryPoints = pilotBoundary.map((point) => project(point, 0.1))
  const boundaryMesh = applyMeta(new THREE.Mesh(
    ribbonGeometry([...boundaryPoints, boundaryPoints[0]].map((point) => point.clone().add(new THREE.Vector3(0, 0, 0))), 16),
    new THREE.MeshStandardMaterial({
      color: "#12f7ff",
      transparent: true,
      opacity: 0.05,
      side: THREE.DoubleSide,
    }),
  ), makeMeta(
    "pilot.boundary",
    "Pilot boundary",
    "boundary",
    "Study envelope for the City Branch pilot, used to keep the twin grounded in one corridor slice instead of drifting into a whole-city model.",
    {
      status: "advancing",
      nextBestMove: "Bind parcel, ownership, and route authority objects to this envelope.",
    },
  ))
  group.add(boundaryMesh)
  group.add(
    applyMeta(
      createPolyline([...boundaryPoints, boundaryPoints[0]], "#12f7ff", 0.35),
      makeMeta(
        "pilot.boundary-line",
        "Pilot boundary outline",
        "boundary",
        "Outline of the current pilot study boundary.",
      ),
    ),
  )

  const floodConstraint = twin.floodConstraints.find((constraint) => constraint.impact === "constraint")
  const floodOpacity = floodConstraint?.rootStatusClass === "grounded" ? 0.16 : 0.3
  const floodPoints = floodRibbon.map((point) => project(point, 0.24))
  const floodRibbonMesh = applyMeta(new THREE.Mesh(
    ribbonGeometry(floodPoints, 9),
    new THREE.MeshStandardMaterial({
      color: "#1f4dff",
      transparent: true,
      opacity: floodOpacity,
      side: THREE.DoubleSide,
    }),
  ), makeMeta(
    "flood.500",
    "Flood context band",
    "flood",
    twin.floodConstraints[0]?.relevance ?? "Broader flood context band.",
    {
      status: objectStatusMap.get("flood-500")?.status,
      blockingRisk: twin.floodConstraints[0]?.blockingRisk,
      unlockIfResolved: twin.floodConstraints[0]?.unlockIfResolved,
      nextBestMove: twin.floodConstraints[0]?.nextBestMove,
      dependencies: twin.floodConstraints[0]?.dependencies.map((dependency) => dependency.label),
      linkedProofs: twin.floodConstraints[0]?.proofBurdenLinks.map((proofId) => proofMap.get(proofId)?.title ?? proofId),
    },
  ))
  group.add(floodRibbonMesh)

  const flood100Points = floodShallowRibbon.map((point) => project(point, 0.36))
  const flood100RibbonMesh = applyMeta(new THREE.Mesh(
    ribbonGeometry(flood100Points, 7.25),
    new THREE.MeshStandardMaterial({
      color: "#5ec8ff",
      transparent: true,
      opacity: 0.14,
      side: THREE.DoubleSide,
    }),
  ), makeMeta(
    "flood.100",
    "Flood constraint band",
    "flood",
    twin.floodConstraints[1]?.relevance ?? "Primary flood constraint band.",
    {
      status: objectStatusMap.get("flood-100")?.status,
      blockingRisk: twin.floodConstraints[1]?.blockingRisk,
      unlockIfResolved: twin.floodConstraints[1]?.unlockIfResolved,
      nextBestMove: twin.floodConstraints[1]?.nextBestMove,
      dependencies: twin.floodConstraints[1]?.dependencies.map((dependency) => dependency.label),
      linkedProofs: twin.floodConstraints[1]?.proofBurdenLinks.map((proofId) => proofMap.get(proofId)?.title ?? proofId),
    },
  ))
  group.add(flood100RibbonMesh)

  const shallowFloodMesh = applyMeta(new THREE.Mesh(
    ribbonGeometry(floodPoints.map((point) => point.clone().add(new THREE.Vector3(0.4, 0, 4.2))), 6.5),
    new THREE.MeshStandardMaterial({
      color: "#5ec8ff",
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide,
    }),
  ), makeMeta(
    "flood.shallow-offset",
    "Flood offset read",
    "flood",
    "Secondary flood read that thickens the river-side context around the pilot corridor.",
  ))
  group.add(shallowFloodMesh)

  const referenceCurvePoints = phase16Alignment.map((point) => project(point, 7.2))
  const referenceLine = applyMeta(
    createPolyline(referenceCurvePoints, "#ffd966", 0.4),
    makeMeta(
      "route.reference",
      "Reference alignment",
      "reference",
      "Inherited/reference corridor line carried over from the map as the baseline alignment spine.",
      {
        nextBestMove: "Keep comparing this spine to the active traced route and collapse the deltas into stronger evidence.",
      },
    ),
  )
  group.add(referenceLine)

  tracedRoute.forEach((point, index) => {
    const referencePoint = phase16Alignment[Math.min(index, phase16Alignment.length - 1)]
    const current = project(point, 7)
    const reference = project(referencePoint, 7)
    const delta = applyMeta(
      createPolyline([reference, current], "#ff9a3c", 0.75),
      makeMeta(
        `trace.delta.${index + 1}`,
        `Trace delta ${index + 1}`,
        "delta",
        "Difference between the inherited/reference alignment and the active traced route at this checkpoint.",
        {
          status: objectStatusMap.get("geometry-proof")?.status,
          blockingRisk: proofMap.get("geometry-proof")?.blockingRisk,
          unlockIfResolved: proofMap.get("geometry-proof")?.unlockIfResolved,
          nextBestMove: proofMap.get("geometry-proof")?.nextBestMove,
          dependencies: proofMap.get("geometry-proof")?.dependencies.map((dependency) => dependency.label),
          linkedProofs: [proofMap.get("geometry-proof")?.title ?? "Geometry and alignment proof"],
        },
      ),
    )
    group.add(delta)
  })

  const underStatus = objectStatusMap.get("under.metabolic-trunk")
  const trunkRadius = underStatus?.status === "ready" ? 0.78 : underStatus?.status === "advancing" ? 0.62 : 0.48
  const trunkCurvePoints = tracedRoute.map((point) => project(point, 2.8))
  const underTrunk = applyMeta(
    createRouteTube(trunkCurvePoints, "#ff9a3c", trunkRadius),
    makeMeta(
      "under.metabolic-trunk",
      "Metabolic trunk",
      "under-layer",
      twin.underLayer.metabolicTrunk.items.join(" / "),
      {
        status: underStatus?.status,
        blockingRisk: twin.underLayer.metabolicTrunk.blockingRisk,
        unlockIfResolved: twin.underLayer.metabolicTrunk.unlockIfResolved,
        nextBestMove: twin.underLayer.metabolicTrunk.nextBestMove,
        dependencies: twin.underLayer.metabolicTrunk.dependencies.map((dependency) => dependency.label),
        linkedProofs: twin.underLayer.metabolicTrunk.proofBurdenLinks.map((proofId) => proofMap.get(proofId)?.title ?? proofId),
      },
    ),
  )
  group.add(underTrunk)

  const sections = [viaductSection, cutSection, tunnelSection]
  sections.forEach((section) => {
    const sectionPoints = section.points.map((point) => project(point, section.zOffset))
    const tube = applyMeta(
      createRouteTube(sectionPoints, section.color, 1.05),
      section.id === "viaduct" ? sectionMeta.viaduct : section.id === "cut" ? sectionMeta.cut : sectionMeta.tunnel,
    )
    group.add(tube)
    group.add(
      applyMeta(
        createSectionLabel(section, sectionPoints),
        section.id === "viaduct" ? sectionMeta.viaduct : section.id === "cut" ? sectionMeta.cut : sectionMeta.tunnel,
      ),
    )

    if (scenario !== "A") {
      const capCurve = sectionPoints.map((point, index) =>
        point.clone().add(new THREE.Vector3(0, 3.2 + overHeightMultiplier * (1.5 + index * 0.18), 0)),
      )
      const cap = applyMeta(
        createRouteTube(capCurve, "#ff4fd8", scenario === "B" ? 1.3 : 1.9),
        makeMeta(
          `over.cap.${section.id}.${scenario}`,
          `${section.label} over-layer`,
          "section",
          scenario === "B"
            ? "Scenario B cap logic layered above the inherited corridor path."
            : "Scenario C integrated over-layer buildout layered above the inherited corridor path.",
          {
            status: objectStatusMap.get("over.cap-strategy")?.status,
            blockingRisk: twin.overLayer.capStrategy.blockingRisk,
            unlockIfResolved: twin.overLayer.capStrategy.unlockIfResolved,
            nextBestMove: twin.overLayer.capStrategy.nextBestMove,
            dependencies: twin.overLayer.capStrategy.dependencies.map((dependency) => dependency.label),
            linkedProofs: twin.overLayer.capStrategy.proofBurdenLinks.map((proofId) => proofMap.get(proofId)?.title ?? proofId),
          },
        ),
      )
      ;(cap.material as THREE.MeshStandardMaterial).transparent = true
      ;(cap.material as THREE.MeshStandardMaterial).opacity = scenario === "B" ? 0.16 : 0.24
      group.add(cap)
    }

    if (scenario === "C") {
      const civicCurve = sectionPoints.map((point) => point.clone().add(new THREE.Vector3(0, 7.3, 0)))
      const civicDeck = applyMeta(
        createRouteTube(civicCurve, "#d98cff", 0.52),
        makeMeta(
          `over.civic.${section.id}`,
          `${section.label} civic deck`,
          "section",
          "Scenario C civic/interface layer sitting above the proved corridor spine.",
          {
            status: objectStatusMap.get("over.civic-interface")?.status,
            blockingRisk: twin.overLayer.civicInterface.blockingRisk,
            unlockIfResolved: twin.overLayer.civicInterface.unlockIfResolved,
            nextBestMove: twin.overLayer.civicInterface.nextBestMove,
            dependencies: twin.overLayer.civicInterface.dependencies.map((dependency) => dependency.label),
            linkedProofs: twin.overLayer.civicInterface.proofBurdenLinks.map((proofId) => proofMap.get(proofId)?.title ?? proofId),
          },
        ),
      )
      group.add(civicDeck)
    }
  })

  tracedRoute.forEach((point, index) => {
    const anchor = twin.anchors[Math.min(index, twin.anchors.length - 1)]
    const status = anchor ? statusColor(anchor.rootStatusClass) : "#12f7ff"
    const mapped = project(point, index < 4 ? 9.8 : index < 8 ? 6.6 : 3.9)

    const marker = applyMeta(new THREE.Mesh(
      new THREE.SphereGeometry(0.38, 20, 20),
      new THREE.MeshStandardMaterial({
        color: "#dffcff",
        emissive: status,
        emissiveIntensity: 0.32,
      }),
    ), makeMeta(
      `trace.point.${index + 1}`,
      `Trace point ${index + 1}`,
      "trace",
      "Checkpoint on the active traced corridor path used to turn the 2D map line into a 3D route spine.",
      {
        status: objectStatusMap.get("geometry-proof")?.status,
        nextBestMove: proofMap.get("geometry-proof")?.nextBestMove,
        dependencies: proofMap.get("geometry-proof")?.dependencies.map((dependency) => dependency.label),
        linkedProofs: [proofMap.get("geometry-proof")?.title ?? "Geometry and alignment proof"],
      },
    ))
    marker.position.copy(mapped)
    group.add(marker)
  })

  traceBeacons.forEach((beacon) => {
    const point = project(beacon, 10.8)
    const beaconMeta = makeMeta(
      `beacon.${beacon.label}`,
      `Proof beacon ${beacon.label}`,
      "beacon",
      "Active proof target carried over from the map HUD into the 3D twin.",
      {
        status: objectStatusMap.get("geometry-proof")?.status,
        blockingRisk: proofMap.get("geometry-proof")?.blockingRisk,
        unlockIfResolved: proofMap.get("geometry-proof")?.unlockIfResolved,
        nextBestMove: proofMap.get("geometry-proof")?.nextBestMove,
        dependencies: proofMap.get("geometry-proof")?.dependencies.map((dependency) => dependency.label),
        linkedProofs: [proofMap.get("geometry-proof")?.title ?? "Geometry and alignment proof"],
      },
    )
    const marker = applyMeta(new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 16, 16),
      new THREE.MeshStandardMaterial({
        color: beacon.color ?? "#ff4fd8",
        emissive: beacon.color ?? "#ff4fd8",
        emissiveIntensity: 0.3,
      }),
    ), beaconMeta)
    marker.position.copy(point)
    group.add(marker)

    const label = applyMeta(createPointLabel(point.clone().add(new THREE.Vector3(0, 1.45, 0)), beacon.label, 180), beaconMeta)
    group.add(label)
  })

  twin.anchors.forEach((anchor, index) => {
    const routeIndex = index === 0 ? 1 : index === 1 ? 5 : index === 2 ? 8 : 9
    const point = tracedRoute[routeIndex]
    const xz = project(point, 0)
    const y =
      anchor.kind === "viaduct" ? 11 :
      anchor.kind === "cut" ? 7 :
      anchor.kind === "tunnel" ? 5 :
      12.5
    const towerHeight =
      anchor.kind === "node" ? 9.5 : anchor.kind === "viaduct" ? 10.8 : anchor.kind === "cut" ? 6.8 : 5.2

    const anchorMeta = makeMeta(
      anchor.id,
      anchor.label,
      "anchor",
      `${anchor.kind} anchor with ${anchor.confidenceClass} confidence and ${anchor.evidence} evidence.`,
      {
        status: objectStatusMap.get(anchor.id)?.status,
        blockingRisk: anchor.blockingRisk,
        unlockIfResolved: anchor.unlockIfResolved,
        nextBestMove: anchor.nextBestMove,
        dependencies: anchor.dependencies.map((dependency) => dependency.label),
        linkedProofs: anchor.proofBurdenLinks.map((proofId) => proofMap.get(proofId)?.title ?? proofId),
      },
    )
    const tower = applyMeta(new THREE.Mesh(
      new THREE.CylinderGeometry(0.72, 0.9, towerHeight, 18),
      new THREE.MeshStandardMaterial({
        color: statusColor(anchor.rootStatusClass),
        emissive: statusColor(anchor.rootStatusClass),
        emissiveIntensity: 0.12,
        roughness: 0.48,
        metalness: 0.18,
      }),
    ), anchorMeta)
    tower.position.set(xz.x, y, xz.z)
    group.add(tower)

    const label = applyMeta(createLabelSprite(anchor.label, 460), anchorMeta)
    label.position.set(xz.x, y + towerHeight / 2 + 2.1, xz.z)
    group.add(label)
  })

  accessMarkers.forEach((asset) => {
    const point = project(asset, 1.8)
    const accessMeta = makeMeta(
      `access.${asset.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      asset.label,
      "access",
      "Access, ventilation, or service interface marker pulled into the 3D twin from the corridor map.",
      {
        status: objectStatusMap.get("under.access-ventilation")?.status,
        blockingRisk: twin.underLayer.accessAndVentilation.blockingRisk,
        unlockIfResolved: twin.underLayer.accessAndVentilation.unlockIfResolved,
        nextBestMove: twin.underLayer.accessAndVentilation.nextBestMove,
        dependencies: twin.underLayer.accessAndVentilation.dependencies.map((dependency) => dependency.label),
        linkedProofs: twin.underLayer.accessAndVentilation.proofBurdenLinks.map((proofId) => proofMap.get(proofId)?.title ?? proofId),
      },
    )
    const marker = applyMeta(new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.35, 1.9, 12),
      new THREE.MeshStandardMaterial({
        color: asset.color ?? "#5dff8b",
        emissive: asset.color ?? "#5dff8b",
        emissiveIntensity: 0.18,
      }),
    ), accessMeta)
    marker.position.copy(point)
    group.add(marker)
  })

  undergroundAssets.forEach((asset) => {
    const point = project(asset, 1.2)
    const assetMeta = makeMeta(
      `asset.${asset.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      asset.label,
      "asset",
      "Inherited underground asset or dormant corridor segment carried into the 3D twin as a recoverable system object.",
      {
        status: objectStatusMap.get("under.inherited-assets")?.status,
        blockingRisk: twin.underLayer.inheritedAssets.blockingRisk,
        unlockIfResolved: twin.underLayer.inheritedAssets.unlockIfResolved,
        nextBestMove: twin.underLayer.inheritedAssets.nextBestMove,
        dependencies: twin.underLayer.inheritedAssets.dependencies.map((dependency) => dependency.label),
        linkedProofs: twin.underLayer.inheritedAssets.proofBurdenLinks.map((proofId) => proofMap.get(proofId)?.title ?? proofId),
      },
    )
    const marker = applyMeta(new THREE.Mesh(
      new THREE.TorusGeometry(0.82, 0.1, 12, 32),
      new THREE.MeshStandardMaterial({
        color: "#ffd966",
        emissive: "#7a5b10",
        emissiveIntensity: 0.15,
      }),
    ), assetMeta)
    marker.rotation.x = Math.PI / 2
    marker.position.copy(point)
    group.add(marker)
  })

  sectionLabels.forEach((section) => {
    const point = project(section, 13.2)
    const sectionLabelMeta = section.label === "VIADUCT" ? sectionMeta.viaduct : section.label === "CUT" ? sectionMeta.cut : sectionMeta.tunnel
    const label = applyMeta(createPointLabel(point, section.label, 340), sectionLabelMeta)
    group.add(label)
  })

  // Tunnel shell — translucent envelope showing the inherited tunnel bore
  const tunnelShellPoints = tunnelSection.points.map((point) => project(point, tunnelSection.zOffset))
  const tunnelCurve = curveFromPoints(tunnelShellPoints)
  const tunnelShell = applyMeta(new THREE.Mesh(
    new THREE.TubeGeometry(tunnelCurve, 40, 3.2, 12, false),
    new THREE.MeshStandardMaterial({
      color: "#102a40",
      emissive: "#051520",
      transparent: true,
      opacity: 0.22,
      side: THREE.BackSide,
      roughness: 0.9,
    }),
  ), sectionMeta.tunnel)
  group.add(tunnelShell)

  // Viaduct deck — thin surface above the viaduct section
  const viaductDeckPoints = viaductSection.points.map((point) => project(point, viaductSection.zOffset + 1.2))
  const viaductDeckCurve = curveFromPoints(viaductDeckPoints)
  const viaductDeck = applyMeta(new THREE.Mesh(
    new THREE.TubeGeometry(viaductDeckCurve, 30, 2.8, 8, false),
    new THREE.MeshStandardMaterial({
      color: "#3a2a08",
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide,
    }),
  ), sectionMeta.viaduct)
  group.add(viaductDeck)

  const pilotNodePoint = project({ lat: 39.95595, lng: -75.1822 }, 0)
  const pilotBox = applyMeta(new THREE.Mesh(
    new THREE.BoxGeometry(6.2, 3.2 + overHeightMultiplier * 2.8, 6.2),
    new THREE.MeshStandardMaterial({
      color: "#12f7ff",
      emissive: "#0a4b52",
      emissiveIntensity: 0.08,
      transparent: true,
      opacity: 0.18,
    }),
  ), makeMeta(
    "pilot-node-30th",
    "30th Street pilot node",
    "pilot-node",
    "Pilot hinge where corridor proof is supposed to translate into deployment, revenue, and operator/investor mode switching.",
    {
      status: objectStatusMap.get("pilot-node-30th")?.status,
      blockingRisk: twin.anchors[3]?.blockingRisk,
      unlockIfResolved: twin.anchors[3]?.unlockIfResolved,
      nextBestMove: twin.anchors[3]?.nextBestMove,
      dependencies: twin.anchors[3]?.dependencies.map((dependency) => dependency.label),
      linkedProofs: twin.anchors[3]?.proofBurdenLinks.map((proofId) => proofMap.get(proofId)?.title ?? proofId),
    },
  ))
  pilotBox.position.set(pilotNodePoint.x, 11.4, pilotNodePoint.z + 4)
  group.add(pilotBox)

  return group
}
