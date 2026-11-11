import React, { useState, useMemo } from 'react';
import { FleetRoutePlan, DroneWaypointPlan, Site } from '../types/proof360';
import { 
  Truck, 
  Plane, 
  Navigation, 
  Shield, 
  CloudRain, 
  AlertTriangle, 
  Compass, 
  CheckCircle2, 
  Video,
  Droplets,
  Wind,
  ArrowRight,
  BellRing,
  Sparkles,
  MapPin,
  AlertOctagon,
  Clock,
  Layers,
  Check
} from 'lucide-react';
import { DroneVisionInspect } from './DroneVisionInspect';

interface FleetDroneOperationsViewProps {
  fleetRoutes: FleetRoutePlan[];
  droneMissions: DroneWaypointPlan[];
  sites: Site[];
}

export interface WeatherCorridorRisk {
  id: string;
  corridorName: string;
  roadNumber: string;
  provinces: string;
  rainfallMm24h: number;
  soilSaturationPercent: number;
  riskLevel: 'CRITIQUE_ROUGE' | 'ELEVE_ORANGE' | 'MODERE_JAUNE' | 'FAIBLE_VERT';
  predictedImpassableDurationDays: number;
  criticalPoints: string[];
  impactedSites: {
    siteName: string;
    sector: string;
    delayDays: number;
    financialExposureUsd: number;
    contingencyAction: string;
  }[];
}

export const FleetDroneOperationsView: React.FC<FleetDroneOperationsViewProps> = ({
  fleetRoutes,
  droneMissions,
  sites
}) => {
  const [activeTab, setActiveTab] = useState<'DRONE_VISION' | 'FLEET' | 'DRONE'>('FLEET');
  const [sosSent, setSosSent] = useState(false);
  const [weatherScenario, setWeatherScenario] = useState<'PEAK_RAIN' | 'MODERATE_RAIN' | 'DRY_SEASON'>('PEAK_RAIN');
  const [showWeatherDetails, setShowWeatherDetails] = useState(true);
  const [alertSentNotification, setAlertSentNotification] = useState<string | null>(null);

  const handleTriggerSos = () => {
    setSosSent(true);
    setTimeout(() => setSosSent(false), 6000);
  };

  // Weather Corridor Risk Data based on current rainy season scenario
  const corridorRisks = useMemo<WeatherCorridorRisk[]>(() => {
    if (weatherScenario === 'PEAK_RAIN') {
      return [
        {
          id: 'risk-01',
          corridorName: 'Axe Kisangani - Banalia - Buta (Forêt Équatoriale)',
          roadNumber: 'RN4',
          provinces: 'Tshopo & Bas-Uélé',
          rainfallMm24h: 78,
          soilSaturationPercent: 96,
          riskLevel: 'CRITIQUE_ROUGE',
          predictedImpassableDurationDays: 6,
          criticalPoints: [
            'PK 48 : Bourbier de 120m infranchissable aux camions > 5T',
            'PK 92 : Ponton bois dégradé avec risque d\'effondrement sous crue',
            'PK 115 : Débordement rivière Aruwimi'
          ],
          impactedSites: [
            {
              siteName: 'Pont de Franchissement Lindi & Piste Forestière',
              sector: 'BTP / Infrastructure',
              delayDays: 7,
              financialExposureUsd: 480000,
              contingencyAction: 'Acheminement d\'urgence par pirogues motorisées et grue mobile légère.'
            }
          ]
        },
        {
          id: 'risk-02',
          corridorName: 'Axe Kananga - Luiza - Tshikapa (Sables & Gués)',
          roadNumber: 'RN1',
          provinces: 'Kasaï-Central',
          rainfallMm24h: 52,
          soilSaturationPercent: 84,
          riskLevel: 'ELEVE_ORANGE',
          predictedImpassableDurationDays: 4,
          criticalPoints: [
            'Traversée du bac Lulua interrompue pour débit torrentiel',
            'Zone de sables mouvants liquéfiés au PK 65'
          ],
          impactedSites: [
            {
              siteName: 'Forage Solaire & Adduction d\'Eau de Luiza',
              sector: 'WASH / Eau Potable',
              delayDays: 4,
              financialExposureUsd: 220000,
              contingencyAction: 'Stockage temporaire des tuyaux PEHD dans l\'entrepôt relais de Kananga.'
            }
          ]
        },
        {
          id: 'risk-03',
          corridorName: 'Axe Beni - Mutwanga - Kasindi (Pentes Ruwenzori)',
          roadNumber: 'RN2 / Dérivation',
          provinces: 'Nord-Kivu',
          rainfallMm24h: 60,
          soilSaturationPercent: 89,
          riskLevel: 'ELEVE_ORANGE',
          predictedImpassableDurationDays: 3,
          criticalPoints: [
            'PK 34 : Éboulement de talus latéritique sur la piste de dérivation',
            'Coulée de boue dans les lacets de montagne'
          ],
          impactedSites: [
            {
              siteName: 'Micro-Barrage Hydroélectrique de Mutwanga',
              sector: 'Énergie / Électrification',
              delayDays: 3,
              financialExposureUsd: 850000,
              contingencyAction: 'Déblaiement mécanique avec pelleteuse chenillée mise à disposition par le parc.'
            }
          ]
        },
        {
          id: 'risk-04',
          corridorName: 'Axe Matadi - Kimpese - Lukala (Savane Ouest)',
          roadNumber: 'RN1 Ouest',
          provinces: 'Kongo Central',
          rainfallMm24h: 18,
          soilSaturationPercent: 44,
          riskLevel: 'FAIBLE_VERT',
          predictedImpassableDurationDays: 0,
          criticalPoints: [
            'Chaussée asphaltée dégagée',
            'Pistes secondaires praticables en transmission intégrale 4x4'
          ],
          impactedSites: [
            {
              siteName: 'Complexe Silos & Greniers Vivriers de Kimpese',
              sector: 'Agriculture & Sécurité Alimentaire',
              delayDays: 0,
              financialExposureUsd: 0,
              contingencyAction: 'Poursuite nominale du calendrier d\'installation des moulins solaires.'
            }
          ]
        }
      ];
    } else if (weatherScenario === 'MODERATE_RAIN') {
      return [
        {
          id: 'risk-01',
          corridorName: 'Axe Kisangani - Banalia - Buta',
          roadNumber: 'RN4',
          provinces: 'Tshopo & Bas-Uélé',
          rainfallMm24h: 34,
          soilSaturationPercent: 68,
          riskLevel: 'ELEVE_ORANGE',
          predictedImpassableDurationDays: 2,
          criticalPoints: ['Bourbier modéré au PK 48 nécessitant treuillage des convois'],
          impactedSites: [
            {
              siteName: 'Pont de Franchissement Lindi',
              sector: 'BTP',
              delayDays: 2,
              financialExposureUsd: 480000,
              contingencyAction: 'Convois 4x4 légers autorisés.'
            }
          ]
        },
        {
          id: 'risk-02',
          corridorName: 'Axe Kananga - Luiza',
          roadNumber: 'RN1',
          provinces: 'Kasaï-Central',
          rainfallMm24h: 22,
          soilSaturationPercent: 55,
          riskLevel: 'MODERE_JAUNE',
          predictedImpassableDurationDays: 1,
          criticalPoints: ['Ralentissement au bac de la Lulua'],
          impactedSites: [
            {
              siteName: 'Forage Solaire Luiza',
              sector: 'WASH',
              delayDays: 1,
              financialExposureUsd: 220000,
              contingencyAction: 'Vérification préalable par drone avant traversée.'
            }
          ]
        },
        {
          id: 'risk-03',
          corridorName: 'Axe Beni - Mutwanga',
          roadNumber: 'RN2',
          provinces: 'Nord-Kivu',
          rainfallMm24h: 28,
          soilSaturationPercent: 62,
          riskLevel: 'MODERE_JAUNE',
          predictedImpassableDurationDays: 1,
          criticalPoints: ['Fissures de surface sur talus'],
          impactedSites: [
            {
              siteName: 'Micro-Barrage Mutwanga',
              sector: 'Énergie',
              delayDays: 1,
              financialExposureUsd: 850000,
              contingencyAction: 'Surveillance sentinelle.'
            }
          ]
        },
        {
          id: 'risk-04',
          corridorName: 'Axe Matadi - Kimpese',
          roadNumber: 'RN1 Ouest',
          provinces: 'Kongo Central',
          rainfallMm24h: 8,
          soilSaturationPercent: 30,
          riskLevel: 'FAIBLE_VERT',
          predictedImpassableDurationDays: 0,
          criticalPoints: ['Conditions optimales'],
          impactedSites: [
            {
              siteName: 'Silos Kimpese',
              sector: 'Agri',
              delayDays: 0,
              financialExposureUsd: 0,
              contingencyAction: 'Nominal.'
            }
          ]
        }
      ];
    } else {
      // DRY_SEASON
      return [
        {
          id: 'risk-01',
          corridorName: 'Axe Kisangani - Banalia',
          roadNumber: 'RN4',
          provinces: 'Tshopo',
          rainfallMm24h: 2,
          soilSaturationPercent: 18,
          riskLevel: 'FAIBLE_VERT',
          predictedImpassableDurationDays: 0,
          criticalPoints: ['Piste sèche et roulante'],
          impactedSites: [
            {
              siteName: 'Pont Lindi',
              sector: 'BTP',
              delayDays: 0,
              financialExposureUsd: 0,
              contingencyAction: 'Trafic fluide sans restriction.'
            }
          ]
        },
        {
          id: 'risk-02',
          corridorName: 'Axe Kananga - Luiza',
          roadNumber: 'RN1',
          provinces: 'Kasaï-Central',
          rainfallMm24h: 0,
          soilSaturationPercent: 12,
          riskLevel: 'FAIBLE_VERT',
          predictedImpassableDurationDays: 0,
          criticalPoints: ['Piste sablonneuse dégagée'],
          impactedSites: [
            {
              siteName: 'Forage Luiza',
              sector: 'WASH',
              delayDays: 0,
              financialExposureUsd: 0,
              contingencyAction: 'Livraisons nominales.'
            }
          ]
        }
      ];
    }
  }, [weatherScenario]);

  const criticalCorridorsCount = corridorRisks.filter(c => c.riskLevel === 'CRITIQUE_ROUGE' || c.riskLevel === 'ELEVE_ORANGE').length;
  const totalImpactedSitesCount = corridorRisks.reduce((acc, c) => acc + c.impactedSites.length, 0);
  const maxDelayPredictedDays = Math.max(...corridorRisks.flatMap(c => c.impactedSites.map(s => s.delayDays)), 0);
  const totalFinancialExposure = corridorRisks.reduce((acc, c) => acc + c.impactedSites.reduce((sAcc, s) => sAcc + s.financialExposureUsd, 0), 0);

  const handleNotifyLogisticsAlert = () => {
    setAlertSentNotification("Bulletin d'alerte météorologique et prédiction d'impraticabilité diffusé aux superviseurs et entreprises de génie civil via SMS/Satellite !");
    setTimeout(() => setAlertSentNotification(null), 6000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
            <Truck className="w-3.5 h-3.5 text-emerald-700" />
            <span>Flotte de Superviseurs Terrain & Drone Photogrammétrie</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
            Logistique Terrain, Sécurité Agents & Photogrammétrie par Drone
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-semibold overflow-x-auto">
            <button
              onClick={() => setActiveTab('FLEET')}
              className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'FLEET' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Truck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Tournées & Alertes Météo Pistes</span>
            </button>
            <button
              onClick={() => setActiveTab('DRONE_VISION')}
              className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'DRONE_VISION' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Video className="w-3.5 h-3.5 text-sky-700" />
              <span>DroneVisionInspect (Flux Vidéo)</span>
            </button>
            <button
              onClick={() => setActiveTab('DRONE')}
              className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'DRONE' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Plane className="w-3.5 h-3.5 text-sky-700" />
              <span>Drones & Cubatures 3D</span>
            </button>
          </div>

          <button
            onClick={handleTriggerSos}
            className="px-3 py-1.5 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
            title="Bouton d'urgence agent isolé"
          >
            <Shield className="w-3.5 h-3.5 text-rose-200" />
            <span>{sosSent ? 'Signal SOS Relayé !' : 'Test SOS Agent Isolé'}</span>
          </button>
        </div>
      </div>

      {sosSent && (
        <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-900 font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>Alerte SOS cryptée transmise avec succès au centre opérationnel de Kinshasa avec dernières coordonnées GPS WGS84 connues.</span>
        </div>
      )}

      {alertSentNotification && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-950 font-semibold flex items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{alertSentNotification}</span>
          </div>
          <span className="font-mono text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">METTELSAT Sync</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CONTEXTUAL METEOROLOGICAL PREDICTIVE ROAD BLOCKAGE ALERT (SAISON DES PLUIES) */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-slate-950 text-white rounded-2xl p-6 shadow-md border border-amber-900/50 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
              <CloudRain className="w-4 h-4 text-amber-400" />
              <span>Modélisation Météo Prédictive & Vigilance Saison des Pluies RDC (METTELSAT / GPM)</span>
            </div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>Risques Météorologiques d'Enlisement & Prédiction d'Impact sur la Livraison des Chantiers</span>
              {criticalCorridorsCount > 0 && (
                <span className="bg-rose-500/90 text-white text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase animate-pulse">
                  {criticalCorridorsCount} Corridor(s) en Alerte
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Croisement des données de précipitations satellites 24h/72h et de saturation des sols latéritiques pour anticiper les coupures de routes, les pontons submergés et le décalage des livraisons de matériaux BTP.
            </p>
          </div>

          {/* Scenario Selector & Action */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-lg text-xs font-semibold border border-slate-700">
              <button
                type="button"
                onClick={() => setWeatherScenario('PEAK_RAIN')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  weatherScenario === 'PEAK_RAIN' ? 'bg-amber-600 text-white shadow-xs font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                Pic Pluviométrie (Actuel)
              </button>
              <button
                type="button"
                onClick={() => setWeatherScenario('MODERATE_RAIN')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  weatherScenario === 'MODERATE_RAIN' ? 'bg-amber-600 text-white shadow-xs font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                Averses Modérées
              </button>
              <button
                type="button"
                onClick={() => setWeatherScenario('DRY_SEASON')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  weatherScenario === 'DRY_SEASON' ? 'bg-amber-600 text-white shadow-xs font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                Saison Sèche
              </button>
            </div>

            <button
              onClick={handleNotifyLogisticsAlert}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
              title="Diffuser le bulletin d'alerte météo aux conducteurs de travaux"
            >
              <BellRing className="w-3.5 h-3.5" />
              <span>Diffuser Alerte Météo</span>
            </button>
          </div>
        </div>

        {/* Predictive Metrics Scoreboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 backdrop-blur-xs">
            <span className="text-slate-400 text-[11px] block">Corridors Critiques</span>
            <div className="text-2xl font-black font-mono text-rose-400 mt-1">
              {criticalCorridorsCount} sur {corridorRisks.length}
            </div>
            <span className="text-[10px] text-slate-400">Axes à risque d'enlisement élevé</span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 backdrop-blur-xs">
            <span className="text-slate-400 text-[11px] block">Chantiers Affectés Directs</span>
            <div className="text-2xl font-black font-mono text-amber-400 mt-1">
              {totalImpactedSitesCount} site(s)
            </div>
            <span className="text-[10px] text-slate-400">Rupture d'approvisionnement</span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 backdrop-blur-xs">
            <span className="text-slate-400 text-[11px] block">Retard Prédictif Max</span>
            <div className="text-2xl font-black font-mono text-white mt-1">
              +{maxDelayPredictedDays} Jours
            </div>
            <span className="text-[10px] text-amber-300">Force majeure climatique reconnue</span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 backdrop-blur-xs">
            <span className="text-slate-400 text-[11px] block">Fonds Publics Exposés</span>
            <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
              ${totalFinancialExposure.toLocaleString()} USD
            </div>
            <span className="text-[10px] text-slate-400">Tranches de paiement surveillées</span>
          </div>
        </div>

        {/* Predictive Corridor Risk Table & Impact Details */}
        {showWeatherDetails && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-bold uppercase tracking-wider text-[11px] text-amber-400">
                Matrice Météorologique & Prédictions par Corridor Routier (RDC 2026)
              </span>
              <span className="text-slate-400 text-[10px] font-mono">
                Satellite GPM IMERG 0.1° / Stations Physiques In-Situ
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {corridorRisks.map(corridor => {
                const isCritical = corridor.riskLevel === 'CRITIQUE_ROUGE';
                const isElevated = corridor.riskLevel === 'ELEVE_ORANGE';
                return (
                  <div 
                    key={corridor.id}
                    className={`rounded-xl p-4 border text-xs space-y-3 transition-colors ${
                      isCritical
                        ? 'bg-rose-950/40 border-rose-800/80'
                        : isElevated
                          ? 'bg-amber-950/40 border-amber-800/80'
                          : 'bg-slate-900/60 border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-amber-300 text-[11px]">{corridor.roadNumber}</span>
                          <span className="text-slate-400">·</span>
                          <span className="text-slate-300 text-[11px]">{corridor.provinces}</span>
                        </div>
                        <h4 className="font-bold text-white text-sm mt-0.5">{corridor.corridorName}</h4>
                      </div>

                      <div className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        isCritical
                          ? 'bg-rose-500 text-white'
                          : isElevated
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-emerald-600 text-white'
                      }`}>
                        {corridor.riskLevel.replace('_', ' ')}
                      </div>
                    </div>

                    {/* Meteorological Indicators */}
                    <div className="grid grid-cols-3 gap-2 bg-black/30 p-2.5 rounded-lg font-mono text-[11px]">
                      <div>
                        <span className="text-[9px] text-slate-400 block">PLUVIOMETRIE</span>
                        <span className="font-bold text-sky-400 flex items-center gap-1">
                          <Droplets className="w-3 h-3 text-sky-400" />
                          {corridor.rainfallMm24h} mm/24h
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block">SATURATION SOL</span>
                        <span className={`font-bold ${corridor.soilSaturationPercent > 80 ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {corridor.soilSaturationPercent}%
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block">COUPURE ESTIMEE</span>
                        <span className="font-bold text-amber-300">
                          {corridor.predictedImpassableDurationDays > 0 ? `J+${corridor.predictedImpassableDurationDays}` : 'Praticable'}
                        </span>
                      </div>
                    </div>

                    {/* Critical blockage points */}
                    <div className="space-y-1 text-[11px]">
                      <span className="text-slate-400 font-semibold block text-[10px] uppercase">Points de Blocage Identifiés :</span>
                      {corridor.criticalPoints.map((pt, i) => (
                        <div key={i} className="text-slate-200 flex items-start gap-1.5 leading-snug">
                          <span className="text-amber-400">•</span>
                          <span>{pt}</span>
                        </div>
                      ))}
                    </div>

                    {/* Impact on construction site delivery */}
                    <div className="p-2.5 bg-white/5 border border-white/10 rounded-lg space-y-1.5 text-[11px]">
                      <span className="text-amber-300 font-bold block text-[10px] uppercase flex items-center gap-1">
                        <AlertOctagon className="w-3 h-3" />
                        Impact sur Livraison Chantier :
                      </span>
                      {corridor.impactedSites.map((siteItem, sIdx) => (
                        <div key={sIdx} className="space-y-1">
                          <div className="flex items-center justify-between text-white font-semibold">
                            <span>{siteItem.siteName}</span>
                            <span className="font-mono text-rose-300 font-bold">
                              {siteItem.delayDays > 0 ? `+${siteItem.delayDays} jours retard` : 'Aucun retard'}
                            </span>
                          </div>
                          <p className="text-slate-300 text-[10px] italic">
                            Plan d'atténuation : {siteItem.contingencyAction}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Action trigger to inspect via DroneVisionInspect */}
                    <div className="pt-1 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 text-[10px]">
                        Liaison satellite Starlink active
                      </span>
                      <button
                        onClick={() => setActiveTab('DRONE_VISION')}
                        className="text-sky-300 hover:text-sky-100 font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Video className="w-3 h-3" />
                        <span>Inspecter la Zone par Drone</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* PRIMARY TABS CONTENT */}
      {/* ========================================================================= */}

      {/* TAB 1: Route Optimization & Impassable Tracks */}
      {activeTab === 'FLEET' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-900 text-sm">
              Plannings des Tournées Logistiques 4x4 des Superviseurs Terrain
            </span>
            <span className="text-slate-500 font-mono">
              Consommation & Sécurité des Équipes
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fleetRoutes.map(route => (
              <div key={route.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 text-xs">
                <div className="flex items-center justify-between border-b pb-2">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{route.corridorName}</h3>
                    <div className="text-slate-500 font-medium mt-0.5">Agent : {route.agentName} · Date : {route.date}</div>
                  </div>
                  <span className="font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                    {route.totalDistanceKm} km
                  </span>
                </div>

                {/* Rainy Season Road Alert */}
                <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-lg space-y-1.5 text-amber-900">
                  <div className="font-bold flex items-center gap-1.5 text-amber-800">
                    <CloudRain className="w-4 h-4 text-amber-700" />
                    Tronçons Impraticables / Risque d'Enlisement (Saison des Pluies)
                  </div>
                  {route.rainySeasonImpassableTracks.map((trk, i) => (
                    <div key={i} className="text-[11px] text-amber-800 flex items-start gap-1">
                      <span>•</span>
                      <span>{trk}</span>
                    </div>
                  ))}
                </div>

                {/* Scheduled Stops */}
                <div className="space-y-2">
                  <span className="font-bold text-slate-700 block">Étapes d'Inspection Planifiées :</span>
                  {route.stops.map((stp, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-800">{stp.siteName}</div>
                        <div className="text-[10px] text-slate-500">Secteur: {stp.sector}</div>
                      </div>
                      <span className="font-mono font-bold text-slate-700 bg-white px-2 py-1 rounded border border-slate-200">
                        {stp.estimatedArrival}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="text-[11px] text-slate-500 pt-2 border-t flex justify-between">
                  <span>Carburant estimé : <strong>{route.fuelEstimatedLiters} litres</strong> (4x4 Diesel)</span>
                  <span>GPS Tracking actif</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Live Drone Video Streaming & Progress Inspection (DroneVisionInspect) */}
      {activeTab === 'DRONE_VISION' && (
        <DroneVisionInspect sites={sites} />
      )}

      {/* TAB 3: Drone Photogrammetry */}
      {activeTab === 'DRONE' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-900 text-sm">
              Missions Photogrammétriques Aériennes & Calculs de Cubatures 3D
            </span>
            <span className="text-slate-500 font-mono">
              Vecteurs Aériens Autonomes WGS84
            </span>
          </div>

          {droneMissions.map(drone => {
            const site = sites.find(s => s.id === drone.siteId);
            return (
              <div key={drone.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 text-xs">
                <div className="flex items-center justify-between border-b pb-2">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Plane className="w-4 h-4 text-sky-700" />
                      Plan de Vol Autonome & Photogrammétrie Drone
                    </h3>
                    <div className="text-slate-500 text-[11px] mt-0.5">
                      Vecteur aérien : {drone.droneModel} · Site : {site?.name}
                    </div>
                  </div>
                  <span className="font-mono text-sky-800 bg-sky-50 px-2 py-0.5 rounded font-bold">
                    Alt: {drone.altitudeMeters}m AGL
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Résolution Sol (GSD)</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">{drone.groundSampleDistanceCm} cm/pixel</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Photos Cibles</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">{drone.photosTargetCount} clichés</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Temps de Vol Estimé</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">{drone.estimatedFlightMinutes} min</span>
                  </div>
                  <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200">
                    <span className="text-[10px] text-emerald-800 block">Cubature Remblai Calculée</span>
                    <span className="font-mono font-bold text-emerald-900 text-sm">+{drone.cutFillVolumeCalculatedM3} m³</span>
                  </div>
                </div>

                {/* Waypoints preview */}
                <div className="p-3 bg-slate-900 text-white rounded-lg font-mono text-[11px] space-y-1">
                  <span className="text-slate-400 block text-[10px]">Points de Passage Autonomes (Waypoints WGS84) :</span>
                  <div className="flex flex-wrap gap-2 text-emerald-400 text-[10px]">
                    {drone.flightPathWaypoints.map((wp, i) => (
                      <span key={i} className="bg-slate-800 px-2 py-0.5 rounded">
                        WP{i+1}: {wp[0].toFixed(4)}, {wp[1].toFixed(4)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
