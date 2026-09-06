import { createApp } from './app.js';
import { connectDB } from './config/database.js';
import { config } from './config/env.js';

const startServer = async () => {
  console.log('---------------------------------------------------------');
  console.log('  PATIENT FRICTION INTELLIGENCE SYSTEM (PFIS)');
  console.log('  Non-Clinical Healthcare Accessibility Platform');
  console.log('---------------------------------------------------------');

  await connectDB();

  const app = createApp();

  const server = app.listen(config.port, () => {
    console.log(`[PFIS Server] Running on port http://localhost:${config.port}`);
    console.log(`[PFIS Server] Client URL: ${config.clientUrl}`);
    console.log(`[PFIS Server] Map Status: ${config.googleMapsApiKey ? 'Google Maps API' : 'Demo Map Engine (Haversine & GeoJSON)'}`);
    console.log(`[PFIS Server] Environment: ${config.nodeEnv}`);
  });

  const gracefulShutdown = async (signal: string) => {
    console.log(`[PFIS Server] ${signal} signal received. Closing HTTP server and database pool gracefully...`);
    server.close(async () => {
      console.log('[PFIS Server] HTTP server closed.');
      try {
        const { closeDB } = await import('./config/database.js');
        await closeDB();
        console.log('[PFIS Server] Database connections terminated cleanly.');
      } catch {}
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
};

startServer().catch((err) => {
  console.error('[PFIS Server Fatal Error]', err);
  process.exit(1);
});
