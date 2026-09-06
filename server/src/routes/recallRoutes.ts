import { Router } from 'express';
import {
  getRecallCohortSummary,
  getAshaRecallTasks,
  resolveRecallTask,
  triggerRecallScan,
} from '../controllers/recallController.js';

const router = Router();

router.get('/summary', getRecallCohortSummary);
router.get('/tasks', getAshaRecallTasks);
router.post('/tasks/:id/resolve', resolveRecallTask);
router.post('/trigger-scan', triggerRecallScan);

export default router;
