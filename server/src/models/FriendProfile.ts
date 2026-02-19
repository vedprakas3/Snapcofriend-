import mongoose, { Document, Schema } from 'mongoose';

export interface IPresencePackage {
  _id?: mongoose.Types.ObjectId;
  title: string;
  category: 'wedding' | 'fitness' | 'travel' | 'cultural' | 'social' | 'professional' | 'other';
  description: string;
  hourlyRate: number;
  minHours: number;
  maxHours: number;
  requirements: string[];
  whatsIncluded: string[];
  isActive: boolean;
  rating: number;
  reviewCount: number;
  createdAt?: Date;
}

export interface IAvailability {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface IFriendProfile extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  bio: string;
  headline?: string;
  specialties: string[];
  skills: string[];
  experience: string;
  education?: string;
  languages: string[];
  location: {
    type: 'Point';
    coordinates: [number, number];
    address?: string;
    city: string;
    state?: string;
    country?: string;
  };
  serviceRadius: number; // in miles
  presencePackages: IPresencePackage[];
  availability: IAvailability[];
  isAvailableNow: boolean;
  responseTime: number; // in minutes
  responseRate: number; // percentage
  completionRate: number; // percentage
  totalBookings: number;
  totalEarnings: number;
  verificationStatus: {
    idVerified: boolean;
    backgroundChecked: boolean;
    videoIntro: boolean;
    phoneVerified: boolean;
    emailVerified: boolean;
  };
  verificationDocuments: {
    idDocument?: string;
    backgroundCheckUrl?: string;
    videoIntroUrl?: string;
  };
  isActive: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PresencePackageSchema: Schema = new Schema({
  title: { type: String, required: true },
  category: {
    type: String,
    enum: ['wedding', 'fitness', 'travel', 'cultural', 'social', 'professional', 'other'],
    required: true
  },
  description: { type: String, required: true },
  hourlyRate: {
    type: Number,
    required: true,
    min: 20,
    max: 200
  },
  minHours: { type: Number, default: 1 },
  maxHours: { type: Number, default: 8 },
  requirements: [{ type: String }],
  whatsIncluded: [{ type: String }],
  isActive: { type: Boolean, default: true },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const AvailabilitySchema: Schema = new Schema({
  day: {
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    required: true
  },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  isAvailable: { type: Boolean, default: true }
});

const FriendProfileSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    bio: {
      type: String,
      required: true,
      maxlength: [2000, 'Bio cannot exceed 2000 characters']
    },
    headline: {
      type: String,
      maxlength: [150, 'Headline cannot exceed 150 characters']
    },
    specialties: [{ type: String }],
    skills: [{ type: String }],
    experience: {
      type: String,
      required: true
    },
    education: {
      type: String
    },
    languages: [{ type: String }],
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        required: true
      },
      address: String,
      city: { type: String, required: true },
      state: String,
      country: { type: String, default: 'USA' }
    },
    serviceRadius: {
      type: Number,
      default: 25,
      min: 5,
      max: 100
    },
    presencePackages: [PresencePackageSchema],
    availability: [AvailabilitySchema],
    isAvailableNow: {
      type: Boolean,
      default: false
    },
    responseTime: {
      type: Number,
      default: 60
    },
    responseRate: {
      type: Number,
      default: 100
    },
    completionRate: {
      type: Number,
      default: 100
    },
    totalBookings: {
      type: Number,
      default: 0
    },
    totalEarnings: {
      type: Number,
      default: 0
    },
    verificationStatus: {
      idVerified: { type: Boolean, default: false },
      backgroundChecked: { type: Boolean, default: false },
      videoIntro: { type: Boolean, default: false },
      phoneVerified: { type: Boolean, default: false },
      emailVerified: { type: Boolean, default: false }
    },
    verificationDocuments: {
      idDocument: String,
      backgroundCheckUrl: String,
      videoIntroUrl: String
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isFeatured: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes
FriendProfileSchema.index({ userId: 1 });
FriendProfileSchema.index({ location: '2dsphere' });
FriendProfileSchema.index({ city: 1 });
FriendProfileSchema.index({ 'presencePackages.category': 1 });
FriendProfileSchema.index({ isActive: 1, isFeatured: 1 });

// Virtual for average rating
FriendProfileSchema.virtual('averageRating').get(function (this: IFriendProfile) {
  if (this.presencePackages.length === 0) return 0;
  const totalRating = this.presencePackages.reduce((sum, pkg) => sum + pkg.rating, 0);
  return totalRating / this.presencePackages.length;
});

export default mongoose.model<IFriendProfile>('FriendProfile', FriendProfileSchema);
