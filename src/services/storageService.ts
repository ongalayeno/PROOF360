import { 
  Site, 
  Mission, 
  Inspection, 
  Anomaly, 
  AuditLedgerEntry, 
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
  MiningRseAudit,
  AgriProjectAudit,
  HydroAudit,
  EnvReforestationAudit
} from '../types/proof360';
import { INITIAL_SITES, INITIAL_MISSIONS, INITIAL_INSPECTIONS, INITIAL_ANOMALIES, INITIAL_AUDIT_LOG } from '../data/initialData';
import { 
  INITIAL_PAYOUTS, 
  INITIAL_REMEDIATIONS, 
  INITIAL_COMMUNITY_SIGNALS, 
  INITIAL_IOT_READINGS, 
  INITIAL_FLEET_ROUTES, 
  INITIAL_DRONE_MISSIONS,
  INITIAL_MOBILE_MONEY_PAYOUTS,
  INITIAL_OPEN_BANKING_ORDERS,
  INITIAL_CLD_REPORTS,
  INITIAL_HEALTH_DELIVERIES,
  INITIAL_MINING_AUDITS,
  INITIAL_AGRI_AUDITS,
  INITIAL_HYDRO_AUDITS,
  INITIAL_ENV_AUDITS
} from '../data/enterpriseData';
import { computeAuditEntryHash, sha256 } from './integrityEngine';
import { enrichCommunitySignals } from './sentimentService';

const STORAGE_KEY = 'proof360_rdc_state_v2';

export interface Proof360State {
  sites: Site[];
  missions: Mission[];
  inspections: Inspection[];
  anomalies: Anomaly[];
  auditLog: AuditLedgerEntry[];
  payouts: MilestonePayout[];
  remediations: ContractorRemediation[];
  communitySignals: CommunitySignal[];
  iotReadings: IotTelemetryReading[];
  fleetRoutes: FleetRoutePlan[];
  droneMissions: DroneWaypointPlan[];
  mobileMoneyPayouts: MobileMoneyDisbursement[];
  openBankingOrders: BankOpenBankingOrder[];
  cldReports: CldWeeklyAuditReport[];
  healthDeliveries: HealthDeliveryVerification[];
  miningAudits: MiningRseAudit[];
  agriAudits: AgriProjectAudit[];
  hydroAudits: HydroAudit[];
  envAudits: EnvReforestationAudit[];
}

export function loadState(): Proof360State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        sites: INITIAL_SITES,
        missions: INITIAL_MISSIONS,
        inspections: INITIAL_INSPECTIONS,
        anomalies: INITIAL_ANOMALIES,
        auditLog: INITIAL_AUDIT_LOG,
        payouts: INITIAL_PAYOUTS,
        remediations: INITIAL_REMEDIATIONS,
        communitySignals: enrichCommunitySignals(INITIAL_COMMUNITY_SIGNALS),
        iotReadings: INITIAL_IOT_READINGS,
        fleetRoutes: INITIAL_FLEET_ROUTES,
        droneMissions: INITIAL_DRONE_MISSIONS,
        mobileMoneyPayouts: INITIAL_MOBILE_MONEY_PAYOUTS,
        openBankingOrders: INITIAL_OPEN_BANKING_ORDERS,
        cldReports: INITIAL_CLD_REPORTS,
        healthDeliveries: INITIAL_HEALTH_DELIVERIES,
        miningAudits: INITIAL_MINING_AUDITS,
        agriAudits: INITIAL_AGRI_AUDITS,
        hydroAudits: INITIAL_HYDRO_AUDITS,
        envAudits: INITIAL_ENV_AUDITS
      };
    }
    const parsed = JSON.parse(raw);
    return {
      sites: parsed.sites || INITIAL_SITES,
      missions: parsed.missions || INITIAL_MISSIONS,
      inspections: parsed.inspections || INITIAL_INSPECTIONS,
      anomalies: parsed.anomalies || INITIAL_ANOMALIES,
      auditLog: parsed.auditLog || INITIAL_AUDIT_LOG,
      payouts: parsed.payouts || INITIAL_PAYOUTS,
      remediations: parsed.remediations || INITIAL_REMEDIATIONS,
      communitySignals: enrichCommunitySignals(parsed.communitySignals || INITIAL_COMMUNITY_SIGNALS),
      iotReadings: parsed.iotReadings || INITIAL_IOT_READINGS,
      fleetRoutes: parsed.fleetRoutes || INITIAL_FLEET_ROUTES,
      droneMissions: parsed.droneMissions || INITIAL_DRONE_MISSIONS,
      mobileMoneyPayouts: parsed.mobileMoneyPayouts || INITIAL_MOBILE_MONEY_PAYOUTS,
      openBankingOrders: parsed.openBankingOrders || INITIAL_OPEN_BANKING_ORDERS,
      cldReports: parsed.cldReports || INITIAL_CLD_REPORTS,
      healthDeliveries: parsed.healthDeliveries || INITIAL_HEALTH_DELIVERIES,
      miningAudits: parsed.miningAudits || INITIAL_MINING_AUDITS,
      agriAudits: parsed.agriAudits || INITIAL_AGRI_AUDITS,
      hydroAudits: parsed.hydroAudits || INITIAL_HYDRO_AUDITS,
      envAudits: parsed.envAudits || INITIAL_ENV_AUDITS
    };
  } catch (err) {
    console.error('Failed to parse stored state, falling back to seed:', err);
    return {
      sites: INITIAL_SITES,
      missions: INITIAL_MISSIONS,
      inspections: INITIAL_INSPECTIONS,
      anomalies: INITIAL_ANOMALIES,
      auditLog: INITIAL_AUDIT_LOG,
      payouts: INITIAL_PAYOUTS,
      remediations: INITIAL_REMEDIATIONS,
      communitySignals: INITIAL_COMMUNITY_SIGNALS,
      iotReadings: INITIAL_IOT_READINGS,
      fleetRoutes: INITIAL_FLEET_ROUTES,
      droneMissions: INITIAL_DRONE_MISSIONS,
      mobileMoneyPayouts: INITIAL_MOBILE_MONEY_PAYOUTS,
      openBankingOrders: INITIAL_OPEN_BANKING_ORDERS,
      cldReports: INITIAL_CLD_REPORTS,
      healthDeliveries: INITIAL_HEALTH_DELIVERIES,
      miningAudits: INITIAL_MINING_AUDITS,
      agriAudits: INITIAL_AGRI_AUDITS,
      hydroAudits: INITIAL_HYDRO_AUDITS,
      envAudits: INITIAL_ENV_AUDITS
    };
  }
}

export function saveState(state: Proof360State): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save state to localStorage:', err);
  }
}

export function resetStateToDefault(): Proof360State {
  const initial: Proof360State = {
    sites: INITIAL_SITES,
    missions: INITIAL_MISSIONS,
    inspections: INITIAL_INSPECTIONS,
    anomalies: INITIAL_ANOMALIES,
    auditLog: INITIAL_AUDIT_LOG,
    payouts: INITIAL_PAYOUTS,
    remediations: INITIAL_REMEDIATIONS,
    communitySignals: enrichCommunitySignals(INITIAL_COMMUNITY_SIGNALS),
    iotReadings: INITIAL_IOT_READINGS,
    fleetRoutes: INITIAL_FLEET_ROUTES,
    droneMissions: INITIAL_DRONE_MISSIONS,
    mobileMoneyPayouts: INITIAL_MOBILE_MONEY_PAYOUTS,
    openBankingOrders: INITIAL_OPEN_BANKING_ORDERS,
    cldReports: INITIAL_CLD_REPORTS,
    healthDeliveries: INITIAL_HEALTH_DELIVERIES,
    miningAudits: INITIAL_MINING_AUDITS,
    agriAudits: INITIAL_AGRI_AUDITS,
    hydroAudits: INITIAL_HYDRO_AUDITS,
    envAudits: INITIAL_ENV_AUDITS
  };
  saveState(initial);
  return initial;
}

/**
 * Appends an entry to the append-only cryptographic audit chain
 */
export async function appendAuditLog(
  currentState: Proof360State,
  entry: {
    action: string;
    entityType: 'MISSION' | 'INSPECTION' | 'EVIDENCE' | 'ANOMALY' | 'REPORT' | 'PAYMENT' | 'FEEDBACK';
    entityId: string;
    actorName: string;
    actorRole: any;
    payload: Record<string, any>;
  }
): Promise<{ newState: Proof360State; newEntry: AuditLedgerEntry }> {
  const previousHash = currentState.auditLog.length > 0 
    ? currentState.auditLog[currentState.auditLog.length - 1].entryHash
    : '0000000000000000000000000000000000000000000000000000000000000000';

  const timestamp = new Date().toISOString();
  const entryHash = await computeAuditEntryHash(previousHash, {
    action: entry.action,
    entityType: entry.entityType,
    entityId: entry.entityId,
    actorName: entry.actorName,
    timestamp,
    payload: entry.payload
  });

  const newLogEntry: AuditLedgerEntry = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp,
    action: entry.action,
    entityType: entry.entityType,
    entityId: entry.entityId,
    actorName: entry.actorName,
    actorRole: entry.actorRole,
    previousHash,
    entryHash,
    payload: entry.payload
  };

  const newState = {
    ...currentState,
    auditLog: [...currentState.auditLog, newLogEntry]
  };

  saveState(newState);
  return { newState, newEntry: newLogEntry };
}
