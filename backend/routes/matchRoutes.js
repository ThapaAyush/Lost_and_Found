import express from 'express';
import { getMatches, getCommunityMatches } from '../controllers/matchController.js';
import { protect, optionalProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/community', optionalProtect, getCommunityMatches);
router.get('/', protect, getMatches);

export default router;
