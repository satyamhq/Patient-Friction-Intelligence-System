import bcrypt from 'bcryptjs';
import { connectDB, closeDB } from '../config/database.js';
import { User } from '../models/User.js';
import { Patient } from '../models/Patient.js';
import { Hospital } from '../models/Hospital.js';
import { Doctor } from '../models/Doctor.js';
import { AshaWorker } from '../models/AshaWorker.js';
import { GovernmentOfficial } from '../models/GovernmentOfficial.js';
import { FrictionProfile } from '../models/FrictionProfile.js';
import { CareRisk } from '../models/CareRisk.js';
import { CareJourney } from '../models/CareJourney.js';
import { Notification } from '../models/Notification.js';
import { AuditLog } from '../models/AuditLog.js';
import { HospitalRequest } from '../models/HospitalRequest.js';
import { FrictionEngine } from '../intelligence/friction/frictionEngine.js';
import { RiskEngine } from '../intelligence/risk/riskEngine.js';
import { getMedicineInventory } from '../controllers/medicineInventoryController.js';

// Realistic Demographic Data Dictionaries for North India / Rural Punjab
const FIRST_NAMES_FEMALE = [
  'Pooja', 'Sunita', 'Manpreet', 'Gurpreet', 'Simranjit', 'Jaswinder', 'Asha', 'Anita',
  'Rekha', 'Kavita', 'Suman', 'Geeta', 'Neelam', 'Harpreet', 'Rajwinder', 'Paramjit',
  'Kuldeep', 'Baljit', 'Shinder', 'Babita', 'Mamta', 'Chander', 'Rani', 'Sita', 'Sarabjit'
];

const FIRST_NAMES_MALE = [
  'Balwinder', 'Gurdeep', 'Harbhajan', 'Kulwant', 'Sukhdev', 'Surinder', 'Joginder',
  'Rajinder', 'Daljit', 'Amarjit', 'Satnam', 'Jaswant', 'Mukesh', 'Ramesh', 'Suresh',
  'Dharminder', 'Jagdish', 'Prem', 'Mohinder', 'Kewal', 'Malkeet', 'Hardev', 'Charanjit',
  'Rakesh', 'Vijay', 'Ashok', 'Sanjay', 'Manoj'
];

const LAST_NAMES = [
  'Kaur', 'Singh', 'Devi', 'Kumar', 'Sharma', 'Verma', 'Ram', 'Lal', 'Rani', 'Chand',
  'Bala', 'Bai', 'Das', 'Gill', 'Dhillon', 'Sandhu', 'Grewal', 'Sidhu', 'Cheema'
];

const VILLAGES = [
  { name: 'Khera Village', distanceKm: 7.2, block: 'Phagwara Rural', lat: 31.2580, lng: 75.6980 },
  { name: 'Chaheru Rural', distanceKm: 4.8, block: 'Chaheru', lat: 31.2490, lng: 75.7120 },
  { name: 'Behram Sector', distanceKm: 14.5, block: 'Banga Link', lat: 31.2010, lng: 75.8320 },
  { name: 'Kotrani Basti', distanceKm: 8.9, block: 'Phagwara Rural', lat: 31.2350, lng: 75.7420 },
  { name: 'Hadiabad Ward 2', distanceKm: 3.2, block: 'Phagwara Urban', lat: 31.2210, lng: 75.7600 },
  { name: 'Sapror Farmland', distanceKm: 11.4, block: 'Phagwara Rural', lat: 31.2720, lng: 75.6810 },
  { name: 'Sultanpur Lodhi Riverbank', distanceKm: 38.0, block: 'Sultanpur', lat: 31.2185, lng: 75.1979 },
  { name: 'Bholath Semi-Arid', distanceKm: 29.5, block: 'Bholath', lat: 31.4520, lng: 75.5210 },
  { name: 'Nadala Colony', distanceKm: 26.0, block: 'Nadala', lat: 31.4910, lng: 75.4800 },
  { name: 'Kapurthala Outskirts', distanceKm: 22.0, block: 'Kapurthala', lat: 31.3750, lng: 75.4120 },
];

const LANGUAGES = ['Punjabi', 'Hindi', 'Bhojpuri', 'Odia'];
const TRANSPORT_LEVELS = ['low', 'moderate', 'high'];
const FINANCIAL_LEVELS = ['severely_constrained', 'bpl_ration_card', 'moderate_budget'];
const DOC_STATUSES = ['none', 'partial', 'complete'];
const DIGITAL_LEVELS = ['none', 'basic', 'moderate'];

export const seed500SyntheticCohort = async () => {
  console.log('================================================================');
  console.log('  PFIS 500-PATIENT SYNTHETIC HEALTHCARE COHORT SEED GENERATOR   ');
  console.log('================================================================');

  await connectDB();

  console.log('[Seed] Purging existing cohort data...');
  await Promise.all([
    User.deleteMany({}),
    Patient.deleteMany({}),
    Hospital.deleteMany({}),
    Doctor.deleteMany({}),
    AshaWorker.deleteMany({}),
    GovernmentOfficial.deleteMany({}),
    FrictionProfile.deleteMany({}),
    CareRisk.deleteMany({}),
    CareJourney.deleteMany({}),
    HospitalRequest.deleteMany({}),
    Notification.deleteMany({}),
    AuditLog.deleteMany({}),
  ]);

  const salt = await bcrypt.genSalt(10);
  const adminPass = await bcrypt.hash('Admin@123', salt);
  const doctorPass = await bcrypt.hash('Doctor@123', salt);
  const ashaPass = await bcrypt.hash('Asha@123', salt);
  const govPass = await bcrypt.hash('Gov@123', salt);
  const patientPass = await bcrypt.hash('Patient@123', salt);
  const hospPass = await bcrypt.hash('Hospital@123', salt);

  console.log('[Seed] Creating Core Administrative & Institutional Users...');
  
  // 1. Admin Users
  const adminUser = await User.create({
    name: 'PFIS Mission Director',
    email: 'admin@pfis.org',
    passwordHash: adminPass,
    role: 'admin',
    phone: '9876500001',
    needsOnboarding: false,
    isActive: true,
  });

  await User.create({
    name: 'PFIS Operations Admin',
    email: 'sysadmin@pfis.local',
    passwordHash: adminPass,
    role: 'admin',
    phone: '9876500002',
    needsOnboarding: false,
    isActive: true,
  });

  // 2. Doctor User & Profile
  const doctorUser = await User.create({
    name: 'Dr. Vikram Sharma, MD',
    email: 'doctor@pfis.org',
    passwordHash: doctorPass,
    role: 'doctor',
    phone: '9876500003',
    needsOnboarding: false,
    isActive: true,
  });

  await Doctor.create({
    userId: doctorUser._id,
    name: 'Dr. Vikram Sharma, MD',
    email: 'doctor@pfis.org',
    phone: '9876500003',
    hospitalName: 'Civil Hospital Phagwara',
    department: 'General Medicine & Family Health',
    qualification: 'MBBS, MD (Medicine)',
    registrationNumber: 'PMC-2021-98124',
    specialization: 'Internal & Community Medicine',
    experienceYears: 11,
    opdTimings: '09:00 AM - 02:00 PM',
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    consultationFee: 0,
    isAvailable: true,
    rating: 4.9,
    totalPatientsConsulted: 1840,
  });

  // 3. ASHA Worker User & Profile
  const ashaUser = await User.create({
    name: 'Sunita Devi (Frontline ASHA)',
    email: 'asha@pfis.org',
    passwordHash: ashaPass,
    role: 'asha',
    phone: '9876500004',
    needsOnboarding: false,
    isActive: true,
  });

  await AshaWorker.create({
    userId: ashaUser._id,
    workerId: 'ASHA-PB-7821',
    name: 'Sunita Devi (Frontline ASHA)',
    email: 'asha@pfis.org',
    phone: '9876500004',
    assignedVillage: 'Khera Village (Block 3)',
    assignedWard: 'Wards 4, 5 & 6',
    district: 'Kapurthala',
    state: 'Punjab',
    primaryHealthCenter: 'PHC Chaheru',
    communityPopulation: 1450,
    assignedPatientsCount: 185,
    activeCases: 23,
    languagesSpoken: ['Punjabi', 'Hindi'],
    isFieldActive: true,
  });

  // 4. Government Health Official User & Profile
  const govUser = await User.create({
    name: 'Dr. Jaspreet Kaur (CMO)',
    email: 'government@pfis.org',
    passwordHash: govPass,
    role: 'government',
    phone: '01822-232145',
    needsOnboarding: false,
    isActive: true,
  });

  await GovernmentOfficial.create({
    userId: govUser._id,
    name: 'Dr. Jaspreet Kaur (CMO)',
    email: 'government@pfis.org',
    phone: '01822-232145',
    officialDesignation: 'District Chief Medical Officer (CMO)',
    department: 'Department of Health & Family Welfare',
    jurisdictionLevel: 'DISTRICT',
    district: 'Kapurthala',
    state: 'Punjab',
    officeAddress: 'Civil Hospital Complex, Kapurthala Headquarter',
    clearanceLevel: 'LEVEL_4_EXECUTIVE_GOVERNANCE',
  });

  // 5. Hospital Facility User & Records
  const hospUser = await User.create({
    name: 'Civil Hospital Phagwara',
    email: 'hospital@pfis.org',
    passwordHash: hospPass,
    role: 'hospital',
    phone: '01824-260234',
    needsOnboarding: false,
    isActive: true,
  });

  const mainHospital = await Hospital.create({
    userId: hospUser._id,
    name: 'Civil Hospital Phagwara (Sub-Divisional)',
    type: 'Sub-Divisional Hospital',
    address: 'GT Road Healthcare Plaza, Phagwara',
    city: 'Phagwara',
    state: 'Punjab',
    pincode: '144401',
    latitude: 31.2229,
    longitude: 75.7725,
    geoJSON: { type: 'Point', coordinates: [75.7725, 31.2229] },
    phone: '01824-260234',
    email: 'hospital@pfis.org',
    emergencyAvailable: true,
    totalBeds: 150,
    availableBeds: 34,
    specialistAvailable: true,
  });

  const secondaryHospital = await Hospital.create({
    name: 'District Hospital Kapurthala (Tertiary Care)',
    type: 'District Hospital',
    address: 'Civil Lines Road, Kapurthala',
    city: 'Kapurthala',
    state: 'Punjab',
    pincode: '144601',
    latitude: 31.3802,
    longitude: 75.3853,
    geoJSON: { type: 'Point', coordinates: [75.3853, 31.3802] },
    phone: '01822-232100',
    email: 'dh.kapurthala@punjab.gov.in',
    emergencyAvailable: true,
    totalBeds: 300,
    availableBeds: 62,
    specialistAvailable: true,
  });

  const phcChaheru = await Hospital.create({
    name: 'Primary Health Center (PHC) Chaheru',
    type: 'PHC',
    address: 'Village Chaheru Near Railway Crossing',
    city: 'Chaheru',
    state: 'Punjab',
    pincode: '144411',
    latitude: 31.2490,
    longitude: 75.7120,
    geoJSON: { type: 'Point', coordinates: [75.7120, 31.2490] },
    phone: '01824-250100',
    email: 'phc.chaheru@punjab.gov.in',
    emergencyAvailable: false,
    totalBeds: 10,
    availableBeds: 4,
    specialistAvailable: false,
  });

  // 6. Seed Baseline Patient User
  const demoPatientUser = await User.create({
    name: 'Pooja Rani',
    email: 'patient@pfis.org',
    passwordHash: patientPass,
    role: 'patient',
    phone: '9876543210',
    needsOnboarding: false,
    isActive: true,
  });

  console.log('[Seed] Generating 500 Realistic Synthetic Patient Records...');

  const patientsToInsert: any[] = [];
  const frictionToInsert: any[] = [];
  const risksToInsert: any[] = [];
  const journeysToInsert: any[] = [];

  for (let i = 1; i <= 500; i++) {
    const isFemale = Math.random() < 0.52;
    const firstName = isFemale
      ? FIRST_NAMES_FEMALE[Math.floor(Math.random() * FIRST_NAMES_FEMALE.length)]
      : FIRST_NAMES_MALE[Math.floor(Math.random() * FIRST_NAMES_MALE.length)];
    const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    const fullName = `${firstName} ${lastName}`;

    // Age distribution: 15% under 10, 20% 18-30 (ANC), 35% 31-55, 30% 55+
    let age = 35;
    const ageRoll = Math.random();
    if (ageRoll < 0.15) age = Math.floor(1 + Math.random() * 9);
    else if (ageRoll < 0.35) age = Math.floor(18 + Math.random() * 12);
    else if (ageRoll < 0.70) age = Math.floor(31 + Math.random() * 24);
    else age = Math.floor(56 + Math.random() * 28);

    const village = VILLAGES[Math.floor(Math.random() * VILLAGES.length)];
    const language = LANGUAGES[Math.floor(Math.random() * LANGUAGES.length)];
    const transport = TRANSPORT_LEVELS[Math.floor(Math.random() * TRANSPORT_LEVELS.length)];
    const finance = FINANCIAL_LEVELS[Math.floor(Math.random() * FINANCIAL_LEVELS.length)];
    const docs = DOC_STATUSES[Math.floor(Math.random() * DOC_STATUSES.length)];
    const digital = DIGITAL_LEVELS[Math.floor(Math.random() * DIGITAL_LEVELS.length)];

    const patientCode = `PAT-${1000 + i}`;
    const abhaId = `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const patientData: any = {
      userId: i === 1 ? demoPatientUser._id : null,
      patientCode,
      name: fullName,
      age,
      gender: isFemale ? 'female' : 'male',
      abhaId,
      preferredLanguage: language,
      phone: `98${Math.floor(10000000 + Math.random() * 90000000)}`,
      transportAvailability: transport,
      financialAccessibility: finance,
      documentationStatus: docs,
      digitalAccessLevel: digital,
      appointmentFlexibility: finance === 'severely_constrained' ? 'inflexible_daily_wage' : 'flexible',
      residenceType: village.distanceKm > 15 ? 'rural_remote' : 'semi_urban',
      location: {
        address: `${village.name}, House #${Math.floor(1 + Math.random() * 120)}`,
        city: 'Phagwara',
        state: 'Punjab',
        pincode: '144411',
        latitude: village.lat,
        longitude: village.lng,
        geoJSON: { type: 'Point', coordinates: [village.lng, village.lat] },
      },
    };

    // Calculate Friction Engine metrics
    const friction = FrictionEngine.calculate(patientData, mainHospital, village.distanceKm);
    // Calculate Risk Engine metrics
    const risk = RiskEngine.evaluate(friction);

    // Track journey stage: Referral -> Consultation -> Diagnostics -> Treatment -> Follow-up
    // Realistic public health funnel distribution
    let stage: string;
    let journeyStatus: string;
    const stageRoll = Math.random();
    if (stageRoll < 0.20) {
      stage = 'Referral';
      journeyStatus = 'Initiated by Frontline ASHA';
    } else if (stageRoll < 0.45) {
      stage = 'Consultation';
      journeyStatus = friction.overallFrictionScore > 65 ? 'At Risk of Non-Arrival' : 'OPD Scheduled';
    } else if (stageRoll < 0.68) {
      stage = 'Diagnostics';
      journeyStatus = 'Awaiting Blood Chemistry / Ultrasound';
    } else if (stageRoll < 0.86) {
      stage = 'Treatment';
      journeyStatus = 'Ongoing Medication / Regimen';
    } else {
      stage = 'Follow-up';
      journeyStatus = (risk.riskCategory === 'HIGH' || risk.riskCategory === 'CRITICAL') ? 'Recall Triggered (Defaulter Alert)' : 'Routine Checkup Due';
    }

    patientData._id = `65e000000000000000000${String(i).padStart(3, '0')}`;
    patientData.id = patientData._id;

    patientsToInsert.push(patientData);

    const frictionDoc = {
      patientId: patientData._id,
      ...friction,
    };
    frictionToInsert.push(frictionDoc);

    const riskDoc = {
      patientId: patientData._id,
      ...risk,
    };
    risksToInsert.push(riskDoc);

    const journeyDoc = {
      patientId: patientData._id,
      stage,
      status: journeyStatus,
      notes: `Care journey in stage: ${stage}. Friction Score: ${friction.overallFrictionScore}/100. Primary barrier: ${friction.topBarrier || 'Transit'}`,
      facilityName: village.distanceKm > 10 ? 'Civil Hospital Phagwara' : 'PHC Chaheru',
      updatedBy: ashaUser._id,
    };
    journeysToInsert.push(journeyDoc);
  }

  console.log(`[Seed] Inserting batch: ${patientsToInsert.length} Patients...`);
  await Patient.insertMany(patientsToInsert);

  console.log(`[Seed] Inserting batch: ${frictionToInsert.length} Friction Profiles...`);
  await FrictionProfile.insertMany(frictionToInsert);

  console.log(`[Seed] Inserting batch: ${risksToInsert.length} Care Risk Profiles...`);
  await CareRisk.insertMany(risksToInsert);

  console.log(`[Seed] Inserting batch: ${journeysToInsert.length} Care Journey Events...`);
  await CareJourney.insertMany(journeysToInsert);

  // Generate 120 Realistic Cross-Facility Hospital Requests / Referrals
  console.log('[Seed] Generating 120 Cross-Facility Hospital Requests & Referrals...');
  const requestsToInsert: any[] = [];
  const depts = [
    'General Medicine & Family Health',
    'Obstetrics & Gynecology (Maternal ANC)',
    'Pediatrics & Child Immunization',
    'Cardiology & Hypertension Clinic',
    'Orthopedics & Trauma Care',
  ];
  const statuses = [
    'REQUEST_CREATED',
    'UNDER_REVIEW',
    'ACCEPTED',
    'APPOINTMENT_SCHEDULED',
    'COMPLETED',
  ];

  for (let j = 0; j < 120; j++) {
    const p = patientsToInsert[j];
    const status = statuses[j % statuses.length];
    const dept = depts[j % depts.length];
    const reqId = `REQ-${2026000 + j}`;

    requestsToInsert.push({
      _id: `65e200000000000000000${String(j + 1).padStart(3, '0')}`,
      id: `65e200000000000000000${String(j + 1).padStart(3, '0')}`,
      requestCode: reqId,
      patientId: p._id,
      hospitalId: mainHospital._id,
      departmentName: dept,
      reasonForVisit: `Clinical consultation and diagnostic workup for ${dept}`,
      preferredDate: new Date(Date.now() + j * 86400000).toISOString().split('T')[0],
      preferredTimeSlot: j % 2 === 0 ? '09:00 AM - 11:00 AM' : '11:00 AM - 01:00 PM',
      status,
      patientLanguage: p.preferredLanguage || 'Punjabi',
      distanceKm: 7.2,
      estimatedTravelTimeMinutes: 25,
      accessibilityScoreAtRequest: 72,
      timeline: [
        {
          status: 'REQUEST_CREATED',
          timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
          actorRole: 'patient',
          note: 'Care access request submitted',
        },
        {
          status,
          timestamp: new Date().toISOString(),
          actorRole: 'hospital',
          note: `Workflow transitioned to ${status}`,
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
  await HospitalRequest.insertMany(requestsToInsert);

  // Seed Notifications for Institutional Portals
  console.log('[Seed] Generating System Notifications across Portals...');
  await Notification.insertMany([
    {
      userId: hospUser._id,
      title: 'Incoming Sub-Centre Referrals',
      message: '12 new assisted teleconsultation and transit referrals received from PHC Chaheru.',
      type: 'info',
      isRead: false,
    },
    {
      userId: doctorUser._id,
      title: 'OPD Queue Active',
      message: '15 patients registered for today morning OPD consultation session.',
      type: 'system',
      isRead: false,
    },
    {
      userId: ashaUser._id,
      title: 'High-Risk Defaulter Alert',
      message: '2 pregnant mothers in Khera village are overdue for 3rd ANC checkup. Home visits scheduled.',
      type: 'warning',
      isRead: false,
    },
    {
      userId: govUser._id,
      title: 'Monthly District Telemetry Ready',
      message: 'Kapurthala healthcare friction index decreased by 4.2% following transit voucher expansion.',
      type: 'success',
      isRead: false,
    },
  ]);

  // Link demo patient active profiles
  const firstP = await Patient.findOne({ patientCode: 'PAT-1001' });
  const firstF = await FrictionProfile.findOne({ patientId: firstP._id });
  const firstR = await CareRisk.findOne({ patientId: firstP._id });
  if (firstP && firstF && firstR) {
    firstP.activeFrictionProfileId = firstF._id as any;
    firstP.activeCareRiskId = firstR._id as any;
    await firstP.save();
  }

  // Seed Initial Medicine Inventories
  console.log('[Seed] Seeding Essential Medicine Inventories...');
  getMedicineInventory({ query: {} } as any, {
    status: () => ({ json: () => {} }),
    json: () => {},
  } as any);

  // Seed Audit Logs
  console.log('[Seed] Recording Initial Governance Audit Trails...');
  await AuditLog.create([
    {
      actorRole: 'admin',
      action: 'SYNTHETIC_COHORT_SEED_500_INITIALIZED',
      resource: 'PatientCohort',
      details: { totalPatients: 500, region: 'Kapurthala & Phagwara District', date: new Date().toISOString() },
      timestamp: new Date(),
    },
    {
      userId: doctorUser._id,
      actorRole: 'doctor',
      action: 'OPD_SCHEDULE_ACTIVATED',
      resource: 'DoctorQueue',
      details: { hospital: 'Civil Hospital Phagwara', slots: 50 },
      timestamp: new Date(),
    },
    {
      userId: ashaUser._id,
      actorRole: 'asha',
      action: 'VILLAGE_SURVEY_SYNCED',
      resource: 'AshaWorker',
      details: { village: 'Khera Village', populationCovered: 1450 },
      timestamp: new Date(),
    },
  ]);

  console.log('================================================================');
  console.log('  SUCCESS: 500 SYNTHETIC PATIENTS & JOURNEYS SEEDED TO MONGODB  ');
  console.log('================================================================');
  console.log('  Accounts available for instant login:                         ');
  console.log('  - Admin:      admin@pfis.org      / Admin@123                 ');
  console.log('  - Doctor:     doctor@pfis.org     / Doctor@123                ');
  console.log('  - ASHA:       asha@pfis.org       / Asha@123                  ');
  console.log('  - Government: government@pfis.org / Gov@123                   ');
  console.log('  - Hospital:   hospital@pfis.org   / Hospital@123              ');
  console.log('  - Patient:    patient@pfis.org    / Patient@123               ');
  console.log('================================================================');
};

if (process.argv[1]?.includes('seed500.ts') || process.argv[1]?.includes('seed500.js')) {
  seed500SyntheticCohort()
    .then(async () => {
      await closeDB();
      process.exit(0);
    })
    .catch((err) => {
      console.error('[PFIS Seed500 Error]', err);
      process.exit(1);
    });
}
