import express from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/auth';
import { findMatches, getMatchDetails, getRecommendedFriends } from '../controllers/matchController';

const router = express.Router();

const matchValidation = [
  body('situation').trim().notEmpty(),
  body('category').isIn(['wedding', 'fitness', 'travel', 'cultural', 'social', 'professional', 'other']),
  body('date').isISO8601(),
  body('duration').isInt({ min: 1, max: 12 }),
  body('location.address').trim().notEmpty()
];

router.post('/find', protect, matchValidation, findMatches);
router.get('/:friendId', protect, getMatchDetails);
router.get('/recommendations', protect, getRecommendedFriends);

export default router;
