import { Router } from 'express';
import { DoctorController } from '../controllers/doctorController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

router.use(authenticate);
router.use(requireRole('doctor'));

router.get('/profile', DoctorController.getProfile);
router.put('/profile', DoctorController.updateProfile);
router.get('/queue', DoctorController.getConsultationQueue);
router.get('/patient/:id', DoctorController.getPatientDetail);
router.post('/consultation', DoctorController.recordConsultation);
router.get('/stats', DoctorController.getDoctorStats);

export default router;
