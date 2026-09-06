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

// 5-Layer PFIS Modules
import referralRoutes from './referralRoutes.js';
import triageRoutes from './triageRoutes.js';
import recallRoutes from './recallRoutes.js';
import medicineRoutes from './medicineRoutes.js';
import syncRoutes from './syncRoutes.js';
import abhaRoutes from './abhaRoutes.js';
import doctorRoutes from './doctorRoutes.js';
import ashaRoutes from './ashaRoutes.js';
import governmentRoutes from './governmentRoutes.js';
import appointmentRoutes from './appointmentRoutes.js';
import medicalRecordRoutes from './medicalRecordRoutes.js';

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

// Role-specific portals & 5-Layer PFIS Endpoints
router.use('/referrals', referralRoutes);
router.use('/triage', triageRoutes);
router.use('/recall', recallRoutes);
router.use('/medicines', medicineRoutes);
router.use('/sync', syncRoutes);
router.use('/abha', abhaRoutes);
router.use('/doctor', doctorRoutes);
router.use('/asha', ashaRoutes);
router.use('/government', governmentRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/medical-records', medicalRecordRoutes);

export default router;
