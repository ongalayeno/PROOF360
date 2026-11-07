import React, { useState } from 'react';
import { 
  AgriProjectAudit, 
  SiloStorageReading, 
  MillingMachineItem, 
  Site 
} from '../types/proof360';
import { 
  Wheat, 
  Droplets, 
  Cog, 
  Map, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Building2, 
  Search, 
  Truck, 
  Calendar, 
  Activity, 
  RotateCcw, 
  X, 
  Thermometer, 
  ShieldAlert, 
  Sparkles
} from 'lucide-react';

interface AgriProjectViewProps {
  audits: AgriProjectAudit[];
  sites: Site[];
  onAddSiloReading?: (auditIndex: number, silo: SiloStorageReading) => void;
  onToggleMachineStatus?: (auditIndex: number, machineId: string, isOperational: boolean) => void;
  onUpdateSiloMoisture?: (auditIndex: number, siloId: string, newMoisture: number) => void;
}

export const AgriProjectView: React.FC<AgriProjectViewProps> = ({
  audits,
  sites,
  onAddSiloReading,
  onToggleMachineStatus,
  onUpdateSiloMoisture
}) => {
  const [selectedAuditIndex, setSelectedAuditIndex] = useState(0);
  const [subTab, setSubTab] = useState<'SILOS' | 'MACHINERY' | 'HECTARES'>('SILOS');
  const [showAddSiloModal, setShowAddSiloModal] = useState(false);

  // Form states for new silo
  const [newSiloName, setNewSiloName] = useState('');
  const [newGrainType, setNewGrainType] = useState<SiloStorageReading['grainType']>('MAIS');
  const [newCapacity, setNewCapacity] = useState(200);
  const [newStock, setNewStock] = useState(150);
  const [newMoisture, setNewMoisture] = useState(12.5);
  const [newTemp, setNewTemp] = useState(25.0);
  const [newPestCondition, setNewPestCondition] = useState<SiloStorageReading['pestProofCondition']>('PARFAITE_ETANCHEITE');

  const activeAudit = audits[selectedAuditIndex] || audits[0];

  // Silo metrics
  const totalSilosCount = activeAudit?.silos.length || 0;
  const safeSilosCount = activeAudit?.silos.filter(s => s.isMoistureSafe).length || 0;
  const avgMoisture = totalSilosCount > 0 
    ? Math.round((activeAudit?.silos.reduce((acc, s) => acc + s.moisturePercent, 0) / totalSilosCount) * 10) / 10 
    : 12.0;

  // Machinery metrics
  const totalMachines = activeAudit?.millingMachines.length || 0;
  const operationalMachines = activeAudit?.millingMachines.filter(m => m.isOperational).length || 0;

  const handleCreateSilo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSiloName || !onAddSiloReading) return;

    onAddSiloReading(selectedAuditIndex, {
      siloId: `silo-${Date.now()}`,
      siloName: newSiloName,
      grainType: newGrainType,
      capacityMetricTons: Number(newCapacity),
      currentStockMetricTons: Number(newStock),
      moisturePercent: Number(newMoisture),
      isMoistureSafe: Number(newMoisture) <= 13.5,
      temperatureInsideCelsius: Number(newTemp),
      pestProofCondition: newPestCondition,
      lastMoistureSensorCalibrated: new Date().toISOString().split('T')[0]
    });

    setShowAddSiloModal(false);
    setNewSiloName('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold bg-emerald-50 text-emerald-900 border border-emerald-200 px-2 py-0.5 rounded">
                PROTOCOLE PVS-AGRI-001
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-xs font-semibold text-slate-600">
                Sécurité Alimentaire · Chaînes de Valeurs & Greniers Vivriers
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Wheat className="w-5 h-5 text-emerald-600" />
              <span>Module PVS-AGRI : Silos Vivriers, Décortiqueuses & Parcelles Emblavées</span>
            </h1>
            <p className="text-xs text-slate-500 max-w-3xl leading-relaxed">
              Suivi normé des projets agro-pastoraux (BAD, PAM, FIDA) : contrôle télémétrique de l'humidité des grains dans les silos ($\le 13,5\%$), fonctionnement physique des moulins/décortiqueuses, audit GPS des superficies emblavées (hectares) et praticabilité des pistes de desserte.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {subTab === 'SILOS' && (
              <button
                onClick={() => setShowAddSiloModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter un Silo</span>
              </button>
            )}
          </div>
        </div>

        {/* Project Selector Bar */}
        <div className="flex items-center gap-2 pt-4 overflow-x-auto text-xs">
          <span className="text-slate-500 font-semibold text-[11px] shrink-0">Bassin agricole :</span>
          {audits.map((aud, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedAuditIndex(idx)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                selectedAuditIndex === idx
                  ? 'bg-emerald-50 text-emerald-950 border border-emerald-300 shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-transparent'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{aud.siteName.split('(')[0]}</span>
              <span className="font-mono text-[10px] text-slate-400">[{aud.province}]</span>
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Silo Moisture */}
        <div className={`p-4 rounded-xl border shadow-xs space-y-2 ${
          avgMoisture <= 13.5
            ? 'bg-emerald-50/70 border-emerald-200'
            : 'bg-rose-50 border-rose-200'
        }`}>
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-700 flex items-center gap-1.5">
              <Droplets className={`w-4 h-4 ${avgMoisture <= 13.5 ? 'text-emerald-700' : 'text-rose-600'}`} />
              <span>Humidité Moyenne Silos</span>
            </span>
            <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded font-bold ${
              avgMoisture <= 13.5 ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'
            }`}>
              {avgMoisture <= 13.5 ? 'ZONE SÉCURISÉE' : 'RISQUE AFLATOXINE'}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {avgMoisture}%
            </span>
            <span className="text-xs text-slate-500 font-mono">
              (Seuil max : 13.5%)
            </span>
          </div>
          <div className="text-[11px] text-slate-600 pt-1 border-t border-slate-200/60 flex items-center justify-between">
            <span>{safeSilosCount}/{totalSilosCount} silos conformes</span>
            <span className="font-bold text-slate-700">Stockage sain</span>
          </div>
        </div>

        {/* Card 2: Hectares Planted */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span className="flex items-center gap-1.5">
              <Map className="w-4 h-4 text-emerald-700" />
              <span>Surfaces Emblavées (Hectares)</span>
            </span>
            <span className="font-mono text-[10px] bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
              GPS PostGIS
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {activeAudit?.hectaresVerifiedGps.toLocaleString('fr-FR')} ha
            </span>
            <span className="text-xs text-slate-500">
              / {activeAudit?.hectaresTotalPlanted} ha
            </span>
          </div>
          <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
            <span>Rendement estimé :</span>
            <span className="font-bold text-slate-800">{activeAudit?.cropYieldEstimateTonsPerHectare} T/ha</span>
          </div>
        </div>

        {/* Card 3: Machinery Functionality */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span className="flex items-center gap-1.5">
              <Cog className="w-4 h-4 text-amber-600" />
              <span>Moulins & Décortiqueuses</span>
            </span>
            <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded font-bold ${
              operationalMachines === totalMachines ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'
            }`}>
              {operationalMachines}/{totalMachines} OPÉRATIONNELS
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {Math.round((operationalMachines / (totalMachines || 1)) * 100)}%
            </span>
            <span className="text-xs text-slate-500">disponibilité</span>
          </div>
          <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
            <span>Énergie : Solaire / Diesel</span>
            <span className="font-mono text-slate-700">{activeAudit?.cooperativeName.split(' ')[0]}</span>
          </div>
        </div>

        {/* Card 4: Feeder Road Condition */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-blue-600" />
              <span>Piste de Desserte Agricole</span>
            </span>
            <span className="font-mono text-[10px] bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded font-bold">
              {activeAudit?.feederRoadDistanceKm} km
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-slate-900 truncate">
              {activeAudit?.feederRoadPassability === 'PRATICABLE_TOUT_VEHICULE'
                ? 'Praticable (Camions)'
                : activeAudit?.feederRoadPassability === '4X4_UNIQUEMENT'
                ? '4x4 Recommandé'
                : 'Bourbier (Infranchissable)'}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
            <span>Programme bailleur :</span>
            <span className="font-bold text-emerald-800">{activeAudit?.donorProgram}</span>
          </div>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 text-xs font-semibold">
        <button
          onClick={() => setSubTab('SILOS')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
            subTab === 'SILOS'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:text-slate-900'
          }`}
        >
          <Droplets className="w-3.5 h-3.5 text-emerald-400" />
          <span>Silos & Humidité des Grains ({activeAudit?.silos.length})</span>
        </button>

        <button
          onClick={() => setSubTab('MACHINERY')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
            subTab === 'MACHINERY'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:text-slate-900'
          }`}
        >
          <Cog className="w-3.5 h-3.5 text-amber-400" />
          <span>Moulins & Décortiqueuses ({activeAudit?.millingMachines.length})</span>
        </button>

        <button
          onClick={() => setSubTab('HECTARES')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
            subTab === 'HECTARES'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:text-slate-900'
          }`}
        >
          <Map className="w-3.5 h-3.5 text-emerald-400" />
          <span>Surfaces Emblavées & Pistes</span>
        </button>
      </div>

      {/* SUB-VIEW 1: SILOS & MOISTURE READINGS */}
      {subTab === 'SILOS' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="border-b pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-emerald-700" />
                <span>État des Silos de Stockage & Sondes d'Humidité</span>
              </h3>
              <span className="text-[11px] text-slate-500">
                Coopérative {activeAudit?.cooperativeName} · Tolérance maximale : 13.5%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {activeAudit?.silos.map(silo => (
              <div 
                key={silo.siloId}
                className={`p-4 rounded-xl border shadow-xs space-y-3 ${
                  silo.isMoistureSafe ? 'bg-slate-50 border-slate-200' : 'bg-rose-50/70 border-rose-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 text-xs">{silo.siloName}</div>
                  <span className={`font-mono text-[10px] px-2 py-0.5 rounded font-bold ${
                    silo.isMoistureSafe ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'
                  }`}>
                    {silo.isMoistureSafe ? 'CONFORME' : 'HUMIDITÉ CRITIQUE'}
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Céréale stockée :</span>
                    <span className="font-bold text-slate-900">{silo.grainType}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Stock actuel / Capacité :</span>
                    <span className="font-mono text-slate-800">{silo.currentStockMetricTons} T / {silo.capacityMetricTons} T</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Température interne :</span>
                    <span className="font-mono text-slate-800">{silo.temperatureInsideCelsius}°C</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Protection rongeurs :</span>
                    <span className="font-semibold text-slate-800">{silo.pestProofCondition}</span>
                  </div>
                </div>

                {/* Moisture Gauge */}
                <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="text-slate-600 font-semibold">Taux d'Humidité :</span>
                    <span className={`font-mono font-bold text-sm ${silo.moisturePercent > 13.5 ? 'text-rose-600' : 'text-emerald-700'}`}>
                      {silo.moisturePercent}%
                    </span>
                  </div>
                  
                  {/* Gauge bar */}
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden relative">
                    <div 
                      className={`h-full ${silo.moisturePercent > 13.5 ? 'bg-rose-600' : 'bg-emerald-600'}`}
                      style={{ width: `${Math.min(100, (silo.moisturePercent / 20) * 100)}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>0%</span>
                    <span className="text-emerald-700 font-bold">13.5% seuil max</span>
                    <span>20%</span>
                  </div>

                  {/* Quick Adjust Buttons */}
                  <div className="pt-1 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">Simuler sonde :</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => onUpdateSiloMoisture && onUpdateSiloMoisture(selectedAuditIndex, silo.siloId, Math.max(8, silo.moisturePercent - 1))}
                        className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 rounded font-mono font-bold cursor-pointer"
                      >
                        -1%
                      </button>
                      <button
                        onClick={() => onUpdateSiloMoisture && onUpdateSiloMoisture(selectedAuditIndex, silo.siloId, silo.moisturePercent + 1)}
                        className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 rounded font-mono font-bold cursor-pointer"
                      >
                        +1%
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: MILLING MACHINERY */}
      {subTab === 'MACHINERY' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="border-b pb-3">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Cog className="w-4 h-4 text-amber-600" />
              <span>Inventaire & Fonctionnement des Moulins et Décortiqueuses</span>
            </h3>
            <span className="text-[11px] text-slate-500">
              Contrôle du débit nominal de transformation et des sources d'énergie
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-600 text-[10px] uppercase font-bold tracking-wider">
                <tr>
                  <th className="p-3">Type Équipement</th>
                  <th className="p-3">Numéro de Série / Fabricant</th>
                  <th className="p-3 text-right">Débit Nominal</th>
                  <th className="p-3">Source Énergie</th>
                  <th className="p-3 text-right">Heures / Semaine</th>
                  <th className="p-3 text-right">État Fonctionnel</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {activeAudit?.millingMachines.map(machine => (
                  <tr key={machine.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{machine.machineType}</div>
                      {machine.defectNotes && (
                        <div className="text-[10px] text-rose-600 italic mt-0.5">{machine.defectNotes}</div>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="font-mono text-slate-800">{machine.serialNumber}</div>
                      <div className="text-[10px] text-slate-500">{machine.manufacturer}</div>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900">
                      {machine.nominalCapacityKgPerHour} kg/h
                    </td>
                    <td className="p-3">
                      <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {machine.powerSource}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono text-slate-800">
                      {machine.hoursOperatedThisWeek} h
                    </td>
                    <td className="p-3 text-right">
                      {machine.isOperational ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Opérationnel
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-semibold text-rose-800 bg-rose-50 px-2 py-0.5 rounded text-[11px] border border-rose-200">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          En Panne
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => onToggleMachineStatus && onToggleMachineStatus(selectedAuditIndex, machine.id, !machine.isOperational)}
                        className="px-2.5 py-1 text-[11px] font-semibold border rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        {machine.isOperational ? 'Signaler Panne' : 'Activer'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: HECTARES & FEEDER ROADS */}
      {subTab === 'HECTARES' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="border-b pb-3">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Map className="w-4 h-4 text-emerald-700" />
              <span>Surfaces Emblavées & Roulabilité des Pistes de Desserte</span>
            </h3>
            <span className="text-[11px] text-slate-500">
              Vérification géospatiale PostGIS et désenclavement des bassins de production
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
              <div className="font-bold text-slate-900 flex items-center gap-2">
                <Wheat className="w-4 h-4 text-emerald-600" />
                <span>Relevé des Superficies Agricoles</span>
              </div>
              <div className="space-y-1.5 text-slate-600">
                <div className="flex justify-between">
                  <span>Hectares sous contrat :</span>
                  <strong className="text-slate-900">{activeAudit?.hectaresTotalPlanted} ha</strong>
                </div>
                <div className="flex justify-between">
                  <span>Hectares certifiés in-situ par GPS :</span>
                  <strong className="text-emerald-700">{activeAudit?.hectaresVerifiedGps} ha</strong>
                </div>
                <div className="flex justify-between">
                  <span>Taux de couverture réelle :</span>
                  <strong className="text-slate-900">
                    {Math.round(((activeAudit?.hectaresVerifiedGps || 0) / (activeAudit?.hectaresTotalPlanted || 1)) * 100)}%
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>Rendement projeté :</span>
                  <strong className="text-slate-900">{activeAudit?.cropYieldEstimateTonsPerHectare} T/ha</strong>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
              <div className="font-bold text-slate-900 flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-600" />
                <span>Piste de Desserte & Évacuation</span>
              </div>
              <div className="space-y-1.5 text-slate-600">
                <div className="flex justify-between">
                  <span>Tronçon de piste :</span>
                  <strong className="text-slate-900">{activeAudit?.feederRoadDistanceKm} km</strong>
                </div>
                <div className="flex justify-between">
                  <span>État de roulabilité :</span>
                  <span className="font-bold text-emerald-800">{activeAudit?.feederRoadPassability}</span>
                </div>
                <div className="flex justify-between">
                  <span>Territoire :</span>
                  <strong className="text-slate-900">{activeAudit?.territory} ({activeAudit?.province})</strong>
                </div>
                <div className="flex justify-between">
                  <span>Dernier audit sur piste :</span>
                  <strong className="text-slate-900">{new Date(activeAudit?.lastAuditDate || '').toLocaleDateString('fr-FR')}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add Silo */}
      {showAddSiloModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Droplets className="w-4 h-4 text-emerald-600" />
                <span>Ajout d'un Silo de Stockage Vivrier</span>
              </h3>
              <button onClick={() => setShowAddSiloModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSilo} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nom / Référence du Silo *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Silo Métallique D4 - Maïs"
                  value={newSiloName}
                  onChange={e => setNewSiloName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Céréale / Denrée</label>
                  <select
                    value={newGrainType}
                    onChange={e => setNewGrainType(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="MAIS">Maïs Grains</option>
                    <option value="MANIOC">Manioc Cossettes</option>
                    <option value="SOJA">Soja</option>
                    <option value="RIZ">Riz Paddy</option>
                    <option value="HARICOT">Haricots</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Protection Anti-Rongeurs</label>
                  <select
                    value={newPestCondition}
                    onChange={e => setNewPestCondition(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="PARFAITE_ETANCHEITE">Parfaite Étanchéité</option>
                    <option value="DEFAUT_MINEUR">Défaut Mineur</option>
                    <option value="INFESTATION_OUVERTURES">Infestation Ouvertures</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Capacité (Tonnes)</label>
                  <input
                    type="number"
                    value={newCapacity}
                    onChange={e => setNewCapacity(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Stock Actuel (Tonnes)</label>
                  <input
                    type="number"
                    value={newStock}
                    onChange={e => setNewStock(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Humidité (%) - Max 13.5%</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newMoisture}
                    onChange={e => setNewMoisture(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Température Interne (°C)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newTemp}
                    onChange={e => setNewTemp(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddSiloModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-900 text-xs font-semibold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg cursor-pointer shadow-xs"
                >
                  Ajouter le Silo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
