import express from 'express';
import { protect } from '../middleware/auth';
import {
  createPaymentIntent,
  confirmPayment,
  getPaymentMethods,
  addPaymentMethod,
  removePaymentMethod,
  getEarnings,
  requestPayout,
  webhook
} from '../controllers/paymentController';

const router = express.Router();

router.post('/create-intent', protect, createPaymentIntent);
router.post('/confirm', protect, confirmPayment);
router.get('/methods', protect, getPaymentMethods);
router.post('/methods', protect, addPaymentMethod);
router.delete('/methods/:methodId', protect, removePaymentMethod);
router.get('/earnings', protect, getEarnings);
router.post('/payout', protect, requestPayout);
router.post('/webhook', webhook);

export default router;
