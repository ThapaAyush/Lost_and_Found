import express from 'express';
import {
  createOrGetConversation,
  getConversations,
  getConversationById,
  sendMessage,
  updateConversationStatus,
} from '../controllers/conversationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getConversations);
router.post('/', createOrGetConversation);
router.get('/:id', getConversationById);
router.post('/:id/messages', sendMessage);
router.patch('/:id/status', updateConversationStatus);

export default router;
