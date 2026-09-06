import { connectDB, closeDB, getDB } from '../config/database.js';
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

// ============================================================================
// DIVERSE REALISTIC DATA DICTIONARIES (PUNJAB / NORTH INDIA / MIGRANT WORKFORCE)
// ============================================================================

const FEMALE_FIRST_NAMES = [
  'Pooja', 'Sunita', 'Manpreet', 'Gurpreet', 'Simranjit', 'Jaswinder', 'Asha', 'Anita',
  'Rekha', 'Kavita', 'Suman', 'Geeta', 'Neelam', 'Harpreet', 'Rajwinder', 'Paramjit',
  'Kuldeep', 'Baljit', 'Shinder', 'Babita', 'Mamta', 'Chander', 'Rani', 'Sita', 'Sarabjit',
  'Lakshmi', 'Fatima', 'Meenakshi', 'Deepika', 'Anjali', 'Kalyani', 'Nandini', 'Priyanka',
  'Urmila', 'Shanti', 'Kamlesh', 'Vidya', 'Saroj', 'Parveen', 'Nasreen', 'Tara', 'Rupinder'
];

const MALE_FIRST_NAMES = [
  'Balwinder', 'Gurdeep', 'Harbhajan', 'Kulwant', 'Sukhdev', 'Surinder', 'Joginder',
  'Rajinder', 'Daljit', 'Amarjit', 'Satnam', 'Jaswant', 'Mukesh', 'Ramesh', 'Suresh',
  'Dharminder', 'Jagdish', 'Prem', 'Mohinder', 'Kewal', 'Malkeet', 'Hardev', 'Charanjit',
  'Rakesh', 'Vijay', 'Ashok', 'Sanjay', 'Manoj', 'Mohammad', 'Gurpreet', 'Arjun', 'Vikram',
  'Iqbal', 'Sohail', 'Tarlochan', 'Bikramjit', 'Avtar', 'Gurnam', 'Devinder', 'Navjot'
];

const OTHER_FIRST_NAMES = [
  'Kiran', 'Noor', 'Bobby', 'Rinku', 'Simar', 'Gurvinder', 'Kamal', 'Sonu'
];

const LAST_NAMES = [
  'Kaur', 'Singh', 'Devi', 'Kumar', 'Sharma', 'Verma', 'Ram', 'Lal', 'Rani', 'Chand',
  'Bala', 'Bai', 'Das', 'Gill', 'Dhillon', 'Sandhu', 'Grewal', 'Sidhu', 'Cheema',
  'Khan', 'Patel', 'Yadav', 'Gupta', 'Ansari', 'Joshi', 'Chauhan', 'Mandal', 'Paswan',
  'Majhi', 'Oraon', 'Murmu', 'Mahato', 'Bauri', 'Tiwari', 'Pandey', 'Mishra'
];

const DISTRICTS_AND_LOCALITIES = [
  { locality: 'Khera Village', block: 'Phagwara Rural', district: 'Kapurthala', state: 'Punjab', distanceKm: 7.2, lat: 31.2580, lng: 75.6980, residenceType: 'rural_remote', roadQuality: 'unpaved_dirt' },
  { locality: 'Chaheru Rural', block: 'Chaheru Sector', district: 'Kapurthala', state: 'Punjab', distanceKm: 4.8, lat: 31.2490, lng: 75.7120, residenceType: 'rural_remote', roadQuality: 'semi_paved' },
  { locality: 'Behram Basti', block: 'Banga Link', district: 'Shaheed Bhagat Singh Nagar', state: 'Punjab', distanceKm: 14.5, lat: 31.2010, lng: 75.8320, residenceType: 'rural_remote', roadQuality: 'single_lane_pot_holes' },
  { locality: 'Kotrani Settlement', block: 'Phagwara Rural', district: 'Kapurthala', state: 'Punjab', distanceKm: 8.9, lat: 31.2350, lng: 75.7420, residenceType: 'semi_urban', roadQuality: 'paved' },
  { locality: 'Hadiabad Ward 4', block: 'Phagwara Urban', district: 'Kapurthala', state: 'Punjab', distanceKm: 3.2, lat: 31.2210, lng: 75.7600, residenceType: 'urban_metro', roadQuality: 'city_tarmac' },
  { locality: 'Sapror Farmland', block: 'Phagwara Rural', district: 'Kapurthala', state: 'Punjab', distanceKm: 11.4, lat: 31.2720, lng: 75.6810, residenceType: 'rural_remote', roadQuality: 'unpaved_canal_bank' },
  { locality: 'Sultanpur Lodhi Riverbank', block: 'Sultanpur Rural', district: 'Kapurthala', state: 'Punjab', distanceKm: 38.0, lat: 31.2185, lng: 75.1979, residenceType: 'rural_remote', roadQuality: 'flood_prone_causeway' },
  { locality: 'Bholath Arid Settlement', block: 'Bholath Sector', district: 'Kapurthala', state: 'Punjab', distanceKm: 29.5, lat: 31.4520, lng: 75.5210, residenceType: 'rural_remote', roadQuality: 'gravel_track' },
  { locality: 'Nadala Basti', block: 'Nadala Rural', district: 'Kapurthala', state: 'Punjab', distanceKm: 26.0, lat: 31.4910, lng: 75.4800, residenceType: 'rural_remote', roadQuality: 'semi_paved' },
  { locality: 'Kapurthala Urban Sector', block: 'Kapurthala Central', district: 'Kapurthala', state: 'Punjab', distanceKm: 22.0, lat: 31.3750, lng: 75.4120, residenceType: 'urban_metro', roadQuality: 'city_tarmac' },
  { locality: 'Jalandhar Cantt Link', block: 'Jalandhar South', district: 'Jalandhar', state: 'Punjab', distanceKm: 18.2, lat: 31.2850, lng: 75.6120, residenceType: 'semi_urban', roadQuality: 'highway_link' },
  { locality: 'Goraya Border Hamlet', block: 'Goraya', district: 'Jalandhar', state: 'Punjab', distanceKm: 16.5, lat: 31.1300, lng: 75.7700, residenceType: 'rural_remote', roadQuality: 'narrow_village_lane' },
  { locality: 'Industrial Focal Point Slum', block: 'Phagwara East', district: 'Kapurthala', state: 'Punjab', distanceKm: 5.5, lat: 31.2150, lng: 75.7890, residenceType: 'urban_slum', roadQuality: 'congested_alleyways' },
  { locality: 'Sugar Mill Labor Colony', block: 'Phagwara Central', district: 'Kapurthala', state: 'Punjab', distanceKm: 2.1, lat: 31.2280, lng: 75.7720, residenceType: 'urban_slum', roadQuality: 'semi_paved' },
  { locality: 'Dhilwan Wetland Border', block: 'Dhilwan', district: 'Kapurthala', state: 'Punjab', distanceKm: 34.0, lat: 31.5200, lng: 75.3500, residenceType: 'rural_remote', roadQuality: 'mud_track' },
];

const LANGUAGES = [
  { lang: 'Punjabi', dialect: 'Doabi', literacyLevel: 'moderate' },
  { lang: 'Punjabi', dialect: 'Malwai', literacyLevel: 'moderate' },
  { lang: 'Hindi', dialect: 'Standard', literacyLevel: 'basic' },
  { lang: 'Bhojpuri', dialect: 'Bhojpur Migrant', literacyLevel: 'low' },
  { lang: 'Odia', dialect: 'Western Odia', literacyLevel: 'low' },
  { lang: 'Bengali', dialect: 'Rural Murshidabad', literacyLevel: 'low' },
  { lang: 'Urdu', dialect: 'North Indian', literacyLevel: 'moderate' },
  { lang: 'English', dialect: 'Indian English', literacyLevel: 'high' }
];

const OCCUPATIONS = [
  { title: 'Agricultural Field Laborer (Daily Wage)', dailyWageInr: 350, wageLossSensitivity: 'CRITICAL', flexibility: 'inflexible_daily_wage' },
  { title: 'Brick Kiln Worker (Bhatta)', dailyWageInr: 400, wageLossSensitivity: 'CRITICAL', flexibility: 'inflexible_daily_wage' },
  { title: 'Construction Coolie / Helper', dailyWageInr: 450, wageLossSensitivity: 'HIGH', flexibility: 'inflexible_daily_wage' },
  { title: 'Smallholder Wheat & Mustard Farmer', dailyWageInr: 500, wageLossSensitivity: 'MODERATE', flexibility: 'rigid_hours' },
  { title: 'Textile Machine Operator', dailyWageInr: 550, wageLossSensitivity: 'HIGH', flexibility: 'rigid_hours' },
  { title: 'Vegetable Cart Vendor (Rehri-Patri)', dailyWageInr: 400, wageLossSensitivity: 'HIGH', flexibility: 'inflexible_daily_wage' },
  { title: 'Domestic Housekeeper / Cook', dailyWageInr: 300, wageLossSensitivity: 'HIGH', flexibility: 'rigid_hours' },
  { title: 'Auto-Rickshaw Driver', dailyWageInr: 600, wageLossSensitivity: 'MODERATE', flexibility: 'moderate' },
  { title: 'Retired Pensioner / Dependent Elder', dailyWageInr: 0, wageLossSensitivity: 'LOW', flexibility: 'flexible' },
  { title: 'Homemaker / Caregiver Mother', dailyWageInr: 0, wageLossSensitivity: 'MODERATE', flexibility: 'rigid_hours' },
];

const SCHEME_COVERAGES = [
  { scheme: 'Ayushman Bharat PM-JAY / Mukh Mantri Sehat Bima', coveragePercent: 85, financialStatus: 'bpl_ration_card' },
  { scheme: 'Janani Suraksha Yojana (JSY) Maternal Benefit', coveragePercent: 90, financialStatus: 'bpl_ration_card' },
  { scheme: 'Employees State Insurance (ESIC)', coveragePercent: 80, financialStatus: 'moderate_budget' },
  { scheme: 'Uninsured (100% Out-of-Pocket Expenditure)', coveragePercent: 0, financialStatus: 'severely_constrained' },
  { scheme: 'Uninsured Low Income', coveragePercent: 0, financialStatus: 'severely_constrained' },
];

const SYMPTOM_AND_DISEASE_PROFILES = [
  {
    category: 'Maternal & High-Risk Pregnancy',
    symptoms: ['Pregnancy 2nd Trimester Severe Pallor & Edema', 'Severe Morning Sickness & Inability to Retain Food', 'Postpartum Sepsis & High Fever', 'Gestational Hypertension & Proteinuria'],
    department: 'Obstetrics & Gynecology',
    urgencyLevel: 'priority',
    chronicCondition: 'High-Risk Pregnancy (Severe Anemia Hb < 7g/dL)',
    vitals: { bloodPressure: '142/92', pulseRate: 88, spo2: 97, temperatureF: 98.6, bloodGlucoseMgDl: 105, hemoglobinGdl: 6.8 },
    diagnosticTest: 'Complete Blood Count (CBC) & Obstetric Ultrasound (USG)',
    testCostInr: 750,
    pharmacyMedication: 'Parenteral Iron Sucrose Infusion + Folic Acid Tablets',
    pharmacyCostInr: 450,
  },
  {
    category: 'Cardiovascular & Metabolic Emergency',
    symptoms: ['Exertional Chest Retrosternal Pain & Cold Sweats', 'Persistent Uncontrolled Morning Hypertension 170/105', 'High Fasting Sugar with Polyuria and Diabetic Foot Ulcer', 'Severe Palpitations & Bilateral Pedal Edema'],
    department: 'General Medicine / Cardiology',
    urgencyLevel: 'urgent',
    chronicCondition: 'Hypertensive Heart Disease & Type-2 Diabetes Mellitus',
    vitals: { bloodPressure: '168/104', pulseRate: 96, spo2: 95, temperatureF: 98.4, bloodGlucoseMgDl: 285, hemoglobinGdl: 12.4 },
    diagnosticTest: '12-Lead Electrocardiogram (ECG) & Fasting HbA1c / Lipid Profile',
    testCostInr: 950,
    pharmacyMedication: 'Amlodipine 5mg + Metformin 1000mg + Atorvastatin 20mg',
    pharmacyCostInr: 680,
  },
  {
    category: 'Respiratory & Smog Environmental',
    symptoms: ['Productive Cough with Hemoptysis > 3 Weeks', 'Acute Asthma Exacerbation with Wheezing & Intercostal Retraction', 'Post-Harvest Smog Severe Dyspnea', 'Chronic Bronchitis with Night Sweats & Significant Weight Loss'],
    department: 'Pulmonology / Chest Clinic',
    urgencyLevel: 'urgent',
    chronicCondition: 'Chronic Obstructive Pulmonary Disease (COPD) / Suspected Sputum+ TB',
    vitals: { bloodPressure: '128/82', pulseRate: 102, spo2: 89, temperatureF: 100.4, bloodGlucoseMgDl: 110, hemoglobinGdl: 10.2 },
    diagnosticTest: 'Digital Chest X-Ray (PA View) & GeneXpert MTB Sputum Assay',
    testCostInr: 600,
    pharmacyMedication: 'Levosalbutamol + Ipratropium Inhaler Rotacaps + 4-Drug ATT Regimen',
    pharmacyCostInr: 520,
  },
  {
    category: 'Orthopedic & Occupational Degenerative',
    symptoms: ['Inability to Stand from Squatting due to Knee Osteoarthritis', 'Acute Lumbar Radiculopathy from Heavy Lifting', 'Persistent Shoulder Impingement & Night Pain', 'Cervical Spondylosis with Arm Numbness'],
    department: 'Orthopedics',
    urgencyLevel: 'routine',
    chronicCondition: 'Grade-III Bilateral Knee Osteoarthritis & L4-L5 Disc Herniation',
    vitals: { bloodPressure: '136/86', pulseRate: 76, spo2: 98, temperatureF: 98.4, bloodGlucoseMgDl: 135, hemoglobinGdl: 11.5 },
    diagnosticTest: 'Weight-Bearing Knee X-Rays & Lumbo-Sacral Spine Series',
    testCostInr: 800,
    pharmacyMedication: 'Aceclofenac + Paracetamol + Pregabalin 75mg + Calcium Vit-D3',
    pharmacyCostInr: 620,
  },
  {
    category: 'Gastrointestinal & Waterborne Infection',
    symptoms: ['Acute Watery Diarrheal Dehydration with Muscle Cramps', 'Severe Epigastric Burning with Hematemesis (Coffee Ground)', 'Deep Jaundice with Clay-Colored Stools & High Bilirubin', 'Right Iliac Fossa Severe Rebound Tenderness'],
    department: 'Gastroenterology / General Surgery',
    urgencyLevel: 'urgent',
    chronicCondition: 'Peptic Ulcer Perforation Risk / Acute Infective Hepatitis',
    vitals: { bloodPressure: '102/68', pulseRate: 112, spo2: 96, temperatureF: 101.8, bloodGlucoseMgDl: 98, hemoglobinGdl: 9.8 },
    diagnosticTest: 'Liver Function Test (LFT) + Serum Amylase + Abdominal Ultrasound',
    testCostInr: 1100,
    pharmacyMedication: 'Oral Rehydration Salts (ORS) + IV Pantoprazole + Rifaximin 400mg',
    pharmacyCostInr: 740,
  },
  {
    category: 'Ophthalmic & Geriatric Sensory',
    symptoms: ['Mature Senile Cataract with Complete Light Perception Loss', 'Glaucoma with High Intraocular Pressure & Halo Rings', 'Diabetic Retinal Hemorrhage with Floaters', 'Corneal Abrasion from Agricultural Husk Trapping'],
    department: 'Ophthalmology',
    urgencyLevel: 'routine',
    chronicCondition: 'Bilateral Hypermature Senile Cataract',
    vitals: { bloodPressure: '134/84', pulseRate: 72, spo2: 98, temperatureF: 98.2, bloodGlucoseMgDl: 160, hemoglobinGdl: 12.0 },
    diagnosticTest: 'Slit Lamp Bio-Microscopy + Non-Contact Tonometry + A-Scan Biometry',
    testCostInr: 450,
    pharmacyMedication: 'Moxifloxacin Eye Drops + Carboxymethylcellulose Tear Substitute',
    pharmacyCostInr: 280,
  },
  {
    category: 'Pediatric Acute Infectious',
    symptoms: ['High-Grade Spike Fever 103°F with Febrile Convulsions', 'Severe Acute Malnutrition (SAM) with Pedal Edema', 'Bronchiolitis with Subcostal Chest Indrawing in 11-Month Old', 'Acute Stool with Blood and Mucus (Bacillary Dysentery)'],
    department: 'Pediatrics',
    urgencyLevel: 'urgent',
    chronicCondition: 'Severe Acute Malnutrition with Secondary Pneumonia',
    vitals: { bloodPressure: '88/54', pulseRate: 140, spo2: 91, temperatureF: 103.2, bloodGlucoseMgDl: 75, hemoglobinGdl: 7.4 },
    diagnosticTest: 'Pediatric Blood Culture + CRP + Chest Radiograph',
    testCostInr: 850,
    pharmacyMedication: 'Amoxicillin-Clavulanate Suspension + Paracetamol Syrup + Zinc Dispersible',
    pharmacyCostInr: 340,
  },
];

const COMMUNICATION_BARRIER_STORIES = [
  {
    type: 'Linguistic Discordance',
    description: 'Bhojpuri dialect native with zero Punjabi fluency. Doctor gave verbal instructions in Punjabi, causing patient to skip evening medication.',
    quote: '"Doctor sahab tezi se bol gaye Punjabi mein, hume adha baat samajh nahi aaya aur goli chhoot gayi."',
  },
  {
    type: 'Prescription Illiteracy',
    description: 'Unable to read written Hindi/English characters. Cannot differentiate between morning and bedtime tablet strips.',
    quote: '"Hum anpadh hain ji, sab dawa ek jaisi lagti hai. Jab tak padosi na bataye, lene se dar lagta hai."',
  },
  {
    type: 'Digital & SMS Exclusion',
    description: 'Does not own a smartphone. Has a basic keypad phone shared with brother. Never received automated SMS token alert.',
    quote: '"Phone hamare paas nahi rehta, chhota bhai kaam pe le jata hai. Hospital ka koi message hum tak nahi pahuncha."',
  },
  {
    type: 'Complex Facility Signage Anxiety',
    description: 'Intimidated by multi-story civil hospital building. Wandered between Room 14 and Room 38 for 90 minutes before missing appointment window.',
    quote: '"Bada aspatal dekh ke ghabrahat hoti hai ji. Har kamre par Angrezi mein likha tha, kisi ne rasta nahi bataya."',
  },
  {
    type: 'Hearing / Sensory Gap',
    description: 'Elderly patient with bilateral presbycusis. Could not hear token number being called over distorted OPD loudspeaker.',
    quote: '"Kaan se theek sunai nahi deta babu. Token number kab nikla hume pata hi nahi chala."',
  },
  {
    type: 'None - Good Vernacular Match',
    description: 'Proficient in local Doabi Punjabi and conversational Hindi. Able to comprehend prescription instructions clearly.',
    quote: '"Doctor saab ne Punjabi ch changi tarah samjha ditta, koi dikkat nahi aayi."',
  },
];

const CARE_OUTCOME_ARCHETYPES = [
  {
    status: 'Completed & Recovered',
    narrative: 'Patient successfully navigated barriers with ASHA support, completed diagnostic testing, received subsidized medications, and recovered.',
    isSuccess: true,
    careCompletionProbability: 88,
    dropoutRisk: 12,
  },
  {
    status: 'Active - Stabilized on Chronic Care Regimen',
    narrative: 'Patient enrolled in monthly OPD dispensing program with regular blood pressure and glycemic checks monitored by community ASHA worker.',
    isSuccess: true,
    careCompletionProbability: 79,
    dropoutRisk: 21,
  },
  {
    status: 'Dropped Out - Lab Cost & Daily Wage Sacrifice',
    narrative: 'After initial consultation, patient learned private scan cost ₹1,200 plus 1 full day of agricultural wages. Abandoned care journey and returned to village.',
    isSuccess: false,
    careCompletionProbability: 28,
    dropoutRisk: 72,
  },
  {
    status: 'Delayed - Delayed by Agricultural Harvest Migration',
    narrative: 'Care delayed by 4 weeks due to seasonal paddy harvesting shift where missing a day meant losing the entire contractor seasonal bonus.',
    isSuccess: false,
    careCompletionProbability: 46,
    dropoutRisk: 54,
  },
  {
    status: 'Counter-Referred - Down-Referred to Sub-Centre',
    narrative: 'Secondary hospital verified patient is stabilized and counter-referred care to nearby Ayushman Bharat Health & Wellness Centre (HWC) for maintenance.',
    isSuccess: true,
    careCompletionProbability: 82,
    dropoutRisk: 18,
  },
  {
    status: 'Emergency Escalated - Transferred to Tertiary Facility',
    narrative: 'Severe clinical decompensation detected during OPD triage. Emergency 108 ambulance called and transferred to Medical College Jalandhar.',
    isSuccess: false,
    careCompletionProbability: 38,
    dropoutRisk: 62,
  },
];

// ============================================================================
// MAIN GENERATOR FUNCTION
// ============================================================================

export async function create1000SyntheticCohort(): Promise<void> {
  console.log('================================================================');
  console.log('  PFIS 1,000 REALISTIC SYNTHETIC PATIENT GENERATOR STARTING     ');
  console.log('  Full 10-Dimensional Healthcare Journey & Friction Profile     ');
  console.log('================================================================\n');

  await connectDB();

  // Reference facilities & professionals
  const hospitals = await Hospital.find({});
  const doctors = await Doctor.find({});
  const ashas = await AshaWorker.find({});

  const primaryHospital = hospitals[0] || null;
  const primaryDoctor = doctors[0] || null;
  const primaryAsha = ashas[0] || null;

  console.log(`[PFIS 1000 Seed] Connected Reference Entities:`);
  console.log(`  - Target Facility: ${primaryHospital ? primaryHospital.name : 'Civil Hospital Phagwara'}`);
  console.log(`  - Attending Physician: ${primaryDoctor ? primaryDoctor.name : 'Dr. Harpreet Singh'}`);
  console.log(`  - Primary ASHA Supervisor: ${primaryAsha ? primaryAsha.name : 'Baljit Kaur'}\n`);

  const BATCH_SIZE = 100;
  const TOTAL_PATIENTS = 1000;
  const BASE_ID_OFFSET = 3001; // Clean range: PAT-3001 to PAT-4000

  console.log('[Clean-up] Purging all previous synthetic simulation records from MongoDB Atlas...');
  const db = (getDB() as any).db;
  if (db) {
    await Promise.all([
      db.collection('patient_profiles').deleteMany({ $or: [{ isSyntheticTestData: true }, { id: { $regex: '^syn-' } }, { _id: { $regex: '^syn-' } }] }),
      db.collection('friction_profiles').deleteMany({ $or: [{ isSyntheticTestData: true }, { id: { $regex: '^syn-' } }, { _id: { $regex: '^syn-' } }] }),
      db.collection('accessibility_risks').deleteMany({ $or: [{ isSyntheticTestData: true }, { id: { $regex: '^syn-' } }, { _id: { $regex: '^syn-' } }] }),
      db.collection('appointments').deleteMany({ $or: [{ isSyntheticTestData: true }, { id: { $regex: '^syn-' } }, { _id: { $regex: '^syn-' } }, { appointmentCode: { $regex: '^APT-SYN-' } }] }),
      db.collection('care_journeys').deleteMany({ $or: [{ isSyntheticTestData: true }, { id: { $regex: '^syn-' } }, { _id: { $regex: '^syn-' } }] }),
      db.collection('medical_records').deleteMany({ $or: [{ isSyntheticTestData: true }, { id: { $regex: '^syn-' } }, { _id: { $regex: '^syn-' } }, { recordCode: { $regex: '^REC-SYN-' } }] }),
      db.collection('friction_factors').deleteMany({ $or: [{ isSyntheticTestData: true }, { id: { $regex: '^syn-' } }, { _id: { $regex: '^syn-' } }] }),
      db.collection('friction_interactions').deleteMany({ $or: [{ isSyntheticTestData: true }, { id: { $regex: '^syn-' } }, { _id: { $regex: '^syn-' } }] }),
    ]);
  }
  console.log('[Clean-up] All prior synthetic records successfully purged.\n');

  const nowMs = Date.now();

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
      const seq = BASE_ID_OFFSET + idx;
      const patientCode = `PAT-${seq}`;

      // Gender distribution: 50% Female, 48% Male, 2% Other
      let gender: 'female' | 'male' | 'other' = 'female';
      if (idx % 50 === 49) {
        gender = 'other';
      } else if (idx % 2 === 1) {
        gender = 'male';
      }

      // First and last name selection
      let firstName = '';
      if (gender === 'female') {
        firstName = FEMALE_FIRST_NAMES[idx % FEMALE_FIRST_NAMES.length];
      } else if (gender === 'male') {
        firstName = MALE_FIRST_NAMES[idx % MALE_FIRST_NAMES.length];
      } else {
        firstName = OTHER_FIRST_NAMES[idx % OTHER_FIRST_NAMES.length];
      }
      const lastName = LAST_NAMES[idx % LAST_NAMES.length];
      const fullName = `${firstName} ${lastName}`;

      // Age distribution: pediatric to geriatric
      let age = 35;
      if (idx % 10 === 0) {
        age = 1 + (idx % 11); // Pediatric 1-11
      } else if (idx % 10 === 1) {
        age = 12 + (idx % 7); // Adolescent 12-18
      } else if (gender === 'female' && idx % 3 === 0) {
        age = 20 + (idx % 18); // Reproductive age 20-37
      } else if (idx % 4 === 0) {
        age = 62 + (idx % 25); // Elderly 62-86
      } else {
        age = 28 + (idx % 33); // Adult 28-60
      }

      const loc = DISTRICTS_AND_LOCALITIES[idx % DISTRICTS_AND_LOCALITIES.length];
      const langObj = LANGUAGES[idx % LANGUAGES.length];
      const occObj = OCCUPATIONS[idx % OCCUPATIONS.length];
      const schemeObj = SCHEME_COVERAGES[idx % SCHEME_COVERAGES.length];
      const disease = SYMPTOM_AND_DISEASE_PROFILES[idx % SYMPTOM_AND_DISEASE_PROFILES.length];
      const commStory = COMMUNICATION_BARRIER_STORIES[idx % COMMUNICATION_BARRIER_STORIES.length];
      const outcomeArchetype = CARE_OUTCOME_ARCHETYPES[idx % CARE_OUTCOME_ARCHETYPES.length];

      // Delay calculations
      const transitTravelMinutes = Math.round(loc.distanceKm * 3.2 + (idx % 30));
      const registrationQueueMinutes = 25 + (idx % 65);
      const opdWaitMinutes = 35 + (idx % 95);
      const diagnosticTurnaroundDays = disease.urgencyLevel === 'urgent' ? 1 : 2 + (idx % 4);
      const totalWaitHours = Math.round(((transitTravelMinutes * 2) + registrationQueueMinutes + opdWaitMinutes) / 60 * 10) / 10;

      // Economic friction calculation
      const roundTripTransitCostInr = Math.round(loc.distanceKm * 7.5 * 2 + (idx % 50));
      const dailyWageLossInr = occObj.dailyWageInr;
      const attendantDailyWageLossInr = age < 12 || age > 60 ? 350 : 0;
      const effectiveDiagnosticFeeInr = schemeObj.coveragePercent > 0 ? Math.round(disease.testCostInr * (1 - schemeObj.coveragePercent / 100)) : disease.testCostInr;
      const effectivePharmacyFeeInr = schemeObj.coveragePercent > 0 ? Math.round(disease.pharmacyCostInr * (1 - schemeObj.coveragePercent / 100)) : disease.pharmacyCostInr;
      const totalOutOfPocketCostInr = roundTripTransitCostInr + dailyWageLossInr + attendantDailyWageLossInr + effectiveDiagnosticFeeInr + effectivePharmacyFeeInr + 80;

      // Transport & Digital access levels
      const transportLevel: 'none' | 'low' | 'moderate' | 'high' =
        loc.distanceKm > 20 ? (idx % 2 === 0 ? 'none' : 'low') : loc.distanceKm > 8 ? 'low' : 'moderate';
      const digitalAccess: 'none' | 'basic' | 'moderate' | 'advanced' =
        age > 60 ? 'none' : occObj.dailyWageInr < 400 ? 'basic' : 'moderate';
      const documentationStatus: 'incomplete' | 'partial' | 'complete' =
        idx % 5 === 0 ? 'incomplete' : idx % 5 === 1 ? 'partial' : 'complete';

      // Deterministic ABHA ID (clearly mock patterned)
      const abhaId = `91-${String(3000 + (idx % 7000)).padStart(4, '0')}-${String(4000 + (idx % 6000)).padStart(4, '0')}-${String(5000 + (idx % 5000)).padStart(4, '0')}`;

      // Patient Entity
      const patientId = `syn-pat-${seq}`;
      const patientRecord: any = {
        _id: patientId,
        id: patientId,
        userId: `syn-usr-${seq}`,
        patientCode,
        name: fullName,
        age,
        gender,
        bloodGroup: ['A+', 'B+', 'O+', 'AB+', 'O-'][idx % 5],
        abhaNumber: abhaId,
        preferredLanguage: langObj.lang,
        preferredDialect: langObj.dialect,
        simpleLanguageMode: langObj.literacyLevel === 'low',
        voiceEnabled: age > 55 || langObj.literacyLevel === 'low',
        textToSpeechEnabled: true,
        phone: `+91-98765${String(seq).padStart(5, '0')}`,
        emergencyContactName: `${lastName} Family Contact`,
        emergencyContactPhone: `+91-98764${String(seq).padStart(5, '0')}`,
        emergencyContactRelation: age < 18 ? 'Mother / Guardian' : age > 60 ? 'Son' : 'Spouse',
        location: {
          address: `${loc.locality}, ${loc.block}`,
          city: loc.district,
          state: loc.state,
          pincode: '144411',
          latitude: loc.lat + (Math.sin(idx) * 0.008),
          longitude: loc.lng + (Math.cos(idx) * 0.008),
          roadCondition: loc.roadQuality,
          distanceKm: loc.distanceKm,
        },
        chronicConditions: [disease.chronicCondition],
        transportAvailability: transportLevel,
        digitalAccessLevel: digitalAccess,
        familySupport: age < 12 || age > 65 ? 'high' : 'moderate',
        documentationStatus,
        financialAccessibility: schemeObj.financialStatus,
        appointmentFlexibility: occObj.flexibility,
        residenceType: loc.residenceType,
        occupation: occObj.title,
        dailyWageInr: occObj.dailyWageInr,
        welfareScheme: schemeObj.scheme,
        preferredHospitalId: primaryHospital ? (primaryHospital.id || primaryHospital._id) : undefined,
        assignedAshaWorkerId: primaryAsha ? (primaryAsha.id || primaryAsha._id) : undefined,
        currentJourneyStage: outcomeArchetype.status,
        isProfileComplete: true,
        consentGiven: true,
        // CRITICAL SYNTHETIC TEST LABELS
        isSyntheticTestData: true,
        dataClassification: 'SYNTHETIC_TEST_DATA_SIMULATION',
        testCohortId: 'PFIS-SYNTHETIC-1000-COHORT-2026',
        syntheticDataDisclaimer: 'SYNTHETIC SIMULATION DATA ONLY. NOT A REAL PATIENT OR REAL MEDICAL RECORD.',
        createdAt: new Date(nowMs - (idx * 1800000)).toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Friction & Risk Engine Evaluation
      const frictionResult = FrictionEngine.calculate(patientRecord, primaryHospital, loc.distanceKm);
      const careRiskResult = RiskEngine.evaluate(frictionResult);

      // Embed the 10 dimensions directly on the Patient entity for single-document inspection in MongoDB
      patientRecord.syntheticSimulation = {
        demographics: {
          patientCode,
          name: fullName,
          age,
          gender,
          bloodGroup: patientRecord.bloodGroup,
          residenceType: loc.residenceType,
          locality: loc.locality,
          block: loc.block,
          district: loc.district,
          state: loc.state,
          pincode: '144411',
          coordinates: [loc.lng, loc.lat],
          roadCondition: loc.roadQuality,
          distanceToFacilityKm: loc.distanceKm,
          occupation: occObj.title,
          dailyWageInr: occObj.dailyWageInr,
          preferredLanguage: langObj.lang,
          preferredDialect: langObj.dialect,
          literacyLevel: langObj.literacyLevel,
          welfareScheme: schemeObj.scheme,
          abhaNumber: abhaId,
        },
        appointments: [
          {
            appointmentCode: `APT-SYN-${seq}`,
            departmentName: disease.department,
            appointmentDate: new Date(nowMs + ((idx % 28) - 14) * 86400000).toISOString(),
            type: idx % 5 === 0 ? 'Teleconsult' : idx % 15 === 0 ? 'Emergency' : 'OPD',
            status: (idx % 6 === 0 ? 'cancelled' : idx % 8 === 0 ? 'no_show' : 'completed'),
            queueNumber: (idx % 35) + 1,
            attendingDoctor: primaryDoctor ? primaryDoctor.name : 'Dr. Vikram Sharma, MD',
            facility: primaryHospital ? primaryHospital.name : 'Civil Hospital Phagwara',
          }
        ],
        symptoms: {
          diseaseCategory: disease.category,
          chiefComplaints: disease.symptoms,
          chronicCondition: disease.chronicCondition,
          urgencyLevel: disease.urgencyLevel,
          vitalSigns: disease.vitals,
        },
        healthcareJourney: {
          currentStage: outcomeArchetype.status,
          narrative: outcomeArchetype.narrative,
          stagesProgressed: [
            '1. Symptom Perception & Home Remedies',
            '2. Community ASHA Screening & Triage',
            '3. Physical Transit to Facility',
            '4. OPD Token & Registration Counter',
            '5. Clinical Physician Evaluation',
            '6. Diagnostic Lab & Specimen Collection',
            '7. Subsidized Pharmacy Dispensation',
            '8. Post-Consultation Community Follow-Up'
          ],
        },
        delays: {
          transitTravelMinutes,
          registrationQueueMinutes,
          opdWaitMinutes,
          diagnosticTurnaroundDays,
          financialHesitationDays: schemeObj.coveragePercent === 0 ? 5 : 1,
          totalCareDelayHours: totalWaitHours,
        },
        costs: {
          roundTripTransitCostInr,
          dailyWageLossInr,
          attendantDailyWageLossInr,
          diagnosticFeeInr: effectiveDiagnosticFeeInr,
          pharmacyCostInr: effectivePharmacyFeeInr,
          totalOutOfPocketCostInr,
          schemeCoverage: schemeObj.scheme,
          coveragePercent: schemeObj.coveragePercent,
        },
        communicationIssues: {
          barrierType: commStory.type,
          barrierDescription: commStory.description,
          patientVernacularFeedback: commStory.quote,
        },
        frictionPoints: {
          overallFrictionScore: frictionResult.overallFrictionScore,
          overallAccessibilityScore: frictionResult.overallAccessibilityScore,
          frictionLevel: frictionResult.frictionLevel,
          topPrimaryBarrier: frictionResult.topBarrier,
          secondaryBarrier: frictionResult.secondaryBarrier,
          dimensionScores: {
            travelDistance: frictionResult.travel?.score || 45,
            publicTransit: frictionResult.transport?.score || 50,
            digitalAccess: frictionResult.digitalAccess?.score || 35,
            languageMismatch: frictionResult.language?.score || 30,
            familySupport: frictionResult.familySupport?.score || 25,
            documentationAbha: frictionResult.documentation?.score || 30,
            outOfPocketCost: frictionResult.cost?.score || 55,
            appointmentScheduling: frictionResult.appointmentTiming?.score || 40,
          },
          mitigationPathways: [
            'ASHA Doorstep Teleconsultation Linkage',
            'PM-JAY Scheme Registration Assistance',
            'Vernacular Voice Translation of Prescription Instructions',
            'Subsidized Transit Mobility Voucher'
          ],
        },
        outcomes: {
          finalOutcomeStatus: outcomeArchetype.status,
          careCompletionProbabilityPercent: careRiskResult.careCompletionProbability,
          nonCompletionDropoutRiskPercent: careRiskResult.accessibilityRiskPercentage,
          primaryBottleneckStage: careRiskResult.bottleneckStage,
          resolutionNarrative: outcomeArchetype.narrative,
        },
        interactionHistory: [
          {
            touchpoint: idx % 4 === 0 ? 'ASHA Doorstep Survey' : idx % 4 === 1 ? 'OPD Registration Counter' : idx % 4 === 2 ? 'Pharmacy Dispensation Counter' : 'Hospital Central Helpdesk',
            channel: idx % 3 === 0 ? 'In-Person Field' : idx % 3 === 1 ? 'IVR Voice Call' : 'Facility Physical Window',
            barrierEncountered: frictionResult.topBarrier,
            communicationBarrier: commStory.type,
            patientFeedbackQuote: commStory.quote,
            delayIncurredMinutes: transitTravelMinutes + registrationQueueMinutes,
            economicLossInr: totalOutOfPocketCostInr,
            timestamp: new Date(nowMs - (idx * 3600000)).toISOString(),
          }
        ],
        testMetadata: {
          isSyntheticTestData: true,
          testCohortId: 'PFIS-SYNTHETIC-1000-COHORT-2026',
          dataClassification: 'SYNTHETIC_TEST_DATA_SIMULATION',
          disclaimer: 'SYNTHETIC SIMULATION DATA ONLY. NOT A REAL PATIENT OR REAL MEDICAL RECORD.',
        }
      };

      patientsBatch.push(patientRecord);

      // Friction Profile Document
      frictionBatch.push({
        _id: `syn-fric-${seq}`,
        id: `syn-fric-${seq}`,
        patientId,
        overallFrictionScore: frictionResult.overallFrictionScore,
        overallAccessibilityScore: frictionResult.overallAccessibilityScore,
        frictionLevel: frictionResult.frictionLevel,
        travelFriction: frictionResult.travel?.score || 45,
        transportFriction: frictionResult.transport?.score || 50,
        digitalFriction: frictionResult.digitalAccess?.score || 35,
        languageFriction: frictionResult.language?.score || 30,
        familySupportFriction: frictionResult.familySupport?.score || 25,
        documentationFriction: frictionResult.documentation?.score || 30,
        costFriction: frictionResult.cost?.score || 55,
        appointmentTimingFriction: frictionResult.appointmentTiming?.score || 40,
        topBarrier: frictionResult.topBarrier || 'Travel & Physical Transit',
        secondaryBarrier: frictionResult.secondaryBarrier || 'Out-of-Pocket Prescription Cost',
        mitigationRecommendations: [
          'ASHA Doorstep Teleconsultation Linkage',
          'PM-JAY Scheme Registration Assistance',
          'Vernacular Voice Translation of Prescription Instructions',
          'Subsidized Transit Mobility Voucher'
        ],
        isSyntheticTestData: true,
        dataClassification: 'SYNTHETIC_TEST_DATA_SIMULATION',
        testCohortId: 'PFIS-SYNTHETIC-1000-COHORT-2026',
      });

      // Care Risk Profile Document
      riskBatch.push({
        _id: `syn-risk-${seq}`,
        id: `syn-risk-${seq}`,
        patientId,
        overallRiskScore: careRiskResult.accessibilityRiskPercentage,
        riskCategory: careRiskResult.riskCategory,
        careCompletionProbability: careRiskResult.careCompletionProbability,
        dropoutRisk: careRiskResult.accessibilityRiskPercentage,
        bottleneckStage: careRiskResult.bottleneckStage,
        primaryRiskFactors: careRiskResult.primaryRiskFactors || [
          { factorName: 'Distance Barrier', severity: 'HIGH', operationalImpact: `${loc.distanceKm} km single-trip transit.` }
        ],
        mitigationPathways: careRiskResult.mitigationPathways || [
          'Direct ASHA home follow-up within 72 hours',
          'Token reservation during non-peak farming hours'
        ],
        isSyntheticTestData: true,
        dataClassification: 'SYNTHETIC_TEST_DATA_SIMULATION',
        testCohortId: 'PFIS-SYNTHETIC-1000-COHORT-2026',
      });

      // Appointment Record
      const appointmentDate = new Date(nowMs + ((idx % 28) - 14) * 86400000);
      const isPast = appointmentDate < new Date();
      const aptStatus = isPast
        ? (idx % 6 === 0 ? 'cancelled' : idx % 8 === 0 ? 'no_show' : 'completed')
        : (idx % 3 === 0 ? 'confirmed' : 'scheduled');

      appointmentsBatch.push({
        _id: `syn-apt-${seq}`,
        id: `syn-apt-${seq}`,
        appointmentCode: `APT-SYN-${seq}`,
        patientId,
        doctorId: primaryDoctor ? (primaryDoctor.id || primaryDoctor._id) : null,
        hospitalId: primaryHospital ? (primaryHospital.id || primaryHospital._id) : null,
        departmentName: disease.department,
        appointmentDate: appointmentDate.toISOString(),
        timeSlot: `${8 + (idx % 6)}:00 AM - ${8 + (idx % 6)}:30 AM`,
        queueNumber: (idx % 35) + 1,
        type: idx % 5 === 0 ? 'Teleconsult' : idx % 15 === 0 ? 'Emergency' : 'OPD',
        status: aptStatus,
        reasonForVisit: disease.symptoms[idx % disease.symptoms.length],
        symptoms: disease.symptoms,
        urgencyLevel: disease.urgencyLevel,
        delayMetrics: {
          transitTravelMinutes,
          registrationQueueMinutes,
          opdWaitMinutes,
          totalWaitHours,
        },
        costMetrics: {
          roundTripTransitCostInr,
          dailyWageLossInr,
          totalOutOfPocketCostInr,
          welfareScheme: schemeObj.scheme,
        },
        isSyntheticTestData: true,
        dataClassification: 'SYNTHETIC_TEST_DATA_SIMULATION',
        testCohortId: 'PFIS-SYNTHETIC-1000-COHORT-2026',
      });

      // Longitudinal Healthcare Journey Document
      journeysBatch.push({
        _id: `syn-jrn-${seq}`,
        id: `syn-jrn-${seq}`,
        patientId,
        stage: outcomeArchetype.status,
        status: outcomeArchetype.isSuccess ? 'Completed' : 'Bottleneck_Stalled',
        symptomsReported: disease.symptoms,
        communicationIssueRecorded: commStory.description,
        patientQuote: commStory.quote,
        delaysSummary: `Transit: ${transitTravelMinutes}m, Queue: ${registrationQueueMinutes}m, Doctor Wait: ${opdWaitMinutes}m. Total care delay: ${totalWaitHours}h.`,
        costsSummary: `Travel ₹${roundTripTransitCostInr}, Lost Wages ₹${dailyWageLossInr}, Diagnostics ₹${effectiveDiagnosticFeeInr}, Meds ₹${effectivePharmacyFeeInr}. Total OOPE: ₹${totalOutOfPocketCostInr}. Scheme: ${schemeObj.scheme}.`,
        outcomeNarrative: outcomeArchetype.narrative,
        facilityName: primaryHospital?.name || 'Civil Hospital Phagwara',
        isSyntheticTestData: true,
        dataClassification: 'SYNTHETIC_TEST_DATA_SIMULATION',
        testCohortId: 'PFIS-SYNTHETIC-1000-COHORT-2026',
      });

      // Clinical Medical Record Document
      recordsBatch.push({
        _id: `syn-rec-${seq}`,
        id: `syn-rec-${seq}`,
        recordCode: `REC-SYN-${seq}`,
        patientId,
        doctorId: primaryDoctor ? (primaryDoctor.id || primaryDoctor._id) : null,
        doctorName: primaryDoctor?.name || 'Dr. Harpreet Singh, MD',
        facilityName: primaryHospital?.name || 'Civil Hospital Phagwara',
        visitDate: appointmentDate.toISOString(),
        visitType: 'OPD Clinical Consultation',
        chiefComplaint: disease.symptoms[idx % disease.symptoms.length],
        vitalSigns: disease.vitals,
        clinicalFindings: `Physical evaluation: Patient presented with ${disease.category}. Observed vitals: BP ${disease.vitals.bloodPressure} mmHg, Pulse ${disease.vitals.pulseRate} bpm, SpO2 ${disease.vitals.spo2}%. Non-clinical observation: ${commStory.description}`,
        diagnoses: [disease.chronicCondition],
        prescriptions: [
          { medicineName: disease.pharmacyMedication, dosage: 'As directed on label (explained orally)', duration: '30 days' },
          { medicineName: 'Paracetamol 650mg', dosage: 'SOS for fever or bodily discomfort', duration: '5 days' },
        ],
        labOrders: [disease.diagnosticTest],
        isSyntheticTestData: true,
        dataClassification: 'SYNTHETIC_TEST_DATA_SIMULATION',
        testCohortId: 'PFIS-SYNTHETIC-1000-COHORT-2026',
      });

      // Multi-Touchpoint Friction Interaction History
      interactionsBatch.push({
        _id: `syn-int-${seq}`,
        id: `syn-int-${seq}`,
        patientId,
        touchpoint: idx % 4 === 0 ? 'ASHA Doorstep Survey' : idx % 4 === 1 ? 'OPD Registration Counter' : idx % 4 === 2 ? 'Pharmacy Dispensation Counter' : 'Hospital Central Helpdesk',
        channel: idx % 3 === 0 ? 'In-Person Field' : idx % 3 === 1 ? 'IVR Voice Call' : 'Facility Physical Window',
        barrierEncountered: frictionResult.topBarrier,
        communicationBarrier: commStory.type,
        patientFeedbackQuote: commStory.quote,
        delayIncurredMinutes: transitTravelMinutes + registrationQueueMinutes,
        economicLossInr: totalOutOfPocketCostInr,
        touchpointTimestamp: new Date(nowMs - (idx * 3600000)).toISOString(),
        isSyntheticTestData: true,
        dataClassification: 'SYNTHETIC_TEST_DATA_SIMULATION',
        testCohortId: 'PFIS-SYNTHETIC-1000-COHORT-2026',
      });
    }

    // Insert the batch across all MongoDB collections
    await Promise.all([
      Patient.insertMany(patientsBatch),
      FrictionProfile.insertMany(frictionBatch),
      CareRisk.insertMany(riskBatch),
      Appointment.insertMany(appointmentsBatch),
      CareJourney.insertMany(journeysBatch),
      MedicalRecord.insertMany(recordsBatch),
      FrictionInteraction.insertMany(interactionsBatch),
    ]);

    console.log(`[PFIS 1000 Seed] Seeded batch ${(b / BATCH_SIZE) + 1}/${TOTAL_PATIENTS / BATCH_SIZE} (${b + BATCH_SIZE} complete synthetic patient profiles)...`);
  }

  // Record Audit Trail of this synthetic simulation run
  await AuditLog.create({
    actorRole: 'system',
    action: 'SYNTHETIC_PATIENT_COHORT_1000_PRODUCED',
    resource: 'SimulationEngine',
    details: {
      totalSyntheticPatients: TOTAL_PATIENTS,
      patientCodeRange: `PAT-${BASE_ID_OFFSET} to PAT-${BASE_ID_OFFSET + TOTAL_PATIENTS - 1}`,
      dataScope: [
        'Diverse Demographics (15 Localities, 8 Languages, 10 Occupations)',
        'Appointments (OPD, Teleconsult, Emergency)',
        'Symptoms & Vital Signs (7 Specialty Disease Cohorts)',
        'Healthcare Journeys (8-Stage Longitudinal Continuity)',
        'Friction Delays (Transit, Queue, Turnaround, Harvesting Migration)',
        'Economic Costs (Transit, OOPE, Daily Wage Loss, Schemes)',
        'Communication Issues (Dialect Mismatch, Illiteracy, SMS Gap)',
        'Deterministic Friction Points (8-Dimensional Engine Calculation)',
        'Care Outcomes & Completion Probabilities',
        'Interaction History & Vernacular Quotes'
      ],
      label: 'SYNTHETIC_TEST_DATA_SIMULATION',
      testCohortId: 'PFIS-SYNTHETIC-1000-COHORT-2026',
      timestamp: new Date().toISOString(),
    },
    timestamp: new Date(),
  });

  // Verify Database Cohort Counts
  const seededPatients = await Patient.countDocuments({ testCohortId: 'PFIS-SYNTHETIC-1000-COHORT-2026' });
  const seededApts = await Appointment.countDocuments({ testCohortId: 'PFIS-SYNTHETIC-1000-COHORT-2026' });
  const seededFriction = await FrictionProfile.countDocuments({ testCohortId: 'PFIS-SYNTHETIC-1000-COHORT-2026' });
  const seededRisks = await CareRisk.countDocuments({ testCohortId: 'PFIS-SYNTHETIC-1000-COHORT-2026' });
  const seededJourneys = await CareJourney.countDocuments({ testCohortId: 'PFIS-SYNTHETIC-1000-COHORT-2026' });
  const seededRecords = await MedicalRecord.countDocuments({ testCohortId: 'PFIS-SYNTHETIC-1000-COHORT-2026' });
  const seededInteractions = await FrictionInteraction.countDocuments({ testCohortId: 'PFIS-SYNTHETIC-1000-COHORT-2026' });

  console.log('\n================================================================');
  console.log('  MONGODB ATLAS VERIFICATION AUDIT REPORT:                      ');
  console.log('================================================================');
  console.log(`  - Synthetic Patient Profiles:     ${seededPatients}`);
  console.log(`  - Appointments (OPD/Tele/Emerg):  ${seededApts}`);
  console.log(`  - Friction Deterministic Models:  ${seededFriction}`);
  console.log(`  - Care Risk & Dropout Analyses:   ${seededRisks}`);
  console.log(`  - Longitudinal Care Journeys:     ${seededJourneys}`);
  console.log(`  - Clinical EHR Medical Records:   ${seededRecords}`);
  console.log(`  - Multi-Touchpoint Interactions:  ${seededInteractions}`);
  console.log('================================================================');
  console.log('  SUCCESS: 1,000 REALISTIC SYNTHETIC PATIENT PROFILES READY!    ');
  console.log('  Database: MongoDB Atlas (Cluster0 / pfis)                      ');
  console.log('  Tag: isSyntheticTestData: true                                ');
  console.log('  Cohort ID: PFIS-SYNTHETIC-1000-COHORT-2026                    ');
  console.log('================================================================\n');
}

if (process.argv[1]?.includes('create1000SyntheticCohort.ts') || process.argv[1]?.includes('create1000SyntheticCohort.js')) {
  create1000SyntheticCohort()
    .then(async () => {
      await closeDB();
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Create1000Cohort Error]', err);
      process.exit(1);
    });
}
