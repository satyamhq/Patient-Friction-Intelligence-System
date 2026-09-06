import { Router } from 'express';
import { AshaController } from '../controllers/ashaController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

router.use(authenticate);
router.use(requireRole('asha'));

router.get('/profile', AshaController.getProfile);
router.get('/patients', AshaController.getAssignedPatients);
router.post('/patient', AshaController.registerPatient);
router.post('/barriers', AshaController.recordBarriers);
router.get('/recalls', AshaController.getRecallTasks);
router.post('/recall/complete', AshaController.completeRecallTask);

export default router;
