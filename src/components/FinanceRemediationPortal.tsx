import React, { useState } from 'react';
import { 
  MilestonePayout, 
  ContractorRemediation, 
  Anomaly, 
  Site, 
  MobileMoneyDisbursement, 
  BankOpenBankingOrder 
} from '../types/proof360';
import { 
  DollarSign, 
  ShieldAlert, 
  CheckCircle2, 
  Lock, 
  ArrowUpRight, 
  Wrench, 
  FileText, 
  Upload, 
  AlertCircle, 
  RefreshCw,
  Smartphone,
  Landmark,
  Send,
  Zap,
  Building2,
  Clock,
  Sparkles
} from 'lucide-react';

interface FinanceRemediationPortalProps {
  payouts: MilestonePayout[];
  remediations: ContractorRemediation[];
  anomalies: Anomaly[];
  sites: Site[];
  mobileMoneyPayouts?: MobileMoneyDisbursement[];
  openBankingOrders?: BankOpenBankingOrder[];
  onReleasePayout: (payoutId: string) => Promise<void>;
  onSubmitRemediation: (remediationData: {
    anomalyId: string;
    contractorName: string;
    repairSummary: string;
    invoiceRef: string;
  }) => Promise<void>;
  onTriggerMobileMoneyPayout?: (agentName: string, amountUsd: number, operator: 'M_PESA' | 'ORANGE_MONEY' | 'AIRTEL_MONEY') => Promise<void>;
}

export const FinanceRemediationPortal: React.FC<FinanceRemediationPortalProps> = ({
  payouts,
  remediations,
  anomalies,
  sites,
  mobileMoneyPayouts = [],
  openBankingOrders = [],
  onReleasePayout,
  onSubmitRemediation,
  onTriggerMobileMoneyPayout
}) => {
  const [activeTab, setActiveTab] = useState<'PAYOUTS' | 'CONTRACTOR_PORTAL' | 'MOBILE_MONEY' | 'OPEN_BANKING'>('PAYOUTS');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form for contractor submitting a remediation
  const [selectedAnomalyId, setSelectedAnomalyId] = useState<string>(anomalies[0]?.id || '');
  const [contractorName, setContractorName] = useState('Kasaï Forage Express');
  const [repairSummary, setRepairSummary] = useState('');
  const [invoiceRef, setInvoiceRef] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Mobile Money Trigger Form
  const [agentNameInput, setAgentNameInput] = useState('Ing. Patient Mukendi');
  const [momoAmountInput, setMomoAmountInput] = useState(120);
  const [momoOperator, setMomoOperator] = useState<'M_PESA' | 'ORANGE_MONEY' | 'AIRTEL_MONEY'>('M_PESA');
  const [momoSuccess, setMomoSuccess] = useState<string | null>(null);

  const totalSecured = payouts.reduce((sum, p) => sum + p.amountUsd, 0);
  const releasedAmount = payouts.filter(p => p.status === 'APPROVED_RELEASED').reduce((sum, p) => sum + p.amountUsd, 0);
  const blockedAmount = payouts.filter(p => p.status === 'BLOCKED_BY_ANOMALY').reduce((sum, p) => sum + p.amountUsd, 0);
  const totalMomoPaid = mobileMoneyPayouts.reduce((sum, m) => sum + m.amountUsd, 0);

  const handleSubmitRemediationForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repairSummary || !invoiceRef) return;
    setIsSubmitting(true);
    try {
      await onSubmitRemediation({
        anomalyId: selectedAnomalyId,
        contractorName,
        repairSummary,
        invoiceRef
      });
      setRepairSummary('');
      setInvoiceRef('');
      setSuccessMessage('Dossier de remédiation physique soumis avec succès. Mission de réinspection planifiée.');
      setTimeout(() => setSuccessMessage(''), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTriggerMomo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onTriggerMobileMoneyPayout) {
      await onTriggerMobileMoneyPayout(agentNameInput, momoAmountInput, momoOperator);
      setMomoSuccess(`Paiement Mobile Money instantané de $${momoAmountInput} USD décaissé via ${momoOperator} pour ${agentNameInput}`);
      setTimeout(() => setMomoSuccess(null), 5000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
            <DollarSign className="w-3.5 h-3.5 text-emerald-700" />
            <span>Gestion Contractuelle, Paiements Conditionnels & Mobile Money</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
            Décaissements Intelligents & Interconnexion Bancaire
          </h2>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-semibold flex-wrap">
          <button
            onClick={() => setActiveTab('PAYOUTS')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'PAYOUTS' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-emerald-700" />
            <span>Séquestre BTP ({payouts.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('CONTRACTOR_PORTAL')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'CONTRACTOR_PORTAL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wrench className="w-3.5 h-3.5 text-amber-700" />
            <span>Remédiation BTP</span>
          </button>
          <button
            onClick={() => setActiveTab('MOBILE_MONEY')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'MOBILE_MONEY' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-blue-700" />
            <span>Mobile Money Agents</span>
          </button>
          <button
            onClick={() => setActiveTab('OPEN_BANKING')}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'OPEN_BANKING' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Landmark className="w-3.5 h-3.5 text-emerald-700" />
            <span>Open Banking SWIFT</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Fonds Sécurisés sous Contrat</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
            ${totalSecured.toLocaleString()} USD
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Sur 4 tranches conditionnelles</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Décaissements Validés & Débloqués</div>
          <div className="text-2xl font-bold font-mono text-emerald-700 mt-1 tabular-nums">
            ${releasedAmount.toLocaleString()} USD
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Rapports d'intégrité conformes ≥ 90%</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Paiements Bloqués par Anomalie</div>
          <div className="text-2xl font-bold font-mono text-rose-700 mt-1 tabular-nums">
            ${blockedAmount.toLocaleString()} USD
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Verrouillage automatique anti-malfaçon</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Per Diem Mobile Money Versés</div>
          <div className="text-2xl font-bold font-mono text-blue-700 mt-1 tabular-nums">
            ${totalMomoPaid.toLocaleString()} USD
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">M-Pesa, Orange, Airtel Money</div>
        </div>
      </div>

      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {momoSuccess && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 font-semibold flex items-center gap-2">
          <Zap className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{momoSuccess}</span>
        </div>
      )}

      {/* TAB 1: Smart Milestone Release */}
      {activeTab === 'PAYOUTS' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Registre des Tranches de Paiement Bancaire Sous Séquestre</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Chaque paiement est conditionné à l'approbation d'un rapport certifié sans anomalie critique.
              </p>
            </div>
            <span className="text-xs font-mono bg-emerald-50 text-emerald-800 px-2 py-1 rounded border border-emerald-200 font-bold">
              Escrow Oracle PROOF360
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Prestataire & Tranche</th>
                  <th className="py-3 px-4">Montant</th>
                  <th className="py-3 px-4">Condition Déclenchante</th>
                  <th className="py-3 px-4">Statut de Déblocage</th>
                  <th className="py-3 px-4 text-right">Action Bancaire</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payouts.map(payout => {
                  const site = sites.find(s => s.id === payout.siteId);
                  return (
                    <tr key={payout.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{payout.contractorName}</div>
                        <div className="text-[11px] text-slate-500">{payout.description}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{site?.name}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-sm text-slate-900 tabular-nums">
                          ${payout.amountUsd.toLocaleString()} USD
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        <span className="font-mono text-[11px]">{payout.triggerCondition}</span>
                      </td>
                      <td className="py-3 px-4">
                        {payout.status === 'APPROVED_RELEASED' && (
                          <div>
                            <span className="font-semibold text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Payé & Débloqué
                            </span>
                            <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                              Réf: {payout.bankTransferRef}
                            </div>
                          </div>
                        )}
                        {payout.status === 'BLOCKED_BY_ANOMALY' && (
                          <div>
                            <span className="font-semibold text-rose-700 flex items-center gap-1">
                              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                              Bloqué par Anomalie
                            </span>
                            <div className="text-[10px] text-rose-600 mt-0.5 max-w-xs">
                              {payout.blockedReason}
                            </div>
                          </div>
                        )}
                        {payout.status === 'LOCKED' && (
                          <div>
                            <span className="font-semibold text-amber-700 flex items-center gap-1">
                              <Lock className="w-3.5 h-3.5 text-amber-600" />
                              Verrouillé (Sous Séquestre)
                            </span>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              {payout.blockedReason || 'En attente de certificat QA.'}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {payout.status === 'LOCKED' && (
                          <button
                            onClick={() => onReleasePayout(payout.id)}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded font-semibold text-xs cursor-pointer shadow-xs inline-flex items-center gap-1"
                          >
                            <span>Débloquer fonds</span>
                          </button>
                        )}
                        {payout.status === 'BLOCKED_BY_ANOMALY' && (
                          <span className="text-[11px] text-rose-700 font-semibold italic">
                            Résolution exigée
                          </span>
                        )}
                        {payout.status === 'APPROVED_RELEASED' && (
                          <span className="text-[11px] text-slate-400 font-mono">
                            Virement exécuté
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Contractor Remediation Portal */}
      {activeTab === 'CONTRACTOR_PORTAL' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Active Remediation Submission Form */}
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 text-xs">
            <div className="border-b pb-2">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-amber-700" />
                Soumission de Preuve de Correction Physique (Entreprise BTP)
              </h3>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Permet au prestataire de lever la réserve QA et de solliciter la mission de réinspection.
              </p>
            </div>

            <form onSubmit={handleSubmitRemediationForm} className="space-y-3">
              <div>
                <label className="text-slate-700 font-semibold block mb-1">Anomalie ou Réserve Visée</label>
                <select
                  value={selectedAnomalyId}
                  onChange={e => setSelectedAnomalyId(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none"
                >
                  {anomalies.map(a => (
                    <option key={a.id} value={a.id}>
                      [{a.severity}] {a.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">Nom de l'Entreprise Contractante</label>
                <input
                  type="text"
                  value={contractorName}
                  onChange={e => setContractorName(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">Rapport Technique des Travaux Correctifs</label>
                <textarea
                  rows={3}
                  value={repairSummary}
                  onChange={e => setRepairSummary(e.target.value)}
                  placeholder="Ex: Remplacement du tubage, étanchéité de dalle reprise au ciment haute résistance..."
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">Numéro de Facture / Bon d'Attachement</label>
                <input
                  type="text"
                  placeholder="Ex: FACT-REP-2026-081"
                  value={invoiceRef}
                  onChange={e => setInvoiceRef(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-900 font-mono"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <span className="font-semibold text-slate-700 block">Preuve photographique jointe au dossier</span>
                <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                  <Upload className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Photo avant/après certifiée par géolocalisation in-app</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !repairSummary || !invoiceRef}
                className="w-full py-2.5 px-4 font-bold text-xs text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                {isSubmitting ? 'Transmission en cours...' : 'Transmettre au QA & Solliciter Réinspection'}
              </button>
            </form>
          </div>

          {/* List of Submitted Remediations */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3 text-xs">
              <h3 className="font-bold text-slate-900 text-sm">Dossiers de Réparation Soumis ({remediations.length})</h3>
              <div className="space-y-3">
                {remediations.map(rem => (
                  <div key={rem.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{rem.contractorName}</span>
                      <span className="text-[10px] font-mono bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-semibold">
                        {rem.status}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      {rem.repairSummary}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-200">
                      <span>Réf: {rem.invoiceRef}</span>
                      <span>{new Date(rem.submittedAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Instant Mobile Money Disbursals */}
      {activeTab === 'MOBILE_MONEY' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 text-xs">
            <div className="border-b pb-2">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-blue-700" />
                Paiement Instantané Mobile Money (M-Pesa / Orange / Airtel)
              </h3>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Règlement immédiat des per-diem et primes des agents dès validation sans réserve de leur mission par le QA.
              </p>
            </div>

            <form onSubmit={handleTriggerMomo} className="space-y-3">
              <div>
                <label className="text-slate-700 font-semibold block mb-1">Agent Bénéficiaire</label>
                <input
                  type="text"
                  value={agentNameInput}
                  onChange={e => setAgentNameInput(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Opérateur RDC</label>
                  <select
                    value={momoOperator}
                    onChange={e => setMomoOperator(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  >
                    <option value="M_PESA">Vodacom M-Pesa</option>
                    <option value="ORANGE_MONEY">Orange Money</option>
                    <option value="AIRTEL_MONEY">Airtel Money</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Montant (USD)</label>
                  <input
                    type="number"
                    value={momoAmountInput}
                    onChange={e => setMomoAmountInput(Number(e.target.value))}
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-[11px] text-blue-900">
                <span>Équivalent en Francs Congolais (CDF) au taux indicatif : <strong>{(momoAmountInput * 2800).toLocaleString()} CDF</strong></span>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer shadow-xs inline-flex items-center justify-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Déclencher le Virement Instantané Mobile Money</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs text-xs">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <span className="font-bold text-slate-900">Historique des Virements Mobile Money ({mobileMoneyPayouts.length})</span>
              <span className="text-[11px] text-slate-400 font-mono">API Passerelle Vodacom / Orange / Airtel</span>
            </div>

            <div className="divide-y divide-slate-100">
              {mobileMoneyPayouts.map(momo => (
                <div key={momo.id} className="p-3.5 hover:bg-slate-50 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{momo.agentName}</span>
                      <span className="text-[10px] font-mono bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded font-bold">
                        {momo.operator}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      Réf: {momo.transactionRef} · {momo.agentPhone}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-emerald-700">${momo.amountUsd} USD</span>
                    <span className="text-[10px] text-slate-400 block font-mono">{(momo.amountCdf).toLocaleString()} CDF</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Open Banking SWIFT ISO 20022 */}
      {activeTab === 'OPEN_BANKING' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-900 text-white rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div>
              <div className="flex items-center gap-1.5 font-bold text-emerald-400 text-sm">
                <Building2 className="w-4 h-4" />
                <span>Interconnexion Bancaire Directe — Norme SWIFT ISO 20022 (pacs.008)</span>
              </div>
              <p className="text-slate-300 text-[11px] mt-0.5 max-w-2xl">
                Connexion directe par API sécurisée aux banques dépositaires de la RDC (Rawbank, EquityBCDC, TMB) pour l'exécution automatique des tranches de paiement après signature cryptographique de la réception physique.
              </p>
            </div>
            <span className="font-mono text-xs bg-slate-800 border border-slate-700 px-3 py-1 rounded text-slate-300">
              Passerelle Bancaire Ouverte
            </span>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs text-xs">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <span className="font-bold text-slate-900">Ordres de Virement Bancaires RDC Émis ({openBankingOrders.length})</span>
              <span className="text-slate-500 font-mono text-[11px]">Protocole Open Banking BCECO</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Banque & Bénéficiaire</th>
                    <th className="py-3 px-4">Message SWIFT</th>
                    <th className="py-3 px-4">Compte Bancaire (BBAN)</th>
                    <th className="py-3 px-4">Montant Décaissé</th>
                    <th className="py-3 px-4">Empreinte SHA-256</th>
                    <th className="py-3 px-4 text-right">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {openBankingOrders.map(order => (
                    <tr key={order.id} className="hover:bg-slate-50 font-mono text-[11px]">
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block font-sans text-xs">{order.beneficiaryName}</span>
                        <span className="text-slate-500 text-[10px]">{order.bankName}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">{order.swiftIso20022MsgType}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {order.ibanOrBban}
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-700 text-xs">
                        ${order.amountUsd.toLocaleString()} USD
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[10px]">
                        {order.signedSha256Digest.slice(0, 16)}...
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold">
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
