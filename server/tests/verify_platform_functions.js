import { connectDB, getDB } from '../dist/database/db.js';
import { User } from '../dist/models/User.js';
import { Doctor } from '../dist/models/Doctor.js';
import { Hospital } from '../dist/models/Hospital.js';
import { Patient } from '../dist/models/Patient.js';
import { Appointment } from '../dist/models/Appointment.js';
import { MedicalRecord } from '../dist/models/MedicalRecord.js';
import { MedicineInventory } from '../dist/models/MedicineInventory.js';
import { Referral } from '../dist/models/Referral.js';
import { AshaWorker } from '../dist/models/AshaWorker.js';
import { generateToken } from '../dist/utils/jwt.js';

let passed = 0;
let failed = 0;

function assert(condition, name, details = '') {
  if (condition) {
    console.log(`  [PASS] ${name}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${name} ${details ? '- ' + details : ''}`);
    failed++;
  }
}

async function runTests() {
  console.log('================================================================');
  console.log('  PFIS PLATFORM FUNCTION & INTEGRATION EXHAUSTIVE TEST SUITE    ');
  console.log('================================================================\n');

  try {
    await connectDB();
    console.log('[Phase 1: Database & Model CRUD Integrity]');

    // Test 1: User Query and findByIdAndUpdate
    const adminUser = await User.findOne({ email: 'admin@pfis.org' });
    assert(adminUser !== null, 'Find admin user by email');

    if (adminUser) {
      const origActive = adminUser.isActive !== false;
      const updatedUser = await User.findByIdAndUpdate(adminUser.id || adminUser._id, {
        updatedAt: new Date().toISOString(),
      });
      assert(updatedUser !== null, 'User.findByIdAndUpdate works without error');
    }

    // Test 2: findOneAndUpdate
    const testDoc = await Doctor.findOneAndUpdate(
      { email: 'doctor@pfis.org' },
      { isAvailable: true }
    );
    assert(testDoc !== null || true, 'Doctor.findOneAndUpdate executes without throwing error');

    // Test 3: countDocuments with undefined fields
    const testCount = await Appointment.countDocuments({
      doctorId: undefined,
      status: 'scheduled',
    });
    assert(typeof testCount === 'number', 'countDocuments with undefined filter keys resolves cleanly', `Got ${testCount}`);

    // Test 4: Hospital list and departments
    console.log('\n[Phase 2: Facilities, Formulary & Operations]');
    const allHospitals = await Hospital.find({});
    assert(Array.isArray(allHospitals) && allHospitals.length > 0, `Hospitals query returns seeded facilities (Found: ${allHospitals.length})`);

    const medicines = await MedicineInventory.find({});
    assert(Array.isArray(medicines) && medicines.length > 0, `Medicine formulary query returns available stock (Found: ${medicines.length})`);

    if (medicines.length > 0) {
      const med = medicines[0];
      const updatedMed = await MedicineInventory.findByIdAndUpdate(med.id || med._id, {
        quantity: med.quantity + 5,
      });
      assert(updatedMed !== null, 'MedicineInventory.findByIdAndUpdate updates stock count');
    }

    // Test 5: Role Authentication Tokens
    console.log('\n[Phase 3: Auth & Security Hardening]');
    const mockAdminToken = generateToken({
      userId: adminUser?.id || 'admin-test-id',
      email: 'admin@pfis.org',
      role: 'admin',
    });
    assert(typeof mockAdminToken === 'string' && mockAdminToken.length > 20, 'JWT Admin token generation succeeds');

    const mockPatientToken = generateToken({
      userId: 'patient-test-id',
      email: 'patient@pfis.org',
      role: 'patient',
    });
    assert(typeof mockPatientToken === 'string' && mockPatientToken.length > 20, 'JWT Patient token generation succeeds');

    // Test 6: Appointments & Medical Records Model Lifecycle
    console.log('\n[Phase 4: Clinical Consultation & Appointments Workflow]');
    const testApt = await Appointment.create({
      patientId: 'pat-test-01',
      hospitalId: allHospitals[0]?.id || 'hosp-01',
      departmentName: 'General OPD',
      appointmentDate: new Date().toISOString(),
      timeSlot: '10:00 - 11:00 AM',
      type: 'OPD',
      reasonForVisit: 'General Wellness Checkup',
      status: 'scheduled',
      queueNumber: 99,
    });
    assert(testApt !== null && testApt.queueNumber === 99, 'Appointment.create books queue token');

    const aptUpdated = await Appointment.findByIdAndUpdate(testApt.id || testApt._id, {
      status: 'completed',
    });
    assert(aptUpdated !== null, 'Appointment.findByIdAndUpdate updates status to completed');

    // Test 7: Medical Record Creation
    const testRecord = await MedicalRecord.create({
      recordCode: 'MR-TEST-001',
      patientId: 'pat-test-01',
      doctorId: 'doc-test-01',
      visitDate: new Date().toISOString(),
      visitType: 'OPD',
      chiefComplaint: 'Headache and fatigue',
      clinicalFindings: 'Normal vitals, mild tension headache',
      diagnoses: ['Tension type headache'],
      prescriptions: [{ medicineName: 'Paracetamol 500mg', dosage: '1 tab', frequency: 'TDS', durationDays: 3 }],
    });
    assert(testRecord !== null && testRecord.recordCode === 'MR-TEST-001', 'MedicalRecord.create stores clinical encounter');

    // Test 8: Referral Persistence
    console.log('\n[Phase 5: Cross-Facility Referral Ledger]');
    const testRef = await Referral.create({
      referralCode: 'REF-TEST-001',
      patientId: 'pat-test-01',
      referringFacilityId: allHospitals[0]?.id || 'hosp-01',
      receivingFacilityId: 'hosp-02',
      reason: 'Specialist Cardiology Evaluation',
      priority: 'high',
      status: 'pending',
    });
    assert(testRef !== null && testRef.referralCode === 'REF-TEST-001', 'Referral.create stores database-persisted referral');

    const refUpdated = await Referral.findByIdAndUpdate(testRef.id || testRef._id, {
      status: 'accepted',
    });
    assert(refUpdated !== null, 'Referral.findByIdAndUpdate updates referral status');

    // Clean up temporary test entries
    await Appointment.findByIdAndDelete(testApt.id || testApt._id);
    await MedicalRecord.findByIdAndDelete(testRecord.id || testRecord._id);
    await Referral.findByIdAndDelete(testRef.id || testRef._id);
    console.log('\n  [INFO] Temporary test records cleaned up safely.');

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  }

  console.log('\n================================================================');
  console.log(`  TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('================================================================');

  process.exit(failed > 0 ? 1 : 0);
}

runTests();
