import express from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/auth';
import {
  getBookings,
  getBookingById,
  createBooking,
  updateBookingStatus,
  cancelBooking,
  addCheckIn,
  sendMessage,
  addReview,
  getBookingMessages,
  disputeBooking
} from '../controllers/bookingController';

const router = express.Router();

const createBookingValidation = [
  body('friendId').notEmpty(),
  body('packageId').notEmpty(),
  body('situation.description').trim().notEmpty(),
  body('situation.category').isIn(['wedding', 'fitness', 'travel', 'cultural', 'social', 'professional', 'other']),
  body('startTime').isISO8601(),
  body('endTime').isISO8601(),
  body('location.address').trim().notEmpty()
];

const messageValidation = [
  body('content').trim().notEmpty(),
  body('type').optional().isIn(['text', 'image', 'voice'])
];

const reviewValidation = [
  body('rating').isInt({ min: 1, max: 5 }),
  body('comment').optional().trim(),
  body('categories.overall').isInt({ min: 1, max: 5 })
];

router.get('/', protect, getBookings);
router.get('/:id', protect, getBookingById);
router.post('/', protect, createBookingValidation, createBooking);
router.put('/:id/status', protect, updateBookingStatus);
router.put('/:id/cancel', protect, cancelBooking);
router.post('/:id/checkin', protect, addCheckIn);
router.get('/:id/messages', protect, getBookingMessages);
router.post('/:id/messages', protect, messageValidation, sendMessage);
router.post('/:id/review', protect, reviewValidation, addReview);
router.post('/:id/dispute', protect, disputeBooking);

export default router;
