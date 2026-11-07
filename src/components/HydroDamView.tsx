import React, { useState } from 'react';
import { 
  HydroAudit, 
  HydroTurbineUnit, 
  Site 
} from '../types/proof360';
import { 
  Zap, 
  Waves, 
  Activity, 
  Gauge, 
  AlertTriangle, 
  CheckCircle2, 
  Building2, 
  TrendingUp, 
  ShieldCheck, 
  Radio, 
  Plus, 
  Settings2, 
  Power, 
  RotateCcw, 
  Cable, 
  Home
} from 'lucide-react';

interface HydroDamViewProps {
  audits: HydroAudit[];
  sites: Site[];
  onToggleTurbineStatus?: (auditIndex: number, turbineId: string, status: HydroTurbineUnit['status']) => void;
  onUpdateFlowRate?: (auditIndex: number, newFlowRateLitersSec: number) => void;
}

export const HydroDamView: React.FC<HydroDamViewProps> = ({
  audits,
  sites,
  onToggleTurbineStatus,
  onUpdateFlowRate
}) => {
  const [selectedAuditIndex, setSelectedAuditIndex] = useState(0);
  const [subTab, setSubTab] = useState<'TURBINES' | 'WATER_FLOW' | 'GRID_METRICS'>('TURBINES');

  const activeAudit = audits[selectedAuditIndex] || audits[0];

  const totalCapacity = activeAudit?.installedCapacityKwTotal || 1400;
  const currentGen = activeAudit?.currentGenerationKwTotal || 1180;
  const genRatio = Math.round((currentGen / totalCapacity) * 100);

  const flowRate = activeAudit?.flowRateLitersSec || 1850;
  const minEcoFlow = activeAudit?.minEnvironmentalFlowLitersSec || 420;
  const isEcoFlowRespected = flowRate >= minEcoFlow;

  const onlineTurbinesCount = activeAudit?.turbines.filter(t => t.status === 'ONLINE_NOMINAL').length || 0;
  const totalTurbinesCount = activeAudit?.turbines.length || 0;

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold bg-cyan-50 text-cyan-900 border border-cyan-200 px-2 py-0.5 rounded">
                PROTOCOLE PVS-HYDRO-001
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-xs font-semibold text-slate-600">
                Électrification Rurale Hors-Réseau & Micro-Barrages
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-600" />
              <span>Module PVS-HYDRO : Micro-Barrages, Débit d'Étiage, Turbines & Réseau</span>
            </h1>
            <p className="text-xs text-slate-500 max-w-3xl leading-relaxed">
              Supervision technique des centrales hydroélectriques au fil de l'eau en milieu rural congolais (Nord-Kivu, Kasaï, Kongo-Central) : mesure continue du débit d'étiage écologique, statut vibratoire et thermique des turbines Pelton/Francis, et stabilité de distribution électrique (230V / 50 Hz).
            </p>
          </div>
        </div>

        {/* Central Selection Bar */}
        <div className="flex items-center gap-2 pt-4 overflow-x-auto text-xs">
          <span className="text-slate-500 font-semibold text-[11px] shrink-0">Micro-barrage actif :</span>
          {audits.map((aud, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedAuditIndex(idx)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                selectedAuditIndex === idx
                  ? 'bg-cyan-50 text-cyan-950 border border-cyan-300 shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-transparent'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-cyan-600" />
              <span>{aud.siteName.split('(')[0]}</span>
              <span className="font-mono text-[10px] text-slate-400">[{aud.province}]</span>
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Power Generation */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Puissance Injectée</span>
            </span>
            <span className="font-mono text-[10px] bg-amber-50 text-amber-900 px-1.5 py-0.5 rounded font-bold">
              {genRatio}% Capacité
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {currentGen} kW
            </span>
            <span className="text-xs text-slate-500 font-mono">
              / {totalCapacity} kW
            </span>
          </div>
          <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
            <span>Turbines en ligne :</span>
            <span className="font-bold text-slate-800">{onlineTurbinesCount}/{totalTurbinesCount} actives</span>
          </div>
        </div>

        {/* Card 2: Water Flow Rate */}
        <div className={`p-4 rounded-xl border shadow-xs space-y-2 ${
          isEcoFlowRespected ? 'bg-cyan-50/70 border-cyan-200' : 'bg-rose-50 border-rose-200'
        }`}>
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-700 flex items-center gap-1.5">
              <Waves className={`w-4 h-4 ${isEcoFlowRespected ? 'text-cyan-700' : 'text-rose-600'}`} />
              <span>Débit Hydrologique</span>
            </span>
            <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded font-bold ${
              isEcoFlowRespected ? 'bg-cyan-100 text-cyan-900' : 'bg-rose-100 text-rose-900'
            }`}>
              {isEcoFlowRespected ? 'DÉBIT NOMINAL' : 'ÉTIAGE SÉVÈRE'}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {flowRate.toLocaleString('fr-FR')} L/s
            </span>
            <span className="text-xs text-slate-500 font-mono">
              (Chute: {activeAudit?.headHeightMeters}m)
            </span>
          </div>
          <div className="text-[11px] text-slate-600 pt-1 border-t border-slate-200/60 flex items-center justify-between">
            <span>Étiage écologique min :</span>
            <span className="font-bold text-slate-700">{minEcoFlow} L/s</span>
          </div>
        </div>

        {/* Card 3: Grid Frequency & Voltage */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span className="flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-emerald-700" />
              <span>Stabilité Tension / Réseau</span>
            </span>
            <span className="font-mono text-[10px] bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
              {activeAudit?.gridMetrics.frequencyHz} Hz
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {activeAudit?.gridMetrics.voltagePhaseAcVolts} V
            </span>
            <span className="text-xs text-emerald-700 font-semibold font-mono">
              cos φ {activeAudit?.gridMetrics.powerFactorCosPhi}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
            <span>Micro-réseau villageois :</span>
            <span className="font-bold text-slate-800">{activeAudit?.gridMetrics.ruralMicrogridKm} km câblés</span>
          </div>
        </div>

        {/* Card 4: Connected Households */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span className="flex items-center gap-1.5">
              <Home className="w-4 h-4 text-blue-600" />
              <span>Ménages & PME Raccordés</span>
            </span>
            <span className="font-mono text-[10px] bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded font-bold">
              24h/24 Énergie
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {activeAudit?.gridMetrics.householdsConnected.toLocaleString('fr-FR')}
            </span>
            <span className="text-xs text-slate-500">foyers</span>
          </div>
          <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
            <span>Coupures / 30 jours :</span>
            <span className="font-bold text-emerald-700">{activeAudit?.gridMetrics.outagesLast30Days} interruption</span>
          </div>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 text-xs font-semibold">
        <button
          onClick={() => setSubTab('TURBINES')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
            subTab === 'TURBINES'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:text-slate-900'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span>Statut des Turbines & Alternateurs ({activeAudit?.turbines.length})</span>
        </button>

        <button
          onClick={() => setSubTab('WATER_FLOW')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
            subTab === 'WATER_FLOW'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:text-slate-900'
          }`}
        >
          <Waves className="w-3.5 h-3.5 text-cyan-400" />
          <span>Prise d'Eau, Conduite Forcée & Débit</span>
        </button>

        <button
          onClick={() => setSubTab('GRID_METRICS')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
            subTab === 'GRID_METRICS'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:text-slate-900'
          }`}
        >
          <Cable className="w-3.5 h-3.5 text-amber-400" />
          <span>Poste Transformateur & Distribution Réseau</span>
        </button>
      </div>

      {/* SUB-VIEW 1: TURBINES */}
      {subTab === 'TURBINES' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="border-b pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-cyan-600" />
                <span>Statut Mécanique, Pression d'Huile & Température des Paliers</span>
              </h3>
              <span className="text-[11px] text-slate-500">
                Salle des machines · Centrale de Mutwanga (Rivière Lume)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeAudit?.turbines.map(turb => (
              <div 
                key={turb.id}
                className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div>
                    <span className="font-bold text-slate-900 text-xs block">{turb.turbineCode}</span>
                    <span className="text-[11px] text-slate-500">Roue {turb.turbineType} · Vitesse : {turb.rpmSpeed} RPM</span>
                  </div>
                  <span className={`font-mono text-[10px] px-2 py-0.5 rounded font-bold ${
                    turb.status === 'ONLINE_NOMINAL' ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'
                  }`}>
                    {turb.status === 'ONLINE_NOMINAL' ? 'PRODUCTION CONTINUE' : 'ARRÊT TECHNIQUE'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2 bg-white rounded-lg border border-slate-200 space-y-1">
                    <span className="text-slate-500 text-[10px] block">Puissance Débitée</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">{turb.currentOutputKw} kW</span>
                    <span className="text-slate-400 text-[10px] block">Nominal : {turb.ratedCapacityKw} kW</span>
                  </div>

                  <div className="p-2 bg-white rounded-lg border border-slate-200 space-y-1">
                    <span className="text-slate-500 text-[10px] block">Température Palier</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">{turb.bearingTempCelsius}°C</span>
                    <span className="text-emerald-700 text-[10px] block font-semibold">&lt; 65°C toléré</span>
                  </div>

                  <div className="p-2 bg-white rounded-lg border border-slate-200 space-y-1">
                    <span className="text-slate-500 text-[10px] block">Pression d'Huile</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">{turb.oilPressureBar} bar</span>
                    <span className="text-slate-400 text-[10px] block">Régulateur hydraulique</span>
                  </div>

                  <div className="p-2 bg-white rounded-lg border border-slate-200 space-y-1">
                    <span className="text-slate-500 text-[10px] block">Niveau Vibrations</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">{turb.vibrationLevelMmSec} mm/s</span>
                    <span className="text-emerald-700 text-[10px] block font-semibold">ISO 10816 Conforme</span>
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    onClick={() => onToggleTurbineStatus && onToggleTurbineStatus(
                      selectedAuditIndex, 
                      turb.id, 
                      turb.status === 'ONLINE_NOMINAL' ? 'MAINTENANCE_REQUIRED' : 'ONLINE_NOMINAL'
                    )}
                    className="px-3 py-1.5 text-xs font-semibold border rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    {turb.status === 'ONLINE_NOMINAL' ? 'Déclencher Maintenance' : 'Rétablir Production'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: WATER FLOW & HYDROLOGY */}
      {subTab === 'WATER_FLOW' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="border-b pb-3">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Waves className="w-4 h-4 text-cyan-600" />
              <span>Hydrologie, Prise d'Eau & Intégrité de la Conduite Forcée</span>
            </h3>
            <span className="text-[11px] text-slate-500">
              Débit de la rivière Lume (Beni / Virunga) avec respect de la réserve environnementale
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="font-bold text-slate-900 flex items-center justify-between">
                <span>Contrôle Débit Actuel</span>
                <span className="font-mono font-bold text-cyan-800 text-sm">{flowRate} L/s</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Le débit turbiné est capté en amont avec déviation dans une chambre de mise en charge. Le débit d'étiage de réserve écologique garanti est de <strong>{minEcoFlow} L/s</strong>.
              </p>

              <div className="pt-2 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Ajuster débit d'essai :</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => onUpdateFlowRate && onUpdateFlowRate(selectedAuditIndex, Math.max(300, flowRate - 200))}
                    className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded font-mono font-bold cursor-pointer"
                  >
                    -200 L/s
                  </button>
                  <button
                    onClick={() => onUpdateFlowRate && onUpdateFlowRate(selectedAuditIndex, flowRate + 200)}
                    className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded font-mono font-bold cursor-pointer"
                  >
                    +200 L/s
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Ouvrages de Génie Civil Hydraulique</span>
              </div>
              <div className="space-y-1.5 text-slate-600">
                <div className="flex justify-between">
                  <span>Conduite forcée acier :</span>
                  <strong className="text-emerald-800">{activeAudit?.penstockStatus}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Dégrilleur prise d'eau :</span>
                  <strong className="text-emerald-800">{activeAudit?.debrisTrashRackClean ? 'Nettoyé (Zéro embâcle)' : 'Obstrué'}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Hauteur de chute brute :</span>
                  <strong className="text-slate-900">{activeAudit?.headHeightMeters} mètres</strong>
                </div>
                <div className="flex justify-between">
                  <span>Score d'audit hydraulique :</span>
                  <strong className="text-emerald-700">{activeAudit?.complianceScorePercent}%</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: GRID METRICS */}
      {subTab === 'GRID_METRICS' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="border-b pb-3">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Cable className="w-4 h-4 text-amber-500" />
              <span>Paramètres Électriques & Réseau de Distribution Rurale</span>
            </h3>
            <span className="text-[11px] text-slate-500">
              Réseau moyenne / basse tension 230V desservant les localités de Mutwanga et environs
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <span className="text-slate-500 font-semibold text-[11px]">Fréquence Électrique</span>
              <div className="text-2xl font-bold font-mono text-slate-900">
                {activeAudit?.gridMetrics.frequencyHz} Hz
              </div>
              <span className="text-emerald-700 text-[10px] font-semibold block">Nominal : 50.00 Hz (± 0.2%)</span>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <span className="text-slate-500 font-semibold text-[11px]">Facteur de Puissance (cos φ)</span>
              <div className="text-2xl font-bold font-mono text-slate-900">
                {activeAudit?.gridMetrics.powerFactorCosPhi}
              </div>
              <span className="text-emerald-700 text-[10px] font-semibold block">Régulation automatique banc condensateurs</span>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <span className="text-slate-500 font-semibold text-[11px]">Sous-Station Transformateur</span>
              <div className="text-base font-bold text-emerald-800">
                {activeAudit?.gridMetrics.transformerSubstationStatus}
              </div>
              <span className="text-slate-500 text-[10px] block">Poste élévateur 400V / 15 kV</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
