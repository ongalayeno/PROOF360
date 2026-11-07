import React, { useState } from 'react';
import { 
  MiningRseAudit, 
  BpuLineItem, 
  LocalWorkerAttendance, 
  Site 
} from '../types/proof360';
import { 
  Pickaxe, 
  Users, 
  FileSpreadsheet, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  DollarSign, 
  MapPin, 
  Percent, 
  Building2, 
  Plus, 
  Search, 
  Sparkles, 
  X, 
  Check, 
  Award, 
  Briefcase, 
  Scale
} from 'lucide-react';

interface MiningRseViewProps {
  audits: MiningRseAudit[];
  sites: Site[];
  onAddBpuItem?: (auditIndex: number, item: Omit<BpuLineItem, 'id'>) => void;
  onAddWorker?: (auditIndex: number, worker: Omit<LocalWorkerAttendance, 'workerId'>) => void;
  onToggleCldStatus?: (auditIndex: number, status: MiningRseAudit['cldValidationStatus']) => void;
}

export const MiningRseView: React.FC<MiningRseViewProps> = ({
  audits,
  sites,
  onAddBpuItem,
  onAddWorker,
  onToggleCldStatus
}) => {
  const [selectedAuditIndex, setSelectedAuditIndex] = useState(0);
  const [subTab, setSubTab] = useState<'BPU' | 'WORKFORCE' | 'CLD_SIGNOFF'>('BPU');
  const [searchBpu, setSearchBpu] = useState('');
  const [searchWorker, setSearchWorker] = useState('');

  // Modal states
  const [showAddBpuModal, setShowAddBpuModal] = useState(false);
  const [showAddWorkerModal, setShowAddWorkerModal] = useState(false);

  // New BPU Form state
  const [newBpuCode, setNewBpuCode] = useState('');
  const [newBpuDesc, setNewBpuDesc] = useState('');
  const [newBpuUnit, setNewBpuUnit] = useState('m³');
  const [newContractQty, setNewContractQty] = useState(100);
  const [newContractUnitPrice, setNewContractUnitPrice] = useState(250);
  const [newInspectedQty, setNewInspectedQty] = useState(100);
  const [newIsCompliant, setNewIsCompliant] = useState(true);
  const [newVarianceNote, setNewVarianceNote] = useState('');

  // New Worker Form state
  const [newWorkerName, setNewWorkerName] = useState('');
  const [newWorkerVillage, setNewWorkerVillage] = useState('');
  const [newIsLocal, setNewIsLocal] = useState(true);
  const [newJobTitle, setNewJobTitle] = useState('Maçon');
  const [newDailyWage, setNewDailyWage] = useState(16.5);
  const [newDaysPresent, setNewDaysPresent] = useState(24);

  const activeAudit = audits[selectedAuditIndex] || audits[0];

  // Calculate local workforce ratio
  const totalWorkers = activeAudit?.workers.length || 0;
  const localWorkersCount = activeAudit?.workers.filter(w => w.isLocalResident).length || 0;
  const computedLocalPercent = totalWorkers > 0 
    ? Math.round((localWorkersCount / totalWorkers) * 1000) / 10 
    : 0;

  // BPU Compliance rate
  const totalBpuItems = activeAudit?.bpuItems.length || 0;
  const compliantBpuItems = activeAudit?.bpuItems.filter(b => b.isCompliantWithBpu).length || 0;
  const computedBpuPercent = totalBpuItems > 0 
    ? Math.round((compliantBpuItems / totalBpuItems) * 100) 
    : 100;

  // Total BPU budget inspected vs contract
  const totalContractValUsd = activeAudit?.bpuItems.reduce((acc, b) => acc + (b.contractQuantity * b.contractUnitPriceUsd), 0) || 0;
  const totalInspectedValUsd = activeAudit?.bpuItems.reduce((acc, b) => acc + (b.inspectedQuantity * b.inspectedUnitPriceUsd), 0) || 0;

  const handleCreateBpu = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBpuCode || !newBpuDesc || !onAddBpuItem) return;

    onAddBpuItem(selectedAuditIndex, {
      itemCode: newBpuCode,
      description: newBpuDesc,
      unit: newBpuUnit,
      contractQuantity: Number(newContractQty),
      contractUnitPriceUsd: Number(newContractUnitPrice),
      inspectedQuantity: Number(newInspectedQty),
      inspectedUnitPriceUsd: Number(newContractUnitPrice),
      isCompliantWithBpu: newIsCompliant,
      varianceNote: newVarianceNote || undefined
    });

    setShowAddBpuModal(false);
    setNewBpuCode('');
    setNewBpuDesc('');
    setNewVarianceNote('');
  };

  const handleCreateWorker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkerName || !onAddWorker) return;

    onAddWorker(selectedAuditIndex, {
      fullName: newWorkerName,
      communityVillage: newWorkerVillage || 'Village Riverain Concession',
      isLocalResident: newIsLocal,
      jobTitle: newJobTitle,
      dailyWageUsd: Number(newDailyWage),
      daysPresent: Number(newDaysPresent)
    });

    setShowAddWorkerModal(false);
    setNewWorkerName('');
    setNewWorkerVillage('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Title */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded">
                PROTOCOLE PVS-MINE-001
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-xs font-semibold text-slate-600">
                Code Minier RDC · Dotation 0,3% du Chiffre d'Affaires
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Pickaxe className="w-5 h-5 text-amber-600" />
              <span>Module PVS-MINE : Audit RSE, Conformité BPU & Main-d'Œuvre Locale</span>
            </h1>
            <p className="text-xs text-slate-500 max-w-3xl leading-relaxed">
              Vérification matérielle in-situ des infrastructures financées obligatoirement par les multinationales minières (Lualaba, Haut-Katanga, Ituri). Contrôle rigoureux du Bordereau de Prix Unitaires (BPU), respect du quota légal de main-d'œuvre riveraine ($\ge 70\%$) et quitus communautaire du Comité Local de Développement (CLD).
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {subTab === 'BPU' && (
              <button
                onClick={() => setShowAddBpuModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter Ligne BPU</span>
              </button>
            )}
            {subTab === 'WORKFORCE' && (
              <button
                onClick={() => setShowAddWorkerModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Enregistrer Travailleur</span>
              </button>
            )}
          </div>
        </div>

        {/* Audit Selection Tab Bar */}
        <div className="flex items-center gap-2 pt-4 overflow-x-auto text-xs">
          <span className="text-slate-500 font-semibold text-[11px] shrink-0">Chantier minier :</span>
          {audits.map((aud, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedAuditIndex(idx)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                selectedAuditIndex === idx
                  ? 'bg-amber-50 text-amber-950 border border-amber-300 shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-transparent'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-amber-600" />
              <span>{aud.siteName.split('(')[0]}</span>
              <span className="font-mono text-[10px] text-slate-400">[{aud.province}]</span>
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Local Labor Ratio */}
        <div className={`p-4 rounded-xl border shadow-xs space-y-2 ${
          computedLocalPercent >= 70 
            ? 'bg-emerald-50/70 border-emerald-200' 
            : 'bg-rose-50 border-rose-200'
        }`}>
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-700 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-700" />
              <span>Main-d'Œuvre Locale</span>
            </span>
            <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded font-bold ${
              computedLocalPercent >= 70 ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'
            }`}>
              {computedLocalPercent >= 70 ? 'SEUIL 70% ATTEINT' : 'INFRACTION QUOTA'}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {computedLocalPercent}%
            </span>
            <span className="text-xs text-slate-500">
              ({localWorkersCount} sur {totalWorkers} riverains)
            </span>
          </div>
          <div className="text-[11px] text-slate-600 pt-1 border-t border-slate-200/60 flex items-center justify-between">
            <span>Minimum légal : 70%</span>
            <span className="font-bold text-slate-700">{activeAudit?.cldName.split(' ')[0]}</span>
          </div>
        </div>

        {/* Card 2: BPU Compliance Rating */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span className="flex items-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4 text-blue-600" />
              <span>Conformité BPU Quantitatif</span>
            </span>
            <span className="font-mono text-[10px] bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded font-bold">
              {compliantBpuItems}/{totalBpuItems} Postes OK
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {computedBpuPercent}%
            </span>
            <span className="text-xs text-slate-500">conformité métré</span>
          </div>
          <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
            <span>Budget BPU : ${totalContractValUsd.toLocaleString('fr-FR')}</span>
            <span className="font-mono text-slate-700">${totalInspectedValUsd.toLocaleString('fr-FR')}</span>
          </div>
        </div>

        {/* Card 3: 0.3% Mining Endowment */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span className="flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-amber-600" />
              <span>Dotation 0.3% Minière</span>
            </span>
            <span className="font-mono text-[10px] bg-amber-50 text-amber-900 px-1.5 py-0.5 rounded font-bold">
              {activeAudit?.miningCompany.split('(')[0]}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">
              ${activeAudit?.disbursedAmountUsd.toLocaleString('fr-FR')}
            </span>
            <span className="text-xs text-slate-500">décaissés</span>
          </div>
          <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
            <span>Budget voté CLD :</span>
            <span className="font-bold text-slate-800">${activeAudit?.dotationTotalUsd.toLocaleString('fr-FR')}</span>
          </div>
        </div>

        {/* Card 4: CLD Signoff Status */}
        <div className={`p-4 rounded-xl border shadow-xs space-y-2 ${
          activeAudit?.cldValidationStatus === 'APPROVED_BY_COMMUNITY'
            ? 'bg-emerald-50/70 border-emerald-200'
            : activeAudit?.cldValidationStatus === 'RESERVES_OPEN'
            ? 'bg-amber-50 border-amber-200'
            : 'bg-rose-50 border-rose-200'
        }`}>
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Quitus Communautaire CLD</span>
            </span>
            <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded font-bold ${
              activeAudit?.cldValidationStatus === 'APPROVED_BY_COMMUNITY'
                ? 'bg-emerald-100 text-emerald-900'
                : 'bg-amber-100 text-amber-900'
            }`}>
              {activeAudit?.cldValidationStatus === 'APPROVED_BY_COMMUNITY' ? 'APPROUVÉ' : 'RÉSERVES OUVERTES'}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-slate-900 truncate">
              {activeAudit?.cldPresidentName.split('(')[0]}
            </span>
          </div>
          <div className="text-[11px] text-slate-600 pt-1 border-t border-slate-200/60">
            {activeAudit?.antiPollutionCertified ? 'Anti-pollution industrielle certifiée.' : 'Non certifié.'}
          </div>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 text-xs font-semibold">
        <button
          onClick={() => setSubTab('BPU')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
            subTab === 'BPU'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Bordereau des Prix Unitaires (BPU) & Matériaux ({activeAudit?.bpuItems.length})</span>
        </button>

        <button
          onClick={() => setSubTab('WORKFORCE')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
            subTab === 'WORKFORCE'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Registre Main-d'Œuvre Locale (Quota 70%) ({activeAudit?.workers.length})</span>
        </button>

        <button
          onClick={() => setSubTab('CLD_SIGNOFF')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
            subTab === 'CLD_SIGNOFF'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Gouvernance CLD & Clôture Sociale</span>
        </button>
      </div>

      {/* SUB-VIEW 1: BPU ITEMS */}
      {subTab === 'BPU' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                <span>Vérification Physique du Devis Quantitatif et Estimatif (BPU)</span>
              </h3>
              <span className="text-[11px] text-slate-500">
                Concession {activeAudit?.concessionName} · Société : {activeAudit?.miningCompany}
              </span>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchBpu}
                onChange={e => setSearchBpu(e.target.value)}
                placeholder="Filtrer poste BPU..."
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs w-48 focus:outline-none focus:bg-white"
              />
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-600 text-[10px] uppercase font-bold tracking-wider">
                <tr>
                  <th className="p-3">Code BPU</th>
                  <th className="p-3">Désignation des Travaux / Spécification</th>
                  <th className="p-3 text-right">Quantité Contrat</th>
                  <th className="p-3 text-right">Quantité Constatée</th>
                  <th className="p-3 text-right">Prix Unitaire</th>
                  <th className="p-3 text-right">Total Constaté</th>
                  <th className="p-3 text-right">Conformité Matériaux</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {activeAudit?.bpuItems
                  .filter(b => b.description.toLowerCase().includes(searchBpu.toLowerCase()) || b.itemCode.toLowerCase().includes(searchBpu.toLowerCase()))
                  .map(bpu => (
                    <tr key={bpu.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-mono font-bold text-slate-800">{bpu.itemCode}</td>
                      <td className="p-3">
                        <div className="font-medium text-slate-900">{bpu.description}</div>
                        {bpu.varianceNote && (
                          <div className="text-[10px] text-rose-600 font-mono mt-0.5">{bpu.varianceNote}</div>
                        )}
                      </td>
                      <td className="p-3 text-right font-mono text-slate-600">
                        {bpu.contractQuantity} {bpu.unit}
                      </td>
                      <td className={`p-3 text-right font-mono font-bold ${
                        bpu.inspectedQuantity < bpu.contractQuantity ? 'text-amber-700' : 'text-slate-900'
                      }`}>
                        {bpu.inspectedQuantity} {bpu.unit}
                      </td>
                      <td className="p-3 text-right font-mono text-slate-700">
                        ${bpu.contractUnitPriceUsd}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900">
                        ${(bpu.inspectedQuantity * bpu.inspectedUnitPriceUsd).toLocaleString('fr-FR')}
                      </td>
                      <td className="p-3 text-right">
                        {bpu.isCompliantWithBpu ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Conforme BPU
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-semibold text-rose-800 bg-rose-50 px-2 py-0.5 rounded text-[11px] border border-rose-200">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            Écart Constaté
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: LOCAL WORKFORCE REGISTER */}
      {subTab === 'WORKFORCE' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-700" />
                <span>Registre Nominatif de Pointage & Preuve de Résidence Riveraine</span>
              </h3>
              <span className="text-[11px] text-slate-500">
                Application de l'Article 285 du Code Minier (Emploi prioritaire des communautés impactées)
              </span>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchWorker}
                onChange={e => setSearchWorker(e.target.value)}
                placeholder="Chercher travailleur / village..."
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs w-48 focus:outline-none focus:bg-white"
              />
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-600 text-[10px] uppercase font-bold tracking-wider">
                <tr>
                  <th className="p-3">Matricule & Nom</th>
                  <th className="p-3">Village d'Origine / Résidence</th>
                  <th className="p-3">Poste / Spécialité</th>
                  <th className="p-3 text-right">Salaire Journalier</th>
                  <th className="p-3 text-right">Jours Présence</th>
                  <th className="p-3 text-right">Statut Riverain Local</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {activeAudit?.workers
                  .filter(w => w.fullName.toLowerCase().includes(searchWorker.toLowerCase()) || w.communityVillage.toLowerCase().includes(searchWorker.toLowerCase()))
                  .map(worker => (
                    <tr key={worker.workerId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{worker.fullName}</div>
                        <div className="font-mono text-[10px] text-slate-400">{worker.workerId}</div>
                      </td>
                      <td className="p-3 text-slate-700 font-medium">
                        {worker.communityVillage}
                      </td>
                      <td className="p-3 font-semibold text-slate-800">
                        {worker.jobTitle}
                      </td>
                      <td className="p-3 text-right font-mono text-slate-900">
                        ${worker.dailyWageUsd.toFixed(2)}/j
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900">
                        {worker.daysPresent} jours
                      </td>
                      <td className="p-3 text-right">
                        {worker.isLocalResident ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Riverain Certifié
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded text-[11px] border border-amber-200">
                            Non-Riverain (Extérieur)
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: CLD SIGNOFF & GOVERNANCE */}
      {subTab === 'CLD_SIGNOFF' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="border-b pb-3">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Gouvernance Communautaire & Quitus du Comité Local de Développement (CLD)</span>
            </h3>
            <span className="text-[11px] text-slate-500">
              Dotation 0.3% : Traçabilité légale sous tutelle du Ministère des Mines et des Affaires Sociales
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
              <div className="font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-amber-600" />
                <span>Données Officielles du CLD</span>
              </div>
              <div className="space-y-1 text-slate-600">
                <div>Comité : <strong>{activeAudit?.cldName}</strong></div>
                <div>Président : <strong>{activeAudit?.cldPresidentName}</strong></div>
                <div>Téléphone officiel : <strong>{activeAudit?.cldPresidentPhone}</strong></div>
                <div>Dernière inspection conjointe : <strong>{new Date(activeAudit?.lastInspectionDate || '').toLocaleDateString('fr-FR')}</strong></div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
              <div className="font-bold text-slate-900 flex items-center gap-2">
                <Scale className="w-4 h-4 text-blue-600" />
                <span>Statut du Quitus Communautaire</span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onToggleCldStatus && onToggleCldStatus(selectedAuditIndex, 'APPROVED_BY_COMMUNITY')}
                  className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs border transition-colors cursor-pointer ${
                    activeAudit?.cldValidationStatus === 'APPROVED_BY_COMMUNITY'
                      ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Approuvé par le CLD
                </button>
                <button
                  type="button"
                  onClick={() => onToggleCldStatus && onToggleCldStatus(selectedAuditIndex, 'RESERVES_OPEN')}
                  className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs border transition-colors cursor-pointer ${
                    activeAudit?.cldValidationStatus === 'RESERVES_OPEN'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Réserves Ouvertes
                </button>
              </div>
              <p className="text-[11px] text-slate-500 italic">
                « {activeAudit?.cldSignoffNotes} »
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add BPU Item */}
      {showAddBpuModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-amber-600" />
                <span>Ajout d'un Poste au BPU Minier</span>
              </h3>
              <button onClick={() => setShowAddBpuModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBpu} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Code Poste (BPU) *</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: BPU-PEINT-005"
                    value={newBpuCode}
                    onChange={e => setNewBpuCode(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Unité</label>
                  <input
                    type="text"
                    value={newBpuUnit}
                    onChange={e => setNewBpuUnit(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Description Spécification BPU *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Peinture vinylique lavable 3 couches sur enduit ciment"
                  value={newBpuDesc}
                  onChange={e => setNewBpuDesc(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Qté Contrat</label>
                  <input
                    type="number"
                    value={newContractQty}
                    onChange={e => setNewContractQty(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Prix Unit. ($)</label>
                  <input
                    type="number"
                    value={newContractUnitPrice}
                    onChange={e => setNewContractUnitPrice(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Qté Réelle</label>
                  <input
                    type="number"
                    value={newInspectedQty}
                    onChange={e => setNewInspectedQty(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Conformité Matériaux</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setNewIsCompliant(true)}
                    className={`flex-1 py-1.5 rounded-lg font-semibold text-xs border cursor-pointer ${
                      newIsCompliant ? 'bg-emerald-700 text-white' : 'bg-slate-50 text-slate-700'
                    }`}
                  >
                    Conforme BPU
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewIsCompliant(false)}
                    className={`flex-1 py-1.5 rounded-lg font-semibold text-xs border cursor-pointer ${
                      !newIsCompliant ? 'bg-rose-700 text-white' : 'bg-slate-50 text-slate-700'
                    }`}
                  >
                    Non-Conforme / Écart
                  </button>
                </div>
              </div>

              {!newIsCompliant && (
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Note d'Écart / Réserve</label>
                  <input
                    type="text"
                    value={newVarianceNote}
                    onChange={e => setNewVarianceNote(e.target.value)}
                    placeholder="Description de la non-conformité constatée..."
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-rose-700"
                  />
                </div>
              )}

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddBpuModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-900 text-xs font-semibold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg cursor-pointer shadow-xs"
                >
                  Enregistrer Poste BPU
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Worker */}
      {showAddWorkerModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-700" />
                <span>Enregistrement Travailleur sur Chantier RSE</span>
              </h3>
              <button onClick={() => setShowAddWorkerModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWorker} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nom Complet du Travailleur *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Kabongo Mukendi Jean"
                  value={newWorkerName}
                  onChange={e => setNewWorkerName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Village de Résidence</label>
                  <input
                    type="text"
                    placeholder="ex: Village Kasulu"
                    value={newWorkerVillage}
                    onChange={e => setNewWorkerVillage(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Poste Occupé</label>
                  <input
                    type="text"
                    value={newJobTitle}
                    onChange={e => setNewJobTitle(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Salaire Journalier ($)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newDailyWage}
                    onChange={e => setNewDailyWage(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Jours Présents ce Mois</label>
                  <input
                    type="number"
                    value={newDaysPresent}
                    onChange={e => setNewDaysPresent(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Origine / Résidence Locale Riveraine</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setNewIsLocal(true)}
                    className={`flex-1 py-1.5 rounded-lg font-semibold text-xs border cursor-pointer ${
                      newIsLocal ? 'bg-emerald-700 text-white' : 'bg-slate-50 text-slate-700'
                    }`}
                  >
                    Oui (Riverain Local Concession)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewIsLocal(false)}
                    className={`flex-1 py-1.5 rounded-lg font-semibold text-xs border cursor-pointer ${
                      !newIsLocal ? 'bg-amber-600 text-white' : 'bg-slate-50 text-slate-700'
                    }`}
                  >
                    Non (Extérieur / Expatrié)
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddWorkerModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-900 text-xs font-semibold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg cursor-pointer shadow-xs"
                >
                  Valider Inscription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
