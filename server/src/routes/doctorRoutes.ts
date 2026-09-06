import { Router } from 'express';
import { DoctorController } from '../controllers/doctorController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

router.use(authenticate);
router.use(requireRole('doctor'));

router.get('/profile', DoctorController.getProfile);
router.post('/profile', DoctorController.createProfile);
router.put('/profile', DoctorController.updateProfile);
router.get('/appointments', DoctorController.getAppointments);
router.get('/schedule', DoctorController.getSchedule);
router.put('/schedule', DoctorController.updateSchedule);
router.get('/queue', DoctorController.getConsultationQueue);
router.get('/patient/:id', DoctorController.getPatientDetail);
router.post('/consultation', DoctorController.recordConsultation);
router.get('/stats', DoctorController.getDoctorStats);

export default router;
