import { Router } from 'express';
import { AppointmentController } from '../controllers/appointmentController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.post('/', AppointmentController.createAppointment);
router.get('/', AppointmentController.getMyAppointments);
router.get('/my', AppointmentController.getMyAppointments);
router.get('/queue/today', AppointmentController.getTodayQueue);
router.patch('/:id/status', AppointmentController.updateStatus);
router.put('/:id/status', AppointmentController.updateStatus);
router.put('/:id/cancel', (req, res) => {
  req.body.status = 'cancelled';
  return AppointmentController.updateStatus(req, res);
});
router.patch('/:id/cancel', (req, res) => {
  req.body.status = 'cancelled';
  return AppointmentController.updateStatus(req, res);
});

export default router;
