import express from 'express';
import { protect } from '../middleware/auth';
import { getConversations, getUnreadCount, markAsRead } from '../controllers/messageController';

const router = express.Router();

router.get('/conversations', protect, getConversations);
router.get('/unread', protect, getUnreadCount);
router.put('/read/:bookingId', protect, markAsRead);

export default router;
