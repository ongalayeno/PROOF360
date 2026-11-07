import React, { useState } from 'react';
import { Mission, Site, Inspection, SectorType } from '../types/proof360';
import { Search, Filter, ShieldCheck, AlertTriangle, ArrowRight, FileCheck, Smartphone } from 'lucide-react';

interface MissionListProps {
  missions: Mission[];
  sites: Site[];
  inspections: Inspection[];
  onSelectMission: (missionId: string) => void;
  onOpenMobile: (missionId: string) => void;
  onOpenReport: (inspectionId: string) => void;
}

export const MissionList: React.FC<MissionListProps> = ({
  missions,
  sites,
  inspections,
  onSelectMission,
  onOpenMobile,
  onOpenReport
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sectorFilter, setSectorFilter] = useState<string>('ALL');

  // Compute metrics
  const totalDisbursed = sites.reduce((sum, s) => sum + s.disbursedUsd, 0);
  const approvedCount = missions.filter(m => m.status === 'APPROVED').length;
  const pendingReviewCount = missions.filter(m => m.status === 'QA_REVIEW').length;
  const needsReinspectionCount = missions.filter(m => m.status === 'NEEDS_REINSPECTION').length;

  const filteredMissions = missions.filter(m => {
    const matchesSearch =
      m.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.site.territory.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || m.status === statusFilter;
    const matchesSector = sectorFilter === 'ALL' || m.site.sector === sectorFilter;

    return matchesSearch && matchesStatus && matchesSector;
  });

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return { label: 'Validé & Scellé', color: 'text-emerald-700' };
      case 'QA_REVIEW':
        return { label: 'En attente revue QA', color: 'text-amber-700 font-semibold' };
      case 'NEEDS_REINSPECTION':
        return { label: 'Anomalie / À réinspecter', color: 'text-rose-700 font-semibold' };
      case 'IN_PROGRESS':
        return { label: 'Collecte terrain en cours', color: 'text-blue-700' };
      default:
        return { label: 'Non assigné', color: 'text-slate-500' };
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Quantitative Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Fonds Sécurisés par Preuve</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
            ${totalDisbursed.toLocaleString()} USD
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Sur {sites.length} chantiers en RDC
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Missions Certifiées Conformes</div>
          <div className="text-2xl font-bold font-mono text-emerald-700 mt-1 tabular-nums">
            {approvedCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Rapports scellés SHA-256 avec QR code
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Inspections en Attente QA</div>
          <div className="text-2xl font-bold font-mono text-amber-700 mt-1 tabular-nums">
            {pendingReviewCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Prêtes pour examen d'intégrité
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Anomalies en Remédiation</div>
          <div className="text-2xl font-bold font-mono text-rose-700 mt-1 tabular-nums">
            {needsReinspectionCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Blocage de paiement jusqu'à réinspection
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Rechercher par code mission, ouvrage, territoire, bailleur..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 bg-slate-50/50"
          />
        </div>

        {/* Status Filter Segmented Controls */}
        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-100 rounded-lg">
          {[
            { id: 'ALL', label: 'Toutes' },
            { id: 'QA_REVIEW', label: 'En Revue QA' },
            { id: 'APPROVED', label: 'Approuvées' },
            { id: 'NEEDS_REINSPECTION', label: 'À Réinspecter' },
            { id: 'OPEN', label: 'Ouvertes' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap cursor-pointer transition-colors ${
                statusFilter === tab.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* High-Density Data Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold tracking-wider uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Mission / Référence</th>
                <th className="py-3 px-4">Ouvrage & Localisation</th>
                <th className="py-3 px-4">Protocole PVS</th>
                <th className="py-3 px-4">Statut Preuve Terrain</th>
                <th className="py-3 px-4 text-right">Budget / Décaissement</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Aucune mission trouvée pour les critères sélectionnés.
                  </td>
                </tr>
              ) : (
                filteredMissions.map(mission => {
                  const status = getStatusDisplay(mission.status);
                  const inspection = inspections.find(i => i.id === mission.latestInspectionId);

                  return (
                    <tr
                      key={mission.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Mission Code */}
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-slate-900">{mission.code}</div>
                        <div className="text-[11px] text-slate-500">{mission.scheduledDate}</div>
                      </td>

                      {/* Site Info */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-semibold text-slate-900 truncate">{mission.site.name}</div>
                        <div className="text-[11px] text-slate-500">
                          {mission.site.province} · {mission.site.territory}
                        </div>
                      </td>

                      {/* Protocol */}
                      <td className="py-3 px-4">
                        <span className="font-mono font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                          {mission.protocolCode}
                        </span>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {mission.site.sector === 'WASH' ? 'Forage d’eau' : mission.site.sector === 'BTP' ? 'Génie civil' : 'Solaire'}
                        </div>
                      </td>

                      {/* Unboxed Metadata Status (Compliant with Zero-Pill Rule) */}
                      <td className="py-3 px-4">
                        <div className={`font-semibold ${status.color}`}>
                          {status.label}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {inspection ? (
                            <span>
                              {inspection.agentName} · Score: {inspection.qaScore ? `${inspection.qaScore}%` : 'En attente'}
                            </span>
                          ) : (
                            <span>Aucune inspection soumise</span>
                          )}
                        </div>
                      </td>

                      {/* Budget */}
                      <td className="py-3 px-4 text-right">
                        <div className="font-mono font-bold text-slate-900 tabular-nums">
                          ${mission.site.disbursedUsd.toLocaleString()}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                          Total: ${mission.site.budgetUsd.toLocaleString()}
                        </div>
                      </td>

                      {/* Action Links */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {inspection && inspection.status === 'APPROVED' && (
                            <button
                              onClick={() => onOpenReport(inspection.id)}
                              className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors cursor-pointer inline-flex items-center gap-1"
                              title="Consulter le rapport officiel vérifié"
                            >
                              <FileCheck className="w-3.5 h-3.5" />
                              <span>Rapport</span>
                            </button>
                          )}

                          <button
                            onClick={() => onSelectMission(mission.id)}
                            className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                          >
                            Détails QA
                          </button>

                          <button
                            onClick={() => onOpenMobile(mission.id)}
                            className="px-2 py-1 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer inline-flex items-center gap-1"
                            title="Ouvrir dans le terminal mobile de terrain"
                          >
                            <Smartphone className="w-3 h-3 text-slate-600" />
                            <span>Collecte</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
