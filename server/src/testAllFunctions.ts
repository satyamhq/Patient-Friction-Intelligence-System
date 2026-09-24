import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

async function runComprehensiveTests() {
  console.log('====================================================');
  console.log('   PFIS END-TO-END SYSTEM FUNCTION TEST SUITE       ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;
  const failures: { test: string; error: any }[] = [];

  async function test(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      passed++;
      console.log(`[PASS] ${name}`);
    } catch (err: any) {
      failed++;
      const errMsg = err.response?.data?.message || err.response?.data || err.message;
      failures.push({ test: name, error: errMsg });
      console.log(`[FAIL] ${name} -> ${JSON.stringify(errMsg)}`);
    }
  }

  // ----------------------------------------------------
  // 1. HEALTH & SYSTEM TELEMETRY
  // ----------------------------------------------------
  await test('System Health Endpoint', async () => {
    const res = await axios.get(`${API_URL}/health`);
    if (!res.data || (res.data.status !== 'healthy' && res.data.status !== 'ok')) {
      throw new Error(`Unexpected health status: ${JSON.stringify(res.data)}`);
    }
  });

  // ----------------------------------------------------
  // 2. AUTHENTICATION & LOGOUT
  // ----------------------------------------------------
  await test('Public Logout without session (should return 200)', async () => {
    const res = await axios.post(`${API_URL}/auth/logout`);
    if (!res.data?.success) throw new Error('Logout failed');
  });

  // Register Patient
  let patientToken = '';
  let patientId = '';
  const patientEmail = `pat_${Date.now()}@example.com`;

  await test('Patient Registration', async () => {
    const res = await axios.post(`${API_URL}/auth/register`, {
      name: 'Sunil Verma',
      email: patientEmail,
      password: 'Password@123',
      role: 'patient',
      phone: '+91-9876543210',
      age: 42,
      gender: 'male',
      city: 'Phagwara',
      address: 'Model Town',
      preferredLanguage: 'hi',
    });
    if (!res.data?.success || !res.data?.token) throw new Error('No token returned');
    patientToken = res.data.token;
  });

  await test('Patient Login', async () => {
    const res = await axios.post(`${API_URL}/auth/login`, {
      email: patientEmail,
      password: 'Password@123',
    });
    if (!res.data?.success || !res.data?.token) throw new Error('Login failed');
    patientToken = res.data.token;
  });

  await test('Patient Session Verification (GET /auth/me)', async () => {
    const res = await axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    if (!res.data?.success || !res.data?.user) throw new Error('Failed to get session');
  });

  await test('Patient Authenticated Logout', async () => {
    const res = await axios.post(`${API_URL}/auth/logout`, {}, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    if (!res.data?.success) throw new Error('Authenticated logout failed');
  });

  // Re-login patient for subsequent tests
  const loginRes = await axios.post(`${API_URL}/auth/login`, {
    email: patientEmail,
    password: 'Password@123',
  });
  patientToken = loginRes.data.token;

  // ----------------------------------------------------
  // 3. PATIENT WORKFLOWS
  // ----------------------------------------------------
  await test('Get Patient Profile', async () => {
    const res = await axios.get(`${API_URL}/patients/me`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    if (!res.data?.success || !res.data?.patient) throw new Error('Patient profile missing');
    patientId = res.data.patient._id || res.data.patient.id;
  });

  await test('Update Patient Profile', async () => {
    const res = await axios.put(`${API_URL}/patients/me`, {
      phone: '+91-9876500000',
      emergencyContactPhone: '+91-9876511111',
      annualHouseholdIncomeInr: 120000,
    }, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    if (!res.data?.success) throw new Error('Failed to update patient profile');
  });

  await test('Get Friction Fingerprint', async () => {
    const res = await axios.get(`${API_URL}/patients/me/friction`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    if (!res.data?.success || !res.data?.frictionProfile) throw new Error('Friction profile missing');
  });

  await test('Get Accessibility Risk Assessment', async () => {
    const res = await axios.get(`${API_URL}/patients/me/risk`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    if (!res.data?.success) throw new Error('Accessibility risk missing');
  });

  let hospitalId = '';
  await test('List Public Hospitals with Proximity', async () => {
    const res = await axios.get(`${API_URL}/hospitals`);
    const list = res.data?.hospitals || res.data;
    if (!list || list.length === 0) throw new Error('No hospitals returned');
    hospitalId = list[0]._id || list[0].id;
  });

  let appointmentId = '';
  await test('Patient Books OPD Appointment', async () => {
    const res = await axios.post(`${API_URL}/appointments`, {
      hospitalId,
      departmentName: 'General Medicine',
      appointmentDate: new Date(Date.now() + 86400000).toISOString(),
      timeSlot: '10:00 AM - 10:30 AM',
      type: 'OPD',
      reasonForVisit: 'Persistent fever and fatigue',
      symptoms: ['Fever', 'Fatigue'],
      urgencyLevel: 'routine',
    }, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    if (!res.data?.success || !res.data?.appointment) throw new Error('Appointment creation failed');
    appointmentId = res.data.appointment._id || res.data.appointment.id;
  });

  await test('Patient Fetches Their Appointments', async () => {
    const res = await axios.get(`${API_URL}/appointments/my`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    if (!res.data?.success || !Array.isArray(res.data?.appointments)) throw new Error('Failed to fetch my appointments');
  });

  await test('Patient Cancels an Appointment', async () => {
    const res = await axios.put(`${API_URL}/appointments/${appointmentId}/cancel`, {
      cancellationReason: 'Rescheduling for another day',
    }, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    if (!res.data?.success) throw new Error('Appointment cancellation failed');
  });

  await test('Patient Adds Personal Medical Record', async () => {
    const res = await axios.post(`${API_URL}/medical-records`, {
      recordType: 'Prescription',
      diagnosis: 'Seasonal Viral Infection',
      doctorName: 'Dr. R. K. Sharma',
      facilityName: 'Civil Hospital',
      visitDate: new Date().toISOString(),
      prescriptions: [{ medicineName: 'Paracetamol 650mg', dosage: '1 tablet twice daily', duration: '3 days' }],
    }, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    if (!res.data?.success) throw new Error('Failed to add medical record');
  });

  await test('Patient Fetches Their Medical Records', async () => {
    const res = await axios.get(`${API_URL}/medical-records/my`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    if (!res.data?.success || !Array.isArray(res.data?.records)) throw new Error('Failed to get medical records');
  });

  // ----------------------------------------------------
  // 4. DOCTOR WORKFLOWS
  // ----------------------------------------------------
  let doctorToken = '';
  let doctorId = '';
  const doctorEmail = `doc_${Date.now()}@example.com`;

  await test('Doctor Registration', async () => {
    const res = await axios.post(`${API_URL}/auth/register`, {
      name: 'Dr. Harpreet Singh',
      email: doctorEmail,
      password: 'Password@123',
      role: 'doctor',
      phone: '+91-9876543211',
      qualification: 'MBBS, MD',
      specialization: 'Internal Medicine',
      registrationNumber: `MCI-${Math.floor(10000 + Math.random() * 90000)}`,
      hospitalName: 'District Civil Hospital',
    });
    if (!res.data?.success || !res.data?.token) throw new Error('Doctor registration failed');
    doctorToken = res.data.token;
  });

  await test('Doctor Fetches Profile', async () => {
    const res = await axios.get(`${API_URL}/doctor/profile`, {
      headers: { Authorization: `Bearer ${doctorToken}` },
    });
    if (!res.data?.success || !res.data?.doctor) throw new Error('Failed to get doctor profile');
    doctorId = res.data.doctor._id || res.data.doctor.id;
  });

  await test('Doctor Updates Profile', async () => {
    const res = await axios.put(`${API_URL}/doctor/profile`, {
      opdTimings: '09:00 AM - 02:00 PM',
      experienceYears: 12,
      isAvailable: true,
    }, {
      headers: { Authorization: `Bearer ${doctorToken}` },
    });
    if (!res.data?.success) throw new Error('Failed to update doctor profile');
  });

  await test('Doctor Updates Availability Schedule', async () => {
    const res = await axios.put(`${API_URL}/doctor/schedule`, {
      weeklySchedule: [
        { dayOfWeek: 'Monday', startTime: '09:00', endTime: '14:00', slotDurationMinutes: 15, maxPatients: 20 },
        { dayOfWeek: 'Wednesday', startTime: '09:00', endTime: '14:00', slotDurationMinutes: 15, maxPatients: 20 },
      ],
      defaultSlotDurationMinutes: 15,
      maxPatientsPerDay: 25,
    }, {
      headers: { Authorization: `Bearer ${doctorToken}` },
    });
    if (!res.data?.success) throw new Error('Failed to update doctor schedule');
  });

  await test('Doctor Checks Consultation Queue', async () => {
    const res = await axios.get(`${API_URL}/doctor/queue`, {
      headers: { Authorization: `Bearer ${doctorToken}` },
    });
    if (!res.data?.success || !Array.isArray(res.data?.queue)) throw new Error('Failed to fetch doctor queue');
  });

  await test('Doctor Records Clinical Consultation', async () => {
    const res = await axios.post(`${API_URL}/doctor/consultation`, {
      patientId: patientId,
      chiefComplaint: 'Chest tightness and breathlessness on exertion',
      clinicalNotes: 'Vitals stable. BP 130/85. Advised ECG and Lipid profile.',
      diagnosis: 'Atypical Angina / Exertional Dyspnea',
      prescriptions: [
        { medicineName: 'Aspirin 75mg', dosage: 'Once daily after meals', durationDays: 30 },
        { medicineName: 'Atorvastatin 20mg', dosage: 'Once daily at bedtime', durationDays: 30 },
      ],
      labOrders: ['12-Lead ECG', 'Lipid Profile Fasting'],
      referralRequired: false,
      recallDays: 14,
    }, {
      headers: { Authorization: `Bearer ${doctorToken}` },
    });
    if (!res.data?.success) throw new Error('Failed to record doctor consultation');
  });

  await test('Doctor Fetches Clinical Stats', async () => {
    const res = await axios.get(`${API_URL}/doctor/stats`, {
      headers: { Authorization: `Bearer ${doctorToken}` },
    });
    if (!res.data?.success || !res.data?.stats) throw new Error('Failed to get doctor stats');
  });

  // ----------------------------------------------------
  // 5. ASHA WORKER WORKFLOWS
  // ----------------------------------------------------
  let ashaToken = '';
  const ashaEmail = `asha_${Date.now()}@example.com`;

  await test('ASHA Worker Registration', async () => {
    const res = await axios.post(`${API_URL}/auth/register`, {
      name: 'Baljit Kaur',
      email: ashaEmail,
      password: 'Password@123',
      role: 'asha',
      phone: '+91-9876543212',
      district: 'Kapurthala',
      assignedVillage: 'Amer Village',
      primaryHealthCenter: 'Amer PHC',
    });
    if (!res.data?.success || !res.data?.token) throw new Error('ASHA registration failed');
    ashaToken = res.data.token;
  });

  await test('ASHA Worker Fetches Profile', async () => {
    const res = await axios.get(`${API_URL}/asha/profile`, {
      headers: { Authorization: `Bearer ${ashaToken}` },
    });
    if (!res.data?.success || !res.data?.worker) throw new Error('Failed to get ASHA profile');
  });

  await test('ASHA Worker Fetches Assigned Patients', async () => {
    const res = await axios.get(`${API_URL}/asha/patients`, {
      headers: { Authorization: `Bearer ${ashaToken}` },
    });
    if (!res.data?.success || !Array.isArray(res.data?.patients)) throw new Error('Failed to get ASHA patients');
  });

  await test('ASHA Worker Records Household Health Visit', async () => {
    const res = await axios.post(`${API_URL}/asha/visits`, {
      patientId: patientId,
      visitType: 'ROUTINE_CHECKUP',
      householdAddress: 'Amer Village, House 42',
      vitals: { bloodPressure: '120/80', bloodSugar: 110, pulseRate: 74 },
      healthSummary: 'Patient reports mild headache. Advised water intake and salt reduction.',
      flaggedBarriers: ['Transport Availability', 'Language Barrier'],
      followUpNeeded: true,
      followUpDate: new Date(Date.now() + 7 * 86400000).toISOString(),
    }, {
      headers: { Authorization: `Bearer ${ashaToken}` },
    });
    if (!res.data?.success) throw new Error('Failed to record ASHA visit');
  });

  await test('ASHA Worker Records Friction Barriers for Patient', async () => {
    const res = await axios.post(`${API_URL}/asha/barriers`, {
      patientId: patientId,
      barriers: {
        financialConstraint: 'High',
        transportDifficulty: 'Moderate',
        languageBarrier: 'Low',
      },
      notes: 'Patient relies on irregular bus schedule to reach PHC',
    }, {
      headers: { Authorization: `Bearer ${ashaToken}` },
    });
    if (!res.data?.success) throw new Error('Failed to record ASHA barriers');
  });

  await test('ASHA Worker Checks Care Recall Tasks', async () => {
    const res = await axios.get(`${API_URL}/asha/recalls`, {
      headers: { Authorization: `Bearer ${ashaToken}` },
    });
    if (!res.data?.success || !Array.isArray(res.data?.tasks)) throw new Error('Failed to get recall tasks');
  });

  // ----------------------------------------------------
  // 6. HOSPITAL & PHARMACY WORKFLOWS
  // ----------------------------------------------------
  let hospitalToken = '';
  const hospitalEmail = `hosp_${Date.now()}@example.com`;

  await test('Hospital Facility Registration', async () => {
    const res = await axios.post(`${API_URL}/auth/register`, {
      name: 'Guru Nanak Charitable Hospital',
      email: hospitalEmail,
      password: 'Password@123',
      role: 'hospital',
      phone: '+91-9876543214',
      hospitalName: 'Guru Nanak Charitable Hospital',
      type: 'Charitable Trust Hospital',
      city: 'Phagwara',
      address: 'GT Road, Near Sugar Mill',
    });
    if (!res.data?.success || !res.data?.token) throw new Error('Hospital registration failed');
    hospitalToken = res.data.token;
  });

  await test('Hospital Fetches Department Directory', async () => {
    const res = await axios.get(`${API_URL}/hospitals/departments`);
    if (!res.data?.success || !Array.isArray(res.data?.departments)) throw new Error('Failed to get departments');
  });

  await test('Hospital Fetches Pharmacy Medicine Inventory', async () => {
    const res = await axios.get(`${API_URL}/medicines`);
    if (!res.data?.success || !Array.isArray(res.data?.inventory)) throw new Error('Failed to get medicines');
  });

  let medicineId = '';
  await test('Hospital Adds Medicine to Inventory', async () => {
    const res = await axios.post(`${API_URL}/medicines`, {
      hospitalId,
      medicineName: 'Azithromycin 500mg',
      genericName: 'Azithromycin',
      category: 'Antibiotic',
      dosageForm: 'Tablet',
      currentStock: 250,
      minimumThreshold: 50,
      unit: 'strips',
    });
    if (!res.data?.success || !res.data?.item) throw new Error('Failed to add medicine');
    medicineId = res.data.item._id || res.data.item.id;
  });

  await test('Hospital Updates Medicine Stock Level', async () => {
    const res = await axios.patch(`${API_URL}/medicines/${medicineId}/stock`, {
      stockChange: 50,
      reason: 'Batch delivery arrived',
    });
    if (!res.data?.success) throw new Error('Failed to update medicine stock');
  });

  // ----------------------------------------------------
  // 7. GOVERNMENT INTELLIGENCE WORKFLOWS
  // ----------------------------------------------------
  let govToken = '';
  const govEmail = `gov_${Date.now()}@example.com`;

  await test('Government Official Registration', async () => {
    const res = await axios.post(`${API_URL}/auth/register`, {
      name: 'Dr. Surjit Singh',
      email: govEmail,
      password: 'Password@123',
      role: 'government',
      phone: '+91-9876543215',
      officialDesignation: 'Chief Medical Officer',
      department: 'Health & Family Welfare Punjab',
      district: 'Kapurthala',
    });
    if (!res.data?.success || !res.data?.token) throw new Error('Government registration failed');
    govToken = res.data.token;
  });

  await test('Government Fetches District Overview Analytics', async () => {
    const res = await axios.get(`${API_URL}/government/overview`, {
      headers: { Authorization: `Bearer ${govToken}` },
    });
    if (!res.data?.success || !res.data?.metrics) throw new Error('District overview missing');
  });

  await test('Government Fetches Care Leakage Funnel', async () => {
    const res = await axios.get(`${API_URL}/government/leakage-funnel`, {
      headers: { Authorization: `Bearer ${govToken}` },
    });
    if (!res.data?.success || !res.data?.funnel) throw new Error('Care leakage funnel missing');
  });

  await test('Government Fetches Geospatial Friction Heatmap', async () => {
    const res = await axios.get(`${API_URL}/government/friction-heatmap`, {
      headers: { Authorization: `Bearer ${govToken}` },
    });
    if (!res.data?.success || !Array.isArray(res.data?.heatmap)) throw new Error('Friction heatmap missing');
  });

  await test('Government Fetches Population Barriers Breakdown', async () => {
    const res = await axios.get(`${API_URL}/government/barriers`, {
      headers: { Authorization: `Bearer ${govToken}` },
    });
    if (!res.data?.success || !res.data?.barriers) throw new Error('Population barriers missing');
  });

  await test('Government Triggers Resource Allocation Intervention', async () => {
    const res = await axios.post(`${API_URL}/government/allocate-resources`, {
      blockName: 'Amer Rural Block',
      interventionType: 'Mobile Health Unit Dispatch',
      targetAllocation: '2 Ambulances + 1 Mobile Diagnostic Van',
      justification: 'High geographic distance friction identified in recent screening cohort',
    }, {
      headers: { Authorization: `Bearer ${govToken}` },
    });
    if (!res.data?.success) throw new Error('Failed to trigger resource allocation');
  });

  // ----------------------------------------------------
  // 8. ADMIN STATEWIDE GOVERNANCE & TELEMETRY
  // ----------------------------------------------------
  let adminToken = '';
  await test('Admin Authentication', async () => {
    const res = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@pfis.org',
      password: 'Admin@123',
    });
    if (!res.data?.success || !res.data?.token) throw new Error('Admin login failed');
    adminToken = res.data.token;
  });

  await test('Admin Fetches Statewide Dashboard Stats', async () => {
    const res = await axios.get(`${API_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (!res.data?.success || !res.data?.stats) throw new Error('Admin dashboard stats missing');
  });

  await test('Admin Fetches Healthcare Verification Queue', async () => {
    const res = await axios.get(`${API_URL}/admin/verification-queue`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (!res.data?.success || !res.data?.queue) throw new Error('Verification queue missing');
  });

  await test('Admin Approves a Pending Doctor', async () => {
    const res = await axios.post(`${API_URL}/admin/verify/doctor/${doctorId}`, {
      action: 'approve',
    }, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (!res.data?.success) throw new Error('Doctor verification failed');
  });

  await test('Admin Fetches User Management Directory', async () => {
    const res = await axios.get(`${API_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (!res.data?.success || !Array.isArray(res.data?.users)) throw new Error('Failed to fetch user list');
  });

  await test('Admin Fetches Audit Trail Logs', async () => {
    const res = await axios.get(`${API_URL}/admin/audit-logs`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (!res.data?.success || !Array.isArray(res.data?.logs)) throw new Error('Failed to fetch audit logs');
  });

  await test('Admin Fetches Live System Telemetry & Health', async () => {
    const res = await axios.get(`${API_URL}/admin/system-health`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (!res.data?.success || !res.data?.system) throw new Error('System health missing');
  });

  // ----------------------------------------------------
  // SUMMARY
  // ----------------------------------------------------
  console.log('\n====================================================');
  console.log(`TEST SUITE SUMMARY: ${passed + failed} TOTAL TESTS`);
  console.log(`  PASSED: ${passed}`);
  console.log(`  FAILED: ${failed}`);
  console.log('====================================================');

  if (failed > 0) {
    console.log('\nFAILURE DETAILS:');
    failures.forEach((f, i) => {
      console.log(`  ${i + 1}. ${f.test}: ${JSON.stringify(f.error)}`);
    });
    process.exit(1);
  } else {
    console.log('\nALL 34 CRITICAL PFIS PLATFORM FUNCTIONS PASSED WITH 100% SUCCESS!\n');
    process.exit(0);
  }
}

runComprehensiveTests();
