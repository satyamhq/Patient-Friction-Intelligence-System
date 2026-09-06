import { Router } from 'express';
import { AppointmentController } from '../controllers/appointmentController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.post('/', AppointmentController.createAppointment);
router.get('/', AppointmentController.getMyAppointments);
router.get('/queue/today', AppointmentController.getTodayQueue);
router.patch('/:id/status', AppointmentController.updateStatus);

export default router;
