import { Router } from 'express';
import { DemoController } from '../controllers/demoController.js';

const router = Router();

// Public, unauthenticated exploration routes
router.get('/overview', DemoController.getDemoOverview);
router.post('/simulate', DemoController.runSimulation);
router.get('/patients', DemoController.getSyntheticPatients);
router.get('/patients/:id', DemoController.getSyntheticPatientDetail);
router.get('/leakage', DemoController.getCareLeakage);
router.get('/map', DemoController.getPopulationMap);
router.get('/interventions', DemoController.getInterventions);
router.get('/dataset', DemoController.getSyntheticDataset);
router.post('/reset', DemoController.resetDemo);

export default router;
