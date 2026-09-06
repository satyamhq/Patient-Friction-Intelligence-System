import { Router } from 'express';
import { PatientController } from '../controllers/patientController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/me', requireRole('patient', 'admin'), PatientController.getMe);
router.post('/me', requireRole('patient', 'admin'), PatientController.createProfile);
router.put('/me', requireRole('patient', 'admin'), PatientController.updateProfile);
router.post('/profile', requireRole('patient', 'admin'), PatientController.createProfile);
router.get('/history', requireRole('patient', 'admin'), PatientController.getMedicalHistory);
router.get('/medical-history', requireRole('patient', 'admin'), PatientController.getMedicalHistory);
router.post('/record', requireRole('patient', 'admin'), PatientController.addHealthRecord);
router.get('/me/friction', requireRole('patient', 'admin'), PatientController.getFrictionProfile);
router.get('/friction', requireRole('patient', 'admin'), PatientController.getFrictionProfile);
router.get('/friction-profile', requireRole('patient', 'admin'), PatientController.getFrictionProfile);
router.get('/me/risk', requireRole('patient', 'admin'), PatientController.getAccessibilityRisk);
router.get('/risk', requireRole('patient', 'admin'), PatientController.getAccessibilityRisk);
router.get('/accessibility-risk', requireRole('patient', 'admin'), PatientController.getAccessibilityRisk);
router.get('/me/journey', requireRole('patient', 'admin'), PatientController.getCareJourney);
router.get('/journey', requireRole('patient', 'admin'), PatientController.getCareJourney);
router.get('/care-journey', requireRole('patient', 'admin'), PatientController.getCareJourney);

export default router;
