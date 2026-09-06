import { Router } from 'express';
import { SimulationController } from '../controllers/simulationController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/catalog', SimulationController.getCatalog);
router.get('/cohort-stats', SimulationController.getCohortStats);
router.get('/patients', SimulationController.getCohortPatients);
router.get('/patients/:id', SimulationController.getPatientDigitalTwin);
router.post('/', authenticate, SimulationController.runSimulation);
router.post('/run', authenticate, SimulationController.runSimulation);
router.get('/saved', authenticate, SimulationController.getSavedSimulations);

export default router;
