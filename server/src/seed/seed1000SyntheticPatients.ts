import { connectDB, closeDB } from '../config/database.js';
import { User } from '../models/User.js';
import { Patient } from '../models/Patient.js';
import { Appointment } from '../models/Appointment.js';
import { FrictionProfile } from '../models/FrictionProfile.js';
import { CareRisk } from '../models/CareRisk.js';
import { CareJourney } from '../models/CareJourney.js';
import { MedicalRecord } from '../models/MedicalRecord.js';
import { FrictionInteraction } from '../models/FrictionInteraction.js';
import { Hospital } from '../models/Hospital.js';
import { Doctor } from '../models/Doctor.js';
import { AshaWorker } from '../models/AshaWorker.js';
import { AuditLog } from '../models/AuditLog.js';
import { FrictionEngine } from '../intelligence/friction/frictionEngine.js';
import { RiskEngine } from '../intelligence/risk/riskEngine.js';

// Diverse Indian demographics
const FEMALE_FIRST_NAMES = [
  'Pooja', 'Sunita', 'Manpreet', 'Gurpreet', 'Simranjit', 'Jaswinder', 'Asha', 'Anita',
  'Rekha', 'Kavita', 'Suman', 'Geeta', 'Neelam', 'Harpreet', 'Rajwinder', 'Paramjit',
  'Kuldeep', 'Baljit', 'Shinder', 'Babita', 'Mamta', 'Chander', 'Rani', 'Sita', 'Sarabjit',
  'Lakshmi', 'Fatima', 'Meenakshi', 'Deepika', 'Anjali', 'Kalyani', 'Nandini', 'Priyanka'
];

const MALE_FIRST_NAMES = [
  'Balwinder', 'Gurdeep', 'Harbhajan', 'Kulwant', 'Sukhdev', 'Surinder', 'Joginder',
  'Rajinder', 'Daljit', 'Amarjit', 'Satnam', 'Jaswant', 'Mukesh', 'Ramesh', 'Suresh',
  'Dharminder', 'Jagdish', 'Prem', 'Mohinder', 'Kewal', 'Malkeet', 'Hardev', 'Charanjit',
  'Rakesh', 'Vijay', 'Ashok', 'Sanjay', 'Manoj', 'Mohammad', 'Gurpreet', 'Arjun', 'Vikram'
];

const LAST_NAMES = [
  'Kaur', 'Singh', 'Devi', 'Kumar', 'Sharma', 'Verma', 'Ram', 'Lal', 'Rani', 'Chand',
  'Bala', 'Bai', 'Das', 'Gill', 'Dhillon', 'Sandhu', 'Grewal', 'Sidhu', 'Cheema',
  'Khan', 'Patel', 'Yadav', 'Gupta', 'Ansari', 'Joshi', 'Chauhan'
];

const VILLAGES_AND_DISTRICTS = [
  { village: 'Khera Village', block: 'Phagwara Rural', district: 'Kapurthala', state: 'Punjab', distanceKm: 7.2, lat: 31.2580, lng: 75.6980, urbanRural: 'RURAL' },
  { village: 'Chaheru Rural', block: 'Chaheru Sector', district: 'Kapurthala', state: 'Punjab', distanceKm: 4.8, lat: 31.2490, lng: 75.7120, urbanRural: 'RURAL' },
  { village: 'Behram Basti', block: 'Banga Link', district: 'Shaheed Bhagat Singh Nagar', state: 'Punjab', distanceKm: 14.5, lat: 31.2010, lng: 75.8320, urbanRural: 'RURAL' },
  { village: 'Kotrani Settlement', block: 'Phagwara Rural', district: 'Kapurthala', state: 'Punjab', distanceKm: 8.9, lat: 31.2350, lng: 75.7420, urbanRural: 'SEMI_URBAN' },
  { village: 'Hadiabad Ward 4', block: 'Phagwara Urban', district: 'Kapurthala', state: 'Punjab', distanceKm: 3.2, lat: 31.2210, lng: 75.7600, urbanRural: 'URBAN' },
  { village: 'Sapror Farmland', block: 'Phagwara Rural', district: 'Kapurthala', state: 'Punjab', distanceKm: 11.4, lat: 31.2720, lng: 75.6810, urbanRural: 'RURAL' },
  { village: 'Sultanpur Lodhi Riverbank', block: 'Sultanpur Rural', district: 'Kapurthala', state: 'Punjab', distanceKm: 38.0, lat: 31.2185, lng: 75.1979, urbanRural: 'RURAL' },
  { village: 'Bholath Arid Settlement', block: 'Bholath Sector', district: 'Kapurthala', state: 'Punjab', distanceKm: 29.5, lat: 31.4520, lng: 75.5210, urbanRural: 'RURAL' },
  { village: 'Nadala Basti', block: 'Nadala Rural', district: 'Kapurthala', state: 'Punjab', distanceKm: 26.0, lat: 31.4910, lng: 75.4800, urbanRural: 'RURAL' },
  { village: 'Kapurthala Urban Sector', block: 'Kapurthala Central', district: 'Kapurthala', state: 'Punjab', distanceKm: 22.0, lat: 31.3750, lng: 75.4120, urbanRural: 'URBAN' },
  { village: 'Jalandhar Cantt Link', block: 'Jalandhar South', district: 'Jalandhar', state: 'Punjab', distanceKm: 18.2, lat: 31.2850, lng: 75.6120, urbanRural: 'SEMI_URBAN' },
  { village: 'Goraya Border Hamlet', block: 'Goraya', district: 'Jalandhar', state: 'Punjab', distanceKm: 16.5, lat: 31.1300, lng: 75.7700, urbanRural: 'RURAL' },
];

const LANGUAGES = ['Punjabi', 'Hindi', 'Bhojpuri', 'Odia', 'Bengali', 'Urdu', 'English'];
const TRANSPORT_LEVELS = ['none', 'low', 'moderate', 'high'];
const FINANCIAL_LEVELS = ['severely_constrained', 'bpl_ration_card', 'low_income', 'moderate_budget'];
const DOC_STATUSES = ['none', 'partial', 'complete'];
const DIGITAL_LEVELS = ['none', 'basic', 'moderate'];

const SYMPTOM_COHORTS = [
  {
    category: 'Maternal & Child Health',
    symptoms: ['Pregnancy 2nd Trimester ANC Check', 'Severe Anemia in Pregnancy', 'Morning Sickness & Swelling', 'Postpartum Follow-up'],
    department: 'Obstetrics & Gynecology',
    urgency: 'routine',
    chronicCondition: 'High Risk Pregnancy (ANC)',
  },
  {
    category: 'Cardiovascular & Metabolic',
    symptoms: ['Exertional Chest Heaviness', 'Uncontrolled Hypertension', 'High Fasting Blood Sugar', 'Dizziness and Palpitations'],
    department: 'General Medicine / Cardiology',
    urgency: 'priority',
    chronicCondition: 'Hypertension & Type 2 Diabetes',
  },
  {
    category: 'Respiratory & Environmental',
    symptoms: ['Chronic Productive Cough > 3 Weeks', 'Wheezing and Stridor', 'Breathlessness on Inhalation', 'Post-Harvest Smog Bronchitis'],
    department: 'Pulmonology / Chest Clinic',
    urgency: 'priority',
    chronicCondition: 'COPD / Suspected TB',
  },
  {
    category: 'Musculoskeletal & Occupational',
    symptoms: ['Severe Lumbar Disc Pain from Farming', 'Bilateral Knee Osteoarthritis', 'Shoulder Rotator Cuff Tear', 'Workplace Sprain'],
    department: 'Orthopedics',
    urgency: 'routine',
    chronicCondition: 'Degenerative Joint Disease',
  },
  {
    category: 'Gastrointestinal & Waterborne',
    symptoms: ['Acute Watery Diarrhea with Dehydration', 'Severe Epigastric Burning', 'Persistent Jaundice & Nausea', 'Abdominal Colic'],
    department: 'Gastroenterology / General Surgery',
    urgency: 'urgent',
    chronicCondition: 'Peptic Ulcer Disease / Cholelithiasis',
  },
  {
    category: 'Ophthalmic & Geriatric',
    symptoms: ['Gradual Bilateral Vision Loss', 'Cataract Blurring', 'Diabetic Retinopathy Screening', 'Foreign Body Sensation'],
    department: 'Ophthalmology',
    urgency: 'routine',
    chronicCondition: 'Senile Cataract / Refractive Error',
  },
];

const COMMUNICATION_BARRIERS = [
  'Illiterate - unable to read prescription or dosage instructions',
  'Speaks only Bhojpuri dialect; doctors communicate in Punjabi/English',
  'No smartphone access; misses automated SMS appointment alerts',
  'Relies on teenage grandchild to translate clinical consultation notes',
  'Fear of government hospital bureaucracy and medical terminology',
  'Cannot decipher lab token numbering or department signages',
  'None - proficient in regional vernacular and basic English',
];

const CARE_OUTCOMES = [
  'Completed - Full clinical resolution and prescription dispense',
  'In Care - Ongoing follow-up scheduled with ASHA monitoring',
  'Dropped Out - Failed to return after diagnostic testing due to travel cost',
  'Delayed - Appointment postponed 3 times due to agricultural harvesting shift',
  'Counter-Referred - Down-referred to local Sub-Centre for routine medication refills',
  'Emergency Stabilized - Transferred to tertiary care center',
];

export async function seed1000SyntheticPatients(): Promise<void> {
  console.log('================================================================');
  console.log('  PFIS 1,000 SYNTHETIC PATIENT HEALTHCARE COHORT SEED GENERATOR ');
  console.log('  Non-Clinical Friction, Journeys, Barriers, Delays & Outcomes ');
  console.log('================================================================\n');

  await connectDB();

  // Find reference hospitals, doctors, and ASHAs
  const hospitals = await Hospital.find({});
  const doctors = await Doctor.find({});
  const ashas = await AshaWorker.find({});

  console.log(`[Seed1000] Discovered Reference Entities:`);
  console.log(`  - Hospitals: ${hospitals.length}`);
  console.log(`  - Doctors: ${doctors.length}`);
  console.log(`  - ASHAs: ${ashas.length}\n`);

  const primaryHospital = hospitals[0] || null;
  const primaryDoctor = doctors[0] || null;
  const primaryAsha = ashas[0] || null;

  const BATCH_SIZE = 100;
  const TOTAL_PATIENTS = 1000;
  const START_INDEX = 2001; // Avoid colliding with existing PAT-1001 series

  console.log(`[Seed1000] Seeding ${TOTAL_PATIENTS} synthetic patient records in batches of ${BATCH_SIZE}...`);

  for (let b = 0; b < TOTAL_PATIENTS; b += BATCH_SIZE) {
    const patientsBatch: any[] = [];
    const frictionBatch: any[] = [];
    const riskBatch: any[] = [];
    const appointmentsBatch: any[] = [];
    const journeysBatch: any[] = [];
    const recordsBatch: any[] = [];
    const interactionsBatch: any[] = [];

    for (let i = 0; i < BATCH_SIZE; i++) {
      const idx = b + i;
      const patientSeq = START_INDEX + idx;
      const patientCode = `PAT-${patientSeq}`;

      const isFemale = idx % 2 === 0;
      const firstName = isFemale
        ? FEMALE_FIRST_NAMES[idx % FEMALE_FIRST_NAMES.length]
        : MALE_FIRST_NAMES[idx % MALE_FIRST_NAMES.length];
      const lastName = LAST_NAMES[idx % LAST_NAMES.length];
      const fullName = `${firstName} ${lastName}`;

      // Age distribution: 18 - 85
      const age = 18 + (idx * 7) % 68;
      const gender = isFemale ? 'female' : 'male';
      const loc = VILLAGES_AND_DISTRICTS[idx % VILLAGES_AND_DISTRICTS.length];
      const lang = LANGUAGES[idx % LANGUAGES.length];
      const cohort = SYMPTOM_COHORTS[idx % SYMPTOM_COHORTS.length];
      const commIssue = COMMUNICATION_BARRIERS[idx % COMMUNICATION_BARRIERS.length];
      const outcome = CARE_OUTCOMES[idx % CARE_OUTCOMES.length];

      const transport = TRANSPORT_LEVELS[idx % TRANSPORT_LEVELS.length];
      const financial = FINANCIAL_LEVELS[idx % FINANCIAL_LEVELS.length];
      const digital = DIGITAL_LEVELS[idx % DIGITAL_LEVELS.length];
      const docs = DOC_STATUSES[idx % DOC_STATUSES.length];

      // Realistic travel time and costs based on distance and financial bracket
      const travelTimeMinutes = Math.round(loc.distanceKm * 2.8 + (idx % 25));
      const oneWayTransitCostInr = Math.round(loc.distanceKm * 6.5 + (idx % 40));
      const estimatedLostDailyWageInr = financial === 'severely_constrained' ? 350 : financial === 'bpl_ration_card' ? 450 : 600;
      const totalOutofPocketCostInr = oneWayTransitCostInr * 2 + Math.round((idx % 50) * 15) + (financial === 'moderate_budget' ? 200 : 0);

      // Unique mock ABHA ID
      const abha = `91-${(1000 + (idx % 9000))}-${(2000 + (idx % 8000))}-${(3000 + (idx % 7000))}`;

      const patientData: any = {
        patientCode,
        name: fullName,
        age,
        gender,
        phone: `+91-98765${String(patientSeq).padStart(5, '0')}`,
        email: `synthetic_patient_${patientSeq}@test-pfis.org`,
        residenceType: loc.urbanRural,
        address: `${loc.village}, ${loc.block}`,
        city: loc.district,
        state: loc.state,
        pincode: '144411',
        latitude: loc.lat + (Math.sin(idx) * 0.01),
        longitude: loc.lng + (Math.cos(idx) * 0.01),
        distanceToFacilityKm: loc.distanceKm,
        preferredLanguage: lang,
        transportAvailability: transport,
        financialStatus: financial,
        documentationStatus: docs,
        digitalLiteracy: digital,
        chronicConditions: [cohort.chronicCondition],
        abhaId: abha,
        preferredHospitalId: primaryHospital ? (primaryHospital.id || primaryHospital._id) : undefined,
        assignedAshaWorkerId: primaryAsha ? (primaryAsha.id || primaryAsha._id) : undefined,
        // Synthetic labeling flags
        isSyntheticTestData: true,
        dataSource: 'SYNTHETIC_SIMULATION_COHORT_2026',
        createdAt: new Date(Date.now() - (idx * 3600000)).toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Calculate friction scores using FrictionEngine
      const frictionResult = FrictionEngine.calculate(patientData, primaryHospital, loc.distanceKm);
      const careRiskResult = RiskEngine.evaluate(frictionResult);

      patientsBatch.push(patientData);

      // Pre-compute IDs for internal consistency
      const mockPatientId = `syn-pat-${patientSeq}`;
      patientData.id = mockPatientId;
      patientData._id = mockPatientId;

      frictionBatch.push({
        patientId: mockPatientId,
        overallFrictionScore: frictionResult.overallFrictionScore,
        overallAccessibilityScore: frictionResult.overallAccessibilityScore,
        frictionLevel: frictionResult.frictionLevel,
        travelFriction: frictionResult.travel?.score || 40,
        financialFriction: frictionResult.cost?.score || 35,
        languageFriction: frictionResult.language?.score || 20,
        digitalFriction: frictionResult.digitalAccess?.score || 30,
        processFriction: frictionResult.documentation?.score || 25,
        topBarrier: frictionResult.topBarrier || 'Transport Availability',
        keyBarriers: [frictionResult.topBarrier, frictionResult.secondaryBarrier].filter(Boolean),
        mitigationRecommendations: ['Assisted ASHA Teleconsultation', 'Transit Allowance Voucher'],
        isSyntheticTestData: true,
      });

      riskBatch.push({
        patientId: mockPatientId,
        overallRiskScore: careRiskResult.accessibilityRiskPercentage,
        riskCategory: careRiskResult.riskCategory,
        careCompletionProbability: careRiskResult.careCompletionProbability,
        dropoutRisk: careRiskResult.accessibilityRiskPercentage,
        recommendedInterventions: careRiskResult.mitigationPathways || ['ASHA home visit', 'Transit allowance'],
        isSyntheticTestData: true,
      });

      // Synthetic appointment for this patient
      const aptDate = new Date(Date.now() + ((idx % 30) - 15) * 86400000);
      const aptStatus = aptDate < new Date() ? (idx % 5 === 0 ? 'cancelled' : 'completed') : 'scheduled';
      appointmentsBatch.push({
        appointmentCode: `SYN-APT-${patientSeq}`,
        patientId: mockPatientId,
        doctorId: primaryDoctor ? (primaryDoctor.id || primaryDoctor._id) : null,
        hospitalId: primaryHospital ? (primaryHospital.id || primaryHospital._id) : null,
        departmentName: cohort.department,
        appointmentDate: aptDate.toISOString(),
        timeSlot: `${9 + (idx % 5)}:00 AM - ${9 + (idx % 5)}:30 AM`,
        queueNumber: (idx % 40) + 1,
        type: idx % 6 === 0 ? 'Teleconsult' : idx % 12 === 0 ? 'Emergency' : 'OPD',
        status: aptStatus,
        reasonForVisit: cohort.symptoms[idx % cohort.symptoms.length],
        symptoms: cohort.symptoms,
        urgencyLevel: cohort.urgency,
        isSyntheticTestData: true,
      });

      // Synthetic Longitudinal Healthcare Journey
      journeysBatch.push({
        patientId: mockPatientId,
        stage: aptStatus === 'completed' ? 'Treatment / Medication Dispense' : 'Community Screening / ASHA Referral',
        status: outcome.includes('Completed') ? 'Completed' : outcome.includes('Dropped') ? 'Dropped Out' : 'Active',
        notes: `Healthcare Journey: ${cohort.category}. Chief barrier: ${commIssue}. Outcome: ${outcome}. Out-of-pocket cost: ₹${totalOutofPocketCostInr}. Daily wage loss: ₹${estimatedLostDailyWageInr}. Transit delay: ${travelTimeMinutes} mins.`,
        facilityName: primaryHospital?.name || 'Civil Hospital Phagwara',
        isSyntheticTestData: true,
      });

      // Synthetic Medical Record
      recordsBatch.push({
        recordCode: `SYN-REC-${patientSeq}`,
        patientId: mockPatientId,
        doctorId: primaryDoctor ? (primaryDoctor.id || primaryDoctor._id) : null,
        doctorName: primaryDoctor?.name || 'Dr. Harpreet Singh',
        facilityName: primaryHospital?.name || 'Civil Hospital Phagwara',
        visitDate: aptDate.toISOString(),
        visitType: 'OPD',
        chiefComplaint: cohort.symptoms[idx % cohort.symptoms.length],
        clinicalFindings: `Observed vitals: Blood Pressure ${118 + (idx % 26)}/${76 + (idx % 18)} mmHg. Diagnostic indicator: ${cohort.chronicCondition}. Communication notes: ${commIssue}.`,
        diagnoses: [cohort.chronicCondition],
        prescriptions: [
          { medicineName: 'Essential Therapy Compound', dosage: '1 tablet twice daily', duration: '14 days' },
          { medicineName: 'Paracetamol 500mg', dosage: 'As needed for discomfort', duration: '5 days' }
        ],
        isSyntheticTestData: true,
      });

      // Synthetic Friction Interaction Log
      interactionsBatch.push({
        patientId: mockPatientId,
        touchpoint: idx % 3 === 0 ? 'PHC Reception' : idx % 3 === 1 ? 'Pharmacy Counter' : 'ASHA Home Survey',
        barrierEncountered: frictionResult.topBarrier,
        delayMinutes: travelTimeMinutes,
        financialLossInr: totalOutofPocketCostInr,
        patientFeedback: `Patient recorded barrier: "${commIssue}". Estimated daily wage sacrifice: ₹${estimatedLostDailyWageInr}.`,
        isSyntheticTestData: true,
      });
    }

    // Insert batches into MongoDB models
    await Promise.all([
      Patient.insertMany(patientsBatch),
      FrictionProfile.insertMany(frictionBatch),
      CareRisk.insertMany(riskBatch),
      Appointment.insertMany(appointmentsBatch),
      CareJourney.insertMany(journeysBatch),
      MedicalRecord.insertMany(recordsBatch),
      FrictionInteraction.insertMany(interactionsBatch),
    ]);

    console.log(`[Seed1000] Processed batch ${(b / BATCH_SIZE) + 1}/${TOTAL_PATIENTS / BATCH_SIZE} (${b + BATCH_SIZE} patients seeded)...`);
  }

  // Record Audit Trail
  await AuditLog.create({
    actorRole: 'system',
    action: 'SYNTHETIC_PATIENT_COHORT_1000_SEEDED',
    resource: 'PatientCohort',
    details: {
      totalPatientsSeeded: TOTAL_PATIENTS,
      demographicDiversity: 'Multi-lingual, Rural/Urban, Gender Balanced (50/50)',
      dataTypesIncluded: ['Demographics', 'Appointments', 'Symptoms', 'Care Journeys', 'Delays', 'Costs', 'Friction Profiles', 'Risk Assessments', 'Medical Records'],
      label: 'SYNTHETIC_SIMULATION_COHORT_2026',
      timestamp: new Date().toISOString(),
    },
    timestamp: new Date(),
  });

  console.log('\n================================================================');
  console.log('  SUCCESS: 1,000 REALISTIC SYNTHETIC PATIENTS SEEDED IN MONGODB ');
  console.log('  All records tagged with isSyntheticTestData: true              ');
  console.log('  Fully connected with Appointments, Records, Journeys & Risks  ');
  console.log('================================================================\n');
}

if (process.argv[1]?.includes('seed1000SyntheticPatients.ts') || process.argv[1]?.includes('seed1000SyntheticPatients.js')) {
  seed1000SyntheticPatients()
    .then(async () => {
      await closeDB();
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Seed1000 Error]', err);
      process.exit(1);
    });
}
