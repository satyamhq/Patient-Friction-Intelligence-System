import { connectDB } from '../database/db.js';
import { runRelationalSeed } from './seedRelational.js';

async function runDemoSeed() {
  console.log('================================================================');
  console.log('  PFIS OPEN-SOURCE DEMO DATA SEEDER                              ');
  console.log('  Generating synthetic cohort & non-clinical barrier profiles    ');
  console.log('================================================================\n');

  try {
    await connectDB();
    await runRelationalSeed();
    console.log('\n[PFIS Demo Seeder] Synthetic demo cohort initialized successfully!');
    console.log('Public demo endpoints ready at: http://localhost:5000/api/demo');
    process.exit(0);
  } catch (error: any) {
    console.error('[PFIS Demo Seeder Error]:', error.message);
    process.exit(1);
  }
}

runDemoSeed();
