import fs from 'fs';
import path from 'path';

async function resetDemoData() {
  console.log('[PFIS Reset] Resetting local demo dataset to clean state...');
  const jsonPath = path.resolve(process.cwd(), 'data', 'pfis_relational.json');
  try {
    if (fs.existsSync(jsonPath)) {
      fs.unlinkSync(jsonPath);
      console.log('[PFIS Reset] Removed previous relational state cache.');
    }
  } catch (err: any) {
    console.warn('[PFIS Reset] Notice while removing cache:', err.message);
  }

  // Re-run seed
  const { runRelationalSeed } = await import('./seedRelational.js');
  const { connectDB } = await import('../database/db.js');
  await connectDB();
  await runRelationalSeed();
  console.log('[PFIS Reset] Demo dataset successfully restored to baseline state.');
  process.exit(0);
}

resetDemoData().catch((err) => {
  console.error('[PFIS Reset Error]:', err.message);
  process.exit(1);
});
