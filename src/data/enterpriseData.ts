import { 
  MilestonePayout, 
  ContractorRemediation, 
  CommunitySignal, 
  IotTelemetryReading, 
  FleetRoutePlan, 
  DroneWaypointPlan,
  MobileMoneyDisbursement,
  BankOpenBankingOrder,
  CldWeeklyAuditReport,
  HealthDeliveryVerification,
  ColdChainLog,
  MedicineItem,
  MiningRseAudit,
  AgriProjectAudit,
  HydroAudit,
  EnvReforestationAudit
} from '../types/proof360';

export const INITIAL_PAYOUTS: MilestonePayout[] = [
  {
    id: 'pay-001',
    siteId: 'site-wash-maluku',
    contractorName: 'Congo Hydraulique SARL',
    trancheNumber: 2,
    amountUsd: 18000,
    description: 'Tranche #2 : Achèvement de forage, tubage inox et dalle anti-stagnation',
    triggerCondition: 'Conformité QA ≥ 90% & Zéro anomalie CRITICAL',
    status: 'APPROVED_RELEASED',
    bankTransferRef: 'RAW-BANK-KIN-2026-99182',
    releasedAt: '2026-11-03T15:00:00Z'
  },
  {
    id: 'pay-002',
    siteId: 'site-btp-lukala',
    contractorName: 'BTP Kongo Bâtisseurs',
    trancheNumber: 3,
    amountUsd: 42000,
    description: 'Tranche #3 : Pose de charpente métallique, toiture bac et menuiseries',
    triggerCondition: 'Conformité QA ≥ 90% & Zéro anomalie CRITICAL',
    status: 'APPROVED_RELEASED',
    bankTransferRef: 'EQUITY-BCDC-KC-00412',
    releasedAt: '2026-11-02T16:30:00Z'
  },
  {
    id: 'pay-003',
    siteId: 'site-wash-tshikapa',
    contractorName: 'Kasaï Forage Express',
    trancheNumber: 2,
    amountUsd: 14000,
    description: 'Tranche #2 : Essai de pompage continu et mise en service',
    triggerCondition: 'Conformité QA ≥ 90% & Zéro anomalie CRITICAL',
    status: 'BLOCKED_BY_ANOMALY',
    blockedReason: 'Bloqué automatiquement : Anomalie critique ouverte (Turbidité argileuse & Débit < 6 L/min).'
  },
  {
    id: 'pay-004',
    siteId: 'site-solar-madimba',
    contractorName: 'SolarPower DRC Ltd',
    trancheNumber: 3,
    amountUsd: 26000,
    description: 'Tranche #3 : Câblage réseau basse tension 400V et pose onduleurs',
    triggerCondition: 'Conformité QA ≥ 90% & Zéro anomalie CRITICAL',
    status: 'LOCKED',
    blockedReason: 'En attente de la clôture de la revue QA.'
  }
];

export const INITIAL_REMEDIATIONS: ContractorRemediation[] = [
  {
    id: 'rem-001',
    anomalyId: 'anom-tshikapa-01',
    contractorName: 'Kasaï Forage Express',
    submittedAt: '2026-11-04T14:20:00Z',
    repairSummary: 'Soufflage à l’air-lift haute pression effectué sur 48h. Remplacement de la crépine défectueuse par un modèle PVC fendu 0.3mm avec massif de gravier étalonné.',
    invoiceRef: 'FAC-CORR-2026-88',
    photoProofUrl: '/src/assets/images/wash_water_borehole_1793818308094.jpg',
    reinspectionRequested: true,
    status: 'SUBMITTED'
  }
];

export const INITIAL_COMMUNITY_SIGNALS: CommunitySignal[] = [
  {
    id: 'sig-001',
    siteId: 'site-wash-tshikapa',
    channel: 'SMS',
    senderPhoneMasked: '+243 99 *** 8109',
    senderRole: 'CITIZEN',
    plateId: 'P-145T-092',
    message: 'La population est très en colère ! Le forage est à sec depuis 3 semaines, les enfants doivent boire l eau sale de la rivière. Déjà des cas de diarrhée, c est inadmissible !',
    issueCategory: 'PUMP_BROKEN',
    reportedAt: '2026-11-04T14:20:00Z',
    postDeliveryAgeDays: 45,
    status: 'NEW',
    sentimentAnalysis: {
      sentiment: 'ANGER_CHRONIC',
      urgencyLevel: 'CRITICAL',
      urgencyScore: 96,
      dominantEmotion: 'Colère vive & Exaspération usagers',
      detectedTriggers: ['Colère populaire vive', 'Pénurie chronique prolongée (>21j)', 'Épidémie / Risque hydrique', 'Ouvrage totalement à sec'],
      summaryJustification: 'Colère aiguë liée à un manque d\'eau prolongé (> 3 semaines) avec impact sanitaire direct sur les enfants.',
      languageDetected: 'FR',
      analyzedAt: '2026-11-04T14:20:05Z'
    }
  },
  {
    id: 'sig-002',
    siteId: 'site-solar-madimba',
    channel: 'WHATSAPP',
    senderPhoneMasked: '+243 89 *** 3301',
    senderRole: 'HEALTH_STAFF',
    plateId: 'P-145T-015',
    message: 'Urgence dispensaire : l électricité solaire a coupé pendant la nuit. La chaîne du froid des vaccins pédiatriques est menacée si pas de réparation dans les 24h !',
    issueCategory: 'SOLAR_DARK',
    reportedAt: '2026-11-04T22:15:00Z',
    postDeliveryAgeDays: 12,
    status: 'NEW',
    sentimentAnalysis: {
      sentiment: 'DISTRESS_URGENT',
      urgencyLevel: 'CRITICAL',
      urgencyScore: 92,
      dominantEmotion: 'Détresse sanitaire & Urgence vitale',
      detectedTriggers: ['Rupture chaîne du froid vaccins', 'Appel de détresse usagers', 'Dispensaire dans le noir'],
      summaryJustification: 'Menace immédiate sur les stocks de vaccins suite au black-out de l\'onduleur solaire.',
      languageDetected: 'FR',
      analyzedAt: '2026-11-04T22:15:04Z'
    }
  },
  {
    id: 'sig-003',
    siteId: 'site-wash-maluku',
    channel: 'USSD',
    senderPhoneMasked: '+243 81 *** 4210',
    senderRole: 'VILLAGE_CHIEF',
    plateId: 'P-145T-041',
    message: 'L eau sort avec de la boue rouge depuis 3 jours. Impossible de boire sans risque pour les villageois.',
    issueCategory: 'WATER_DIRTY',
    reportedAt: '2026-11-03T16:40:00Z',
    postDeliveryAgeDays: 14,
    status: 'DISPATCHED_TO_AGENT',
    sentimentAnalysis: {
      sentiment: 'DISTRESS_URGENT',
      urgencyLevel: 'HIGH',
      urgencyScore: 78,
      dominantEmotion: 'Détresse sanitaire & Risque hydrique',
      detectedTriggers: ['Eau insalubre / Boue', 'Alerte Qualité Eau Souillée'],
      summaryJustification: 'Turbidité anormale de l\'eau nécessitant purge immédiate du tubage.',
      languageDetected: 'FR',
      analyzedAt: '2026-11-03T16:40:03Z'
    }
  },
  {
    id: 'sig-004',
    siteId: 'site-school-mweneditu',
    channel: 'SMS',
    senderPhoneMasked: '+243 82 *** 7714',
    senderRole: 'SCHOOL_DIRECTOR',
    plateId: 'P-145T-068',
    message: 'Le robinet numéro 2 fuit continuellement et le débit a fortement diminué. Longue file d attente le matin.',
    issueCategory: 'PUMP_BROKEN',
    reportedAt: '2026-11-02T10:30:00Z',
    postDeliveryAgeDays: 60,
    status: 'TRIAGED',
    sentimentAnalysis: {
      sentiment: 'FRUSTRATION_MODERATE',
      urgencyLevel: 'MEDIUM',
      urgencyScore: 48,
      dominantEmotion: 'Frustration & Plainte modérée',
      detectedTriggers: ['Dégradation matérielle locale', 'Débit d’eau restreint', 'Lenteur du service après-vente'],
      summaryJustification: 'Baisse de débit et fuite sans interruption totale de l\'accès à l\'eau.',
      languageDetected: 'FR',
      analyzedAt: '2026-11-02T10:30:06Z'
    }
  },
  {
    id: 'sig-005',
    siteId: 'site-wash-maluku',
    channel: 'USSD',
    senderPhoneMasked: '+243 84 *** 9021',
    senderRole: 'CITIZEN',
    plateId: 'P-145T-041',
    message: 'Forage fonctionne très bien. Débit abondant pour tout le quartier Maluku Centre. Matondo mingi !',
    issueCategory: 'NOMINAL',
    reportedAt: '2026-11-01T07:15:00Z',
    postDeliveryAgeDays: 90,
    status: 'TRIAGED',
    sentimentAnalysis: {
      sentiment: 'POSITIVE_SATISFACTION',
      urgencyLevel: 'LOW',
      urgencyScore: 12,
      dominantEmotion: 'Satisfaction & Adhésion locale',
      detectedTriggers: ['Satisfaction usagers', 'Remerciements Lingala'],
      summaryJustification: 'Témoignage de satisfaction populaire et débit nominal certifié par les usagers.',
      languageDetected: 'MIXED',
      analyzedAt: '2026-11-01T07:15:02Z'
    }
  }
];

export const INITIAL_IOT_READINGS: IotTelemetryReading[] = [
  {
    id: 'iot-maluku-01',
    siteId: 'site-wash-maluku',
    timestamp: '2026-11-04T06:00:00Z',
    sensorType: 'FLOW_PRESSURE',
    dailyVolumeM3: 42.6,
    waterTableDepthMeters: 28.4,
    isNominal: true,
    consecutiveZeroFlowDays: 0,
    alarmTriggered: false
  },
  {
    id: 'iot-tshikapa-02',
    siteId: 'site-wash-tshikapa',
    timestamp: '2026-11-04T06:00:00Z',
    sensorType: 'FLOW_PRESSURE',
    dailyVolumeM3: 1.2,
    waterTableDepthMeters: 44.1,
    isNominal: false,
    consecutiveZeroFlowDays: 4,
    alarmTriggered: true
  },
  {
    id: 'iot-madimba-03',
    siteId: 'site-solar-madimba',
    timestamp: '2026-11-04T06:00:00Z',
    sensorType: 'BATTERY_INVERTER',
    batteryVoltageDc: 48.8,
    inverterOutputVac: 228,
    isNominal: true,
    consecutiveZeroFlowDays: 0,
    alarmTriggered: false
  }
];

export const INITIAL_FLEET_ROUTES: FleetRoutePlan[] = [
  {
    id: 'route-kongo-central',
    agentId: 'agt-mukendi',
    agentName: 'Ing. Patient Mukendi',
    date: '2026-11-06',
    corridorName: 'Couloir Route Nationale 1 (Kinshasa - Matadi)',
    rainySeasonImpassableTracks: [
      'Piste Madimba vers Kisantu Sud (Bourbier km 14 - Praticable 4x4 uniquement)',
      'Déviation Lukala Rivière Inkisi (Pont bois fragilisé)'
    ],
    stops: [
      { siteId: 'site-solar-madimba', siteName: 'Mini-Centrale Solaire Madimba', sector: 'SOLAR', estimatedArrival: '09:30' },
      { siteId: 'site-btp-lukala', siteName: 'École Primaire Moderne Lukala', sector: 'BTP', estimatedArrival: '14:00' }
    ],
    totalDistanceKm: 245,
    fuelEstimatedLiters: 48
  }
];

export const INITIAL_DRONE_MISSIONS: DroneWaypointPlan[] = [
  {
    id: 'drone-lukala-01',
    siteId: 'site-btp-lukala',
    droneModel: 'DJI Mavic 3 Enterprise RTK',
    altitudeMeters: 75,
    groundSampleDistanceCm: 1.8,
    flightPathWaypoints: [
      [14.5005, -5.5170],
      [14.5055, -5.5175],
      [14.5050, -5.5205],
      [14.5010, -5.5200]
    ],
    estimatedFlightMinutes: 14,
    photosTargetCount: 168,
    orthophotoResolution: '2.1 cm/pixel',
    cutFillVolumeCalculatedM3: 420.5
  }
];

export const INITIAL_MOBILE_MONEY_PAYOUTS: MobileMoneyDisbursement[] = [
  {
    id: 'momo-001',
    agentId: 'agt-mukendi',
    agentName: 'Ing. Patient Mukendi',
    agentPhone: '+243 81 *** 4402',
    operator: 'M_PESA',
    amountUsd: 120,
    amountCdf: 336000,
    type: 'MISSION_PER_DIEM',
    status: 'INSTANT_RELEASED',
    transactionRef: 'MPESA-CD-2026-8812903',
    executedAt: '2026-11-04T17:45:00Z'
  },
  {
    id: 'momo-002',
    agentId: 'agt-kalala',
    agentName: 'Mme Christine Kalala',
    agentPhone: '+243 89 *** 7710',
    operator: 'ORANGE_MONEY',
    amountUsd: 150,
    amountCdf: 420000,
    type: 'BONUS_VERIFIED_REPORT',
    status: 'INSTANT_RELEASED',
    transactionRef: 'OM-RDC-992144510',
    executedAt: '2026-11-03T18:10:00Z'
  },
  {
    id: 'momo-003',
    agentId: 'agt-tshikapa',
    agentName: 'Ing. Alain Mbaya',
    agentPhone: '+243 99 *** 2309',
    operator: 'AIRTEL_MONEY',
    amountUsd: 120,
    amountCdf: 336000,
    type: 'MISSION_PER_DIEM',
    status: 'INSTANT_RELEASED',
    transactionRef: 'AIRTEL-MONEY-TX-09412',
    executedAt: '2026-11-02T11:20:00Z'
  }
];

export const INITIAL_OPEN_BANKING_ORDERS: BankOpenBankingOrder[] = [
  {
    id: 'obo-001',
    payoutId: 'pay-001',
    bankName: 'RAWBANK',
    swiftIso20022MsgType: 'pacs.008',
    ibanOrBban: 'CD45-0001-0002-3344-5566-7788',
    amountUsd: 18000,
    beneficiaryName: 'Congo Hydraulique SARL',
    status: 'SETTLED',
    rawbankReference: 'RAW-ISO20022-CD-2026-88210',
    signedSha256Digest: '4a8f9c2d1e0b5a6c7f8e9d0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c',
    settledAt: '2026-11-03T15:00:22Z'
  },
  {
    id: 'obo-002',
    payoutId: 'pay-002',
    bankName: 'EQUITY_BCDC',
    swiftIso20022MsgType: 'pacs.008',
    ibanOrBban: 'CD92-0003-0004-9988-7766-5544',
    amountUsd: 42000,
    beneficiaryName: 'BTP Kongo Bâtisseurs',
    status: 'SETTLED',
    rawbankReference: 'EQ-BCDC-SWIFT-2026-4412',
    signedSha256Digest: '9f8e7d6c5b4a3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
    settledAt: '2026-11-02T16:30:15Z'
  }
];

export const INITIAL_CLD_REPORTS: CldWeeklyAuditReport[] = [
  {
    id: 'cld-001',
    siteId: 'site-wash-maluku',
    siteName: 'Forage Solaire & Borne-Fontaine Maluku',
    cldPresidentName: 'Chef Coutumier Ilunga',
    cldPresidentPhone: '+243 81 *** 4210',
    weekNumber: 44,
    isOperatingNormally: true,
    daysOutOfService: 0,
    airtimeRewardPhoneRecharged: true,
    rewardAmountUsd: 5,
    submittedAt: '2026-11-05T08:00:00Z',
    observations: 'Pression nominale à la borne fontaine. Aucun signe de fuite ni d’infiltration.'
  },
  {
    id: 'cld-002',
    siteId: 'site-btp-lukala',
    siteName: 'École Primaire Moderne Lukala',
    cldPresidentName: 'Président CLD Nsimba',
    cldPresidentPhone: '+243 89 *** 1104',
    weekNumber: 44,
    isOperatingNormally: true,
    daysOutOfService: 0,
    airtimeRewardPhoneRecharged: true,
    rewardAmountUsd: 5,
    submittedAt: '2026-11-04T10:15:00Z',
    observations: 'Toiture et fenêtres en parfait état. Cours dispensés normalement aux élèves.'
  },
  {
    id: 'cld-003',
    siteId: 'site-wash-tshikapa',
    siteName: 'Forage d’Eau Potable Tshikapa Centre',
    cldPresidentName: 'Président CLD Mukendi',
    cldPresidentPhone: '+243 99 *** 8109',
    weekNumber: 44,
    isOperatingNormally: false,
    daysOutOfService: 4,
    airtimeRewardPhoneRecharged: true,
    rewardAmountUsd: 5,
    submittedAt: '2026-11-04T14:00:00Z',
    observations: 'Eau turbide avec boue rouge. Le village demande le passage d’une équipe technique.'
  }
];

export const INITIAL_HEALTH_DELIVERIES: HealthDeliveryVerification[] = [
  {
    centerName: 'Centre de Santé de Référence de Walungu (Sud-Kivu)',
    deliverySlipNumber: 'BL-2026-PNAM-FM-0842',
    programDonor: 'FONDS_MONDIAL',
    pharmacistRecipientName: 'Dr. Jean-Marc Lubamba (Pharmacien Responsable)',
    pharmacistPhone: '+243 97 *** 5521',
    coldChain: {
      refrigeratorModel: 'B Medical Systems TCW40SD (Solaire Direct Drive)',
      powerSource: 'SOLAR_DIRECT_DRIVE',
      currentTemperatureCelsius: 4.2,
      minTemperatureLast24h: 3.1,
      maxTemperatureLast24h: 6.8,
      isColdChainBreached: false,
      dataloggerSha256Checksum: 'e8b7c6d5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7',
      sensorSerialNumber: 'LOG-USB-WHO-2026-99014'
    },
    inventory: [
      {
        id: 'med-01',
        drugCode: 'MED-ACT-001',
        commercialName: 'Coartem 20/120mg (Artéméther/Luméfantrine)',
        innName: 'Artéméther 20mg + Luméfantrine 120mg',
        therapeuticClass: 'ANTIPALUDIQUE',
        batchNumber: 'LOT-2026-ACT-9912',
        quantityDelivered: 1200,
        unitOfMeasure: 'BOITE',
        expirationDate: '2028-06-30',
        monthsRemainingUntilExpiry: 20,
        status: 'CONFORME_VALIDE',
        storageRequirement: 'ROOM_TEMP_UNDER_30C',
        tamperProofPackagingIntact: true
      },
      {
        id: 'med-02',
        drugCode: 'MED-VAX-002',
        commercialName: 'Vaccin ROR (Rougeole-Oreillons-Rubéole)',
        innName: 'Vaccin vivant atténué ROR',
        therapeuticClass: 'VACCIN',
        batchNumber: 'LOT-2026-ROR-4410',
        quantityDelivered: 600,
        unitOfMeasure: 'FLACON',
        expirationDate: '2027-10-15',
        monthsRemainingUntilExpiry: 12,
        status: 'CONFORME_VALIDE',
        storageRequirement: 'COLD_CHAIN_2_8C',
        tamperProofPackagingIntact: true
      },
      {
        id: 'med-03',
        drugCode: 'MED-AMX-003',
        commercialName: 'Amoxicilline 500mg Gélules',
        innName: 'Amoxicilline trihydrate',
        therapeuticClass: 'ANTIBIOTIQUE',
        batchNumber: 'LOT-2025-AMX-8102',
        quantityDelivered: 850,
        unitOfMeasure: 'BOITE',
        expirationDate: '2027-02-28',
        monthsRemainingUntilExpiry: 4,
        status: 'EXPIRATION_PROCHE',
        storageRequirement: 'ROOM_TEMP_UNDER_30C',
        tamperProofPackagingIntact: true
      },
      {
        id: 'med-04',
        drugCode: 'MED-OXY-004',
        commercialName: 'Ocytocine Injectable 10 UI/ml (Santé Maternelle)',
        innName: 'Oxytocin synthétique',
        therapeuticClass: 'MATERNITE',
        batchNumber: 'LOT-2026-OXY-1109',
        quantityDelivered: 400,
        unitOfMeasure: 'AMPOULE',
        expirationDate: '2028-01-31',
        monthsRemainingUntilExpiry: 15,
        status: 'CONFORME_VALIDE',
        storageRequirement: 'COLD_CHAIN_2_8C',
        tamperProofPackagingIntact: true
      },
      {
        id: 'med-05',
        drugCode: 'MED-SRO-005',
        commercialName: 'Sels de Réhydratation Orale (SRO) + Zinc',
        innName: 'Sels OMS + Sulfate de Zinc 20mg',
        therapeuticClass: 'SOLUTE',
        batchNumber: 'LOT-2026-SRO-3321',
        quantityDelivered: 1500,
        unitOfMeasure: 'BOITE',
        expirationDate: '2028-12-31',
        monthsRemainingUntilExpiry: 26,
        status: 'CONFORME_VALIDE',
        storageRequirement: 'ROOM_TEMP_UNDER_30C',
        tamperProofPackagingIntact: true
      }
    ],
    totalUnitsInspected: 4550,
    expiredUnitsCount: 0,
    closeToExpiryUnitsCount: 850,
    complianceRatingPercent: 96,
    disbursementAuthorized: true
  }
];

export const INITIAL_MINING_AUDITS: MiningRseAudit[] = [
  {
    id: 'mine-audit-001',
    siteId: 'site-mine-kolwezi',
    siteName: 'Centre Polyvalent & Hôpital Communautaire RSE Kolwezi (Dotation 0.3%)',
    miningCompany: 'Tenke Fungurume Mining (TFM / CMOC)',
    concessionName: 'Concession Kolwezi-Fungurume Ouest (PE 528)',
    province: 'Lualaba',
    cldName: 'CLD Mutanda-Fungurume Centre',
    cldPresidentName: 'M. Barnabé Tshiswaka (Président CLD)',
    cldPresidentPhone: '+243 82 *** 7190',
    dotationTotalUsd: 485000,
    disbursedAmountUsd: 320000,
    localWorkforcePercent: 82.5,
    bpuComplianceRatePercent: 94,
    antiPollutionCertified: true,
    cldValidationStatus: 'APPROVED_BY_COMMUNITY',
    cldSignoffNotes: 'Le CLD certifie la conformité des fondations et des menuiseries alu. Aucun travailleur extérieur non qualifié n’a été substitué.',
    lastInspectionDate: '2026-11-04T15:00:00Z',
    bpuItems: [
      {
        id: 'bpu-01',
        itemCode: 'BPU-CIV-001',
        description: 'Béton armé dosé à 350 kg/m³ pour radier et poteaux porteurs',
        unit: 'm³',
        contractQuantity: 180,
        contractUnitPriceUsd: 320,
        inspectedQuantity: 180,
        inspectedUnitPriceUsd: 320,
        isCompliantWithBpu: true
      },
      {
        id: 'bpu-02',
        itemCode: 'BPU-MET-002',
        description: 'Ferraillage acier haute adhérence FeE500 diamètre 12mm/16mm',
        unit: 'tonne',
        contractQuantity: 24.5,
        contractUnitPriceUsd: 1850,
        inspectedQuantity: 24.5,
        inspectedUnitPriceUsd: 1850,
        isCompliantWithBpu: true
      },
      {
        id: 'bpu-03',
        itemCode: 'BPU-ROOF-003',
        description: 'Tôles prélaquées ondulées galvanisées 0.60mm (anti-corrosion acide minier)',
        unit: 'm²',
        contractQuantity: 820,
        contractUnitPriceUsd: 28,
        inspectedQuantity: 820,
        inspectedUnitPriceUsd: 28,
        isCompliantWithBpu: true
      },
      {
        id: 'bpu-04',
        itemCode: 'BPU-MED-004',
        description: 'Bloc opératoire : revêtement sol résine époxy anti-bactérienne sans joint',
        unit: 'm²',
        contractQuantity: 140,
        contractUnitPriceUsd: 65,
        inspectedQuantity: 135,
        inspectedUnitPriceUsd: 65,
        isCompliantWithBpu: false,
        varianceNote: 'Écart de 5 m² constaté lors du métré laser in-situ (rectification exigée).'
      }
    ],
    workers: [
      {
        workerId: 'w-01',
        fullName: 'Kasongo Ilunga Patrick',
        communityVillage: 'Village Mutanda (500m concession)',
        isLocalResident: true,
        jobTitle: 'Ferrailleur Chef d’équipe',
        dailyWageUsd: 18.5,
        daysPresent: 26
      },
      {
        workerId: 'w-02',
        fullName: 'Mwamba Kanyinda Joseph',
        communityVillage: 'Village Kasulu',
        isLocalResident: true,
        jobTitle: 'Maçon Finisseur',
        dailyWageUsd: 15.0,
        daysPresent: 24
      },
      {
        workerId: 'w-03',
        fullName: 'Banze Kapend Christian',
        communityVillage: 'Village Tondo',
        isLocalResident: true,
        jobTitle: 'Électricien BTP',
        dailyWageUsd: 22.0,
        daysPresent: 22
      },
      {
        workerId: 'w-04',
        fullName: 'Mbuyi Kalonji David',
        communityVillage: 'Lubumbashi (Non-résident local)',
        isLocalResident: false,
        jobTitle: 'Conducteur de Travaux Spécialisé',
        dailyWageUsd: 45.0,
        daysPresent: 26
      }
    ]
  }
];

export const INITIAL_AGRI_AUDITS: AgriProjectAudit[] = [
  {
    id: 'agri-audit-001',
    siteId: 'site-agri-kimpese',
    siteName: 'Complexe Greniers Vivriers, Silos & Moulins de Kimpese (FIDA/BAD)',
    donorProgram: 'BAD_PADAS',
    province: 'Kongo Central',
    territory: 'Songololo',
    cooperativeName: 'Coopérative Agricole des Producteurs de Kimpese (COOPAK)',
    hectaresTotalPlanted: 650,
    hectaresVerifiedGps: 642.5,
    cropYieldEstimateTonsPerHectare: 4.8,
    feederRoadPassability: 'PRATICABLE_TOUT_VEHICULE',
    feederRoadDistanceKm: 38.5,
    averageMoisturePercent: 12.4,
    overallScorePercent: 96,
    lastAuditDate: '2026-11-05T10:00:00Z',
    silos: [
      {
        siloId: 'silo-01',
        siloName: 'Silo Métallique A1 - Maïs Grains',
        grainType: 'MAIS',
        capacityMetricTons: 250,
        currentStockMetricTons: 195,
        moisturePercent: 12.1,
        isMoistureSafe: true,
        temperatureInsideCelsius: 24.5,
        pestProofCondition: 'PARFAITE_ETANCHEITE',
        lastMoistureSensorCalibrated: '2026-11-04'
      },
      {
        siloId: 'silo-02',
        siloName: 'Silo Cylindrique B2 - Manioc Cossettes',
        grainType: 'MANIOC',
        capacityMetricTons: 200,
        currentStockMetricTons: 140,
        moisturePercent: 12.8,
        isMoistureSafe: true,
        temperatureInsideCelsius: 25.1,
        pestProofCondition: 'PARFAITE_ETANCHEITE',
        lastMoistureSensorCalibrated: '2026-11-03'
      },
      {
        siloId: 'silo-03',
        siloName: 'Silo C3 - Soja & Légumineuses',
        grainType: 'SOJA',
        capacityMetricTons: 150,
        currentStockMetricTons: 85,
        moisturePercent: 14.6,
        isMoistureSafe: false,
        temperatureInsideCelsius: 28.2,
        pestProofCondition: 'DEFAUT_MINEUR',
        lastMoistureSensorCalibrated: '2026-11-05'
      }
    ],
    millingMachines: [
      {
        id: 'mill-01',
        machineType: 'MOULIN_A_MAIS',
        serialNumber: 'SN-MILL-MAIS-2026-88',
        manufacturer: 'Alvan Blanch Industrial Ltd',
        nominalCapacityKgPerHour: 1500,
        isOperational: true,
        powerSource: 'SOLAIRE',
        hoursOperatedThisWeek: 38
      },
      {
        id: 'mill-02',
        machineType: 'DECORTIQUEUSE_RIZ',
        serialNumber: 'SN-DEC-RIZ-2025-412',
        manufacturer: 'Yanmar Agri Machinery',
        nominalCapacityKgPerHour: 800,
        isOperational: true,
        powerSource: 'SOLAIRE',
        hoursOperatedThisWeek: 26
      },
      {
        id: 'mill-03',
        machineType: 'RAPEUSE_MANIOC',
        serialNumber: 'SN-RAP-MANIOC-901',
        manufacturer: 'Ateliers Mécaniques de Kinshasa (AMEK)',
        nominalCapacityKgPerHour: 1200,
        isOperational: false,
        powerSource: 'DIESEL',
        hoursOperatedThisWeek: 4,
        defectNotes: 'Courroie d’entraînement trapézoïdale rompue. Pièce en commande auprès de Matadi.'
      }
    ]
  }
];

export const INITIAL_HYDRO_AUDITS: HydroAudit[] = [
  {
    id: 'hydro-audit-001',
    siteId: 'site-hydro-mutwanga',
    siteName: 'Micro-Centrale Hydroélectrique de Mutwanga (1.4 MW)',
    riverName: 'Rivière Lume (Parc National des Virunga)',
    province: 'Nord-Kivu',
    territory: 'Beni',
    damType: 'MICRO_HYDRO_RUN_OF_RIVER',
    flowRateLitersSec: 1850,
    minEnvironmentalFlowLitersSec: 420,
    headHeightMeters: 85,
    penstockStatus: 'INTACT_NO_LEAKS',
    debrisTrashRackClean: true,
    installedCapacityKwTotal: 1400,
    currentGenerationKwTotal: 1180,
    complianceScorePercent: 96,
    lastAuditDate: '2026-11-06T09:30:00Z',
    turbines: [
      {
        id: 'turb-01',
        turbineCode: 'TURB-PELTON-01',
        turbineType: 'PELTON',
        ratedCapacityKw: 700,
        currentOutputKw: 610,
        rpmSpeed: 750,
        oilPressureBar: 42.5,
        bearingTempCelsius: 48.2,
        status: 'ONLINE_NOMINAL',
        vibrationLevelMmSec: 1.8
      },
      {
        id: 'turb-02',
        turbineCode: 'TURB-PELTON-02',
        turbineType: 'PELTON',
        ratedCapacityKw: 700,
        currentOutputKw: 570,
        rpmSpeed: 748,
        oilPressureBar: 41.8,
        bearingTempCelsius: 51.0,
        status: 'ONLINE_NOMINAL',
        vibrationLevelMmSec: 2.1
      }
    ],
    gridMetrics: {
      frequencyHz: 50.05,
      voltagePhaseAcVolts: 231.4,
      powerFactorCosPhi: 0.92,
      transformerSubstationStatus: 'ENERGIZED_NORMAL',
      householdsConnected: 4850,
      ruralMicrogridKm: 42.5,
      outagesLast30Days: 1
    }
  }
];

export const INITIAL_ENV_AUDITS: EnvReforestationAudit[] = [
  {
    id: 'env-audit-001',
    siteId: 'site-env-mai-ndombe',
    siteName: 'Projet de Reforestation Communautaire & Réserve Carbone Maï-Ndombe',
    province: 'Maï-Ndombe',
    territory: 'Inongo',
    carbonStandard: 'VERRA_VCS',
    projectDeveloper: 'Fonds Vert Climat / Éco-Communauté Lac Léopold II',
    concessionHectares: 2400,
    totalTreesPlantedTarget: 180000,
    totalTreesVerifiedLiving: 154800,
    globalSurvivalRatePercent: 86.0,
    accumulatedCo2SequestrationTons: 124500,
    annualCo2RateTons: 18200,
    carbonCreditsEstimatedUsd: 1494000,
    satelliteVegetationNviIndex: 0.81,
    firebreakPerimeterMaintained: true,
    carbonCertificationStatus: 'CERTIFIED_VERRA_ISSUED',
    lastVerificationDate: '2026-11-05T14:00:00Z',
    plots: [
      {
        plotId: 'plot-01',
        plotName: 'Parcelle A - Forêt Dense Fluviale',
        speciesName: 'Millettia laurentii (Wengé Noble)',
        isEndangeredNativeSpecies: true,
        treesPlantedTarget: 60000,
        treesCountedAiDrone: 52800,
        healthyTreesCount: 51200,
        deadOrStumpCount: 7200,
        survivalRatePercent: 88.0,
        carbonBiomassCo2ePerYearTons: 6800,
        canopyDensityPercent: 78
      },
      {
        plotId: 'plot-02',
        plotName: 'Parcelle B - Zone Agro-Forestière Communautaire',
        speciesName: 'Autranella congolensis (Mukwa)',
        isEndangeredNativeSpecies: true,
        treesPlantedTarget: 50000,
        treesCountedAiDrone: 42500,
        healthyTreesCount: 41800,
        deadOrStumpCount: 7500,
        survivalRatePercent: 85.0,
        carbonBiomassCo2ePerYearTons: 5400,
        canopyDensityPercent: 69
      },
      {
        plotId: 'plot-03',
        plotName: 'Parcelle C - Ceinture Coupe-Feu & Pépinières',
        speciesName: 'Acacia auriculiformis (Fixateur d’Azote)',
        isEndangeredNativeSpecies: false,
        treesPlantedTarget: 70000,
        treesCountedAiDrone: 59500,
        healthyTreesCount: 58800,
        deadOrStumpCount: 10500,
        survivalRatePercent: 85.0,
        carbonBiomassCo2ePerYearTons: 6000,
        canopyDensityPercent: 72
      }
    ],
    communityGuards: [
      {
        guardId: 'grd-01',
        fullName: 'Bokole Ngongo Médard',
        villageName: 'Village Bokote',
        patrolHoursThisMonth: 120,
        phone: '+243 81 *** 3312',
        airtimeSubsidyPaidUsd: 15,
        illegalLoggingAlertsLogged: 0
      },
      {
        guardId: 'grd-02',
        fullName: 'Mpetsi Iluku Jeanne',
        villageName: 'Village Inongo-Rive',
        patrolHoursThisMonth: 105,
        phone: '+243 89 *** 6678',
        airtimeSubsidyPaidUsd: 15,
        illegalLoggingAlertsLogged: 1
      }
    ]
  }
];



