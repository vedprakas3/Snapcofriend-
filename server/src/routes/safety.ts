import express from 'express';
import { protect } from '../middleware/auth';
import {
  triggerSOS,
  getSafetyStatus,
  shareLocation,
  getCheckInStatus,
  verifySafetyCode
} from '../controllers/safetyController';

const router = express.Router();

router.post('/sos', protect, triggerSOS);
router.get('/status/:bookingId', protect, getSafetyStatus);
router.post('/location', protect, shareLocation);
router.get('/checkin/:bookingId', protect, getCheckInStatus);
router.post('/verify-code', protect, verifySafetyCode);

export default router;
