export interface User {
  id: string;
  name: string;
  email: string;
  college: string;
  department: string;
  semester: number;
  avatar: string;
  rating: number;
  reviewsCount: number;
  joinedDate: string;
  spamScore?: number;
  scamScore?: number;
  flagged?: boolean;
  blocked?: boolean;
  blockReason?: string;
}

export type BookCondition = 'New' | 'Like New' | 'Very Good' | 'Good' | 'Acceptable';

export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  condition: BookCondition;
  price: number;
  originalPrice: number;
  description: string;
  images: string[];
  sellerId: string;
  sellerName: string;
  sellerRating: number;
  sellerAvatar: string;
  college: string;
  department: string;
  semester: number;
  pickupLocation: string;
  createdAt: string;
  isFeatured: boolean;
  isPopular: boolean;
  status: 'active' | 'sold' | 'pending';
  salePending?: boolean;
  sellerSpamScore?: number;
  sellerScamScore?: number;
  metadata?: Record<string, any>;
}

export interface Review {
  id: string;
  reviewerName: string;
  reviewerAvatar: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export interface Chat {
  id: string;
  bookId: string;
  bookTitle: string;
  bookImage: string;
  bookPrice: number;
  buyerId: string;
  sellerId: string;
  otherParticipant: {
    id: string;
    name: string;
    avatar: string;
    rating: number;
    college: string;
    flagged?: boolean;
    blocked?: boolean;
  };
  lastMessage?: string;
  lastMessageTime?: string;
  unread: boolean;
  bookIsSold?: boolean;
  buyerConfirmedReceipt?: boolean;
  salePending?: boolean;
}

export interface SearchFilters {
  query: string;
  category: string;
  condition: BookCondition[];
  minPrice: number;
  maxPrice: number;
  college: string;
  sort: string;
}
