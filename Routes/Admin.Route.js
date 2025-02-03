import express from 'express';
import protect from '../middleware/authMiddleware.js';
import { getAdminStats, getRecentActivity } from '../Controllers/AdminController.js';

const router = express.Router();

router.get('/stats', protect, getAdminStats);
router.get('/recent-activity', protect, getRecentActivity);

export default router; 