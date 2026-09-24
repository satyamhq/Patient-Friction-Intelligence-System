import { ClinicalTriageEngine } from '../dist/intelligence/triage/clinicalTriageEngine.js';
import { FacilityLoadRouter } from '../dist/intelligence/triage/facilityLoadRouter.js';
import { HighRiskRecallEngine } from '../dist/intelligence/recall/highRiskRecallEngine.js';
import { AbhaService } from '../dist/services/abhaService.js';

console.log('================================================================');
console.log('  PFIS 5-LAYER HEALTHCARE CONTINUITY BACKBONE VERIFICATION');
console.log('================================================================\n');

// Test 1: ABHA Digital Health Card & QR Generation
console.log('[Test 1] Testing ABHA ID & Cryptographic QR Payload Generation...');
const abhaCard = AbhaService.createAbhaCard({
  name: 'Sunita Devi',
  gender: 'female',
  age: 28,
  phone: '9876543210',
  state: 'Jharkhand',
  district: 'Ranchi',
});
console.log('  ✓ Generated ABHA Number:', abhaCard.abhaNumber);
console.log('  ✓ Generated ABHA Address:', abhaCard.abhaAddress);
console.log('  ✓ Signature Hash:', abhaCard.signature.substring(0, 16) + '...');
if (!abhaCard.abhaNumber.includes('-') || !abhaCard.abhaAddress.endsWith('@abdm')) {
  throw new Error('ABHA generation failed format validation');
}

// Test 2: Clinical Triage Engine (Maternal Red Flag)
console.log('\n[Test 2] Testing Clinical Digital Triage (Maternal Pre-eclampsia)...');
const triageResult = ClinicalTriageEngine.evaluateTriage({
  age: 28,
  gender: 'female',
  isPregnant: true,
  gestationalWeeks: 32,
  symptoms: ['severe headache', 'blurred vision', 'pedal edema'],
  vitalSigns: { systolicBP: 165, diastolicBP: 110 },
  chiefComplaint: 'Severe headache with high blood pressure at 32 weeks',
});
console.log('  ✓ Urgency Classification:', triageResult.urgency);
console.log('  ✓ Recommended Facility Level:', triageResult.recommendedFacilityLevel);
console.log('  ✓ Actionable Steps:', triageResult.actionableSteps[0]);
if (triageResult.urgency !== 'EMERGENCY_108') {
  throw new Error('Triage failed to classify maternal pre-eclampsia as EMERGENCY_108');
}

// Test 3: Facility Capability & Load Router
console.log('\n[Test 3] Testing Facility Capability & Load Router...');
const demoFacilities = [
  {
    id: 'fac-sub-angara',
    name: 'Angara Sub-Centre',
    type: 'Sub-Centre',
    distanceKm: 2.1,
    travelMinutes: 10,
    opdQueueCount: 4,
    maxDailyCapacity: 25,
    doctorsOnDuty: 1,
    hasEmergencyBeds: false,
    hasTeleconsultationHub: true,
    availableBeds: 2,
    ambulanceAvailable: false,
  },
  {
    id: 'fac-dh-ranchi',
    name: 'Ranchi District Hospital',
    type: 'District Hospital',
    distanceKm: 38.5,
    travelMinutes: 70,
    opdQueueCount: 110,
    maxDailyCapacity: 400,
    doctorsOnDuty: 18,
    hasEmergencyBeds: true,
    hasTeleconsultationHub: true,
    availableBeds: 120,
    ambulanceAvailable: true,
  },
];
const route = FacilityLoadRouter.routePatient(triageResult.urgency, { latitude: 23.36, longitude: 85.33 }, demoFacilities, false);
console.log('  ✓ Routed Facility:', route.selectedFacility.name);
console.log('  ✓ Routing Rationale:', route.routingRationale);
if (route.selectedFacility.type !== 'District Hospital') {
  throw new Error('Routing failed to dispatch emergency patient to District Hospital');
}

// Test 4: High-Risk Defaulter Recall Engine (MVP Flow 3)
console.log('\n[Test 4] Testing High-Risk Defaulter Recall & Closure Loop...');
const scanResult = HighRiskRecallEngine.runRecallEvaluation();
console.log('  ✓ Cohort Scanned:', scanResult.scannedCount, 'patients');
console.log('  ✓ Active Defaulters Detected:', scanResult.openTasks.length);
const openSunitaTask = scanResult.openTasks.find((t) => t.patientName === 'Sunita Devi');
if (!openSunitaTask) {
  throw new Error('Failed to detect Sunita Devi 3rd ANC overdue milestone');
}
console.log('  ✓ Detected Defaulter Milestone:', openSunitaTask.missedMilestone);
console.log('  ✓ Days Overdue:', openSunitaTask.daysOverdue);

// Close loop
const resolved = HighRiskRecallEngine.resolveTask(openSunitaTask.id, 'RESOLVED_REBOOKED', 'Home visit conducted by ASHA. Rebooked for PHC.');
console.log('  ✓ Care Loop Closed Status:', resolved.status);
if (resolved.status !== 'RESOLVED_REBOOKED') {
  throw new Error('Failed to resolve ASHA recall task');
}

console.log('\n================================================================');
console.log('  ALL 4 CORE ENGINE VERIFICATION SUITES PASSED (100%)');
console.log('================================================================');
