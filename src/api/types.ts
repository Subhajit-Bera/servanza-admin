// Dashboard API Types (matching backend response)

export interface DashboardStats {
    users: {
        total: number;
    };
    buddies: {
        total: number;
        active: number;
    };
    bookings: {
        total: number;
        today: number;
        thisMonth: number;
        completed: number;
        pending: number;
    };
    revenue: {
        total: number;
        thisMonth: number;
    };
}

export interface BookingsByStatus {
    status: string;
    _count: number;
}

export interface AnalyticsData {
    bookingsByStatus: BookingsByStatus[];
    bookingsByService: Array<{
        serviceId: string;
        _count: number;
        service?: {
            title: string;
        };
    }>;
    revenueByDay?: Array<{
        date: string;
        amount: number;
    }>;
}

export interface RecentBooking {
    id: string;
    orderNumber: string;
    user: {
        id: string;
        name: string;
        email?: string;
        profileImage?: string;
    };
    service?: {
        id: string;
        title: string;
    };
    buddy?: {
        id: string;
        user: {
            name: string;
            profileImage?: string;
        };
    };
    scheduledStart: string;
    scheduledEnd: string;
    status: string;
    totalAmount: number;
    createdAt: string;
}

export interface TopBuddy {
    id: string;
    user: {
        name: string;
        profileImage?: string;
    };
    rating: number;
    totalReviews: number;
    completedJobs: number;
    totalEarnings: number;
}

export interface RevenueChartData {
    date: string;
    revenue: number;
    bookings: number;
}

export interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: 'USER' | 'BUDDY' | 'ADMIN';
    isActive: boolean;
    profileImage?: string;
    createdAt: string;
    lastLoginAt?: string;
    addresses?: any[]; // Refine later if needed
    bookings?: any[]; // Refine later if needed
    _count?: {
        bookings: number;
    };
}

// Buddy Types (Force Recompile)

// Per-field verification status
export interface FieldVerificationStatus {
    verified: boolean;
    comment: string | null;
}

export interface VerificationStatus {
    aadhaarFront: FieldVerificationStatus;
    aadhaarBack: FieldVerificationStatus;
    pan: FieldVerificationStatus;
    bankDetails: FieldVerificationStatus;
    emergencyContact: FieldVerificationStatus;
    allVerified: boolean;
}

export interface Buddy {
    id: string;
    userId: string;
    user: {
        id: string;
        name: string;
        email: string;
        phone: string;
        profileImage?: string;
    };
    isVerified: boolean;
    isOnline: boolean;
    isAvailable: boolean;
    rating: number;
    totalJobs: number;
    totalEarnings: number;
    completionRate: number;
    jobStartDate?: string;
    trainingStartDate?: string;
    trainingDaysTaken?: number;
    isTrainingCompleted: boolean;

    // Detailed fields (optional as they might not be in list view)
    dob?: string;
    gender?: string;
    languages?: string[];
    bloodGroup?: string;
    whatsapp?: string;
    secondaryPhone?: string;
    currentAddress?: string;
    permanentAddress?: string;

    // Documents
    documents?: {
        pan?: string;
        aadhaarFront?: string;
        aadhaarBack?: string;
        bankDocument?: string;
    };
    bankDetails?: {
        accountHolderName?: string;
        bankName?: string;
        accountNumber?: string;
        ifscCode?: string;
        bankDocument?: string;
    };
    emergencyContact?: {
        name?: string;
        phone?: string;
        relationship?: string;
    };
    documentsJson?: {
        rejectionReason?: string;
        rejectedAt?: string;
        rejectionField?: string;
    } | null;

    // Per-field verification status (returned by getBuddyById)
    verification?: VerificationStatus;

    createdAt: string;
    updatedAt: string;
}


export interface BuddyAssignment {
    id: string;
    booking: {
        id: string;
        scheduledStart: string;
        scheduledEnd: string;
        status: string;
        totalAmount: number;
        service?: {
            title: string;
        };
    };
    assignedAt: string;
    status: string;
}

export interface BuddyDetails extends Buddy {
    assignments: BuddyAssignment[];
    reviews: any[];
    schedules: any[];
}

// Service & Category Types

export interface Category {
    id: string;
    name: string;
    slug: string;
    icon?: string;
    description?: string;
    isActive: boolean;
    sortOrder?: number;
    createdAt?: string;
    _count?: {
        services: number;
    };
}

export interface ServiceDescription {
    shortDescription?: string;
    description?: string;
    whatsIncluded?: string[];
    whatsNotIncluded?: string[];
    productsWeUse?: string[];
    productsNeededFromCustomer?: string[];
}

export interface Service {
    id: string;
    title: string;
    description?: ServiceDescription | null;
    basePrice: number;
    employeePayout: number;
    cmpPayout: number;
    isInstant: boolean;
    discountedPrice?: number;
    durationMins: number; // in minutes
    categoryId: string;
    category?: Category;
    imageUrl?: string;
    imageUrls?: string[];
    isActive: boolean;
    createdAt?: string;
}

// Booking Types

export interface Booking {
    id: string;
    userId: string;
    serviceId: string;
    addressId: string;
    scheduledStart: string; // ISO Date
    scheduledEnd: string; // ISO Date
    isImmediate: boolean;
    status: string; // PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED, ESCALATED
    paymentStatus: string;
    paymentMethod?: string;
    price: number;
    taxAmount: number;
    discountAmount: number;
    totalAmount: number;
    employeePayout: number;
    cmpPayout: number;
    currency: string;
    specialInstructions?: string;

    user: {
        id: string;
        name: string;
        phone: string;
        email: string;
        profileImage?: string;
    };
    service: {
        id: string;
        title: string;
    };
    address?: {
        id: string;
        label: string;
        formattedAddress: string;
        streetAddress: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        latitude: number;
        longitude: number;
    };
    assignments?: {
        id: string;
        buddyId: string;
        status: string;
        buddy?: {
            id: string;
            user: {
                name: string;
                profileImage?: string;
                phone?: string;
                email: string;
            };
        };
    }[];

    createdAt: string;
    updatedAt: string;
}

// Payloads

export interface CreateServicePayload {
    title: string;
    description?: ServiceDescription | string;
    basePrice: number;
    employeePayout: number;
    cmpPayout: number;
    isInstant: boolean;
    discountedPrice?: number;
    durationMins: number;
    categoryId: string;
    image?: string;
    isActive?: boolean;
}

export interface UpdateServicePayload extends Partial<CreateServicePayload> { }

export interface UpdateBookingStatusPayload {
    status: string;
    reason?: string;
}

export interface BuddyVerificationPayload {
    buddyId: string;
    field: 'aadhaarFront' | 'aadhaarBack' | 'pan' | 'bankDetails' | 'emergencyContact';
    comment?: string;
}

// Promotion Types

export interface Promotion {
    id: string;
    title: string;
    subtitle?: string;
    imageUrl: string;
    ctaLabel?: string;
    ctaLink?: string;
    displayOrder: number;
    isActive: boolean;
    startDate?: string;
    endDate?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreatePromotionPayload {
    title: string;
    subtitle?: string;
    imageUrl?: string;
    ctaLabel?: string;
    ctaLink?: string;
    displayOrder?: number;
    isActive?: boolean;
    startDate?: string | null;
    endDate?: string | null;
}

export interface UpdatePromotionPayload extends Partial<CreatePromotionPayload> {}
