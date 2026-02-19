import { Request, Response, NextFunction } from 'express';
import Booking from '../models/Booking';
import User from '../models/User';

// @desc    Trigger SOS alert
// @route   POST /api/safety/sos
// @access  Private
export const triggerSOS = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { bookingId, location, notes } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    // Add emergency check-in
    booking.checkIns.push({
      type: 'sos',
      timestamp: new Date(),
      location,
      isEmergency: true,
      notes: notes || 'SOS triggered by user'
    });

    await booking.save();

    // Get user details for alert
    const user = await User.findById(req.user._id);
    const emergencyContact = user?.emergencyContact;

    // In production, this would:
    // 1. Send SMS to emergency contact
    // 2. Alert safety team
    // 3. Potentially contact authorities

    res.json({
      success: true,
      message: 'SOS alert triggered',
      data: {
        alertId: booking.checkIns[booking.checkIns.length - 1]._id,
        timestamp: new Date(),
        emergencyContact: emergencyContact
          ? {
              name: emergencyContact.name,
              relationship: emergencyContact.relationship
            }
          : null
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get safety status for booking
// @route   GET /api/safety/status/:bookingId
// @access  Private
export const getSafetyStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .populate('userId', 'firstName lastName emergencyContact')
      .populate('friendId', 'firstName lastName phone');

    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    // Check authorization
    if (
      booking.userId._id.toString() !== req.user._id.toString() &&
      booking.friendId._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    const lastCheckIn = booking.checkIns[booking.checkIns.length - 1];
    const nextCheckInDue = lastCheckIn
      ? new Date(lastCheckIn.timestamp.getTime() + 30 * 60 * 1000)
      : null;

    res.json({
      success: true,
      data: {
        safetyCode: booking.safetyCode,
        checkIns: booking.checkIns,
        lastCheckIn,
        nextCheckInDue,
        isOverdue: nextCheckInDue ? nextCheckInDue < new Date() : false,
        emergencyContact: booking.userId.emergencyContact
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Share location
// @route   POST /api/safety/location
// @access  Private
export const shareLocation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { bookingId, lat, lng } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    // Add location check-in
    booking.checkIns.push({
      type: 'auto',
      timestamp: new Date(),
      location: { lat, lng },
      isEmergency: false,
      notes: 'Location update'
    });

    await booking.save();

    res.json({
      success: true,
      message: 'Location shared'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get check-in status
// @route   GET /api/safety/checkin/:bookingId
// @access  Private
export const getCheckInStatus = async (
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

    const checkIns = booking.checkIns.filter((c) => c.type !== 'sos');
    const lastCheckIn = checkIns[checkIns.length - 1];

    const timeSinceLastCheckIn = lastCheckIn
      ? Date.now() - lastCheckIn.timestamp.getTime()
      : null;

    const isOverdue = timeSinceLastCheckIn ? timeSinceLastCheckIn > 30 * 60 * 1000 : false;

    res.json({
      success: true,
      data: {
        totalCheckIns: checkIns.length,
        lastCheckIn,
        timeSinceLastCheckIn,
        isOverdue,
        checkInInterval: 30 // minutes
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify safety code
// @route   POST /api/safety/verify-code
// @access  Private
export const verifySafetyCode = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { bookingId, code } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    const isValid = booking.safetyCode === code;

    res.json({
      success: true,
      data: {
        valid: isValid
      }
    });
  } catch (error) {
    next(error);
  }
};
