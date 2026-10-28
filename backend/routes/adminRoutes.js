import express from 'express';
import {
  getAdminStats,
  getUsers,
  updateUserStatus,
  getAdminItems,
  moderateItem,
  getAdminClaims,
  getAbuseReports,
  resolveAbuseReport,
  getAuditLogs,
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';

const router = express.Router();

// Strict security: require valid JWT and admin role
router.use(protect, adminOnly);

router.get('/stats', getAdminStats);
router.get('/users', getUsers);
router.patch('/users/:id/status', updateUserStatus);
router.get('/items', getAdminItems);
router.patch('/items/:id/moderate', moderateItem);
router.get('/claims', getAdminClaims);
router.get('/abuse-reports', getAbuseReports);
router.patch('/abuse-reports/:id', resolveAbuseReport);
router.get('/audit-logs', getAuditLogs);

export default router;
