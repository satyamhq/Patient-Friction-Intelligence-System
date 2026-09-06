import { Router } from 'express';
import { AdminController } from '../controllers/adminController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

router.use(authenticate, requireRole('admin'));

// Dashboard & Analytics
router.get('/dashboard', AdminController.getDashboardStats);
router.get('/friction-map', AdminController.getPopulationFrictionMap);
router.get('/care-leakage', AdminController.getCareLeakage);
router.get('/care-failure', AdminController.getWhyCareFailed);
router.get('/system-health', AdminController.getSystemHealth);

// Patients & Hospitals Management
router.get('/patients', AdminController.getAllPatients);
router.get('/hospitals', AdminController.getAllHospitals);
router.post('/hospitals', AdminController.createHospital);
router.put('/hospitals/:id', AdminController.updateHospital);
router.delete('/hospitals/:id', AdminController.deleteHospital);

// User Management
router.get('/users', AdminController.getAllUsers);
router.put('/users/:id/status', AdminController.updateUserStatus);
router.put('/users/:id/role', AdminController.changeUserRole);

// Verification Queue
router.get('/verification-queue', AdminController.getVerificationQueue);
router.post('/verify/:entityType/:id', AdminController.verifyEntity);

// Audit Logs
router.get('/audit-logs', AdminController.getAuditLogs);

export default router;
