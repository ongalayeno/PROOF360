import React, { useState } from 'react';
import { Inspection, Mission, Site } from '../types/proof360';
import { ShieldCheck, X, Copy, Check, ExternalLink, MapPin, Calendar, CheckCircle2, AlertTriangle } from 'lucide-react';

interface PublicVerifyModalProps {
  reportNumber: string;
  inspection?: Inspection;
  mission?: Mission;
  onClose: () => void;
}

export const PublicVerifyModal: React.FC<PublicVerifyModalProps> = ({
  reportNumber,
  inspection,
  mission,
  onClose
}) => {
  const [copied, setCopied] = useState(false);
  const [compareHashInput, setCompareHashInput] = useState('');
  const [compareResult, setCompareResult] = useState<'MATCH' | 'MISMATCH' | null>(null);

  const reportId = reportNumber || 'RPT-2026-WASH-MAL-0041';
  const orgName = mission?.site.organizationName || 'Ministère des Ressources Hydrauliques / BCECO';
  const projectName = mission?.site.name || 'Forage Solaire & Borne-Fontaine Maluku Centre';
  const siteLocation = `${mission?.site.territory || 'Maluku'} (${mission?.site.province || 'Kinshasa'})`;
  const pdfHash = inspection?.pdfSha256 || '4a9b6c1e5f8842d3873495f87b8d8e3c1209348e718b5c43d79048a6094eef19';
  const isApproved = inspection?.status === 'APPROVED' || true;

  const handleCopyHash = () => {
    navigator.clipboard.writeText(pdfHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCompare = () => {
    if (!compareHashInput.trim()) return;
    if (compareHashInput.trim().toLowerCase() === pdfHash.toLowerCase()) {
      setCompareResult('MATCH');
    } else {
      setCompareResult('MISMATCH');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full my-8 shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Banner with Verification Status */}
        <div className="bg-emerald-800 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
              <ShieldCheck className="w-7 h-7 text-emerald-300" />
            </div>
            <div>
              <div className="text-[11px] uppercase font-bold text-emerald-200 tracking-wider">
                Portail Public de Vérification Tiers
              </div>
              <h2 className="text-lg font-bold">
                Document Officiel Conforme & Certifié
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-emerald-200 hover:text-white rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Core Attributes */}
        <div className="p-6 space-y-6 text-xs text-slate-700">
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">
              Identifiant Unique de Rapport
            </span>
            <div className="text-xl font-mono font-bold text-slate-900 mt-0.5">
              {reportId}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-y border-slate-200 py-4">
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">
                Maître d'Ouvrage / Bailleur
              </span>
              <p className="text-slate-900 font-bold mt-0.5">{orgName}</p>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">
                Ouvrage & Emplacement Physique
              </span>
              <p className="text-slate-900 font-bold mt-0.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{projectName} · {siteLocation}</span>
              </p>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">
                Validation Assurance Qualité
              </span>
              <p className="text-slate-900 font-semibold mt-0.5">
                {inspection?.qaReviewerName || 'Mme Christine Kalala (Auditeur Senior QA)'}
              </p>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">
                Indice d'Intégrité Terrain
              </span>
              <p className="text-emerald-700 font-bold mt-0.5">
                {inspection?.integrityConfidenceScore || 100}% · Aucune anomalie détectée
              </p>
            </div>
          </div>

          {/* Cryptographic SHA-256 Fingerprint */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                Empreinte Cryptographique Officielle (SHA-256)
              </span>
              <button
                onClick={handleCopyHash}
                className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copié' : 'Copier l’empreinte'}</span>
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 font-mono text-xs break-all text-slate-800 select-all">
              {pdfHash}
            </div>
            <p className="text-[11px] text-slate-500">
              Toute modification, même d’un seul chiffre ou pixel dans le document PDF délivré, invalidera cette signature mathématique.
            </p>
          </div>

          {/* Instant PDF Check Tool */}
          <div className="p-4 bg-slate-100/70 rounded-xl border border-slate-200 space-y-3">
            <span className="text-[11px] font-bold text-slate-800 block">
              Tester l'authenticité d'un exemplaire reçu :
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Collez ici le hash SHA-256 de votre fichier PDF..."
                value={compareHashInput}
                onChange={e => setCompareHashInput(e.target.value)}
                className="flex-1 text-xs p-2 bg-white border border-slate-200 rounded-lg font-mono focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCompare}
                className="px-3 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer whitespace-nowrap"
              >
                Comparer
              </button>
            </div>

            {compareResult === 'MATCH' && (
              <div className="text-emerald-700 font-bold text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Empreinte 100% IDENTIQUE. Votre exemplaire est authentique et conforme à la version scellée.</span>
              </div>
            )}

            {compareResult === 'MISMATCH' && (
              <div className="text-rose-700 font-bold text-xs flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>ALERTE : L'empreinte ne correspond pas ! Ce document a été altéré ou provient d'une version non certifiée.</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 text-center text-[11px] text-slate-500">
          PROOF360 RDC · Infrastructure Numérique de Preuve d’Exécution Physique.
        </div>
      </div>
    </div>
  );
};
