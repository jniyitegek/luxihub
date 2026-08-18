export type UserRole = 'CUSTOMER' | 'PARTNER' | 'ADMIN';

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
}

export type SubscriptionTier = 'STANDARD' | 'CERTIFIED' | 'ELITE';

export type BusinessType = 'HOTEL' | 'RESTAURANT' | 'TOUR';
export type RwandanRegion = 'Kigali' | 'Musanze' | 'Rubavu' | 'Nyungwe' | 'Akagera';
export type CertificationBadge = 'LUXE_VERIFIED' | 'GOLD_STANDARD' | 'ECO_SUSTAINABLE' | 'NONE';

export interface BusinessListing {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  type: BusinessType;
  location: RwandanRegion;
  address: string;
  description: string;
  shortTagline?: string;
  amenities: string[];
  images: string[];
  pricingTier: '$$' | '$$$' | '$$$$';
  basePrice: number;
  currency: string;
  status: 'PENDING' | 'VERIFIED' | 'SUSPENDED';
  certificationBadge: CertificationBadge;
  ratingAvg: number;
  reviewCount: number;
  isFeatured: boolean;
  subscriptionTier: SubscriptionTier;
  featuredUntil?: string;
  phone?: string;
  email?: string;
  website?: string;
  responseRate: number;
  qualityScore?: number;
  responseTimeHours?: number;
  createdAt: string;
  offerings?: ServiceOfferingDto[];
  reviews?: ReviewDto[];
}

export interface ServiceOfferingDto {
  id: string;
  businessId: string;
  title: string;
  description: string;
  capacity: number;
  price: number;
  currency: string;
  unit: 'per_night' | 'per_person' | 'per_table' | 'per_tour';
  duration?: string;
  images: string[];
  inclusions: string[];
  isAvailable: boolean;
}

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
export type PaymentStatus = 'UNPAID' | 'DEPOSIT_PAID' | 'FULLY_PAID' | 'REFUNDED';
export type PaymentProvider = 'MTN_MOMO' | 'AIRTEL_MONEY' | 'CARD' | 'FLUTTERWAVE';

export interface BookingDto {
  id: string;
  bookingRef: string;
  customerId: string;
  businessId: string;
  serviceOfferingId: string;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  totalAmount: number;
  depositAmount: number;
  commissionAmount: number;
  payoutAmount: number;
  currency: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  specialRequests?: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  createdAt: string;
  business?: BusinessListing;
  serviceOffering?: ServiceOfferingDto;
  payment?: PaymentDto;
  review?: ReviewDto;
}

export interface PaymentDto {
  id: string;
  bookingId: string;
  transactionRef: string;
  provider: PaymentProvider;
  amount: number;
  currency: string;
  status: 'INITIATED' | 'SUCCESS' | 'FAILED';
  payerPhone?: string;
  channelResponse?: string;
  paidAt?: string;
}

export interface ReviewDto {
  id: string;
  bookingId: string;
  businessId: string;
  customerId: string;
  rating: number;
  cleanlinessRating: number;
  serviceRating: number;
  hospitalityRating: number;
  valueRating: number;
  title: string;
  comment: string;
  partnerReply?: string;
  partnerRepliedAt?: string;
  isVerified: boolean;
  createdAt: string;
  customer?: {
    name: string;
    avatarUrl?: string;
  };
}

export interface QAAuditDto {
  id: string;
  businessId: string;
  auditorName: string;
  score: number;
  badgeGranted: CertificationBadge;
  notes: string;
  inspectionItems: {
    category: string;
    item: string;
    passed: boolean;
    score: number;
  }[];
  auditDate: string;
}

export interface TrainingCourseDto {
  id: string;
  title: string;
  slug: string;
  category: string;
  duration: string;
  durationHours?: number;
  price: number;
  currency: string;
  instructor: string;
  instructorBio: string;
  description: string;
  modules: string[];
  level: string;
  rating: number;
  enrolledCount: number;
  image: string;
}

export interface LeaderboardHighlightDto {
  quote: string;
  reviewerName: string;
  rating: number;
  createdAt: string;
  isRealReview: boolean;
}

export interface LeaderboardEntryDto {
  id: string;
  slug: string;
  name: string;
  type: BusinessType;
  location: RwandanRegion;
  image: string;
  certificationBadge: CertificationBadge;
  ratingAvg: number;
  reviewCount: number;
  liveScore: number;
  trend: 'rising' | 'steady';
  highlight: LeaderboardHighlightDto;
}

export interface LeaderboardBoardsDto {
  updatedAt: string;
  boards: Record<'ALL' | 'HOTEL' | 'RESTAURANT' | 'TOUR', LeaderboardEntryDto[]>;
}

export type LoyaltyTier = 'EXPLORER' | 'CONNOISSEUR' | 'AMBASSADOR';

export interface LoyaltyTransactionDto {
  id: string;
  bookingId?: string | null;
  points: number;
  type: 'EARNED' | 'REDEEMED';
  description: string;
  createdAt: string;
}

export interface LoyaltyStatusDto {
  points: number;
  tier: LoyaltyTier;
  nextTier: LoyaltyTier | null;
  pointsToNextTier: number;
  transactions: LoyaltyTransactionDto[];
}

export interface PartnerSubscriptionDto {
  id: string;
  businessId: string;
  planTier: SubscriptionTier;
  billingCycle: 'MONTHLY' | 'ANNUAL';
  price: number;
  currency: string;
  status: 'ACTIVE' | 'CANCELLED';
  nextBillingDate: string;
  perks: string[];
}

export interface SupportTicketDto {
  id: string;
  ticketRef: string;
  userId: string;
  subject: string;
  category: 'BOOKING' | 'PAYMENT' | 'PARTNER_ONBOARDING' | 'QA_DISPUTE' | 'VIP_CONCIERGE';
  message: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'VIP';
  responses: {
    senderName: string;
    senderRole: string;
    message: string;
    timestamp: string;
  }[];
  createdAt: string;
}
