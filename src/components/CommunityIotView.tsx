import React, { useState, useMemo } from 'react';
import { CommunitySignal, IotTelemetryReading, Site, UrgencyLevel, SentimentCategory } from '../types/proof360';
import { 
  MessageSquare, 
  Radio, 
  Phone, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Zap, 
  Droplets, 
  Sparkles, 
  Plus, 
  Flame, 
  HeartHandshake, 
  Info, 
  Filter, 
  ArrowUpDown, 
  Brain,
  ShieldAlert,
  Send
} from 'lucide-react';
import { analyzeSignalSentiment, enrichCommunitySignals } from '../services/sentimentService';

interface CommunityIotViewProps {
  signals: CommunitySignal[];
  iotReadings: IotTelemetryReading[];
  sites: Site[];
  onDispatchAgentForSignal: (signalId: string) => void;
  onSimulateUssdSignal: (newSignal: {
    siteId: string;
    channel: 'USSD' | 'SMS' | 'WHATSAPP';
    senderRole: 'VILLAGE_CHIEF' | 'SCHOOL_DIRECTOR' | 'HEALTH_STAFF' | 'CITIZEN';
    plateId: string;
    message: string;
    issueCategory: 'PUMP_BROKEN' | 'WATER_DIRTY' | 'ROOF_DAMAGED' | 'SOLAR_DARK' | 'NOMINAL';
  }) => Promise<void>;
}

export const CommunityIotView: React.FC<CommunityIotViewProps> = ({
  signals: initialSignals,
  iotReadings,
  sites,
  onDispatchAgentForSignal,
  onSimulateUssdSignal
}) => {
  const [activeTab, setActiveTab] = useState<'COMMUNITY' | 'IOT'>('COMMUNITY');
  const [showUssdModal, setShowUssdModal] = useState(false);
  const [urgencyFilter, setUrgencyFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM_LOW'>('ALL');
  const [sortBy, setSortBy] = useState<'URGENCY_DESC' | 'DATE_DESC' | 'URGENCY_ASC'>('URGENCY_DESC');

  // Form state for USSD / SMS Simulator
  const [selectedSiteId, setSelectedSiteId] = useState<string>(sites[0]?.id || '');
  const [channel, setChannel] = useState<'USSD' | 'SMS' | 'WHATSAPP'>('USSD');
  const [senderRole, setSenderRole] = useState<'VILLAGE_CHIEF' | 'SCHOOL_DIRECTOR' | 'HEALTH_STAFF' | 'CITIZEN'>('VILLAGE_CHIEF');
  const [plateId, setPlateId] = useState('P-145T-092');
  const [message, setMessage] = useState('');
  const [issueCategory, setIssueCategory] = useState<'PUMP_BROKEN' | 'WATER_DIRTY' | 'ROOF_DAMAGED' | 'SOLAR_DARK' | 'NOMINAL'>('PUMP_BROKEN');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ensure all incoming signals have sentiment analysis attached
  const signals = useMemo(() => {
    return enrichCommunitySignals(initialSignals);
  }, [initialSignals]);

  // Live real-time analysis while typing in the modal
  const liveSentimentPreview = useMemo(() => {
    if (!message.trim()) return null;
    return analyzeSignalSentiment(message, {
      issueCategory,
      senderRole
    });
  }, [message, issueCategory, senderRole]);

  // Summary counts
  const criticalCount = signals.filter(s => s.sentimentAnalysis?.urgencyLevel === 'CRITICAL').length;
  const highCount = signals.filter(s => s.sentimentAnalysis?.urgencyLevel === 'HIGH').length;
  const mediumLowCount = signals.filter(s => s.sentimentAnalysis?.urgencyLevel === 'MEDIUM' || s.sentimentAnalysis?.urgencyLevel === 'LOW').length;

  // Filtered and Sorted signals
  const filteredAndSortedSignals = useMemo(() => {
    let result = [...signals];

    // Filter
    if (urgencyFilter === 'CRITICAL') {
      result = result.filter(s => s.sentimentAnalysis?.urgencyLevel === 'CRITICAL');
    } else if (urgencyFilter === 'HIGH') {
      result = result.filter(s => s.sentimentAnalysis?.urgencyLevel === 'HIGH');
    } else if (urgencyFilter === 'MEDIUM_LOW') {
      result = result.filter(s => s.sentimentAnalysis?.urgencyLevel === 'MEDIUM' || s.sentimentAnalysis?.urgencyLevel === 'LOW');
    }

    // Sort
    result.sort((a, b) => {
      const scoreA = a.sentimentAnalysis?.urgencyScore ?? 50;
      const scoreB = b.sentimentAnalysis?.urgencyScore ?? 50;
      if (sortBy === 'URGENCY_DESC') {
        return scoreB - scoreA;
      } else if (sortBy === 'URGENCY_ASC') {
        return scoreA - scoreB;
      } else {
        return new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime();
      }
    });

    return result;
  }, [signals, urgencyFilter, sortBy]);

  const handleCreateSignal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message) return;
    setIsSubmitting(true);
    try {
      await onSimulateUssdSignal({
        siteId: selectedSiteId,
        channel,
        senderRole,
        plateId,
        message,
        issueCategory
      });
      setMessage('');
      setShowUssdModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const applyPreset = (presetText: string, presetCategory: any, presetPlate: string) => {
    setMessage(presetText);
    setIssueCategory(presetCategory);
    setPlateId(presetPlate);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
            <Radio className="w-3.5 h-3.5 text-emerald-700" />
            <span>Boucle Citoyenne, Analyse NLP de Sentiment & Télémétrie</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
            Contrôle Citoyen & Triage Intelligent par Urgence Perçue
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setActiveTab('COMMUNITY')}
              className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'COMMUNITY' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>Signaux Citoyens ({signals.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('IOT')}
              className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'IOT' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-sky-600" />
              <span>Capteurs IoT ({iotReadings.length})</span>
            </button>
          </div>

          {activeTab === 'COMMUNITY' && (
            <button
              onClick={() => setShowUssdModal(true)}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Simuler Message USSD / SMS</span>
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: Community Feedback Loop with NLP Sentiment Analysis */}
      {activeTab === 'COMMUNITY' && (
        <div className="space-y-4">
          {/* Sentiment Urgency Metrics Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Alertes Communautaires</span>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
                {signals.length}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Canaux *404#, SMS & WhatsApp</div>
            </div>

            <div className="bg-white border border-rose-200 rounded-xl p-4 shadow-xs bg-rose-50/20">
              <div className="flex items-center justify-between">
                <span className="text-xs text-rose-700 font-semibold flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-rose-600" />
                  Urgence Critique & Colère
                </span>
                <span className="text-[10px] font-mono text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded font-bold">≥ 80/100</span>
              </div>
              <div className="text-2xl font-bold font-mono text-rose-700 mt-1 tabular-nums">
                {criticalCount}
              </div>
              <div className="text-[11px] text-rose-600 mt-0.5">Pénurie chronique, détresse sanitaire</div>
            </div>

            <div className="bg-white border border-amber-200 rounded-xl p-4 shadow-xs bg-amber-50/20">
              <div className="flex items-center justify-between">
                <span className="text-xs text-amber-700 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  Frustration Élevée
                </span>
                <span className="text-[10px] font-mono text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded font-bold">60-79/100</span>
              </div>
              <div className="text-2xl font-bold font-mono text-amber-700 mt-1 tabular-nums">
                {highCount}
              </div>
              <div className="text-[11px] text-amber-600 mt-0.5">Débit très restreint, eau boueuse</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  Modéré ou Nominal
                </span>
                <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">&lt; 60/100</span>
              </div>
              <div className="text-2xl font-bold font-mono text-slate-700 mt-1 tabular-nums">
                {mediumLowCount}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Fonctionnement régulier ou félicitations</div>
            </div>
          </div>

          {/* Filtering & Sorting Toolbar */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-slate-500 font-medium mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                Filtrer :
              </span>
              <button
                onClick={() => setUrgencyFilter('ALL')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer font-semibold ${
                  urgencyFilter === 'ALL'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tous ({signals.length})
              </button>
              <button
                onClick={() => setUrgencyFilter('CRITICAL')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer font-semibold flex items-center gap-1 ${
                  urgencyFilter === 'CRITICAL'
                    ? 'bg-rose-700 text-white'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                }`}
              >
                <Flame className="w-3 h-3" />
                <span>Critique & Colère ({criticalCount})</span>
              </button>
              <button
                onClick={() => setUrgencyFilter('HIGH')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer font-semibold flex items-center gap-1 ${
                  urgencyFilter === 'HIGH'
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                }`}
              >
                <AlertTriangle className="w-3 h-3" />
                <span>Frustration Élevée ({highCount})</span>
              </button>
              <button
                onClick={() => setUrgencyFilter('MEDIUM_LOW')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer font-semibold ${
                  urgencyFilter === 'MEDIUM_LOW'
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Modéré / Nominal ({mediumLowCount})
              </button>
            </div>

            {/* Sort selector */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-slate-500 font-medium flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                Trier par :
              </span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="p-1.5 bg-slate-50 border border-slate-200 rounded font-semibold text-slate-800 focus:outline-none"
              >
                <option value="URGENCY_DESC">🚨 Urgence Perçue (Décroissant)</option>
                <option value="DATE_DESC">⏱ Plus récents d'abord</option>
                <option value="URGENCY_ASC">Score d'urgence croissant</option>
              </select>
            </div>
          </div>

          {/* Signals List */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-emerald-700" />
                <span className="font-bold text-slate-900 text-sm">
                  Flux des Alertes Traitées par le Moteur NLP & Analyse de Sentiment
                </span>
              </div>
              <span className="text-slate-500 font-mono text-[11px]">
                {filteredAndSortedSignals.length} alerte{filteredAndSortedSignals.length > 1 ? 's' : ''} affichée{filteredAndSortedSignals.length > 1 ? 's' : ''}
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {filteredAndSortedSignals.map(sig => {
                const site = sites.find(s => s.id === sig.siteId);
                const analysis = sig.sentimentAnalysis;
                const urgencyScore = analysis?.urgencyScore ?? 50;
                const urgencyLevel = analysis?.urgencyLevel ?? 'MEDIUM';
                const dominantEmotion = analysis?.dominantEmotion ?? 'Information factuelle';
                const triggers = analysis?.detectedTriggers ?? [];

                // Styling based on urgency
                let borderClass = 'border-l-4 border-l-slate-300';
                let badgeClass = 'text-slate-700 bg-slate-100';
                let iconComponent = <Info className="w-3.5 h-3.5 text-slate-500" />;

                if (urgencyLevel === 'CRITICAL') {
                  borderClass = 'border-l-4 border-l-rose-600 bg-rose-50/15';
                  badgeClass = 'text-rose-800 bg-rose-100 font-bold';
                  iconComponent = <Flame className="w-3.5 h-3.5 text-rose-600" />;
                } else if (urgencyLevel === 'HIGH') {
                  borderClass = 'border-l-4 border-l-amber-500 bg-amber-50/15';
                  badgeClass = 'text-amber-800 bg-amber-100 font-bold';
                  iconComponent = <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />;
                } else if (analysis?.sentiment === 'POSITIVE_SATISFACTION') {
                  borderClass = 'border-l-4 border-l-emerald-500 bg-emerald-50/10';
                  badgeClass = 'text-emerald-800 bg-emerald-100 font-bold';
                  iconComponent = <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />;
                }

                return (
                  <div key={sig.id} className={`p-4 transition-colors ${borderClass} hover:bg-slate-50/80 text-xs`}>
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                      {/* Left: Metadata & Message */}
                      <div className="space-y-2 max-w-2xl">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900 font-mono bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                            {sig.channel} · {sig.plateId}
                          </span>
                          <span className="font-semibold text-slate-700">
                            {sig.senderRole === 'VILLAGE_CHIEF' ? 'Chef de Village' : sig.senderRole === 'SCHOOL_DIRECTOR' ? 'Directeur d’École' : sig.senderRole === 'HEALTH_STAFF' ? 'Personnel de Santé' : 'Citoyen'}
                          </span>
                          <span className="text-slate-300">·</span>
                          <span className="text-slate-500 font-mono text-[11px]">{sig.senderPhoneMasked}</span>
                          <span className="text-slate-300">·</span>
                          <span className="text-slate-400 text-[11px]">
                            {new Date(sig.reportedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        {/* Raw Message */}
                        <p className="text-slate-900 font-medium text-sm leading-relaxed">
                          « {sig.message} »
                        </p>

                        {/* NLP Analysis Box */}
                        {analysis && (
                          <div className="p-2.5 bg-white border border-slate-200 rounded-lg space-y-1.5 shadow-xs">
                            <div className="flex items-center justify-between gap-2 flex-wrap text-[11px]">
                              <div className="flex items-center gap-1.5">
                                {iconComponent}
                                <span className="font-bold text-slate-800">{dominantEmotion}</span>
                              </div>
                              <div className="flex items-center gap-1.5 font-mono">
                                <span className="text-slate-400">Score NLP d'Urgence :</span>
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  urgencyScore >= 80 ? 'bg-rose-100 text-rose-800' : urgencyScore >= 60 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                                }`}>
                                  {urgencyScore}/100
                                </span>
                              </div>
                            </div>

                            <p className="text-slate-600 text-[11px] italic">
                              {analysis.summaryJustification}
                            </p>

                            {/* Trigger chips */}
                            {triggers.length > 0 && (
                              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                                <span className="text-[10px] text-slate-400 uppercase font-mono">Facteurs détectés :</span>
                                {triggers.map((trig, idx) => (
                                  <span key={idx} className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono">
                                    {trig}
                                  </span>
                                ))}
                                {analysis.languageDetected && analysis.languageDetected !== 'FR' && (
                                  <span className="text-[10px] bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded font-mono font-bold">
                                    Langue : {analysis.languageDetected === 'LN' ? 'Lingala' : analysis.languageDetected === 'SW' ? 'Swahili' : 'Mixte'}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        <div className="text-[11px] text-slate-500 flex items-center gap-2">
                          <span>Ouvrage rattaché : <strong className="text-slate-700">{site?.name}</strong> ({site?.territory})</span>
                          <span>·</span>
                          <span>Âge post-livraison : J+{sig.postDeliveryAgeDays}</span>
                        </div>
                      </div>

                      {/* Right: Actions and Status */}
                      <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-2.5 shrink-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${badgeClass}`}>
                            {urgencyLevel === 'CRITICAL' ? '🚨 URGENCE CRITIQUE' : urgencyLevel === 'HIGH' ? '⚠️ URGENCE ÉLEVÉE' : urgencyLevel === 'MEDIUM' ? 'GÊNE MODÉRÉE' : 'NOMINAL'}
                          </span>

                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                            sig.status === 'DISPATCHED_TO_AGENT' 
                              ? 'bg-rose-50 text-rose-800 border border-rose-200'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}>
                            {sig.status === 'DISPATCHED_TO_AGENT' ? 'AGENT DÉPÊCHÉ' : 'EN ATTENTE'}
                          </span>
                        </div>

                        {sig.status !== 'DISPATCHED_TO_AGENT' && (
                          <button
                            onClick={() => onDispatchAgentForSignal(sig.id)}
                            className={`px-3 py-1.5 font-bold rounded-lg text-xs cursor-pointer shadow-xs transition-colors flex items-center gap-1.5 ${
                              urgencyLevel === 'CRITICAL'
                                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                                : 'bg-slate-900 hover:bg-slate-800 text-white'
                            }`}
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>{urgencyLevel === 'CRITICAL' ? 'Dépêcher Agent en Urgence' : 'Dépêcher un Agent'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: IoT Telemetry Sensors */}
      {activeTab === 'IOT' && (
        <div className="space-y-4">
          <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-mono uppercase text-emerald-400 font-bold">Réseau Télémesure Bas Débit LoRaWAN / GSM Solaire</div>
              <h3 className="text-base font-bold mt-0.5">Surveillance Continue des Débits et Niveaux de Nappe</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                Si un capteur enregistre 0 litre pendant 5 jours consécutifs, une mission physique est automatiquement ordonnée par l'algorithme.
              </p>
            </div>
            <span className="font-mono text-xs bg-emerald-950 text-emerald-300 px-3 py-1.5 rounded-lg border border-emerald-800">
              Passerelle RDC Connectée
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {iotReadings.map(iot => {
              const site = sites.find(s => s.id === iot.siteId);
              return (
                <div key={iot.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-bold text-slate-900">{site?.territory}</span>
                    <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                      iot.isNominal ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                    }`}>
                      {iot.isNominal ? 'NOMINAL' : 'ALERTE FORAGE SEC'}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-slate-500 text-[11px] truncate">{site?.name}</div>

                    {iot.sensorType === 'FLOW_PRESSURE' && (
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Volume 24h</span>
                          <span className="font-mono font-bold text-sm text-slate-900">{iot.dailyVolumeM3} m³</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Niveau nappe</span>
                          <span className="font-mono font-bold text-sm text-slate-900">{iot.waterTableDepthMeters} m</span>
                        </div>
                      </div>
                    )}

                    {iot.sensorType === 'BATTERY_INVERTER' && (
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Tension DC</span>
                          <span className="font-mono font-bold text-sm text-slate-900">{iot.batteryVoltageDc} V</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Sortie AC</span>
                          <span className="font-mono font-bold text-sm text-slate-900">{iot.inverterOutputVac} V</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      Relevé LoRa : il y a 22 min
                    </span>
                    {iot.alarmTriggered && (
                      <span className="text-rose-600 font-bold flex items-center gap-0.5">
                        <AlertTriangle className="w-3 h-3" />
                        Alerte 0L active
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal: Simulate Citizen Signal with Live NLP Sentiment Engine */}
      {showUssdModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                  <Brain className="w-4 h-4 text-emerald-700" />
                  Simulateur de Signalement & Analyseur NLP de Sentiment
                </h3>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Évalue l'urgence perçue et le niveau de colère ou détresse dès la réception du texte.
                </p>
              </div>
            </div>

            {/* Quick Presets for Demo */}
            <div>
              <span className="text-slate-500 text-[11px] font-semibold block mb-1">
                Scénarios prédéfinis pour tester l'analyseur :
              </span>
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => applyPreset(
                    "La population est très en colère ! Le forage est à sec depuis 3 semaines, les enfants boivent l'eau de la rivière et tombent malades. C'est inadmissible !",
                    'PUMP_BROKEN',
                    'P-145T-092'
                  )}
                  className="p-1.5 bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200 rounded text-left font-medium cursor-pointer transition-colors"
                >
                  🚨 Colère & Manque d'eau
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset(
                    "Urgence dispensaire : l'onduleur a sauté hier soir, la chaîne du froid des vaccins est coupée, nous risquons de perdre toutes les doses pédiatriques !",
                    'SOLAR_DARK',
                    'P-145T-015'
                  )}
                  className="p-1.5 bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200 rounded text-left font-medium cursor-pointer transition-colors"
                >
                  💉 Détresse Vaccins Dispensaire
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset(
                    "Bana bazali kobela na mayi ya mbindo ! Pasi mingi awa na village, kokende lisusu na libulu te !",
                    'WATER_DIRTY',
                    'P-145T-041'
                  )}
                  className="p-1.5 bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 rounded text-left font-medium cursor-pointer transition-colors"
                >
                  🗣 Alerte Lingala (Pasi mingi)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset(
                    "Forage fonctionne très bien, débit abondant et eau claire pour tout le village. Matondo mingi !",
                    'NOMINAL',
                    'P-145T-041'
                  )}
                  className="p-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 rounded text-left font-medium cursor-pointer transition-colors"
                >
                  ✅ Satisfaction & Eau Propre
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateSignal} className="space-y-3">
              <div>
                <label className="text-slate-700 font-semibold block mb-1">Ouvrage Supervisé</label>
                <select
                  value={selectedSiteId}
                  onChange={e => setSelectedSiteId(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                >
                  {sites.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.territory} - {s.province})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Canal de Transmission</label>
                  <select
                    value={channel}
                    onChange={e => setChannel(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  >
                    <option value="USSD">USSD *404# (Gratuit RDC)</option>
                    <option value="SMS">Passerelle SMS</option>
                    <option value="WHATSAPP">WhatsApp Bot PROOF360</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Rôle de l'Émetteur</label>
                  <select
                    value={senderRole}
                    onChange={e => setSenderRole(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  >
                    <option value="VILLAGE_CHIEF">Chef de Village</option>
                    <option value="SCHOOL_DIRECTOR">Directeur d'École</option>
                    <option value="HEALTH_STAFF">Personnel de Santé</option>
                    <option value="CITIZEN">Habitant du Quartier</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">Texte du Message Reçu</label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Ex: La population est très en colère, le forage est à sec depuis 3 semaines..."
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              {/* Real-time NLP Analysis Preview */}
              {liveSentimentPreview && (
                <div className={`p-3 rounded-lg border text-xs space-y-1.5 ${
                  liveSentimentPreview.urgencyLevel === 'CRITICAL'
                    ? 'bg-rose-50 border-rose-200 text-rose-900'
                    : liveSentimentPreview.urgencyLevel === 'HIGH'
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}>
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{liveSentimentPreview.dominantEmotion}</span>
                    </span>
                    <span className="font-mono text-xs">
                      Urgence Perçue : {liveSentimentPreview.urgencyScore}/100
                    </span>
                  </div>
                  <p className="text-[11px] opacity-90">
                    {liveSentimentPreview.summaryJustification}
                  </p>
                  {liveSentimentPreview.detectedTriggers.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap pt-0.5">
                      <span className="text-[10px] font-mono opacity-70">Mots-clés :</span>
                      {liveSentimentPreview.detectedTriggers.map((trig, i) => (
                        <span key={i} className="text-[10px] bg-white/70 px-1 py-0.5 rounded font-mono">
                          {trig}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowUssdModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !message}
                  className="px-4 py-2 font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Analyse & Envoi...' : 'Injecter avec Analyse NLP'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
