import { Request, Response, NextFunction } from 'express';
import Booking from '../models/Booking';
import User from '../models/User';

// Note: Install razorpay package: npm install razorpay
// For now, using mock implementation that can be replaced with actual Razorpay integration

// @desc    Create Razorpay order
// @route   POST /api/payments/create-intent
// @access  Private
export const createPaymentIntent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    if (booking.userId.toString() !== req.user._id.toString()) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    // Convert amount to paise (₹1 = 100 paise)
    const amountInPaise = Math.round(booking.pricing.totalAmount * 100);

    // TODO: Integrate with Razorpay
    // const Razorpay = require('razorpay');
    // const razorpay = new Razorpay({
    //   key_id: process.env.RAZORPAY_KEY_ID,
    //   key_secret: process.env.RAZORPAY_KEY_SECRET
    // });
    // const order = await razorpay.orders.create({
    //   amount: amountInPaise,
    //   currency: 'INR',
    //   receipt: booking._id.toString()
    // });

    // Mock response for now
    const mockOrderId = `order_${Date.now()}`;

    res.json({
      success: true,
      orderId: mockOrderId,
      amount: amountInPaise,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock_key'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Razorpay payment
// @route   POST /api/payments/confirm
// @access  Private
export const confirmPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    // TODO: Verify signature with Razorpay
    // const crypto = require('crypto');
    // const body = razorpayOrderId + '|' + razorpayPaymentId;
    // const expectedSignature = crypto
    //   .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    //   .update(body.toString())
    //   .digest('hex');
    // 
    // if (expectedSignature !== razorpaySignature) {
    //   res.status(400).json({ message: 'Invalid signature' });
    //   return;
    // }

    // Update booking
    booking.payment.status = 'held';
    booking.payment.razorpayOrderId = razorpayOrderId;
    booking.payment.razorpayPaymentId = razorpayPaymentId;
    booking.payment.paidAt = new Date();
    booking.status = 'confirmed';
    await booking.save();

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment methods (not used with Razorpay)
// @route   GET /api/payments/methods
// @access  Private
export const getPaymentMethods = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Razorpay doesn't store payment methods like Stripe
    // Users enter card details during checkout
    res.json({
      success: true,
      data: []
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add payment method (not used with Razorpay)
// @route   POST /api/payments/methods
// @access  Private
export const addPaymentMethod = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    res.json({
      success: true,
      message: 'Payment methods are handled during checkout with Razorpay'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove payment method (not used with Razorpay)
// @route   DELETE /api/payments/methods/:methodId
// @access  Private
export const removePaymentMethod = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    res.json({
      success: true,
      message: 'Payment method removed'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get earnings (for friends)
// @route   GET /api/payments/earnings
// @access  Private
export const getEarnings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const bookings = await Booking.find({
      friendId: req.user._id,
      status: 'completed',
      'payment.status': 'released'
    });

    const totalEarnings = bookings.reduce(
      (sum, b) => sum + b.pricing.friendEarnings,
      0
    );

    const pendingEarnings = await Booking.aggregate([
      {
        $match: {
          friendId: req.user._id,
          status: 'completed',
          'payment.status': 'held'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$pricing.friendEarnings' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalEarnings,
        pendingEarnings: pendingEarnings[0]?.total || 0,
        totalBookings: bookings.length,
        recentEarnings: bookings.slice(0, 5).map((b) => ({
          bookingId: b._id,
          amount: b.pricing.friendEarnings,
          date: b.createdAt
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Request payout
// @route   POST /api/payments/payout
// @access  Private
export const requestPayout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { amount } = req.body;

    const user = await User.findById(req.user._id);
    if (!user?.isFriend) {
      res.status(400).json({ message: 'Only companions can request payouts' });
      return;
    }

    // TODO: Integrate with RazorpayX for payouts
    // or use manual bank transfer process

    res.json({
      success: true,
      message: 'Payout request submitted',
      amount,
      status: 'pending'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Razorpay webhook
// @route   POST /api/payments/webhook
// @access  Public
export const webhook = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'] as string;

    // TODO: Verify webhook signature
    // const crypto = require('crypto');
    // const shasum = crypto.createHmac('sha256', secret);
    // shasum.update(JSON.stringify(req.body));
    // const digest = shasum.digest('hex');
    //
    // if (digest !== signature) {
    //   res.status(400).json({ message: 'Invalid signature' });
    //   return;
    // }

    const event = req.body;

    // Handle events
    switch (event.event) {
      case 'payment.captured':
        const payment = event.payload.payment.entity;
        const bookingId = payment.notes?.bookingId;
        if (bookingId) {
          await Booking.findByIdAndUpdate(bookingId, {
            'payment.status': 'held',
            status: 'confirmed'
          });
        }
        break;

      case 'payment.failed':
        const failedPayment = event.payload.payment.entity;
        const failedBookingId = failedPayment.notes?.bookingId;
        if (failedBookingId) {
          await Booking.findByIdAndUpdate(failedBookingId, {
            'payment.status': 'pending'
          });
        }
        break;
    }

    res.json({ received: true });
  } catch (error) {
    next(error);
  }
};
