import { Router } from 'express';
import { flushSyncQueue } from '../controllers/syncController.js';

const router = Router();

router.post('/flush', flushSyncQueue);

export default router;
