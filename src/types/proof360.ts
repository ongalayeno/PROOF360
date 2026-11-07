export type SectorType = 'WASH' | 'BTP' | 'SOLAR' | 'AGRI' | 'ROADS' | 'HEALTH' | 'ENV' | 'MINE' | 'HYDRO' | 'DIGITAL' | 'PECHE';

export type MissionStatus = 
  | 'DRAFT'
  | 'OPEN'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'SUBMITTED'
  | 'QA_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'NEEDS_REINSPECTION';

export type InspectionStatus = 
  | 'LOCAL_DRAFT'
  | 'SYNCING'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'NEEDS_CORRECTION';

export type AnomalySeverity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AnomalyStatus = 'OPEN' | 'IN_REMEDIATION' | 'REINSPECTED' | 'VERIFIED_CLOSED';

export type UserRole = 
  | 'SUPER_ADMIN'
  | 'OPERATIONS'
  | 'QA_REVIEWER'
  | 'CLIENT_ADMIN'
  | 'CLIENT_PM'
  | 'PROOF_AGENT';

export interface GeoPoint {
  lat: number;
  lng: number;
}

export type ZoneType = 
  | 'CATCHMENT_PROTECTION' 
  | 'CADASTRAL_CONCESSION' 
  | 'MICROGRID_GRID_COVERAGE' 
  | 'ROAD_RIGHT_OF_WAY' 
  | 'AGRICULTURAL_PERIMETER';

export interface GeoJsonPolygon {
  type: 'Polygon';
  coordinates: number[][][]; // standard GeoJSON: [ [ [lng, lat], [lng, lat], ... ] ]
}

export interface ProjectZoneFeature {
  type: 'Feature';
  id: string;
  siteId: string;
  properties: {
    name: string;
    siteName: string;
    province: string;
    territory: string;
    zoneType: ZoneType;
    areaHectares: number;
    perimeterKm: number;
    fillColor: string;
    strokeColor: string;
    description: string;
    status: 'VERIFIED' | 'DELIMITATION_PENDING' | 'RESERVE_NOTED';
    cadastralRef?: string;
  };
  geometry: GeoJsonPolygon;
}

export interface ProjectZoneFeatureCollection {
  type: 'FeatureCollection';
  features: ProjectZoneFeature[];
}

export interface Site {
  id: string;
  name: string;
  province: string;
  territory: string;
  organizationName: string;
  sector: SectorType;
  coordinates: GeoPoint;
  geofenceRadiusMeters: number;
  contractRef: string;
  beneficiariesCount: number;
  budgetUsd: number;
  disbursedUsd: number;
}

export interface PVSField {
  id: string;
  label: string;
  type: 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'SELECT' | 'MEASUREMENT' | 'PHOTO' | 'VIDEO';
  required: boolean;
  unit?: string;
  options?: string[];
  min?: number;
  max?: number;
  criticalBelow?: number;
  criticalAbove?: number;
  requireGps?: boolean;
  helpText?: string;
  photoAngleHint?: string;
  anomalyTrigger?: {
    condition: string;
    severity: AnomalySeverity;
    description: string;
  };
}

export interface PVSSection {
  id: string;
  title: string;
  fields: PVSField[];
}

export interface PVSProtocol {
  code: string;
  version: number;
  name: string;
  sector: SectorType;
  description: string;
  estimatedDurationMinutes: number;
  sections: PVSSection[];
}

export interface Evidence {
  id: string;
  inspectionId: string;
  fieldId: string;
  fileKey: string;
  imageUrl: string;
  fileHashSha256: string;
  mimeType: string;
  fileSizeBytes: number;
  coordinates: GeoPoint;
  accuracyMeters: number;
  isMockGps: boolean;
  distanceToSiteMeters: number;
  integrityFlags: string[];
  capturedAt: string;
}

export interface FieldResponse {
  fieldId: string;
  value: any;
  evidence?: Evidence;
}

export interface DeviceMetadata {
  deviceModel: string;
  osVersion: string;
  appVersion: string;
  batteryLevelPercent: number;
  isRooted: boolean;
  networkType: 'OFFLINE' | 'EDGE_2G' | '3G' | '4G' | 'WIFI';
}

export interface Anomaly {
  id: string;
  inspectionId: string;
  evidenceId?: string;
  siteId: string;
  title: string;
  severity: AnomalySeverity;
  status: AnomalyStatus;
  description: string;
  reportedAt: string;
  remediationNotes?: string;
  reinspectedAt?: string;
}

export interface Inspection {
  id: string;
  missionId: string;
  siteId: string;
  agentId: string;
  agentName: string;
  protocolCode: string;
  protocolVersion: number;
  status: InspectionStatus;
  syncIdempotencyKey: string;
  clientStartedAt: string;
  clientSubmittedAt: string;
  serverReceivedAt: string;
  deviceMetadata: DeviceMetadata;
  responses: FieldResponse[];
  qaScore?: number;
  qaNotes?: string;
  qaReviewerName?: string;
  qaReviewedAt?: string;
  integrityConfidenceScore: number; // 0 - 100
  pdfSha256?: string;
  reportNumber?: string;
  publicVerificationSig?: string;
}

export interface Mission {
  id: string;
  code: string;
  title: string;
  siteId: string;
  site: Site;
  protocolCode: string;
  assignedAgentId?: string;
  assignedAgentName?: string;
  status: MissionStatus;
  scheduledDate: string;
  createdAt: string;
  inspectionsCount: number;
  latestInspectionId?: string;
  anomaliesCount: number;
}

export interface AuditLedgerEntry {
  id: string;
  timestamp: string;
  action: string;
  entityType: 'MISSION' | 'INSPECTION' | 'EVIDENCE' | 'ANOMALY' | 'REPORT' | 'PAYMENT' | 'FEEDBACK';
  entityId: string;
  actorName: string;
  actorRole: UserRole;
  previousHash: string;
  entryHash: string;
  payload: Record<string, any>;
}

// -------------------------------------------------------------
// EXTENSIONS: Computer Vision, GNSS, Breadcrumbs, Payouts, IoT,
// Community Feedback, Contractor Portal, Fleet & Drone Missions
// -------------------------------------------------------------

export interface ComputerVisionAnalysis {
  waterFlowDetected?: boolean;
  waterFlowConfidence?: number;
  meterValueOcr?: string;
  meterConfidence?: number;
  perceptualHashHex: string; // pHash 64-bit for duplicate detection
  isRecycledDuplicate: boolean;
  recycledSourceInspectionId?: string;
}

export interface GnssRawConstellation {
  satellitesInView: number;
  gpsCount: number;
  galileoCount: number;
  glonassCount: number;
  beidouCount: number;
  carrierToNoiseSnrDb: number; // average signal to noise
  antiSpoofScore: number; // 0-100 (100 = authentic hardware multi-GNSS)
  nmeaSentenceSample: string;
}

export interface BreadcrumbPoint {
  lat: number;
  lng: number;
  timestamp: string;
  speedMps: number;
  accuracy: number;
}

export interface InspectorTrackSummary {
  totalDurationMinutes: number;
  totalDistanceMeters: number;
  averageSpeedKmh: number;
  perimeterWalkCovered: boolean; // confirmed inspector walked around site
  breadcrumbs: BreadcrumbPoint[];
}

export interface MilestonePayout {
  id: string;
  siteId: string;
  contractorName: string;
  trancheNumber: number;
  amountUsd: number;
  description: string;
  triggerCondition: string; // e.g. "APPROVED QA >= 90% & 0 CRITICAL"
  status: 'LOCKED' | 'APPROVED_RELEASED' | 'BLOCKED_BY_ANOMALY';
  bankTransferRef?: string;
  releasedAt?: string;
  blockedReason?: string;
}

export interface ContractorRemediation {
  id: string;
  anomalyId: string;
  contractorName: string;
  submittedAt: string;
  repairSummary: string;
  invoiceRef: string;
  photoProofUrl: string;
  reinspectionRequested: boolean;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'ACCEPTED' | 'REJECTED';
}

export type SentimentCategory = 
  | 'ANGER_CHRONIC'       // Colère / Exaspération face à l'incurie ou manque d'eau chronique
  | 'DISTRESS_URGENT'     // Détresse vitale / Risque sanitaire / Urgence immédiate
  | 'FRUSTRATION_MODERATE'// Frustration / Plainte technique modérée
  | 'NEUTRAL_INFORMATIVE' // Neutre / Constat factuel ou relevé
  | 'POSITIVE_SATISFACTION'; // Remerciement / Satisfaction populaire

export type UrgencyLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface SignalSentimentAnalysis {
  sentiment: SentimentCategory;
  urgencyLevel: UrgencyLevel;
  urgencyScore: number; // 0 - 100
  dominantEmotion: string; // e.g. "Colère vive & Risque sanitaire"
  detectedTriggers: string[]; // e.g. ["enfants malades", "eau rouge", "3 jours"]
  summaryJustification: string; // Explication synthétique de l'urgence perçue
  languageDetected?: 'FR' | 'LN' | 'SW' | 'MIXED'; // Français, Lingala, Swahili, Mixte
  analyzedAt: string;
}

export interface CommunitySignal {
  id: string;
  siteId: string;
  channel: 'USSD' | 'SMS' | 'WHATSAPP';
  senderPhoneMasked: string;
  senderRole: 'VILLAGE_CHIEF' | 'SCHOOL_DIRECTOR' | 'HEALTH_STAFF' | 'CITIZEN';
  plateId: string; // e.g. P-145T-042
  message: string;
  issueCategory: 'PUMP_BROKEN' | 'WATER_DIRTY' | 'ROOF_DAMAGED' | 'SOLAR_DARK' | 'NOMINAL';
  reportedAt: string;
  postDeliveryAgeDays: number; // e.g. J+45
  status: 'NEW' | 'TRIAGED' | 'DISPATCHED_TO_AGENT';
  sentimentAnalysis?: SignalSentimentAnalysis;
}

export interface IotTelemetryReading {
  id: string;
  siteId: string;
  timestamp: string;
  sensorType: 'FLOW_PRESSURE' | 'BATTERY_INVERTER' | 'TANK_LEVEL';
  dailyVolumeM3?: number;
  waterTableDepthMeters?: number;
  batteryVoltageDc?: number;
  inverterOutputVac?: number;
  isNominal: boolean;
  consecutiveZeroFlowDays: number;
  alarmTriggered: boolean;
}

export interface FleetRoutePlan {
  id: string;
  agentId: string;
  agentName: string;
  date: string;
  corridorName: string;
  rainySeasonImpassableTracks: string[];
  stops: {
    siteId: string;
    siteName: string;
    sector: SectorType;
    estimatedArrival: string;
  }[];
  totalDistanceKm: number;
  fuelEstimatedLiters: number;
}

export interface DroneWaypointPlan {
  id: string;
  siteId: string;
  droneModel: string;
  altitudeMeters: number;
  groundSampleDistanceCm: number;
  flightPathWaypoints: [number, number][]; // [lng, lat]
  estimatedFlightMinutes: number;
  photosTargetCount: number;
  orthophotoResolution: string;
  cutFillVolumeCalculatedM3?: number;
}

// -------------------------------------------------------------
// 1. Edge AI & Computer Vision Advanced Interfaces
// -------------------------------------------------------------
export interface CrackSpallingAnalysis {
  cracksDetectedCount: number;
  maxCrackWidthMm: number;
  spallingDetected: boolean;
  exposedRebarFound: boolean;
  structuralRiskLevel: 'NONE' | 'LOW' | 'MEDIUM' | 'CRITICAL';
  confidenceScore: number; // 0 - 100
  annotatedBoundingBoxes: {
    label: string;
    confidence: number;
    severity: 'LOW' | 'MEDIUM' | 'CRITICAL';
    locationDescription: string;
  }[];
}

export interface TreeCountAnalysis {
  treesDetectedTotal: number;
  healthySurvivalCount: number;
  deadStumpCount: number;
  survivalRatePercent: number;
  carbonCreditsEligibleTons: number;
  standardCompliance: 'VERRA_VCS' | 'GOLD_STANDARD' | 'NON_COMPLIANT';
  densityPerHectare: number;
}

export interface EquipmentOcrVerification {
  scannedManufacturer: string; // e.g. "Grundfos"
  scannedModelNumber: string; // e.g. "SQFlex 5A"
  scannedSerialNumber: string; // e.g. "SN-2026-GF-88419"
  bpuContractExpectedModel: string; // e.g. "Grundfos SQFlex 5A"
  isMatchWithContract: boolean;
  counterfeitRiskLevel: 'AUTHENTIC' | 'SUSPECT' | 'COUNTERFEIT_DETECTED';
  extractedTextRaw: string;
}

// -------------------------------------------------------------
// 2. Hardware Proof & Physical Anchoring
// -------------------------------------------------------------
export interface NfcTamperProofCheck {
  nfcTagUid: string;
  concreteEmbeddedId: string;
  hardwareCurve25519Signature: string;
  scanDistanceCm: number;
  isPhysicalPresenceVerified: boolean;
  timestamp: string;
}

export interface GnssRtkReading {
  antennaModel: string; // e.g. "Emlid Reach RS2+"
  rtkFixStatus: 'FIX' | 'FLOAT' | 'SINGLE';
  horizontalAccuracyCm: number; // e.g. 1.4 cm
  verticalAccuracyCm: number; // e.g. 2.1 cm
  baseStationCorrectionAgeSec: number;
  isCentimeterCertified: boolean;
}

// -------------------------------------------------------------
// 3. Financial Automation: Mobile Money & Open Banking
// -------------------------------------------------------------
export interface MobileMoneyDisbursement {
  id: string;
  agentId: string;
  agentName: string;
  agentPhone: string;
  operator: 'M_PESA' | 'ORANGE_MONEY' | 'AIRTEL_MONEY';
  amountCdf: number;
  amountUsd: number;
  type: 'MISSION_PER_DIEM' | 'BONUS_VERIFIED_REPORT';
  status: 'INSTANT_RELEASED' | 'PENDING' | 'FAILED';
  transactionRef: string;
  executedAt: string;
}

export interface BankOpenBankingOrder {
  id: string;
  payoutId: string;
  bankName: 'RAWBANK' | 'EQUITY_BCDC' | 'TMB';
  swiftIso20022MsgType: 'pacs.008' | 'pain.001';
  ibanOrBban: string;
  amountUsd: number;
  beneficiaryName: string;
  status: 'SETTLED' | 'PENDING_CLEARING';
  rawbankReference: string;
  signedSha256Digest: string;
  settledAt: string;
}

// -------------------------------------------------------------
// 4. Citizen Transparency & CLD Community Audit
// -------------------------------------------------------------
export interface CldWeeklyAuditReport {
  id: string;
  siteId: string;
  siteName: string;
  cldPresidentName: string;
  cldPresidentPhone: string;
  weekNumber: number;
  isOperatingNormally: boolean;
  daysOutOfService: number;
  airtimeRewardPhoneRecharged: boolean;
  rewardAmountUsd: number;
  submittedAt: string;
  observations: string;
}

// -------------------------------------------------------------
// 5. Extreme Resilience: Ghost Security & Iridium Satellite
// -------------------------------------------------------------
export interface GhostSecurityState {
  isEnabled: boolean;
  duressPinTriggered: boolean;
  hiddenVaultEncrypted: boolean;
  decryptionOnlyKinshasaHQ: boolean;
}

export interface IridiumMicroPacket {
  packetHex: string; // 32 bytes hex
  siteId: string;
  statusByte: number;
  latCompressed: number;
  lngCompressed: number;
  sha256Truncated16: string;
  transmittedOverIridiumSbd: boolean;
  satelliteConstellation: 'IRIDIUM_NEXT_SBD';
  timestamp: string;
}

// -------------------------------------------------------------
// 6. PVS-HEALTH-001: Cold Chain & Medicine Inventory Verification
// -------------------------------------------------------------
export interface ColdChainLog {
  refrigeratorModel: string; // e.g. "Dometic TCX 21 / B Medical Systems TCW40SD"
  powerSource: 'SOLAR_DIRECT_DRIVE' | 'MAINS_ELECTRICITY' | 'HYBRID_BATTERY';
  currentTemperatureCelsius: number; // target: 2°C to 8°C
  minTemperatureLast24h: number;
  maxTemperatureLast24h: number;
  isColdChainBreached: boolean; // true if temp went < 2°C or > 8°C
  dataloggerSha256Checksum: string;
  sensorSerialNumber: string;
}

export interface MedicineItem {
  id: string;
  drugCode: string; // e.g. "MED-ACT-001"
  commercialName: string; // e.g. "Artéméther-Luméfantrine (Coartem)"
  innName: string; // DCI: International Nonproprietary Name
  therapeuticClass: 'ANTIPALUDIQUE' | 'VACCIN' | 'ANTIBIOTIQUE' | 'MATERNITE' | 'SOLUTE';
  batchNumber: string;
  quantityDelivered: number;
  unitOfMeasure: 'BOITE' | 'FLACON' | 'AMPOULE' | 'BLISTER';
  expirationDate: string; // YYYY-MM-DD
  monthsRemainingUntilExpiry: number;
  status: 'CONFORME_VALIDE' | 'EXPIRATION_PROCHE' | 'PERIME_REJETE';
  storageRequirement: 'COLD_CHAIN_2_8C' | 'ROOM_TEMP_UNDER_30C';
  tamperProofPackagingIntact: boolean;
}

export interface HealthDeliveryVerification {
  centerName: string; // Centre de Santé de Référence
  deliverySlipNumber: string; // Numéro du Bon de Livraison (B/L)
  programDonor: 'FONDS_MONDIAL' | 'GAVI' | 'UNICEF' | 'FED_UE' | 'MIN_SANTE_RDC';
  pharmacistRecipientName: string;
  pharmacistPhone: string;
  coldChain: ColdChainLog;
  inventory: MedicineItem[];
  totalUnitsInspected: number;
  expiredUnitsCount: number;
  closeToExpiryUnitsCount: number;
  complianceRatingPercent: number; // 0 - 100
  disbursementAuthorized: boolean;
}

// -------------------------------------------------------------
// 7. PVS-MINE-001: RSE & Dotation 0.3% Code Minier RDC
// -------------------------------------------------------------
export interface BpuLineItem {
  id: string;
  itemCode: string; // e.g. "BPU-CIV-001"
  description: string; // e.g. "Béton armé dosé à 350 kg/m³ pour radier"
  unit: string; // "m³", "tonne", "m²", "ml"
  contractQuantity: number;
  contractUnitPriceUsd: number;
  inspectedQuantity: number;
  inspectedUnitPriceUsd: number;
  isCompliantWithBpu: boolean;
  varianceNote?: string;
}

export interface LocalWorkerAttendance {
  workerId: string;
  fullName: string;
  communityVillage: string; // Village riverain de la concession minière
  isLocalResident: boolean; // Preuve de résidence locale (carte d'électeur / attestation chefferie)
  jobTitle: string; // e.g. "Ferrailleur", "Maçon", "Manœuvre", "Électricien"
  dailyWageUsd: number;
  daysPresent: number;
}

export interface MiningRseAudit {
  id: string;
  siteId: string;
  siteName: string;
  miningCompany: string; // e.g. "Tenke Fungurume Mining (TFM)", "Kamoa Copper", "Kibali Gold"
  concessionName: string; // e.g. "Concession Kolwezi Ouest"
  province: 'Lualaba' | 'Haut-Katanga' | 'Ituri' | 'Nord-Kivu';
  cldName: string; // Comité Local de Développement
  cldPresidentName: string;
  cldPresidentPhone: string;
  dotationTotalUsd: number; // 0.3% chiffre d'affaires alloué
  disbursedAmountUsd: number;
  bpuItems: BpuLineItem[];
  workers: LocalWorkerAttendance[];
  localWorkforcePercent: number; // target >= 70%
  bpuComplianceRatePercent: number; // 0 - 100%
  antiPollutionCertified: boolean;
  cldValidationStatus: 'APPROVED_BY_COMMUNITY' | 'RESERVES_OPEN' | 'REJECTED';
  cldSignoffNotes: string;
  lastInspectionDate: string;
}

// -------------------------------------------------------------
// 8. PVS-AGRI-001: Greniers Vivriers, Silos, Moulins & Hectares
// -------------------------------------------------------------
export interface SiloStorageReading {
  siloId: string;
  siloName: string;
  grainType: 'MAIS' | 'MANIOC' | 'SOJA' | 'RIZ' | 'HARICOT';
  capacityMetricTons: number;
  currentStockMetricTons: number;
  moisturePercent: number; // target <= 13.5%
  isMoistureSafe: boolean; // false if > 14% (aflatoxin risk)
  temperatureInsideCelsius: number;
  pestProofCondition: 'PARFAITE_ETANCHEITE' | 'DEFAUT_MINEUR' | 'INFESTATION_OUVERTURES';
  lastMoistureSensorCalibrated: string;
}

export interface MillingMachineItem {
  id: string;
  machineType: 'MOULIN_A_MAIS' | 'DECORTIQUEUSE_RIZ' | 'RAPEUSE_MANIOC' | 'PRESSE_HUILE';
  serialNumber: string;
  manufacturer: string;
  nominalCapacityKgPerHour: number;
  isOperational: boolean;
  powerSource: 'DIESEL' | 'SOLAIRE' | 'HYDRAULIQUE';
  hoursOperatedThisWeek: number;
  defectNotes?: string;
}

export interface AgriProjectAudit {
  id: string;
  siteId: string;
  siteName: string;
  donorProgram: 'BAD_PADAS' | 'PAM_PURIS' | 'FIDA_PASAG' | 'MIN_AGRI_RDC';
  province: string;
  territory: string;
  cooperativeName: string;
  hectaresTotalPlanted: number;
  hectaresVerifiedGps: number;
  cropYieldEstimateTonsPerHectare: number;
  feederRoadPassability: 'PRATICABLE_TOUT_VEHICULE' | '4X4_UNIQUEMENT' | 'IMPRACTICABLE_BOURBIER';
  feederRoadDistanceKm: number;
  silos: SiloStorageReading[];
  millingMachines: MillingMachineItem[];
  averageMoisturePercent: number;
  overallScorePercent: number;
  lastAuditDate: string;
}

// -------------------------------------------------------------
// 9. PVS-HYDRO-001: Micro-Barrages, Débit d'Étiage, Turbines & Réseau
// -------------------------------------------------------------
export interface HydroTurbineUnit {
  id: string;
  turbineCode: string; // e.g. "TURB-PELTON-01"
  turbineType: 'PELTON' | 'FRANCIS' | 'KAPLAN' | 'CROSSFLOW';
  ratedCapacityKw: number;
  currentOutputKw: number;
  rpmSpeed: number;
  oilPressureBar: number;
  bearingTempCelsius: number;
  status: 'ONLINE_NOMINAL' | 'MAINTENANCE_REQUIRED' | 'OFFLINE_SHUTDOWN';
  vibrationLevelMmSec: number;
}

export interface HydroPowerGridMetrics {
  frequencyHz: number; // nominal 50.0 Hz
  voltagePhaseAcVolts: number; // nominal 230V / 400V
  powerFactorCosPhi: number; // target >= 0.85
  transformerSubstationStatus: 'ENERGIZED_NORMAL' | 'OVERLOADED' | 'FAULT';
  householdsConnected: number;
  ruralMicrogridKm: number;
  outagesLast30Days: number;
}

export interface HydroAudit {
  id: string;
  siteId: string;
  siteName: string;
  riverName: string;
  province: string;
  territory: string;
  damType: 'MICRO_HYDRO_RUN_OF_RIVER' | 'GRAVITY_WEIR' | 'BARRAGE_DERIVATION';
  flowRateLitersSec: number; // débit mesuré en L/sec
  minEnvironmentalFlowLitersSec: number; // débit d'étiage de réserve écologique
  headHeightMeters: number; // hauteur de chute
  penstockStatus: 'INTACT_NO_LEAKS' | 'MINOR_LEAK' | 'CRITICAL_CRACK';
  debrisTrashRackClean: boolean; // dégrilleur nettoyé
  turbines: HydroTurbineUnit[];
  gridMetrics: HydroPowerGridMetrics;
  installedCapacityKwTotal: number;
  currentGenerationKwTotal: number;
  complianceScorePercent: number;
  lastAuditDate: string;
}

// -------------------------------------------------------------
// 10. PVS-ENV: Reforestation Communautaire, Survie & Crédits Carbone
// -------------------------------------------------------------
export interface TreeSpeciesPlot {
  plotId: string;
  plotName: string;
  speciesName: string; // e.g. "Millettia laurentii (Wengé)", "Autranella congolensis (Mukwa)", "Acacia auriculiformis"
  isEndangeredNativeSpecies: boolean;
  treesPlantedTarget: number;
  treesCountedAiDrone: number;
  healthyTreesCount: number;
  deadOrStumpCount: number;
  survivalRatePercent: number; // target >= 70%
  carbonBiomassCo2ePerYearTons: number;
  canopyDensityPercent: number;
}

export interface CommunityForestryGuard {
  guardId: string;
  fullName: string;
  villageName: string;
  patrolHoursThisMonth: number;
  phone: string;
  airtimeSubsidyPaidUsd: number;
  illegalLoggingAlertsLogged: number;
}

export interface EnvReforestationAudit {
  id: string;
  siteId: string;
  siteName: string;
  province: string;
  territory: string;
  carbonStandard: 'VERRA_VCS' | 'GOLD_STANDARD' | 'PLAN_VIVO';
  projectDeveloper: string;
  concessionHectares: number;
  totalTreesPlantedTarget: number;
  totalTreesVerifiedLiving: number;
  globalSurvivalRatePercent: number;
  accumulatedCo2SequestrationTons: number;
  annualCo2RateTons: number;
  carbonCreditsEstimatedUsd: number;
  plots: TreeSpeciesPlot[];
  communityGuards: CommunityForestryGuard[];
  satelliteVegetationNviIndex: number; // e.g. 0.78 NDVI
  firebreakPerimeterMaintained: boolean;
  carbonCertificationStatus: 'CERTIFIED_VERRA_ISSUED' | 'AUDIT_STAGE' | 'CORRECTIONS_PENDING';
  lastVerificationDate: string;
}




