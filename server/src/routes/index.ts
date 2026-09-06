import { Router } from 'express';
import authRoutes from './authRoutes.js';
import patientRoutes from './patientRoutes.js';
import hospitalRoutes from './hospitalRoutes.js';
import requestRoutes from './requestRoutes.js';
import consentRoutes from './consentRoutes.js';
import documentRoutes from './documentRoutes.js';
import simulationRoutes from './simulationRoutes.js';
import interventionRoutes from './interventionRoutes.js';
import adminRoutes from './adminRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import languageRoutes from './languageRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/patients', patientRoutes);
router.use('/hospitals', hospitalRoutes);
router.use('/requests', requestRoutes);
router.use('/consents', consentRoutes);
router.use('/documents', documentRoutes);
router.use('/simulation', simulationRoutes);
router.use('/simulations', simulationRoutes);
router.use('/interventions', interventionRoutes);
router.use('/admin', adminRoutes);
router.use('/notifications', notificationRoutes);
router.use('/languages', languageRoutes);

export default router;
