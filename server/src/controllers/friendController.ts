import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import FriendProfile from '../models/FriendProfile';
import User from '../models/User';

// @desc    Get all friends with filters
// @route   GET /api/friends
// @access  Public
export const getFriends = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      category,
      city,
      minRate,
      maxRate,
      rating,
      verified,
      availableNow,
      page = 1,
      limit = 10,
      lat,
      lng,
      radius = 25
    } = req.query;

    const query: any = { isActive: true };

    // Category filter
    if (category) {
      query['presencePackages.category'] = category;
      query['presencePackages.isActive'] = true;
    }

    // City filter
    if (city) {
      query['location.city'] = { $regex: city as string, $options: 'i' };
    }

    // Rate filter
    if (minRate || maxRate) {
      query['presencePackages.hourlyRate'] = {};
      if (minRate) query['presencePackages.hourlyRate'].$gte = Number(minRate);
      if (maxRate) query['presencePackages.hourlyRate'].$lte = Number(maxRate);
    }

    // Available now
    if (availableNow === 'true') {
      query.isAvailableNow = true;
    }

    // Geospatial query
    let geoQuery = {};
    if (lat && lng) {
      geoQuery = {
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [Number(lng), Number(lat)]
            },
            $maxDistance: Number(radius) * 1609.34 // Convert miles to meters
          }
        }
      };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const friends = await FriendProfile.find({ ...query, ...geoQuery })
      .populate('userId', 'firstName lastName avatar rating reviewCount isVerified')
      .skip(skip)
      .limit(Number(limit))
      .sort({ isFeatured: -1, 'verificationStatus.idVerified': -1, createdAt: -1 });

    const total = await FriendProfile.countDocuments({ ...query, ...geoQuery });

    res.json({
      success: true,
      data: friends,
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

// @desc    Get friend by ID
// @route   GET /api/friends/:id
// @access  Public
export const getFriendById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const friend = await FriendProfile.findById(req.params.id)
      .populate('userId', 'firstName lastName avatar rating reviewCount isVerified languages');

    if (!friend) {
      res.status(404).json({ message: 'Friend profile not found' });
      return;
    }

    res.json({
      success: true,
      data: friend
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my friend profile
// @route   GET /api/friends/me/profile
// @access  Private (Friend only)
export const getMyFriendProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const profile = await FriendProfile.findOne({ userId: req.user._id })
      .populate('userId', 'firstName lastName email avatar phone');

    if (!profile) {
      res.status(404).json({ message: 'Friend profile not found' });
      return;
    }

    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create friend profile
// @route   POST /api/friends/profile
// @access  Private
export const createFriendProfile = async (
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

    // Check if profile already exists
    const existingProfile = await FriendProfile.findOne({ userId: req.user._id });
    if (existingProfile) {
      res.status(400).json({ message: 'Friend profile already exists' });
      return;
    }

    const {
      bio,
      headline,
      specialties,
      skills,
      experience,
      education,
      languages,
      city,
      state,
      country,
      coordinates,
      serviceRadius
    } = req.body;

    const profile = await FriendProfile.create({
      userId: req.user._id,
      bio,
      headline,
      specialties,
      skills,
      experience,
      education,
      languages,
      location: {
        type: 'Point',
        coordinates: coordinates || [0, 0],
        city,
        state,
        country: country || 'USA'
      },
      serviceRadius: serviceRadius || 25,
      presencePackages: [],
      availability: []
    });

    // Update user to be a friend
    await User.findByIdAndUpdate(req.user._id, { isFriend: true });

    res.status(201).json({
      success: true,
      data: profile
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update friend profile
// @route   PUT /api/friends/profile
// @access  Private (Friend only)
export const updateFriendProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const allowedUpdates = [
      'bio',
      'headline',
      'specialties',
      'skills',
      'experience',
      'education',
      'languages',
      'location',
      'serviceRadius',
      'isAvailableNow'
    ];

    const updates: Record<string, any> = {};
    Object.keys(req.body).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const profile = await FriendProfile.findOneAndUpdate(
      { userId: req.user._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!profile) {
      res.status(404).json({ message: 'Friend profile not found' });
      return;
    }

    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add presence package
// @route   POST /api/friends/packages
// @access  Private (Friend only)
export const addPresencePackage = async (
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

    const profile = await FriendProfile.findOne({ userId: req.user._id });
    if (!profile) {
      res.status(404).json({ message: 'Friend profile not found' });
      return;
    }

    const newPackage = {
      ...req.body,
      rating: 0,
      reviewCount: 0,
      createdAt: new Date()
    };

    profile.presencePackages.push(newPackage);
    await profile.save();

    res.status(201).json({
      success: true,
      data: profile.presencePackages[profile.presencePackages.length - 1]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update presence package
// @route   PUT /api/friends/packages/:packageId
// @access  Private (Friend only)
export const updatePresencePackage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const profile = await FriendProfile.findOne({ userId: req.user._id });
    if (!profile) {
      res.status(404).json({ message: 'Friend profile not found' });
      return;
    }

    const packageIndex = profile.presencePackages.findIndex(
      (p) => p._id?.toString() === req.params.packageId
    );

    if (packageIndex === -1) {
      res.status(404).json({ message: 'Package not found' });
      return;
    }

    const allowedUpdates = [
      'title',
      'category',
      'description',
      'hourlyRate',
      'minHours',
      'maxHours',
      'requirements',
      'whatsIncluded',
      'isActive'
    ];

    allowedUpdates.forEach((key) => {
      if (req.body[key] !== undefined) {
        (profile.presencePackages[packageIndex] as any)[key] = req.body[key];
      }
    });

    await profile.save();

    res.json({
      success: true,
      data: profile.presencePackages[packageIndex]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete presence package
// @route   DELETE /api/friends/packages/:packageId
// @access  Private (Friend only)
export const deletePresencePackage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const profile = await FriendProfile.findOne({ userId: req.user._id });
    if (!profile) {
      res.status(404).json({ message: 'Friend profile not found' });
      return;
    }

    profile.presencePackages = profile.presencePackages.filter(
      (p) => p._id?.toString() !== req.params.packageId
    );

    await profile.save();

    res.json({
      success: true,
      message: 'Package deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update availability
// @route   PUT /api/friends/availability
// @access  Private (Friend only)
export const updateAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { availability } = req.body;

    const profile = await FriendProfile.findOneAndUpdate(
      { userId: req.user._id },
      { availability },
      { new: true }
    );

    if (!profile) {
      res.status(404).json({ message: 'Friend profile not found' });
      return;
    }

    res.json({
      success: true,
      data: profile.availability
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get friend stats
// @route   GET /api/friends/me/stats
// @access  Private (Friend only)
export const getFriendStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const profile = await FriendProfile.findOne({ userId: req.user._id });
    if (!profile) {
      res.status(404).json({ message: 'Friend profile not found' });
      return;
    }

    // Get booking stats
    const Booking = (await import('../models/Booking')).default;
    const totalBookings = await Booking.countDocuments({
      friendId: req.user._id,
      status: { $in: ['completed', 'confirmed'] }
    });

    const completedBookings = await Booking.countDocuments({
      friendId: req.user._id,
      status: 'completed'
    });

    const pendingBookings = await Booking.countDocuments({
      friendId: req.user._id,
      status: 'pending'
    });

    const monthlyEarnings = await Booking.aggregate([
      {
        $match: {
          friendId: req.user._id,
          status: 'completed',
          'payment.status': 'released'
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          earnings: { $sum: '$pricing.friendEarnings' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 6 }
    ]);

    res.json({
      success: true,
      data: {
        profile: {
          totalBookings: profile.totalBookings,
          totalEarnings: profile.totalEarnings,
          responseRate: profile.responseRate,
          completionRate: profile.completionRate,
          rating: profile.averageRating
        },
        bookings: {
          total: totalBookings,
          completed: completedBookings,
          pending: pendingBookings
        },
        monthlyEarnings
      }
    });
  } catch (error) {
    next(error);
  }
};
