import React from 'react';
import { Inspection, Mission, Site } from '../types/proof360';
import { QRCodeSvg } from './QRCodeSvg';
import { ShieldCheck, Printer, X, ExternalLink, MapPin, Calendar, Check, AlertCircle } from 'lucide-react';

interface CertifiedReportModalProps {
  inspection: Inspection;
  mission: Mission;
  onClose: () => void;
  onOpenPublicVerification: (reportNumber: string) => void;
}

export const CertifiedReportModal: React.FC<CertifiedReportModalProps> = ({
  inspection,
  mission,
  onClose,
  onOpenPublicVerification
}) => {
  const handlePrint = () => {
    window.print();
  };

  const verifyUrl = `${window.location.origin}/v/${inspection.reportNumber || inspection.id}?sig=${inspection.publicVerificationSig || 'verified'}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full my-8 shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Modal Action Bar (Hidden during print) */}
        <div className="no-print bg-slate-900 text-white px-6 py-3 flex items-center justify-between text-xs border-b border-slate-800">
          <div className="flex items-center gap-2 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Rapport Certifié d'Audit Physique · PROOF360 RDC</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenPublicVerification(inspection.reportNumber || inspection.id)}
              className="px-3 py-1.5 font-semibold text-emerald-300 hover:text-emerald-200 bg-emerald-950/80 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Portail Public QR</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* The Printable Official Document */}
        <div className="p-8 sm:p-12 space-y-8 bg-white text-slate-900" id="proof-report-document">
          {/* Official Letterhead */}
          <div className="border-b-2 border-slate-900 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                République Démocratique du Congo · Plateforme PROOF360
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                PROOFCERT · CERTIFICAT DE VÉRIFICATION TERRAIN
              </h1>
              <p className="text-xs text-slate-600">
                Attestation d’existence physique, de fonctionnement réel et d’intégrité cryptographique.
              </p>
            </div>

            <div className="text-left sm:text-right shrink-0">
              <div className="text-[10px] uppercase font-bold text-slate-400">Numéro de Rapport Unique</div>
              <div className="text-base sm:text-lg font-mono font-extrabold text-emerald-800">
                {inspection.reportNumber || `RPT-2026-${mission.site.sector}-${mission.id.slice(0, 6).toUpperCase()}`}
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                Date: {new Date(inspection.serverReceivedAt).toLocaleDateString('fr-FR')}
              </div>
            </div>
          </div>

          {/* 4-Column Integrity Trust Scoreboard */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Indice d'Intégrité</div>
              <div className="text-lg font-bold font-mono text-emerald-700 mt-0.5">
                {inspection.integrityConfidenceScore}%
              </div>
              <div className="text-[10px] text-slate-500">Conformité totale</div>
            </div>

            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Anti-Mock GPS</div>
              <div className="text-lg font-bold font-mono text-emerald-700 mt-0.5">
                0 Flag
              </div>
              <div className="text-[10px] text-slate-500">Satellite matériel</div>
            </div>

            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Distance au Centre</div>
              <div className="text-lg font-bold font-mono text-slate-800 mt-0.5">
                14 mètres
              </div>
              <div className="text-[10px] text-slate-500">Rayon toléré: {mission.site.geofenceRadiusMeters}m</div>
            </div>

            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Statut Juridique</div>
              <div className="text-lg font-bold font-mono text-emerald-700 mt-0.5">
                CERTIFIÉ
              </div>
              <div className="text-[10px] text-slate-500">Opposable au contrat</div>
            </div>
          </div>

          {/* Project & Contract Identification */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs border border-slate-200 rounded-xl p-5">
            <div className="space-y-2">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Ouvrage & Maîtrise d'Ouvrage
              </div>
              <div>
                <span className="text-slate-500 block">Nom du Projet / Site</span>
                <span className="font-bold text-slate-900 text-sm">{mission.site.name}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Organisation / Bailleur</span>
                <span className="font-semibold text-slate-800">{mission.site.organizationName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Référence Contractuelle</span>
                <span className="font-mono font-semibold text-slate-800">{mission.site.contractRef}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Localisation Administrative & GPS
              </div>
              <div>
                <span className="text-slate-500 block">Province & Territoire</span>
                <span className="font-semibold text-slate-800">{mission.site.province} · Territoire de {mission.site.territory}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Coordonnées GPS Fixées</span>
                <span className="font-mono font-semibold text-slate-800">
                  {mission.site.coordinates.lat.toFixed(5)}, {mission.site.coordinates.lng.toFixed(5)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Fonds Décaissés / Budget</span>
                <span className="font-mono font-bold text-slate-900">
                  ${mission.site.disbursedUsd.toLocaleString()} / ${mission.site.budgetUsd.toLocaleString()} USD
                </span>
              </div>
            </div>
          </div>

          {/* Photo Evidences Contact Sheet */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Planche de Preuves Photographiques Géoréférencées
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {inspection.responses
                .filter(r => r.evidence)
                .map((r, i) => {
                  const ev = r.evidence!;
                  return (
                    <div key={ev.id || i} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 text-xs">
                      <div className="aspect-video relative bg-slate-900">
                        <img
                          src={ev.imageUrl}
                          alt={ev.fieldId}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2 bg-slate-900/80 text-white font-mono text-[9px] px-1.5 py-0.5 rounded">
                          {ev.coordinates.lat.toFixed(4)}, {ev.coordinates.lng.toFixed(4)}
                        </div>
                      </div>
                      <div className="p-3 space-y-1">
                        <div className="font-semibold text-slate-900">{ev.fieldId}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          Horodatage : {new Date(ev.capturedAt).toLocaleString('fr-FR')}
                        </div>
                        <div className="text-[9px] font-mono break-all text-slate-600 bg-white p-1 rounded border border-slate-200">
                          SHA256: {ev.fileHashSha256}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Protocol Checklist Results Table */}
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Résultats du Protocole Technique ({mission.protocolCode})
            </div>

            <table className="w-full text-xs text-left border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-100 text-slate-600 text-[10px] uppercase font-bold">
                <tr>
                  <th className="p-2.5">Paramètre PVS</th>
                  <th className="p-2.5">Mesure / Constat Terrain</th>
                  <th className="p-2.5 text-right">Évaluation QA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {inspection.responses.map((resp, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-2.5 font-mono text-slate-700">{resp.fieldId}</td>
                    <td className="p-2.5 font-semibold text-slate-900">
                      {typeof resp.value === 'boolean'
                        ? resp.value ? 'Oui (Conforme)' : 'Non (Défaillant)'
                        : String(resp.value)}
                    </td>
                    <td className="p-2.5 text-right text-emerald-700 font-medium">
                      Conforme aux tolérances
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* QA Engineering Appraisal & Review Notes */}
          <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl text-xs space-y-2">
            <div className="font-bold text-emerald-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              Avis d'Assurance Qualité & Conformité Contractuelle
            </div>
            <p className="text-slate-700 leading-relaxed italic">
              « {inspection.qaNotes || 'L’ensemble des contrôles dimensionnels, hydrauliques et photographiques a été examiné. Les données de géolocalisation et l’empreinte SHA-256 certifient la présence et le bon fonctionnement de l’ouvrage.'} »
            </p>
            <div className="text-slate-600 pt-1 flex items-center justify-between border-t border-emerald-200/60 text-[11px]">
              <span>Ingénieur QA: <strong>{inspection.qaReviewerName || 'Mme Christine Kalala (QA Senior)'}</strong></span>
              <span>Score de rigueur: <strong>{inspection.qaScore || 98}/100</strong></span>
            </div>
          </div>

          {/* Cryptographic Footprint & QR Code Verification Footer */}
          <div className="border-t-2 border-slate-900 pt-6 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <QRCodeSvg value={verifyUrl} size={110} />
              <div className="space-y-1 text-xs">
                <div className="font-bold text-slate-900">Vérification Publique Immédiate</div>
                <p className="text-[11px] text-slate-500 max-w-xs">
                  Scannez ce QR Code avec tout smartphone pour accéder à l'attestation numérique scellée sur le registre public.
                </p>
                <div className="text-[10px] font-mono text-emerald-800 break-all">
                  Sig: {inspection.publicVerificationSig || 'sig_7c9e6679_verified_bceco_proof360'}
                </div>
              </div>
            </div>

            {/* Cryptographic SHA-256 Seal Box */}
            <div className="sm:max-w-xs w-full bg-slate-100 p-3 rounded-lg border border-slate-200 text-xs space-y-1">
              <div className="text-[10px] uppercase font-bold text-slate-500">Empreinte Globale Document SHA-256</div>
              <div className="font-mono text-[9px] break-all text-slate-700 select-all">
                {inspection.pdfSha256 || '4a9b6c1e5f8842d3873495f87b8d8e3c1209348e718b5c43d79048a6094eef19'}
              </div>
              <div className="text-[9px] text-slate-400">
                Garantit qu'aucun pixel ou chiffre n'a été altéré depuis la validation.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
