import express from 'express';
import {
  getItems,
  getItemById,
  createItem,
  updateItem,
  updateItemStatus,
  deleteItem,
  getMyItems,
  getItemMatches,
} from '../controllers/itemController.js';
import { submitClaim } from '../controllers/claimController.js';
import { protect, optionalProtect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Publicly browseable routes (optional authentication)
router.get('/', optionalProtect, getItems);
router.get('/mine', protect, getMyItems);
router.get('/:id', optionalProtect, getItemById);
router.get('/:id/matches', optionalProtect, getItemMatches);

// Protected actions requiring active session
router.post('/', protect, upload.array('images', 5), createItem);
router.patch('/:id', protect, upload.array('images', 5), updateItem);
router.patch('/:id/status', protect, updateItemStatus);
router.delete('/:id', protect, deleteItem);

// Submit claim directly against an item
router.post('/:id/claims', protect, upload.array('evidence', 5), submitClaim);

export default router;
