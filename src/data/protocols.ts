import { PVSProtocol } from '../types/proof360';

export const PROTOCOLS: Record<string, PVSProtocol> = {
  'PVS-WASH-001': {
    code: 'PVS-WASH-001',
    version: 1,
    name: 'Vérification de Forage d’Eau Potable avec Borne-Fontaine & Pompe',
    sector: 'WASH',
    description: 'Protocole standard d’inspection physique et hydraulique pour forages communautaires, bornes-fontaines et dalles de propreté anti-stagnation en RDC.',
    estimatedDurationMinutes: 45,
    sections: [
      {
        id: 'sec_presence_access',
        title: '1. Identification Physique & Accès au Site',
        fields: [
          {
            id: 'wash_site_exists',
            label: 'L’ouvrage hydraulique existe-t-il réellement à cet emplacement géographique ?',
            type: 'BOOLEAN',
            required: true,
            requireGps: true,
            helpText: 'Confirmer la présence matérielle d’une tête de forage ou borne.',
            anomalyTrigger: {
              condition: 'value === false',
              severity: 'CRITICAL',
              description: 'Ouvrage inexistant ou introuvable aux coordonnées du contrat (Projet fantôme).'
            }
          },
          {
            id: 'wash_photo_panoramic',
            label: 'Photo panoramique d’ensemble avec repères physiques locaux',
            type: 'PHOTO',
            required: true,
            requireGps: true,
            photoAngleHint: 'Vue à 10 mètres montrant la borne, le réservoir et l’environnement villageois.'
          }
        ]
      },
      {
        id: 'sec_civil_works',
        title: '2. Génie Civil & Salubrité de l’Ouvrage',
        fields: [
          {
            id: 'wash_slab_condition',
            label: 'État de la dalle de propreté anti-stagnation',
            type: 'SELECT',
            required: true,
            options: ['CONFORME_SANS_FISSURE', 'FISSURES_MINEURES', 'CRACKED_OR_MISSING'],
            requireGps: false,
            anomalyTrigger: {
              condition: 'value === "CRACKED_OR_MISSING"',
              severity: 'HIGH',
              description: 'Dalle de propreté fissurée ou absente. Risque d’infiltration directe des eaux usées.'
            }
          },
          {
            id: 'wash_drainage_canal_meters',
            label: 'Longueur du canal d’évacuation des eaux perdues (en mètres)',
            type: 'MEASUREMENT',
            unit: 'mètres',
            required: true,
            min: 0,
            max: 50,
            criticalBelow: 3,
            requireGps: false,
            anomalyTrigger: {
              condition: 'value < 3',
              severity: 'MEDIUM',
              description: 'Canal d’évacuation < 3m : stagnation fangeuse et prolifération de vecteurs.'
            }
          },
          {
            id: 'wash_photo_slab_and_drain',
            label: 'Photo nette de la dalle et du caniveau d’évacuation',
            type: 'PHOTO',
            required: true,
            requireGps: true,
            photoAngleHint: 'Vue rapprochée de la jonction entre la tête de colonne et le caniveau.'
          }
        ]
      },
      {
        id: 'sec_hydraulic_performance',
        title: '3. Débit & Fonctionnement Hydraulique Réel',
        fields: [
          {
            id: 'wash_water_flows',
            label: 'L’eau s’écoule-t-elle effectivement au robinet lors de l’essai ?',
            type: 'BOOLEAN',
            required: true,
            requireGps: true,
            anomalyTrigger: {
              condition: 'value === false',
              severity: 'CRITICAL',
              description: 'Point d’eau sec, pompe défaillante ou nappe tarie.'
            }
          },
          {
            id: 'wash_flow_rate_liters_minute',
            label: 'Débit mesuré au seau étalonné (Litres par minute)',
            type: 'MEASUREMENT',
            unit: 'L/min',
            required: true,
            min: 0,
            max: 200,
            criticalBelow: 10,
            anomalyTrigger: {
              condition: 'value < 10',
              severity: 'HIGH',
              description: 'Débit d’exploitation inférieur à la norme minimale de 10 L/min.'
            }
          },
          {
            id: 'wash_turbidity_visual',
            label: 'Aspect visuel et turbidité de l’eau prélevée',
            type: 'SELECT',
            required: true,
            options: ['LIMPIDE_CLAIRE', 'LEGEREMENT_OPALESCENTE', 'TURBID_OR_COLORED'],
            anomalyTrigger: {
              condition: 'value === "TURBID_OR_COLORED"',
              severity: 'HIGH',
              description: 'Eau boueuse ou colorée. Risque de rupture de crépine ou mauvais massif filtrant.'
            }
          },
          {
            id: 'wash_ph_measurement',
            label: 'pH mesuré (Bandelette ou pH-mètre)',
            type: 'MEASUREMENT',
            unit: 'pH',
            required: true,
            min: 4,
            max: 10,
            criticalBelow: 6.5,
            criticalAbove: 8.5,
            anomalyTrigger: {
              condition: 'value < 6.5 || value > 8.5',
              severity: 'MEDIUM',
              description: 'pH hors plage de potabilité OMS (6.5 à 8.5).'
            }
          }
        ]
      }
    ]
  },
  'PVS-BTP-001': {
    code: 'PVS-BTP-001',
    version: 1,
    name: 'Vérification de Bâtiment Scolaire / Centre de Santé (PDL-145T)',
    sector: 'BTP',
    description: 'Protocole de conformité architecturale, qualité de la maçonnerie, charpente métallique et toiture bac pour programmes nationaux en RDC.',
    estimatedDurationMinutes: 60,
    sections: [
      {
        id: 'sec_btp_footprint',
        title: '1. Emprise au Sol & Gros Œuvre',
        fields: [
          {
            id: 'btp_site_exists',
            label: 'Le bâtiment est-il implanté aux coordonnées prévues au marché ?',
            type: 'BOOLEAN',
            required: true,
            requireGps: true,
            anomalyTrigger: {
              condition: 'value === false',
              severity: 'CRITICAL',
              description: 'Bâtiment non localisé sur le site contractuel.'
            }
          },
          {
            id: 'btp_classrooms_count',
            label: 'Nombre réel de salles de classe / blocs achevés',
            type: 'NUMBER',
            required: true,
            min: 1,
            max: 20
          },
          {
            id: 'btp_photo_facade',
            label: 'Photo de face de l’ensemble du bâtiment',
            type: 'PHOTO',
            required: true,
            requireGps: true,
            photoAngleHint: 'Prise de vue grand angle montrant l’enseigne et les accès véranda.'
          }
        ]
      },
      {
        id: 'sec_btp_roofing',
        title: '2. Charpente & Toiture',
        fields: [
          {
            id: 'btp_roof_condition',
            label: 'État de fixation des tôles et étanchéité',
            type: 'SELECT',
            required: true,
            options: ['CONFORME_SANS_FUITE', 'VIS_MANQUANTES', 'DEFECTUEUX_INFILTRATION'],
            anomalyTrigger: {
              condition: 'value === "DEFECTUEUX_INFILTRATION"',
              severity: 'HIGH',
              description: 'Toiture défaillante avec risque de soulèvement au vent ou infiltrations.'
            }
          },
          {
            id: 'btp_photo_roof_structure',
            label: 'Photo des pannes et fermes de charpente intérieure',
            type: 'PHOTO',
            required: true,
            requireGps: true
          }
        ]
      }
    ]
  },
  'PVS-SOLAR-001': {
    code: 'PVS-SOLAR-001',
    version: 1,
    name: 'Vérification Mini-Réseau Solaire & Électrification Rurale',
    sector: 'SOLAR',
    description: 'Protocole de réception technique pour centrales solaires photovoltaïques autonomes, parcs de batteries et onduleurs en milieu rural congolais.',
    estimatedDurationMinutes: 50,
    sections: [
      {
        id: 'sec_pv_array',
        title: '1. Champ Photovoltaïque & Structure',
        fields: [
          {
            id: 'solar_modules_installed_count',
            label: 'Nombre réel de panneaux solaires posés et câblés',
            type: 'NUMBER',
            required: true,
            min: 2,
            max: 500
          },
          {
            id: 'solar_photo_array',
            label: 'Photo d’ensemble du champ solaire',
            type: 'PHOTO',
            required: true,
            requireGps: true
          }
        ]
      },
      {
        id: 'sec_inverter_power',
        title: '2. Onduleurs, Batteries & Tension de Sortie',
        fields: [
          {
            id: 'solar_inverter_voltage_ac',
            label: 'Tension efficace AC mesurée en sortie de l’onduleur (Volts)',
            type: 'MEASUREMENT',
            unit: 'V',
            required: true,
            min: 150,
            max: 260,
            criticalBelow: 200,
            criticalAbove: 245,
            anomalyTrigger: {
              condition: 'value < 200 || value > 245',
              severity: 'HIGH',
              description: 'Tension hors plage nominale (220-230V ± 10%). Risque pour les équipements.'
            }
          },
          {
            id: 'solar_photo_inverter_screen',
            label: 'Photo du multimètre ou de l’écran onduleur affichant la tension',
            type: 'PHOTO',
            required: true,
            requireGps: true
          }
        ]
      }
    ]
  },
  'PVS-ENV-001': {
    code: 'PVS-ENV-001',
    version: 1,
    name: 'Audit de Reboisement & Pépinières Carbone (Bassin du Congo)',
    sector: 'ENV',
    description: 'Vérification physique des parcelles reboisées, taux de reprise des essences forestières autochtones et géolocalisation des plants pour certification carbone.',
    estimatedDurationMinutes: 60,
    sections: [
      {
        id: 'sec_tree_counting',
        title: '1. Survie & Densité Végétale',
        fields: [
          {
            id: 'env_survival_rate_percent',
            label: 'Taux de reprise et survie des plants à 12 mois (%)',
            type: 'MEASUREMENT',
            unit: '%',
            required: true,
            min: 0,
            max: 100,
            criticalBelow: 65,
            anomalyTrigger: {
              condition: 'value < 65',
              severity: 'HIGH',
              description: 'Taux de survie des plants sous le seuil d’éligibilité aux crédits carbone (minimum 65%).'
            }
          },
          {
            id: 'env_photo_reforestation_transect',
            label: 'Photo du transect de végétation et alignement des plants',
            type: 'PHOTO',
            required: true,
            requireGps: true
          }
        ]
      }
    ]
  },
  'PVS-AGRI-001': {
    code: 'PVS-AGRI-001',
    version: 1,
    name: 'Chaînes de Valeur Agricoles, Greniers Vivriers & Pistes de Desserte',
    sector: 'AGRI',
    description: 'Audit physique des greniers de stockage vivriers, humidité des silos, moulins/décortiqueuses et roulabilité des pistes de desserte agricole (projets BAD, PAM, FIDA).',
    estimatedDurationMinutes: 60,
    sections: [
      {
        id: 'sec_agri_storage',
        title: '1. Stockage Vivrier & Taux d’Humidité des Silos',
        fields: [
          {
            id: 'agri_silo_moisture_percent',
            label: 'Taux d’humidité mesuré dans les grains du silo (%)',
            type: 'MEASUREMENT',
            unit: '%',
            required: true,
            min: 0,
            max: 35,
            criticalBelow: 0,
            anomalyTrigger: {
              condition: 'value > 14',
              severity: 'CRITICAL',
              description: 'Taux d’humidité > 14% : risque majeur d’aflatoxines et de pourriture des récoltes.'
            }
          },
          {
            id: 'agri_pest_proof_condition',
            label: 'Protection anti-rongeurs et étanchéité de l’entrepôt',
            type: 'SELECT',
            required: true,
            options: ['PARFAITE_ETANCHEITE', 'DEFAUT_MINEUR', 'INFESTATION_OUVERTURES'],
            anomalyTrigger: {
              condition: 'value === "INFESTATION_OUVERTURES"',
              severity: 'HIGH',
              description: 'Entrepôt non étanche aux rongeurs et ravageurs : perte critique de denrées.'
            }
          }
        ]
      },
      {
        id: 'sec_agri_processing',
        title: '2. Équipements de Transformation & Pistes',
        fields: [
          {
            id: 'agri_mill_operational',
            label: 'Le moulin ou décortiqueuse motorisée est-il fonctionnel avec débit nominal ?',
            type: 'BOOLEAN',
            required: true,
            requireGps: true,
            anomalyTrigger: {
              condition: 'value === false',
              severity: 'HIGH',
              description: 'Matériel de transformation agricole à l’arrêt ou non livré.'
            }
          },
          {
            id: 'agri_track_passability',
            label: 'Viabilité et roulabilité de la piste de desserte agricole',
            type: 'SELECT',
            required: true,
            options: ['PRATICABLE_TOUT_VEHICULE', '4X4_UNIQUEMENT', 'IMPRACTICABLE_BOURBIER'],
            anomalyTrigger: {
              condition: 'value === "IMPRACTICABLE_BOURBIER"',
              severity: 'CRITICAL',
              description: 'Piste coupée par un bourbier ou pont effondré : évacuation des récoltes impossible.'
            }
          },
          {
            id: 'agri_photo_fields_or_silo',
            label: 'Photo géoréférencée des silos et des équipements de transformation',
            type: 'PHOTO',
            required: true,
            requireGps: true
          }
        ]
      }
    ]
  },
  'PVS-MINE-001': {
    code: 'PVS-MINE-001',
    version: 1,
    name: 'Audit RSE & Dotation Minière de 0,3% (Code Minier RDC)',
    sector: 'MINE',
    description: 'Vérification physique des infrastructures communautaires financées par la dotation de 0,3% du chiffre d’affaires des entreprises minières (Lualaba, Haut-Katanga, Ituri).',
    estimatedDurationMinutes: 50,
    sections: [
      {
        id: 'sec_mine_bpu',
        title: '1. Conformité BPU & Qualité des Ouvrages',
        fields: [
          {
            id: 'mine_bpu_materials_conforming',
            label: 'Les matériaux installés correspondent-ils strictement aux spécifications du BPU minier ?',
            type: 'BOOLEAN',
            required: true,
            anomalyTrigger: {
              condition: 'value === false',
              severity: 'CRITICAL',
              description: 'Substitution frauduleuse de matériaux de qualité inférieure par rapport au BPU validé.'
            }
          },
          {
            id: 'mine_local_workforce_ratio_percent',
            label: 'Taux effectif de main-d’œuvre locale riveraine employée (%)',
            type: 'MEASUREMENT',
            unit: '%',
            required: true,
            min: 0,
            max: 100,
            criticalBelow: 70,
            anomalyTrigger: {
              condition: 'value < 70',
              severity: 'MEDIUM',
              description: 'Taux de recrutement local sous les 70% obligatoires du cahier des charges RSE.'
            }
          }
        ]
      },
      {
        id: 'sec_mine_environmental',
        title: '2. Salubrité & Approbation Communautaire (CLD)',
        fields: [
          {
            id: 'mine_cld_reception_signed',
            label: 'Le président du Comité Local de Développement (CLD) atteste-t-il la réception conforme ?',
            type: 'BOOLEAN',
            required: true,
            anomalyTrigger: {
              condition: 'value === false',
              severity: 'HIGH',
              description: 'Refus de signature du CLD pour malfaçons ou non-respect des engagements miniers.'
            }
          },
          {
            id: 'mine_photo_infrastructure',
            label: 'Photo du chantier financé avec plaque officielle de dotation minière 0,3%',
            type: 'PHOTO',
            required: true,
            requireGps: true
          }
        ]
      }
    ]
  },
  'PVS-HYDRO-001': {
    code: 'PVS-HYDRO-001',
    version: 1,
    name: 'Micro-Barrages & Centrales Hydroélectriques Rurales',
    sector: 'HYDRO',
    description: 'Contrôle technique des ouvrages hydrauliques, turbines pico-hydro, dégrilleurs et tension électrique délivrée aux réseaux villageois.',
    estimatedDurationMinutes: 60,
    sections: [
      {
        id: 'sec_hydro_intake',
        title: '1. Ouvrage de Prise d’Eau & Conduite Forcée',
        fields: [
          {
            id: 'hydro_intake_trashrack_clean',
            label: 'La grille de dégrillage de la prise d’eau est-elle intacte et exempte d’embâcles ?',
            type: 'BOOLEAN',
            required: true,
            anomalyTrigger: {
              condition: 'value === false',
              severity: 'HIGH',
              description: 'Dégrilleur obstrué ou rompu : risque d’endommagement immédiat de la turbine.'
            }
          },
          {
            id: 'hydro_penstock_leaks',
            label: 'Présence de fuites d’eau sous pression sur la conduite forcée',
            type: 'SELECT',
            required: true,
            options: ['AUCUNE_FUITE', 'SUINTEMENT_MINEUR', 'FUITE_CRITIQUE_SOUS_PRESSION'],
            anomalyTrigger: {
              condition: 'value === "FUITE_CRITIQUE_SOUS_PRESSION"',
              severity: 'CRITICAL',
              description: 'Rupture d’étanchéité de conduite forcée avec perte de charge motrice.'
            }
          }
        ]
      },
      {
        id: 'sec_hydro_generation',
        title: '2. Turbine, Alternateur & Tension Réseau',
        fields: [
          {
            id: 'hydro_output_voltage_vac',
            label: 'Tension stabilisée mesurée aux bornes du transformateur (Volts AC)',
            type: 'MEASUREMENT',
            unit: 'V',
            required: true,
            min: 150,
            max: 450,
            criticalBelow: 200,
            anomalyTrigger: {
              condition: 'value < 205 || value > 245',
              severity: 'HIGH',
              description: 'Tension électrique hors tolérance (230V ± 10%) : risque d’incendie ou grillage d’appareils.'
            }
          },
          {
            id: 'hydro_photo_turbine',
            label: 'Photo de la turbine en rotation et compteur kilométrique/électrique de production',
            type: 'PHOTO',
            required: true,
            requireGps: true
          }
        ]
      }
    ]
  },
  'PVS-DIGITAL-001': {
    code: 'PVS-DIGITAL-001',
    version: 1,
    name: 'Télécentres Communautaires & Tours Télécoms Rurales (FSU)',
    sector: 'DIGITAL',
    description: 'Vérification des infrastructures numériques du Fonds de Service Universel (FSU) : pylônes GSM, parcs solaires télécoms et débits mesurés.',
    estimatedDurationMinutes: 40,
    sections: [
      {
        id: 'sec_digital_tower',
        title: '1. Pylône Télécom & Énergie Solaire',
        fields: [
          {
            id: 'digital_tower_structural_ok',
            label: 'Pylône métallique érigé avec haubanage et parafoudre certifiés conformes',
            type: 'BOOLEAN',
            required: true,
            anomalyTrigger: {
              condition: 'value === false',
              severity: 'CRITICAL',
              description: 'Défaut structurel du mât ou absence de parafoudre : danger d’effondrement.'
            }
          },
          {
            id: 'digital_speedtest_down_mbps',
            label: 'Débit Internet descendant réel mesuré sur place (Speedtest Mbps)',
            type: 'MEASUREMENT',
            unit: 'Mbps',
            required: true,
            min: 0,
            max: 200,
            criticalBelow: 5,
            anomalyTrigger: {
              condition: 'value < 5',
              severity: 'HIGH',
              description: 'Débit Internet < 5 Mbps : non-respect du cahier des charges de connectivité rurale.'
            }
          }
        ]
      },
      {
        id: 'sec_digital_terminals',
        title: '2. Terminaux & Salle Informatique',
        fields: [
          {
            id: 'digital_computers_count',
            label: 'Nombre d’ordinateurs ou tablettes opérationnels livrés',
            type: 'MEASUREMENT',
            unit: 'unités',
            required: true,
            min: 0,
            max: 100
          },
          {
            id: 'digital_photo_speedtest',
            label: 'Capture d’écran certifiée du test de débit avec coordonnées GPS in-app',
            type: 'PHOTO',
            required: true,
            requireGps: true
          }
        ]
      }
    ]
  },
  'PVS-PECHE-001': {
    code: 'PVS-PECHE-001',
    version: 1,
    name: 'Débarcadères Intégrés & Chambres Froides Solaires pour Poissonneries',
    sector: 'PECHE',
    description: 'Contrôle des installations portuaires artisanales, des machines à glace solaires et de la salubrité de conservation du poisson.',
    estimatedDurationMinutes: 45,
    sections: [
      {
        id: 'sec_peche_cold',
        title: '1. Chaîne du Froid & Production de Glace',
        fields: [
          {
            id: 'peche_ice_machine_running',
            label: 'La machine à glace solaire produit-elle des paillettes de glace au cubage contractuel ?',
            type: 'BOOLEAN',
            required: true,
            anomalyTrigger: {
              condition: 'value === false',
              severity: 'CRITICAL',
              description: 'Machine à glace en panne : avarie immédiate du poisson pêché.'
            }
          },
          {
            id: 'peche_cold_room_temp_celsius',
            label: 'Température mesurée à l’intérieur de la chambre froide isotherme (°C)',
            type: 'MEASUREMENT',
            unit: '°C',
            required: true,
            min: -30,
            max: 25,
            criticalBelow: -30,
            anomalyTrigger: {
              condition: 'value > 2',
              severity: 'HIGH',
              description: 'Température de conservation > 2°C : rupture de la chaîne du froid des produits halieutiques.'
            }
          }
        ]
      },
      {
        id: 'sec_peche_sanitary',
        title: '2. Ponton d’Accostage & Salubrité',
        fields: [
          {
            id: 'peche_dock_condition',
            label: 'État du quai d’accostage et du système d’évacuation des eaux de nettoyage',
            type: 'SELECT',
            required: true,
            options: ['SALUBRE_AVEC_EVACUATION', 'DEFAUT_NETTOYAGE', 'INSALUBRITE_REJETS_DIRECTS'],
            anomalyTrigger: {
              condition: 'value === "INSALUBRITE_REJETS_DIRECTS"',
              severity: 'MEDIUM',
              description: 'Insalubrité du débarcadère avec risque de contamination bactérienne du poisson.'
            }
          },
          {
            id: 'peche_photo_cold_room',
            label: 'Photo de la chambre froide avec affichage du thermomètre digital étalonné',
            type: 'PHOTO',
            required: true,
            requireGps: true
          }
        ]
      }
    ]
  },
  'PVS-HEALTH-001': {
    code: 'PVS-HEALTH-001',
    version: 1,
    name: 'Vérification Livraison Médicaments, Chaîne du Froid & DLUO Centre de Santé',
    sector: 'HEALTH',
    description: 'Protocole médical de réception des intrants de santé essentiels, contrôle des logs de température des réfrigérateurs solaires (2°C à 8°C), inventaire physique des lots et détection des péremptions (DLUO) pour centres de santé ruraux.',
    estimatedDurationMinutes: 50,
    sections: [
      {
        id: 'sec_health_cold_chain',
        title: '1. Intégrité de la Chaîne du Froid (Vaccins & Insuline)',
        fields: [
          {
            id: 'health_fridge_operational',
            label: 'Le réfrigérateur médical solaire ou hybride est-il en état de fonctionnement continu ?',
            type: 'BOOLEAN',
            required: true,
            anomalyTrigger: {
              condition: 'value === false',
              severity: 'CRITICAL',
              description: 'Réfrigérateur médical à l’arrêt : destruction immédiate des stocks de vaccins thermo-sensibles.'
            }
          },
          {
            id: 'health_cold_chain_temp_celsius',
            label: 'Température actuelle relevée au thermomètre étalonné (°C)',
            type: 'MEASUREMENT',
            unit: '°C',
            required: true,
            min: -10,
            max: 35,
            criticalBelow: 2,
            anomalyTrigger: {
              condition: 'value < 2 || value > 8',
              severity: 'CRITICAL',
              description: 'Rupture de la chaîne du froid : température hors de la plage vitale OMS (2°C - 8°C).'
            }
          },
          {
            id: 'health_datalogger_compliance',
            label: 'Relevé de l’enregistreur continu de température (Datalogger USB / Berceau)',
            type: 'SELECT',
            required: true,
            options: ['AUCUNE_EXCURSION_30J', 'EXCURSION_MINEURE_RECUPEREE', 'RUPTURE_MAJEURE_EXCURSION'],
            anomalyTrigger: {
              condition: 'value === "RUPTURE_MAJEURE_EXCURSION"',
              severity: 'CRITICAL',
              description: 'Excursion thermique continue constatée (>8°C pendant plus de 2 heures) : lots de vaccins impropres.'
            }
          },
          {
            id: 'health_photo_fridge_datalogger',
            label: 'Photo nette de l’écran du réfrigérateur et du capteur datalogger',
            type: 'PHOTO',
            required: true,
            requireGps: true,
            photoAngleHint: 'Vue montrant l’afficheur digital et le numéro de série du réfrigérateur solaire.'
          }
        ]
      },
      {
        id: 'sec_health_medicine_inventory',
        title: '2. Inventaire des Intrants & Contrôle des Péremptions (DLUO)',
        fields: [
          {
            id: 'health_delivery_slip_match',
            label: 'Le colisage physique correspond-il intégralement au Bon de Livraison (B/L) officiel ?',
            type: 'BOOLEAN',
            required: true,
            anomalyTrigger: {
              condition: 'value === false',
              severity: 'HIGH',
              description: 'Écart quantitatif constaté entre le bon de livraison certifié et les cartons déballés.'
            }
          },
          {
            id: 'health_items_counted_total',
            label: 'Nombre total de conditionnements / unités pharmaceutiques réceptionnées',
            type: 'NUMBER',
            required: true,
            min: 1,
            max: 50000
          },
          {
            id: 'health_expired_drugs_found',
            label: 'Des médicaments périmés ou à moins de 6 mois de la DLUO ont-ils été détectés ?',
            type: 'BOOLEAN',
            required: true,
            anomalyTrigger: {
              condition: 'value === true',
              severity: 'CRITICAL',
              description: 'Présence de médicaments périmés ou quasi-périmés livrés au centre de santé rural.'
            }
          },
          {
            id: 'health_tamper_packaging_intact',
            label: 'Les scellés de sécurité et emballages d’origine des laboratoires sont-ils intacts ?',
            type: 'BOOLEAN',
            required: true,
            anomalyTrigger: {
              condition: 'value === false',
              severity: 'HIGH',
              description: 'Scellés pharmaceutiques violés ou boîtes reconditionnées : risque de médicaments falsifiés/volés.'
            }
          },
          {
            id: 'health_photo_medicine_stock',
            label: 'Photo des cartons déballés avec étiquettes de lots et dates d’expiration visibles',
            type: 'PHOTO',
            required: true,
            requireGps: true,
            photoAngleHint: 'Vue macro sur les numéros de lots (Batch No) et dates d’expiration (EXP) des boîtes.'
          }
        ]
      }
    ]
  }
};
