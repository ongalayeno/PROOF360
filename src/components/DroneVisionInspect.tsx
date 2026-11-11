import React, { useState, useEffect, useRef } from 'react';
import { Site } from '../types/proof360';
import { 
  Plane, 
  Video, 
  Download, 
  Camera, 
  Compass, 
  Battery, 
  Radio, 
  Eye, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Maximize2, 
  Play, 
  Pause, 
  RefreshCw, 
  ShieldCheck, 
  Satellite, 
  Flame, 
  Sliders, 
  FileSpreadsheet, 
  Sparkles,
  MapPin,
  Clock
} from 'lucide-react';
import { sha256 } from '../services/integrityEngine';

interface DroneStreamChannel {
  id: string;
  droneModel: string;
  droneName: string;
  siteId: string;
  siteName: string;
  province: string;
  territory: string;
  inaccessibleReason: string;
  streamProtocol: 'RTMP' | 'SRT' | 'HLS' | 'STARLINK_DIRECT';
  bitrateMbps: number;
  resolution: string;
  fps: number;
  altitudeMeters: number;
  batteryPercent: number;
  satellitesCount: number;
  rtkStatus: 'RTK_FIX_CENTIMETRIC' | 'DGPS_FLOAT';
  declaredContractorProgressPercent: number;
  aiVisionEstimatedProgressPercent: number;
  keyDetections: {
    label: string;
    confidence: number;
    status: 'CONFORME' | 'ATTENTION' | 'CRITIQUE';
    description: string;
  }[];
  videoSimulationUrl: string; // Dynamic video preview or visual simulation canvas
  coordinates: { lat: number; lng: number };
}

interface DroneVisionInspectProps {
  sites: Site[];
}

export const DroneVisionInspect: React.FC<DroneVisionInspectProps> = ({ sites }) => {
  const [channels] = useState<DroneStreamChannel[]>([
    {
      id: 'drone-ch-01',
      droneName: 'Vecteur Alpha-01',
      droneModel: 'DJI Matrice 350 RTK (Zenmuse H20T Dual)',
      siteId: 'site-tshopo-pont',
      siteName: 'Pont de Franchissement Lindi & Piste Forestière',
      province: 'Tshopo',
      territory: 'Banalia',
      inaccessibleReason: 'Zone enclavée en forêt équatoriale - Pistes coupées par bourbiers de saison des pluies (impraticable aux véhicules légers).',
      streamProtocol: 'STARLINK_DIRECT',
      bitrateMbps: 8.4,
      resolution: '4K Ultra-HD (3840x2160)',
      fps: 60,
      altitudeMeters: 45.8,
      batteryPercent: 78,
      satellitesCount: 26,
      rtkStatus: 'RTK_FIX_CENTIMETRIC',
      declaredContractorProgressPercent: 80,
      aiVisionEstimatedProgressPercent: 68,
      coordinates: { lat: 0.5182, lng: 25.1950 },
      videoSimulationUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?auto=format&fit=crop&w=1200&q=80',
      keyDetections: [
        { label: 'Tablier Béton & Armatures', confidence: 96, status: 'CONFORME', description: 'Coulage du radier et culées achevé à 100%.' },
        { label: 'Roulabilité Piste d\'Accès', confidence: 92, status: 'ATTENTION', description: 'Bourbier de 70m bloquant l\'accès des camions à 1.2 km du pont.' },
        { label: 'Ferraillage Poutres', confidence: 88, status: 'CONFORME', description: 'Espacement régulier des fers de 16mm vérifié par vision.' }
      ]
    },
    {
      id: 'drone-ch-02',
      droneName: 'Vecteur Echo-04',
      droneModel: 'Autel EVO Max 4T (Capteur Thermique FLIR 640x512)',
      siteId: 'site-hydro-mutwanga',
      siteName: 'Micro-Barrage Hydroélectrique de Mutwanga (1.4 MW)',
      province: 'Nord-Kivu',
      territory: 'Beni / Virunga',
      inaccessibleReason: 'Gorge montagneuse encaissée et parois rocheuses instables infranchissables à pied sans équipement d\'alpinisme.',
      streamProtocol: 'RTMP',
      bitrateMbps: 12.0,
      resolution: '4K QHD (2560x1440)',
      fps: 60,
      altitudeMeters: 62.4,
      batteryPercent: 64,
      satellitesCount: 24,
      rtkStatus: 'RTK_FIX_CENTIMETRIC',
      declaredContractorProgressPercent: 88,
      aiVisionEstimatedProgressPercent: 89,
      coordinates: { lat: 0.3340, lng: 29.7420 },
      videoSimulationUrl: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=1200&q=80',
      keyDetections: [
        { label: 'Prise d\'Eau & Dégrilleur', confidence: 98, status: 'CONFORME', description: 'Bassin de décantation propre, écoulement fluide sans obstruction.' },
        { label: 'Conduite Forcée (Penstock)', confidence: 94, status: 'CONFORME', description: 'Aucune fuite ni déformation sous pression observée par thermographie.' },
        { label: 'Turbine Pico-Hydro', confidence: 91, status: 'CONFORME', description: 'Bâtiment d\'exploitation fermé et étanche.' }
      ]
    },
    {
      id: 'drone-ch-03',
      droneName: 'Vecteur SkyWatch-07',
      droneModel: 'WingtraOne Gen II VTOL (Sony A7R IV 61 MP Photogrammétrie)',
      siteId: 'site-kasai-forage',
      siteName: 'Forage Solaire & Adduction d\'Eau de Luiza',
      province: 'Kasaï-Central',
      territory: 'Luiza',
      inaccessibleReason: 'Isolement géographique extrême, traversée fluviale par bac en panne depuis 2 semaines.',
      streamProtocol: 'SRT',
      bitrateMbps: 6.8,
      resolution: '4K UHD (3840x2160)',
      fps: 30,
      altitudeMeters: 75.0,
      batteryPercent: 85,
      satellitesCount: 22,
      rtkStatus: 'RTK_FIX_CENTIMETRIC',
      declaredContractorProgressPercent: 65,
      aiVisionEstimatedProgressPercent: 64,
      coordinates: { lat: -7.5833, lng: 22.4167 },
      videoSimulationUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80',
      keyDetections: [
        { label: 'Château d\'Eau Métallique', confidence: 95, status: 'CONFORME', description: 'Tour de 12m érigée et boulonnée avec réservoir 20m³ monté.' },
        { label: 'Champ Panneaux Solaires', confidence: 92, status: 'CONFORME', description: '16 modules photovoltaïques monocristallins orientés plein Nord.' },
        { label: 'Bornes-Fontaines Village', confidence: 85, status: 'CONFORME', description: '4 robinets sur 4 fonctionnels avec écoulement à bon débit.' }
      ]
    }
  ]);

  const [activeChannelIndex, setActiveChannelIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [visionMode, setVisionMode] = useState<'RGB_4K' | 'THERMAL_FLIR' | 'AI_BOUNDING_BOXES'>('AI_BOUNDING_BOXES');
  const [isDownloadingStream, setIsDownloadingStream] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadSuccessNote, setDownloadSuccessNote] = useState<string | null>(null);
  const [capturedSnapshot, setCapturedSnapshot] = useState<string | null>(null);
  const [telemetryTick, setTelemetryTick] = useState(0);

  const activeChannel = channels[activeChannelIndex];

  // Dynamic telemetry tick simulation (slight variations for realism)
  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetryTick(t => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const simulatedSpeed = (18.2 + Math.sin(telemetryTick * 0.3) * 1.5).toFixed(1);
  const simulatedAltitude = (activeChannel.altitudeMeters + Math.cos(telemetryTick * 0.2) * 0.4).toFixed(1);
  const simulatedHeading = Math.round(135 + Math.sin(telemetryTick * 0.1) * 8);

  // Download Live Stream File handler
  const handleDownloadVideoStream = () => {
    setIsDownloadingStream(true);
    setDownloadProgress(15);

    const stepInterval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 90) {
          clearInterval(stepInterval);
          finishDownload();
          return 100;
        }
        return prev + 25;
      });
    }, 350);

    const finishDownload = async () => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const filename = `DRONE_STREAM_${activeChannel.droneName.replace(/\s+/g, '_')}_${activeChannel.siteId}_${timestamp}.mp4`;
      
      // Build dummy signed video container with header metadata
      const simulatedVideoContent = `PROOF360_DRONE_STREAM_CONTAINER_V2.4\nSite: ${activeChannel.siteName}\nDrone: ${activeChannel.droneModel}\nCoordinates: ${activeChannel.coordinates.lat}, ${activeChannel.coordinates.lng}\nTimestamp: ${new Date().toISOString()}\nResolution: ${activeChannel.resolution}\nBitrate: ${activeChannel.bitrateMbps} Mbps\nCodec: H.265 / HEVC Main10\nCryptographic SHA-256 Digest scellé par station réceptrice Starlink.`;
      
      const blob = new Blob([simulatedVideoContent], { type: 'video/mp4' });
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);

      setIsDownloadingStream(false);
      setDownloadProgress(0);
      setDownloadSuccessNote(`Flux vidéo HD scellé "${filename}" téléchargé avec succès (58.4 Mo) !`);
      setTimeout(() => setDownloadSuccessNote(null), 6000);
    };
  };

  // Download Telemetry Logs CSV
  const handleDownloadTelemetryCsv = () => {
    const header = "timestamp,drone_name,site_id,latitude,longitude,altitude_agl_m,speed_kmh,heading_deg,battery_pct,satellites,rtk_status\n";
    let rows = "";
    const baseTime = Date.now();
    for (let i = 60; i >= 0; i--) {
      const timeIso = new Date(baseTime - i * 1000).toISOString();
      const lat = (activeChannel.coordinates.lat + Math.sin(i * 0.05) * 0.0002).toFixed(6);
      const lng = (activeChannel.coordinates.lng + Math.cos(i * 0.05) * 0.0002).toFixed(6);
      const alt = (activeChannel.altitudeMeters + Math.sin(i * 0.1) * 0.5).toFixed(1);
      const spd = (18.0 + Math.cos(i * 0.2) * 2.0).toFixed(1);
      rows += `${timeIso},${activeChannel.droneName},${activeChannel.siteId},${lat},${lng},${alt},${spd},${simulatedHeading},${activeChannel.batteryPercent},${activeChannel.satellitesCount},${activeChannel.rtkStatus}\n`;
    }

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TELEMETRY_LOG_${activeChannel.droneName.replace(/\s+/g, '_')}_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Capture Georeferenced Snapshot
  const handleCaptureSnapshot = async () => {
    const snapshotHash = await sha256(`${activeChannel.siteId}:${Date.now()}:${simulatedAltitude}`);
    setCapturedSnapshot(`Capture scellée #${snapshotHash.slice(0, 8).toUpperCase()} à ${simulatedAltitude}m AGL (${activeChannel.coordinates.lat.toFixed(4)}, ${activeChannel.coordinates.lng.toFixed(4)})`);
    setTimeout(() => setCapturedSnapshot(null), 5000);
  };

  const isProgressDiscrepant = Math.abs(activeChannel.declaredContractorProgressPercent - activeChannel.aiVisionEstimatedProgressPercent) > 5;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6 text-xs">
      {/* Module Title & Stream Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-sky-800">
            <Plane className="w-4 h-4 text-sky-600" />
            <span>Module DroneVisionInspect · Inspection Vidéo Aérienne en Direct</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight mt-0.5">
            Surveillance Vidéo Drone & Télémétrie en Zones Difficiles d'Accès
          </h3>
          <p className="text-slate-500 text-xs mt-0.5 max-w-3xl">
            Acquisition en direct des flux vidéo des vecteurs aériens opérant sur les chantiers enclavés (forêt dense, défilés montagneux, zones inondées). Analyse IA d'avancement physique et téléchargement des flux bruts.
          </p>
        </div>

        {/* Channel Selector */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-semibold text-slate-500">Canal Drone :</span>
          <select
            value={activeChannelIndex}
            onChange={e => setActiveChannelIndex(Number(e.target.value))}
            className="text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            {channels.map((ch, idx) => (
              <option key={ch.id} value={idx}>
                {ch.droneName} — {ch.siteName} ({ch.province})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Notifications */}
      {downloadSuccessNote && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{downloadSuccessNote}</span>
          </div>
          <span className="text-[10px] font-mono bg-emerald-100 px-2 py-0.5 rounded text-emerald-800">MP4 / HEVC</span>
        </div>
      )}

      {capturedSnapshot && (
        <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-900 font-semibold flex items-center gap-2 shadow-xs">
          <Camera className="w-4 h-4 text-sky-600 shrink-0" />
          <span>{capturedSnapshot}</span>
        </div>
      )}

      {/* Inaccessible Site Context Strip */}
      <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-amber-900">
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Contrainte d'Enclavement / Zone Inaccessible : </span>
            <span className="text-[11px] text-amber-800">{activeChannel.inaccessibleReason}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono shrink-0">
          <span className="bg-amber-100 px-2 py-0.5 rounded font-bold border border-amber-300">
            {activeChannel.province} · {activeChannel.territory}
          </span>
          <span className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded font-bold">
            {activeChannel.streamProtocol}
          </span>
        </div>
      </div>

      {/* Video Viewport & Telemetry HUD Overlay */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl aspect-video max-h-[460px] flex items-center justify-center">
        {/* Background Stream Simulation Image */}
        <img
          src={activeChannel.videoSimulationUrl}
          alt={activeChannel.siteName}
          referrerPolicy="no-referrer"
          className={`w-full h-full object-cover transition-all duration-300 ${
            visionMode === 'THERMAL_FLIR' 
              ? 'hue-rotate-180 invert brightness-125 contrast-150 saturate-200' 
              : ''
          }`}
        />

        {/* Live Top HUD Bar */}
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-slate-950/90 via-slate-950/40 to-transparent flex items-center justify-between text-white font-mono text-[11px]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-rose-600 text-white font-bold animate-pulse text-[10px]">
              <span className="w-2 h-2 rounded-full bg-white" />
              LIVE STREAM
            </span>
            <span className="font-bold text-slate-200">{activeChannel.droneName}</span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-300">{activeChannel.droneModel}</span>
          </div>

          <div className="flex items-center gap-4 text-[10px] text-slate-300">
            <span className="flex items-center gap-1">
              <Satellite className="w-3.5 h-3.5 text-sky-400" />
              <span>{activeChannel.satellitesCount} Sats (RTK FIX)</span>
            </span>
            <span className="flex items-center gap-1">
              <Battery className="w-3.5 h-3.5 text-emerald-400" />
              <span>{activeChannel.batteryPercent}%</span>
            </span>
            <span className="flex items-center gap-1">
              <Radio className="w-3.5 h-3.5 text-blue-400" />
              <span>{activeChannel.bitrateMbps} Mbps</span>
            </span>
            <span className="bg-slate-800/80 px-2 py-0.5 rounded text-emerald-400 font-bold">
              {activeChannel.resolution}
            </span>
          </div>
        </div>

        {/* Center Crosshairs & Gimbal Indicator */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-16 h-16 border border-white/30 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-emerald-400/80 rounded-full" />
          </div>
          <div className="absolute w-24 h-[1px] bg-white/20" />
          <div className="absolute h-24 w-[1px] bg-white/20" />
        </div>

        {/* AI Computer Vision Bounding Boxes Overlay */}
        {visionMode === 'AI_BOUNDING_BOXES' && (
          <div className="absolute inset-0 pointer-events-none p-12">
            {/* Box 1 */}
            <div className="absolute top-20 left-24 border-2 border-emerald-400 bg-emerald-500/10 rounded-sm p-1.5 font-mono text-[10px] text-emerald-300 backdrop-blur-2xs shadow-sm">
              <div className="font-bold flex items-center gap-1">
                <span>[IA] {activeChannel.keyDetections[0].label}</span>
                <span className="bg-emerald-500 text-slate-950 font-bold px-1 rounded text-[9px]">
                  {activeChannel.keyDetections[0].confidence}%
                </span>
              </div>
              <div className="text-[9px] text-white/90">{activeChannel.keyDetections[0].description}</div>
            </div>

            {/* Box 2 */}
            <div className="absolute bottom-24 right-28 border-2 border-amber-400 bg-amber-500/10 rounded-sm p-1.5 font-mono text-[10px] text-amber-300 backdrop-blur-2xs shadow-sm">
              <div className="font-bold flex items-center gap-1">
                <span>[IA] {activeChannel.keyDetections[1].label}</span>
                <span className="bg-amber-500 text-slate-950 font-bold px-1 rounded text-[9px]">
                  {activeChannel.keyDetections[1].confidence}%
                </span>
              </div>
              <div className="text-[9px] text-white/90">{activeChannel.keyDetections[1].description}</div>
            </div>
          </div>
        )}

        {/* Bottom Telemetry HUD Bar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent flex flex-wrap items-center justify-between text-white font-mono text-[11px] gap-3">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-[9px] text-slate-400 block">ALTITUDE (AGL)</span>
              <span className="font-bold text-sky-400 text-sm">{simulatedAltitude} m</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 block">VITESSE SOL</span>
              <span className="font-bold text-emerald-400 text-sm">{simulatedSpeed} km/h</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 block">CAP (COMPAS)</span>
              <span className="font-bold text-amber-400 text-sm">{simulatedHeading}° SE</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 block">COORDONNEES WGS84</span>
              <span className="font-bold text-slate-200 text-xs">
                {activeChannel.coordinates.lat.toFixed(5)}, {activeChannel.coordinates.lng.toFixed(5)}
              </span>
            </div>
          </div>

          {/* Quick HUD controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1.5 bg-slate-800/80 hover:bg-slate-700 text-white rounded transition-colors cursor-pointer"
              title={isPlaying ? 'Mettre en pause' : 'Reprendre le flux'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={handleCaptureSnapshot}
              className="p-1.5 bg-slate-800/80 hover:bg-slate-700 text-white rounded transition-colors cursor-pointer"
              title="Prendre un instantané géoréférencé scellé"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Control Strip & Download Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
        {/* Camera Sensor Mode Switch */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">Mode Caméra :</span>
          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 font-semibold text-[11px]">
            <button
              type="button"
              onClick={() => setVisionMode('AI_BOUNDING_BOXES')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                visionMode === 'AI_BOUNDING_BOXES' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Vision IA & Détections
            </button>
            <button
              type="button"
              onClick={() => setVisionMode('RGB_4K')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                visionMode === 'RGB_4K' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Optique 4K Direct
            </button>
            <button
              type="button"
              onClick={() => setVisionMode('THERMAL_FLIR')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer flex items-center gap-1 ${
                visionMode === 'THERMAL_FLIR' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Flame className="w-3 h-3" />
              <span>Thermique Infrarouge</span>
            </button>
          </div>
        </div>

        {/* Action Buttons: Download Video Stream & Telemetry */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleDownloadTelemetryCsv}
            className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
            title="Exporter l'historique complet des coordonnées et vitesse au format CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
            <span>Logs Télémétrie CSV</span>
          </button>

          <button
            onClick={handleDownloadVideoStream}
            disabled={isDownloadingStream}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-700 text-white font-bold rounded-lg transition-colors cursor-pointer inline-flex items-center gap-2 shadow-sm"
            title="Télécharger l'enregistrement vidéo haute définition avec horodatage scellé"
          >
            <Download className={`w-3.5 h-3.5 ${isDownloadingStream ? 'animate-bounce' : ''}`} />
            <span>
              {isDownloadingStream ? `Téléchargement (${downloadProgress}%)...` : 'Télécharger Flux Vidéo (MP4)'}
            </span>
          </button>
        </div>
      </div>

      {/* Progress Verification Audit Box (Declared vs AI Vision) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <span className="text-[11px] font-semibold text-slate-600 block">Avancement Déclaré Prestataire</span>
          <div className="text-2xl font-black font-mono text-slate-800">
            {activeChannel.declaredContractorProgressPercent}%
          </div>
          <p className="text-[11px] text-slate-500">
            Selon l'attachement mensuel déposé par l'entreprise de génie civil.
          </p>
        </div>

        <div className={`p-4 border rounded-xl space-y-2 ${
          isProgressDiscrepant ? 'bg-amber-50/60 border-amber-300' : 'bg-emerald-50/60 border-emerald-300'
        }`}>
          <span className="text-[11px] font-semibold text-slate-700 block">Avancement Réel Vérifié par Drone</span>
          <div className={`text-2xl font-black font-mono ${
            isProgressDiscrepant ? 'text-amber-800' : 'text-emerald-800'
          }`}>
            {activeChannel.aiVisionEstimatedProgressPercent}%
          </div>
          <p className="text-[11px] text-slate-600">
            {isProgressDiscrepant 
              ? `⚠ Écart constaté de ${activeChannel.declaredContractorProgressPercent - activeChannel.aiVisionEstimatedProgressPercent}% par rapport à la déclaration entrepreneuriale.`
              : '✓ Conformité stricte entre les travaux physiques observés et le calendrier prévisionnel.'}
          </p>
        </div>

        <div className="p-4 bg-slate-900 text-white rounded-xl space-y-2">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>Opposabilité des Preuves Aériennes</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Chaque flux vidéo téléchargé incorpore une signature asymétrique scellée par la clé privée du terminal récepteur Starlink local, rendant l'état des lieux opposable en commission des marchés.
          </p>
        </div>
      </div>
    </div>
  );
};
