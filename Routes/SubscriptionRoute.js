import express from 'express'
import { Subscribe } from '../Controllers/SubscribeController.js';
const router = express.Router()

router.post('/subscribe',Subscribe)

export default router;