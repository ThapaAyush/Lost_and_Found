import express from 'express';
import {
  getMyClaims,
  getClaimById,
  updateClaimStatus,
} from '../controllers/claimController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/mine', getMyClaims);
router.get('/:id', getClaimById);
router.patch('/:id', updateClaimStatus);

export default router;
