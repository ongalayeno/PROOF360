import React, { useState } from 'react';
import { Mission, Inspection, Site, Anomaly } from '../types/proof360';
import { PROTOCOLS } from '../data/protocols';
import { ShieldCheck, AlertTriangle, Check, X, FileText, MapPin, Smartphone, Hash, ArrowLeft, RefreshCw } from 'lucide-react';
import { sha256 } from '../services/integrityEngine';

interface QAReviewWorkbenchProps {
  mission: Mission;
  inspection?: Inspection;
  onBack: () => void;
  onApprove: (inspectionId: string, qaScore: number, qaNotes: string) => Promise<void>;
  onReject: (inspectionId: string, reason: string) => Promise<void>;
  onDeclareAnomaly: (inspectionId: string, title: string, severity: 'HIGH' | 'CRITICAL', notes: string) => Promise<void>;
  onOpenReport: (inspectionId: string) => void;
}

export const QAReviewWorkbench: React.FC<QAReviewWorkbenchProps> = ({
  mission,
  inspection,
  onBack,
  onApprove,
  onReject,
  onDeclareAnomaly,
  onOpenReport
}) => {
  const [qaScore, setQaScore] = useState<number>(inspection?.qaScore || 95);
  const [qaNotes, setQaNotes] = useState<string>(
    inspection?.qaNotes || 'Preuves géolocalisées cohérentes et conformes aux spécifications PVS.'
  );
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAnomalyModal, setShowAnomalyModal] = useState(false);
  const [anomalyTitle, setAnomalyTitle] = useState('Non-conformité détectée lors de la revue');
  const [anomalySeverity, setAnomalySeverity] = useState<'HIGH' | 'CRITICAL'>('HIGH');
  const [anomalyDescription, setAnomalyDescription] = useState('');

  const protocol = PROTOCOLS[mission.protocolCode];

  if (!inspection) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
          <FileText className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">Aucune inspection soumise</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            L'agent de terrain n'a pas encore transmis de données synchronisées pour la mission {mission.code}.
          </p>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
        >
          Retour aux missions
        </button>
      </div>
    );
  }

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await onApprove(inspection.id, qaScore, qaNotes);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason) return;
    setIsSubmitting(true);
    try {
      await onReject(inspection.id, rejectionReason);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateAnomaly = async () => {
    if (!anomalyDescription) return;
    setIsSubmitting(true);
    try {
      await onDeclareAnomaly(inspection.id, anomalyTitle, anomalySeverity, anomalyDescription);
      setShowAnomalyModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation Strip */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            title="Retour"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
              <span>{mission.code}</span>
              <span>·</span>
              <span>{mission.protocolCode}</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Revue d’Assurance Qualité (QA Reviewer)
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {inspection.status === 'APPROVED' ? (
            <button
              onClick={() => onOpenReport(inspection.id)}
              className="px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Consulter Rapport Certifié</span>
            </button>
          ) : (
            <button
              onClick={() => setShowAnomalyModal(true)}
              className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Ouvrir une Anomalie</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Review Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Evidence Photos & Integrity Proofs */}
        <div className="lg:col-span-7 space-y-6">
          {/* Metadata & Terminal Proof Banner */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-semibold text-slate-800">Agent Collecteur</span>
              <span className="font-medium text-slate-700">{inspection.agentName}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-500">Terminal Matériel</span>
                <p className="font-mono text-slate-800">{inspection.deviceMetadata.deviceModel}</p>
              </div>
              <div>
                <span className="text-slate-500">Système & Réseau</span>
                <p className="font-mono text-slate-800">{inspection.deviceMetadata.osVersion} · {inspection.deviceMetadata.networkType}</p>
              </div>
              <div>
                <span className="text-slate-500">Clé d'Idempotence</span>
                <p className="font-mono text-[10px] text-slate-600 truncate">{inspection.syncIdempotencyKey}</p>
              </div>
              <div>
                <span className="text-slate-500">Horodatage Capture</span>
                <p className="font-mono text-slate-800">{new Date(inspection.clientSubmittedAt).toLocaleString('fr-FR')}</p>
              </div>
            </div>
          </div>

          {/* Photographic Evidence Items */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Preuves Photographiques & Empreintes SHA-256
            </h3>

            {inspection.responses
              .filter(r => r.evidence)
              .map((r, idx) => {
                const ev = r.evidence!;
                return (
                  <div key={ev.id || idx} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                    {/* Photo with Overlay */}
                    <div className="relative aspect-video bg-slate-950">
                      <img
                        src={ev.imageUrl}
                        alt="Preuve d'inspection"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent p-3 text-white">
                        <div className="text-xs font-semibold">Champ: {ev.fieldId}</div>
                        <div className="text-[11px] opacity-80 flex items-center gap-3 font-mono">
                          <span>Lat: {ev.coordinates.lat.toFixed(4)}</span>
                          <span>Lng: {ev.coordinates.lng.toFixed(4)}</span>
                          <span>Précision: ±{ev.accuracyMeters}m</span>
                        </div>
                      </div>
                    </div>

                    {/* Cryptographic & Geofence Verification Strip */}
                    <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Contrôle Anti-Mock GPS</span>
                        <span className="font-mono font-semibold text-emerald-700 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          {ev.isMockGps ? 'ALERTE MOCK DÉTECTÉ' : 'Authentifié Matériel (0 Mock)'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Proximité au Site Contractuel</span>
                        <span className="font-mono font-semibold text-emerald-700">
                          {ev.distanceToSiteMeters}m du centre (Tolérance: {mission.site.geofenceRadiusMeters}m)
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-500 font-medium block">Empreinte SHA-256 Inviolable</span>
                        <div className="mt-1 p-2 bg-white rounded border border-slate-200 font-mono text-[10px] break-all text-slate-700 select-all">
                          {ev.fileHashSha256}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Right Column: PVS Responses & QA Decision Card */}
        <div className="lg:col-span-5 space-y-6">
          {/* PVS Form Audit Checklist */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Réponses du Protocole {mission.protocolCode}
            </h3>

            <div className="space-y-3">
              {inspection.responses.map((resp, i) => (
                <div key={resp.fieldId || i} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                  <div className="text-slate-500 text-[11px] font-mono">{resp.fieldId}</div>
                  <div className="font-semibold text-slate-900 mt-0.5">
                    {typeof resp.value === 'boolean'
                      ? resp.value ? 'Oui / Conforme' : 'Non / Défaillant'
                      : String(resp.value)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* QA Decision Panel */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                Décision de Certification QA
              </h3>
              <span className={`text-xs font-semibold ${
                inspection.status === 'APPROVED' ? 'text-emerald-700' : 'text-amber-700'
              }`}>
                Statut: {inspection.status}
              </span>
            </div>

            {/* QA Score Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Score de Rigueur / Qualité</span>
                <span className="font-mono font-bold text-slate-900">{qaScore}/100</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={qaScore}
                onChange={e => setQaScore(Number(e.target.value))}
                className="w-full accent-emerald-700"
                disabled={inspection.status === 'APPROVED'}
              />
            </div>

            {/* QA Reviewer Notes */}
            <div className="space-y-1">
              <label className="text-xs text-slate-600 font-medium block">
                Observations de l'Ingénieur QA
              </label>
              <textarea
                rows={3}
                value={qaNotes}
                onChange={e => setQaNotes(e.target.value)}
                disabled={inspection.status === 'APPROVED'}
                placeholder="Indiquez les constats de conformité, points de réserve ou éléments notables..."
                className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
              />
            </div>

            {/* Actions */}
            {inspection.status !== 'APPROVED' ? (
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleApprove}
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isSubmitting ? 'Scellement cryptographique...' : 'Valider & Sceller le Rapport'}</span>
                </button>

                <div className="pt-2 border-t border-slate-100">
                  <input
                    type="text"
                    value={rejectionReason}
                    onChange={e => setRejectionReason(e.target.value)}
                    placeholder="Motif technique de rejet..."
                    className="w-full text-xs p-2 border border-slate-200 rounded-lg mb-2"
                  />
                  <button
                    onClick={handleReject}
                    disabled={isSubmitting || !rejectionReason}
                    className="w-full py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
                  >
                    Rejeter l'inspection
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs space-y-1">
                <div className="font-semibold text-emerald-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  Rapport Officiellement Scellé & Immuable
                </div>
                <div className="text-[11px] text-emerald-700 font-mono">
                  Réf: {inspection.reportNumber}
                </div>
                <div className="text-[10px] text-emerald-600 font-mono break-all">
                  SHA256: {inspection.pdfSha256}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Anomaly Declaration Modal */}
      {showAnomalyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4 border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">
              Déclarer une Anomalie Majeure
            </h3>
            <p className="text-xs text-slate-500">
              Ceci bloquera le jalon de décaissement du marché et émettra un ordre de réinspection à l’entreprise.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-600 font-medium block mb-1">Titre de l'anomalie</label>
                <input
                  type="text"
                  value={anomalyTitle}
                  onChange={e => setAnomalyTitle(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="text-xs text-slate-600 font-medium block mb-1">Gravité</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAnomalySeverity('HIGH')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md border ${
                      anomalySeverity === 'HIGH' ? 'bg-amber-50 border-amber-300 text-amber-900' : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Élevée (HIGH)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnomalySeverity('CRITICAL')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md border ${
                      anomalySeverity === 'CRITICAL' ? 'bg-rose-50 border-rose-300 text-rose-900' : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Critique (CRITICAL)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-600 font-medium block mb-1">Description technique</label>
                <textarea
                  rows={3}
                  value={anomalyDescription}
                  onChange={e => setAnomalyDescription(e.target.value)}
                  placeholder="Ex: Fissuration de la dalle, débit sous le seuil critique..."
                  className="w-full text-xs p-2 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAnomalyModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleCreateAnomaly}
                disabled={!anomalyDescription || isSubmitting}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-lg disabled:opacity-50"
              >
                Confirmer l'Anomalie
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
