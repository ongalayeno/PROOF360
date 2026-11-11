import React, { useState, useEffect } from 'react';
import { Header, AppTab } from './components/Header';
import { MissionList } from './components/MissionList';
import { MapOverview } from './components/MapOverview';
import { QAReviewWorkbench } from './components/QAReviewWorkbench';
import { MobileAgentSimulator } from './components/MobileAgentSimulator';
import { AuditLedgerView } from './components/AuditLedgerView';
import { CertifiedReportModal } from './components/CertifiedReportModal';
import { PublicVerifyModal } from './components/PublicVerifyModal';
import { NewMissionModal } from './components/NewMissionModal';
import { FinanceRemediationPortal } from './components/FinanceRemediationPortal';
import { CommunityIotView } from './components/CommunityIotView';
import { FleetDroneOperationsView } from './components/FleetDroneOperationsView';
import { ExecutiveInstitutionalDashboard } from './components/ExecutiveInstitutionalDashboard';
import { CitizenTransparencyPortal } from './components/CitizenTransparencyPortal';
import { HealthColdChainView } from './components/HealthColdChainView';
import { MiningRseView } from './components/MiningRseView';
import { AgriProjectView } from './components/AgriProjectView';
import { HydroDamView } from './components/HydroDamView';
import { EnvReforestationView } from './components/EnvReforestationView';
import { loadState, saveState, appendAuditLog, resetStateToDefault, Proof360State } from './services/storageService';
import { sha256 } from './services/integrityEngine';
import { analyzeSignalSentiment } from './services/sentimentService';
import { 
  Mission, 
  Inspection, 
  FieldResponse, 
  DeviceMetadata, 
  Anomaly, 
  MilestonePayout, 
  ContractorRemediation, 
  CommunitySignal,
  MobileMoneyDisbursement,
  CldWeeklyAuditReport,
  MedicineItem,
  BpuLineItem,
  LocalWorkerAttendance,
  SiloStorageReading,
  MiningRseAudit,
  HydroTurbineUnit,
  TreeSpeciesPlot
} from './types/proof360';
import { ShieldCheck, RotateCcw, AlertTriangle, Layers, MapPin, Radio, Truck, FileBarChart, History, Globe, HeartPulse, DollarSign, Pickaxe, Wheat, Zap, Trees } from 'lucide-react';

export default function App() {
  const [state, setState] = useState<Proof360State>(loadState);
  const [activeTab, setActiveTab] = useState<AppTab>('missions');
  const [selectedMissionId, setSelectedMissionId] = useState<string>(state.missions[0]?.id || '');
  const [activeReportInspectionId, setActiveReportInspectionId] = useState<string | null>(null);
  const [activePublicVerifyReportNumber, setActivePublicVerifyReportNumber] = useState<string | null>(null);
  const [isNewMissionOpen, setIsNewMissionOpen] = useState(false);
  const [outboxQueue, setOutboxQueue] = useState<Array<{
    id: string;
    missionId: string;
    title: string;
    timestamp: string;
  }>>([
    {
      id: 'batch-local-01',
      missionId: 'miss-hydro-09',
      title: 'Audit Débit Étiage & Turbines Mutwanga',
      timestamp: 'Il y a 12 min'
    }
  ]);

  // Sync state to local storage whenever it changes
  useEffect(() => {
    saveState(state);
  }, [state]);

  const pendingQACount = state.inspections.filter(i => i.status === 'UNDER_REVIEW' || i.status === 'SUBMITTED').length;

  const currentMission = state.missions.find(m => m.id === selectedMissionId) || state.missions[0];
  const currentInspection = state.inspections.find(i => i.id === currentMission?.latestInspectionId) || 
    state.inspections.find(i => i.missionId === currentMission?.id);

  // Navigation handlers
  const handleSelectMissionForQA = (missionId: string) => {
    setSelectedMissionId(missionId);
    setActiveTab('qa');
  };

  const handleOpenMobileForMission = (missionId: string) => {
    setSelectedMissionId(missionId);
    setActiveTab('mobile');
  };

  const handleOpenReportModal = (inspectionId: string) => {
    setActiveReportInspectionId(inspectionId);
  };

  // Create new mission handler
  const handleCreateMission = async (missionData: {
    title: string;
    siteId: string;
    protocolCode: string;
    assignedAgentName: string;
    scheduledDate: string;
  }) => {
    const site = state.sites.find(s => s.id === missionData.siteId) || state.sites[0];
    const newMissionId = `miss-${Date.now()}`;
    const newMissionCode = `MIS-2026-${site.sector}-${Math.floor(100 + Math.random() * 900)}`;

    const newMission: Mission = {
      id: newMissionId,
      code: newMissionCode,
      title: missionData.title,
      siteId: site.id,
      site,
      protocolCode: missionData.protocolCode,
      assignedAgentId: `agt-${Date.now()}`,
      assignedAgentName: missionData.assignedAgentName,
      status: 'OPEN',
      scheduledDate: missionData.scheduledDate,
      createdAt: new Date().toISOString(),
      inspectionsCount: 0,
      anomaliesCount: 0
    };

    const updatedMissions = [newMission, ...state.missions];
    const updatedStateWithMission = { ...state, missions: updatedMissions };

    const { newState } = await appendAuditLog(updatedStateWithMission, {
      action: 'MISSION_CREATED',
      entityType: 'MISSION',
      entityId: newMissionId,
      actorName: 'Direction Opérations PROOF360 Kinshasa',
      actorRole: 'CLIENT_ADMIN',
      payload: {
        code: newMissionCode,
        siteId: site.id,
        protocol: missionData.protocolCode,
        assignedAgent: missionData.assignedAgentName
      }
    });

    setState(newState);
    setSelectedMissionId(newMissionId);
  };

  // Sync inspection from mobile client
  const handleSyncInspectionBatch = async (payload: {
    missionId: string;
    siteId: string;
    agentName: string;
    protocolCode: string;
    responses: FieldResponse[];
    deviceMetadata: DeviceMetadata;
  }) => {
    const inspectionId = `insp-${Date.now()}`;
    const idempotencyKey = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const newInspection: Inspection = {
      id: inspectionId,
      missionId: payload.missionId,
      siteId: payload.siteId,
      agentId: `agt-${payload.agentName.toLowerCase().replace(/\s+/g, '-')}`,
      agentName: payload.agentName,
      protocolCode: payload.protocolCode,
      protocolVersion: 1,
      status: 'UNDER_REVIEW',
      syncIdempotencyKey: idempotencyKey,
      clientStartedAt: new Date(Date.now() - 35 * 60000).toISOString(),
      clientSubmittedAt: new Date().toISOString(),
      serverReceivedAt: new Date().toISOString(),
      deviceMetadata: payload.deviceMetadata,
      responses: payload.responses,
      integrityConfidenceScore: 97
    };

    // Update mission status to QA_REVIEW
    const updatedMissions = state.missions.map(m => {
      if (m.id === payload.missionId) {
        return {
          ...m,
          status: 'QA_REVIEW' as const,
          inspectionsCount: m.inspectionsCount + 1,
          latestInspectionId: inspectionId
        };
      }
      return m;
    });

    const updatedInspections = [newInspection, ...state.inspections];
    const preAuditState = {
      ...state,
      missions: updatedMissions,
      inspections: updatedInspections
    };

    const { newState } = await appendAuditLog(preAuditState, {
      action: 'INSPECTION_SYNCED',
      entityType: 'INSPECTION',
      entityId: inspectionId,
      actorName: `${payload.agentName} (Mobile Capture)`,
      actorRole: 'PROOF_AGENT',
      payload: {
        missionId: payload.missionId,
        idempotencyKey,
        device: payload.deviceMetadata.deviceModel,
        evidencesCount: payload.responses.filter(r => r.evidence).length
      }
    });

    setState(newState);
  };

  // QA Approval & Cryptographic Seal
  const handleQAApprove = async (inspectionId: string, qaScore: number, qaNotes: string) => {
    const inspection = state.inspections.find(i => i.id === inspectionId);
    if (!inspection) return;

    const mission = state.missions.find(m => m.id === inspection.missionId);
    const site = state.sites.find(s => s.id === inspection.siteId);

    const reportNumber = inspection.reportNumber || 
      `RPT-2026-${site?.sector || 'WASH'}-${site?.territory.slice(0, 3).toUpperCase() || 'KIN'}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Generate real PDF SHA-256 seal
    const sealData = `${reportNumber}|${inspection.id}|${qaScore}|${qaNotes}|${Date.now()}`;
    const pdfSha256 = await sha256(sealData);
    const publicVerificationSig = `sig_${reportNumber.toLowerCase()}_proof360_bceco`;

    const updatedInspections = state.inspections.map(i => {
      if (i.id === inspectionId) {
        return {
          ...i,
          status: 'APPROVED' as const,
          qaScore,
          qaNotes,
          qaReviewerName: 'Mme Christine Kalala (Auditeur Senior QA)',
          qaReviewedAt: new Date().toISOString(),
          reportNumber,
          pdfSha256,
          publicVerificationSig
        };
      }
      return i;
    });

    const updatedMissions = state.missions.map(m => {
      if (m.id === inspection.missionId) {
        return {
          ...m,
          status: 'APPROVED' as const
        };
      }
      return m;
    });

    const preAuditState = {
      ...state,
      inspections: updatedInspections,
      missions: updatedMissions
    };

    const { newState } = await appendAuditLog(preAuditState, {
      action: 'QA_APPROVED_AND_SEALED',
      entityType: 'REPORT',
      entityId: inspectionId,
      actorName: 'Mme Christine Kalala (QA Reviewer)',
      actorRole: 'QA_REVIEWER',
      payload: {
        reportNumber,
        pdfSha256,
        qaScore
      }
    });

    setState(newState);
  };

  // QA Rejection
  const handleQAReject = async (inspectionId: string, reason: string) => {
    const inspection = state.inspections.find(i => i.id === inspectionId);
    if (!inspection) return;

    const updatedInspections = state.inspections.map(i => {
      if (i.id === inspectionId) {
        return {
          ...i,
          status: 'REJECTED' as const,
          qaNotes: `Rejeté : ${reason}`,
          qaReviewerName: 'Mme Christine Kalala (QA Reviewer)',
          qaReviewedAt: new Date().toISOString()
        };
      }
      return i;
    });

    const updatedMissions = state.missions.map(m => {
      if (m.id === inspection.missionId) {
        return {
          ...m,
          status: 'REJECTED' as const
        };
      }
      return m;
    });

    const preAuditState = {
      ...state,
      inspections: updatedInspections,
      missions: updatedMissions
    };

    const { newState } = await appendAuditLog(preAuditState, {
      action: 'QA_REJECTED',
      entityType: 'INSPECTION',
      entityId: inspectionId,
      actorName: 'Mme Christine Kalala (QA Reviewer)',
      actorRole: 'QA_REVIEWER',
      payload: { reason }
    });

    setState(newState);
  };

  // Declare Anomaly & Needs Reinspection
  const handleDeclareAnomaly = async (
    inspectionId: string,
    title: string,
    severity: 'HIGH' | 'CRITICAL',
    notes: string
  ) => {
    const inspection = state.inspections.find(i => i.id === inspectionId);
    if (!inspection) return;

    const newAnomaly: Anomaly = {
      id: `anom-${Date.now()}`,
      inspectionId,
      siteId: inspection.siteId,
      title,
      severity,
      status: 'OPEN',
      description: notes,
      reportedAt: new Date().toISOString()
    };

    const updatedMissions = state.missions.map(m => {
      if (m.id === inspection.missionId) {
        return {
          ...m,
          status: 'NEEDS_REINSPECTION' as const,
          anomaliesCount: m.anomaliesCount + 1
        };
      }
      return m;
    });

    const preAuditState = {
      ...state,
      missions: updatedMissions,
      anomalies: [newAnomaly, ...state.anomalies]
    };

    const { newState } = await appendAuditLog(preAuditState, {
      action: 'ANOMALY_OPENED',
      entityType: 'ANOMALY',
      entityId: newAnomaly.id,
      actorName: 'Mme Christine Kalala (QA Reviewer)',
      actorRole: 'QA_REVIEWER',
      payload: {
        title,
        severity,
        missionId: inspection.missionId
      }
    });

    setState(newState);
  };

  // Smart Milestone Payout Release
  const handleReleasePayout = async (payoutId: string) => {
    const payout = state.payouts.find(p => p.id === payoutId);
    if (!payout) return;

    // Verify if open critical anomalies remain on the site
    const siteAnomalies = state.anomalies.filter(
      a => a.siteId === payout.siteId && a.status === 'OPEN' && a.severity === 'CRITICAL'
    );
    if (siteAnomalies.length > 0) {
      alert('Blocage de sécurité : des anomalies CRITIQUES sont toujours en cours sur cet ouvrage.');
      return;
    }

    const bankTransferRef = `RAW-TRF-2026-BCECO-${Math.floor(1000 + Math.random() * 9000)}`;
    const updatedPayouts = state.payouts.map(p => {
      if (p.id === payoutId) {
        return {
          ...p,
          status: 'APPROVED_RELEASED' as const,
          releasedAt: new Date().toISOString(),
          bankTransferRef
        };
      }
      return p;
    });

    const preAuditState: Proof360State = { ...state, payouts: updatedPayouts };
    const { newState } = await appendAuditLog(preAuditState, {
      action: 'PAYOUT_RELEASED',
      entityType: 'PAYMENT',
      entityId: payoutId,
      actorName: 'Direction Financière BCECO / Ministère des Finances',
      actorRole: 'CLIENT_ADMIN',
      payload: {
        payoutId,
        amountUsd: payout.amountUsd,
        description: payout.description,
        bankTransferRef,
        triggerCondition: payout.triggerCondition
      }
    });

    setState(newState);
  };

  // Contractor Remediation Submission
  const handleSubmitRemediation = async (data: {
    anomalyId: string;
    contractorName: string;
    repairSummary: string;
    invoiceRef: string;
  }) => {
    const remediationId = `rem-${Date.now()}`;
    const newRemediation: ContractorRemediation = {
      id: remediationId,
      anomalyId: data.anomalyId,
      contractorName: data.contractorName,
      submittedAt: new Date().toISOString(),
      repairSummary: data.repairSummary,
      photoProofUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=800&q=80',
      invoiceRef: data.invoiceRef,
      reinspectionRequested: true,
      status: 'SUBMITTED'
    };

    const updatedAnomalies: Anomaly[] = state.anomalies.map(a => {
      if (a.id === data.anomalyId) {
        return {
          ...a,
          status: 'IN_REMEDIATION' as const,
          remediationNotes: `Remédiation soumise par ${data.contractorName} : ${data.repairSummary} (Réf: ${data.invoiceRef})`
        };
      }
      return a;
    });

    const preAuditState: Proof360State = {
      ...state,
      remediations: [newRemediation, ...state.remediations],
      anomalies: updatedAnomalies
    };

    const { newState } = await appendAuditLog(preAuditState, {
      action: 'CONTRACTOR_REMEDIATION_SUBMITTED',
      entityType: 'ANOMALY',
      entityId: data.anomalyId,
      actorName: data.contractorName,
      actorRole: 'PROOF_AGENT',
      payload: {
        remediationId,
        invoiceRef: data.invoiceRef,
        repairSummary: data.repairSummary
      }
    });

    setState(newState);
  };

  // Community Signal Dispatch to Field Agent
  const handleDispatchAgentForSignal = async (signalId: string) => {
    const signal = state.communitySignals.find(s => s.id === signalId);
    if (!signal) return;

    const updatedSignals: CommunitySignal[] = state.communitySignals.map(s => {
      if (s.id === signalId) {
        return {
          ...s,
          status: 'DISPATCHED_TO_AGENT' as const
        };
      }
      return s;
    });

    const preAuditState: Proof360State = { ...state, communitySignals: updatedSignals };
    const { newState } = await appendAuditLog(preAuditState, {
      action: 'COMMUNITY_SIGNAL_DISPATCHED',
      entityType: 'FEEDBACK',
      entityId: signalId,
      actorName: 'Centre Opérationnel PROOF360 Kinshasa',
      actorRole: 'CLIENT_ADMIN',
      payload: {
        channel: signal.channel,
        plateId: signal.plateId,
        category: signal.issueCategory
      }
    });

    setState(newState);
  };

  // Community Signal (USSD / SMS / WhatsApp) Simulation
  const handleSimulateUssdSignal = async (data: {
    siteId: string;
    channel: 'USSD' | 'SMS' | 'WHATSAPP';
    senderRole: 'VILLAGE_CHIEF' | 'SCHOOL_DIRECTOR' | 'HEALTH_STAFF' | 'CITIZEN';
    plateId: string;
    message: string;
    issueCategory: 'PUMP_BROKEN' | 'WATER_DIRTY' | 'ROOF_DAMAGED' | 'SOLAR_DARK' | 'NOMINAL';
  }) => {
    const signalId = `sig-${Date.now()}`;
    const sentimentAnalysis = analyzeSignalSentiment(data.message, {
      issueCategory: data.issueCategory,
      senderRole: data.senderRole
    });

    const newSignal: CommunitySignal = {
      id: signalId,
      siteId: data.siteId,
      plateId: data.plateId,
      channel: data.channel,
      senderPhoneMasked: `+243 81 *** ${Math.floor(1000 + Math.random() * 9000)}`,
      senderRole: data.senderRole,
      message: data.message,
      issueCategory: data.issueCategory,
      reportedAt: new Date().toISOString(),
      postDeliveryAgeDays: Math.floor(15 + Math.random() * 120),
      status: 'NEW',
      sentimentAnalysis
    };

    const preAuditState: Proof360State = {
      ...state,
      communitySignals: [newSignal, ...state.communitySignals]
    };

    const { newState } = await appendAuditLog(preAuditState, {
      action: 'COMMUNITY_SIGNAL_RECEIVED',
      entityType: 'FEEDBACK',
      entityId: signalId,
      actorName: `${data.senderRole} (${data.channel})`,
      actorRole: 'PROOF_AGENT',
      payload: {
        siteId: data.siteId,
        plateId: data.plateId,
        category: data.issueCategory,
        sentiment: sentimentAnalysis.sentiment,
        urgencyScore: sentimentAnalysis.urgencyScore,
        urgencyLevel: sentimentAnalysis.urgencyLevel
      }
    });

    setState(newState);
  };

  // Instant Agent Mobile Money Per-Diem Payout (M-Pesa / Orange / Airtel)
  const handleTriggerMobileMoneyPayout = async (
    agentName: string, 
    amountUsd: number, 
    operator: 'M_PESA' | 'ORANGE_MONEY' | 'AIRTEL_MONEY'
  ) => {
    const payoutId = `momo-${Date.now()}`;
    const operatorPrefix = operator === 'M_PESA' ? 'MPESA' : operator === 'ORANGE_MONEY' ? 'OM' : 'AIRTEL';
    const txRef = `${operatorPrefix}-TX-2026-${Math.floor(100000 + Math.random() * 900000)}`;

    const newPayout: MobileMoneyDisbursement = {
      id: payoutId,
      agentId: `agt-${agentName.toLowerCase().replace(/\s+/g, '-')}`,
      agentName,
      agentPhone: '+243 82 *** 4912',
      operator,
      amountUsd,
      amountCdf: amountUsd * 2800,
      type: 'MISSION_PER_DIEM',
      status: 'INSTANT_RELEASED',
      transactionRef: txRef,
      executedAt: new Date().toISOString()
    };

    const preAuditState: Proof360State = {
      ...state,
      mobileMoneyPayouts: [newPayout, ...(state.mobileMoneyPayouts || [])]
    };

    const { newState } = await appendAuditLog(preAuditState, {
      action: 'PAYOUT_RELEASED',
      entityType: 'PAYMENT',
      entityId: payoutId,
      actorName: 'Automate Mobile Money PROOF360',
      actorRole: 'CLIENT_ADMIN',
      payload: {
        agentName,
        operator,
        amountUsd,
        transactionRef: txRef
      }
    });

    setState(newState);
  };

  // CLD Weekly Community Audit Submission
  const handleSubmitCldReport = async (reportData: {
    siteId: string;
    cldPresidentName: string;
    cldPresidentPhone: string;
    isOperatingNormally: boolean;
    observations: string;
  }) => {
    const reportId = `cld-${Date.now()}`;
    const site = state.sites.find(s => s.id === reportData.siteId);

    const newCldReport: CldWeeklyAuditReport = {
      id: reportId,
      siteId: reportData.siteId,
      siteName: site?.name || 'Ouvrage Communautaire',
      cldPresidentName: reportData.cldPresidentName,
      cldPresidentPhone: reportData.cldPresidentPhone,
      weekNumber: 45,
      isOperatingNormally: reportData.isOperatingNormally,
      daysOutOfService: reportData.isOperatingNormally ? 0 : 2,
      airtimeRewardPhoneRecharged: true,
      rewardAmountUsd: 5.0,
      submittedAt: new Date().toISOString(),
      observations: reportData.observations
    };

    const preAuditState: Proof360State = {
      ...state,
      cldReports: [newCldReport, ...(state.cldReports || [])]
    };

    const airtimeTxRef = `MOMO-AIRTIME-5USD-${Math.floor(10000 + Math.random() * 90000)}`;

    const { newState } = await appendAuditLog(preAuditState, {
      action: 'COMMUNITY_SIGNAL_RECEIVED',
      entityType: 'FEEDBACK',
      entityId: reportId,
      actorName: `${reportData.cldPresidentName} (Président CLD)`,
      actorRole: 'PROOF_AGENT',
      payload: {
        siteId: reportData.siteId,
        isOperatingNormally: reportData.isOperatingNormally,
        airtimeRewardUsd: 5.0,
        airtimeTxRef
      }
    });

    setState(newState);
  };

  // PVS-HEALTH: Add Medicine Item to Delivery
  const handleAddMedicineItem = async (deliveryIndex: number, item: Omit<MedicineItem, 'id'>) => {
    const newItem: MedicineItem = {
      ...item,
      id: `med-${Date.now()}`
    };

    const currentDeliveries = [...(state.healthDeliveries || [])];
    if (!currentDeliveries[deliveryIndex]) return;

    const targetDelivery = { ...currentDeliveries[deliveryIndex] };
    const updatedInventory = [newItem, ...targetDelivery.inventory];
    
    // Recalculate metrics
    const totalUnits = updatedInventory.reduce((acc, m) => acc + m.quantityDelivered, 0);
    const expiredCount = updatedInventory.filter(m => m.status === 'PERIME_REJETE').length;
    const closeCount = updatedInventory.filter(m => m.status === 'EXPIRATION_PROCHE').length;
    const rating = expiredCount > 0 ? 0 : Math.max(70, 100 - closeCount * 4);

    targetDelivery.inventory = updatedInventory;
    targetDelivery.totalUnitsInspected = totalUnits;
    targetDelivery.expiredUnitsCount = expiredCount;
    targetDelivery.closeToExpiryUnitsCount = closeCount;
    targetDelivery.complianceRatingPercent = rating;
    targetDelivery.disbursementAuthorized = expiredCount === 0 && !targetDelivery.coldChain.isColdChainBreached;

    currentDeliveries[deliveryIndex] = targetDelivery;

    const preAuditState: Proof360State = {
      ...state,
      healthDeliveries: currentDeliveries
    };

    const { newState } = await appendAuditLog(preAuditState, {
      action: 'MEDICINE_BATCH_INSPECTED',
      entityType: 'INSPECTION',
      entityId: newItem.id,
      actorName: 'Dr. Jean-Marc Lubamba (Pharmacien)',
      actorRole: 'PROOF_AGENT',
      payload: {
        commercialName: newItem.commercialName,
        batchNumber: newItem.batchNumber,
        expirationDate: newItem.expirationDate,
        quantity: newItem.quantityDelivered,
        status: newItem.status
      }
    });

    setState(newState);
  };

  // PVS-HEALTH: Update Cold Chain Temperature & Check Breach
  const handleUpdateColdChainTemp = async (deliveryIndex: number, newTempCelsius: number) => {
    const currentDeliveries = [...(state.healthDeliveries || [])];
    if (!currentDeliveries[deliveryIndex]) return;

    const targetDelivery = { ...currentDeliveries[deliveryIndex] };
    const isBreached = newTempCelsius < 2 || newTempCelsius > 8;
    
    targetDelivery.coldChain = {
      ...targetDelivery.coldChain,
      currentTemperatureCelsius: newTempCelsius,
      minTemperatureLast24h: Math.min(targetDelivery.coldChain.minTemperatureLast24h, newTempCelsius),
      maxTemperatureLast24h: Math.max(targetDelivery.coldChain.maxTemperatureLast24h, newTempCelsius),
      isColdChainBreached: isBreached
    };

    targetDelivery.disbursementAuthorized = !isBreached && targetDelivery.expiredUnitsCount === 0;
    targetDelivery.complianceRatingPercent = isBreached ? 35 : (targetDelivery.expiredUnitsCount > 0 ? 0 : 96);

    currentDeliveries[deliveryIndex] = targetDelivery;

    const preAuditState: Proof360State = {
      ...state,
      healthDeliveries: currentDeliveries
    };

    const { newState } = await appendAuditLog(preAuditState, {
      action: isBreached ? 'COLD_CHAIN_EXCURSION_ALERT' : 'COLD_CHAIN_TEMP_VERIFIED',
      entityType: 'INSPECTION',
      entityId: targetDelivery.deliverySlipNumber,
      actorName: 'Datalogger Solaire WHO PQS',
      actorRole: 'PROOF_AGENT',
      payload: {
        tempCelsius: newTempCelsius,
        isBreached,
        sensor: targetDelivery.coldChain.sensorSerialNumber
      }
    });

    setState(newState);
  };

  // PVS-MINE: Add BPU Item
  const handleAddBpuItem = async (auditIndex: number, item: Omit<BpuLineItem, 'id'>) => {
    const newItem: BpuLineItem = { ...item, id: `bpu-${Date.now()}` };
    const currentAudits = [...(state.miningAudits || [])];
    if (!currentAudits[auditIndex]) return;

    const targetAudit = { ...currentAudits[auditIndex] };
    const updatedBpu = [newItem, ...targetAudit.bpuItems];
    const compliantCount = updatedBpu.filter(b => b.isCompliantWithBpu).length;
    targetAudit.bpuItems = updatedBpu;
    targetAudit.bpuComplianceRatePercent = Math.round((compliantCount / updatedBpu.length) * 100);

    currentAudits[auditIndex] = targetAudit;
    const preAuditState: Proof360State = { ...state, miningAudits: currentAudits };

    const { newState } = await appendAuditLog(preAuditState, {
      action: 'BPU_LINE_ITEM_INSPECTED',
      entityType: 'INSPECTION',
      entityId: newItem.id,
      actorName: 'Ing. Serge Kabasele (Auditeur RSE)',
      actorRole: 'PROOF_AGENT',
      payload: {
        code: newItem.itemCode,
        isCompliant: newItem.isCompliantWithBpu,
        qty: newItem.inspectedQuantity
      }
    });
    setState(newState);
  };

  // PVS-MINE: Add Local Worker
  const handleAddWorker = async (auditIndex: number, worker: Omit<LocalWorkerAttendance, 'workerId'>) => {
    const newWorker: LocalWorkerAttendance = { ...worker, workerId: `w-${Date.now()}` };
    const currentAudits = [...(state.miningAudits || [])];
    if (!currentAudits[auditIndex]) return;

    const targetAudit = { ...currentAudits[auditIndex] };
    const updatedWorkers = [newWorker, ...targetAudit.workers];
    const localCount = updatedWorkers.filter(w => w.isLocalResident).length;
    targetAudit.workers = updatedWorkers;
    targetAudit.localWorkforcePercent = Math.round((localCount / updatedWorkers.length) * 1000) / 10;

    currentAudits[auditIndex] = targetAudit;
    const preAuditState: Proof360State = { ...state, miningAudits: currentAudits };

    const { newState } = await appendAuditLog(preAuditState, {
      action: 'LOCAL_WORKER_REGISTERED',
      entityType: 'INSPECTION',
      entityId: newWorker.workerId,
      actorName: 'Ing. Serge Kabasele (Auditeur RSE)',
      actorRole: 'PROOF_AGENT',
      payload: {
        name: newWorker.fullName,
        isLocal: newWorker.isLocalResident,
        village: newWorker.communityVillage
      }
    });
    setState(newState);
  };

  // PVS-MINE: Toggle CLD Validation Status
  const handleToggleCldStatus = async (auditIndex: number, status: MiningRseAudit['cldValidationStatus']) => {
    const currentAudits = [...(state.miningAudits || [])];
    if (!currentAudits[auditIndex]) return;

    const targetAudit = { ...currentAudits[auditIndex], cldValidationStatus: status };
    currentAudits[auditIndex] = targetAudit;
    const preAuditState: Proof360State = { ...state, miningAudits: currentAudits };

    const { newState } = await appendAuditLog(preAuditState, {
      action: 'CLD_SIGNOFF_UPDATED',
      entityType: 'FEEDBACK',
      entityId: targetAudit.id,
      actorName: targetAudit.cldPresidentName,
      actorRole: 'PROOF_AGENT',
      payload: { status }
    });
    setState(newState);
  };

  // PVS-AGRI: Add Silo Reading
  const handleAddSiloReading = async (auditIndex: number, silo: SiloStorageReading) => {
    const currentAudits = [...(state.agriAudits || [])];
    if (!currentAudits[auditIndex]) return;

    const targetAudit = { ...currentAudits[auditIndex] };
    const updatedSilos = [silo, ...targetAudit.silos];
    targetAudit.silos = updatedSilos;
    targetAudit.averageMoisturePercent = Math.round((updatedSilos.reduce((acc, s) => acc + s.moisturePercent, 0) / updatedSilos.length) * 10) / 10;

    currentAudits[auditIndex] = targetAudit;
    const preAuditState: Proof360State = { ...state, agriAudits: currentAudits };

    const { newState } = await appendAuditLog(preAuditState, {
      action: 'SILO_READING_RECORDED',
      entityType: 'INSPECTION',
      entityId: silo.siloId,
      actorName: 'Ing. Patient Mukendi (Auditeur Agro)',
      actorRole: 'PROOF_AGENT',
      payload: {
        siloName: silo.siloName,
        moisturePercent: silo.moisturePercent,
        isSafe: silo.isMoistureSafe
      }
    });
    setState(newState);
  };

  // PVS-AGRI: Toggle Milling Machine Status
  const handleToggleMachineStatus = async (auditIndex: number, machineId: string, isOperational: boolean) => {
    const currentAudits = [...(state.agriAudits || [])];
    if (!currentAudits[auditIndex]) return;

    const targetAudit = { ...currentAudits[auditIndex] };
    targetAudit.millingMachines = targetAudit.millingMachines.map(m => 
      m.id === machineId ? { ...m, isOperational } : m
    );

    currentAudits[auditIndex] = targetAudit;
    const preAuditState: Proof360State = { ...state, agriAudits: currentAudits };

    const { newState } = await appendAuditLog(preAuditState, {
      action: 'MILLING_MACHINE_STATUS_UPDATED',
      entityType: 'INSPECTION',
      entityId: machineId,
      actorName: 'Ing. Patient Mukendi (Auditeur Agro)',
      actorRole: 'PROOF_AGENT',
      payload: { isOperational }
    });
    setState(newState);
  };

  // PVS-AGRI: Update Silo Moisture
  const handleUpdateSiloMoisture = async (auditIndex: number, siloId: string, newMoisture: number) => {
    const currentAudits = [...(state.agriAudits || [])];
    if (!currentAudits[auditIndex]) return;

    const targetAudit = { ...currentAudits[auditIndex] };
    targetAudit.silos = targetAudit.silos.map(s => {
      if (s.siloId === siloId) {
        return {
          ...s,
          moisturePercent: newMoisture,
          isMoistureSafe: newMoisture <= 13.5
        };
      }
      return s;
    });

    targetAudit.averageMoisturePercent = Math.round((targetAudit.silos.reduce((acc, s) => acc + s.moisturePercent, 0) / targetAudit.silos.length) * 10) / 10;
    currentAudits[auditIndex] = targetAudit;
    const preAuditState: Proof360State = { ...state, agriAudits: currentAudits };

    const { newState } = await appendAuditLog(preAuditState, {
      action: 'SILO_MOISTURE_TELEMETRY_UPDATED',
      entityType: 'INSPECTION',
      entityId: siloId,
      actorName: 'Sonde Capacitive In-Situ',
      actorRole: 'PROOF_AGENT',
      payload: { moisturePercent: newMoisture, isSafe: newMoisture <= 13.5 }
    });
    setState(newState);
  };

  // PVS-HYDRO-001 Handlers
  const handleToggleTurbineStatus = async (auditIndex: number, turbineId: string, status: HydroTurbineUnit['status']) => {
    const currentAudits = [...(state.hydroAudits || [])];
    const targetAudit = { ...currentAudits[auditIndex] };
    if (!targetAudit || !targetAudit.turbines) return;

    targetAudit.turbines = targetAudit.turbines.map(t => {
      if (t.id === turbineId) {
        return { 
          ...t, 
          status,
          currentOutputKw: status === 'ONLINE_NOMINAL' ? Math.round(t.ratedCapacityKw * 0.85) : 0
        };
      }
      return t;
    });

    targetAudit.currentGenerationKwTotal = targetAudit.turbines.reduce((acc, t) => acc + t.currentOutputKw, 0);
    currentAudits[auditIndex] = targetAudit;
    const preAuditState: Proof360State = { ...state, hydroAudits: currentAudits };

    const { newState } = await appendAuditLog(preAuditState, {
      action: 'TURBINE_STATUS_CHANGED',
      entityType: 'INSPECTION',
      entityId: turbineId,
      actorName: 'Ingénieur Exploitation Hydro',
      actorRole: 'PROOF_AGENT',
      payload: { turbineId, newStatus: status, currentGenKw: targetAudit.currentGenerationKwTotal }
    });
    setState(newState);
  };

  const handleUpdateFlowRate = async (auditIndex: number, newFlowRateLitersSec: number) => {
    const currentAudits = [...(state.hydroAudits || [])];
    const targetAudit = { ...currentAudits[auditIndex] };
    if (!targetAudit) return;

    targetAudit.flowRateLitersSec = newFlowRateLitersSec;
    targetAudit.complianceScorePercent = newFlowRateLitersSec >= targetAudit.minEnvironmentalFlowLitersSec ? 96 : 65;
    currentAudits[auditIndex] = targetAudit;
    const preAuditState: Proof360State = { ...state, hydroAudits: currentAudits };

    const { newState } = await appendAuditLog(preAuditState, {
      action: 'WATER_FLOW_RATE_UPDATED',
      entityType: 'INSPECTION',
      entityId: targetAudit.id,
      actorName: 'Capteur Débitmètre Ultrason',
      actorRole: 'PROOF_AGENT',
      payload: { flowRateLitersSec: newFlowRateLitersSec, isEcoRespected: newFlowRateLitersSec >= targetAudit.minEnvironmentalFlowLitersSec }
    });
    setState(newState);
  };

  // PVS-ENV-001 Handlers
  const handleUpdatePlotSurvival = async (auditIndex: number, plotId: string, countedLiving: number) => {
    const currentAudits = [...(state.envAudits || [])];
    const targetAudit = { ...currentAudits[auditIndex] };
    if (!targetAudit || !targetAudit.plots) return;

    targetAudit.plots = targetAudit.plots.map(p => {
      if (p.plotId === plotId) {
        const dead = Math.max(0, p.treesPlantedTarget - countedLiving);
        const survRate = Math.round((countedLiving / p.treesPlantedTarget) * 100);
        return {
          ...p,
          healthyTreesCount: countedLiving,
          treesCountedAiDrone: countedLiving,
          deadOrStumpCount: dead,
          survivalRatePercent: survRate,
          carbonBiomassCo2ePerYearTons: Math.round(countedLiving * 0.13)
        };
      }
      return p;
    });

    const totalLiving = targetAudit.plots.reduce((acc, p) => acc + p.healthyTreesCount, 0);
    const totalTarget = targetAudit.plots.reduce((acc, p) => acc + p.treesPlantedTarget, 0);
    targetAudit.totalTreesVerifiedLiving = totalLiving;
    targetAudit.globalSurvivalRatePercent = totalTarget > 0 ? Math.round((totalLiving / totalTarget) * 100) : 0;
    targetAudit.accumulatedCo2SequestrationTons = Math.round(totalLiving * 0.82);
    targetAudit.carbonCreditsEstimatedUsd = targetAudit.accumulatedCo2SequestrationTons * 12;

    currentAudits[auditIndex] = targetAudit;
    const preAuditState: Proof360State = { ...state, envAudits: currentAudits };

    const { newState } = await appendAuditLog(preAuditState, {
      action: 'REFORESTATION_SURVIVAL_VERIFIED',
      entityType: 'INSPECTION',
      entityId: plotId,
      actorName: 'Audit Photogrammétrie Drone & IA',
      actorRole: 'PROOF_AGENT',
      payload: { plotId, livingTrees: countedLiving, globalSurvivalPercent: targetAudit.globalSurvivalRatePercent }
    });
    setState(newState);
  };

  const handleAddPlot = async (auditIndex: number, newPlot: TreeSpeciesPlot) => {
    const currentAudits = [...(state.envAudits || [])];
    const targetAudit = { ...currentAudits[auditIndex] };
    if (!targetAudit) return;

    targetAudit.plots = [...targetAudit.plots, newPlot];
    targetAudit.totalTreesPlantedTarget += newPlot.treesPlantedTarget;
    targetAudit.totalTreesVerifiedLiving += newPlot.healthyTreesCount;
    targetAudit.globalSurvivalRatePercent = Math.round((targetAudit.totalTreesVerifiedLiving / targetAudit.totalTreesPlantedTarget) * 100);
    targetAudit.accumulatedCo2SequestrationTons += newPlot.carbonBiomassCo2ePerYearTons;
    targetAudit.carbonCreditsEstimatedUsd = targetAudit.accumulatedCo2SequestrationTons * 12;

    currentAudits[auditIndex] = targetAudit;
    const preAuditState: Proof360State = { ...state, envAudits: currentAudits };

    const { newState } = await appendAuditLog(preAuditState, {
      action: 'REFORESTATION_PLOT_REGISTERED',
      entityType: 'INSPECTION',
      entityId: newPlot.plotId,
      actorName: 'Superviseur PVS-ENV',
      actorRole: 'PROOF_AGENT',
      payload: { plotName: newPlot.plotName, species: newPlot.speciesName, planted: newPlot.treesPlantedTarget }
    });
    setState(newState);
  };

  const handleCertifyVerra = async (auditIndex: number) => {
    const currentAudits = [...(state.envAudits || [])];
    const targetAudit = { ...currentAudits[auditIndex] };
    if (!targetAudit) return;

    targetAudit.carbonCertificationStatus = 'CERTIFIED_VERRA_ISSUED';
    currentAudits[auditIndex] = targetAudit;
    const preAuditState: Proof360State = { ...state, envAudits: currentAudits };

    const { newState } = await appendAuditLog(preAuditState, {
      action: 'VERRA_VCS_CERTIFICATE_ISSUED',
      entityType: 'INSPECTION',
      entityId: targetAudit.id,
      actorName: 'Comité de Certification Carbone',
      actorRole: 'QA_REVIEWER',
      payload: { 
        standard: 'VERRA_VCS_VM0007', 
        co2Tons: targetAudit.accumulatedCo2SequestrationTons, 
        creditsUsd: targetAudit.carbonCreditsEstimatedUsd 
      }
    });
    setState(newState);
  };

  const handleManualSync = async () => {
    if (outboxQueue.length === 0) return;
    const itemsCount = outboxQueue.length;
    setOutboxQueue([]);
    
    const { newState } = await appendAuditLog(state, {
      action: 'OFFLINE_BATCH_SYNCED_TUS',
      entityType: 'INSPECTION',
      entityId: `sync-${Date.now()}`,
      actorName: 'Synchronisation Automatique TUS',
      actorRole: 'PROOF_AGENT',
      payload: { batchesUploaded: itemsCount, protocol: 'TUS_RESUMABLE_512KB' }
    });
    setState(newState);
  };

  const handleResetData = () => {
    if (confirm('Voulez-vous réinitialiser toutes les données de simulation aux valeurs d’origine ?')) {
      const reset = resetStateToDefault();
      setState(reset);
      setSelectedMissionId(reset.missions[0]?.id || '');
    }
  };

  const activeInspectionForReport = state.inspections.find(i => i.id === activeReportInspectionId);
  const activeMissionForReport = state.missions.find(m => m.id === activeInspectionForReport?.missionId);
  const blockedPayoutsCount = state.payouts.filter(p => p.status === 'BLOCKED_BY_ANOMALY').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewMission={() => setIsNewMissionOpen(true)}
        pendingQACount={pendingQACount}
        outboxCount={outboxQueue.length}
        blockedPayoutsCount={blockedPayoutsCount}
        onManualSync={handleManualSync}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Sub-bar for Missions vs SIG Map */}
        {(activeTab === 'missions' || activeTab === 'map') && (
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setActiveTab('missions')}
                className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'missions'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-emerald-700" />
                <span>Liste des Missions ({state.missions.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('map')}
                className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'map'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                <span>Cartographie SIG, Polygones Cadastraux & Satellites</span>
              </button>
            </div>
          </div>
        )}

        {/* Sub-bar for Décaissements BTP vs PVS-HYDRO vs PVS-ENV vs PVS-AGRI vs PVS-MINE vs PVS-HEALTH */}
        {(activeTab === 'finance' || activeTab === 'hydro' || activeTab === 'env' || activeTab === 'agri' || activeTab === 'mining' || activeTab === 'health') && (
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold overflow-x-auto">
              <button
                onClick={() => setActiveTab('finance')}
                className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'finance'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5 text-emerald-700" />
                <span>Décaissements & BTP ({state.payouts.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('hydro')}
                className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'hydro'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-blue-600" />
                <span>PVS-HYDRO-001 : Micro-Barrages & Turbines</span>
              </button>
              <button
                onClick={() => setActiveTab('env')}
                className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'env'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Trees className="w-3.5 h-3.5 text-emerald-700" />
                <span>PVS-ENV : Reforestation & Crédits Carbone</span>
              </button>
              <button
                onClick={() => setActiveTab('agri')}
                className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'agri'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Wheat className="w-3.5 h-3.5 text-emerald-700" />
                <span>PVS-AGRI-001 : Silos, Moulins & Hectares</span>
              </button>
              <button
                onClick={() => setActiveTab('mining')}
                className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'mining'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Pickaxe className="w-3.5 h-3.5 text-amber-600" />
                <span>PVS-MINE-001 : RSE Dotation 0.3%</span>
              </button>
              <button
                onClick={() => setActiveTab('health')}
                className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'health'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <HeartPulse className="w-3.5 h-3.5 text-rose-600" />
                <span>PVS-HEALTH-001 : Santé & Vaccins</span>
              </button>
            </div>
          </div>
        )}

        {/* Sub-bar for Community Feedback vs Citizen Open Data vs Fleet & Drones */}
        {(activeTab === 'community' || activeTab === 'citizen_portal' || activeTab === 'fleet') && (
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold overflow-x-auto">
              <button
                onClick={() => setActiveTab('community')}
                className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'community'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Radio className="w-3.5 h-3.5 text-emerald-700" />
                <span>Retours Citoyens (USSD *404#) & IoT</span>
              </button>
              <button
                onClick={() => setActiveTab('citizen_portal')}
                className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'citizen_portal'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-emerald-700" />
                <span>Portail Open Data Citoyen & Audit CLD ($5 Airtime)</span>
              </button>
              <button
                onClick={() => setActiveTab('fleet')}
                className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'fleet'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Truck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Logistique Saison des Pluies & Drones</span>
              </button>
            </div>
          </div>
        )}

        {/* Sub-bar for Executive Dashboard vs Audit Ledger */}
        {(activeTab === 'executive' || activeTab === 'audit') && (
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setActiveTab('executive')}
                className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'executive'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileBarChart className="w-3.5 h-3.5 text-emerald-700" />
                <span>Tableau de Bord Ministériel & Export Standard IATI v2.03</span>
              </button>
              <button
                onClick={() => setActiveTab('audit')}
                className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'audit'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <History className="w-3.5 h-3.5 text-emerald-700" />
                <span>Registre d'Audit Cryptographique (SHA-256 Ledger)</span>
              </button>
            </div>
          </div>
        )}

        {/* Primary Views */}
        {activeTab === 'missions' && (
          <MissionList
            missions={state.missions}
            sites={state.sites}
            inspections={state.inspections}
            onSelectMission={handleSelectMissionForQA}
            onOpenMobile={handleOpenMobileForMission}
            onOpenReport={handleOpenReportModal}
          />
        )}

        {activeTab === 'map' && (
          <MapOverview
            sites={state.sites}
            missions={state.missions}
            onSelectMission={handleSelectMissionForQA}
            onOpenMobileWithSite={(siteId) => {
              const mission = state.missions.find(m => m.siteId === siteId);
              if (mission) {
                handleOpenMobileForMission(mission.id);
              }
            }}
          />
        )}

        {activeTab === 'qa' && (
          <QAReviewWorkbench
            mission={currentMission}
            inspection={currentInspection}
            onBack={() => setActiveTab('missions')}
            onApprove={handleQAApprove}
            onReject={handleQAReject}
            onDeclareAnomaly={handleDeclareAnomaly}
            onOpenReport={handleOpenReportModal}
          />
        )}

        {activeTab === 'finance' && (
          <FinanceRemediationPortal
            payouts={state.payouts}
            remediations={state.remediations}
            anomalies={state.anomalies}
            sites={state.sites}
            mobileMoneyPayouts={state.mobileMoneyPayouts || []}
            openBankingOrders={state.openBankingOrders || []}
            onReleasePayout={handleReleasePayout}
            onSubmitRemediation={handleSubmitRemediation}
            onTriggerMobileMoneyPayout={handleTriggerMobileMoneyPayout}
          />
        )}

        {activeTab === 'health' && (
          <HealthColdChainView
            deliveries={state.healthDeliveries || []}
            sites={state.sites}
            onAddMedicineItem={handleAddMedicineItem}
            onUpdateTemperature={handleUpdateColdChainTemp}
          />
        )}

        {activeTab === 'mining' && (
          <MiningRseView
            audits={state.miningAudits || []}
            sites={state.sites}
            onAddBpuItem={handleAddBpuItem}
            onAddWorker={handleAddWorker}
            onToggleCldStatus={handleToggleCldStatus}
          />
        )}

        {activeTab === 'agri' && (
          <AgriProjectView
            audits={state.agriAudits || []}
            sites={state.sites}
            onAddSiloReading={handleAddSiloReading}
            onToggleMachineStatus={handleToggleMachineStatus}
            onUpdateSiloMoisture={handleUpdateSiloMoisture}
          />
        )}

        {activeTab === 'hydro' && (
          <HydroDamView
            audits={state.hydroAudits || []}
            sites={state.sites}
            onToggleTurbineStatus={handleToggleTurbineStatus}
            onUpdateFlowRate={handleUpdateFlowRate}
          />
        )}

        {activeTab === 'env' && (
          <EnvReforestationView
            audits={state.envAudits || []}
            sites={state.sites}
            onUpdatePlotSurvival={handleUpdatePlotSurvival}
            onAddPlot={handleAddPlot}
            onCertifyVerra={handleCertifyVerra}
          />
        )}

        {activeTab === 'community' && (
          <CommunityIotView
            signals={state.communitySignals}
            iotReadings={state.iotReadings}
            sites={state.sites}
            onDispatchAgentForSignal={handleDispatchAgentForSignal}
            onSimulateUssdSignal={handleSimulateUssdSignal}
          />
        )}

        {activeTab === 'citizen_portal' && (
          <CitizenTransparencyPortal
            sites={state.sites}
            missions={state.missions}
            inspections={state.inspections}
            cldReports={state.cldReports || []}
            onSubmitCldReport={handleSubmitCldReport}
            onOpenReportModal={handleOpenReportModal}
          />
        )}

        {activeTab === 'fleet' && (
          <FleetDroneOperationsView
            fleetRoutes={state.fleetRoutes}
            droneMissions={state.droneMissions}
            sites={state.sites}
          />
        )}

        {activeTab === 'executive' && (
          <ExecutiveInstitutionalDashboard
            sites={state.sites}
            missions={state.missions}
            inspections={state.inspections}
            anomalies={state.anomalies}
            payouts={state.payouts}
            envAudits={state.envAudits || []}
            auditLog={state.auditLog}
          />
        )}

        {activeTab === 'audit' && (
          <AuditLedgerView auditLog={state.auditLog} />
        )}

        {activeTab === 'mobile' && (
          <MobileAgentSimulator
            missions={state.missions}
            sites={state.sites}
            preselectedMissionId={selectedMissionId}
            onSyncBatch={handleSyncInspectionBatch}
            onInspectSubmitted={(missionId) => {
              setSelectedMissionId(missionId);
              setActiveTab('qa');
            }}
          />
        )}
      </main>

      {/* Bottom Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">PROOF360 RDC</span>
            <span>—</span>
            <span>Infrastructure Numérique de Preuve d’Exécution Physique</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleResetData}
              className="text-slate-500 hover:text-slate-900 transition-colors cursor-pointer flex items-center gap-1"
              title="Réinitialiser les données de démo"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Réinitialiser Démo</span>
            </button>
            <span>·</span>
            <span>WGS84 & PostGIS · SHA-256 Ledger · Conforme PDL-145T</span>
          </div>
        </div>
      </footer>

      {/* Certified Report Modal */}
      {activeReportInspectionId && activeInspectionForReport && activeMissionForReport && (
        <CertifiedReportModal
          inspection={activeInspectionForReport}
          mission={activeMissionForReport}
          onClose={() => setActiveReportInspectionId(null)}
          onOpenPublicVerification={(repNum) => {
            setActivePublicVerifyReportNumber(repNum);
          }}
        />
      )}

      {/* Public QR Code Verification Portal Modal */}
      {activePublicVerifyReportNumber && (
        <PublicVerifyModal
          reportNumber={activePublicVerifyReportNumber}
          inspection={state.inspections.find(i => i.reportNumber === activePublicVerifyReportNumber || i.id === activePublicVerifyReportNumber)}
          mission={state.missions.find(m => m.latestInspectionId === activePublicVerifyReportNumber || m.code.includes(activePublicVerifyReportNumber))}
          onClose={() => setActivePublicVerifyReportNumber(null)}
        />
      )}

      {/* New Mission Creation Modal */}
      {isNewMissionOpen && (
        <NewMissionModal
          sites={state.sites}
          onClose={() => setIsNewMissionOpen(false)}
          onCreateMission={handleCreateMission}
        />
      )}
    </div>
  );
}
