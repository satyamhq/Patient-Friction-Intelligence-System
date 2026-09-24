import { FrictionEngine } from '../dist/intelligence/friction/frictionEngine.js';
import { FrictionInteractionEngine } from '../dist/intelligence/causal/frictionInteractionEngine.js';
import { CareLeakageEngine } from '../dist/intelligence/leakage/careLeakageEngine.js';
import { BarrierAttributionEngine } from '../dist/intelligence/attribution/barrierAttributionEngine.js';
import { PatientDigitalTwinEngine } from '../dist/intelligence/digitalTwin/patientDigitalTwinEngine.js';
import { InterventionOptimizer } from '../dist/intelligence/optimization/interventionOptimizer.js';
import { DeterministicAIProvider } from '../dist/providers/ai/DeterministicAIProvider.js';
import { OpenStreetMapProvider } from '../dist/providers/maps/OpenStreetMapProvider.js';
import { LocalStorageProvider } from '../dist/providers/storage/LocalStorageProvider.js';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    console.log(`  [PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`  [FAIL] ${testName} ${details ? '(' + details + ')' : ''}`);
    failedTests++;
  }
}

async function runTestSuite() {
  console.log('================================================================');
  console.log('  PFIS INTELLIGENCE ENGINE & PROVIDER DETERMINISTIC TEST SUITE   ');
  console.log('================================================================\n');

  // Suite 1: Friction Engine Calculations
  console.log('[Suite 1: Friction Engine & Haversine Distance]');
  const dist = FrictionEngine.calculateHaversineDistance(28.6139, 77.2090, 28.7041, 77.1025);
  assert(dist > 10 && dist < 25, `Haversine distance between Delhi coordinates valid (${dist.toFixed(2)} km)`);

  const mockPatient = {
    location: { coordinates: [77.2090, 28.6139], city: 'Delhi' },
    transportMode: 'public',
    preferredLanguage: 'Hindi',
    monthlyHouseholdIncome: 12000,
    hasSmartphone: false,
    hasAbhaNumber: true,
  };
  const mockHospital = {
    location: { coordinates: [77.1025, 28.7041] },
    supportedLanguages: ['Hindi', 'English'],
  };
  const evalResult = FrictionEngine.calculate(mockPatient, mockHospital);
  assert(evalResult.overallFrictionScore >= 0 && evalResult.overallFrictionScore <= 100,
    `Overall friction score bounded [0-100] (Got: ${evalResult.overallFrictionScore})`);
  assert(Boolean(evalResult.travel && evalResult.transport && evalResult.cost),
    'Friction evaluation includes comprehensive multi-dimensional factors');

  // Suite 2: Friction Interaction Synergies
  console.log('\n[Suite 2: Friction Interaction & Compounding Synergies]');
  const interactions = FrictionInteractionEngine.detectInteractions({
    travel: { dimension: 'Travel', score: 65, weight: 0.2, level: 'HIGH', reason: '' },
    transport: { dimension: 'Transport', score: 70, weight: 0.2, level: 'HIGH', reason: '' },
    digitalAccess: { dimension: 'Digital', score: 60, weight: 0.15, level: 'HIGH', reason: '' },
    language: { dimension: 'Language', score: 60, weight: 0.1, level: 'HIGH', reason: '' },
    familySupport: { dimension: 'Support', score: 40, weight: 0.1, level: 'MEDIUM', reason: '' },
    documentation: { dimension: 'Docs', score: 55, weight: 0.1, level: 'HIGH', reason: '' },
    cost: { dimension: 'Cost', score: 65, weight: 0.15, level: 'HIGH', reason: '' },
    appointmentTiming: { dimension: 'Timing', score: 40, weight: 0.1, level: 'MEDIUM', reason: '' },
  });
  assert(interactions.length >= 2, `Synergy detector identified compounding barrier pairs (Found: ${interactions.length})`);
  assert(interactions.some(i => i.primaryDimension === 'Transport' && i.secondaryDimension === 'Travel Distance'),
    'Detected critical Transport + Travel Distance non-linear interaction');

  // Suite 3: Care Leakage Funnel
  console.log('\n[Suite 3: Care Leakage 5-Stage Funnel Transition]');
  const funnel = CareLeakageEngine.calculateFunnel(1000, {
    transportFriction: 60,
    costFriction: 55,
    digitalFriction: 45,
  });
  assert(funnel.stages.length === 5, 'Funnel models all 5 care journey stages (Referral to Follow-up)');
  assert(funnel.overallJourneyCompletionRate > 15 && funnel.overallJourneyCompletionRate < 70,
    `Care completion rate matches realistic public health baseline (${funnel.overallJourneyCompletionRate}%)`);
  assert(funnel.stages[0].patientsEntered === 1000, 'Cohort starts with 1,000 initial referrals');
  assert(funnel.stages[4].patientsCompleted < 1000, 'Funnel captures dropouts before treatment completion');

  // Suite 4: Barrier Attribution & Explainability
  console.log('\n[Suite 4: Barrier Attribution & Explainable Breakdown]');
  const attribution = BarrierAttributionEngine.calculateAttribution([
    { name: 'Rural Transit', category: 'transport', rawScore: 80, weight: 0.25 },
    { name: 'Travel Distance', category: 'distance', rawScore: 70, weight: 0.20 },
    { name: 'Diagnostic Cost', category: 'cost', rawScore: 60, weight: 0.20 },
    { name: 'Digital Portal', category: 'digital', rawScore: 40, weight: 0.15 },
    { name: 'Scheme Docs', category: 'documentation', rawScore: 30, weight: 0.10 },
    { name: 'Language Match', category: 'language', rawScore: 20, weight: 0.10 },
  ]);
  assert(attribution.overallFrictionScore > 0, `Attribution score calculated (${attribution.overallFrictionScore}/100)`);
  assert(attribution.dominantBarrier === 'Rural Transit', `Dominant barrier accurately identified (${attribution.dominantBarrier})`);
  assert(attribution.explainabilityNarrative.includes('Rural Transit'), 'Explainability narrative includes dominant barrier');
  const sumPercent = attribution.attributionBreakdown.reduce((sum, b) => sum + b.percentageOfFriction, 0);
  assert(sumPercent >= 97 && sumPercent <= 103, `Attribution percentages sum to ~100% (Sum: ${sumPercent}%)`);

  // Suite 5: Patient Digital Twin & Simulation
  console.log('\n[Suite 5: Parameterized Patient Digital Twin]');
  const twin = PatientDigitalTwinEngine.simulate({
    distanceKm: 32,
    transportAvailability: 20,
    costBurden: 70,
    digitalLiteracy: 30,
    languageBarrier: 40,
    familySupport: 40,
    documentationReady: 50,
    appointmentTiming: 25,
  });
  assert(twin.baselineFrictionScore >= 60, `High barrier parameters produce high baseline friction (${twin.baselineFrictionScore}/100)`);
  assert(twin.simulatedScenarios.length === 3, 'Simulates standard 3 intervention scenarios');
  assert(twin.simulatedScenarios[0].projectedCompletionProbability > twin.baselineCompletionProbability,
    'Intervention scenario 1 boosts care completion probability');
  assert(twin.simulatedScenarios[2].projectedCompletionProbability > twin.simulatedScenarios[0].projectedCompletionProbability,
    'Multi-modal package yields highest completion gain');

  // Suite 6: Knapsack Intervention Optimizer
  console.log('\n[Suite 6: Budget-Constrained Intervention Optimizer]');
  const opt = InterventionOptimizer.optimize(200000, 38, 1000);
  assert(opt.selectedInterventions.length > 0, `Optimizer selected ${opt.selectedInterventions.length} interventions`);
  assert(opt.totalAllocatedCostINR <= 200000, `Selected interventions respect budget constraint (Allocated: ${opt.totalAllocatedCostINR} INR)`);
  assert(opt.projectedOptimizedProbability > opt.projectedBaselineProbability,
    `Optimized care completion exceeds baseline (${opt.projectedOptimizedProbability}% vs ${opt.projectedBaselineProbability}%)`);

  // Suite 7: Deterministic AI Provider
  console.log('\n[Suite 7: Deterministic AI Provider (Zero Cloud Dependency)]');
  const ai = new DeterministicAIProvider();
  assert(await ai.isAvailable() === true, 'Deterministic AI is 100% available without network');
  const aiExplanation = await ai.explainFriction({
    overallScore: 68,
    factors: [
      { name: 'Rural Transit', score: 85, weight: 0.35 },
      { name: 'Out-of-Pocket Fee', score: 65, weight: 0.35 },
      { name: 'Digital Portal', score: 50, weight: 0.30 },
    ],
  });
  assert(aiExplanation.provider === 'deterministic', 'AI Provider identified as deterministic');
  assert(aiExplanation.recommendedInterventions.length >= 2, 'Generated actionable non-clinical interventions');

  // Suite 8: OpenStreetMap Provider Fallback
  console.log('\n[Suite 8: OpenStreetMap Provider Haversine]');
  const osm = new OpenStreetMapProvider();
  const osmDist = await osm.calculateDistance(31.3260, 75.5762, 31.6340, 74.8723);
  assert(osmDist.provider === 'openstreetmap', 'OSM Provider calculates distance locally');
  assert(osmDist.distanceKm > 50 && osmDist.distanceKm < 100, `Haversine distance accurate (${osmDist.distanceKm} km)`);

  // Suite 9: Local Storage Provider
  console.log('\n[Suite 9: Local Storage Provider]');
  const storage = new LocalStorageProvider();
  const sampleData = Buffer.from('PFIS Synthetic Data Test Content');
  const upload = await storage.saveFile('test_record.txt', sampleData, 'text/plain');
  assert(upload.provider === 'local', 'Storage provider saves to local filesystem');
  const retrieved = await storage.getFile(upload.key);
  assert(retrieved !== null && retrieved.toString() === 'PFIS Synthetic Data Test Content',
    'Local file accurately persisted and retrieved');
  await storage.deleteFile(upload.key);

  console.log('\n================================================================');
  console.log(`  TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED (TOTAL: ${totalTests})`);
  console.log('================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Unhandled Test Suite Error:', err);
  process.exit(1);
});
