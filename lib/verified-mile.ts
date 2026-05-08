/**
 * verified-mile.ts
 * Cuttlefish Civilizational Logic — Verified Mile Protocol types
 * Protocol ID: CCL-VMP-001  |  Version: 1.0  |  2026-05-02
 *
 * Import in Corridor Studio components:
 *   import type { VerifiedMileSegment, VerifiedMileStage, LayerStatus } from "@/lib/verified-mile"
 */

// ---------------------------------------------------------------------------
// Geometry primitives (GeoJSON subset)
// ---------------------------------------------------------------------------

export type GeoJsonPosition = [longitude: number, latitude: number] | [longitude: number, latitude: number, altitude: number]

export type GeoJsonPolygon = {
  type: "Polygon"
  /** Outer ring + optional holes. Each ring: array of [lon, lat] pairs, first === last. */
  coordinates: GeoJsonPosition[][]
}

// ---------------------------------------------------------------------------
// Stage progression
// Eight discrete stages. Protocol ID CCL-VMP-001, Part 2.
// ---------------------------------------------------------------------------

export enum VerifiedMileStage {
  CANDIDATE              = "candidate",
  SURVEYED               = "surveyed",
  STRUCTURALLY_VALIDATED = "structurally_validated",
  METABOLIC_READY        = "metabolic_ready",
  COMPUTE_READY          = "compute_ready",
  LOGISTICS_READY        = "logistics_ready",
  CIVIC_LINKED           = "civic_linked",
  VERIFIED_MILE          = "verified_mile",
}

/** Ordered stage list for progression math. */
export const STAGE_ORDER: readonly VerifiedMileStage[] = [
  VerifiedMileStage.CANDIDATE,
  VerifiedMileStage.SURVEYED,
  VerifiedMileStage.STRUCTURALLY_VALIDATED,
  VerifiedMileStage.METABOLIC_READY,
  VerifiedMileStage.COMPUTE_READY,
  VerifiedMileStage.LOGISTICS_READY,
  VerifiedMileStage.CIVIC_LINKED,
  VerifiedMileStage.VERIFIED_MILE,
] as const

/** Returns 0-7 for the given stage, or -1 if not found. */
export function stageIndex(stage: VerifiedMileStage): number {
  return STAGE_ORDER.indexOf(stage)
}

/** True when a segment's stage is at or past the target stage. */
export function hasReachedStage(current: VerifiedMileStage, target: VerifiedMileStage): boolean {
  return stageIndex(current) >= stageIndex(target)
}

// ---------------------------------------------------------------------------
// Layer-level attestation status
// ---------------------------------------------------------------------------

export type LayerStatusValue = "pending" | "in_progress" | "attested" | "regressed"

export type LayerStatus = {
  status: LayerStatusValue
  /** Null until the layer has a submitted evidence package. */
  evidence_package_id: string | null
  /** ISO-8601. Null until attested. */
  attested_at_utc: string | null
  /** CAC ID of the signing attestor. Null until attested. */
  attestor_cac_id: string | null
}

/** Convenience: a LayerStatus for a layer that has not yet been submitted. */
export const PENDING_LAYER: LayerStatus = {
  status: "pending",
  evidence_package_id: null,
  attested_at_utc: null,
  attestor_cac_id: null,
} as const

// ---------------------------------------------------------------------------
// Full Verified Mile segment type
// ---------------------------------------------------------------------------

export type VerifiedMileSegment = {
  // Identity
  /** e.g. "PHL-CB-01" */
  segment_id: string
  /** Null until VERIFIED_MILE stage is reached. e.g. "VML-PHL-CB01-001" */
  vml_id: string | null
  /** Human-readable label. e.g. "City Branch Segment 01" */
  display_name: string
  /** Two- or three-letter city code. e.g. "PHL" */
  city_code: string

  // Stage
  stage: VerifiedMileStage
  /** ISO-8601 timestamp when the current stage was entered. */
  stage_entered_utc: string

  // Five evidence layers
  layers: {
    structural: LayerStatus
    metabolic:  LayerStatus
    compute:    LayerStatus
    logistics:  LayerStatus
    civic:      LayerStatus
  }

  // Capital triggers (T0-T6)
  /** Number of capital triggers unlocked. Range 0-6. */
  capital_triggers_unlocked: number
  siea_disbursement_eligible: boolean
  /** USD. Zero until VERIFIED_MILE stage. $2.5M per VML at full certification. */
  siea_disbursement_amount_usd: number

  // Metabolic Credits (MCR)
  /** Total MCR issued to date. 1 MCR = 1 verified MWhe of metabolic yield. */
  metabolic_credit_balance: number
  /** Current monthly MCR issuance rate. */
  monthly_mcr_rate: number
  /** Attested thermal yield in MW. */
  thermal_yield_mw: number
  /** Attested yield as fraction of modeled projection. 0.0 - 1.0. */
  thermal_yield_pct_of_model: number

  // Civic surface
  civic_credit_total: number
  annual_ret_increment_usd: number
  uplift_zone_new_taxable_value_usd: number

  // Trust / attestation
  /** CAC ID of the primary attestor. Null until first layer is attested. */
  primary_attestor_cac_id: string | null
  /** TrustGraph score of the primary attestor at last attestation event. */
  primary_attestor_trust_score: number
  /** ISO-8601. Null until first layer is attested. */
  last_attestation_utc: string | null

  // Geometry
  bounds: GeoJsonPolygon
  /** Segment length in metres. */
  length_m: number
  /** [min_depth_m, max_depth_m] below grade. */
  depth_range_m: [number, number]
}

// ---------------------------------------------------------------------------
// Pilot segment: City Branch / Reading Viaduct  PHL-CB-01
// ---------------------------------------------------------------------------

/** Canonical identity for the Philadelphia pilot segment. */
export const PHL_CB_01_ID = "PHL-CB-01" as const

/**
 * Returns a zeroed-out VerifiedMileSegment for PHL-CB-01 at CANDIDATE stage.
 * Use as a seed for the digital twin state before any attestation events.
 */
export function makePhlCb01Candidate(): VerifiedMileSegment {
  return {
    segment_id:   PHL_CB_01_ID,
    vml_id:       null,
    display_name: "City Branch / Reading Viaduct Segment 01",
    city_code:    "PHL",

    stage:             VerifiedMileStage.CANDIDATE,
    stage_entered_utc: new Date(0).toISOString(),

    layers: {
      structural: { ...PENDING_LAYER },
      metabolic:  { ...PENDING_LAYER },
      compute:    { ...PENDING_LAYER },
      logistics:  { ...PENDING_LAYER },
      civic:      { ...PENDING_LAYER },
    },

    capital_triggers_unlocked:   0,
    siea_disbursement_eligible:  false,
    siea_disbursement_amount_usd: 0,

    metabolic_credit_balance:    0,
    monthly_mcr_rate:            0,
    thermal_yield_mw:            0,
    thermal_yield_pct_of_model:  0,

    civic_credit_total:                  0,
    annual_ret_increment_usd:            0,
    uplift_zone_new_taxable_value_usd:   0,

    primary_attestor_cac_id:    null,
    primary_attestor_trust_score: 0,
    last_attestation_utc:       null,

    // Approximate bounding polygon for the City Branch corridor
    bounds: {
      type: "Polygon",
      coordinates: [[
        [-75.1652, 39.9526],
        [-75.1580, 39.9526],
        [-75.1580, 39.9580],
        [-75.1652, 39.9580],
        [-75.1652, 39.9526],
      ]],
    },
    length_m:       2832,   // ~1.76 miles
    depth_range_m:  [6, 18],
  }
}
