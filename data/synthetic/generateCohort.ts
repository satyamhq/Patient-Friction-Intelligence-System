/**
 * PFIS Synthetic Cohort Generator
 * 
 * Generates reproducible, realistic, non-clinical synthetic healthcare access datasets.
 * Guaranteed zero Real Protected Health Information (PHI).
 * Fully deterministic given a pseudo-random seed.
 */

export interface SyntheticPatientRecord {
  id: string;
  patientCode: string;
  name: string;
  age: number;
  gender: 'Female' | 'Male' | 'Other';
  location: {
    village: string;
    subDistrict: string;
    district: string;
    state: string;
    coordinates: [number, number]; // [lng, lat]
    distanceToNearestHospitalKm: number;
  };
  socioeconomic: {
    primaryOccupation: string;
    dailyWageINR: number;
    monthlyHouseholdIncomeINR: number;
    rationCardCategory: 'BPL' | 'AAY' | 'APL';
    hasSmartphone: boolean;
    digitalLiteracyTier: 'none' | 'basic' | 'proficient';
    primaryLanguage: string;
    hindiFluency: 'none' | 'conversational' | 'fluent';
  };
  careJourney: {
    journeyId: string;
    conditionCategory: string;
    referralSource: 'ASHA_Worker' | 'Primary_Health_Center' | 'Self';
    currentStage: 'referral' | 'consultation' | 'diagnostics' | 'treatment' | 'followup' | 'dropped_out';
    dropoutReason?: string;
    totalVisitsRequired: number;
    visitsCompleted: number;
  };
  frictionProfile: {
    overallFrictionScore: number;
    transitImpedance: number;
    distanceImpedance: number;
    financialStrain: number;
    digitalBarrier: number;
    documentationDeficit: number;
    appointmentTimingConflict: number;
    dominantBarrier: string;
  };
  syntheticVerificationTag: 'PFIS-SYNTHETIC-DATA-V1';
}

const FIRST_NAMES_F = ['Sunita', 'Anita', 'Manpreet', 'Pooja', 'Kamla', 'Rani', 'Suman', 'Meena', 'Geeta', 'Urmila'];
const FIRST_NAMES_M = ['Gurpreet', 'Rajesh', 'Balwinder', 'Manoj', 'Ramesh', 'Harpreet', 'Amit', 'Mukesh', 'Satnam', 'Suresh'];
const LAST_NAMES = ['Kaur', 'Devi', 'Singh', 'Kumar', 'Sharma', 'Ram', 'Verma', 'Lal', 'Bai', 'Das'];

const VILLAGES = [
  { name: 'Chak Bilga', sub: 'Phillaur', dist: 'Jalandhar', lat: 31.0542, lng: 75.6981, distKm: 28 },
  { name: 'Nurpur Kalan', sub: 'Nakodar', dist: 'Jalandhar', lat: 31.1120, lng: 75.4820, distKm: 34 },
  { name: 'Kotla Nihang', sub: 'Rupnagar', dist: 'Rupnagar', lat: 30.9520, lng: 76.5120, distKm: 22 },
  { name: 'Bhojpur', sub: 'Samrala', dist: 'Ludhiana', lat: 30.8240, lng: 76.1820, distKm: 18 },
  { name: 'Kishanpura', sub: 'Zira', dist: 'Firozpur', lat: 30.9850, lng: 75.0120, distKm: 42 },
  { name: 'Mahilpur Rural', sub: 'Garhshankar', dist: 'Hoshiarpur', lat: 31.3320, lng: 76.0420, distKm: 29 },
];

const OCCUPATIONS = [
  'Daily Wage Agricultural Laborer',
  'Smallholder Farmer',
  'Weaver / Artisan',
  'Brick Kiln Worker',
  'Street Vendor',
  'Homemaker',
  'Construction Helper',
];

const CONDITIONS = [
  'Chronic Hypertension Follow-up',
  'Type 2 Diabetes Screening & Refill',
  'Maternal Antenatal 3rd Trimester',
  'Pediatric Nutritional Surveillance',
  'Suspected Pulmonary TB Screening',
  'Orthopedic Mobility Assessment',
];

/**
 * Deterministic pseudo-random number generator (Mulberry32)
 */
function createRng(seed: number) {
  let s = seed;
  return function () {
    let t = (s += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateSyntheticCohort(
  cohortSize: number = 500,
  randomSeed: number = 42
): SyntheticPatientRecord[] {
  const rng = createRng(randomSeed);
  const cohort: SyntheticPatientRecord[] = [];

  for (let i = 1; i <= cohortSize; i++) {
    const isFemale = rng() > 0.48;
    const firstName = isFemale
      ? FIRST_NAMES_F[Math.floor(rng() * FIRST_NAMES_F.length)]
      : FIRST_NAMES_M[Math.floor(rng() * FIRST_NAMES_M.length)];
    const lastName = LAST_NAMES[Math.floor(rng() * LAST_NAMES.length)];
    const age = Math.floor(18 + rng() * 62);

    const village = VILLAGES[Math.floor(rng() * VILLAGES.length)];
    const coordJitterLat = (rng() - 0.5) * 0.04;
    const coordJitterLng = (rng() - 0.5) * 0.04;

    const dailyWage = Math.floor(250 + rng() * 350);
    const hasSmart = rng() > 0.58;
    const literacy: 'none' | 'basic' | 'proficient' = hasSmart
      ? rng() > 0.4 ? 'proficient' : 'basic'
      : rng() > 0.6 ? 'basic' : 'none';

    const distKm = Math.round(village.distKm + (rng() - 0.5) * 12);
    const transitImp = Math.min(100, Math.round(30 + (distKm * 1.5) + (rng() * 25)));
    const costImp = Math.min(100, Math.round(75 - (dailyWage / 12) + (rng() * 20)));
    const digitalBar = literacy === 'none' ? Math.round(75 + rng() * 20) : literacy === 'basic' ? Math.round(40 + rng() * 20) : Math.round(15 + rng() * 15);
    const docDef = rng() > 0.5 ? Math.round(20 + rng() * 40) : Math.round(55 + rng() * 35);
    const timingConf = dailyWage > 350 ? Math.round(60 + rng() * 30) : Math.round(25 + rng() * 30);

    const overall = Math.min(100, Math.max(15, Math.round(
      transitImp * 0.28 +
      costImp * 0.24 +
      digitalBar * 0.18 +
      docDef * 0.15 +
      timingConf * 0.15
    )));

    let dominant = 'Rural Transit Availability';
    if (costImp > transitImp && costImp > digitalBar) dominant = 'Out-of-Pocket Cost / Wage Loss';
    else if (digitalBar > transitImp) dominant = 'Digital Literacy / Portal Exclusion';
    else if (docDef > 70) dominant = 'Scheme Documentation Deficit';

    const condition = CONDITIONS[Math.floor(rng() * CONDITIONS.length)];
    let stage: SyntheticPatientRecord['careJourney']['currentStage'] = 'referral';
    const progressRoll = rng();
    if (progressRoll > 0.70) stage = 'consultation';
    else if (progressRoll > 0.45) stage = 'diagnostics';
    else if (progressRoll > 0.25) stage = 'treatment';
    else if (progressRoll > 0.10) stage = 'followup';
    else stage = 'dropped_out';

    let dropoutReason: string | undefined;
    if (stage === 'dropped_out') {
      dropoutReason = dominant;
    }

    cohort.push({
      id: `syn_pat_${String(i).padStart(4, '0')}`,
      patientCode: `PFIS-${village.dist.slice(0, 3).toUpperCase()}-${String(i).padStart(4, '0')}`,
      name: `${firstName} ${lastName}`,
      age,
      gender: isFemale ? 'Female' : 'Male',
      location: {
        village: village.name,
        subDistrict: village.sub,
        district: village.dist,
        state: 'Punjab',
        coordinates: [
          parseFloat((village.lng + coordJitterLng).toFixed(5)),
          parseFloat((village.lat + coordJitterLat).toFixed(5)),
        ],
        distanceToNearestHospitalKm: Math.max(4, distKm),
      },
      socioeconomic: {
        primaryOccupation: OCCUPATIONS[Math.floor(rng() * OCCUPATIONS.length)],
        dailyWageINR: dailyWage,
        monthlyHouseholdIncomeINR: dailyWage * 24,
        rationCardCategory: dailyWage < 350 ? 'BPL' : dailyWage < 450 ? 'AAY' : 'APL',
        hasSmartphone: hasSmart,
        digitalLiteracyTier: literacy,
        primaryLanguage: rng() > 0.3 ? 'Punjabi' : 'Hindi',
        hindiFluency: rng() > 0.25 ? 'fluent' : 'conversational',
      },
      careJourney: {
        journeyId: `syn_jrn_${String(i).padStart(4, '0')}`,
        conditionCategory: condition,
        referralSource: rng() > 0.5 ? 'ASHA_Worker' : 'Primary_Health_Center',
        currentStage: stage,
        dropoutReason,
        totalVisitsRequired: 4,
        visitsCompleted: stage === 'referral' ? 0 : stage === 'consultation' ? 1 : stage === 'diagnostics' ? 2 : stage === 'treatment' ? 3 : 4,
      },
      frictionProfile: {
        overallFrictionScore: overall,
        transitImpedance: transitImp,
        distanceImpedance: Math.min(100, Math.round(distKm * 2.2)),
        financialStrain: costImp,
        digitalBarrier: digitalBar,
        documentationDeficit: docDef,
        appointmentTimingConflict: timingConf,
        dominantBarrier: dominant,
      },
      syntheticVerificationTag: 'PFIS-SYNTHETIC-DATA-V1',
    });
  }

  return cohort;
}
