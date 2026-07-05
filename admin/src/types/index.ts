export interface User {
  _id: string;
  name: string;
  email: string;
  college?: string;
  department?: string;
  semester?: number;
  avatarUrl?: string;
  isVerified: boolean;
  role: 'student' | 'admin';
  rating: number;
  reviewsCount: number;
  spamScore: number;
  scamScore: number;
  flagged?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Listing {
  _id: string;
  title: string;
  author?: string;
  description: string;
  price: number;
  originalPrice?: number;
  condition: 'New' | 'Like New' | 'Very Good' | 'Good' | 'Acceptable';
  images: string[];
  seller: User;
  category: string;
  college?: string;
  department?: string;
  semester?: number;
  pickupLocation?: string;
  isFeatured: boolean;
  isPopular: boolean;
  isSold: boolean;
  fraudScore: number;
  flagged?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  chat: string;
  sender: User;
  text: string;
  spamScore: number;
  flagged?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SpamReport {
  _id: string;
  messageId: string;
  senderId: string;
  text: string;
  spamScore: number;
  reportedBy: string;
  reason: string;
  createdAt: string;
}

export interface Dashboard {
  totalUsers: number;
  totalListings: number;
  totalMessages: number;
  flaggedUsers: number;
  flaggedListings: number;
  flaggedMessages: number;
  highRiskUsers: User[];
  recentSpamReports: SpamReport[];
}
