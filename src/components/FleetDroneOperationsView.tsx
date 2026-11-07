import React, { useState } from 'react';
import { FleetRoutePlan, DroneWaypointPlan, Site } from '../types/proof360';
import { Truck, Plane, Navigation, Shield, CloudRain, AlertTriangle, Compass, CheckCircle2 } from 'lucide-react';

interface FleetDroneOperationsViewProps {
  fleetRoutes: FleetRoutePlan[];
  droneMissions: DroneWaypointPlan[];
  sites: Site[];
}

export const FleetDroneOperationsView: React.FC<FleetDroneOperationsViewProps> = ({
  fleetRoutes,
  droneMissions,
  sites
}) => {
  const [activeTab, setActiveTab] = useState<'FLEET' | 'DRONE'>('FLEET');
  const [sosSent, setSosSent] = useState(false);

  const handleTriggerSos = () => {
    setSosSent(true);
    setTimeout(() => setSosSent(false), 6000);
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
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setActiveTab('FLEET')}
              className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'FLEET' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Truck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Tournées & Pistes Saison des Pluies</span>
            </button>
            <button
              onClick={() => setActiveTab('DRONE')}
              className={`px-3 py-1.5 rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
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

      {/* TAB 1: Route Optimization & Impassable Tracks */}
      {activeTab === 'FLEET' && (
        <div className="space-y-4">
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

      {/* TAB 2: Drone Photogrammetry */}
      {activeTab === 'DRONE' && (
        <div className="space-y-4">
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
