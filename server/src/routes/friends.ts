import express from 'express';
import { body } from 'express-validator';
import { protect, friendOnly } from '../middleware/auth';
import {
  getFriends,
  getFriendById,
  createFriendProfile,
  updateFriendProfile,
  addPresencePackage,
  updatePresencePackage,
  deletePresencePackage,
  updateAvailability,
  getMyFriendProfile,
  getFriendStats
} from '../controllers/friendController';

const router = express.Router();

const profileValidation = [
  body('bio').trim().notEmpty().isLength({ max: 2000 }),
  body('experience').trim().notEmpty(),
  body('city').trim().notEmpty()
];

const packageValidation = [
  body('title').trim().notEmpty(),
  body('category').isIn(['wedding', 'fitness', 'travel', 'cultural', 'social', 'professional', 'other']),
  body('description').trim().notEmpty(),
  body('hourlyRate').isFloat({ min: 20, max: 200 }),
  body('minHours').optional().isInt({ min: 1 }),
  body('maxHours').optional().isInt({ max: 12 })
];

// Public routes
router.get('/', getFriends);
router.get('/:id', getFriendById);

// Protected routes
router.get('/me/profile', protect, friendOnly, getMyFriendProfile);
router.post('/profile', protect, profileValidation, createFriendProfile);
router.put('/profile', protect, friendOnly, updateFriendProfile);
router.post('/packages', protect, friendOnly, packageValidation, addPresencePackage);
router.put('/packages/:packageId', protect, friendOnly, updatePresencePackage);
router.delete('/packages/:packageId', protect, friendOnly, deletePresencePackage);
router.put('/availability', protect, friendOnly, updateAvailability);
router.get('/me/stats', protect, friendOnly, getFriendStats);

export default router;
