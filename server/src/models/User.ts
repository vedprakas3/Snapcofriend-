import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IEmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  phone?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'non-binary' | 'prefer-not-say';
  isFriend: boolean;
  isVerified: boolean;
  verificationStatus: 'pending' | 'in-review' | 'verified' | 'rejected';
  role: 'user' | 'admin' | 'moderator';
  rating: number;
  reviewCount: number;
  emergencyContact?: IEmergencyContact;
  location?: {
    type: 'Point';
    coordinates: [number, number];
    address?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  languages: string[];
  bio?: string;
  stripeCustomerId?: string;
  stripeConnectId?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  matchPassword(enteredPassword: string): Promise<boolean>;
  getFullName(): string;
}

const EmergencyContactSchema: Schema = new Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  relationship: { type: String, required: true }
});

const UserSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false
    },
    firstName: {
      type: String,
      required: [true, 'Please provide first name'],
      trim: true
    },
    lastName: {
      type: String,
      required: [true, 'Please provide last name'],
      trim: true
    },
    avatar: {
      type: String,
      default: ''
    },
    phone: {
      type: String,
      default: ''
    },
    dateOfBirth: {
      type: Date
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'non-binary', 'prefer-not-say'],
      default: 'prefer-not-say'
    },
    isFriend: {
      type: Boolean,
      default: false
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'in-review', 'verified', 'rejected'],
      default: 'pending'
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'moderator'],
      default: 'user'
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    reviewCount: {
      type: Number,
      default: 0
    },
    emergencyContact: {
      type: EmergencyContactSchema,
      default: null
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: [0, 0]
      },
      address: String,
      city: String,
      state: String,
      country: String
    },
    languages: {
      type: [String],
      default: ['English']
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot be more than 500 characters']
    },
    stripeCustomerId: {
      type: String,
      select: false
    },
    stripeConnectId: {
      type: String,
      select: false
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastLogin: {
      type: Date
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index for geospatial queries
UserSchema.index({ location: '2dsphere' });

// Index for email lookups
UserSchema.index({ email: 1 });

// Virtual for full name
UserSchema.virtual('fullName').get(function (this: IUser) {
  return `${this.firstName} ${this.lastName}`;
});

// Hash password before saving
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) {
    next();
    return;
  }
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match password method
UserSchema.methods.matchPassword = async function (
  enteredPassword: string
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Get full name method
UserSchema.methods.getFullName = function (): string {
  return `${this.firstName} ${this.lastName}`;
};

export default mongoose.model<IUser>('User', UserSchema);
