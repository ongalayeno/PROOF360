import React, { useState, useMemo } from 'react';
import { Site, Mission, Inspection, CldWeeklyAuditReport } from '../types/proof360';
import { 
  Globe, 
  Search, 
  ShieldCheck, 
  MapPin, 
  FileText, 
  CheckCircle2, 
  Users, 
  Phone, 
  Award, 
  ExternalLink, 
  DollarSign, 
  Calendar, 
  Sparkles,
  QrCode,
  Radio,
  Clock,
  AlertTriangle
} from 'lucide-react';

interface CitizenTransparencyPortalProps {
  sites: Site[];
  missions: Mission[];
  inspections: Inspection[];
  cldReports: CldWeeklyAuditReport[];
  onSubmitCldReport: (report: {
    siteId: string;
    cldPresidentName: string;
    cldPresidentPhone: string;
    isOperatingNormally: boolean;
    observations: string;
  }) => Promise<void>;
  onOpenReportModal: (inspectionId: string) => void;
}

export const CitizenTransparencyPortal: React.FC<CitizenTransparencyPortalProps> = ({
  sites,
  missions,
  inspections,
  cldReports,
  onSubmitCldReport,
  onOpenReportModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvince, setSelectedProvince] = useState<string>('ALL');
  const [selectedSiteId, setSelectedSiteId] = useState<string>(sites[0]?.id || '');
  const [showCldModal, setShowCldModal] = useState(false);

  // Form for CLD Audit submission
  const [cldName, setCldName] = useState('');
  const [cldPhone, setCldPhone] = useState('');
  const [isOperational, setIsOperational] = useState(true);
  const [cldNotes, setCldNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rechargeSuccess, setRechargeSuccess] = useState<string | null>(null);

  // Filter sites
  const filteredSites = useMemo(() => {
    return sites.filter(s => {
      const matchesSearch = 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.territory.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.province.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesProvince = selectedProvince === 'ALL' || s.province === selectedProvince;
      return matchesSearch && matchesProvince;
    });
  }, [sites, searchQuery, selectedProvince]);

  const activeSite = sites.find(s => s.id === selectedSiteId) || filteredSites[0] || sites[0];
  const siteMissions = missions.filter(m => m.siteId === activeSite?.id);
  const siteInspections = inspections.filter(i => i.siteId === activeSite?.id);
  const siteCldReports = cldReports.filter(r => r.siteId === activeSite?.id);
  const latestApprovedInspection = siteInspections.find(i => i.status === 'APPROVED');

  const handleCldSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cldName || !cldPhone) return;
    setIsSubmitting(true);
    try {
      await onSubmitCldReport({
        siteId: activeSite.id,
        cldPresidentName: cldName,
        cldPresidentPhone: cldPhone,
        isOperatingNormally: isOperational,
        observations: cldNotes || 'Contrôle citoyen hebdomadaire conforme.'
      });
      setRechargeSuccess(cldPhone);
      setCldName('');
      setCldPhone('');
      setCldNotes('');
      setShowCldModal(false);
      setTimeout(() => setRechargeSuccess(null), 6000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 text-white rounded-2xl p-6 shadow-sm border border-slate-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
              <Globe className="w-4 h-4" />
              <span>Portail Public Citoyen & Open Data RDC</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight">
              Transparence Directe sur les Projets d’Infrastructures Financés
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Consultez sans mot de passe les budgets alloués, les montants décaissés, les entreprises exécutantes et les procès-verbaux d’inspection physique scellés par SHA-256.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowCldModal(true)}
              className="px-3.5 py-2 text-xs font-bold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Espace Comité Villageois (CLD)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Airtime Recharge Notification */}
      {rechargeSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-semibold flex items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Audit citoyen enregistré ! Forfait de communication de <strong>$5.00 USD (14 000 CDF)</strong> rechargé avec succès sur le numéro {rechargeSuccess}.</span>
          </div>
          <span className="font-mono text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">AIRTIME AIRTEL/VODACOM OK</span>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Rechercher par territoire, village, plaque (ex: P-145T-041)..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-700"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-slate-500 font-medium whitespace-nowrap">Province :</span>
          <select
            value={selectedProvince}
            onChange={e => setSelectedProvince(e.target.value)}
            className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none"
          >
            <option value="ALL">Toutes les provinces ({sites.length})</option>
            <option value="Kinshasa">Kinshasa</option>
            <option value="Kongo Central">Kongo Central</option>
            <option value="Kasaï">Kasaï</option>
            <option value="Sud-Kivu">Sud-Kivu</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Sites Selector on Left, Detailed Public Dossier on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: List of Projects */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs divide-y divide-slate-100">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-900">Ouvrages Recensés ({filteredSites.length})</span>
            <span className="text-[11px] text-slate-500 font-mono">Données ouvertes publiques</span>
          </div>

          <div className="max-h-[560px] overflow-y-auto divide-y divide-slate-100 text-xs">
            {filteredSites.map(site => {
              const isSelected = site.id === activeSite?.id;
              const hasApproved = missions.some(m => m.siteId === site.id && m.status === 'APPROVED');

              return (
                <button
                  key={site.id}
                  onClick={() => setSelectedSiteId(site.id)}
                  className={`w-full text-left p-3.5 transition-colors cursor-pointer flex items-start justify-between gap-3 ${
                    isSelected ? 'bg-emerald-50/70 border-l-4 border-l-emerald-700' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900 text-xs">{site.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{site.territory} ({site.province})</span>
                      <span>·</span>
                      <span className="font-mono text-slate-700 font-medium">${site.budgetUsd.toLocaleString()}</span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold shrink-0 ${
                    hasApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {hasApproved ? 'CERTIFIÉ' : 'EN COURS'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Public Open Dossier */}
        {activeSite && (
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-5 text-xs">
            <div className="border-b pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                  <QrCode className="w-3.5 h-3.5 text-emerald-700" />
                  <span>ID Plaque Métallique : P-145T-{activeSite.territory.slice(0, 3).toUpperCase()}-{activeSite.id.slice(-2)}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {activeSite.name}
                </h3>
                <div className="flex items-center gap-2 text-slate-500 text-xs mt-0.5">
                  <span>Territoire de {activeSite.territory}</span>
                  <span>·</span>
                  <span>Province du {activeSite.province}</span>
                </div>
              </div>

              {latestApprovedInspection && (
                <button
                  onClick={() => onOpenReportModal(latestApprovedInspection.id)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Voir le PV Certifié</span>
                </button>
              )}
            </div>

            {/* Financial Transparency Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Budget Sous Contrat</span>
                <span className="font-mono font-bold text-sm text-slate-900">${activeSite.budgetUsd.toLocaleString()} USD</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Fonds publics PDL-145T</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Fonds Décaissés</span>
                <span className="font-mono font-bold text-sm text-emerald-700">${activeSite.disbursedUsd.toLocaleString()} USD</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Conditionnés aux audits QA</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Coordonnées GPS</span>
                <span className="font-mono text-xs text-slate-800 font-bold block truncate">
                  {activeSite.coordinates.lat.toFixed(4)}, {activeSite.coordinates.lng.toFixed(4)}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">WGS84 EPSG:4326</span>
              </div>
            </div>

            {/* Inspections & Proof Chain */}
            <div className="space-y-2">
              <span className="font-bold text-slate-900 block text-xs">Historique des Audits Physiques de Preuve</span>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                {siteInspections.map(insp => (
                  <div key={insp.id} className="p-3 flex items-center justify-between gap-3 text-xs bg-white hover:bg-slate-50">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">{insp.reportNumber || insp.id}</span>
                        <span className="text-slate-500">par {insp.agentName}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        Date: {new Date(insp.clientSubmittedAt).toLocaleDateString('fr-FR')} · {insp.responses.filter(r => r.evidence).length} photos certifiées
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {insp.status === 'APPROVED' ? (
                        <span className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                          SCORE QA : {insp.qaScore}/100
                        </span>
                      ) : (
                        <span className="font-mono text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                          {insp.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CLD (Comité Local de Développement) Weekly Audits */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 block text-xs flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Contrôles Hebdomadaires du Comité Villageois (CLD)</span>
                </span>
                <span className="text-[11px] text-slate-500 font-mono">{siteCldReports.length} rapport(s)</span>
              </div>

              {siteCldReports.length > 0 ? (
                <div className="space-y-2">
                  {siteCldReports.map(cld => (
                    <div key={cld.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">{cld.cldPresidentName}</span>
                          <span className="text-slate-400">·</span>
                          <span className="text-slate-500 font-mono text-[11px]">{cld.cldPresidentPhone}</span>
                        </div>
                        <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                          cld.isOperatingNormally ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {cld.isOperatingNormally ? 'FONCTIONNEL' : `EN PANNE (${cld.daysOutOfService}j)`}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] italic">
                        « {cld.observations} »
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-slate-50 rounded-lg text-center text-slate-500 text-[11px]">
                  Aucun rapport communautaire enregistré cette semaine pour cet ouvrage.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* CLD Audit Submission Modal */}
      {showCldModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="border-b pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-700" />
                <span>Rapport Hebdomadaire du Comité Local (CLD)</span>
              </h3>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Permet au chef coutumier ou président du CLD de valider le fonctionnement de l’ouvrage et de recevoir son crédit de communication.
              </p>
            </div>

            <form onSubmit={handleCldSubmit} className="space-y-3">
              <div>
                <label className="text-slate-700 font-semibold block mb-1">Ouvrage Villageois Supervisé</label>
                <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900">
                  {activeSite.name} ({activeSite.territory})
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">Nom du Président CLD ou Chef Coutumier</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Chef Coutumier Ilunga"
                  value={cldName}
                  onChange={e => setCldName(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">Numéro de Téléphone (pour recharge de forfait)</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: +243 81 234 5678"
                  value={cldPhone}
                  onChange={e => setCldPhone(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-900 text-xs font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">État de Fonctionnement Physique</label>
                <select
                  value={isOperational ? 'YES' : 'NO'}
                  onChange={e => setIsOperational(e.target.value === 'YES')}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs font-semibold focus:outline-none"
                >
                  <option value="YES">✅ L’ouvrage fonctionne normalement (Débit / Service Nominal)</option>
                  <option value="NO">🚨 L’ouvrage est en panne ou dégradé</option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">Observations & Remarques du Village</label>
                <textarea
                  rows={3}
                  value={cldNotes}
                  onChange={e => setCldNotes(e.target.value)}
                  placeholder="Ex: Pression d’eau satisfaisante, aucun problème à signaler cette semaine."
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none"
                />
              </div>

              <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 text-[11px] text-emerald-800 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Une recharge de <strong>$5.00 USD (14 000 CDF)</strong> sera automatiquement envoyée sur votre numéro Mobile Money dès soumission.</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowCldModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !cldName || !cldPhone}
                  className="px-4 py-2 font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg shadow-xs cursor-pointer"
                >
                  {isSubmitting ? 'Transmission...' : 'Valider & Déclencher Recharge'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
