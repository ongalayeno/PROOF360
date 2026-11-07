import { ProjectZoneFeatureCollection, ProjectZoneFeature, GeoJsonPolygon } from '../types/proof360';

/**
 * GeoJSON Data Provider for PROOF360 RDC
 * Supplies standard GeoJSON FeatureCollection containing project polygons:
 * - Protection catchments (Périmètres de captage WASH)
 * - Cadastral concessions (Concessions scolaires / sanitaires BTP)
 * - Microgrid distribution coverage (Zones de desserte solaire ANSER)
 * - Road right-of-ways (Emprises de corridors routiers)
 */
export const DRC_PROJECT_ZONES_GEOJSON: ProjectZoneFeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: 'feat-wash-maluku-catchment',
      siteId: 'site-wash-maluku',
      properties: {
        name: 'Périmètre de Protection Hydraulique Maluku Centre',
        siteName: 'Forage Solaire & Borne-Fontaine Maluku Centre',
        province: 'Kinshasa',
        territory: 'Maluku',
        zoneType: 'CATCHMENT_PROTECTION',
        areaHectares: 14.2,
        perimeterKm: 1.62,
        fillColor: '#0284c7', // Sky blue
        strokeColor: '#0369a1',
        description: 'Zone de servitude et de non-pollution immédiate protégeant la nappe phréatique du forage solaire.',
        status: 'VERIFIED',
        cadastralRef: 'SERV-MRH-KIN-2026-08'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [15.6510, -4.3130],
            [15.6580, -4.3142],
            [15.6575, -4.3195],
            [15.6520, -4.3208],
            [15.6495, -4.3165],
            [15.6510, -4.3130]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      id: 'feat-btp-lukala-campus',
      siteId: 'site-btp-lukala',
      properties: {
        name: 'Concession Foncière École Primaire Moderne de Lukala',
        siteName: 'École Primaire Moderne de Lukala (6 Salles + Bloc Sanitaire)',
        province: 'Kongo Central',
        territory: 'Mbanza-Ngungu',
        zoneType: 'CADASTRAL_CONCESSION',
        areaHectares: 4.8,
        perimeterKm: 0.94,
        fillColor: '#ea580c', // Orange
        strokeColor: '#c2410c',
        description: 'Parcelle cadastrée octroyée pour le bâtiment principal de 6 classes, le bloc sanitaire et le terrain de récréation.',
        status: 'VERIFIED',
        cadastralRef: 'CAD-KC-LUK-2026-042'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [14.5005, -5.5170],
            [14.5055, -5.5175],
            [14.5050, -5.5205],
            [14.5010, -5.5200],
            [14.5005, -5.5170]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      id: 'feat-solar-madimba-coverage',
      siteId: 'site-solar-madimba',
      properties: {
        name: 'Périmètre de Dessertes & Réseau BT Madimba Gare',
        siteName: 'Mini-Centrale Solaire & Micro-Réseau Madimba Gare',
        province: 'Kongo Central',
        territory: 'Madimba',
        zoneType: 'MICROGRID_GRID_COVERAGE',
        areaHectares: 26.5,
        perimeterKm: 2.18,
        fillColor: '#ca8a04', // Yellow gold
        strokeColor: '#a16207',
        description: 'Zone de raccordement basse tension 400V desservant 450 ménages, le dispensaire et les commerces du centre gare.',
        status: 'VERIFIED',
        cadastralRef: 'ANSER-ELEC-KC-015'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [15.0380, -4.9740],
            [15.0470, -4.9755],
            [15.0465, -4.9825],
            [15.0395, -4.9815],
            [15.0360, -4.9770],
            [15.0380, -4.9740]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      id: 'feat-wash-tshikapa-basin',
      siteId: 'site-wash-tshikapa',
      properties: {
        name: 'Zone d’Infiltration et Périmètre Sanitaire Mabondo',
        siteName: 'Point d’Eau & Puits Foré Mabondo',
        province: 'Kasaï',
        territory: 'Tshikapa',
        zoneType: 'CATCHMENT_PROTECTION',
        areaHectares: 9.6,
        perimeterKm: 1.35,
        fillColor: '#0284c7', // Sky blue
        strokeColor: '#0369a1',
        description: 'Périmètre de protection contre les affouillements et pollutions d’eaux usées en zone périurbaine de Tshikapa.',
        status: 'RESERVE_NOTED',
        cadastralRef: 'SAN-KAS-TSH-2026-03'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [20.7960, -6.4135],
            [20.8035, -6.4145],
            [20.8030, -6.4190],
            [20.7970, -6.4185],
            [20.7960, -6.4135]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      id: 'feat-btp-walungu-hospital',
      siteId: 'site-btp-walungu',
      properties: {
        name: 'Concession Hospitalière Centre de Santé Walungu',
        siteName: 'Centre de Santé de Référence de Walungu',
        province: 'Sud-Kivu',
        territory: 'Walungu',
        zoneType: 'CADASTRAL_CONCESSION',
        areaHectares: 7.2,
        perimeterKm: 1.12,
        fillColor: '#ea580c', // Orange
        strokeColor: '#c2410c',
        description: 'Terrain réservé pour pavillon maternité, médecine interne, incinérateur de déchets médicaux et morgue.',
        status: 'VERIFIED',
        cadastralRef: 'MSP-SK-WAL-09'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [28.6620, -2.6215],
            [28.6690, -2.6225],
            [28.6685, -2.6270],
            [28.6630, -2.6265],
            [28.6620, -2.6215]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      id: 'feat-road-rn1-corridor',
      siteId: 'site-btp-lukala',
      properties: {
        name: 'Emprise de Desserte et Piste d’Accès Chantier Lukala',
        siteName: 'Corridor d’Accès Matadi - Lukala',
        province: 'Kongo Central',
        territory: 'Mbanza-Ngungu',
        zoneType: 'ROAD_RIGHT_OF_WAY',
        areaHectares: 38.0,
        perimeterKm: 3.85,
        fillColor: '#475569', // Slate
        strokeColor: '#334155',
        description: 'Corridor réservé pour la circulation des camions de matériaux lourds et engins de nivellement.',
        status: 'VERIFIED',
        cadastralRef: 'RN1-ACCESS-KC-2026'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [14.4920, -5.5130],
            [14.5120, -5.5145],
            [14.5130, -5.5180],
            [14.4930, -5.5165],
            [14.4920, -5.5130]
          ]
        ]
      }
    }
  ]
};

/**
 * Returns all GeoJSON project zone features
 */
export function getProjectZonesGeoJson(): ProjectZoneFeatureCollection {
  return DRC_PROJECT_ZONES_GEOJSON;
}

/**
 * Finds all polygon zones linked to a specific site
 */
export function getZonesForSite(siteId: string): ProjectZoneFeature[] {
  return DRC_PROJECT_ZONES_GEOJSON.features.filter(f => f.siteId === siteId);
}

/**
 * Computes geographic centroid of a GeoJSON Polygon
 */
export function calculatePolygonCentroid(polygon: GeoJsonPolygon): { lat: number; lng: number } {
  const ring = polygon.coordinates[0];
  if (!ring || ring.length === 0) return { lat: 0, lng: 0 };

  let sumLat = 0;
  let sumLng = 0;
  // Exclude last duplicated point in GeoJSON ring if it equals first
  const count = ring.length > 1 ? ring.length - 1 : ring.length;

  for (let i = 0; i < count; i++) {
    sumLng += ring[i][0];
    sumLat += ring[i][1];
  }

  return {
    lat: sumLat / count,
    lng: sumLng / count
  };
}

/**
 * Validates custom GeoJSON string provided by user
 */
export function validateCustomGeoJson(jsonString: string): {
  valid: boolean;
  error?: string;
  features?: ProjectZoneFeature[];
} {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed.type === 'FeatureCollection' && Array.isArray(parsed.features)) {
      return { valid: true, features: parsed.features };
    }
    if (parsed.type === 'Feature' && parsed.geometry?.type === 'Polygon') {
      return { valid: true, features: [parsed] };
    }
    return {
      valid: false,
      error: 'Le format doit être un FeatureCollection GeoJSON ou un Feature avec geometry Polygon.'
    };
  } catch (err: any) {
    return {
      valid: false,
      error: `Erreur d'analyse JSON: ${err?.message || 'Syntaxe invalide'}`
    };
  }
}
