import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import Booking from '../models/Booking';
import FriendProfile from '../models/FriendProfile';

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
// @access  Admin
export const getDashboardStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const totalUsers = await User.countDocuments();
    const totalFriends = await User.countDocuments({ isFriend: true });
    const totalBookings = await Booking.countDocuments();
    const pendingVerifications = await User.countDocuments({
      verificationStatus: 'in-review'
    });
    const openDisputes = await Booking.countDocuments({
      status: 'disputed',
      'dispute.status': 'open'
    });

    // Revenue stats
    const revenueStats = await Booking.aggregate([
      {
        $match: {
          status: 'completed',
          'payment.status': 'released'
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$pricing.platformFee' },
          totalPayouts: { $sum: '$pricing.friendEarnings' }
        }
      }
    ]);

    // Monthly bookings
    const monthlyBookings = await Booking.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 6 }
    ]);

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          friends: totalFriends
        },
        bookings: {
          total: totalBookings,
          monthly: monthlyBookings
        },
        verifications: {
          pending: pendingVerifications
        },
        disputes: {
          open: openDisputes
        },
        revenue: revenueStats[0] || { totalRevenue: 0, totalPayouts: 0 }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Admin
export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page = 1, limit = 20, search, role, isVerified } = req.query;

    const query: any = {};
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) query.role = role;
    if (isVerified) query.isVerified = isVerified === 'true';

    const skip = (Number(page) - 1) * Number(limit);

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: users,
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

// @desc    Get all bookings
// @route   GET /api/admin/bookings
// @access  Admin
export const getBookings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const query: any = {};
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const bookings = await Booking.find(query)
      .populate('userId', 'firstName lastName email')
      .populate('friendId', 'firstName lastName email')
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

// @desc    Verify user
// @route   PUT /api/admin/users/:id/verify
// @access  Admin
export const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        isVerified: true,
        verificationStatus: 'verified'
      },
      { new: true }
    );

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get disputes
// @route   GET /api/admin/disputes
// @access  Admin
export const getDisputes = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status = 'open' } = req.query;

    const bookings = await Booking.find({
      status: 'disputed',
      'dispute.status': status
    })
      .populate('userId', 'firstName lastName email')
      .populate('friendId', 'firstName lastName email')
      .sort({ 'dispute.disputedAt': -1 });

    res.json({
      success: true,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resolve dispute
// @route   PUT /api/admin/disputes/:id/resolve
// @access  Admin
export const resolveDispute = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { resolution, refundAmount } = req.body;

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      {
        'dispute.status': 'resolved',
        'dispute.resolution': resolution,
        status: refundAmount > 0 ? 'cancelled' : 'completed'
      },
      { new: true }
    );

    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    // Process refund if applicable
    if (refundAmount > 0) {
      booking.payment.status = 'refunded';
      booking.payment.refundAmount = refundAmount;
      booking.payment.refundedAt = new Date();
      await booking.save();
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get pending verifications
// @route   GET /api/admin/verifications
// @access  Admin
export const getPendingVerifications = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const friends = await FriendProfile.find({
      'verificationStatus.idVerified': false
    })
      .populate('userId', 'firstName lastName email createdAt')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: friends
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve verification
// @route   PUT /api/admin/verifications/:id/approve
// @access  Admin
export const approveVerification = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const friend = await FriendProfile.findByIdAndUpdate(
      req.params.id,
      {
        'verificationStatus.idVerified': true,
        'verificationStatus.backgroundChecked': true
      },
      { new: true }
    );

    if (!friend) {
      res.status(404).json({ message: 'Friend profile not found' });
      return;
    }

    // Update user verification status
    await User.findByIdAndUpdate(friend.userId, {
      isVerified: true,
      verificationStatus: 'verified'
    });

    res.json({
      success: true,
      data: friend
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject verification
// @route   PUT /api/admin/verifications/:id/reject
// @access  Admin
export const rejectVerification = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { reason } = req.body;

    const friend = await FriendProfile.findByIdAndUpdate(
      req.params.id,
      {
        'verificationStatus.idVerified': false
      },
      { new: true }
    );

    if (!friend) {
      res.status(404).json({ message: 'Friend profile not found' });
      return;
    }

    // Update user verification status
    await User.findByIdAndUpdate(friend.userId, {
      isVerified: false,
      verificationStatus: 'rejected'
    });

    res.json({
      success: true,
      message: 'Verification rejected',
      reason
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reports
// @route   GET /api/admin/reports
// @access  Admin
export const getReports = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { type, startDate, endDate } = req.query;

    let data: any = {};

    if (type === 'revenue') {
      data = await Booking.aggregate([
        {
          $match: {
            status: 'completed',
            createdAt: {
              $gte: new Date(startDate as string),
              $lte: new Date(endDate as string)
            }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            revenue: { $sum: '$pricing.platformFee' },
            payouts: { $sum: '$pricing.friendEarnings' },
            bookings: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ]);
    } else if (type === 'users') {
      data = await User.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(startDate as string),
              $lte: new Date(endDate as string)
            }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            newUsers: { $sum: 1 },
            newFriends: {
              $sum: { $cond: ['$isFriend', 1, 0] }
            }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ]);
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};
