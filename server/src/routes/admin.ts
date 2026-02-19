import express from 'express';
import { protect, adminOnly } from '../middleware/auth';
import {
  getDashboardStats,
  getUsers,
  getBookings,
  verifyUser,
  getDisputes,
  resolveDispute,
  getPendingVerifications,
  approveVerification,
  rejectVerification,
  getReports
} from '../controllers/adminController';

const router = express.Router();

router.use(protect, adminOnly);

router.get('/dashboard', getDashboardStats);
router.get('/users', getUsers);
router.get('/bookings', getBookings);
router.put('/users/:id/verify', verifyUser);
router.get('/disputes', getDisputes);
router.put('/disputes/:id/resolve', resolveDispute);
router.get('/verifications', getPendingVerifications);
router.put('/verifications/:id/approve', approveVerification);
router.put('/verifications/:id/reject', rejectVerification);
router.get('/reports', getReports);

export default router;
