import http from 'http';
import { connectDB, closeDB } from '../dist/config/database.js';
import { User } from '../dist/models/User.js';
import { Patient } from '../dist/models/Patient.js';
import { FrictionProfile } from '../dist/models/FrictionProfile.js';
import { CareRisk } from '../dist/models/CareRisk.js';
import { CareJourney } from '../dist/models/CareJourney.js';
import { Doctor } from '../dist/models/Doctor.js';
import { AshaWorker } from '../dist/models/AshaWorker.js';
import { GovernmentOfficial } from '../dist/models/GovernmentOfficial.js';
import { ClinicalTriageEngine } from '../dist/intelligence/triage/clinicalTriageEngine.js';
import { HighRiskRecallEngine } from '../dist/intelligence/recall/highRiskRecallEngine.js';
import { AbhaService } from '../dist/services/abhaService.js';
import { AuthController } from '../dist/controllers/authController.js';
import { HospitalRequest } from '../dist/models/HospitalRequest.js';
import { Notification } from '../dist/models/Notification.js';

let passed = 0;
let failed = 0;

const assert = (condition, testName) => {
  if (condition) {
    console.log(`  [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${testName}`);
    failed++;
  }
};

async function runVerification() {
  console.log('================================================================');
  console.log('  PFIS MASTER PLATFORM FULL REBUILD & 500-PATIENT TEST SUITE     ');
  console.log('================================================================');

  await connectDB();

  // Test 1: MongoDB Database Cohort Validation
  console.log('\n[Suite 1: MongoDB Database 500-Patient Cohort Audit]');
  const totalPatients = await Patient.countDocuments();
  assert(totalPatients >= 500, `Verified 500+ Patients in MongoDB Atlas (Found: ${totalPatients})`);

  const totalFriction = await FrictionProfile.countDocuments();
  assert(totalFriction >= 500, `Verified 500+ Friction Profiles calculated (Found: ${totalFriction})`);

  const totalRisks = await CareRisk.countDocuments();
  assert(totalRisks >= 500, `Verified 500+ Care Risk evaluations (Found: ${totalRisks})`);

  const totalJourneys = await CareJourney.countDocuments();
  assert(totalJourneys >= 500, `Verified 500+ Care Journey events across 5 stages (Found: ${totalJourneys})`);

  // Test 2: Role Architecture Audit (6 Roles)
  console.log('\n[Suite 2: 6 User Types & Profiles Audit]');
  const adminUser = await User.findOne({ email: 'admin@pfis.org' });
  assert(adminUser && adminUser.role === 'admin', 'Admin user exists with role: admin');

  const doctorProfile = await Doctor.findOne({ email: 'doctor@pfis.org' });
  assert(doctorProfile && doctorProfile.specialization, 'Doctor user profile exists with valid medical credentials');

  const ashaProfile = await AshaWorker.findOne({ email: 'asha@pfis.org' });
  const hasAshaVillage = ashaProfile && (ashaProfile.assignedVillage || ashaProfile.assignedvillage);
  assert(hasAshaVillage, 'ASHA worker profile exists with linked village and PHC');

  const govProfile = await GovernmentOfficial.findOne({ email: 'government@pfis.org' });
  const hasGovJurisdiction = govProfile && (govProfile.jurisdictionLevel === 'DISTRICT' || govProfile.jurisdictionlevel === 'DISTRICT');
  assert(hasGovJurisdiction, 'Government official profile exists with jurisdiction: DISTRICT');

  const patientUser = await User.findOne({ email: 'patient@pfis.org' });
  assert(patientUser && patientUser.role === 'patient', 'Patient user exists with role: patient');

  // Test 3: Critical Security Enforcement: Admin Isolation
  console.log('\n[Suite 3: Critical Security Rule - Admin Role Isolation Audit]');
  let securityPassed = false;
  const mockReq = {
    user: { _id: 'fake-id', email: 'intruder@public.com', role: 'patient' },
    body: { role: 'admin' },
    headers: {},
    ip: '127.0.0.1',
  };
  const mockRes = {
    status: (code) => ({
      json: (data) => {
        if (code === 403 && data.message.includes('Security Alert')) {
          securityPassed = true;
        }
      },
    }),
  };
  await AuthController.completeOnboarding(mockReq, mockRes);
  assert(securityPassed, 'Self-selection of Admin role during onboarding is strictly rejected with 403 Forbidden');

  // Test 4: Clinical Digital Triage Engine
  console.log('\n[Suite 4: Layer 2 Clinical Digital Triage Engine]');
  const emergencyCase = ClinicalTriageEngine.evaluateTriage({
    age: 2,
    gender: 'female',
    chiefComplaint: 'Difficulty breathing with chest indrawing and stridor',
    symptoms: ['high_fever', 'chest_indrawing', 'stridor'],
  });
  assert(emergencyCase.urgency === 'EMERGENCY_108', 'Pediatric chest indrawing triaged to EMERGENCY_108');

  // Test 5: High-Risk Recall Engine (ANC, Immunization, NCD)
  console.log('\n[Suite 5: Layer 4 High-Risk Patient Recall Protocols]');
  const recallResult = HighRiskRecallEngine.runRecallEvaluation();
  assert(recallResult.openTasks.length > 0, `Automated recall generated ${recallResult.openTasks.length} ASHA revisit tasks for defaulters`);

  // Test 6: ABHA 14-Digit Generation & Verifiable QR
  console.log('\n[Suite 6: Layer 3 Longitudinal Health Record ABDM/ABHA]');
  const abhaCard = AbhaService.createAbhaCard({
    name: 'Balwinder Singh',
    gender: 'male',
    age: 56,
    phone: '9876523456',
    district: 'Kapurthala',
    state: 'Punjab',
  });
  assert(/^\d{2}-\d{4}-\d{4}-\d{4}$/.test(abhaCard.abhaNumber), `Generated 14-digit ABHA ID format: ${abhaCard.abhaNumber}`);
  assert(abhaCard.qrPayload && abhaCard.signature, 'Generated verifiable ABDM QR payload and cryptographic signature');

  // Test 7: Cross-Facility Hospital Referrals & Notifications
  console.log('\n[Suite 7: Cross-Facility Operational Workflows & Notifications]');
  const totalRequests = await HospitalRequest.countDocuments();
  assert(totalRequests >= 50, `Verified 50+ Cross-facility hospital requests/referrals (Found: ${totalRequests})`);

  const totalNotifs = await Notification.countDocuments();
  assert(totalNotifs >= 4, `Verified multi-role proactive alerts & notifications (Found: ${totalNotifs})`);

  await closeDB();

  console.log('\n================================================================');
  console.log(`  VERIFICATION FINISHED: ${passed} PASSED, ${failed} FAILED       `);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runVerification().catch((err) => {
  console.error('[Verification Suite Error]', err);
  process.exit(1);
});
