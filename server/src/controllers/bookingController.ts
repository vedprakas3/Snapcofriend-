import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import Booking from '../models/Booking';
import FriendProfile from '../models/FriendProfile';
import User from '../models/User';

// @desc    Get user's bookings
// @route   GET /api/bookings
// @access  Private
export const getBookings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status, role, page = 1, limit = 10 } = req.query;

    const query: any = {};
    
    // Filter by role (user or friend)
    if (role === 'friend') {
      query.friendId = req.user._id;
    } else {
      query.userId = req.user._id;
    }

    if (status) {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const bookings = await Booking.find(query)
      .populate('userId', 'firstName lastName avatar')
      .populate('friendId', 'firstName lastName avatar')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      data: bookings,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
export const getBookingById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('userId', 'firstName lastName avatar phone emergencyContact')
      .populate('friendId', 'firstName lastName avatar phone');

    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    // Check if user is authorized to view this booking
    if (
      booking.userId._id.toString() !== req.user._id.toString() &&
      booking.friendId._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      res.status(403).json({ message: 'Not authorized to view this booking' });
      return;
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create booking
// @route   POST /api/bookings
// @access  Private
export const createBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        errors: errors.array()
      });
      return;
    }

    const { friendId, packageId, situation, startTime, endTime, location } = req.body;

    // Validate friend exists
    const friend = await User.findById(friendId);
    if (!friend || !friend.isFriend) {
      res.status(404).json({ message: 'Friend not found' });
      return;
    }

    // Get friend profile and package
    const friendProfile = await FriendProfile.findOne({ userId: friendId });
    if (!friendProfile) {
      res.status(404).json({ message: 'Friend profile not found' });
      return;
    }

    const package_ = friendProfile.presencePackages.find(
      (p) => p._id?.toString() === packageId
    );
    if (!package_) {
      res.status(404).json({ message: 'Package not found' });
      return;
    }

    // Calculate duration and pricing
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMs = end.getTime() - start.getTime();
    const durationHours = Math.ceil(durationMs / (1000 * 60 * 60));

    const hourlyRate = package_.hourlyRate;
    const subtotal = hourlyRate * durationHours;
    const platformFee = subtotal * 0.25; // 25% platform fee
    const totalAmount = subtotal + platformFee;
    const friendEarnings = subtotal * 0.75; // 75% to friend

    // Generate safety code
    const safetyCode = Math.floor(1000 + Math.random() * 9000).toString();

    const booking = await Booking.create({
      userId: req.user._id,
      friendId,
      packageId,
      situation,
      startTime: start,
      endTime: end,
      duration: durationHours,
      location,
      pricing: {
        hourlyRate,
        totalHours: durationHours,
        subtotal,
        platformFee,
        totalAmount,
        friendEarnings
      },
      payment: {
        status: 'pending'
      },
      safetyCode,
      checkIns: [],
      messages: []
    });

    await booking.populate('userId', 'firstName lastName avatar');
    await booking.populate('friendId', 'firstName lastName avatar');

    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private
export const updateBookingStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'];

    if (!validStatuses.includes(status)) {
      res.status(400).json({ message: 'Invalid status' });
      return;
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    // Check authorization
    const isUser = booking.userId.toString() === req.user._id.toString();
    const isFriend = booking.friendId.toString() === req.user._id.toString();

    if (!isUser && !isFriend && req.user.role !== 'admin') {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    // Validate status transitions
    const validTransitions: Record<string, string[]> = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['in-progress', 'cancelled'],
      'in-progress': ['completed'],
      completed: [],
      cancelled: []
    };

    if (!validTransitions[booking.status].includes(status)) {
      res.status(400).json({
        message: `Cannot transition from ${booking.status} to ${status}`
      });
      return;
    }

    booking.status = status;

    // Update payment status on confirmation
    if (status === 'confirmed') {
      booking.payment.status = 'held';
    }

    // Release payment on completion
    if (status === 'completed') {
      booking.payment.status = 'released';
      
      // Update friend earnings
      await FriendProfile.findOneAndUpdate(
        { userId: booking.friendId },
        {
          $inc: {
            totalBookings: 1,
            totalEarnings: booking.pricing.friendEarnings
          }
        }
      );
    }

    await booking.save();

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
export const cancelBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { reason } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    if (!['pending', 'confirmed'].includes(booking.status)) {
      res.status(400).json({ message: 'Cannot cancel booking at this stage' });
      return;
    }

    booking.status = 'cancelled';
    booking.cancellation = {
      cancelledBy: req.user._id,
      reason: reason || 'No reason provided',
      cancelledAt: new Date(),
      refundAmount: booking.pricing.totalAmount
    };
    booking.payment.status = 'refunded';

    await booking.save();

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add check-in
// @route   POST /api/bookings/:id/checkin
// @access  Private
export const addCheckIn = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { type, location, isEmergency, notes } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    booking.checkIns.push({
      type: type || 'manual',
      timestamp: new Date(),
      location,
      isEmergency: isEmergency || false,
      notes
    });

    await booking.save();

    res.json({
      success: true,
      data: booking.checkIns[booking.checkIns.length - 1]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get booking messages
// @route   GET /api/bookings/:id/messages
// @access  Private
export const getBookingMessages = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const booking = await Booking.findById(req.params.id)
      .select('messages userId friendId');

    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    // Check authorization
    if (
      booking.userId.toString() !== req.user._id.toString() &&
      booking.friendId.toString() !== req.user._id.toString()
    ) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    res.json({
      success: true,
      data: booking.messages
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send message
// @route   POST /api/bookings/:id/messages
// @access  Private
export const sendMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        errors: errors.array()
      });
      return;
    }

    const { content, type = 'text' } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    // Check authorization
    if (
      booking.userId.toString() !== req.user._id.toString() &&
      booking.friendId.toString() !== req.user._id.toString()
    ) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    const message = {
      senderId: req.user._id,
      content,
      type,
      timestamp: new Date(),
      isRead: false
    };

    booking.messages.push(message);
    await booking.save();

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add review
// @route   POST /api/bookings/:id/review
// @access  Private
export const addReview = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        errors: errors.array()
      });
      return;
    }

    const { rating, comment, categories } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    if (booking.status !== 'completed') {
      res.status(400).json({ message: 'Can only review completed bookings' });
      return;
    }

    const isUser = booking.userId.toString() === req.user._id.toString();
    const isFriend = booking.friendId.toString() === req.user._id.toString();

    if (!isUser && !isFriend) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    const review = {
      reviewerId: req.user._id,
      rating,
      comment,
      categories,
      createdAt: new Date()
    };

    if (isUser) {
      booking.review = review;
    } else {
      booking.friendReview = review;
    }

    await booking.save();

    // Update friend rating
    if (isUser) {
      const friendProfile = await FriendProfile.findOne({ userId: booking.friendId });
      if (friendProfile) {
        const packageIndex = friendProfile.presencePackages.findIndex(
          (p) => p._id?.toString() === booking.packageId.toString()
        );
        if (packageIndex !== -1) {
          const pkg = friendProfile.presencePackages[packageIndex];
          const newReviewCount = pkg.reviewCount + 1;
          pkg.rating = (pkg.rating * pkg.reviewCount + rating) / newReviewCount;
          pkg.reviewCount = newReviewCount;
          await friendProfile.save();
        }
      }

      // Update user rating
      const friend = await User.findById(booking.friendId);
      if (friend) {
        const newReviewCount = friend.reviewCount + 1;
        friend.rating = (friend.rating * friend.reviewCount + rating) / newReviewCount;
        friend.reviewCount = newReviewCount;
        await friend.save();
      }
    }

    res.json({
      success: true,
      data: review
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Dispute booking
// @route   POST /api/bookings/:id/dispute
// @access  Private
export const disputeBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { reason, description } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    if (booking.status !== 'completed') {
      res.status(400).json({ message: 'Can only dispute completed bookings' });
      return;
    }

    booking.status = 'disputed';
    booking.dispute = {
      disputedBy: req.user._id,
      reason,
      description,
      disputedAt: new Date(),
      status: 'open'
    };

    await booking.save();

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};
