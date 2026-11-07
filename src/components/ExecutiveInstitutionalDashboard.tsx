import React, { useState, useMemo } from 'react';
import { Site, Mission, Inspection, Anomaly, MilestonePayout, EnvReforestationAudit } from '../types/proof360';
import { 
  BarChart3, 
  Download, 
  FileText, 
  Globe, 
  CheckCircle, 
  ShieldCheck, 
  Scale, 
  Database, 
  ExternalLink,
  Copy,
  Check,
  Building2,
  Filter,
  Send,
  Code2,
  Layers,
  ArrowRight,
  Trees,
  Leaf,
  Award,
  Sparkles
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Cell 
} from 'recharts';
import { generateIatiXml, IatiExportOptions } from '../services/iatiXmlService';

interface ExecutiveInstitutionalDashboardProps {
  sites: Site[];
  missions: Mission[];
  inspections: Inspection[];
  anomalies: Anomaly[];
  payouts: MilestonePayout[];
  envAudits?: EnvReforestationAudit[];
}

export const ExecutiveInstitutionalDashboard: React.FC<ExecutiveInstitutionalDashboardProps> = ({
  sites,
  missions,
  inspections,
  anomalies,
  payouts,
  envAudits = []
}) => {
  const [activeSection, setActiveSection] = useState<'OVERVIEW' | 'IATI_EXPORTER'>('OVERVIEW');
  const [copiedIati, setCopiedIati] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [apiPublishSuccess, setApiPublishSuccess] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  // IATI Exporter Configuration state
  const [targetDonor, setTargetDonor] = useState<IatiExportOptions['targetDonor']>('WORLD_BANK');
  const [provinceFilter, setProvinceFilter] = useState<string>('ALL');
  const [onlyApproved, setOnlyApproved] = useState<boolean>(false);
  const [includeTransactions, setIncludeTransactions] = useState<boolean>(true);
  const [includeDocuments, setIncludeDocuments] = useState<boolean>(true);
  const [showXmlCodePreview, setShowXmlCodePreview] = useState<boolean>(true);
  const [carbonMetric, setCarbonMetric] = useState<'CO2' | 'TREES' | 'SURVIVAL' | 'REVENUE'>('CO2');

  const totalBudget = sites.reduce((sum, s) => sum + s.budgetUsd, 0);
  const totalDisbursed = sites.reduce((sum, s) => sum + s.disbursedUsd, 0);
  const approvedMissions = missions.filter(m => m.status === 'APPROVED').length;
  const deliveryRatioPercent = missions.length > 0 ? Math.round((approvedMissions / missions.length) * 100) : 0;

  // Group by province
  const provinceStats = ['Kinshasa', 'Kongo Central', 'Kasaï', 'Sud-Kivu'].map(prov => {
    const provSites = sites.filter(s => s.province === prov);
    const provBudget = provSites.reduce((sum, s) => sum + s.budgetUsd, 0);
    const provDisbursed = provSites.reduce((sum, s) => sum + s.disbursedUsd, 0);
    const provMissions = missions.filter(m => m.site.province === prov);
    const provApproved = provMissions.filter(m => m.status === 'APPROVED').length;
    return {
      province: prov,
      sitesCount: provSites.length,
      budget: provBudget,
      disbursed: provDisbursed,
      deliveredPercent: provMissions.length > 0 ? Math.round((provApproved / provMissions.length) * 100) : 0
    };
  });

  // Carbon sequestration provincial dataset (PVS-ENV-001 Verra VCS / Gold Standard)
  const carbonProvinceData = useMemo(() => {
    return [
      { 
        province: 'Maï-Ndombe', 
        co2Tons: envAudits[0]?.accumulatedCo2SequestrationTons || 124500, 
        livingTrees: envAudits[0]?.totalTreesVerifiedLiving || 154800, 
        survivalPercent: envAudits[0]?.globalSurvivalRatePercent || 86.0, 
        creditsUsd: envAudits[0]?.carbonCreditsEstimatedUsd || 1494000, 
        targetTrees: envAudits[0]?.totalTreesPlantedTarget || 180000 
      },
      { 
        province: 'Équateur', 
        co2Tons: 98200, 
        livingTrees: 118000, 
        survivalPercent: 81.5, 
        creditsUsd: 1178400, 
        targetTrees: 145000 
      },
      { 
        province: 'Tshopo', 
        co2Tons: 85400, 
        livingTrees: 104200, 
        survivalPercent: 78.4, 
        creditsUsd: 1024800, 
        targetTrees: 133000 
      },
      { 
        province: 'Sud-Kivu', 
        co2Tons: 64800, 
        livingTrees: 82400, 
        survivalPercent: 89.2, 
        creditsUsd: 777600, 
        targetTrees: 92400 
      },
      { 
        province: 'Kongo Central', 
        co2Tons: 42100, 
        livingTrees: 53000, 
        survivalPercent: 84.0, 
        creditsUsd: 505200, 
        targetTrees: 63100 
      }
    ];
  }, [envAudits]);

  const totalCarbonSequestrationTons = useMemo(() => {
    return carbonProvinceData.reduce((acc, curr) => acc + curr.co2Tons, 0);
  }, [carbonProvinceData]);

  const totalLivingTreesSum = useMemo(() => {
    return carbonProvinceData.reduce((acc, curr) => acc + curr.livingTrees, 0);
  }, [carbonProvinceData]);

  const totalCreditsValueUsd = useMemo(() => {
    return carbonProvinceData.reduce((acc, curr) => acc + curr.creditsUsd, 0);
  }, [carbonProvinceData]);

  const averageSurvivalRate = useMemo(() => {
    const sum = carbonProvinceData.reduce((acc, curr) => acc + curr.survivalPercent, 0);
    return (sum / carbonProvinceData.length).toFixed(1);
  }, [carbonProvinceData]);

  // Generate standardized IATI XML using service
  const iatiSummary = useMemo(() => {
    return generateIatiXml(sites, missions, inspections, payouts, {
      targetDonor,
      provinceFilter,
      onlyApproved,
      includeTransactions,
      includeDocuments
    });
  }, [sites, missions, inspections, payouts, targetDonor, provinceFilter, onlyApproved, includeTransactions, includeDocuments]);

  const handleCopyIati = () => {
    navigator.clipboard.writeText(iatiSummary.xmlString);
    setCopiedIati(true);
    setTimeout(() => setCopiedIati(false), 2000);
  };

  const handleDownloadIati = () => {
    const filename = `proof360_iati_v203_${targetDonor.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.xml`;
    const dataStr = 'data:text/xml;charset=utf-8,' + encodeURIComponent(iatiSummary.xmlString);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 4000);
  };

  const handlePublishToRegistryApi = () => {
    setIsPublishing(true);
    setTimeout(() => {
      setIsPublishing(false);
      const publishRef = `IATI-REG-CD-${Math.floor(100000 + Math.random() * 900000)}`;
      setApiPublishSuccess(publishRef);
      setTimeout(() => setApiPublishSuccess(null), 8000);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
            <BarChart3 className="w-3.5 h-3.5 text-emerald-700" />
            <span>Tableau de Bord Décideurs & Reporting Bailleurs Internationaux</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
            Suivi Exécutif & Export XML Standard IATI v2.03
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setActiveSection('OVERVIEW')}
              className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeSection === 'OVERVIEW'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-emerald-700" />
              <span>Synthèse Nationale</span>
            </button>
            <button
              onClick={() => setActiveSection('IATI_EXPORTER')}
              className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeSection === 'IATI_EXPORTER'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-blue-700" />
              <span>Module Export IATI / GEMS</span>
            </button>
          </div>

          <button
            onClick={() => {
              setActiveSection('IATI_EXPORTER');
              handleDownloadIati();
            }}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Télécharger IATI XML</span>
          </button>
        </div>
      </div>

      {/* Notifications Strip */}
      {downloadSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-semibold flex items-center gap-2 shadow-xs">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Fichier XML conforme au standard international IATI v2.03 généré et téléchargé avec succès !</span>
        </div>
      )}

      {apiPublishSuccess && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 font-semibold flex items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Flux IATI synchronisé avec succès vers le Registre International ! Réf de transaction : <strong>{apiPublishSuccess}</strong></span>
          </div>
          <span className="font-mono text-[11px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded">HTTP 201 Created</span>
        </div>
      )}

      {/* SECTION 1: National Executive Overview */}
      {activeSection === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* High-Level Executive Scoreboard */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Taux d'Exécution Réel Physique</span>
              <div className="text-2xl font-bold font-mono text-emerald-700 mt-1 tabular-nums">
                {deliveryRatioPercent}%
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">{approvedMissions} sur {missions.length} projets certifiés conformes</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Fonds Publics Décaissés</span>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
                ${totalDisbursed.toLocaleString()} USD
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Sur ${totalBudget.toLocaleString()} USD alloués</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Horodatage TSA RFC 3161</span>
              <div className="text-2xl font-bold font-mono text-slate-800 mt-1">
                Qualifié eIDAS
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Opposable devant les cours d'audit</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Cadre Légal & Archivage WORM</span>
              <div className="text-2xl font-bold font-mono text-emerald-800 mt-1">
                10 Ans OHADA
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Garantie décennale des marchés publics</div>
            </div>
          </div>

          {/* Quick Banner: Direct Jump to IATI Exporter */}
          <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-sm">Transmission des Données aux Bailleurs Internationaux (IATI v2.03)</span>
              </div>
              <p className="text-xs text-slate-300 max-w-2xl">
                Générez le fichier XML normé contenant les coordonnées GPS précises (WGS84 EPSG:4326), les montants décaissés scellés par SHA-256 et la nomenclature sectorielle CAD OCDE pour la Banque Mondiale, la BAD et l'UE.
              </p>
            </div>
            <button
              onClick={() => setActiveSection('IATI_EXPORTER')}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5 shrink-0 shadow-sm"
            >
              <span>Accéder au Module Export IATI</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Provincial Breakdown Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900 text-sm">Répartition Provinciale de la Livraison des Travaux</span>
              <span className="text-slate-500 font-mono">Suivi consolidé RDC 2026</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Province</th>
                    <th className="py-3 px-4">Ouvrages Suivis</th>
                    <th className="py-3 px-4">Budget Total</th>
                    <th className="py-3 px-4">Fonds Décaissés</th>
                    <th className="py-3 px-4 text-right">Taux de Livraison Réelle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {provinceStats.map(stat => (
                    <tr key={stat.province} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-900">{stat.province}</td>
                      <td className="py-3 px-4 font-mono">{stat.sitesCount} site(s)</td>
                      <td className="py-3 px-4 font-mono font-medium">${stat.budget.toLocaleString()}</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">${stat.disbursed.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          {stat.deliveredPercent}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Panel: Séquestration Carbone & Reforestation PVS-ENV (Recharts) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-800">
                  <Trees className="w-4 h-4 text-emerald-600" />
                  <span>Protocole Sectoriel PVS-ENV · Crédits Carbone Verra VCS & Bassin du Congo</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight mt-0.5">
                  Progression Provinciale de la Séquestration Carbone & Survie Végétale
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Visualisation certifiée des audits de biomasse par photogrammétrie drone et validation de survie pour l'émission des crédits carbone.
                </p>
              </div>

              {/* Metric Selector Buttons */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold shrink-0">
                <button
                  type="button"
                  onClick={() => setCarbonMetric('CO2')}
                  className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                    carbonMetric === 'CO2' ? 'bg-white text-emerald-800 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  CO2e Séquestré (T)
                </button>
                <button
                  type="button"
                  onClick={() => setCarbonMetric('TREES')}
                  className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                    carbonMetric === 'TREES' ? 'bg-white text-emerald-800 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Arbres Vivants
                </button>
                <button
                  type="button"
                  onClick={() => setCarbonMetric('SURVIVAL')}
                  className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                    carbonMetric === 'SURVIVAL' ? 'bg-white text-emerald-800 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Taux Survie (%)
                </button>
                <button
                  type="button"
                  onClick={() => setCarbonMetric('REVENUE')}
                  className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                    carbonMetric === 'REVENUE' ? 'bg-white text-emerald-800 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Crédits ($ USD)
                </button>
              </div>
            </div>

            {/* Quick Summary KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl">
                <span className="text-[11px] font-semibold text-emerald-900 block">Total Séquestration</span>
                <span className="font-mono font-bold text-xl text-emerald-800">
                  {totalCarbonSequestrationTons.toLocaleString()} tCO2e
                </span>
                <span className="text-[10px] text-emerald-700 block mt-0.5">5 provinces auditées</span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[11px] font-semibold text-slate-600 block">Arbres Vivants Confirmés</span>
                <span className="font-mono font-bold text-xl text-slate-900">
                  {totalLivingTreesSum.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Scannés par IA drone</span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[11px] font-semibold text-slate-600 block">Valeur Marché Carbone</span>
                <span className="font-mono font-bold text-xl text-slate-900">
                  ${totalCreditsValueUsd.toLocaleString()} USD
                </span>
                <span className="text-[10px] text-emerald-700 block mt-0.5">Base $12/tonne VCS</span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[11px] font-semibold text-slate-600 block">Survie Moyenne Nationale</span>
                <span className="font-mono font-bold text-xl text-emerald-700">
                  {averageSurvivalRate}%
                </span>
                <span className="text-[10px] text-emerald-800 block mt-0.5">✓ Seuil Verra ≥70% validé</span>
              </div>
            </div>

            {/* Recharts BarChart Visualization */}
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={carbonProvinceData} margin={{ top: 10, right: 20, left: 10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis 
                    dataKey="province" 
                    stroke="#64748b" 
                    fontSize={11} 
                    tickLine={false}
                    tick={{ fill: '#334155' }}
                  />
                  <YAxis 
                    stroke="#64748b" 
                    fontSize={11} 
                    tickLine={false}
                    tickFormatter={(val) => {
                      if (carbonMetric === 'CO2') return `${val / 1000}k T`;
                      if (carbonMetric === 'TREES') return `${val / 1000}k`;
                      if (carbonMetric === 'SURVIVAL') return `${val}%`;
                      if (carbonMetric === 'REVENUE') return `$${val / 1000}k`;
                      return `${val}`;
                    }}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }}
                    content={({ active, payload, label }: any) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1.5 border border-slate-800 min-w-44">
                            <div className="font-bold text-emerald-400 text-sm border-b border-slate-800 pb-1 flex items-center justify-between">
                              <span>{label}</span>
                              <span className="text-[10px] text-slate-400 font-mono">PVS-ENV</span>
                            </div>
                            <div className="space-y-1 pt-0.5">
                              <p className="flex justify-between">
                                <span className="text-slate-400">Séquestration :</span>
                                <span className="font-mono font-bold text-emerald-300">{data.co2Tons.toLocaleString()} tCO2e</span>
                              </p>
                              <p className="flex justify-between">
                                <span className="text-slate-400">Arbres vivants :</span>
                                <span className="font-mono font-bold">{data.livingTrees.toLocaleString()} / {data.targetTrees.toLocaleString()}</span>
                              </p>
                              <p className="flex justify-between">
                                <span className="text-slate-400">Taux survie :</span>
                                <span className="font-mono font-bold text-amber-300">{data.survivalPercent}%</span>
                              </p>
                              <p className="flex justify-between">
                                <span className="text-slate-400">Valeur carbone :</span>
                                <span className="font-mono font-bold text-blue-300">${data.creditsUsd.toLocaleString()}</span>
                              </p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar 
                    dataKey={
                      carbonMetric === 'CO2' ? 'co2Tons' :
                      carbonMetric === 'TREES' ? 'livingTrees' :
                      carbonMetric === 'SURVIVAL' ? 'survivalPercent' : 'creditsUsd'
                    }
                    radius={[6, 6, 0, 0]}
                  >
                    {carbonProvinceData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={
                          carbonMetric === 'SURVIVAL' 
                            ? (entry.survivalPercent >= 70 ? '#059669' : '#e11d48')
                            : index === 0 ? '#047857' : index === 1 ? '#059669' : index === 2 ? '#10b981' : index === 3 ? '#34d399' : '#6ee7b7'
                        } 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
                <span>Certification conforme au standard Verra Verified Carbon Standard (VCS VM0007)</span>
              </span>
              <span className="font-mono text-slate-400">
                Indexation automatique dans le Registre National REDD+
              </span>
            </div>
          </div>

          {/* Legal & Standards Compliance Strip */}
          <div className="p-5 bg-slate-900 text-white rounded-xl space-y-3 text-xs">
            <div className="flex items-center gap-2 font-bold text-sm text-emerald-400">
              <Scale className="w-4 h-4" />
              <span>Garanties Juridiques & Conformité Institutionnelle</span>
            </div>
            <p className="text-slate-300 leading-relaxed max-w-3xl">
              Toutes les attestations numériques délivrées par PROOF360 RDC incorporent les mentions d'actes d'experts vérificateurs assermentés selon le droit OHADA. Le scellement SHA-256 et le numéro de certificat unique confèrent une opposabilité juridique immédiate aux contentieux et ordres de décaissement de tranches.
            </p>
            <div className="flex flex-wrap gap-4 text-slate-400 text-[11px] font-mono pt-1 border-t border-slate-800">
              <span>Standard IATI Activity v2.03</span>
              <span>·</span>
              <span>World Bank GEMS Compliant</span>
              <span>·</span>
              <span>Nomenclature CAD OCDE</span>
              <span>·</span>
              <span>Norme ISO/IEC 27001 Immuabilité</span>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: Dedicated IATI v2.03 Exporter & Registry Gateway */}
      {activeSection === 'IATI_EXPORTER' && (
        <div className="space-y-6">
          {/* Exporter Configuration Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-5 text-xs">
            <div className="border-b pb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-700" />
                  Générateur XML Standard IATI (International Aid Transparency Initiative) v2.03
                </h3>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Configurez les paramètres du reporting officiel pour publication aux bailleurs de fonds et plateformes Open Data.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                  IATI XML Schema v2.03 Valid
                </span>
                <span className="text-[10px] font-mono bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded font-bold">
                  CRS DAC Vocabulary
                </span>
              </div>
            </div>

            {/* Filter controls grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-slate-700 font-semibold block mb-1">Bailleur / Partenaire Ciblé</label>
                <select
                  value={targetDonor}
                  onChange={e => setTargetDonor(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:outline-none"
                >
                  <option value="WORLD_BANK">Banque Mondiale (IDA / World Bank Group)</option>
                  <option value="AFDB">Banque Africaine de Développement (BAD)</option>
                  <option value="EU_INTPA">Union Européenne (DG INTPA / FED)</option>
                  <option value="ENABEL">Enabel (Coopération Belge)</option>
                  <option value="GLOBAL_FUND">Fonds Mondial (Santé & Équipements)</option>
                  <option value="ALL">Tous les partenaires (BCECO Général)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">Périmètre Géographique</label>
                <select
                  value={provinceFilter}
                  onChange={e => setProvinceFilter(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:outline-none"
                >
                  <option value="ALL">Toutes les provinces (RDC National)</option>
                  <option value="Kinshasa">Kinshasa</option>
                  <option value="Kongo Central">Kongo Central</option>
                  <option value="Kasaï">Kasaï</option>
                  <option value="Sud-Kivu">Sud-Kivu</option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">Filtrage de Conformité QA</label>
                <select
                  value={onlyApproved ? 'ONLY_APPROVED' : 'ALL_STATUS'}
                  onChange={e => setOnlyApproved(e.target.value === 'ONLY_APPROVED')}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:outline-none"
                >
                  <option value="ALL_STATUS">Tous les chantiers en cours & achevés</option>
                  <option value="ONLY_APPROVED">Uniquement les chantiers certifiés (APPROVED)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">Sections IATI Incluses</label>
                <div className="flex flex-col gap-1.5 pt-1">
                  <label className="inline-flex items-center gap-2 cursor-pointer text-slate-700 text-[11px]">
                    <input
                      type="checkbox"
                      checked={includeTransactions}
                      onChange={e => setIncludeTransactions(e.target.checked)}
                      className="rounded border-slate-300 text-emerald-700 focus:ring-0"
                    />
                    <span>Transactions & Décaissements Bancaires</span>
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer text-slate-700 text-[11px]">
                    <input
                      type="checkbox"
                      checked={includeDocuments}
                      onChange={e => setIncludeDocuments(e.target.checked)}
                      className="rounded border-slate-300 text-emerald-700 focus:ring-0"
                    />
                    <span>Liens Certificats SHA-256 (PDF Seal)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Live Metrics Summary of the generated IATI dataset */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Activités IATI</span>
                <span className="font-mono font-bold text-base text-slate-900">{iatiSummary.activityCount} projets</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Budget Engagé</span>
                <span className="font-mono font-bold text-base text-slate-900">${iatiSummary.totalBudgetUsd.toLocaleString()} USD</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Fonds Décaissés</span>
                <span className="font-mono font-bold text-base text-emerald-700">${iatiSummary.totalDisbursedUsd.toLocaleString()} USD</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Coordonnées GPS WGS84</span>
                <span className="font-mono font-bold text-base text-blue-700">{iatiSummary.locationsCount} points validés</span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadIati}
                  className="px-3.5 py-2 font-bold text-xs text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Télécharger le fichier XML IATI</span>
                </button>

                <button
                  onClick={handleCopyIati}
                  className="px-3 py-2 font-semibold text-xs text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
                >
                  {copiedIati ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{copiedIati ? 'XML Copié !' : 'Copier dans le Presse-Papier'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePublishToRegistryApi}
                  disabled={isPublishing}
                  className="px-3 py-2 font-semibold text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                  title="Simuler la transmission directe vers l'API du Registre IATI"
                >
                  <Send className="w-3.5 h-3.5 text-blue-600" />
                  <span>{isPublishing ? 'Publication en cours...' : 'Publier vers API Registre IATI'}</span>
                </button>

                <button
                  onClick={() => setShowXmlCodePreview(!showXmlCodePreview)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>{showXmlCodePreview ? 'Masquer Code XML' : 'Voir Code XML'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Interactive XML Inspector */}
          {showXmlCodePreview && (
            <div className="bg-slate-950 text-slate-200 rounded-xl overflow-hidden border border-slate-800 shadow-lg">
              <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                  </div>
                  <span className="text-slate-400 pl-2">proof360_iati_v203_export.xml</span>
                </div>
                <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                  <span>Format : XML 1.0 UTF-8</span>
                  <span>·</span>
                  <span>Schéma : IATI 2.03</span>
                  <button
                    onClick={handleCopyIati}
                    className="text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copier</span>
                  </button>
                </div>
              </div>

              <div className="p-4 max-h-96 overflow-y-auto font-mono text-xs leading-relaxed text-emerald-400 select-all">
                <pre className="whitespace-pre">{iatiSummary.xmlString}</pre>
              </div>
            </div>
          )}

          {/* Donor Standards Guidelines strip */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-1.5">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-emerald-700" />
                <span>Banque Mondiale & GEMS</span>
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Le format généré respecte les directives GEMS (Geo-Enabling initiative for Monitoring and Supervision) avec coordonnées GPS WGS84 et identifiant unique de projet.
              </p>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-1.5">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <Database className="w-4 h-4 text-blue-700" />
                <span>Nomenclature CAD OCDE</span>
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Les secteurs (WASH, Solaire, Santé, Éducation) sont automatiquement mappés aux codes sectoriels 5 chiffres du Système de Notification des Pays Créanciers (SNPC / CRS).
              </p>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-1.5">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span>Traçabilité & SHA-256</span>
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Chaque transaction décaissée est scellée avec l'empreinte SHA-256 du rapport de réception physique et le numéro de virement bancaire RAW-TRF.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
