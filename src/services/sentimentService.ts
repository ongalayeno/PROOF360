import { CommunitySignal, SignalSentimentAnalysis, SentimentCategory, UrgencyLevel } from '../types/proof360';

interface TriggerRule {
  pattern: RegExp;
  weight: number;
  label: string;
  category: SentimentCategory;
}

const TRIGGER_RULES: TriggerRule[] = [
  // Extreme Distress & Health Risk (Weight: 35-45)
  { pattern: /chol[ée]ra|diarrh[ée]e|fi[èe]vre|typho[ïi]de/i, weight: 45, label: 'Épidémie / Risque hydrique', category: 'DISTRESS_URGENT' },
  { pattern: /enfant(s)? malade(s)?|b[ée]b[ée](s)? malade(s)?/i, weight: 40, label: 'Santé des enfants menacée', category: 'DISTRESS_URGENT' },
  { pattern: /eau (rouge|sale|pollu[ée]e|insalubre|marron|boueuse)/i, weight: 35, label: 'Eau insalubre / Boue', category: 'DISTRESS_URGENT' },
  { pattern: /vaccin(s)?|cha[îi]ne du froid|dispensaire.*(noir|coup[ée]|panne)/i, weight: 40, label: 'Rupture chaîne du froid vaccins', category: 'DISTRESS_URGENT' },
  { pattern: /au secours|aidez(-|\s)?nous|urgence absolue|situation critique/i, weight: 35, label: 'Appel de détresse usagers', category: 'DISTRESS_URGENT' },
  
  // Chronic Shortage & Popular Anger (Weight: 30-40)
  { pattern: /col[èe]re|exasp[ée]r(ation|[ée])|r[ée]volte|populace en col[èe]re/i, weight: 40, label: 'Colère populaire vive', category: 'ANGER_CHRONIC' },
  { pattern: /marre|ras(-|\s)?le(-|\s)?bol|inadmissible|scandale|inacceptable/i, weight: 35, label: 'Exaspération / Inadmissible', category: 'ANGER_CHRONIC' },
  { pattern: /depuis (des|2|3|plusieurs) mois|(3|4|plusieurs) semaines/i, weight: 35, label: 'Pénurie chronique prolongée (>21j)', category: 'ANGER_CHRONIC' },
  { pattern: /sec|forage [àa] sec|plus d['’]eau|pompe [àa] sec/i, weight: 30, label: 'Ouvrage totalement à sec', category: 'ANGER_CHRONIC' },
  { pattern: /escroquerie|voleurs|mensonge|faux projet|abandonn[ée]s/i, weight: 30, label: 'Sentiment d’abandon / escroquerie', category: 'ANGER_CHRONIC' },
  
  // Lingala urgency & anger triggers
  { pattern: /kanda( makasi)?|koloba lisusu te/i, weight: 38, label: 'Colère Lingala (Kanda makasi)', category: 'ANGER_CHRONIC' },
  { pattern: /pasi mingi|mayi eza te|mayi ya mbindo/i, weight: 36, label: 'Souffrance / Eau sale Lingala', category: 'DISTRESS_URGENT' },
  { pattern: /bana bazali kobela/i, weight: 42, label: 'Enfants malades Lingala', category: 'DISTRESS_URGENT' },
  
  // Moderate Frustration (Weight: 15-25)
  { pattern: /d[ée]bit (faible|diminu[ée]|lent)|goutte [àa] goutte/i, weight: 20, label: 'Débit d’eau restreint', category: 'FRUSTRATION_MODERATE' },
  { pattern: /fuite|robinet cass[ée]|poign[ée]e d[ée]tach[ée]e/i, weight: 15, label: 'Dégradation matérielle locale', category: 'FRUSTRATION_MODERATE' },
  { pattern: /attente|file d['’]attente|r[ée]parateur pas venu/i, weight: 20, label: 'Lenteur du service après-vente', category: 'FRUSTRATION_MODERATE' },
  
  // Positive / Nominal (Negative weight)
  { pattern: /tr[èe]s bien|fonctionne bien|merci|f[ée]licitations|abondant/i, weight: -40, label: 'Satisfaction usagers', category: 'POSITIVE_SATISFACTION' },
  { pattern: /matondo|esimbisi|eau claire|eau limpide/i, weight: -35, label: 'Remerciements Lingala', category: 'POSITIVE_SATISFACTION' }
];

/**
 * Detect language of the feedback message
 */
export function detectFeedbackLanguage(text: string): 'FR' | 'LN' | 'SW' | 'MIXED' {
  const lower = text.toLowerCase();
  const lnCount = (lower.match(/\b(mayi|pasi|makasi|mingi|kanda|mwana|bana|biso|te|lisusu|kobela|matondo)\b/g) || []).length;
  const swCount = (lower.match(/\b(maji|watoto|shida|asante|mungu|mgonjwa|hapa|kazi|mingi)\b/g) || []).length;
  const frCount = (lower.match(/\b(le|la|les|de|eau|enfants|forage|panne|depuis|très|nous|est)\b/g) || []).length;

  if (lnCount > 0 && frCount > 0) return 'MIXED';
  if (lnCount >= 2) return 'LN';
  if (swCount >= 2) return 'SW';
  return 'FR';
}

/**
 * Perform deterministic, real-time natural language sentiment & urgency analysis
 */
export function analyzeSignalSentiment(
  message: string, 
  context?: {
    issueCategory?: string;
    postDeliveryAgeDays?: number;
    senderRole?: string;
  }
): SignalSentimentAnalysis {
  let urgencyScore = 30; // base score for generic incoming report
  const detectedTriggers: string[] = [];
  const matchedCategories: Record<SentimentCategory, number> = {
    ANGER_CHRONIC: 0,
    DISTRESS_URGENT: 0,
    FRUSTRATION_MODERATE: 0,
    NEUTRAL_INFORMATIVE: 0,
    POSITIVE_SATISFACTION: 0
  };

  for (const rule of TRIGGER_RULES) {
    if (rule.pattern.test(message)) {
      urgencyScore += rule.weight;
      detectedTriggers.push(rule.label);
      matchedCategories[rule.category] += Math.abs(rule.weight);
    }
  }

  // Factor in context metadata
  if (context?.issueCategory === 'WATER_DIRTY') {
    urgencyScore += 25;
    matchedCategories.DISTRESS_URGENT += 20;
    if (!detectedTriggers.includes('Alerte Qualité Eau Souillée')) {
      detectedTriggers.push('Alerte Qualité Eau Souillée');
    }
  } else if (context?.issueCategory === 'PUMP_BROKEN') {
    urgencyScore += 15;
    matchedCategories.FRUSTRATION_MODERATE += 10;
  } else if (context?.issueCategory === 'NOMINAL') {
    urgencyScore -= 20;
    matchedCategories.POSITIVE_SATISFACTION += 30;
  }

  // Punctuation amplification (exclamation marks, ALL CAPS)
  const exclamationCount = (message.match(/!/g) || []).length;
  if (exclamationCount >= 2) {
    urgencyScore += Math.min(exclamationCount * 3, 12);
  }
  const isCaps = message.length > 15 && message === message.toUpperCase();
  if (isCaps) {
    urgencyScore += 10;
  }

  // Clamp urgency score to [0, 100]
  urgencyScore = Math.max(0, Math.min(100, Math.round(urgencyScore)));

  // Determine dominant category
  let dominantSentiment: SentimentCategory = 'NEUTRAL_INFORMATIVE';
  let maxWeight = 0;
  for (const [cat, weight] of Object.entries(matchedCategories)) {
    if (weight > maxWeight) {
      maxWeight = weight;
      dominantSentiment = cat as SentimentCategory;
    }
  }

  if (urgencyScore >= 80 && matchedCategories.ANGER_CHRONIC > matchedCategories.DISTRESS_URGENT) {
    dominantSentiment = 'ANGER_CHRONIC';
  } else if (urgencyScore >= 80 && matchedCategories.DISTRESS_URGENT >= matchedCategories.ANGER_CHRONIC) {
    dominantSentiment = 'DISTRESS_URGENT';
  } else if (maxWeight === 0) {
    dominantSentiment = urgencyScore > 50 ? 'FRUSTRATION_MODERATE' : 'NEUTRAL_INFORMATIVE';
  }

  // Determine Urgency Level
  let urgencyLevel: UrgencyLevel = 'LOW';
  if (urgencyScore >= 80) urgencyLevel = 'CRITICAL';
  else if (urgencyScore >= 60) urgencyLevel = 'HIGH';
  else if (urgencyScore >= 35) urgencyLevel = 'MEDIUM';
  else urgencyLevel = 'LOW';

  // Construct readable emotion and justification
  let dominantEmotion = 'Constat technique factuel';
  let summaryJustification = "Signalement de routine sans indice d'animosité ni d'urgence vitale.";

  switch (dominantSentiment) {
    case 'ANGER_CHRONIC':
      dominantEmotion = "Colère vive & Exaspération usagers";
      summaryJustification = "Forte animosité détectée : manque d'eau ou panne prolongée perçue comme un abandon.";
      break;
    case 'DISTRESS_URGENT':
      dominantEmotion = "Détresse sanitaire & Urgence vitale";
      summaryJustification = "Risque sanitaire avéré ou détresse directe (eau polluée, enfants malades ou panne médicale).";
      break;
    case 'FRUSTRATION_MODERATE':
      dominantEmotion = "Frustration & Plainte modérée";
      summaryJustification = "Mécontentement technique ou lenteur de prise en charge sans danger vital immédiat.";
      break;
    case 'POSITIVE_SATISFACTION':
      dominantEmotion = "Satisfaction & Adhésion locale";
      summaryJustification = "Message de confirmation de fonctionnement ou remerciements de la communauté.";
      break;
    case 'NEUTRAL_INFORMATIVE':
    default:
      dominantEmotion = "Information technique neutre";
      summaryJustification = "Relevé technique ou message d'état régulier.";
      break;
  }

  const lang = detectFeedbackLanguage(message);

  return {
    sentiment: dominantSentiment,
    urgencyLevel,
    urgencyScore,
    dominantEmotion,
    detectedTriggers: detectedTriggers.slice(0, 4),
    summaryJustification,
    languageDetected: lang,
    analyzedAt: new Date().toISOString()
  };
}

/**
 * Batch enrich signals with sentiment analysis if missing
 */
export function enrichCommunitySignals(signals: CommunitySignal[]): CommunitySignal[] {
  return signals.map(sig => {
    if (sig.sentimentAnalysis) return sig;
    return {
      ...sig,
      sentimentAnalysis: analyzeSignalSentiment(sig.message, {
        issueCategory: sig.issueCategory,
        postDeliveryAgeDays: sig.postDeliveryAgeDays,
        senderRole: sig.senderRole
      })
    };
  });
}
