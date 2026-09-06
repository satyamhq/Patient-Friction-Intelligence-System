import { Router } from 'express';
import {
  createReferral,
  getReferrals,
  getReferralById,
  updateReferralStatus,
  counterReferPatient,
} from '../controllers/referralController.js';

const router = Router();

router.post('/', createReferral);
router.get('/', getReferrals);
router.get('/:id', getReferralById);
router.patch('/:id/status', updateReferralStatus);
router.post('/:id/counter-refer', counterReferPatient);

export default router;
