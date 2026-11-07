import React, { useState, useRef } from 'react';
import { Site, Mission, SectorType, ProjectZoneFeature, ProjectZoneFeatureCollection, GeoPoint } from '../types/proof360';
import { DRC_PROJECT_ZONES_GEOJSON, calculatePolygonCentroid, validateCustomGeoJson } from '../data/geoJsonProvider';
import { SatelliteTimeSlider } from './SatelliteTimeSlider';
import { 
  isPointInsidePolygon, 
  calculatePolygonAreaHectares, 
  calculatePolygonPerimeterKm, 
  calculateDistanceMeters 
} from '../services/integrityEngine';
import { 
  MapPin, 
  Layers, 
  Maximize2, 
  FileCode, 
  Check, 
  Copy, 
  Download, 
  Compass, 
  Flame, 
  SlidersHorizontal, 
  PenTool, 
  Undo2, 
  Save, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Crosshair,
  Satellite,
  Database
} from 'lucide-react';

interface MapOverviewProps {
  sites: Site[];
  missions: Mission[];
  onSelectMission: (missionId: string) => void;
  onOpenMobileWithSite: (siteId: string) => void;
}

export const MapOverview: React.FC<MapOverviewProps> = ({
  sites,
  missions,
  onSelectMission,
  onOpenMobileWithSite
}) => {
  const [selectedSiteId, setSelectedSiteId] = useState<string>(sites[0]?.id || '');
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>('feat-wash-maluku-catchment');

  // Layer & Visual style states
  const [baseMapStyle, setBaseMapStyle] = useState<'INFRA_DARK' | 'SENTINEL_SATELLITE' | 'OSM_LIGHT'>('INFRA_DARK');
  const [layerMode, setLayerMode] = useState<'HYBRID' | 'POLYGONS_ONLY' | 'POINTS_ONLY'>('HYBRID');
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showTimeSlider, setShowTimeSlider] = useState(false);
  const [showGeoJsonModal, setShowGeoJsonModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Advanced Multi-criteria filters
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [filterProvince, setFilterProvince] = useState<string>('ALL');
  const [filterSector, setFilterSector] = useState<'ALL' | SectorType>('ALL');
  const [filterBudget, setFilterBudget] = useState<'ALL' | 'UNDER_50K' | '50K_100K' | 'OVER_100K'>('ALL');
  const [filterQAStatus, setFilterQAStatus] = useState<string>('ALL');
  const [filterRiskOnly, setFilterRiskOnly] = useState(false);

  // Polygon Drawing Tool State
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [drawnPoints, setDrawnPoints] = useState<Array<{ x: number; y: number; lat: number; lng: number }>>([]);
  const [drawingZoneName, setDrawingZoneName] = useState('');
  const [drawingSector, setDrawingSector] = useState<SectorType>('WASH');
  const [showSaveDrawingModal, setShowSaveDrawingModal] = useState(false);

  // Real-time ST_Contains point-in-polygon verification widget state
  const [customTestPoint, setCustomTestPoint] = useState<GeoPoint>({
    lat: -4.3168,
    lng: 15.6542
  });
  const [inclusionResult, setInclusionResult] = useState<{
    inside: boolean;
    testedZoneName: string;
    checkedAt: string;
  } | null>(null);

  // Dynamic GeoJSON FeatureCollection
  const [geoJsonData, setGeoJsonData] = useState<ProjectZoneFeatureCollection>(DRC_PROJECT_ZONES_GEOJSON);
  const [customGeoJsonInput, setCustomGeoJsonInput] = useState('');
  const [geoJsonError, setGeoJsonError] = useState<string | null>(null);

  // SVG coordinate projection for DRC bounding box
  // Lat 5.5°N to -13.5°S, Lng 12.0°E to 31.5°E
  const projectCoordsToSvg = (lat: number, lng: number) => {
    const minLng = 12.0;
    const maxLng = 31.5;
    const minLat = -13.5;
    const maxLat = 5.5;

    const x = ((lng - minLng) / (maxLng - minLng)) * 740 + 30;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 520 + 40;
    return { x, y };
  };

  // Reverse projection from SVG screen clicks (x, y) back to WGS84 (Lat, Lng)
  const unprojectSvgToCoords = (x: number, y: number) => {
    const minLng = 12.0;
    const maxLng = 31.5;
    const minLat = -13.5;
    const maxLat = 5.5;

    const lng = minLng + ((x - 30) / 740) * (maxLng - minLng);
    const lat = maxLat - ((y - 40) / 520) * (maxLat - minLat);
    return { lat, lng };
  };

  // Convert GeoJSON polygon coordinates into SVG points string
  const formatPolygonToSvgPoints = (coordinates: number[][][]) => {
    const ring = coordinates[0];
    if (!ring || ring.length === 0) return '';

    let sumLng = 0;
    let sumLat = 0;
    const count = ring.length;
    ring.forEach(pt => {
      sumLng += pt[0];
      sumLat += pt[1];
    });
    const center = projectCoordsToSvg(sumLat / count, sumLng / count);
    const expansionFactor = 16; // Visual scaling factor so hectare parcels are distinct

    return ring
      .map(pt => {
        const raw = projectCoordsToSvg(pt[1], pt[0]);
        const dx = (raw.x - center.x) * expansionFactor;
        const dy = (raw.y - center.y) * expansionFactor;
        return `${(center.x + dx).toFixed(1)},${(center.y + dy).toFixed(1)}`;
      })
      .join(' ');
  };

  // Filter application
  const filteredSites = sites.filter(s => {
    if (filterProvince !== 'ALL' && s.province !== filterProvince) return false;
    if (filterSector !== 'ALL' && s.sector !== filterSector) return false;

    if (filterBudget === 'UNDER_50K' && s.disbursedUsd >= 50000) return false;
    if (filterBudget === '50K_100K' && (s.disbursedUsd < 50000 || s.disbursedUsd > 100000)) return false;
    if (filterBudget === 'OVER_100K' && s.disbursedUsd <= 100000) return false;

    const mission = missions.find(m => m.siteId === s.id);
    if (filterQAStatus !== 'ALL' && mission?.status !== filterQAStatus) return false;
    if (filterRiskOnly && mission?.status !== 'NEEDS_REINSPECTION') return false;

    return true;
  });

  const selectedSite = sites.find(s => s.id === selectedSiteId) || sites[0];
  const siteMission = missions.find(m => m.siteId === selectedSite?.id);

  // Active GeoJSON zone for selected site or active selection
  const activeZone = geoJsonData.features.find(f => f.id === selectedZoneId) || 
    geoJsonData.features.find(f => f.siteId === selectedSite?.id) || 
    geoJsonData.features[0];

  // SVG Click Handler for Drawing Tool or Point Inspection
  const svgRef = useRef<SVGSVGElement | null>(null);

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 800;
    const clickY = ((e.clientY - rect.top) / rect.height) * 600;

    const coords = unprojectSvgToCoords(clickX, clickY);

    if (isDrawingMode) {
      // Add vertex to polygon
      setDrawnPoints(prev => [...prev, { x: clickX, y: clickY, lat: coords.lat, lng: coords.lng }]);
    } else {
      // Set as custom test point for ST_Contains
      setCustomTestPoint({ lat: coords.lat, lng: coords.lng });
      if (activeZone) {
        const inside = isPointInsidePolygon(
          { lat: coords.lat, lng: coords.lng },
          activeZone.geometry.coordinates
        );
        setInclusionResult({
          inside,
          testedZoneName: activeZone.properties.name,
          checkedAt: new Date().toLocaleTimeString('fr-FR')
        });
      }
    }
  };

  // Test ST_Contains explicitly
  const runPointInPolygonTest = () => {
    if (!activeZone) return;
    const inside = isPointInsidePolygon(customTestPoint, activeZone.geometry.coordinates);
    setInclusionResult({
      inside,
      testedZoneName: activeZone.properties.name,
      checkedAt: new Date().toLocaleTimeString('fr-FR')
    });
  };

  // Drawing tool actions
  const handleUndoDrawnPoint = () => {
    setDrawnPoints(prev => prev.slice(0, -1));
  };

  const handleClearDrawing = () => {
    setDrawnPoints([]);
    setIsDrawingMode(false);
  };

  const handleSaveDrawnPolygon = () => {
    if (drawnPoints.length < 3) return;

    // Close the ring (first point = last point)
    const coordinatesRing = drawnPoints.map(p => [Number(p.lng.toFixed(5)), Number(p.lat.toFixed(5))]);
    coordinatesRing.push([Number(drawnPoints[0].lng.toFixed(5)), Number(drawnPoints[0].lat.toFixed(5))]);

    const polygonCoordinates = [coordinatesRing];
    const calculatedAreaHa = calculatePolygonAreaHectares(polygonCoordinates) || 5.4;
    const calculatedPerimKm = calculatePolygonPerimeterKm(polygonCoordinates) || 1.1;

    const newFeature: ProjectZoneFeature = {
      type: 'Feature',
      id: `feat-custom-${Date.now()}`,
      siteId: selectedSite?.id || 'site-wash-maluku',
      properties: {
        name: drawingZoneName || `Concession Cadastrée ${selectedSite?.territory || 'Tracé'}`,
        siteName: selectedSite?.name || 'Projet Tracé Manuel',
        province: selectedSite?.province || 'Kongo Central',
        territory: selectedSite?.territory || 'Mbanza-Ngungu',
        zoneType: drawingSector === 'WASH' ? 'CATCHMENT_PROTECTION' : drawingSector === 'BTP' ? 'CADASTRAL_CONCESSION' : 'MICROGRID_GRID_COVERAGE',
        areaHectares: calculatedAreaHa,
        perimeterKm: calculatedPerimKm,
        fillColor: drawingSector === 'WASH' ? '#0284c7' : drawingSector === 'BTP' ? '#ea580c' : '#ca8a04',
        strokeColor: '#ffffff',
        description: `Zone vectorielle tracée et mesurée par le gestionnaire (${calculatedAreaHa} ha).`,
        status: 'VERIFIED',
        cadastralRef: `TRACÉ-${Date.now().toString().slice(-6)}`
      },
      geometry: {
        type: 'Polygon',
        coordinates: polygonCoordinates
      }
    };

    setGeoJsonData(prev => ({
      ...prev,
      features: [newFeature, ...prev.features]
    }));
    setSelectedZoneId(newFeature.id);
    setDrawnPoints([]);
    setIsDrawingMode(false);
    setShowSaveDrawingModal(false);
    setDrawingZoneName('');
  };

  // Drawing live measurements
  const drawnAreaHa = drawnPoints.length >= 3 
    ? calculatePolygonAreaHectares([[...drawnPoints.map(p => [p.lng, p.lat]), [drawnPoints[0].lng, drawnPoints[0].lat]]]) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
            <Compass className="w-3.5 h-3.5 text-emerald-700" />
            <span>Moteur SIG PostGIS & Télédétection · WGS84</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
            Cartographie Opérationnelle & Télédétection Avancée
          </h2>
        </div>

        {/* Global Toolbar Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Base Map Raster Tiles Selector */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setBaseMapStyle('INFRA_DARK')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                baseMapStyle === 'INFRA_DARK' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              PostGIS Dark
            </button>
            <button
              onClick={() => setBaseMapStyle('SENTINEL_SATELLITE')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer flex items-center gap-1 ${
                baseMapStyle === 'SENTINEL_SATELLITE' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Satellite className="w-3 h-3 text-emerald-600" />
              <span>Sentinel-2 (10m)</span>
            </button>
            <button
              onClick={() => setBaseMapStyle('OSM_LIGHT')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                baseMapStyle === 'OSM_LIGHT' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              OSM Relief
            </button>
          </div>

          {/* Time Slider Split-Screen Trigger */}
          <button
            onClick={() => setShowTimeSlider(true)}
            className="px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
            title="Ouvrir le comparateur satellite avant / après"
          >
            <Maximize2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>Curseur Temporel (Split-Screen)</span>
          </button>

          {/* Heatmap Toggle */}
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs ${
              showHeatmap
                ? 'bg-rose-700 text-white border-rose-800'
                : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
            }`}
          >
            <Flame className={`w-3.5 h-3.5 ${showHeatmap ? 'text-amber-300' : 'text-rose-600'}`} />
            <span>Carte de Chaleur</span>
          </button>

          {/* Polygon Drawing Tool Activation */}
          <button
            onClick={() => {
              setIsDrawingMode(!isDrawingMode);
              if (!isDrawingMode) setDrawnPoints([]);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs ${
              isDrawingMode
                ? 'bg-amber-600 text-white border-amber-700'
                : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>{isDrawingMode ? 'Mode Tracé Actif' : 'Tracer Concession'}</span>
          </button>

          {/* Advanced Multi-criteria Filter Drawer Toggle */}
          <button
            onClick={() => setShowFilterDrawer(!showFilterDrawer)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs ${
              showFilterDrawer || filterProvince !== 'ALL' || filterSector !== 'ALL' || filterBudget !== 'ALL' || filterQAStatus !== 'ALL' || filterRiskOnly
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filtres Multicritères</span>
          </button>
        </div>
      </div>

      {/* Advanced Filter Drawer (Expandable) */}
      {showFilterDrawer && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs text-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4 text-emerald-700" />
              Filtrage Multicritères Cartographique
            </span>
            <button
              onClick={() => {
                setFilterProvince('ALL');
                setFilterSector('ALL');
                setFilterBudget('ALL');
                setFilterQAStatus('ALL');
                setFilterRiskOnly(false);
              }}
              className="text-slate-500 hover:text-slate-900 text-[11px] underline cursor-pointer"
            >
              Réinitialiser tous les filtres
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {/* Province Filter */}
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Province</label>
              <select
                value={filterProvince}
                onChange={e => setFilterProvince(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none"
              >
                <option value="ALL">Toutes les provinces</option>
                <option value="Kinshasa">Kinshasa</option>
                <option value="Kongo Central">Kongo Central</option>
                <option value="Kasaï">Kasaï</option>
                <option value="Sud-Kivu">Sud-Kivu</option>
              </select>
            </div>

            {/* Sector Filter */}
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Secteur d'Infrastructure</label>
              <select
                value={filterSector}
                onChange={e => setFilterSector(e.target.value as any)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none"
              >
                <option value="ALL">Tous les secteurs</option>
                <option value="WASH">WASH (Forages & Eau)</option>
                <option value="BTP">BTP (Écoles & Centres de Santé)</option>
                <option value="SOLAR">SOLAR (Mini-réseaux)</option>
              </select>
            </div>

            {/* Budget Disbursed Range */}
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Tranche de Décaissement</label>
              <select
                value={filterBudget}
                onChange={e => setFilterBudget(e.target.value as any)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none"
              >
                <option value="ALL">Tous les montants</option>
                <option value="UNDER_50K">&lt; $50,000 USD</option>
                <option value="50K_100K">$50,000 - $100,000 USD</option>
                <option value="OVER_100K">&gt; $100,000 USD</option>
              </select>
            </div>

            {/* QA Compliance Status */}
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Statut Conformité QA</label>
              <select
                value={filterQAStatus}
                onChange={e => setFilterQAStatus(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none"
              >
                <option value="ALL">Tous statuts</option>
                <option value="APPROVED">Validé & Certifié</option>
                <option value="QA_REVIEW">En cours d'examen QA</option>
                <option value="NEEDS_REINSPECTION">Anomalie / À Réinspecter</option>
                <option value="OPEN">Non encore inspecté</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
              <input
                type="checkbox"
                checked={filterRiskOnly}
                onChange={e => setFilterRiskOnly(e.target.checked)}
                className="rounded text-rose-700 accent-rose-700"
              />
              <span>Isoler uniquement les sites à risque de fraude / anomalies critiques</span>
            </label>
            <span className="text-slate-500 font-mono">
              {filteredSites.length} site(s) correspondent aux critères
            </span>
          </div>
        </div>
      )}

      {/* Drawing Mode Banner */}
      {isDrawingMode && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs flex flex-wrap items-center justify-between text-amber-900 gap-3">
          <div className="flex items-center gap-2">
            <PenTool className="w-4 h-4 text-amber-700 shrink-0" />
            <div>
              <span className="font-bold">Outil de Tracé Vectoriel Actif :</span>
              <span className="ml-1 text-slate-700">
                Cliquez sur la carte pour déposer les sommets successifs ({drawnPoints.length} point(s) posé(s)).
              </span>
              {drawnPoints.length >= 3 && (
                <span className="ml-2 font-mono font-bold text-amber-800">
                  Superficie calculée : {drawnAreaHa} ha
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleUndoDrawnPoint}
              disabled={drawnPoints.length === 0}
              className="px-2.5 py-1 bg-white hover:bg-amber-100 border border-amber-300 rounded font-semibold text-amber-900 disabled:opacity-50 flex items-center gap-1 cursor-pointer"
            >
              <Undo2 className="w-3 h-3" />
              <span>Annuler point</span>
            </button>
            <button
              onClick={() => setShowSaveDrawingModal(true)}
              disabled={drawnPoints.length < 3}
              className="px-3 py-1 bg-amber-700 hover:bg-amber-800 text-white rounded font-semibold disabled:opacity-50 flex items-center gap-1 cursor-pointer shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Fermer & Enregistrer</span>
            </button>
            <button
              onClick={handleClearDrawing}
              className="px-2.5 py-1 text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Quitter
            </button>
          </div>
        </div>
      )}

      {/* Main Map + Side Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* DRC Interactive Canvas */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-5 shadow-xs relative overflow-hidden">
          {/* Top Canvas Bar */}
          <div className="flex items-center justify-between mb-3 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-emerald-700" />
                Projection WGS84 EPSG:4326 · Tuiles Sentinel Caching Actif
              </span>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 font-mono px-1.5 py-0.5 rounded border border-emerald-100">
                128 tuiles en cache local
              </span>
            </div>

            <div className="flex items-center gap-2 font-mono text-[11px]">
              {showHeatmap && (
                <span className="text-rose-700 font-bold flex items-center gap-1">
                  <Flame className="w-3 h-3" /> Heatmap Active
                </span>
              )}
              <span>Sites filtrés: {filteredSites.length}</span>
            </div>
          </div>

          {/* Interactive SVG Canvas */}
          <div className="relative w-full aspect-[4/3] bg-slate-950 rounded-lg overflow-hidden border border-slate-800">
            <svg
              ref={svgRef}
              onClick={handleSvgClick}
              className={`absolute inset-0 w-full h-full ${isDrawingMode ? 'cursor-crosshair' : 'cursor-default'}`}
              viewBox="0 0 800 600"
            >
              <defs>
                <pattern id="gridPat" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                </pattern>

                {/* Base Map Gradients */}
                <radialGradient id="darkBgGlow" cx="45%" cy="45%" r="50%">
                  <stop offset="0%" stopColor="#0f766e" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#090d16" stopOpacity="0.95" />
                </radialGradient>

                <radialGradient id="satelliteBgGlow" cx="40%" cy="40%" r="60%">
                  <stop offset="0%" stopColor="#14532d" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#052e16" stopOpacity="0.98" />
                </radialGradient>

                {/* Heatmap Radial Gradients */}
                <radialGradient id="heatCritical" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                  <stop offset="40%" stopColor="#f97316" stopOpacity="0.5" />
                  <stop offset="80%" stopColor="#eab308" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                </radialGradient>

                <radialGradient id="heatModerate" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.6" />
                  <stop offset="60%" stopColor="#eab308" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Background Tile Simulation */}
              <rect
                width="800"
                height="600"
                fill={
                  baseMapStyle === 'SENTINEL_SATELLITE'
                    ? 'url(#satelliteBgGlow)'
                    : baseMapStyle === 'OSM_LIGHT'
                    ? '#0f172a'
                    : 'url(#darkBgGlow)'
                }
              />
              <rect width="800" height="600" fill="url(#gridPat)" />

              {/* DRC Stylized Boundary */}
              <path
                d="M 120 220 
                   Q 160 140 260 110 
                   Q 380 90 480 120 
                   Q 560 110 630 180 
                   Q 670 230 680 300 
                   Q 700 380 660 440 
                   Q 620 520 560 550 
                   Q 510 560 480 500 
                   Q 440 450 360 460 
                   Q 280 470 220 420 
                   Q 150 400 110 360 
                   Q 90 320 100 280 Z"
                fill={baseMapStyle === 'SENTINEL_SATELLITE' ? '#064e3b' : '#0f2922'}
                stroke={baseMapStyle === 'SENTINEL_SATELLITE' ? '#34d399' : '#10b981'}
                strokeWidth="1.5"
                strokeDasharray="4 2"
                opacity="0.6"
              />

              {/* Congo River simulation */}
              <path
                d="M 620 290 Q 520 200 420 180 T 260 220 T 130 290 T 80 340"
                fill="none"
                stroke="#0284c7"
                strokeWidth="2"
                opacity="0.4"
              />

              {/* Provincial Reference Labels */}
              <text x="140" y="315" fill="#94a3b8" fontSize="11" fontFamily="JetBrains Mono" opacity="0.6">Kinshasa</text>
              <text x="90" y="370" fill="#94a3b8" fontSize="10" fontFamily="JetBrains Mono" opacity="0.5">Kongo Central</text>
              <text x="320" y="390" fill="#94a3b8" fontSize="10" fontFamily="JetBrains Mono" opacity="0.5">Kasaï</text>
              <text x="610" y="330" fill="#94a3b8" fontSize="10" fontFamily="JetBrains Mono" opacity="0.5">Kivu</text>
              <text x="500" y="520" fill="#94a3b8" fontSize="10" fontFamily="JetBrains Mono" opacity="0.5">Haut-Katanga</text>

              {/* HEATMAP LAYER: Anomalies Density Halos */}
              {showHeatmap && (
                <g className="heatmap-layer">
                  {/* Critical Anomaly Halo at Tshikapa (Kasaï) */}
                  <circle cx="360" cy="385" r="85" fill="url(#heatCritical)" />
                  {/* Moderate Anomaly Halo at Walungu (Kivu) */}
                  <circle cx="615" cy="315" r="60" fill="url(#heatModerate)" />
                  {/* Minor cluster in Kinshasa */}
                  <circle cx="150" cy="310" r="45" fill="url(#heatModerate)" opacity="0.5" />
                </g>
              )}

              {/* GEOJSON POLYGONS LAYER */}
              {(layerMode === 'HYBRID' || layerMode === 'POLYGONS_ONLY') && (
                <g className="geojson-polygons-layer">
                  {geoJsonData.features.map(feature => {
                    const pointsString = formatPolygonToSvgPoints(feature.geometry.coordinates);
                    const isSelected = feature.id === activeZone?.id;
                    const fillColor = feature.properties.fillColor || '#0284c7';
                    const strokeColor = feature.properties.strokeColor || '#0369a1';

                    return (
                      <g 
                        key={feature.id} 
                        className="cursor-pointer transition-all duration-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedZoneId(feature.id);
                          setSelectedSiteId(feature.siteId);
                        }}
                      >
                        <polygon
                          points={pointsString}
                          fill={fillColor}
                          fillOpacity={isSelected ? 0.45 : 0.22}
                          stroke={strokeColor}
                          strokeWidth={isSelected ? 2.5 : 1.2}
                          strokeDasharray={feature.properties.zoneType === 'ROAD_RIGHT_OF_WAY' ? '4 2' : undefined}
                          className="hover:fill-opacity-50 transition-opacity"
                        />
                      </g>
                    );
                  })}
                </g>
              )}

              {/* SITES CORE POINTS & CIRCULAR GEOFENCES */}
              {(layerMode === 'HYBRID' || layerMode === 'POINTS_ONLY') && (
                <g className="sites-points-layer">
                  {filteredSites.map(site => {
                    const { x, y } = projectCoordsToSvg(site.coordinates.lat, site.coordinates.lng);
                    const isSelected = site.id === selectedSite?.id;
                    const sectorColor = site.sector === 'WASH' ? '#0284c7' : site.sector === 'BTP' ? '#ea580c' : '#ca8a04';

                    return (
                      <g
                        key={site.id}
                        className="cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSiteId(site.id);
                          const matchingZone = geoJsonData.features.find(f => f.siteId === site.id);
                          if (matchingZone) setSelectedZoneId(matchingZone.id);
                        }}
                      >
                        <circle
                          cx={x}
                          cy={y}
                          r={isSelected ? 22 : 15}
                          fill={sectorColor}
                          fillOpacity={isSelected ? 0.22 : 0.1}
                          stroke={sectorColor}
                          strokeWidth={isSelected ? 1.5 : 0.8}
                        />
                        <circle
                          cx={x}
                          cy={y}
                          r={isSelected ? 5.5 : 4}
                          fill={sectorColor}
                          stroke="#ffffff"
                          strokeWidth={1.5}
                        />
                        <text
                          x={x + 9}
                          y={y + 4}
                          fill={isSelected ? '#ffffff' : '#cbd5e1'}
                          fontSize={isSelected ? '11' : '9.5'}
                          fontWeight={isSelected ? '700' : '500'}
                          fontFamily="Plus Jakarta Sans"
                        >
                          {site.territory}
                        </text>
                      </g>
                    );
                  })}
                </g>
              )}

              {/* DRAWING TOOL: Live In-Progress Polygon Preview */}
              {isDrawingMode && drawnPoints.length > 0 && (
                <g className="drawing-preview-layer pointer-events-none">
                  {/* Polyline / Polygon in construction */}
                  {drawnPoints.length >= 3 ? (
                    <polygon
                      points={drawnPoints.map(p => `${p.x},${p.y}`).join(' ')}
                      fill="#f59e0b"
                      fillOpacity={0.35}
                      stroke="#fbbf24"
                      strokeWidth={2}
                      strokeDasharray="4 2"
                    />
                  ) : drawnPoints.length === 2 ? (
                    <line
                      x1={drawnPoints[0].x}
                      y1={drawnPoints[0].y}
                      x2={drawnPoints[1].x}
                      y2={drawnPoints[1].y}
                      stroke="#fbbf24"
                      strokeWidth={2}
                      strokeDasharray="4 2"
                    />
                  ) : null}

                  {/* Vertices Pins */}
                  {drawnPoints.map((p, idx) => (
                    <g key={idx}>
                      <circle cx={p.x} cy={p.y} r={4.5} fill="#fbbf24" stroke="#ffffff" strokeWidth={1.5} />
                      <text x={p.x + 6} y={p.y + 4} fill="#fbbf24" fontSize="10" fontFamily="JetBrains Mono" fontWeight="bold">
                        P{idx + 1}
                      </text>
                    </g>
                  ))}
                </g>
              )}

              {/* Custom Test Point Pin (ST_Contains target) */}
              {customTestPoint && (
                <g className="test-point-marker pointer-events-none">
                  {(() => {
                    const pt = projectCoordsToSvg(customTestPoint.lat, customTestPoint.lng);
                    return (
                      <g>
                        <circle cx={pt.x} cy={pt.y} r={9} fill="none" stroke="#38bdf8" strokeWidth={1.5} strokeDasharray="3 2" />
                        <circle cx={pt.x} cy={pt.y} r={3.5} fill="#38bdf8" stroke="#ffffff" strokeWidth={1} />
                        <text x={pt.x + 8} y={pt.y - 4} fill="#38bdf8" fontSize="9" fontFamily="JetBrains Mono">
                          Test GPS
                        </text>
                      </g>
                    );
                  })()}
                </g>
              )}
            </svg>

            {/* In-Map Heatmap Legend when active */}
            {showHeatmap && (
              <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-xs border border-rose-500/40 rounded-lg p-2 text-[11px] text-white shadow-lg space-y-1">
                <div className="font-bold text-rose-400 uppercase text-[9px] flex items-center gap-1">
                  <Flame className="w-3 h-3 text-rose-500" />
                  Intensité des Malfaçons
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-2 rounded bg-rose-600 inline-block" />
                  <span>Critique (Kasaï : Forage défaillant)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-2 rounded bg-amber-500 inline-block" />
                  <span>Modéré (Kivu : Réserves de gros-œuvre)</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Cadastral Inspector & Real-time ST_Contains Tester */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-5">
          {/* Active Polygon Overview */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>{activeZone.properties.province} · {activeZone.properties.territory}</span>
              <span className="font-mono text-emerald-700 font-semibold">{activeZone.properties.status}</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 leading-snug">
              {activeZone.properties.name}
            </h3>
            <div className="text-xs text-slate-500 mt-1">
              {activeZone.properties.siteName}
            </div>
          </div>

          {/* Measurements Card */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Superficie d'Emprise</span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                {activeZone.properties.areaHectares} hectares
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Périmètre Linéaire</span>
              <span className="font-mono font-semibold text-slate-800">
                {activeZone.properties.perimeterKm} km
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Référence Cadastrale</span>
              <span className="font-mono text-slate-800 font-semibold">
                {activeZone.properties.cadastralRef || 'RÉF-2026-BCECO'}
              </span>
            </div>
          </div>

          {/* REAL-TIME POSTGIS ST_Contains TESTING WIDGET */}
          <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-900 text-white text-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-1.5 text-emerald-400">
                <Crosshair className="w-4 h-4" />
                Vérification Spatiale ST_Contains
              </span>
              <span className="font-mono text-[10px] text-slate-400">PostGIS Algorithmique</span>
            </div>

            <p className="text-[11px] text-slate-400">
              Vérifie en temps réel si la position GPS de l'agent est <strong>strictement incluse</strong> dans le polygone de la concession cadastrale.
            </p>

            <div className="p-2 bg-slate-950 rounded border border-slate-800 font-mono text-[10px] space-y-1">
              <div className="flex justify-between text-slate-300">
                <span>Point Test :</span>
                <span>{customTestPoint.lat.toFixed(4)}, {customTestPoint.lng.toFixed(4)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Polygone :</span>
                <span className="truncate max-w-[170px]">{activeZone.properties.name}</span>
              </div>
            </div>

            <button
              onClick={runPointInPolygonTest}
              className="w-full py-1.5 px-3 bg-emerald-700 hover:bg-emerald-800 rounded font-semibold text-xs transition-colors cursor-pointer text-center"
            >
              Évaluer Inclusion Géométrique
            </button>

            {inclusionResult && (
              <div className={`p-2.5 rounded-lg border text-xs ${
                inclusionResult.inside
                  ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/80 border-rose-500/40 text-rose-300'
              }`}>
                <div className="font-bold flex items-center gap-1.5">
                  {inclusionResult.inside ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-rose-400" />}
                  <span>{inclusionResult.inside ? 'ST_Contains == TRUE (DANS L’EMPRISE)' : 'ST_Contains == FALSE (HORS CONCESSION)'}</span>
                </div>
                <div className="text-[10px] opacity-80 mt-1">
                  {inclusionResult.inside
                    ? 'La preuve a été capturée à l’intérieur exact de la servitude officielle.'
                    : 'Alerte : Coordonnées hors de la concession délimitée. Risque d’empiètement foncier.'}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            {siteMission && (
              <button
                onClick={() => onSelectMission(siteMission.id)}
                className="w-full py-2 px-3 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer text-center"
              >
                Inspecter la Mission & Preuves QA
              </button>
            )}

            <button
              onClick={() => onOpenMobileWithSite(selectedSite.id)}
              className="w-full py-2 px-3 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors cursor-pointer text-center"
            >
              Simuler Collecte Terrain sur ce Site
            </button>
          </div>
        </div>
      </div>

      {/* Save Polygon Drawing Modal */}
      {showSaveDrawingModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Save className="w-4 h-4 text-amber-700" />
                Enregistrer la Concession Tracée
              </h3>
              <button onClick={() => setShowSaveDrawingModal(false)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            <p className="text-slate-600">
              Votre tracé comprend <strong>{drawnPoints.length} sommets</strong> pour une superficie calculée de <strong>{drawnAreaHa} hectares</strong>.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-slate-700 font-semibold block mb-1">Nom de la Zone / Concession</label>
                <input
                  type="text"
                  placeholder="Ex: Emprise Réserve Forage Madimba Nord"
                  value={drawingZoneName}
                  onChange={e => setDrawingZoneName(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">Typologie PVS</label>
                <select
                  value={drawingSector}
                  onChange={e => setDrawingSector(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <option value="WASH">Périmètre de Protection Hydraulique (WASH)</option>
                  <option value="BTP">Concession Cadastrale Bâtiment (BTP)</option>
                  <option value="SOLAR">Zone Desserte Micro-Réseau (Solaire)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setShowSaveDrawingModal(false)}
                className="px-3 py-1.5 text-slate-600 hover:text-slate-900"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSaveDrawnPolygon}
                className="px-4 py-2 font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-lg shadow-xs"
              >
                Ajouter au SIG GeoJSON
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Satellite Time Slider Modal */}
      {showTimeSlider && (
        <SatelliteTimeSlider
          siteName={selectedSite.name}
          province={selectedSite.province}
          onClose={() => setShowTimeSlider(false)}
        />
      )}
    </div>
  );
};
