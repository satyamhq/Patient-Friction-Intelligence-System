/**
 * Clinical Digital Triage Engine
 * Aligned with National Health Mission (NHM), IMNCI, and Maternal Health Protocol Guidelines.
 * Classifies symptoms into 4 clear urgency tiers and recommends the care-pathway.
 */

export type UrgencyTier = 'EMERGENCY_108' | 'PHC_VISIT' | 'TELECONSULT' | 'SELF_CARE';

export interface SymptomInput {
  age: number;
  gender: 'male' | 'female' | 'other';
  isPregnant?: boolean;
  gestationalWeeks?: number;
  symptoms: string[];
  durationDays?: number;
  vitalSigns?: {
    systolicBP?: number;
    diastolicBP?: number;
    heartRate?: number;
    spO2?: number;
    temperatureF?: number;
    bloodSugarMgDl?: number;
  };
  redFlagsReported?: string[];
  chiefComplaint: string;
}

export interface TriageResult {
  urgency: UrgencyTier;
  confidenceScore: number;
  protocolCategory: 'IMNCI_PEDIATRIC' | 'MATERNAL_ANC' | 'CHRONIC_NCD' | 'ACUTE_ADULT' | 'GENERAL';
  primaryRecommendation: string;
  recommendedFacilityLevel: 'Sub-Centre' | 'PHC' | 'CHC' | 'District Hospital' | 'Home';
  actionableSteps: string[];
  teleconsultEligible: boolean;
  redFlagsIdentified: string[];
  clinicalRationale: string;
}

export class ClinicalTriageEngine {
  /**
   * Evaluates patient clinical inputs against national triage rules
   */
  static evaluateTriage(input: SymptomInput): TriageResult {
    const symptoms = input.symptoms.map((s) => s.toLowerCase());
    const complaint = (input.chiefComplaint || '').toLowerCase();
    const allText = [...symptoms, complaint].join(' ');
    const vitals = input.vitalSigns || {};
    const identifiedRedFlags: string[] = [];

    // -------------------------------------------------------------
    // 1. Maternal & Pregnancy Emergencies
    // -------------------------------------------------------------
    if (input.isPregnant || input.gestationalWeeks) {
      if (
        allText.includes('bleeding') ||
        allText.includes('convulsion') ||
        allText.includes('seizure') ||
        allText.includes('severe abdominal pain') ||
        allText.includes('water broken') ||
        allText.includes('blurred vision') ||
        (vitals.systolicBP && vitals.systolicBP >= 160) ||
        (vitals.diastolicBP && vitals.diastolicBP >= 110)
      ) {
        if (allText.includes('bleeding')) identifiedRedFlags.push('Antepartum/Postpartum Hemorrhage Risk');
        if (allText.includes('convulsion')) identifiedRedFlags.push('Eclampsia / Impending Convulsions');
        if (vitals.systolicBP && vitals.systolicBP >= 160) identifiedRedFlags.push('Severe Pre-eclampsia (BP >= 160/110)');

        return {
          urgency: 'EMERGENCY_108',
          confidenceScore: 0.98,
          protocolCategory: 'MATERNAL_ANC',
          primaryRecommendation: 'Immediate 108 Emergency Escalation to First Referral Unit (FRU) / District Hospital.',
          recommendedFacilityLevel: 'District Hospital',
          actionableSteps: [
            'Alert District Hospital Obstetrics Emergency Desk',
            'Dispatch 108 Emergency Ambulance with Life Support kit',
            'Keep patient left lateral tilted and keep airway clear',
            'Notify nearest ASHA worker for hospital escort accompaniment',
          ],
          teleconsultEligible: false,
          redFlagsIdentified: identifiedRedFlags,
          clinicalRationale: 'Maternal obstetric danger signs require immediate parenteral therapy and emergency facility readiness.',
        };
      }

      if (allText.includes('swelling') || allText.includes('headache') || (vitals.systolicBP && vitals.systolicBP >= 140)) {
        return {
          urgency: 'PHC_VISIT',
          confidenceScore: 0.92,
          protocolCategory: 'MATERNAL_ANC',
          primaryRecommendation: 'Urgent Same-Day Primary Health Centre (PHC) Medical Officer Review.',
          recommendedFacilityLevel: 'PHC',
          actionableSteps: [
            'Test urine for albumin / proteinuria',
            'Conduct detailed blood pressure series',
            'Evaluate fetal heart sounds via Doppler',
          ],
          teleconsultEligible: true,
          redFlagsIdentified: ['Gestational Hypertension alert'],
          clinicalRationale: 'Possible mild pre-eclampsia or gestational hypertension requiring clinical staging.',
        };
      }
    }

    // -------------------------------------------------------------
    // 2. Pediatric IMNCI Emergencies (Age < 5)
    // -------------------------------------------------------------
    if (input.age <= 5) {
      const imnciDangerSigns = ['unable to drink', 'vomiting everything', 'convulsion', 'lethargic', 'unconscious', 'stridor'];
      const hasDanger = imnciDangerSigns.some((sign) => allText.includes(sign));
      const hasSevereSpO2 = vitals.spO2 !== undefined && vitals.spO2 < 92;

      if (hasDanger || hasSevereSpO2) {
        if (hasDanger) identifiedRedFlags.push('IMNCI General Danger Sign Present');
        if (hasSevereSpO2) identifiedRedFlags.push(`Pediatric Hypoxia (SpO2: ${vitals.spO2}%)`);

        return {
          urgency: 'EMERGENCY_108',
          confidenceScore: 0.96,
          protocolCategory: 'IMNCI_PEDIATRIC',
          primaryRecommendation: 'Emergency Pediatric Transfer to CHC/District Hospital with Pediatric Care Unit.',
          recommendedFacilityLevel: 'District Hospital',
          actionableSteps: [
            'Administer first dose of urgent antibiotic per IMNCI protocol if delayed transit',
            'Provide oral rehydration in sips if conscious',
            'Initiate oxygen support at 1-2 L/min via nasal prongs',
            'Dispatch 108 transport with thermal wrap for hypothermia prevention',
          ],
          teleconsultEligible: false,
          redFlagsIdentified: identifiedRedFlags,
          clinicalRationale: 'Child exhibits WHO/IMNCI general danger signs with rapid risk of clinical deterioration.',
        };
      }

      if (allText.includes('fast breathing') || allText.includes('fever') || allText.includes('diarrhea')) {
        return {
          urgency: 'PHC_VISIT',
          confidenceScore: 0.88,
          protocolCategory: 'IMNCI_PEDIATRIC',
          primaryRecommendation: 'In-person evaluation at nearest Primary Health Centre or Ayushman Arogya Mandir.',
          recommendedFacilityLevel: 'PHC',
          actionableSteps: [
            'Check respiratory rate for 60 full seconds',
            'Inspect for chest indrawing and skin turgor pinch test',
            'Dispense ORS + Zinc packets immediately',
          ],
          teleconsultEligible: true,
          redFlagsIdentified: [],
          clinicalRationale: 'Suspected pediatric pneumonia or acute gastroenteritis requiring clinical assessment.',
        };
      }
    }

    // -------------------------------------------------------------
    // 3. Acute Adult Red Flags (Cardiovascular, Stroke, Sepsis)
    // -------------------------------------------------------------
    if (
      allText.includes('chest pain') ||
      allText.includes('heart attack') ||
      allText.includes('stroke') ||
      allText.includes('paralysis') ||
      allText.includes('difficulty breathing') ||
      allText.includes('unconscious') ||
      (vitals.spO2 !== undefined && vitals.spO2 < 90) ||
      (vitals.systolicBP !== undefined && vitals.systolicBP >= 190)
    ) {
      if (allText.includes('chest pain')) identifiedRedFlags.push('Acute Coronary Syndrome suspicion');
      if (allText.includes('stroke') || allText.includes('paralysis')) identifiedRedFlags.push('Acute Stroke Window');
      if (vitals.spO2 && vitals.spO2 < 90) identifiedRedFlags.push(`Critical Hypoxia (${vitals.spO2}%)`);

      return {
        urgency: 'EMERGENCY_108',
        confidenceScore: 0.99,
        protocolCategory: 'ACUTE_ADULT',
        primaryRecommendation: 'Immediate 108 Emergency Ambulance dispatch to District Hospital Emergency/ICU.',
        recommendedFacilityLevel: 'District Hospital',
        actionableSteps: [
          'Immediate 108 ambulance dispatch with GPS real-time tracking',
          'Administer Dispirin / ECG triage at nearest equipped health post',
          'Position patient in comfortable semi-fowler upright posture',
          'Keep emergency contact and Ayushman Bharat Card ready',
        ],
        teleconsultEligible: false,
        redFlagsIdentified: identifiedRedFlags,
        clinicalRationale: 'Critical acute cardiovascular, respiratory or neurological compromise requiring immediate resuscitation.',
      };
    }

    // -------------------------------------------------------------
    // 4. Chronic NCD & Non-Emergency Illness
    // -------------------------------------------------------------
    if (
      allText.includes('sugar') ||
      allText.includes('diabetes') ||
      allText.includes('blood pressure') ||
      allText.includes('hypertension') ||
      (vitals.bloodSugarMgDl !== undefined && vitals.bloodSugarMgDl > 250)
    ) {
      return {
        urgency: 'TELECONSULT',
        confidenceScore: 0.91,
        protocolCategory: 'CHRONIC_NCD',
        primaryRecommendation: 'e-Sanjeevani Teleconsultation with Medical Officer for prescription renewal and lifestyle review.',
        recommendedFacilityLevel: 'Sub-Centre',
        actionableSteps: [
          'Connect to e-Sanjeevani assisted teleconsultation slot at local Health Sub-Centre',
          'Record 3-day fasting and post-prandial capillary blood glucose',
          'Check local PHC drug dispensary stock for Metformin and Amlodipine',
        ],
        teleconsultEligible: true,
        redFlagsIdentified: vitals.bloodSugarMgDl && vitals.bloodSugarMgDl > 250 ? ['Hyperglycemia > 250 mg/dL'] : [],
        clinicalRationale: 'Stable chronic condition management well-suited for assisted remote teleconsultation without patient travel burden.',
      };
    }

    // -------------------------------------------------------------
    // 5. Mild / Self-Care Symptoms
    // -------------------------------------------------------------
    if ((input.durationDays || 1) <= 2 && (allText.includes('mild cold') || allText.includes('runny nose') || allText.includes('tiredness'))) {
      return {
        urgency: 'SELF_CARE',
        confidenceScore: 0.85,
        protocolCategory: 'GENERAL',
        primaryRecommendation: 'Home Care & Hydration with ASHA 48-Hour Remote Follow-Up.',
        recommendedFacilityLevel: 'Home',
        actionableSteps: [
          'Warm fluids, steam inhalation, and adequate hydration',
          'Monitor body temperature twice daily',
          'If symptoms persist beyond day 3 or fever exceeds 101°F, visit the nearest Sub-Centre',
        ],
        teleconsultEligible: true,
        redFlagsIdentified: [],
        clinicalRationale: 'Self-limiting viral prodrome with absence of red flags.',
      };
    }

    // Default: PHC in-person visit
    return {
      urgency: 'PHC_VISIT',
      confidenceScore: 0.82,
      protocolCategory: 'GENERAL',
      primaryRecommendation: 'Visit Nearest Primary Health Centre (PHC) for Routine Outpatient Consultation.',
      recommendedFacilityLevel: 'PHC',
      actionableSteps: [
        'Book digital OPD token to bypass physical queue',
        'Carry previous prescription slips and ABHA card',
        'Verify doctor OPD timings (usually 9:00 AM - 2:00 PM)',
      ],
      teleconsultEligible: true,
      redFlagsIdentified: [],
      clinicalRationale: 'General clinical complaint requiring physical auscultation or routine baseline diagnostic tests.',
    };
  }
}
