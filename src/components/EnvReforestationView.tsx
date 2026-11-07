import React, { useState } from 'react';
import { 
  EnvReforestationAudit, 
  TreeSpeciesPlot, 
  CommunityForestryGuard, 
  Site 
} from '../types/proof360';
import { 
  Trees, 
  Leaf, 
  ShieldCheck, 
  Award, 
  Satellite, 
  Camera, 
  UserCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Flame, 
  DollarSign, 
  TrendingUp, 
  Eye, 
  Radio, 
  Sparkles 
} from 'lucide-react';

interface EnvReforestationViewProps {
  audits: EnvReforestationAudit[];
  sites: Site[];
  onUpdatePlotSurvival?: (auditIndex: number, plotId: string, countedLiving: number) => void;
  onAddPlot?: (auditIndex: number, newPlot: TreeSpeciesPlot) => void;
  onCertifyVerra?: (auditIndex: number) => void;
}

export const EnvReforestationView: React.FC<EnvReforestationViewProps> = ({
  audits,
  sites,
  onUpdatePlotSurvival,
  onAddPlot,
  onCertifyVerra
}) => {
  const [selectedAuditIndex, setSelectedAuditIndex] = useState(0);
  const [subTab, setSubTab] = useState<'PLOTS' | 'CARBON_CREDITS' | 'FOREST_GUARDS' | 'SATELLITE_NDVI'>('PLOTS');
  
  // State for adding a new plot
  const [showAddPlotModal, setShowAddPlotModal] = useState(false);
  const [newPlotName, setNewPlotName] = useState('');
  const [newSpeciesName, setNewSpeciesName] = useState('Millettia laurentii (Wengé Noble)');
  const [newTargetPlanted, setNewTargetPlanted] = useState(25000);
  const [isEndangered, setIsEndangered] = useState(true);

  // Quick edit modal or inline prompt
  const [editingPlotId, setEditingPlotId] = useState<string | null>(null);
  const [editLivingCount, setEditLivingCount] = useState<number>(0);

  const activeAudit = audits[selectedAuditIndex] || audits[0];

  const totalTargetTrees = activeAudit?.totalTreesPlantedTarget || 180000;
  const totalLivingTrees = activeAudit?.totalTreesVerifiedLiving || 154800;
  const survivalRate = activeAudit?.globalSurvivalRatePercent || 86;
  const carbonTons = activeAudit?.accumulatedCo2SequestrationTons || 124500;
  const estimatedRevenueUsd = activeAudit?.carbonCreditsEstimatedUsd || 1494000;

  const isCompliantVerra = survivalRate >= 70;

  const handleSavePlotCount = (plotId: string) => {
    if (onUpdatePlotSurvival) {
      onUpdatePlotSurvival(selectedAuditIndex, plotId, editLivingCount);
    }
    setEditingPlotId(null);
  };

  const handleCreatePlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlotName.trim()) return;

    const countedLiving = Math.round(newTargetPlanted * 0.88);
    const deadCount = newTargetPlanted - countedLiving;
    const plotSurvival = Math.round((countedLiving / newTargetPlanted) * 100);
    const carbonBiomass = Math.round(countedLiving * 0.12);

    const createdPlot: TreeSpeciesPlot = {
      plotId: `plot-${Date.now().toString().slice(-4)}`,
      plotName: newPlotName,
      speciesName: newSpeciesName,
      isEndangeredNativeSpecies: isEndangered,
      treesPlantedTarget: newTargetPlanted,
      treesCountedAiDrone: countedLiving,
      healthyTreesCount: countedLiving,
      deadOrStumpCount: deadCount,
      survivalRatePercent: plotSurvival,
      carbonBiomassCo2ePerYearTons: carbonBiomass,
      canopyDensityPercent: 75
    };

    if (onAddPlot) {
      onAddPlot(selectedAuditIndex, createdPlot);
    }

    setShowAddPlotModal(false);
    setNewPlotName('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-800">
              <Trees className="w-4 h-4 text-emerald-600" />
              <span>Protocole Sectoriel PVS-ENV-001 · Bassin du Congo & Reforestation</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Audit Reforestation Communautaire, Taux de Survie & Crédits Carbone Verra VCS
            </h2>
            <p className="text-xs text-slate-500 max-w-3xl">
              Vérification physique et photogrammétrique par drone des parcelles reboisées, détection de souches mortes par IA embarquée, certification des crédits carbone (standard Verra VCS / Gold Standard) et suivi des gardes forestiers locaux.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {audits.length > 1 && (
              <select
                value={selectedAuditIndex}
                onChange={e => setSelectedAuditIndex(Number(e.target.value))}
                className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
              >
                {audits.map((a, idx) => (
                  <option key={a.id} value={idx}>
                    {a.siteName} ({a.province})
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={() => onCertifyVerra && onCertifyVerra(selectedAuditIndex)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors shadow-xs cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>Émettre Attestation Verra VCS</span>
            </button>
          </div>
        </div>

        {/* Global Key Metrics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-5">
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3.5">
            <span className="text-[11px] font-semibold text-emerald-900 block">Taux de Survie Global</span>
            <div className="text-2xl font-black font-mono text-emerald-800 mt-1 tabular-nums">
              {survivalRate.toFixed(1)}%
            </div>
            <span className="text-[10px] text-emerald-700 font-medium">
              {survivalRate >= 70 ? '✓ Seuil Verra ≥70% respecté' : '⚠ Non-conforme (sous 70%)'}
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
            <span className="text-[11px] font-semibold text-slate-600 block">Arbres Vivants Audités</span>
            <div className="text-2xl font-black font-mono text-slate-900 mt-1 tabular-nums">
              {totalLivingTrees.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              Sur {totalTargetTrees.toLocaleString()} plantés
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
            <span className="text-[11px] font-semibold text-slate-600 block">Séquestration CO2e</span>
            <div className="text-2xl font-black font-mono text-emerald-700 mt-1 tabular-nums">
              {carbonTons.toLocaleString()} T
            </div>
            <span className="text-[10px] text-slate-500">
              +{activeAudit?.annualCo2RateTons.toLocaleString()} T/an estimées
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
            <span className="text-[11px] font-semibold text-slate-600 block">Valeur Crédits Carbone</span>
            <div className="text-2xl font-black font-mono text-slate-900 mt-1 tabular-nums">
              ${estimatedRevenueUsd.toLocaleString()}
            </div>
            <span className="text-[10px] text-emerald-700 font-medium">
              Base $12/tCO2e (Verra VCS)
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
            <span className="text-[11px] font-semibold text-slate-600 block">Indice Végétation NDVI</span>
            <div className="text-2xl font-black font-mono text-blue-700 mt-1 tabular-nums">
              {activeAudit?.satelliteVegetationNviIndex.toFixed(2)}
            </div>
            <span className="text-[10px] text-blue-800 font-medium">
              Sentinel-2 & Drone Multispectral
            </span>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-semibold">
        <button
          onClick={() => setSubTab('PLOTS')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
            subTab === 'PLOTS'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Leaf className="w-3.5 h-3.5 text-emerald-400" />
          <span>Parcelles & Comptage par Vision IA ({activeAudit?.plots.length || 0})</span>
        </button>

        <button
          onClick={() => setSubTab('CARBON_CREDITS')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
            subTab === 'CARBON_CREDITS'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          <span>Certification Verra VCS & Calculateur de Séquestration</span>
        </button>

        <button
          onClick={() => setSubTab('FOREST_GUARDS')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
            subTab === 'FOREST_GUARDS'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Gardes Forestiers Communautaires & Patrouilles ({activeAudit?.communityGuards.length || 0})</span>
        </button>

        <button
          onClick={() => setSubTab('SATELLITE_NDVI')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
            subTab === 'SATELLITE_NDVI'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Satellite className="w-3.5 h-3.5 text-emerald-400" />
          <span>Télédétection Sentinel-2 & Ceinture Coupe-Feu</span>
        </button>
      </div>

      {/* Sub-Tab 1: Plots & AI Tree Counting */}
      {subTab === 'PLOTS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Inventaire des Parcelles & Taux de Survie Végétale (VCS PVS-ENV)
              </h3>
              <p className="text-xs text-slate-500">
                Chaque parcelle est scannée par photogrammétrie drone avec extraction du couvert végétal et géolocalisation des plants viables.
              </p>
            </div>
            <button
              onClick={() => setShowAddPlotModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-700" />
              <span>Ajouter une Parcelle</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {activeAudit?.plots.map((plot) => {
              const isPlotHealthy = plot.survivalRatePercent >= 70;
              return (
                <div 
                  key={plot.plotId}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-mono font-bold text-slate-500 uppercase">{plot.plotId}</span>
                          {plot.isEndangeredNativeSpecies && (
                            <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.2 rounded font-semibold">
                              Espèce Protégée
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mt-0.5">{plot.plotName}</h4>
                        <div className="text-xs italic text-emerald-800 mt-0.5">{plot.speciesName}</div>
                      </div>

                      <div className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                        isPlotHealthy ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'
                      }`}>
                        {plot.survivalRatePercent}% survie
                      </div>
                    </div>

                    {/* Progress Bar of Survival */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                        <span>Plants Vivants: <strong>{plot.healthyTreesCount.toLocaleString()}</strong></span>
                        <span>Objectif: {plot.treesPlantedTarget.toLocaleString()}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            isPlotHealthy ? 'bg-emerald-600' : 'bg-rose-500'
                          }`}
                          style={{ width: `${Math.min(100, plot.survivalRatePercent)}%` }}
                        />
                      </div>
                    </div>

                    {/* Detailed metrics grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Souches Mortes / Pertes</span>
                        <span className="font-mono font-bold text-slate-700">
                          {plot.deadOrStumpCount.toLocaleString()} plants
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Densité Canopée</span>
                        <span className="font-mono font-bold text-slate-900">
                          {plot.canopyDensityPercent}%
                        </span>
                      </div>
                      <div className="col-span-2 pt-1 border-t border-slate-200">
                        <span className="text-[10px] text-slate-500 block">Capacité Biomasse Carbone Annuelle</span>
                        <span className="font-mono font-bold text-emerald-700">
                          +{plot.carbonBiomassCo2ePerYearTons.toLocaleString()} tCO2e/an
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400 font-mono">Scan AI Drone Certifié</span>
                    <button
                      onClick={() => {
                        setEditingPlotId(plot.plotId);
                        setEditLivingCount(plot.healthyTreesCount);
                      }}
                      className="px-2.5 py-1 text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded font-semibold transition-colors cursor-pointer"
                    >
                      Mettre à jour comptage
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Edit Modal */}
          {editingPlotId && (
            <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900">Recomptage Manuel / Post-Audit</h4>
                  <button 
                    onClick={() => setEditingPlotId(null)}
                    className="text-slate-400 hover:text-slate-600 text-xs"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-xs text-slate-500">
                  Ajuster le nombre d'arbres vivants confirmés lors de la contre-expertise au sol.
                </p>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Arbres vivants identifiés :
                  </label>
                  <input
                    type="number"
                    value={editLivingCount}
                    onChange={e => setEditLivingCount(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono text-sm"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setEditingPlotId(null)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 rounded font-semibold cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => handleSavePlotCount(editingPlotId)}
                    className="px-3 py-1.5 text-xs text-white bg-emerald-700 hover:bg-emerald-800 rounded font-bold cursor-pointer"
                  >
                    Valider le Recomptage
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Add Plot Modal */}
          {showAddPlotModal && (
            <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
              <form 
                onSubmit={handleCreatePlot}
                className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl border border-slate-200 space-y-4 text-xs"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Trees className="w-4 h-4 text-emerald-700" />
                    Enregistrer une Nouvelle Parcelle de Reforestation
                  </h4>
                  <button 
                    type="button"
                    onClick={() => setShowAddPlotModal(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nom / Référence de la Parcelle</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Parcelle D - Corridor Faunique Sud"
                    value={newPlotName}
                    onChange={e => setNewPlotName(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Essence d'Arbre Reboisée</label>
                  <select
                    value={newSpeciesName}
                    onChange={e => setNewSpeciesName(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-slate-900"
                  >
                    <option value="Millettia laurentii (Wengé Noble)">Millettia laurentii (Wengé Noble - Haute Valeur)</option>
                    <option value="Autranella congolensis (Mukwa)">Autranella congolensis (Mukwa - Endémique)</option>
                    <option value="Acacia auriculiformis (Fixateur d’Azote)">Acacia auriculiformis (Croissance Rapide & Fixation Azote)</option>
                    <option value="Terminalia superba (Limba)">Terminalia superba (Limba - Restauration Forestière)</option>
                    <option value="Entandrophragma cylindricum (Sapelli)">Entandrophragma cylindricum (Sapelli Noble)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nombre de Plants Mis en Terre (Objectif)</label>
                  <input
                    type="number"
                    min="1000"
                    step="500"
                    value={newTargetPlanted}
                    onChange={e => setNewTargetPlanted(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isEndangeredCheck"
                    checked={isEndangered}
                    onChange={e => setIsEndangered(e.target.checked)}
                    className="rounded text-emerald-700"
                  />
                  <label htmlFor="isEndangeredCheck" className="text-slate-700 cursor-pointer">
                    Espèce locale menacée (Eligible bonus biodiversité Verra SD VISta)
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setShowAddPlotModal(false)}
                    className="px-3 py-1.5 text-slate-600 hover:text-slate-900 rounded font-semibold cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg font-bold cursor-pointer"
                  >
                    Créer la Parcelle
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Sub-Tab 2: Verra VCS Carbon Credits */}
      {subTab === 'CARBON_CREDITS' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6 text-xs">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-700" />
                Certification de Crédits Carbone Volontaires (Verra VCS / Gold Standard)
              </h3>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Calcul automatique de la séquestration biomasse aérienne & souterraine pour déblocage des tranches financières environnementales.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg">
                Statut: {activeAudit?.carbonCertificationStatus}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-2">
              <span className="text-slate-600 font-semibold block">Volume Séquestré Cumulé</span>
              <div className="text-2xl font-black font-mono text-emerald-900">
                {activeAudit?.accumulatedCo2SequestrationTons.toLocaleString()} tCO2e
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                Calculé selon la méthodologie VM0007 (REDD+ / Afforestation) avec déduction d'un tampon de réserve de 15% pour risques de feux.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <span className="text-slate-600 font-semibold block">Prix de Référence Carbone</span>
              <div className="text-2xl font-black font-mono text-slate-900">
                $12.00 USD / tonne
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Valorisation sur le marché volontaire mondial avec traçabilité d'impact direct auprès des chefferies et gardes forestiers.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <span className="text-slate-600 font-semibold block">Revenus Générés Décaissables</span>
              <div className="text-2xl font-black font-mono text-emerald-700">
                ${activeAudit?.carbonCreditsEstimatedUsd.toLocaleString()} USD
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                40% versés au compte bancaire du Comité Local de Développement (CLD) et 60% réinvestis en surveillance communautaire.
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-900 text-white rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Contrôle Anti-Fraude & Règle d'Immuabilité Carbone</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Toute tentative de double-comptage ou d'utilisation d'arbres préexistants est neutralisée par le croisement temporel des archives satellite Sentinel-2 de l'ESA (historique à J-3 ans) et les scans LIDAR/photogrammétriques drone à très haute résolution (GSD ≤ 3 cm).
            </p>
          </div>
        </div>
      )}

      {/* Sub-Tab 3: Community Forestry Guards */}
      {subTab === 'FOREST_GUARDS' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 text-xs">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-700" />
                Brigade des Gardes Forestiers Communautaires & Surveillance Anti-Coupe
              </h3>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Agents villageois assurant les patrouilles à pied et le signalement en direct des départs de feux et coupes illégales.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded">
              {activeAudit?.communityGuards.length} patrouilleurs actifs
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-semibold border-b">
                <tr>
                  <th className="py-2.5 px-3">Garde Forestier</th>
                  <th className="py-2.5 px-3">Village d'Attache</th>
                  <th className="py-2.5 px-3">Heures Patrouille (Mois)</th>
                  <th className="py-2.5 px-3">Alertes Coupes Illégales</th>
                  <th className="py-2.5 px-3">Prime Forfaitaire Mobile Money</th>
                  <th className="py-2.5 px-3 text-right">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeAudit?.communityGuards.map((guard) => (
                  <tr key={guard.guardId} className="hover:bg-slate-50">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{guard.fullName}</div>
                      <div className="text-[10px] font-mono text-slate-400">{guard.guardId} · {guard.phone}</div>
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-700">{guard.villageName}</td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">{guard.patrolHoursThisMonth} hrs</td>
                    <td className="py-3 px-3">
                      {guard.illegalLoggingAlertsLogged > 0 ? (
                        <span className="text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded font-mono font-bold">
                          {guard.illegalLoggingAlertsLogged} alerte(s) transmise(s)
                        </span>
                      ) : (
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono font-medium">
                          0 incident (Secteur calme)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-emerald-800">
                      ${guard.airtimeSubsidyPaidUsd} USD (M-Pesa envoyé)
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="bg-emerald-100 text-emerald-900 font-semibold px-2 py-0.5 rounded text-[11px]">
                        En Patrouille
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub-Tab 4: Satellite NDVI & Firebreak Perimeter */}
      {subTab === 'SATELLITE_NDVI' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 text-xs">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Satellite className="w-4 h-4 text-blue-600" />
                Vigie Spatiale : Télédétection NDVI Sentinel-2 & Ceinture Coupe-Feu
              </h3>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Surveillance spectrale infrarouge de la vigueur foliaire et vérification du désherbage de protection périmétrique.
              </p>
            </div>
            <span className="bg-blue-50 text-blue-800 border border-blue-200 px-2 py-1 rounded text-xs font-mono font-bold">
              Résolution: 10m Multi-spectral
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">Indice de Végétation NDVI</span>
                <span className="font-mono font-bold text-blue-700 text-sm">
                  {activeAudit?.satelliteVegetationNviIndex.toFixed(2)} / 1.00
                </span>
              </div>
              <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-600 rounded-full"
                  style={{ width: `${Math.round(activeAudit?.satelliteVegetationNviIndex * 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Un indice NDVI &gt; 0.70 atteste d'une canopée dense et d'un taux de chlorophylle actif sans stress hydrique.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">Ceinture Coupe-Feu Périmétrique</span>
                <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                  activeAudit?.firebreakPerimeterMaintained
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}>
                  {activeAudit?.firebreakPerimeterMaintained ? 'Entretenue & Débroussaillée' : 'Négligée (Risque de propagation)'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Bande de terre nue de 30 mètres de large autour des 2,400 hectares de concession pour bloquer les feux de brousse de saison sèche.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
