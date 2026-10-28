import express from 'express';
import { submitReport } from '../controllers/abuseReportController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.post('/', submitReport);

export default router;
