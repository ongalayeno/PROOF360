import React, { useState } from 'react';
import { 
  Mission, 
  Site, 
  FieldResponse, 
  DeviceMetadata, 
  CrackSpallingAnalysis, 
  TreeCountAnalysis, 
  EquipmentOcrVerification, 
  NfcTamperProofCheck, 
  GnssRtkReading, 
  IridiumMicroPacket, 
  GhostSecurityState 
} from '../types/proof360';
import { PROTOCOLS } from '../data/protocols';
import { 
  Smartphone, 
  Wifi, 
  WifiOff, 
  Camera, 
  UploadCloud, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  RefreshCw, 
  ChevronRight, 
  Eye, 
  Radio, 
  Footprints,
  ShieldAlert,
  Cpu,
  Lock,
  Unlock,
  Scan,
  Binary,
  Trees,
  SearchCheck,
  Crosshair,
  Sparkles,
  Send
} from 'lucide-react';
import { sha256 } from '../services/integrityEngine';
import { 
  computePerceptualHash, 
  detectRecycledPhoto, 
  analyzeEvidenceWithComputerVision, 
  extractGnssConstellationData, 
  generateInspectorBreadcrumbs,
  analyzeConcreteCracksAndSpalling,
  analyzeTreeCountAndSurvival,
  verifyEquipmentPlateOcr,
  verifyNfcConcreteTag,
  readGnssRtkCentimeterFix,
  compressIridiumMicroPacket,
  toggleGhostSecurityMode
} from '../services/advancedIntegrityService';

interface MobileAgentSimulatorProps {
  missions: Mission[];
  sites: Site[];
  preselectedMissionId?: string;
  onSyncBatch: (inspectionPayload: {
    missionId: string;
    siteId: string;
    agentName: string;
    protocolCode: string;
    responses: FieldResponse[];
    deviceMetadata: DeviceMetadata;
  }) => Promise<void>;
  onInspectSubmitted: (missionId: string) => void;
}

export const MobileAgentSimulator: React.FC<MobileAgentSimulatorProps> = ({
  missions,
  sites,
  preselectedMissionId,
  onSyncBatch,
  onInspectSubmitted
}) => {
  const [selectedMissionId, setSelectedMissionId] = useState<string>(
    preselectedMissionId || missions[0]?.id || ''
  );

  // Network connection simulation
  const [networkState, setNetworkState] = useState<'4G' | 'EDGE_2G' | 'OFFLINE'>('4G');
  const [outboxQueue, setOutboxQueue] = useState<Array<{
    id: string;
    missionId: string;
    timestamp: string;
    responses: FieldResponse[];
  }>>([]);

  const activeMission = missions.find(m => m.id === selectedMissionId) || missions[0];
  const protocol = PROTOCOLS[activeMission?.protocolCode || 'PVS-WASH-001'];

  // Form responses
  const [formValues, setFormValues] = useState<Record<string, any>>({
    wash_site_exists: true,
    wash_slab_condition: 'CONFORME_SANS_FISSURE',
    wash_drainage_canal_meters: 4.5,
    wash_water_flows: true,
    wash_flow_rate_liters_minute: 16.5,
    wash_turbidity_visual: 'LIMPIDE_CLAIRE',
    wash_ph_measurement: 7.1,
    btp_site_exists: true,
    btp_classrooms_count: 6,
    btp_roof_condition: 'CONFORME_SANS_FUITE',
    solar_modules_installed_count: 48,
    solar_inverter_voltage_ac: 226,
    health_fridge_operational: true,
    health_cold_chain_temp_celsius: 4.2,
    health_datalogger_compliance: 'AUCUNE_EXCURSION_30J',
    health_delivery_slip_match: true,
    health_items_counted_total: 4550,
    health_expired_drugs_found: false,
    health_tamper_packaging_intact: true,
    mine_bpu_materials_conforming: true,
    mine_local_workforce_ratio_percent: 82.5,
    mine_cld_reception_signed: true,
    agri_silo_moisture_percent: 12.4,
    agri_pest_proof_condition: 'PARFAITE_ETANCHEITE',
    agri_mill_operational: true,
    agri_track_passability: 'PRATICABLE_TOUT_VEHICULE'
  });

  // Captured photos & computed SHA256 hashes
  const [capturedPhotos, setCapturedPhotos] = useState<Record<string, {
    url: string;
    hash: string;
    sizeKb: number;
    coords: { lat: number; lng: number };
    isMock: boolean;
  }>>({
    wash_photo_panoramic: {
      url: '/src/assets/images/hero_field_inspection_1793818308219.jpg',
      hash: '5d41402abc4b2a76b9719d911017c592b0c36a4613c983d98ecbe1432f703567',
      sizeKb: 312,
      coords: { lat: activeMission?.site.coordinates.lat || -4.3168, lng: activeMission?.site.coordinates.lng || 15.6542 },
      isMock: false
    },
    wash_photo_slab_and_drain: {
      url: '/src/assets/images/wash_water_borehole_1793818308094.jpg',
      hash: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
      sizeKb: 284,
      coords: { lat: activeMission?.site.coordinates.lat || -4.3168, lng: activeMission?.site.coordinates.lng || 15.6542 },
      isMock: false
    }
  });

  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState('');

  // Enhanced Anti-Fraud & Hardware state
  const [activeGnss, setActiveGnss] = useState(
    extractGnssConstellationData(-4.3168, 15.6542, false)
  );
  const [cvAnalysisResult, setCvAnalysisResult] = useState<Record<string, any>>({});
  const [breadcrumbsSummary, setBreadcrumbsSummary] = useState(
    generateInspectorBreadcrumbs(-4.3168, 15.6542, 28)
  );

  // New Features: Edge AI, Hardware Proof, Ghost Mode & Iridium
  const [ghostMode, setGhostMode] = useState<GhostSecurityState>({
    isEnabled: false,
    duressPinTriggered: false,
    hiddenVaultEncrypted: false,
    decryptionOnlyKinshasaHQ: false
  });
  const [duressInputPin, setDuressInputPin] = useState('');
  const [nfcTagResult, setNfcTagResult] = useState<NfcTamperProofCheck | null>(null);
  const [rtkGnssResult, setRtkGnssResult] = useState<GnssRtkReading | null>(null);
  const [iridiumPacket, setIridiumPacket] = useState<IridiumMicroPacket | null>(null);
  const [edgeAiActiveModule, setEdgeAiActiveModule] = useState<'CRACK' | 'TREE' | 'OCR' | null>(null);
  const [crackAnalysis, setCrackAnalysis] = useState<CrackSpallingAnalysis | null>(null);
  const [treeAnalysis, setTreeAnalysis] = useState<TreeCountAnalysis | null>(null);
  const [ocrAnalysis, setOcrAnalysis] = useState<EquipmentOcrVerification | null>(null);

  // Handle taking a photo simulation with WebP compression, real SHA-256, and CV/pHash
  const handleSimulatePhotoCapture = async (fieldId: string) => {
    setIsProcessingPhoto(true);
    try {
      let photoUrl = '/src/assets/images/wash_water_borehole_1793818308094.jpg';
      if (fieldId.includes('panoramic') || fieldId.includes('facade')) {
        photoUrl = activeMission.site.sector === 'BTP' 
          ? '/src/assets/images/btp_school_site_1793818310024.jpg' 
          : '/src/assets/images/hero_field_inspection_1793818308219.jpg';
      } else if (fieldId.includes('solar') || fieldId.includes('array')) {
        photoUrl = '/src/assets/images/solar_minigrid_site_1793818309290.jpg';
      }

      const simulatedPayload = `${photoUrl}-${fieldId}-${Date.now()}-${activeMission.site.coordinates.lat}`;
      const calculatedHash = await sha256(simulatedPayload);
      const pHash = await computePerceptualHash(photoUrl, activeMission.site.id);

      const cvResult = analyzeEvidenceWithComputerVision(
        fieldId,
        formValues[fieldId] || '16.5',
        pHash,
        false
      );

      setCvAnalysisResult(prev => ({
        ...prev,
        [fieldId]: cvResult
      }));

      const gnssData = extractGnssConstellationData(
        activeMission.site.coordinates.lat,
        activeMission.site.coordinates.lng,
        false
      );
      setActiveGnss(gnssData);

      setCapturedPhotos(prev => ({
        ...prev,
        [fieldId]: {
          url: photoUrl,
          hash: calculatedHash,
          sizeKb: Math.floor(250 + Math.random() * 80),
          coords: {
            lat: activeMission.site.coordinates.lat + (Math.random() - 0.5) * 0.0002,
            lng: activeMission.site.coordinates.lng + (Math.random() - 0.5) * 0.0002
          },
          isMock: false
        }
      }));
    } finally {
      setIsProcessingPhoto(false);
    }
  };

  // Submit or Queue in Outbox
  const handleFormSubmit = async () => {
    if (!activeMission) return;

    const responses: FieldResponse[] = [];
    protocol.sections.forEach(sec => {
      sec.fields.forEach(f => {
        const val = formValues[f.id] !== undefined ? formValues[f.id] : true;
        const photo = capturedPhotos[f.id];

        if (f.type === 'PHOTO' && photo) {
          responses.push({
            fieldId: f.id,
            value: `Preuve photo validée (${photo.sizeKb} Ko)`,
            evidence: {
              id: `ev-${Date.now()}-${f.id}`,
              inspectionId: `insp-pending-${Date.now()}`,
              fieldId: f.id,
              fileKey: `evidence/${activeMission.site.sector.toLowerCase()}/${f.id}.webp`,
              imageUrl: photo.url,
              fileHashSha256: photo.hash,
              mimeType: 'image/webp',
              fileSizeBytes: photo.sizeKb * 1024,
              coordinates: photo.coords,
              accuracyMeters: rtkGnssResult?.isCentimeterCertified ? 0.02 : 3.5,
              isMockGps: photo.isMock,
              distanceToSiteMeters: 14,
              integrityFlags: [],
              capturedAt: new Date().toISOString()
            }
          });
        } else {
          responses.push({
            fieldId: f.id,
            value: val
          });
        }
      });
    });

    const deviceMetadata: DeviceMetadata = {
      deviceModel: 'Samsung Galaxy A15 LTE (RDC Deploy)',
      osVersion: 'Android 14 (API 34)',
      appVersion: 'PROOF360 Capture v1.4.2',
      batteryLevelPercent: 82,
      isRooted: false,
      networkType: networkState === 'OFFLINE' ? 'OFFLINE' : networkState === 'EDGE_2G' ? 'EDGE_2G' : '4G'
    };

    if (networkState === 'OFFLINE') {
      setOutboxQueue(prev => [
        ...prev,
        {
          id: `queue-${Date.now()}`,
          missionId: activeMission.id,
          timestamp: new Date().toISOString(),
          responses
        }
      ]);
      setSyncSuccessMsg('Inspection enregistrée dans la base SQLite locale (Hors-ligne). Elle sera téléversée au retour du signal.');
      setTimeout(() => setSyncSuccessMsg(''), 5000);
    } else {
      setIsSyncing(true);
      try {
        await onSyncBatch({
          missionId: activeMission.id,
          siteId: activeMission.site.id,
          agentName: 'Ing. Patient Mukendi',
          protocolCode: protocol.code,
          responses,
          deviceMetadata
        });
        setSyncSuccessMsg('Synchronisation réussie ! Inspection soumise avec succès au Reviewer QA.');
        setTimeout(() => setSyncSuccessMsg(''), 4000);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  // Hardware Anchoring: Scan NFC Tag
  const handleScanNfcTag = () => {
    const result = verifyNfcConcreteTag(activeMission.site.id);
    setNfcTagResult(result);
    setSyncSuccessMsg(`Puce NFC industrielle scellée détectée à 1.8 cm ! ID: ${result.concreteEmbeddedId}`);
    setTimeout(() => setSyncSuccessMsg(''), 4000);
  };

  // Hardware Anchoring: Connect GNSS RTK
  const handleConnectGnssRtk = () => {
    const rtk = readGnssRtkCentimeterFix(activeMission.site.coordinates.lat, activeMission.site.coordinates.lng);
    setRtkGnssResult(rtk);
    setSyncSuccessMsg('Antenne Emlid Reach RS2+ connectée via Bluetooth : Précision centimétrique 1.4 cm certifiée.');
    setTimeout(() => setSyncSuccessMsg(''), 4000);
  };

  // Extreme Resilience: Iridium 32-Byte SBD Packet
  const handleTransmitIridium = async () => {
    const packet = await compressIridiumMicroPacket(
      activeMission.site.id,
      1,
      activeMission.site.coordinates.lat,
      activeMission.site.coordinates.lng,
      '5d41402abc4b2a76b9719d911017c592'
    );
    setIridiumPacket(packet);
    setSyncSuccessMsg('Micro-paquet Iridium SBD (32 octets) émis avec succès vers la constellation satellite Iridium NEXT !');
    setTimeout(() => setSyncSuccessMsg(''), 5000);
  };

  // Extreme Resilience: Ghost Security Mode (Duress PIN)
  const handleDuressPinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (duressInputPin === '0000' || duressInputPin === '1234') {
      const ghost = toggleGhostSecurityMode(true, true);
      setGhostMode(ghost);
      setDuressInputPin('');
      setSyncSuccessMsg('Code de contrainte déclenché : Les données d’inspection ont été chiffrées dans un coffre masqué. L’écran affiche une interface factice inoffensive.');
      setTimeout(() => setSyncSuccessMsg(''), 6000);
    } else {
      const ghost = toggleGhostSecurityMode(true, false);
      setGhostMode(ghost);
      setDuressInputPin('');
    }
  };

  // Edge AI Trigger
  const handleRunEdgeAi = (moduleType: 'CRACK' | 'TREE' | 'OCR') => {
    setEdgeAiActiveModule(moduleType);
    if (moduleType === 'CRACK') {
      setCrackAnalysis(analyzeConcreteCracksAndSpalling(true));
    } else if (moduleType === 'TREE') {
      setTreeAnalysis(analyzeTreeCountAndSurvival(78));
    } else if (moduleType === 'OCR') {
      setOcrAnalysis(verifyEquipmentPlateOcr('Grundfos', 'SQFlex 5A'));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Context Strip */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Smartphone className="w-3.5 h-3.5 text-emerald-700" />
            <span>ProofCapture Engine · Terminal Android Hors-ligne, Edge AI & Ancrage Matériel</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
            Simulateur d'Application Mobile Terrain & Résilience Extrême
          </h2>
        </div>

        {/* Network & Resilience Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Peer to Peer / Starlink Sync Simulation */}
          <button
            onClick={() => {
              setSyncSuccessMsg('Synchronisation Peer-to-Peer locale initiée via Wi-Fi Direct vers le pick-up Starlink.');
              setTimeout(() => setSyncSuccessMsg(''), 4000);
            }}
            className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
            title="Synchronisation Bluetooth / Wi-Fi Direct vers Starlink en zone blanche"
          >
            <Radio className="w-3.5 h-3.5 text-sky-600" />
            <span>P2P / Starlink Mesh</span>
          </button>

          {/* Iridium Satellite Micro-packet */}
          <button
            onClick={handleTransmitIridium}
            className="px-2.5 py-1 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
            title="Envoi micro-paquet 32 octets par satellite Iridium sans réseau cellulaire"
          >
            <Binary className="w-3.5 h-3.5 text-purple-600" />
            <span>Iridium Satellite (32o)</span>
          </button>

          {/* Network Toggle Simulator */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs">
            <span className="text-slate-500 font-medium px-1 text-[11px]">Réseau :</span>
            <button
              onClick={() => setNetworkState('4G')}
              className={`px-2 py-0.5 rounded font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                networkState === '4G' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Wifi className="w-3 h-3 text-emerald-600" />
              <span>4G</span>
            </button>
            <button
              onClick={() => setNetworkState('EDGE_2G')}
              className={`px-2 py-0.5 rounded font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                networkState === 'EDGE_2G' ? 'bg-white text-amber-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Wifi className="w-3 h-3 text-amber-600" />
              <span>TUS (2G)</span>
            </button>
            <button
              onClick={() => setNetworkState('OFFLINE')}
              className={`px-2 py-0.5 rounded font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                networkState === 'OFFLINE' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <WifiOff className="w-3 h-3 text-rose-400" />
              <span>Hors-Ligne</span>
            </button>
          </div>
        </div>
      </div>

      {syncSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-semibold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{syncSuccessMsg}</span>
        </div>
      )}

      {/* Main Grid: Control Panels on Left & Phone Simulator on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Edge AI, Hardware Proof & Ghost Security Toolbox */}
        <div className="lg:col-span-5 space-y-4 text-xs">
          {/* Card 1: Edge AI Suite */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-emerald-700" />
                <span>Suite Vision par Ordinateur Embarquée (Edge AI)</span>
              </span>
              <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                In-Device AI
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleRunEdgeAi('CRACK')}
                className={`p-2 rounded-lg border text-left font-semibold cursor-pointer transition-colors ${
                  edgeAiActiveModule === 'CRACK' ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <SearchCheck className="w-3.5 h-3.5 mb-1 text-rose-600" />
                <span className="block text-[11px]">Fissures Béton</span>
              </button>

              <button
                onClick={() => handleRunEdgeAi('TREE')}
                className={`p-2 rounded-lg border text-left font-semibold cursor-pointer transition-colors ${
                  edgeAiActiveModule === 'TREE' ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Trees className="w-3.5 h-3.5 mb-1 text-emerald-600" />
                <span className="block text-[11px]">Pépinière Carbone</span>
              </button>

              <button
                onClick={() => handleRunEdgeAi('OCR')}
                className={`p-2 rounded-lg border text-left font-semibold cursor-pointer transition-colors ${
                  edgeAiActiveModule === 'OCR' ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Scan className="w-3.5 h-3.5 mb-1 text-blue-600" />
                <span className="block text-[11px]">OCR Plaque BPU</span>
              </button>
            </div>

            {/* Edge AI Active Result Box */}
            {edgeAiActiveModule === 'CRACK' && crackAnalysis && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg space-y-1.5">
                <div className="flex items-center justify-between font-bold text-rose-950">
                  <span>Analyse Fissures Béton (Crack & Spalling)</span>
                  <span className="font-mono text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded">Risque : {crackAnalysis.structuralRiskLevel}</span>
                </div>
                <div className="text-[11px] text-rose-900">
                  {crackAnalysis.cracksDetectedCount} fissure(s) détectée(s) · Ouverture maximale mesurée : <strong>{crackAnalysis.maxCrackWidthMm} mm</strong>.
                </div>
                <div className="text-[10px] text-rose-800 italic">
                  Écaillage du béton (spalling) avéré. Une réserve pour réfection d'enrobage a été enregistrée.
                </div>
              </div>
            )}

            {edgeAiActiveModule === 'TREE' && treeAnalysis && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg space-y-1.5">
                <div className="flex items-center justify-between font-bold text-emerald-950">
                  <span>Comptage Arbres & Survie Carbone (PVS-ENV)</span>
                  <span className="font-mono text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">{treeAnalysis.standardCompliance}</span>
                </div>
                <div className="text-[11px] text-emerald-900">
                  {treeAnalysis.healthySurvivalCount} plants sains / {treeAnalysis.treesDetectedTotal} recensés (Taux de survie : <strong>{treeAnalysis.survivalRatePercent}%</strong>).
                </div>
                <div className="text-[10px] text-emerald-800">
                  Volume carbone certifiable débloqué : <strong>{treeAnalysis.carbonCreditsEligibleTons} tCO2e</strong> (Conforme Verra VCS).
                </div>
              </div>
            )}

            {edgeAiActiveModule === 'OCR' && ocrAnalysis && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-1.5">
                <div className="flex items-center justify-between font-bold text-blue-950">
                  <span>Vérification Plaque Signalétique Constructeur</span>
                  <span className="font-mono text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">{ocrAnalysis.counterfeitRiskLevel}</span>
                </div>
                <div className="text-[11px] text-blue-900">
                  Modèle scanné : <strong>{ocrAnalysis.scannedManufacturer} {ocrAnalysis.scannedModelNumber}</strong> (S/N: {ocrAnalysis.scannedSerialNumber}).
                </div>
                <div className="text-[10px] text-blue-800">
                  Correspondance bordereau contrat BPU : <strong>100% Conforme</strong> (Matériel authentique certifié).
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Hardware Proof & Physical Anchoring */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <Crosshair className="w-4 h-4 text-blue-700" />
                <span>Ancrage Matériel & Anti-Fraude Physique</span>
              </span>
              <span className="text-[10px] font-mono bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded font-bold">
                Hardware Seal
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleScanNfcTag}
                className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left font-semibold text-slate-800 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-1.5 text-emerald-700 mb-1">
                  <Scan className="w-3.5 h-3.5" />
                  <span>Scanner Tag NFC Béton</span>
                </div>
                <span className="text-[10px] text-slate-500 block font-normal">Puce scellée à la coulée (Ed25519)</span>
              </button>

              <button
                onClick={handleConnectGnssRtk}
                className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left font-semibold text-slate-800 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-1.5 text-blue-700 mb-1">
                  <Crosshair className="w-3.5 h-3.5" />
                  <span>Antenne GNSS RTK</span>
                </div>
                <span className="text-[10px] text-slate-500 block font-normal">Précision centimétrique &lt; 5 cm</span>
              </button>
            </div>

            {nfcTagResult && (
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-[10px] space-y-0.5">
                <div className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>UID NFC : {nfcTagResult.nfcTagUid} (Présence Physique Certifiée)</span>
                </div>
                <div className="text-slate-500">Signature matérielle : {nfcTagResult.hardwareCurve25519Signature.slice(0, 32)}...</div>
              </div>
            )}

            {rtkGnssResult && (
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-[10px] space-y-0.5">
                <div className="text-blue-700 font-bold flex items-center gap-1">
                  <Crosshair className="w-3 h-3" />
                  <span>{rtkGnssResult.antennaModel} · Statut : {rtkGnssResult.rtkFixStatus}</span>
                </div>
                <div className="text-slate-500">Précision H: {rtkGnssResult.horizontalAccuracyCm} cm · V: {rtkGnssResult.verticalAccuracyCm} cm · Correction: {rtkGnssResult.baseStationCorrectionAgeSec}s</div>
              </div>
            )}
          </div>

          {/* Card 3: Ghost Security Mode (Duress Protection in Tension Areas) */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-700" />
                <span>Mode "Ghost / Sécurité Agent" en Zone de Tension</span>
              </span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                ghostMode.duressPinTriggered ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
              }`}>
                {ghostMode.duressPinTriggered ? 'CONTRAINTE ACTIVE' : 'VEILLE SÉCURITÉ'}
              </span>
            </div>

            <p className="text-slate-500 text-[11px] leading-relaxed">
              En cas de contrôle forcé à une barrière illégale ou de tentative de saisie du smartphone : entrez le <strong>Code de Contrainte (0000)</strong> pour chiffrer immédiatement les photos dans un coffre masqué.
            </p>

            <form onSubmit={handleDuressPinSubmit} className="flex items-center gap-2">
              <input
                type="password"
                maxLength={4}
                value={duressInputPin}
                onChange={e => setDuressInputPin(e.target.value)}
                placeholder="PIN d'urgence (0000)"
                className="w-32 p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-center font-mono text-xs tracking-widest focus:outline-none"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs cursor-pointer inline-flex items-center gap-1"
              >
                <Lock className="w-3 h-3" />
                <span>Déclencher Coffre Masqué</span>
              </button>
            </form>

            {ghostMode.duressPinTriggered && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-900 text-[11px] font-semibold space-y-1">
                <div className="flex items-center gap-1 text-rose-700">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Coffre-fort chiffré verrouillé avec succès</span>
                </div>
                <div className="text-[10px] text-rose-800 font-normal">
                  Seule la clé maîtresse détenue au QG Central de Kinshasa peut déverrouiller les fichiers après retour en zone sécurisée.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Smartphone Device Frame */}
        <div className="lg:col-span-7 flex justify-center">
          <div className="w-full max-w-[420px] bg-slate-900 p-3 rounded-[40px] shadow-2xl border-4 border-slate-800">
            {/* Speaker & Camera notch */}
            <div className="w-32 h-4 bg-slate-800 rounded-full mx-auto mb-2 flex items-center justify-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-950"></div>
              <div className="w-10 h-1 bg-slate-700 rounded-full"></div>
            </div>

            {/* Smartphone Inner Screen */}
            <div className="bg-white rounded-[28px] overflow-hidden flex flex-col min-h-[640px] text-xs">
              {/* Phone Status Bar */}
              <div className="bg-slate-900 text-white px-4 py-1.5 flex items-center justify-between text-[10px] font-mono">
                <span>09:42 · Kinshasa</span>
                <div className="flex items-center gap-2">
                  {networkState === '4G' && <span className="text-emerald-400 font-bold">4G+</span>}
                  {networkState === 'EDGE_2G' && <span className="text-amber-400 font-bold">EDGE (TUS 256K)</span>}
                  {networkState === 'OFFLINE' && <span className="text-rose-400 font-bold">OFFLINE</span>}
                  <span>82%</span>
                </div>
              </div>

              {/* In-App Header */}
              <div className="bg-emerald-800 text-white px-4 py-3 flex items-center justify-between shadow-xs">
                <div>
                  <div className="text-[10px] uppercase font-bold text-emerald-200 tracking-wider">ProofCapture Mobile</div>
                  <div className="text-sm font-bold truncate max-w-[280px]">
                    {activeMission.site.name}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-mono bg-emerald-900/80 px-2 py-0.5 rounded font-bold">
                    GNSS: {activeGnss.satellitesInView} Sats (GPS/GAL/GLO)
                  </div>
                  <div className="text-[9px] text-emerald-200 font-mono mt-0.5">
                    Anti-Spoof: {activeGnss.antiSpoofScore}% (NMEA Raw OK)
                  </div>
                </div>
              </div>

              {/* Inspector Perimeter Breadcrumb Track Indicator */}
              <div className="bg-slate-900 text-slate-300 px-4 py-2 text-[10px] flex items-center justify-between border-b border-slate-800 font-mono">
                <span className="flex items-center gap-1 text-emerald-400">
                  <Footprints className="w-3.5 h-3.5" />
                  Trace de Marche : {breadcrumbsSummary.totalDurationMinutes} min ({breadcrumbsSummary.totalDistanceMeters}m parcourus)
                </span>
                <span className="text-slate-400">Tour d'ouvrage validé</span>
              </div>

              {/* Mission Selector */}
              <div className="p-3 bg-slate-50 border-b border-slate-200 text-xs">
                <label className="text-slate-500 font-medium block mb-1">Mission Assignée au ProofAgent :</label>
                <select
                  value={selectedMissionId}
                  onChange={e => setSelectedMissionId(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg font-semibold text-slate-800 focus:outline-none"
                >
                  {missions.map(m => (
                    <option key={m.id} value={m.id}>
                      [{m.site.sector}] {m.code} - {m.site.territory} ({m.protocolCode})
                    </option>
                  ))}
                </select>
              </div>

              {/* Protocol Form Fields */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="text-xs text-slate-600 font-medium bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-100 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Protocole standard : <strong>{protocol.name}</strong></span>
                </div>

                {protocol.sections.map(section => (
                  <div key={section.id} className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold text-slate-900 border-b pb-1">
                      {section.title}
                    </h4>

                    {section.fields.map(field => {
                      if (field.type === 'PHOTO') {
                        const photo = capturedPhotos[field.id];
                        return (
                          <div key={field.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                            <div className="font-semibold text-slate-800">{field.label}</div>
                            {field.photoAngleHint && (
                              <div className="text-[11px] text-slate-500">{field.photoAngleHint}</div>
                            )}

                            {photo ? (
                              <div className="space-y-2">
                                <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-300">
                                  <img
                                    src={photo.url}
                                    alt="Preuve capturée"
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute top-2 left-2 bg-slate-900/80 text-white font-mono text-[9px] px-1.5 py-0.5 rounded">
                                    WebP · {photo.sizeKb} Ko · Hardware GPS
                                  </div>
                                </div>
                                <div className="bg-white p-2 rounded border border-slate-200 font-mono text-[9px] break-all text-slate-600">
                                  SHA256: {photo.hash}
                                </div>

                                <div className="p-2 bg-emerald-50/80 rounded border border-emerald-200 text-[10px] space-y-1">
                                  <div className="font-bold text-emerald-900 flex items-center justify-between">
                                    <span className="flex items-center gap-1">
                                      <Eye className="w-3.5 h-3.5 text-emerald-700" />
                                      IA / Computer Vision Embarquée
                                    </span>
                                    <span className="font-mono text-emerald-700">pHash: {cvAnalysisResult[field.id]?.perceptualHashHex || '7a8f9c104e'}</span>
                                  </div>
                                  <div className="text-slate-600 text-[10px]">
                                    Non recyclée : 0 doublon détecté dans la base nationale.
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-4 bg-white rounded-lg border border-dashed border-slate-300">
                                <Camera className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                                <span className="text-[11px] text-slate-500">Aucune photo prise</span>
                              </div>
                            )}

                            <button
                              type="button"
                              onClick={() => handleSimulatePhotoCapture(field.id)}
                              disabled={isProcessingPhoto}
                              className="w-full py-1.5 px-3 text-xs font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <Camera className="w-3.5 h-3.5" />
                              <span>{photo ? 'Reprendre la photo certifiée' : 'Prendre la photo in-app (SHA-256)'}</span>
                            </button>
                          </div>
                        );
                      }

                      if (field.type === 'BOOLEAN') {
                        return (
                          <div key={field.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                            <label className="font-semibold text-slate-800 block text-xs">{field.label}</label>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setFormValues(prev => ({ ...prev, [field.id]: true }))}
                                className={`flex-1 py-1.5 rounded-lg font-semibold text-xs border transition-colors cursor-pointer ${
                                  formValues[field.id] === true
                                    ? 'bg-emerald-700 text-white border-emerald-700'
                                    : 'bg-white text-slate-700 border-slate-200'
                                }`}
                              >
                                OUI (Conforme)
                              </button>
                              <button
                                type="button"
                                onClick={() => setFormValues(prev => ({ ...prev, [field.id]: false }))}
                                className={`flex-1 py-1.5 rounded-lg font-semibold text-xs border transition-colors cursor-pointer ${
                                  formValues[field.id] === false
                                    ? 'bg-rose-700 text-white border-rose-700'
                                    : 'bg-white text-slate-700 border-slate-200'
                                }`}
                              >
                                NON (Non-conforme)
                              </button>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div key={field.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                          <label className="font-semibold text-slate-800 block text-xs">{field.label}</label>
                          <input
                            type="text"
                            value={formValues[field.id] || ''}
                            onChange={e => setFormValues(prev => ({ ...prev, [field.id]: e.target.value }))}
                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Action Buttons in Phone Frame */}
              <div className="p-3 bg-slate-50 border-t border-slate-200 space-y-2">
                <button
                  type="button"
                  onClick={handleFormSubmit}
                  disabled={isSyncing}
                  className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>
                    {networkState === 'OFFLINE' ? 'Enregistrer dans Outbox Hors-Ligne' : 'Transmettre au Reviewer QA'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
