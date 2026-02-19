import express from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/auth';
import {
  getProfile,
  updateProfile,
  uploadAvatar,
  updateEmergencyContact,
  deleteAccount
} from '../controllers/userController';

const router = express.Router();

const updateProfileValidation = [
  body('firstName').optional().trim().notEmpty(),
  body('lastName').optional().trim().notEmpty(),
  body('bio').optional().isLength({ max: 500 }),
  body('phone').optional().isMobilePhone('any'),
  body('languages').optional().isArray()
];

const emergencyContactValidation = [
  body('name').trim().notEmpty(),
  body('phone').isMobilePhone('any'),
  body('relationship').trim().notEmpty()
];

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfileValidation, updateProfile);
router.post('/avatar', protect, uploadAvatar);
router.put('/emergency-contact', protect, emergencyContactValidation, updateEmergencyContact);
router.delete('/account', protect, deleteAccount);

export default router;
