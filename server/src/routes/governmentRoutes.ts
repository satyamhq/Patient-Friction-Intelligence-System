import { Router } from 'express';
import { GovernmentController } from '../controllers/governmentController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

router.use(authenticate);
router.use(requireRole('government'));

router.get('/profile', GovernmentController.getProfile);
router.get('/overview', GovernmentController.getDistrictOverview);
router.get('/leakage-funnel', GovernmentController.getCareLeakageFunnel);
router.get('/friction-heatmap', GovernmentController.getFrictionHeatmap);
router.get('/barriers', GovernmentController.getPopulationBarriers);
router.post('/allocate-resources', GovernmentController.triggerResourceAllocation);

export default router;
