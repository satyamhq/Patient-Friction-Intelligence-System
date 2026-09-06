import { Router } from 'express';
import { AshaController } from '../controllers/ashaController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

router.use(authenticate);
router.use(requireRole('asha'));

router.get('/profile', AshaController.getProfile);
router.put('/profile', AshaController.updateProfile);
router.get('/patients', AshaController.getAssignedPatients);
router.post('/patient', AshaController.registerPatient);
router.post('/patients', AshaController.registerPatient);
router.post('/barriers', AshaController.recordBarriers);
router.get('/recalls', AshaController.getRecallTasks);
router.post('/recall/complete', AshaController.completeRecallTask);

// Health Visits
router.post('/visits', AshaController.createHealthVisit);
router.post('/visit', AshaController.createHealthVisit);
router.get('/visits', AshaController.getHealthVisits);
router.get('/visit', AshaController.getHealthVisits);

export default router;
