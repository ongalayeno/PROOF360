import { GeoPoint, Evidence } from '../types/proof360';

/**
 * Computes authentic SHA-256 hexadecimal hash string from string data
 */
export async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Computes authentic SHA-256 for a File or Blob
 */
export async function sha256Blob(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Computes orthodromic distance (Haversine formula in meters)
 * Matches PostGIS ST_Distance(geography, geography) behavior
 */
export function calculateDistanceMeters(point1: GeoPoint, point2: GeoPoint): number {
  const R = 6371e3; // Earth radius in meters
  const rad = Math.PI / 180;
  const dLat = (point2.lat - point1.lat) * rad;
  const dLng = (point2.lng - point1.lng) * rad;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(point1.lat * rad) *
    Math.cos(point2.lat * rad) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Validates integrity flags for field evidence
 */
export function evaluateEvidenceIntegrity(params: {
  siteCoords: GeoPoint;
  geofenceRadiusMeters: number;
  evidenceCoords: GeoPoint;
  isMockGps: boolean;
  capturedAt: string;
  serverReceivedAt?: string;
  clientHash: string;
  calculatedHash: string;
}): {
  distanceMeters: number;
  isWithinGeofence: boolean;
  flags: string[];
  integrityConfidenceScore: number;
} {
  const flags: string[] = [];
  const distance = calculateDistanceMeters(params.siteCoords, params.evidenceCoords);
  const isWithinGeofence = distance <= params.geofenceRadiusMeters;

  if (!isWithinGeofence) {
    flags.push(`OUTSIDE_GEOFENCE_${distance}M`);
  }

  if (params.isMockGps) {
    flags.push('MOCK_GPS_DETECTED');
  }

  if (params.clientHash.toLowerCase() !== params.calculatedHash.toLowerCase()) {
    flags.push('SHA256_HASH_MISMATCH');
  }

  // Check clock skew
  const capturedTime = new Date(params.capturedAt).getTime();
  const serverTime = params.serverReceivedAt ? new Date(params.serverReceivedAt).getTime() : Date.now();
  if (capturedTime > serverTime + 60000) {
    flags.push('ANACHRONISTIC_TIMESTAMP');
  }

  // Calculate score (out of 100)
  let score = 100;
  if (!isWithinGeofence) {
    const overflow = distance - params.geofenceRadiusMeters;
    if (overflow > 1000) score -= 40;
    else if (overflow > 200) score -= 25;
    else score -= 15;
  }
  if (params.isMockGps) score -= 50;
  if (params.clientHash !== params.calculatedHash) score -= 60;
  if (flags.includes('ANACHRONISTIC_TIMESTAMP')) score -= 20;

  return {
    distanceMeters: distance,
    isWithinGeofence,
    flags,
    integrityConfidenceScore: Math.max(0, Math.min(100, score)),
  };
}

/**
 * Point-in-Polygon (Ray-Casting Algorithm)
 * PostGIS equivalent: ST_Contains(zone_geometry, ST_SetSRID(ST_MakePoint(lng, lat), 4326))
 * Coordinates format: [ [ [lng, lat], [lng, lat], ... ] ]
 */
export function isPointInsidePolygon(point: GeoPoint, polygonCoordinates: number[][][]): boolean {
  const ring = polygonCoordinates[0];
  if (!ring || ring.length < 3) return false;

  let inside = false;
  const x = point.lng;
  const y = point.lat;

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];

    const intersect = ((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }

  return inside;
}

/**
 * Calculates surface area of a GeoJSON Polygon in hectares
 * Using spherical polygon geodesic approximation
 * 1 hectare = 10,000 square meters
 */
export function calculatePolygonAreaHectares(coordinates: number[][][]): number {
  const ring = coordinates[0];
  if (!ring || ring.length < 3) return 0;

  const R = 6371e3; // Earth radius in meters
  let totalArea = 0;

  for (let i = 0; i < ring.length - 1; i++) {
    const p1 = ring[i];
    const p2 = ring[i + 1];

    const lambda1 = (p1[0] * Math.PI) / 180;
    const lambda2 = (p2[0] * Math.PI) / 180;
    const phi1 = (p1[1] * Math.PI) / 180;
    const phi2 = (p2[1] * Math.PI) / 180;

    totalArea += (lambda2 - lambda1) * (2 + Math.sin(phi1) + Math.sin(phi2));
  }

  totalArea = (Math.abs(totalArea) * R * R) / 2;
  const hectares = totalArea / 10000;
  return Number(hectares.toFixed(2));
}

/**
 * Calculates perimeter length of a GeoJSON Polygon in kilometers
 */
export function calculatePolygonPerimeterKm(coordinates: number[][][]): number {
  const ring = coordinates[0];
  if (!ring || ring.length < 2) return 0;

  let totalMeters = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    const p1 = { lng: ring[i][0], lat: ring[i][1] };
    const p2 = { lng: ring[i + 1][0], lat: ring[i + 1][1] };
    totalMeters += calculateDistanceMeters(p1, p2);
  }

  return Number((totalMeters / 1000).toFixed(2));
}

/**
 * Calculates cryptographic audit ledger entry hash
 * Hash_n = SHA256(previousHash + action + entityId + JSON(payload))
 */
export async function computeAuditEntryHash(
  previousHash: string,
  entry: {
    action: string;
    entityType: string;
    entityId: string;
    actorName: string;
    timestamp: string;
    payload: Record<string, any>;
  }
): Promise<string> {
  const rawString = `${previousHash}|${entry.action}|${entry.entityType}|${entry.entityId}|${entry.actorName}|${entry.timestamp}|${JSON.stringify(entry.payload)}`;
  return await sha256(rawString);
}

