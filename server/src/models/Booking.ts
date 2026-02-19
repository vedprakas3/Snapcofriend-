import mongoose, { Document, Schema } from 'mongoose';

export interface ICheckIn {
  type: 'auto' | 'manual' | 'sos';
  timestamp: Date;
  location?: {
    lat: number;
    lng: number;
  };
  isEmergency: boolean;
  notes?: string;
}

export interface IMessage {
  senderId: mongoose.Types.ObjectId;
  content: string;
  type: 'text' | 'image' | 'voice' | 'system';
  timestamp: Date;
  isRead: boolean;
}

export interface IReview {
  reviewerId: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  categories: {
    punctuality: number;
    communication: number;
    professionalism: number;
    overall: number;
  };
  createdAt: Date;
}

export interface ISituation {
  description: string;
  category: 'wedding' | 'fitness' | 'travel' | 'cultural' | 'social' | 'professional' | 'other';
  context: string[];
  urgency: 'flexible' | 'soon' | 'urgent';
  specialRequirements?: string[];
}

export interface IBooking extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  friendId: mongoose.Types.ObjectId;
  packageId: mongoose.Types.ObjectId;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'disputed';
  situation: ISituation;
  startTime: Date;
  endTime: Date;
  duration: number; // in hours
  location: {
    address: string;
    coordinates?: [number, number];
    notes?: string;
    venueName?: string;
  };
  pricing: {
    hourlyRate: number;
    totalHours: number;
    subtotal: number;
    platformFee: number;
    totalAmount: number;
    friendEarnings: number;
  };
  payment: {
    status: 'pending' | 'held' | 'released' | 'refunded';
    stripePaymentIntentId?: string;
    paidAt?: Date;
    refundedAt?: Date;
    refundAmount?: number;
  };
  safetyCode: string;
  checkIns: ICheckIn[];
  messages: IMessage[];
  review?: IReview;
  friendReview?: IReview;
  cancellation?: {
    cancelledBy: mongoose.Types.ObjectId;
    reason: string;
    cancelledAt: Date;
    refundAmount: number;
  };
  dispute?: {
    disputedBy: mongoose.Types.ObjectId;
    reason: string;
    description: string;
    disputedAt: Date;
    status: 'open' | 'under-review' | 'resolved';
    resolution?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const CheckInSchema: Schema = new Schema({
  type: {
    type: String,
    enum: ['auto', 'manual', 'sos'],
    required: true
  },
  timestamp: { type: Date, default: Date.now },
  location: {
    lat: Number,
    lng: Number
  },
  isEmergency: { type: Boolean, default: false },
  notes: String
});

const MessageSchema: Schema = new Schema({
  senderId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: { type: String, required: true },
  type: {
    type: String,
    enum: ['text', 'image', 'voice', 'system'],
    default: 'text'
  },
  timestamp: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false }
});

const ReviewSchema: Schema = new Schema({
  reviewerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: { type: String, maxlength: 1000 },
  categories: {
    punctuality: { type: Number, min: 1, max: 5 },
    communication: { type: Number, min: 1, max: 5 },
    professionalism: { type: Number, min: 1, max: 5 },
    overall: { type: Number, min: 1, max: 5 }
  },
  createdAt: { type: Date, default: Date.now }
});

const SituationSchema: Schema = new Schema({
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['wedding', 'fitness', 'travel', 'cultural', 'social', 'professional', 'other'],
    required: true
  },
  context: [{ type: String }],
  urgency: {
    type: String,
    enum: ['flexible', 'soon', 'urgent'],
    default: 'flexible'
  },
  specialRequirements: [{ type: String }]
});

const BookingSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    friendId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    packageId: {
      type: Schema.Types.ObjectId,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'disputed'],
      default: 'pending'
    },
    situation: {
      type: SituationSchema,
      required: true
    },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    duration: { type: Number, required: true },
    location: {
      address: { type: String, required: true },
      coordinates: [Number],
      notes: String,
      venueName: String
    },
    pricing: {
      hourlyRate: { type: Number, required: true },
      totalHours: { type: Number, required: true },
      subtotal: { type: Number, required: true },
      platformFee: { type: Number, required: true },
      totalAmount: { type: Number, required: true },
      friendEarnings: { type: Number, required: true }
    },
    payment: {
      status: {
        type: String,
        enum: ['pending', 'held', 'released', 'refunded'],
        default: 'pending'
      },
      razorpayOrderId: String,
      razorpayPaymentId: String,
      paidAt: Date,
      refundedAt: Date,
      refundAmount: Number
    },
    safetyCode: {
      type: String,
      required: true
    },
    checkIns: [CheckInSchema],
    messages: [MessageSchema],
    review: ReviewSchema,
    friendReview: ReviewSchema,
    cancellation: {
      cancelledBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      reason: String,
      cancelledAt: Date,
      refundAmount: Number
    },
    dispute: {
      disputedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      reason: String,
      description: String,
      disputedAt: Date,
      status: {
        type: String,
        enum: ['open', 'under-review', 'resolved'],
        default: 'open'
      },
      resolution: String
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes
BookingSchema.index({ userId: 1 });
BookingSchema.index({ friendId: 1 });
BookingSchema.index({ status: 1 });
BookingSchema.index({ startTime: 1 });
BookingSchema.index({ createdAt: -1 });
BookingSchema.index({ 'payment.status': 1 });

// Virtual for time until booking
BookingSchema.virtual('timeUntilStart').get(function (this: IBooking) {
  return this.startTime.getTime() - Date.now();
});

// Virtual for isUpcoming
BookingSchema.virtual('isUpcoming').get(function (this: IBooking) {
  return this.startTime > new Date() && ['pending', 'confirmed'].includes(this.status);
});

export default mongoose.model<IBooking>('Booking', BookingSchema);
