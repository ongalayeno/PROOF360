import { Site, Mission, Inspection, Anomaly, AuditLedgerEntry } from '../types/proof360';

export const INITIAL_SITES: Site[] = [
  {
    id: 'site-wash-maluku',
    name: 'Forage Solaire & Borne-Fontaine Maluku Centre',
    province: 'Kinshasa',
    territory: 'Maluku',
    organizationName: 'Ministère des Ressources Hydrauliques / REGIDESO Rurale',
    sector: 'WASH',
    coordinates: { lat: -4.3168, lng: 15.6542 },
    geofenceRadiusMeters: 250,
    contractRef: 'CT-2026-MRH-KIN-089',
    beneficiariesCount: 4800,
    budgetUsd: 48000,
    disbursedUsd: 36000
  },
  {
    id: 'site-btp-lukala',
    name: 'École Primaire Moderne de Lukala (6 Salles + Bloc Sanitaire)',
    province: 'Kongo Central',
    territory: 'Mbanza-Ngungu',
    organizationName: 'Cellule d’Exécution PDL-145T (BCECO)',
    sector: 'BTP',
    coordinates: { lat: -5.5186, lng: 14.5028 },
    geofenceRadiusMeters: 300,
    contractRef: 'CT-PDL145T-KC-EDU-042',
    beneficiariesCount: 650,
    budgetUsd: 142000,
    disbursedUsd: 110000
  },
  {
    id: 'site-solar-madimba',
    name: 'Mini-Centrale Solaire & Micro-Réseau Madimba Gare',
    province: 'Kongo Central',
    territory: 'Madimba',
    organizationName: 'ANSER (Agence Nationale de l’Électrification et des Services Énergétiques)',
    sector: 'SOLAR',
    coordinates: { lat: -4.9782, lng: 15.0421 },
    geofenceRadiusMeters: 200,
    contractRef: 'ANSER-ENERG-2026-015',
    beneficiariesCount: 3200,
    budgetUsd: 89000,
    disbursedUsd: 71200
  },
  {
    id: 'site-wash-tshikapa',
    name: 'Point d’Eau & Puits Foré Mabondo',
    province: 'Kasaï',
    territory: 'Tshikapa',
    organizationName: 'Programme WASH Urgence / Bailleurs Associés',
    sector: 'WASH',
    coordinates: { lat: -6.4162, lng: 20.7997 },
    geofenceRadiusMeters: 200,
    contractRef: 'KAS-WASH-2026-03',
    beneficiariesCount: 2900,
    budgetUsd: 38000,
    disbursedUsd: 28500
  },
  {
    id: 'site-btp-walungu',
    name: 'Centre de Santé de Référence de Walungu (Génie Civil)',
    province: 'Sud-Kivu',
    territory: 'Walungu',
    organizationName: 'Ministère de la Santé Publique / Fonds Mondial',
    sector: 'BTP',
    coordinates: { lat: -2.6241, lng: 28.6653 },
    geofenceRadiusMeters: 250,
    contractRef: 'MSP-SK-2026-CSR-09',
    beneficiariesCount: 11000,
    budgetUsd: 165000,
    disbursedUsd: 82500
  },
  {
    id: 'site-health-walungu',
    name: 'Pharmacie Rurale & Chaîne du Froid CSR Walungu',
    province: 'Sud-Kivu',
    territory: 'Walungu',
    organizationName: 'Programme National d’Approvisionnement en Médicaments (PNAM) / Fonds Mondial & GAVI',
    sector: 'HEALTH',
    coordinates: { lat: -2.6238, lng: 28.6650 },
    geofenceRadiusMeters: 200,
    contractRef: 'MSP-PNAM-2026-MED-044',
    beneficiariesCount: 18500,
    budgetUsd: 54000,
    disbursedUsd: 43200
  },
  {
    id: 'site-mine-kolwezi',
    name: 'Centre Polyvalent & Hôpital Communautaire RSE Kolwezi (Dotation 0.3%)',
    province: 'Lualaba',
    territory: 'Kolwezi',
    organizationName: 'Comité Local de Développement (CLD) Mutanda / Dotation 0.3% Code Minier',
    sector: 'MINE',
    coordinates: { lat: -10.7167, lng: 25.4667 },
    geofenceRadiusMeters: 350,
    contractRef: 'DOT-03-LUA-2026-CLD-014',
    beneficiariesCount: 24000,
    budgetUsd: 280000,
    disbursedUsd: 196000
  },
  {
    id: 'site-agri-kimpese',
    name: 'Complexe Greniers Vivriers, Silos & Moulins de Kimpese (FIDA/BAD)',
    province: 'Kongo Central',
    territory: 'Songololo',
    organizationName: 'Programme d’Appui au Développement Agricole (BAD / FIDA / MinAgri)',
    sector: 'AGRI',
    coordinates: { lat: -5.5500, lng: 14.4333 },
    geofenceRadiusMeters: 400,
    contractRef: 'BAD-AGRI-KC-2026-SILO-08',
    beneficiariesCount: 14500,
    budgetUsd: 195000,
    disbursedUsd: 136500
  },
  {
    id: 'site-hydro-mutwanga',
    name: 'Micro-Centrale Hydroélectrique de Mutwanga (1.4 MW)',
    province: 'Nord-Kivu',
    territory: 'Beni',
    organizationName: 'Virunga Energies / ANSER RDC',
    sector: 'HYDRO',
    coordinates: { lat: 0.3342, lng: 29.7428 },
    geofenceRadiusMeters: 500,
    contractRef: 'HYD-VK-2026-MUT-019',
    beneficiariesCount: 38000,
    budgetUsd: 540000,
    disbursedUsd: 410000
  },
  {
    id: 'site-env-mai-ndombe',
    name: 'Projet de Reforestation Communautaire & Réserve Carbone Maï-Ndombe',
    province: 'Maï-Ndombe',
    territory: 'Inongo',
    organizationName: 'Fonds Vert Climat / Coalition Forêts Bassin du Congo',
    sector: 'ENV',
    coordinates: { lat: -1.9500, lng: 18.2833 },
    geofenceRadiusMeters: 1000,
    contractRef: 'REDD-MN-2026-VCS-08',
    beneficiariesCount: 22000,
    budgetUsd: 360000,
    disbursedUsd: 288000
  }
];

export const INITIAL_INSPECTIONS: Inspection[] = [
  {
    id: 'insp-wash-001',
    missionId: 'miss-wash-01',
    siteId: 'site-wash-maluku',
    agentId: 'agt-mukendi',
    agentName: 'Ing. Patient Mukendi',
    protocolCode: 'PVS-WASH-001',
    protocolVersion: 1,
    status: 'APPROVED',
    syncIdempotencyKey: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
    clientStartedAt: '2026-11-03T09:12:00Z',
    clientSubmittedAt: '2026-11-03T09:47:00Z',
    serverReceivedAt: '2026-11-03T10:02:14Z',
    deviceMetadata: {
      deviceModel: 'Samsung Galaxy A15 LTE',
      osVersion: 'Android 14 (API 34)',
      appVersion: 'PROOF360 v1.4-rdc',
      batteryLevelPercent: 78,
      isRooted: false,
      networkType: '3G'
    },
    qaScore: 98,
    qaNotes: 'Vérification exemplaire. Écoulement continu mesuré à 18.2 L/min. Dalle de propreté étanche avec caniveau de 4.8m.',
    qaReviewerName: 'Mme Christine Kalala (Auditeur Senior QA)',
    qaReviewedAt: '2026-11-03T14:30:00Z',
    integrityConfidenceScore: 100,
    reportNumber: 'RPT-2026-WASH-MAL-0041',
    pdfSha256: '4a9b6c1e5f8842d3873495f87b8d8e3c1209348e718b5c43d79048a6094eef19',
    publicVerificationSig: 'sig_7c9e6679_verified_bceco_proof360',
    responses: [
      {
        fieldId: 'wash_site_exists',
        value: true
      },
      {
        fieldId: 'wash_photo_panoramic',
        value: 'Photo validée avec vue d’ensemble',
        evidence: {
          id: 'ev-wash-panoramic',
          inspectionId: 'insp-wash-001',
          fieldId: 'wash_photo_panoramic',
          fileKey: 'evidence/wash/maluku_panoramic_001.webp',
          imageUrl: '/src/assets/images/hero_field_inspection_1793818308219.jpg',
          fileHashSha256: '5d41402abc4b2a76b9719d911017c592b0c36a4613c983d98ecbe1432f703567',
          mimeType: 'image/webp',
          fileSizeBytes: 312450,
          coordinates: { lat: -4.3169, lng: 15.6541 },
          accuracyMeters: 3.8,
          isMockGps: false,
          distanceToSiteMeters: 18,
          integrityFlags: [],
          capturedAt: '2026-11-03T09:18:22Z'
        }
      },
      {
        fieldId: 'wash_slab_condition',
        value: 'CONFORME_SANS_FISSURE'
      },
      {
        fieldId: 'wash_drainage_canal_meters',
        value: 4.8
      },
      {
        fieldId: 'wash_photo_slab_and_drain',
        value: 'Photo détaillée de la dalle et du caniveau',
        evidence: {
          id: 'ev-wash-slab',
          inspectionId: 'insp-wash-001',
          fieldId: 'wash_photo_slab_and_drain',
          fileKey: 'evidence/wash/maluku_slab_002.webp',
          imageUrl: '/src/assets/images/wash_water_borehole_1793818308094.jpg',
          fileHashSha256: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
          mimeType: 'image/webp',
          fileSizeBytes: 284100,
          coordinates: { lat: -4.3168, lng: 15.6543 },
          accuracyMeters: 4.1,
          isMockGps: false,
          distanceToSiteMeters: 12,
          integrityFlags: [],
          capturedAt: '2026-11-03T09:25:40Z'
        }
      },
      {
        fieldId: 'wash_water_flows',
        value: true
      },
      {
        fieldId: 'wash_flow_rate_liters_minute',
        value: 18.2
      },
      {
        fieldId: 'wash_turbidity_visual',
        value: 'LIMPIDE_CLAIRE'
      },
      {
        fieldId: 'wash_ph_measurement',
        value: 7.2
      }
    ]
  },
  {
    id: 'insp-btp-002',
    missionId: 'miss-btp-02',
    siteId: 'site-btp-lukala',
    agentId: 'agt-kabasele',
    agentName: 'Ing. Serge Kabasele',
    protocolCode: 'PVS-BTP-001',
    protocolVersion: 1,
    status: 'APPROVED',
    syncIdempotencyKey: '29bf048b-d510-482f-870e-f00e572097ca',
    clientStartedAt: '2026-11-02T11:00:00Z',
    clientSubmittedAt: '2026-11-02T12:15:00Z',
    serverReceivedAt: '2026-11-02T12:45:00Z',
    deviceMetadata: {
      deviceModel: 'Tecno Camon 20 Pro',
      osVersion: 'Android 13',
      appVersion: 'PROOF360 v1.4-rdc',
      batteryLevelPercent: 62,
      isRooted: false,
      networkType: 'EDGE_2G'
    },
    qaScore: 94,
    qaNotes: '6 classes achevées. Peinture, toiture tôle bac 0.50mm conforme. Une réserve mineure sur le remblai de la véranda arrière.',
    qaReviewerName: 'Mme Christine Kalala (Auditeur Senior QA)',
    qaReviewedAt: '2026-11-02T16:10:00Z',
    integrityConfidenceScore: 98,
    reportNumber: 'RPT-2026-BTP-LUK-0018',
    pdfSha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    publicVerificationSig: 'sig_29bf048b_verified_pdl145t_proof360',
    responses: [
      {
        fieldId: 'btp_site_exists',
        value: true
      },
      {
        fieldId: 'btp_classrooms_count',
        value: 6
      },
      {
        fieldId: 'btp_photo_facade',
        value: 'Photo façade avant confirmée',
        evidence: {
          id: 'ev-btp-facade',
          inspectionId: 'insp-btp-002',
          fieldId: 'btp_photo_facade',
          fileKey: 'evidence/btp/lukala_facade_001.webp',
          imageUrl: '/src/assets/images/btp_school_site_1793818310024.jpg',
          fileHashSha256: '6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b',
          mimeType: 'image/webp',
          fileSizeBytes: 345000,
          coordinates: { lat: -5.5187, lng: 14.5029 },
          accuracyMeters: 4.5,
          isMockGps: false,
          distanceToSiteMeters: 22,
          integrityFlags: [],
          capturedAt: '2026-11-02T11:15:30Z'
        }
      },
      {
        fieldId: 'btp_roof_condition',
        value: 'CONFORME_SANS_FUITE'
      }
    ]
  },
  {
    id: 'insp-solar-003',
    missionId: 'miss-solar-03',
    siteId: 'site-solar-madimba',
    agentId: 'agt-mukendi',
    agentName: 'Ing. Patient Mukendi',
    protocolCode: 'PVS-SOLAR-001',
    protocolVersion: 1,
    status: 'UNDER_REVIEW',
    syncIdempotencyKey: 'e4d909c2-90ab-49cd-90bc-01cbf58394b6',
    clientStartedAt: '2026-11-04T08:30:00Z',
    clientSubmittedAt: '2026-11-04T09:20:00Z',
    serverReceivedAt: '2026-11-04T09:35:10Z',
    deviceMetadata: {
      deviceModel: 'Samsung Galaxy A15 LTE',
      osVersion: 'Android 14 (API 34)',
      appVersion: 'PROOF360 v1.4-rdc',
      batteryLevelPercent: 88,
      isRooted: false,
      networkType: '4G'
    },
    integrityConfidenceScore: 95,
    reportNumber: 'RPT-2026-SOLAR-MAD-0009',
    responses: [
      {
        fieldId: 'solar_modules_installed_count',
        value: 48
      },
      {
        fieldId: 'solar_photo_array',
        value: 'Photo champ photovoltaïque et armoire onduleur',
        evidence: {
          id: 'ev-solar-array',
          inspectionId: 'insp-solar-003',
          fieldId: 'solar_photo_array',
          fileKey: 'evidence/solar/madimba_array_001.webp',
          imageUrl: '/src/assets/images/solar_minigrid_site_1793818309290.jpg',
          fileHashSha256: 'd4735e3a265e16eee03f59718b9b5d03019c07d8b6c51f90da3a666eec13ab35',
          mimeType: 'image/webp',
          fileSizeBytes: 389200,
          coordinates: { lat: -4.9781, lng: 15.0423 },
          accuracyMeters: 3.2,
          isMockGps: false,
          distanceToSiteMeters: 28,
          integrityFlags: [],
          capturedAt: '2026-11-04T08:45:10Z'
        }
      },
      {
        fieldId: 'solar_inverter_voltage_ac',
        value: 228
      }
    ]
  }
];

export const INITIAL_MISSIONS: Mission[] = [
  {
    id: 'miss-wash-01',
    code: 'MIS-2026-WASH-041',
    title: 'Audit Physique de Réception Forage Maluku Centre',
    siteId: 'site-wash-maluku',
    site: INITIAL_SITES[0],
    protocolCode: 'PVS-WASH-001',
    assignedAgentId: 'agt-mukendi',
    assignedAgentName: 'Ing. Patient Mukendi',
    status: 'APPROVED',
    scheduledDate: '2026-11-03',
    createdAt: '2026-11-01T08:00:00Z',
    inspectionsCount: 1,
    latestInspectionId: 'insp-wash-001',
    anomaliesCount: 0
  },
  {
    id: 'miss-btp-02',
    code: 'MIS-2026-BTP-018',
    title: 'Supervision Phase Finitions École de Lukala',
    siteId: 'site-btp-lukala',
    site: INITIAL_SITES[1],
    protocolCode: 'PVS-BTP-001',
    assignedAgentId: 'agt-kabasele',
    assignedAgentName: 'Ing. Serge Kabasele',
    status: 'APPROVED',
    scheduledDate: '2026-11-02',
    createdAt: '2026-10-28T09:00:00Z',
    inspectionsCount: 1,
    latestInspectionId: 'insp-btp-002',
    anomaliesCount: 0
  },
  {
    id: 'miss-solar-03',
    code: 'MIS-2026-SOL-009',
    title: 'Contrôle Technique Mini-Centrale Solaire Madimba',
    siteId: 'site-solar-madimba',
    site: INITIAL_SITES[2],
    protocolCode: 'PVS-SOLAR-001',
    assignedAgentId: 'agt-mukendi',
    assignedAgentName: 'Ing. Patient Mukendi',
    status: 'QA_REVIEW',
    scheduledDate: '2026-11-04',
    createdAt: '2026-11-02T10:30:00Z',
    inspectionsCount: 1,
    latestInspectionId: 'insp-solar-003',
    anomaliesCount: 0
  },
  {
    id: 'miss-wash-04',
    code: 'MIS-2026-WASH-092',
    title: 'Vérification Forage Défaillant Mabondo Tshikapa',
    siteId: 'site-wash-tshikapa',
    site: INITIAL_SITES[3],
    protocolCode: 'PVS-WASH-001',
    assignedAgentId: 'agt-mukendi',
    assignedAgentName: 'Ing. Patient Mukendi',
    status: 'NEEDS_REINSPECTION',
    scheduledDate: '2026-11-05',
    createdAt: '2026-10-30T14:00:00Z',
    inspectionsCount: 1,
    anomaliesCount: 1
  },
  {
    id: 'miss-btp-05',
    code: 'MIS-2026-BTP-114',
    title: 'Contrôle Gros-Œuvre Centre de Santé Walungu',
    siteId: 'site-btp-walungu',
    site: INITIAL_SITES[4],
    protocolCode: 'PVS-BTP-001',
    status: 'OPEN',
    scheduledDate: '2026-11-08',
    createdAt: '2026-11-03T11:00:00Z',
    inspectionsCount: 0,
    anomaliesCount: 0
  },
  {
    id: 'miss-health-06',
    code: 'MIS-2026-HLT-022',
    title: 'Audit Réception Intrants Médicaux, Chaîne du Froid & DLUO Walungu',
    siteId: 'site-health-walungu',
    site: INITIAL_SITES[5],
    protocolCode: 'PVS-HEALTH-001',
    assignedAgentId: 'agt-mukendi',
    assignedAgentName: 'Dr. Jean-Marc Lubamba (Auditeur Médical)',
    status: 'OPEN',
    scheduledDate: '2026-11-07',
    createdAt: '2026-11-04T08:30:00Z',
    inspectionsCount: 0,
    anomaliesCount: 0
  },
  {
    id: 'miss-mine-07',
    code: 'MIS-2026-MIN-005',
    title: 'Audit RSE Dotation 0.3% : Vérification BPU & Main-d’Œuvre Locale Kolwezi',
    siteId: 'site-mine-kolwezi',
    site: INITIAL_SITES[6],
    protocolCode: 'PVS-MINE-001',
    assignedAgentId: 'agt-kabasele',
    assignedAgentName: 'Ing. Serge Kabasele (Auditeur RSE)',
    status: 'OPEN',
    scheduledDate: '2026-11-09',
    createdAt: '2026-11-05T09:00:00Z',
    inspectionsCount: 0,
    anomaliesCount: 0
  },
  {
    id: 'miss-agri-08',
    code: 'MIS-2026-AGR-012',
    title: 'Inspection Silos Vivriers, Humidité des Grains & Roulabilité Kimpese',
    siteId: 'site-agri-kimpese',
    site: INITIAL_SITES[7],
    protocolCode: 'PVS-AGRI-001',
    assignedAgentId: 'agt-mukendi',
    assignedAgentName: 'Ing. Patient Mukendi (Auditeur Agro)',
    status: 'OPEN',
    scheduledDate: '2026-11-10',
    createdAt: '2026-11-05T11:30:00Z',
    inspectionsCount: 0,
    anomaliesCount: 0
  },
  {
    id: 'miss-hydro-09',
    code: 'MIS-2026-HYD-003',
    title: 'Audit Micro-Centrale Hydroélectrique, Turbines & Réseau Mutwanga',
    siteId: 'site-hydro-mutwanga',
    site: INITIAL_SITES[8],
    protocolCode: 'PVS-HYDRO-001',
    assignedAgentId: 'agt-kabasele',
    assignedAgentName: 'Ing. Serge Kabasele (Auditeur Énergie)',
    status: 'OPEN',
    scheduledDate: '2026-11-12',
    createdAt: '2026-11-06T09:00:00Z',
    inspectionsCount: 0,
    anomaliesCount: 0
  },
  {
    id: 'miss-env-10',
    code: 'MIS-2026-ENV-007',
    title: 'Audit Reforestation Communautaire & Survie Pépinières Maï-Ndombe (VCS)',
    siteId: 'site-env-mai-ndombe',
    site: INITIAL_SITES[9],
    protocolCode: 'PVS-ENV-001',
    assignedAgentId: 'agt-mukendi',
    assignedAgentName: 'Ing. Patient Mukendi (Expert Carbone)',
    status: 'OPEN',
    scheduledDate: '2026-11-14',
    createdAt: '2026-11-06T10:15:00Z',
    inspectionsCount: 0,
    anomaliesCount: 0
  }
];

export const INITIAL_ANOMALIES: Anomaly[] = [
  {
    id: 'anom-tshikapa-01',
    inspectionId: 'insp-wash-prev',
    siteId: 'site-wash-tshikapa',
    title: 'Turbidité anormale & débit insuffisant (< 6 L/min)',
    severity: 'HIGH',
    status: 'IN_REMEDIATION',
    description: 'Le forage produit une eau chargée de sédiments argileux. Le prestataire a été mis en demeure pour soufflage à l’air-lift et remplacement de crépine.',
    reportedAt: '2026-10-25T11:20:00Z',
    remediationNotes: 'Entreprise de forage mobilisée sur place depuis le 02 novembre.'
  }
];

export const INITIAL_AUDIT_LOG: AuditLedgerEntry[] = [
  {
    id: 'log-001',
    timestamp: '2026-11-01T08:00:00Z',
    action: 'MISSION_CREATED',
    entityType: 'MISSION',
    entityId: 'miss-wash-01',
    actorName: 'Direction Suivi Projets (Kinshasa)',
    actorRole: 'CLIENT_ADMIN',
    previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
    entryHash: 'b4a8e99c1d68367a74ee250b7194f4f728cb1ef49419b4cf008851ccf074d209',
    payload: { missionCode: 'MIS-2026-WASH-041', site: 'site-wash-maluku' }
  },
  {
    id: 'log-002',
    timestamp: '2026-11-03T10:02:14Z',
    action: 'INSPECTION_SYNCED',
    entityType: 'INSPECTION',
    entityId: 'insp-wash-001',
    actorName: 'Ing. Patient Mukendi (Terminal A15)',
    actorRole: 'PROOF_AGENT',
    previousHash: 'b4a8e99c1d68367a74ee250b7194f4f728cb1ef49419b4cf008851ccf074d209',
    entryHash: 'e6c27806a386129a008f515f4581f14749f7aa281e01869e54a5c53b27b3d002',
    payload: {
      syncKey: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
      evidencesCount: 2,
      integrityFlagsCount: 0
    }
  },
  {
    id: 'log-003',
    timestamp: '2026-11-03T14:30:00Z',
    action: 'QA_APPROVED_AND_SEALED',
    entityType: 'REPORT',
    entityId: 'insp-wash-001',
    actorName: 'Mme Christine Kalala',
    actorRole: 'QA_REVIEWER',
    previousHash: 'e6c27806a386129a008f515f4581f14749f7aa281e01869e54a5c53b27b3d002',
    entryHash: '394e101ab4fc09d9494488344589dbe71842ea04b50c0598fbe3d9646b965f80',
    payload: {
      reportNumber: 'RPT-2026-WASH-MAL-0041',
      pdfHash: '4a9b6c1e5f8842d3873495f87b8d8e3c1209348e718b5c43d79048a6094eef19',
      score: 98
    }
  }
];
