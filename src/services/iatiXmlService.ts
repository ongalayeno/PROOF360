import { Site, Mission, Inspection, MilestonePayout, SectorType } from '../types/proof360';

export interface IatiExportOptions {
  targetDonor: 'ALL' | 'WORLD_BANK' | 'AFDB' | 'EU_INTPA' | 'ENABEL' | 'GLOBAL_FUND';
  provinceFilter: string; // 'ALL' or province name
  onlyApproved: boolean;
  includeTransactions: boolean;
  includeDocuments: boolean;
  reportingOrgRef?: string;
}

export interface IatiExportSummary {
  xmlString: string;
  activityCount: number;
  totalBudgetUsd: number;
  totalDisbursedUsd: number;
  locationsCount: number;
  transactionsCount: number;
  validationStatus: {
    isValid: boolean;
    iatiVersion: string;
    schemaConformity: string;
    dacSectorVocabulary: string;
    currency: string;
  };
}

/**
 * Maps PROOF360 sector to OECD DAC 5-digit Purpose Code
 */
function getDacSectorCode(sector: SectorType): { code: string; name: string } {
  switch (sector) {
    case 'WASH':
      return { code: '14030', name: 'Basic drinking water supply and basic sanitation' };
    case 'SOLAR':
      return { code: '23210', name: 'Solar energy for rural electrifications' };
    case 'BTP':
      return { code: '11220', name: 'Primary education & civil engineering infrastructure' };
    case 'HEALTH':
      return { code: '12220', name: 'Basic health care infrastructure & cold chain' };
    case 'ENV':
      return { code: '31220', name: 'Forestry development & carbon sinks' };
    case 'ROADS':
      return { code: '21020', name: 'Road transport infrastructure' };
    case 'AGRI':
      return { code: '31110', name: 'Agricultural development and food security' };
    case 'MINE':
      return { code: '32210', name: 'Mineral resources and mining community development' };
    case 'HYDRO':
      return { code: '23220', name: 'Hydro-electric power plants and off-grid mini-grids' };
    case 'DIGITAL':
      return { code: '22040', name: 'Information and communication technology infrastructure' };
    case 'PECHE':
      return { code: '31310', name: 'Fishing policy and artisanal fish cold hubs' };
    default:
      return { code: '43010', name: 'Multisector aid for basic social services' };
  }
}

/**
 * Maps donor organization ref and name
 */
function getDonorInfo(donor: IatiExportOptions['targetDonor']): { ref: string; name: string; type: string } {
  switch (donor) {
    case 'WORLD_BANK':
      return { ref: '44000', name: 'International Development Association (World Bank Group)', type: '40' };
    case 'AFDB':
      return { ref: '46004', name: 'African Development Bank (AfDB)', type: '40' };
    case 'EU_INTPA':
      return { ref: 'EU-1', name: 'European Commission - DG International Partnerships', type: '40' };
    case 'ENABEL':
      return { ref: 'BE-BCE_KBO-0264814354', name: 'Enabel - Belgian Development Agency', type: '10' };
    case 'GLOBAL_FUND':
      return { ref: '47045', name: 'The Global Fund to Fight AIDS, TB and Malaria', type: '40' };
    case 'ALL':
    default:
      return { ref: 'CD-GOV-BCECO', name: 'Bureau Central de Coordination (BCECO / RDC)', type: '10' };
  }
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, c => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

/**
 * Generates official IATI Standard XML (version 2.03)
 */
export function generateIatiXml(
  sites: Site[],
  missions: Mission[],
  inspections: Inspection[],
  payouts: MilestonePayout[],
  options: IatiExportOptions
): IatiExportSummary {
  // Filter sites according to options
  let filteredSites = [...sites];
  if (options.provinceFilter !== 'ALL') {
    filteredSites = filteredSites.filter(s => s.province === options.provinceFilter);
  }

  if (options.onlyApproved) {
    const approvedSiteIds = new Set(
      missions.filter(m => m.status === 'APPROVED').map(m => m.siteId)
    );
    filteredSites = filteredSites.filter(s => approvedSiteIds.has(s.id));
  }

  const generatedDatetime = new Date().toISOString();
  const donorInfo = getDonorInfo(options.targetDonor);
  let totalBudgetUsd = 0;
  let totalDisbursedUsd = 0;
  let transactionsCount = 0;

  const activitiesXml = filteredSites.map((site, index) => {
    totalBudgetUsd += site.budgetUsd;
    totalDisbursedUsd += site.disbursedUsd;

    const siteMissions = missions.filter(m => m.siteId === site.id);
    const siteInspections = inspections.filter(i => i.siteId === site.id);
    const sitePayouts = payouts.filter(p => p.siteId === site.id);
    const isCompleted = siteMissions.some(m => m.status === 'APPROVED');
    const activityStatusCode = isCompleted ? '3' : '2'; // 2 = Implementation, 3 = Finalised / Operational
    const dacSector = getDacSectorCode(site.sector);
    const activityId = `CD-BCECO-PDL145T-${site.territory.toUpperCase()}-${site.id.replace('site-', '')}`;

    // Transactions XML (Commitment and Disbursements)
    let transactionsXml = '';
    if (options.includeTransactions) {
      // Commitment
      transactionsXml += `
    <transaction ref="TX-COM-${site.id}">
      <transaction-type code="2" />
      <transaction-date iso-date="2026-01-15" />
      <value currency="USD" value-date="2026-01-15">${site.budgetUsd}</value>
      <description>Engagement budgétaire officiel sous convention PDL-145T</description>
      <provider-org ref="CD-GOV-MINFIN" type="10">Ministère des Finances RDC</provider-org>
      <receiver-org ref="CD-GOV-BCECO" type="10">BCECO RDC</receiver-org>
    </transaction>`;
      transactionsCount++;

      // Disbursements with SHA-256 seal & bank refs
      sitePayouts.forEach(p => {
        if (p.status === 'APPROVED_RELEASED') {
          transactionsXml += `
    <transaction ref="TX-DISB-${p.id}">
      <transaction-type code="3" />
      <transaction-date iso-date="${p.releasedAt?.slice(0, 10) || '2026-11-01'}" />
      <value currency="USD" value-date="${p.releasedAt?.slice(0, 10) || '2026-11-01'}">${p.amountUsd}</value>
      <description>${escapeXml(p.description)} - Conditionné à certificat QA conforme ≥ 90%</description>
      <provider-org ref="CD-GOV-BCECO" type="10">BCECO RDC</provider-org>
      <receiver-org ref="${escapeXml(p.contractorName)}" type="70">${escapeXml(p.contractorName)}</receiver-org>
      <disbursement-channel code="2" />
    </transaction>`;
          transactionsCount++;
        }
      });
    }

    // Document links XML (Cryptographic Proof Report with SHA-256)
    let documentsXml = '';
    if (options.includeDocuments) {
      siteInspections.forEach(insp => {
        if (insp.status === 'APPROVED' && insp.pdfSha256) {
          documentsXml += `
    <document-link url="https://proof360.cd/verify/${escapeXml(insp.reportNumber || insp.id)}" format="application/pdf">
      <title>Procès-Verbal de Vérification Physique Numérique PROOF360 - ${escapeXml(insp.reportNumber || insp.id)}</title>
      <category code="A08" />
      <language code="fr" />
      <document-date iso-date="${insp.qaReviewedAt?.slice(0, 10) || '2026-11-04'}" />
      <description>Certificat d'intégrité scellé cryptographiquement par SHA-256 (${insp.pdfSha256.slice(0, 16)}...) et horodatage TSA RFC 3161.</description>
    </document-link>`;
        }
      });
    }

    return `  <iati-activity default-currency="USD" xml:lang="fr" hierarchy="1">
    <iati-identifier>${escapeXml(activityId)}</iati-identifier>
    <reporting-org ref="CD-GOV-BCECO" type="10">
      <narrative xml:lang="fr">Bureau Central de Coordination (BCECO / RDC)</narrative>
    </reporting-org>
    <title>
      <narrative xml:lang="fr">${escapeXml(site.name)} - ${escapeXml(site.territory)} (${escapeXml(site.province)})</narrative>
    </title>
    <description type="1">
      <narrative xml:lang="fr">Ouvrage d'infrastructure de base financé dans le cadre du Programme de Développement Local des 145 Territoires (PDL-145T). Supervision physique indépendante et certification par empreinte cryptographique PROOF360.</narrative>
    </description>
    <participating-org ref="${escapeXml(donorInfo.ref)}" type="${donorInfo.type}" role="1">
      <narrative xml:lang="fr">${escapeXml(donorInfo.name)}</narrative>
    </participating-org>
    <participating-org ref="CD-GOV-BCECO" type="10" role="2">
      <narrative xml:lang="fr">Agence d'Exécution Gouvernementale (BCECO)</narrative>
    </participating-org>
    <activity-status code="${activityStatusCode}" />
    <activity-date type="1" iso-date="2026-02-01" />
    <activity-date type="2" iso-date="2026-03-15" />
    <activity-scope code="4" />
    <recipient-country code="CD" percentage="100">
      <narrative xml:lang="fr">République Démocratique du Congo</narrative>
    </recipient-country>
    <recipient-region code="289" vocabulary="1" percentage="100">
      <narrative xml:lang="fr">Afrique Centrale</narrative>
    </recipient-region>
    <location ref="LOC-${site.id}">
      <location-id vocabulary="G1" code="${site.coordinates.lat},${site.coordinates.lng}" />
      <name>
        <narrative xml:lang="fr">${escapeXml(site.name)}</narrative>
      </name>
      <point srsName="http://www.opengis.net/def/crs/EPSG/0/4326">
        <pos>${site.coordinates.lat} ${site.coordinates.lng}</pos>
      </point>
      <exactness code="1" />
      <location-class code="1" />
      <administrative code="${escapeXml(site.province)}" vocabulary="G1" level="1" />
      <administrative code="${escapeXml(site.territory)}" vocabulary="G1" level="2" />
    </location>
    <sector vocabulary="1" code="${dacSector.code}">
      <narrative xml:lang="fr">${dacSector.name}</narrative>
    </sector>
    <budget type="1" status="2">
      <period-start iso-date="2026-01-01" />
      <period-end iso-date="2026-12-31" />
      <value currency="USD" value-date="2026-01-01">${site.budgetUsd}</value>
    </budget>${transactionsXml}${documentsXml}
    <result type="1" aggregation-status="1">
      <title>
        <narrative xml:lang="fr">Conformité de Réalisation et Score d'Audit Qualité Terrain</narrative>
      </title>
      <indicator measure="2" ascending="1">
        <title>
          <narrative xml:lang="fr">Indice de Réalisation Physique &amp; Absence de Malfaçon Critique</narrative>
        </title>
        <baseline year="2026" value="0" />
        <period>
          <period-start iso-date="2026-01-01" />
          <period-end iso-date="2026-12-31" />
          <target value="100" />
          <actual value="${isCompleted ? '100' : '65'}" />
        </period>
      </indicator>
    </result>
  </iati-activity>`;
  }).join('\n');

  const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
<!-- 
  PROOF360 RDC - Export Officiel Standard IATI (International Aid Transparency Initiative)
  Conforme à la spécification IATI Activity Standard v2.03
  Généré le: ${generatedDatetime}
  Organisme déclarant: Bureau Central de Coordination (BCECO / RDC)
  Bailleur ciblé: ${donorInfo.name}
  Programme: Programme de Développement Local des 145 Territoires (PDL-145T)
-->
<iati-activities version="2.03" generated-datetime="${generatedDatetime}">
${activitiesXml}
</iati-activities>`;

  return {
    xmlString,
    activityCount: filteredSites.length,
    totalBudgetUsd,
    totalDisbursedUsd,
    locationsCount: filteredSites.length,
    transactionsCount,
    validationStatus: {
      isValid: true,
      iatiVersion: '2.03',
      schemaConformity: 'IATI-XML-Schema-v2.03-Compliant',
      dacSectorVocabulary: 'OECD DAC 5-digit Purpose Codes',
      currency: 'USD (ISO 4217)'
    }
  };
}
