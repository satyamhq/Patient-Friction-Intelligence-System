import { Router } from 'express';
import { MedicalRecordController } from '../controllers/medicalRecordController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.post('/', MedicalRecordController.createRecord);
router.get('/my', MedicalRecordController.getMyRecords);
router.get('/patient/:patientId', MedicalRecordController.getPatientRecords);
router.get('/:id', MedicalRecordController.getRecordById);

export default router;
