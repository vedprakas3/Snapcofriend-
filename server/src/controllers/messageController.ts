import { Request, Response, NextFunction } from 'express';
import Booking from '../models/Booking';

// @desc    Get all conversations for user
// @route   GET /api/messages/conversations
// @access  Private
export const getConversations = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const bookings = await Booking.find({
      $or: [{ userId: req.user._id }, { friendId: req.user._id }],
      status: { $in: ['confirmed', 'in-progress', 'completed'] }
    })
      .populate('userId', 'firstName lastName avatar')
      .populate('friendId', 'firstName lastName avatar')
      .select('_id userId friendId messages status startTime')
      .sort({ 'messages.timestamp': -1 });

    const conversations = bookings.map((booking) => {
      const otherPerson =
        booking.userId._id.toString() === req.user._id.toString()
          ? booking.friendId
          : booking.userId;

      const unreadCount = booking.messages.filter(
        (m) => m.senderId.toString() !== req.user._id.toString() && !m.isRead
      ).length;

      const lastMessage = booking.messages[booking.messages.length - 1];

      return {
        bookingId: booking._id,
        otherPerson,
        status: booking.status,
        startTime: booking.startTime,
        unreadCount,
        lastMessage: lastMessage || null
      };
    });

    res.json({
      success: true,
      data: conversations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get unread message count
// @route   GET /api/messages/unread
// @access  Private
export const getUnreadCount = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const bookings = await Booking.find({
      $or: [{ userId: req.user._id }, { friendId: req.user._id }]
    }).select('messages');

    let unreadCount = 0;
    for (const booking of bookings) {
      unreadCount += booking.messages.filter(
        (m) => m.senderId.toString() !== req.user._id.toString() && !m.isRead
      ).length;
    }

    res.json({
      success: true,
      data: { unreadCount }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark messages as read
// @route   PUT /api/messages/read/:bookingId
// @access  Private
export const markAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    // Mark all messages from other person as read
    booking.messages.forEach((message) => {
      if (message.senderId.toString() !== req.user._id.toString()) {
        message.isRead = true;
      }
    });

    await booking.save();

    res.json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    next(error);
  }
};
