import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';

interface SyncStatusIndicatorProps {
  outboxCount: number;
  onManualSync?: () => void;
  lastSyncTime?: string;
}

export const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({
  outboxCount,
  onManualSync,
  lastSyncTime = 'Il y a 2 min'
}) => {
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleTriggerSync = () => {
    if (!isOnline) return;
    setIsSyncing(true);
    if (onManualSync) {
      onManualSync();
    }
    setTimeout(() => {
      setIsSyncing(false);
      setIsOpen(false);
    }, 1200);
  };

  return (
    <div className="relative inline-block text-left">
      {/* Indicator Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer select-none ${
          !isOnline 
            ? 'bg-amber-50 text-amber-900 border-amber-300' 
            : outboxCount > 0
              ? 'bg-blue-50 text-blue-900 border-blue-200'
              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
        }`}
        title={
          !isOnline
            ? `Hors-Ligne: ${outboxCount} lot(s) d'inspection en attente de synchronisation locale`
            : outboxCount > 0
              ? `${outboxCount} lot(s) d'inspection prêts pour l'envoi vers le backend`
              : 'Connecté au serveur PROOF360 RDC'
        }
      >
        <span className="relative flex h-2 w-2">
          {!isOnline ? (
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          ) : outboxCount > 0 ? (
            <>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
            </>
          ) : (
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          )}
        </span>

        {/* Icon & Label */}
        {!isOnline ? (
          <>
            <WifiOff className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden xl:inline text-[11px] font-semibold">Hors-Ligne</span>
          </>
        ) : (
          <>
            <Wifi className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden xl:inline text-[11px]">En Ligne</span>
          </>
        )}

        {/* Queued Count Pill */}
        {outboxCount > 0 && (
          <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-900 text-white">
            {outboxCount}
          </span>
        )}
      </button>

      {/* Flyout Drawer / Modal */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                <span className="font-bold text-slate-900">
                  {isOnline ? 'Connectivité Backend Active' : 'Mode Terrain Hors-Ligne (RDC)'}
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                {isOnline ? 'HTTPS / TUS 2.0' : 'Stockage Local Chiffré'}
              </span>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-lg space-y-1.5 border border-slate-100">
              <div className="flex justify-between text-slate-600">
                <span>Lots d'inspection en attente :</span>
                <span className="font-mono font-bold text-slate-900">{outboxCount} lot(s)</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Protocole de transport :</span>
                <span className="font-mono text-slate-700">TUS Résumable (512 Ko)</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Dernière synchro réussie :</span>
                <span className="text-slate-700">{lastSyncTime}</span>
              </div>
            </div>

            {outboxCount > 0 ? (
              <div className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2.5 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  {isOnline 
                    ? `${outboxCount} rapport(s) scellé(s) localement attendent l'envoi vers le serveur central de Kinshasa.`
                    : `Connexion coupée. Vos ${outboxCount} rapport(s) restent scellés avec signature cryptographique locale (Android Keystore / Secure Enclave). Ils seront transférés dès le rétablissement de la connexion ou via Mesh P2P.`}
                </p>
              </div>
            ) : (
              <div className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Toutes les données de terrain sont synchronisées avec le registre national.</span>
              </div>
            )}

            <div className="pt-1 flex items-center justify-between gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsOnline(!isOnline)}
                className="text-[10px] text-slate-500 hover:text-slate-800 underline cursor-pointer"
              >
                Simuler {!isOnline ? 'Connexion' : 'Coupure Réseau'}
              </button>

              <button
                disabled={!isOnline || isSyncing || outboxCount === 0}
                onClick={handleTriggerSync}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 rounded-lg transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Envoi...' : 'Synchroniser'}</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
