import React, { useState } from 'react';
import { 
  HealthDeliveryVerification, 
  MedicineItem, 
  ColdChainLog,
  Site 
} from '../types/proof360';
import { 
  HeartPulse, 
  Thermometer, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Pill, 
  FileText, 
  Building2, 
  Clock, 
  Calendar, 
  Snowflake, 
  Sun, 
  Activity, 
  Sparkles, 
  Plus, 
  Download, 
  Search,
  Check,
  X
} from 'lucide-react';

interface HealthColdChainViewProps {
  deliveries: HealthDeliveryVerification[];
  sites: Site[];
  onAddMedicineItem?: (deliveryIndex: number, item: Omit<MedicineItem, 'id'>) => void;
  onUpdateTemperature?: (deliveryIndex: number, newTempCelsius: number) => void;
}

export const HealthColdChainView: React.FC<HealthColdChainViewProps> = ({
  deliveries,
  sites,
  onAddMedicineItem,
  onUpdateTemperature
}) => {
  const [selectedDeliveryIndex, setSelectedDeliveryIndex] = useState(0);
  const [filterClass, setFilterClass] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSimulatingTemp, setIsSimulatingTemp] = useState(false);

  // New item modal/form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCommercialName, setNewCommercialName] = useState('');
  const [newInnName, setNewInnName] = useState('');
  const [newTherapeuticClass, setNewTherapeuticClass] = useState<MedicineItem['therapeuticClass']>('ANTIPALUDIQUE');
  const [newBatchNumber, setNewBatchNumber] = useState('');
  const [newQuantity, setNewQuantity] = useState(500);
  const [newUnit, setNewUnit] = useState<MedicineItem['unitOfMeasure']>('BOITE');
  const [newExpiryDate, setNewExpiryDate] = useState('2028-06-30');
  const [newStorage, setNewStorage] = useState<MedicineItem['storageRequirement']>('ROOM_TEMP_UNDER_30C');

  const activeDelivery = deliveries[selectedDeliveryIndex] || deliveries[0];
  const coldChain = activeDelivery?.coldChain;

  // Filter medicines
  const filteredInventory = (activeDelivery?.inventory || []).filter(item => {
    const matchesClass = filterClass === 'ALL' || item.therapeuticClass === filterClass;
    const matchesSearch = 
      item.commercialName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.innName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.batchNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.drugCode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesClass && matchesSearch;
  });

  // Calculate stats
  const totalUnits = activeDelivery?.inventory.reduce((acc, m) => acc + m.quantityDelivered, 0) || 0;
  const expiredCount = activeDelivery?.inventory.filter(m => m.status === 'PERIME_REJETE').length || 0;
  const closeToExpiryCount = activeDelivery?.inventory.filter(m => m.status === 'EXPIRATION_PROCHE').length || 0;
  const coldChainItemsCount = activeDelivery?.inventory.filter(m => m.storageRequirement === 'COLD_CHAIN_2_8C').length || 0;

  // Handle simulate temp change
  const handleTempAdjust = (delta: number) => {
    if (!coldChain || !onUpdateTemperature) return;
    const newTemp = Math.round((coldChain.currentTemperatureCelsius + delta) * 10) / 10;
    onUpdateTemperature(selectedDeliveryIndex, newTemp);
  };

  const handleCreateMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommercialName || !newBatchNumber || !onAddMedicineItem) return;

    // Calculate months remaining until expiry
    const expDate = new Date(newExpiryDate);
    const now = new Date();
    const monthsRemaining = Math.max(0, Math.round((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30.4)));

    let status: MedicineItem['status'] = 'CONFORME_VALIDE';
    if (monthsRemaining <= 0) {
      status = 'PERIME_REJETE';
    } else if (monthsRemaining < 6) {
      status = 'EXPIRATION_PROCHE';
    }

    onAddMedicineItem(selectedDeliveryIndex, {
      drugCode: `MED-${newTherapeuticClass.slice(0, 3)}-${Math.floor(100 + Math.random() * 900)}`,
      commercialName: newCommercialName,
      innName: newInnName || newCommercialName,
      therapeuticClass: newTherapeuticClass,
      batchNumber: newBatchNumber,
      quantityDelivered: Number(newQuantity),
      unitOfMeasure: newUnit,
      expirationDate: newExpiryDate,
      monthsRemainingUntilExpiry: monthsRemaining,
      status,
      storageRequirement: newStorage,
      tamperProofPackagingIntact: true
    });

    setShowAddModal(false);
    setNewCommercialName('');
    setNewBatchNumber('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Protocol Title */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200 px-2 py-0.5 rounded">
                PROTOCOLE PVS-HEALTH-001
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-xs font-semibold text-slate-600">
                Santé Publique, Chaîne du Froid & Intrants Médicaux
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-rose-600" />
              <span>Module PVS-HEALTH : Contrôle Température & DLUO Centre de Santé Rural</span>
            </h1>
            <p className="text-xs text-slate-500 max-w-3xl leading-relaxed">
              Vérification physique certifiée des livraisons de médicaments essentiels, surveillance continue des enregistreurs de température (dataloggers USB 2°C à 8°C) et conformité des dates limites d'utilisation optimale (DLUO) pour déblocage des subventions internationales (Fonds Mondial, GAVI, UNICEF).
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ajouter Lot d'Intrants</span>
            </button>
          </div>
        </div>

        {/* Center Delivery Selector Tab Bar */}
        <div className="flex items-center gap-2 pt-4 overflow-x-auto text-xs">
          <span className="text-slate-500 font-semibold text-[11px] shrink-0">Bordereau actif :</span>
          {deliveries.map((del, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedDeliveryIndex(idx)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                selectedDeliveryIndex === idx
                  ? 'bg-rose-50 text-rose-900 border border-rose-200 shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-transparent'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-rose-600" />
              <span>{del.centerName.split('(')[0]}</span>
              <span className="font-mono text-[10px] text-slate-400">[{del.deliverySlipNumber}]</span>
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Cold Chain Status */}
        <div className={`p-4 rounded-xl border shadow-xs space-y-2 ${
          coldChain?.isColdChainBreached 
            ? 'bg-rose-50 border-rose-200' 
            : 'bg-emerald-50/70 border-emerald-200'
        }`}>
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-700 flex items-center gap-1.5">
              <Thermometer className={`w-4 h-4 ${coldChain?.isColdChainBreached ? 'text-rose-600' : 'text-emerald-700'}`} />
              <span>Chaîne du Froid (2°C - 8°C)</span>
            </span>
            <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded font-bold ${
              coldChain?.isColdChainBreached ? 'bg-rose-100 text-rose-900' : 'bg-emerald-100 text-emerald-900'
            }`}>
              {coldChain?.isColdChainBreached ? 'RUPTURE DÉTECTÉE' : 'CONFORME OMS'}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {coldChain?.currentTemperatureCelsius.toFixed(1)}°C
            </span>
            <span className="text-xs text-slate-500 font-mono">
              (Min: {coldChain?.minTemperatureLast24h}°C / Max: {coldChain?.maxTemperatureLast24h}°C)
            </span>
          </div>
          <div className="text-[11px] text-slate-600 flex items-center justify-between pt-1 border-t border-slate-200/60">
            <span>{coldChain?.refrigeratorModel.split('(')[0]}</span>
            <span className="font-bold text-slate-700">{coldChainItemsCount} vaccins/insulines</span>
          </div>
        </div>

        {/* Card 2: Total Units Delivered */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span className="flex items-center gap-1.5">
              <Pill className="w-4 h-4 text-blue-600" />
              <span>Unités Déballées & Contrôlées</span>
            </span>
            <span className="font-mono text-[10px] bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded font-bold">
              100% Vérifié
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {totalUnits.toLocaleString('fr-FR')}
            </span>
            <span className="text-xs text-slate-500">unités physiques</span>
          </div>
          <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
            <span>Lots inspectés : {activeDelivery?.inventory.length}</span>
            <span className="font-mono text-slate-700">{activeDelivery?.deliverySlipNumber}</span>
          </div>
        </div>

        {/* Card 3: Expiry & DLUO Alerts */}
        <div className={`p-4 rounded-xl border shadow-xs space-y-2 ${
          expiredCount > 0 
            ? 'bg-rose-50 border-rose-200' 
            : closeToExpiryCount > 0 
            ? 'bg-amber-50 border-amber-200' 
            : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Contrôle DLUO & Péremptions</span>
            </span>
            <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded font-bold ${
              expiredCount > 0 
                ? 'bg-rose-200 text-rose-900' 
                : closeToExpiryCount > 0 
                ? 'bg-amber-200 text-amber-900' 
                : 'bg-emerald-100 text-emerald-900'
            }`}>
              {expiredCount > 0 ? `${expiredCount} PÉRIMÉS` : closeToExpiryCount > 0 ? `${closeToExpiryCount} LOTS < 6 MOIS` : 'ZÉRO PÉRIMÉ'}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {closeToExpiryCount}
            </span>
            <span className="text-xs text-slate-500">lots à rotation rapide (&lt; 6 mois)</span>
          </div>
          <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
            {expiredCount === 0 ? 'Aucun médicament avarié ni rebuté.' : 'Blocage immédiat du bon de paiement.'}
          </div>
        </div>

        {/* Card 4: Donor Compliance & Payout Clearance */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>Score de Conformité B/L</span>
            </span>
            <span className="font-mono text-[10px] bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded font-bold">
              {activeDelivery?.programDonor}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-700">
              {activeDelivery?.complianceRatingPercent}%
            </span>
            <span className="text-xs text-emerald-800 font-semibold">
              Décaissement Validé
            </span>
          </div>
          <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
            Pharmacien : {activeDelivery?.pharmacistRecipientName.split('(')[0]}
          </div>
        </div>
      </div>

      {/* Main Grid: Datalogger & Refrigerator Panel + Medicine Inventory Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (4 cols): Live Cold Chain & Datalogger Details */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <Snowflake className="w-4 h-4 text-sky-600" />
                <span>Supervision Réfrigérateur Solaire</span>
              </h3>
              <span className="text-[10px] font-mono bg-sky-50 text-sky-800 px-2 py-0.5 rounded font-bold">
                WHO PQS E003/011
              </span>
            </div>

            {/* Refrigerator Specification */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Modèle Équipement :</span>
                <span className="font-semibold text-slate-900 text-right">{coldChain?.refrigeratorModel}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Alimentation Électrique :</span>
                <span className="font-semibold text-emerald-800 flex items-center gap-1">
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  Solaire Direct Drive (Sans Batterie)
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Capteur / Berceau USB :</span>
                <span className="font-mono text-slate-700">{coldChain?.sensorSerialNumber}</span>
              </div>
            </div>

            {/* Live Temperature Gauge Visual */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Thermomètre Actuel</span>
                <span className={`font-mono text-xs font-bold ${
                  (coldChain?.currentTemperatureCelsius || 0) < 2 || (coldChain?.currentTemperatureCelsius || 0) > 8
                    ? 'text-rose-600'
                    : 'text-emerald-700'
                }`}>
                  {coldChain?.currentTemperatureCelsius.toFixed(1)}°C
                </span>
              </div>

              {/* Temperature Bar: 0°C to 15°C */}
              <div className="space-y-1">
                <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden relative">
                  {/* Optimal Zone: 2°C to 8°C (approx 13% to 53% of 15°C scale) */}
                  <div className="absolute left-[13%] right-[47%] top-0 bottom-0 bg-emerald-300 opacity-60" title="Zone Optimale OMS (2°C - 8°C)" />
                  {/* Current Temp Marker */}
                  <div 
                    className={`absolute top-0 bottom-0 w-2.5 rounded-full transition-all duration-300 ${
                      (coldChain?.currentTemperatureCelsius || 0) < 2 || (coldChain?.currentTemperatureCelsius || 0) > 8
                        ? 'bg-rose-600 shadow-md'
                        : 'bg-emerald-700'
                    }`}
                    style={{ left: `${Math.min(100, Math.max(0, ((coldChain?.currentTemperatureCelsius || 0) / 15) * 100))}%` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] font-mono text-slate-400">
                  <span>0°C</span>
                  <span className="text-emerald-700 font-bold">2°C</span>
                  <span className="text-emerald-700 font-bold">8°C</span>
                  <span>15°C</span>
                </div>
              </div>

              {/* Temperature Simulation Adjust Buttons */}
              <div className="pt-2 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-medium">Tester Excursion :</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleTempAdjust(-1.5)}
                    className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded font-mono text-xs font-bold cursor-pointer"
                    title="Diminuer la température de 1.5°C"
                  >
                    -1.5°C
                  </button>
                  <button
                    onClick={() => handleTempAdjust(+1.5)}
                    className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded font-mono text-xs font-bold cursor-pointer"
                    title="Augmenter la température de 1.5°C"
                  >
                    +1.5°C
                  </button>
                  <button
                    onClick={() => onUpdateTemperature && onUpdateTemperature(selectedDeliveryIndex, 4.2)}
                    className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded font-mono text-[10px] font-bold cursor-pointer"
                    title="Réinitialiser à 4.2°C nominal"
                  >
                    Reset (4.2°C)
                  </button>
                </div>
              </div>
            </div>

            {/* Cryptographic Datalogger Seal */}
            <div className="p-3 bg-slate-900 text-slate-300 rounded-xl space-y-1.5 text-xs font-mono">
              <div className="text-emerald-400 font-bold flex items-center gap-1.5 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Empreinte Datalogger SHA-256</span>
              </div>
              <div className="text-[10px] break-all text-slate-400 bg-slate-800/80 p-1.5 rounded border border-slate-700">
                {coldChain?.dataloggerSha256Checksum}
              </div>
              <div className="text-[10px] text-slate-400">
                Log continu 30 jours sans effacement · Inaltérable
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (8 cols): Medicine Inventory & Expiry Table */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Pill className="w-4 h-4 text-emerald-700" />
                  <span>Inventaire Physique des Médicaments & DLUO ({activeDelivery?.inventory.length} lots)</span>
                </h3>
                <span className="text-[11px] text-slate-500">
                  CSR Walungu · Bon de Réception : {activeDelivery?.deliverySlipNumber}
                </span>
              </div>

              {/* Class Filter Selector */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Chercher molécule / lot..."
                    className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs w-44 focus:outline-none focus:bg-white"
                  />
                </div>

                <select
                  value={filterClass}
                  onChange={e => setFilterClass(e.target.value)}
                  className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none"
                >
                  <option value="ALL">Toutes les classes</option>
                  <option value="ANTIPALUDIQUE">Antipaludiques (ACT)</option>
                  <option value="VACCIN">Vaccins (Chaîne du Froid)</option>
                  <option value="ANTIBIOTIQUE">Antibiotiques</option>
                  <option value="MATERNITE">Santé Maternelle (Ocytocine)</option>
                  <option value="SOLUTE">Solutés & SRO</option>
                </select>
              </div>
            </div>

            {/* Table of Medicines */}
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-600 text-[10px] uppercase font-bold tracking-wider">
                  <tr>
                    <th className="p-3">Médicament / DCI</th>
                    <th className="p-3">Numéro de Lot</th>
                    <th className="p-3 text-right">Quantité Livrée</th>
                    <th className="p-3">Conservation</th>
                    <th className="p-3">Date Expiration (DLUO)</th>
                    <th className="p-3 text-right">Statut Qualité</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredInventory.map(med => (
                    <tr key={med.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{med.commercialName}</div>
                        <div className="text-[11px] text-slate-500 italic">{med.innName}</div>
                      </td>
                      <td className="p-3 font-mono text-[11px] text-slate-700">
                        {med.batchNumber}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900">
                        {med.quantityDelivered.toLocaleString('fr-FR')} {med.unitOfMeasure}s
                      </td>
                      <td className="p-3">
                        {med.storageRequirement === 'COLD_CHAIN_2_8C' ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-sky-800 bg-sky-50 px-2 py-0.5 rounded text-[11px] border border-sky-200">
                            <Snowflake className="w-3 h-3 text-sky-600" />
                            Frigo 2°C - 8°C
                          </span>
                        ) : (
                          <span className="text-slate-600 text-[11px]">
                            Ambiant &lt; 30°C
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="font-mono text-slate-800 font-semibold">{med.expirationDate}</div>
                        <div className="text-[10px] text-slate-500">
                          {med.monthsRemainingUntilExpiry > 0 
                            ? `Reste ${med.monthsRemainingUntilExpiry} mois` 
                            : 'Périmé !'}
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        {med.status === 'CONFORME_VALIDE' && (
                          <span className="inline-flex items-center gap-1 font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Conforme
                          </span>
                        )}
                        {med.status === 'EXPIRATION_PROCHE' && (
                          <span className="inline-flex items-center gap-1 font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded text-[11px] border border-amber-200">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            &lt; 6 mois
                          </span>
                        )}
                        {med.status === 'PERIME_REJETE' && (
                          <span className="inline-flex items-center gap-1 font-semibold text-rose-800 bg-rose-50 px-2 py-0.5 rounded text-[11px] border border-rose-200">
                            <X className="w-3 h-3 text-rose-600" />
                            Périmé
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Official Inspection Sign-off Footnote */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>
                  Pharmacien Réceptionnaire : <strong>{activeDelivery?.pharmacistRecipientName}</strong> (Tél : {activeDelivery?.pharmacistPhone})
                </span>
              </div>
              <div className="text-slate-500 font-mono text-[11px]">
                Validation conforme PNAM / Fonds Mondial RDC
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Medicine Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Pill className="w-4 h-4 text-rose-600" />
                <span>Ajout d'un Lot Médical au Bordereau</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMedicine} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nom Commercial du Médicament *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Coartem 20/120mg ou Vaccin Polio Oral"
                  value={newCommercialName}
                  onChange={e => setNewCommercialName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Classe Thérapeutique</label>
                  <select
                    value={newTherapeuticClass}
                    onChange={e => setNewTherapeuticClass(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="ANTIPALUDIQUE">Antipaludique (ACT)</option>
                    <option value="VACCIN">Vaccin</option>
                    <option value="ANTIBIOTIQUE">Antibiotique</option>
                    <option value="MATERNITE">Santé Maternelle</option>
                    <option value="SOLUTE">Soluté / SRO</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Stockage Requis</label>
                  <select
                    value={newStorage}
                    onChange={e => setNewStorage(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="ROOM_TEMP_UNDER_30C">Ambiant (&lt; 30°C)</option>
                    <option value="COLD_CHAIN_2_8C">Frigo (2°C - 8°C)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Numéro de Lot (Batch No) *</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: LOT-2026-MED-8812"
                    value={newBatchNumber}
                    onChange={e => setNewBatchNumber(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Date d'Expiration (DLUO) *</label>
                  <input
                    type="date"
                    required
                    value={newExpiryDate}
                    onChange={e => setNewExpiryDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Quantité Livrée</label>
                  <input
                    type="number"
                    min="1"
                    value={newQuantity}
                    onChange={e => setNewQuantity(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Unité de Mesure</label>
                  <select
                    value={newUnit}
                    onChange={e => setNewUnit(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="BOITE">Boîtes</option>
                    <option value="FLACON">Flacons</option>
                    <option value="AMPOULE">Ampoules</option>
                    <option value="BLISTER">Blisters</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-900 text-xs font-semibold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg cursor-pointer shadow-xs"
                >
                  Enregistrer le Lot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
