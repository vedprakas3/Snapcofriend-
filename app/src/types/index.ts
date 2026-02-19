export interface User {
  id: string;
  _id?: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  phone?: string;
  isFriend: boolean;
  isVerified: boolean;
  verificationStatus: 'pending' | 'in-review' | 'verified' | 'rejected';
  role: 'user' | 'admin' | 'moderator';
  rating: number;
  reviewCount: number;
  languages: string[];
  bio?: string;
  location?: Location;
  emergencyContact?: EmergencyContact;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface Location {
  type: 'Point';
  coordinates: [number, number];
  address?: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface FriendProfile {
  _id: string;
  userId: User | string;
  bio: string;
  headline?: string;
  specialties: string[];
  skills: string[];
  experience: string;
  education?: string;
  languages: string[];
  location: Location;
  serviceRadius: number;
  presencePackages: PresencePackage[];
  availability: Availability[];
  isAvailableNow: boolean;
  responseTime: number;
  responseRate: number;
  completionRate: number;
  totalBookings: number;
  totalEarnings: number;
  verificationStatus: {
    idVerified: boolean;
    backgroundChecked: boolean;
    videoIntro: boolean;
    phoneVerified: boolean;
    emailVerified: boolean;
  };
  isActive: boolean;
  isFeatured: boolean;
  averageRating?: number;
}

export interface PresencePackage {
  _id?: string;
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
  createdAt?: string;
}

export interface Availability {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface Situation {
  description: string;
  category: 'wedding' | 'fitness' | 'travel' | 'cultural' | 'social' | 'professional' | 'other';
  context: string[];
  urgency: 'flexible' | 'soon' | 'urgent';
  specialRequirements?: string[];
}

export interface Booking {
  _id: string;
  userId: User | string;
  friendId: User | string;
  packageId: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'disputed';
  situation: Situation;
  startTime: string;
  endTime: string;
  duration: number;
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
    paidAt?: string;
    refundedAt?: string;
    refundAmount?: number;
  };
  safetyCode: string;
  checkIns: CheckIn[];
  messages: Message[];
  review?: Review;
  friendReview?: Review;
  cancellation?: {
    cancelledBy: string;
    reason: string;
    cancelledAt: string;
    refundAmount: number;
  };
  dispute?: {
    disputedBy: string;
    reason: string;
    description: string;
    disputedAt: string;
    status: 'open' | 'under-review' | 'resolved';
    resolution?: string;
  };
  createdAt: string;
  updatedAt: string;
  isUpcoming?: boolean;
  timeUntilStart?: number;
}

export interface CheckIn {
  _id?: string;
  type: 'auto' | 'manual' | 'sos';
  timestamp: string;
  location?: {
    lat: number;
    lng: number;
  };
  isEmergency: boolean;
  notes?: string;
}

export interface Message {
  _id?: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'voice' | 'system';
  timestamp: string;
  isRead: boolean;
}

export interface Review {
  reviewerId: string;
  rating: number;
  comment: string;
  categories: {
    punctuality: number;
    communication: number;
    professionalism: number;
    overall: number;
  };
  createdAt: string;
}

export interface Match {
  friend: FriendProfile;
  compatibility: number;
  reasons: string[];
  recommendedPackage: PresencePackage | null;
  estimatedTotal: number | null;
}

export interface Conversation {
  bookingId: string;
  otherPerson: User;
  status: string;
  startTime: string;
  unreadCount: number;
  lastMessage: Message | null;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  isFriend?: boolean;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'non-binary' | 'prefer-not-say';
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
