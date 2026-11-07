import React from 'react';
import { Shield, Plus, Smartphone, CheckCircle, RefreshCw } from 'lucide-react';
import { UserRole } from '../types/proof360';
import { SyncStatusIndicator } from './SyncStatusIndicator';

export type AppTab = 
  | 'missions' 
  | 'map' 
  | 'qa' 
  | 'finance' 
  | 'health'
  | 'mining'
  | 'agri'
  | 'hydro'
  | 'env'
  | 'community' 
  | 'citizen_portal'
  | 'fleet' 
  | 'executive' 
  | 'audit' 
  | 'mobile';

interface HeaderProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  onOpenNewMission: () => void;
  pendingQACount: number;
  outboxCount: number;
  blockedPayoutsCount?: number;
  onManualSync?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewMission,
  pendingQACount,
  outboxCount,
  blockedPayoutsCount = 0,
  onManualSync
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Brand Wordmark (Single line, single element, no subtitle pill) */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white shadow-sm">
            <Shield className="w-4.5 h-4.5" />
          </div>
          <button 
            onClick={() => setActiveTab('missions')}
            className="text-left cursor-pointer focus-visible:outline-none"
          >
            <span className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap">
              PROOF360 <span className="text-emerald-700 font-extrabold">RDC</span>
            </span>
          </button>
        </div>

        {/* Zone 2: 5 Clean single-line text navigation links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab('missions')}
            className={`transition-colors whitespace-nowrap cursor-pointer pb-1 border-b-2 ${
              activeTab === 'missions' || activeTab === 'map'
                ? 'border-emerald-700 text-slate-900 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Missions & SIG
          </button>

          <button
            onClick={() => setActiveTab('qa')}
            className={`transition-colors whitespace-nowrap cursor-pointer pb-1 border-b-2 flex items-center gap-1.5 ${
              activeTab === 'qa'
                ? 'border-emerald-700 text-slate-900 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Revue QA</span>
            {pendingQACount > 0 && (
              <span className="text-xs font-mono font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                {pendingQACount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('finance')}
            className={`transition-colors whitespace-nowrap cursor-pointer pb-1 border-b-2 flex items-center gap-1.5 ${
              activeTab === 'finance' || activeTab === 'health' || activeTab === 'mining' || activeTab === 'agri' || activeTab === 'hydro' || activeTab === 'env'
                ? 'border-emerald-700 text-slate-900 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Décaissements & Secteurs</span>
            {blockedPayoutsCount > 0 && (
              <span className="text-xs font-mono font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">
                {blockedPayoutsCount} bloqué{blockedPayoutsCount > 1 ? 's' : ''}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('community')}
            className={`transition-colors whitespace-nowrap cursor-pointer pb-1 border-b-2 ${
              activeTab === 'community' || activeTab === 'citizen_portal' || activeTab === 'fleet'
                ? 'border-emerald-700 text-slate-900 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Citoyen & Logistique
          </button>

          <button
            onClick={() => setActiveTab('executive')}
            className={`transition-colors whitespace-nowrap cursor-pointer pb-1 border-b-2 ${
              activeTab === 'executive' || activeTab === 'audit'
                ? 'border-emerald-700 text-slate-900 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Exécutif & IATI
          </button>
        </nav>

        {/* Zone 3: Global Sync Indicator, Mobile Terminal Quick Switch & Primary Action */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <SyncStatusIndicator 
            outboxCount={outboxCount} 
            onManualSync={onManualSync} 
          />

          <button
            onClick={() => setActiveTab('mobile')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer border ${
              activeTab === 'mobile'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
            title="Simulateur Mobile Agent Hors-Ligne (P2P Mesh & TUS)"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-700" />
            <span className="hidden sm:inline">Terminal Terrain</span>
            {outboxCount > 0 && (
              <span className="text-xs font-mono font-semibold text-emerald-800 bg-emerald-100 px-1 rounded">
                {outboxCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenNewMission}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Nouvelle Mission</span>
          </button>
        </div>
      </div>
    </header>
  );
};
