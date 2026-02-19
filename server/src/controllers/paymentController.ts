import { Request, Response, NextFunction } from 'express';
import Stripe from 'stripe';
import Booking from '../models/Booking';
import User from '../models/User';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16' as any
});

// @desc    Create payment intent
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

    // Get or create Stripe customer
    let user = await User.findById(req.user._id);
    let customerId = user?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user?.email,
        name: `${user?.firstName} ${user?.lastName}`
      });
      customerId = customer.id;
      await User.findByIdAndUpdate(req.user._id, { stripeCustomerId: customerId });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(booking.pricing.totalAmount * 100), // Convert to cents
      currency: 'usd',
      customer: customerId,
      metadata: {
        bookingId: booking._id.toString(),
        userId: req.user._id.toString()
      }
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Confirm payment
// @route   POST /api/payments/confirm
// @access  Private
export const confirmPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { bookingId, paymentIntentId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    // Verify payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      res.status(400).json({ message: 'Payment not successful' });
      return;
    }

    // Update booking
    booking.payment.status = 'held';
    booking.payment.stripePaymentIntentId = paymentIntentId;
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

// @desc    Get payment methods
// @route   GET /api/payments/methods
// @access  Private
export const getPaymentMethods = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user?.stripeCustomerId) {
      res.json({
        success: true,
        data: []
      });
      return;
    }

    const paymentMethods = await stripe.paymentMethods.list({
      customer: user.stripeCustomerId,
      type: 'card'
    });

    res.json({
      success: true,
      data: paymentMethods.data
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add payment method
// @route   POST /api/payments/methods
// @access  Private
export const addPaymentMethod = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { paymentMethodId } = req.body;

    const user = await User.findById(req.user._id);
    let customerId = user?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user?.email,
        name: `${user?.firstName} ${user?.lastName}`
      });
      customerId = customer.id;
      await User.findByIdAndUpdate(req.user._id, { stripeCustomerId: customerId });
    }

    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId
    });

    res.json({
      success: true,
      message: 'Payment method added'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove payment method
// @route   DELETE /api/payments/methods/:methodId
// @access  Private
export const removePaymentMethod = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await stripe.paymentMethods.detach(req.params.methodId);

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
    if (!user?.stripeConnectId) {
      res.status(400).json({ message: 'Stripe Connect account not set up' });
      return;
    }

    // Create transfer to connected account
    const transfer = await stripe.transfers.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      destination: user.stripeConnectId
    });

    res.json({
      success: true,
      data: transfer
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Stripe webhook
// @route   POST /api/payments/webhook
// @access  Public
export const webhook = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const sig = req.headers['stripe-signature'] as string;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret || '');
    } catch (err: any) {
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    // Handle events
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        // Update booking status
        if (paymentIntent.metadata?.bookingId) {
          await Booking.findByIdAndUpdate(paymentIntent.metadata.bookingId, {
            'payment.status': 'held',
            status: 'confirmed'
          });
        }
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        if (failedPayment.metadata?.bookingId) {
          await Booking.findByIdAndUpdate(failedPayment.metadata.bookingId, {
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
