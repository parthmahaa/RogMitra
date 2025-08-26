import express from 'express';
import {analyzeSymptoms, getHistory} from '../controllers/appointmentController.js';
import authMiddleware from '../middlewares/auth.js';
import rateLimitMiddleware from '../middlewares/rateLimitter.js';
const router = express.Router();

router.post('/analyze', authMiddleware,rateLimitMiddleware, analyzeSymptoms);
router.get('/history',authMiddleware,  getHistory);

export default router;