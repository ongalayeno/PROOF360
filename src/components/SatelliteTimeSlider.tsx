import React, { useState } from 'react';
import { Layers, Calendar, SplitSquareVertical, Sparkles, X, Check } from 'lucide-react';

interface SatelliteTimeSliderProps {
  siteName: string;
  province: string;
  onClose: () => void;
}

export const SatelliteTimeSlider: React.FC<SatelliteTimeSliderProps> = ({
  siteName,
  province,
  onClose
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [selectedSensor, setSelectedSensor] = useState<'SENTINEL_2' | 'LANDSAT_8'>('SENTINEL_2');

  const t0Date = '14 Août 2023';
  const t1Date = '04 Novembre 2026';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 text-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-700 overflow-hidden flex flex-col">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase text-emerald-400 tracking-wider font-semibold">
                Télédétection Haute Résolution · Sentinel-2 / Landsat
              </div>
              <h3 className="text-base font-bold text-white">
                Comparateur Temporel par Satellite (Split-Screen Avant / Après)
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-slate-800 rounded-lg text-xs">
              <button
                onClick={() => setSelectedSensor('SENTINEL_2')}
                className={`px-2.5 py-1 rounded font-semibold transition-colors cursor-pointer ${
                  selectedSensor === 'SENTINEL_2' ? 'bg-emerald-700 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Sentinel-2A (10m)
              </button>
              <button
                onClick={() => setSelectedSensor('LANDSAT_8')}
                className={`px-2.5 py-1 rounded font-semibold transition-colors cursor-pointer ${
                  selectedSensor === 'LANDSAT_8' ? 'bg-emerald-700 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Landsat-8 OLI
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-slate-950/80 px-6 py-2.5 border-b border-slate-800 text-xs flex flex-wrap items-center justify-between text-slate-300 gap-2 font-mono">
          <div>
            Site : <span className="text-white font-bold">{siteName}</span> ({province})
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-amber-400">T0 : {t0Date} (État Initial Vierge)</span>
            <span>⟷</span>
            <span className="text-emerald-400">T1 : {t1Date} (Infrastructures Terminées)</span>
          </div>
        </div>

        {/* Interactive Split-Screen Viewer Canvas */}
        <div className="relative aspect-video w-full bg-black select-none overflow-hidden group">
          {/* Base Layer: T1 (Current progress / after completion) */}
          <img
            src="/src/assets/images/satellite_t1_progress_1793822777293.jpg"
            alt="Satellite T1 après travaux"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Top Layer: T0 (Baseline before works) with clipPath based on sliderPosition */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
          >
            <img
              src="/src/assets/images/satellite_t0_baseline_1793822777093.jpg"
              alt="Satellite T0 avant travaux"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>

          {/* Vertical Divider Line with Grab Handle */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl z-20 pointer-events-none"
            style={{ left: `${sliderPosition}%` }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-slate-900 shadow-xl flex items-center justify-center font-bold text-xs">
              <SplitSquareVertical className="w-4 h-4 rotate-90" />
            </div>
          </div>

          {/* Floating Badges */}
          <div className="absolute top-4 left-4 bg-slate-900/85 backdrop-blur-xs border border-amber-500/50 text-amber-300 px-3 py-1.5 rounded-lg text-xs font-mono font-bold shadow-lg">
            AVANT TRAVAUX · {t0Date}
          </div>
          <div className="absolute top-4 right-4 bg-slate-900/85 backdrop-blur-xs border border-emerald-500/50 text-emerald-300 px-3 py-1.5 rounded-lg text-xs font-mono font-bold shadow-lg">
            APRÈS LIVRAISON · {t1Date}
          </div>

          {/* Range Slider Overlay */}
          <input
            type="range"
            min="0"
            max="100"
            value={sliderPosition}
            onChange={e => setSliderPosition(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
            aria-label="Curseur temporel avant / après"
          />
        </div>

        {/* Footer Guidance & Remote Sensing Findings */}
        <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 text-xs space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-slate-300">
            <div className="space-y-1">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Constat d'Orbital Analytics (Sentinel-2 Spectral Analysis)
              </div>
              <p className="text-[11px] text-slate-400 max-w-2xl">
                Glissez le curseur horizontal pour comparer. Apparition confirmée du complexe de 6 toitures galvanisées neuves, du champ photovoltaïque de 48 modules et de l'aménagement de la plateforme d'accès. Aucune anomalie de terrassement détectée.
              </p>
            </div>

            <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-center shrink-0">
              <div className="text-[10px] uppercase font-bold text-slate-400">Position du Curseur</div>
              <div className="text-base font-mono font-bold text-emerald-400">{sliderPosition}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
