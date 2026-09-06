import { Router } from 'express';
import { ConsentController } from '../controllers/consentController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

router.use(authenticate);

router.post('/', requireRole('patient'), ConsentController.createConsent);
router.get('/', requireRole('patient'), ConsentController.getPatientConsents);
router.patch('/:id/revoke', requireRole('patient'), ConsentController.revokeConsent);

export default router;
