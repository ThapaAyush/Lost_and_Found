import express from 'express';
import {
  getProfile,
  updateProfile,
  changePassword,
  getUserStats,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/me', getProfile);
router.patch('/me', upload.single('avatar'), updateProfile);
router.post('/change-password', changePassword);
router.get('/stats', getUserStats);

export default router;
