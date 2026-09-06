import { Router } from 'express';
import { generateAbhaCard, verifyAbha } from '../controllers/abhaController.js';

const router = Router();

router.post('/generate', generateAbhaCard);
router.get('/verify/:abha', verifyAbha);

export default router;
