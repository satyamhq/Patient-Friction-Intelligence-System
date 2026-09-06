import { Router } from 'express';
import { evaluateTriage, getPublicFacilities } from '../controllers/triageController.js';

const router = Router();

router.post('/evaluate', evaluateTriage);
router.get('/facilities', getPublicFacilities);

export default router;
