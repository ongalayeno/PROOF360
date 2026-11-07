import React, { useState } from 'react';
import { Site, Mission, PVSProtocol } from '../types/proof360';
import { PROTOCOLS } from '../data/protocols';
import { X, Plus, Calendar, MapPin, Shield } from 'lucide-react';

interface NewMissionModalProps {
  sites: Site[];
  onClose: () => void;
  onCreateMission: (missionData: {
    title: string;
    siteId: string;
    protocolCode: string;
    assignedAgentName: string;
    scheduledDate: string;
  }) => Promise<void>;
}

export const NewMissionModal: React.FC<NewMissionModalProps> = ({
  sites,
  onClose,
  onCreateMission
}) => {
  const [siteId, setSiteId] = useState(sites[0]?.id || '');
  const [protocolCode, setProtocolCode] = useState('PVS-WASH-001');
  const [title, setTitle] = useState('');
  const [assignedAgentName, setAssignedAgentName] = useState('Ing. Patient Mukendi');
  const [scheduledDate, setScheduledDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedSite = sites.find(s => s.id === siteId) || sites[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const missionTitle = title || `Contrôle Physique ${selectedSite?.name || 'Chantier'}`;
      await onCreateMission({
        title: missionTitle,
        siteId,
        protocolCode,
        assignedAgentName,
        scheduledDate
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full my-8 shadow-2xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold">Créer une Mission de Contrôle Terrain</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Site Selection */}
          <div className="space-y-1">
            <label className="text-slate-700 font-semibold block">Site Physique / Ouvrage Contractuel</label>
            <select
              value={siteId}
              onChange={e => setSiteId(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
            >
              {sites.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.province} - {s.territory})
                </option>
              ))}
            </select>
          </div>

          {/* Protocol Selection */}
          <div className="space-y-1">
            <label className="text-slate-700 font-semibold block">Protocole de Vérification PVS</label>
            <select
              value={protocolCode}
              onChange={e => setProtocolCode(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
            >
              {Object.values(PROTOCOLS).map(p => (
                <option key={p.code} value={p.code}>
                  {p.code} : {p.name}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              {PROTOCOLS[protocolCode]?.description}
            </p>
          </div>

          {/* Title Override */}
          <div className="space-y-1">
            <label className="text-slate-700 font-semibold block">Titre de la Mission (Optionnel)</label>
            <input
              type="text"
              placeholder={`Ex: Audit Physique Réception ${selectedSite?.territory || ''}`}
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
            />
          </div>

          {/* Assigned Agent */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-700 font-semibold block">ProofAgent Assigné</label>
              <input
                type="text"
                value={assignedAgentName}
                onChange={e => setAssignedAgentName(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 font-semibold block">Date Planifiée</label>
              <input
                type="date"
                value={scheduledDate}
                onChange={e => setScheduledDate(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none"
              />
            </div>
          </div>

          {/* Geofence Info Card */}
          {selectedSite && (
            <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-lg text-slate-700 space-y-1">
              <div className="font-semibold text-emerald-900 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                Périmètre Géofencé PostGIS
              </div>
              <div className="text-[11px] font-mono text-slate-600">
                Lat: {selectedSite.coordinates.lat.toFixed(4)}, Lng: {selectedSite.coordinates.lng.toFixed(4)} · Rayon: {selectedSite.geofenceRadiusMeters}m
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-900"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? 'Création...' : 'Créer & Notifier le Mobile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
