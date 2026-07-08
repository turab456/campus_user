// src/services/backendApi.ts
/**
 * Wrapper around the backend REST API for the Campus Marketplace.
 * Uses the Fetch API with `credentials: 'include'` for refresh tokens.
 * Handles automatic access token injection and refresh on 401s.
 */

import * as mockDB from './mockData';
import type { Book, User, Review, Chat, Message, SearchFilters } from '../types';

const mapListing = (listing: any): Book => {
  if (!listing) return listing;
  const seller = listing.seller || {};
  return {
    ...listing,
    id: listing._id || listing.id,
    status: listing.isSold ? 'sold' : (listing.salePending ? 'pending' : (listing.status || 'active')),
    category: typeof listing.category === 'object' && listing.category !== null
      ? (listing.category.name ? listing.category.name.toLowerCase().replace(/ /g, '-') : '')
      : listing.category,
    sellerId: seller._id || seller.id || listing.sellerId || '',
    sellerName: seller.name || listing.sellerName || '',
    sellerAvatar: seller.avatarUrl || seller.avatar || listing.sellerAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    sellerRating: seller.rating || listing.sellerRating || 5.0,
    sellerSpamScore: seller.spamScore || 0,
    sellerScamScore: seller.scamScore || 0,
    metadata: listing.metadata || {},
    distanceKm: listing.distanceKm,
    isNearMe: listing.isNearMe,
  };
};

const mapUser = (user: any): User => {
  if (!user) return user;
  return {
    ...user,
    id: user._id || user.id,
    avatar: user.avatarUrl || user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    rating: user.rating || 5.0,
    reviewsCount: user.reviewsCount || 0,
    joinedDate: user.joinedDate || user.createdAt || new Date().toISOString(),
    addressLine: user.addressLine || '',
    city: user.city || '',
    state: user.state || '',
    pincode: user.pincode || '',
    coordinates: user.coordinates,
  };
};

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://campus-be-qkrx.onrender.com';

let currentAccessToken: string | null = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
let unauthorizedCallback: (() => void) | null = null;
let rateLimitCallback: (() => void) | null = null;

export const setAccessToken = (token: string | null) => {
  currentAccessToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('accessToken', token);
    } else {
      localStorage.removeItem('accessToken');
    }
  }
};

export const getAccessToken = () => currentAccessToken;

export const setOnUnauthorized = (cb: () => void) => {
  unauthorizedCallback = cb;
};

export const setOnRateLimit = (cb: () => void) => {
  rateLimitCallback = cb;
};

function toQueryString(params: Record<string, any>): string {
  const esc = encodeURIComponent;
  const query = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => {
      if (Array.isArray(v)) {
        return v.map((val) => `${esc(k)}=${esc(val)}`).join('&');
      }
      return `${esc(k)}=${esc(v)}`;
    })
    .join('&');
  return query ? `?${query}` : '';
}

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers);
  if (currentAccessToken) {
    headers.set('Authorization', `Bearer ${currentAccessToken}`);
  }
  
  const config = { ...options, headers, credentials: 'include' as RequestCredentials };
  let res = await fetch(url, config);

  if (res.status === 401) {
    // Try to refresh token
    try {
      const refreshRes = await fetch(`${BASE_URL}/api/auth/refresh-token`, {
        method: 'GET',
        credentials: 'include',
      });
      if (refreshRes.ok) {
        const data = await refreshRes.json();
        setAccessToken(data.accessToken);
        // Retry original request
        headers.set('Authorization', `Bearer ${data.accessToken}`);
        res = await fetch(url, { ...config, headers });
      } else {
        // Refresh failed, logout user
        setAccessToken(null);
        if (unauthorizedCallback) unauthorizedCallback();
      }
    } catch (e) {
      setAccessToken(null);
      if (unauthorizedCallback) unauthorizedCallback();
    }
  }

  if (res.status === 429) {
    if (rateLimitCallback) rateLimitCallback();
  }

  return res;
}

async function get<T>(path: string, params?: Record<string, any>): Promise<T> {
  const url = `${BASE_URL}${path}${params ? toQueryString(params) : ''}`;
  const res = await fetchWithAuth(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const error = new Error(err.message || `GET ${path} failed with ${res.status}`);
    (error as any).status = res.status;
    (error as any).isHttpError = true;
    throw error;
  }
  return (await res.json()) as T;
}

async function post<T>(path: string, body: any): Promise<T> {
  const res = await fetchWithAuth(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const error = new Error(err.message || `POST ${path} failed with ${res.status}`);
    (error as any).status = res.status;
    (error as any).isHttpError = true;
    throw error;
  }
  return (await res.json()) as T;
}

async function put<T>(path: string, body: any): Promise<T> {
  const res = await fetchWithAuth(`${BASE_URL}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const error = new Error(err.message || `PUT ${path} failed with ${res.status}`);
    (error as any).status = res.status;
    (error as any).isHttpError = true;
    throw error;
  }
  return (await res.json()) as T;
}

async function del<T>(path: string): Promise<T> {
  const res = await fetchWithAuth(`${BASE_URL}${path}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const error = new Error(err.message || `DELETE ${path} failed with ${res.status}`);
    (error as any).status = res.status;
    (error as any).isHttpError = true;
    throw error;
  }
  return (await res.json()) as T;
}

// Simulated delay helper for mock methods
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const backendApi = {
  setOnUnauthorized(cb: () => void) {
    setOnUnauthorized(cb);
  },
  setOnRateLimit(cb: () => void) {
    setOnRateLimit(cb);
  },
  // Auth
  async login(email: string, password?: string) {
    // If backend isn't using password in tests yet, we just provide it. 
    // Wait, the backend requires a password. For prototype ease we'll default it if not passed.
    const res = await post<{ success: boolean; accessToken: string; user: any }>('/api/auth/login', {
      email,
      password: password || 'password123'
    });
    setAccessToken(res.accessToken);
    return mapUser(res.user);
  },

  async register(name: string, email: string, password?: string, college?: string, department?: string, semester?: number) {
    return post<{ success: boolean; message: string }>('/api/auth/register', {
      name,
      email,
      password: password || 'password123',
      college,
      department,
      semester
    });
  },

  async verifyEmail(token: string, id: string) {
    return get<{ success: boolean; message: string }>('/api/auth/verify-email', { token, id });
  },

  async resendVerification(email: string) {
    return post<{ success: boolean; message: string }>('/api/auth/resend-verification', { email });
  },

  async logout() {
    try {
      await post('/api/auth/logout', {});
    } finally {
      setAccessToken(null);
    }
  },

  async refreshToken() {
    const res = await get<{ success: boolean; accessToken: string }>('/api/auth/refresh-token');
    setAccessToken(res.accessToken);
    return res.accessToken;
  },

  // Listings
  async getBooks(filters?: Partial<SearchFilters>) {
    // Build params using the field names the backend expects
    const params: Record<string, string> = {};
    if (filters?.query) params.search = filters.query;
    if (filters?.category && filters.category !== 'all') params.category = filters.category;
    if (filters?.condition && filters.condition.length > 0) params.condition = filters.condition.join(',');
    if (filters?.minPrice && filters.minPrice > 0) params.minPrice = String(filters.minPrice);
    if (filters?.maxPrice && filters.maxPrice < 5000) params.maxPrice = String(filters.maxPrice);
    if (filters?.sort && filters.sort !== 'recent') params.sort = filters.sort;
    if (filters?.nearMe) params.nearMe = String(filters.nearMe);

    return get<{ success: boolean; listings: any[] }>(
      '/api/listings/search',
      params
    ).then((r) => r.listings.map(mapListing)).catch(async (error) => {
      if (error && error.isHttpError) throw error;
      // Fallback to mock if backend not ready
      await delay(350);
      let books = mockDB.getStoredBooks();
      books = books.filter(b => b.status === 'active');
      return books;
    });
  },

  async getBookById(id: string) {
    return get<{ success: boolean; listing: any }>(`/api/listings/${id}`).then((r) => mapListing(r.listing)).catch(async (error) => {
      if (error && error.isHttpError) throw error;
      await delay(250);
      return mockDB.getStoredBooks().find(b => b.id === id) || null;
    });
  },
  async createListing(listingData: any) {
    return post<{ success: boolean; listing: any }>('/api/listings', listingData).then((r) => mapListing(r.listing));
  },
  async updateListing(id: string, updates: any) {
    return put<{ success: boolean; listing: any }>(`/api/listings/${id}`, updates).then((r) => mapListing(r.listing));
  },
  async markAsSold(id: string, buyerId?: string) {
    return post<{ success: boolean; data: { listing: any } }>(`/api/violations/mark-sold/${id}`, { buyerId })
      .then((r) => mapListing(r.data.listing));
  },
  async confirmReceipt(id: string): Promise<any> {
    return post<any>(`/api/violations/confirm-receipt/${id}`, {});
  },
  async cancelPendingSale(id: string): Promise<any> {
    return post<any>(`/api/violations/cancel-sale/${id}`, {});
  },
  async getChatsForBook(bookId: string): Promise<Chat[]> {
    return get<{ success: boolean; chats: Chat[] }>('/api/chat')
      .then(r => r.chats.filter(c => c.bookId === bookId))
      .catch(() => []);
  },
  async deleteListing(id: string) {
    return del<{ success: boolean; message?: string }>(`/api/listings/${id}`).then((r) => r.success);
  },
  
  // Users
  async getUserProfile() {
    return get<{ success: boolean; user: any }>('/api/users/me').then((r) => mapUser(r.user));
  },
  async updateProfile(id: string | Partial<User>, updates?: Partial<User>) {
    const payload = updates || (id as Partial<User>);
    return put<{ success: boolean; user: any }>('/api/users/me', payload).then((r) => mapUser(r.user));
  },
  async getSellerDetails(id: string) {
    const res = await get<{ success: boolean; user: any; listings: any[]; reviews: any[] }>(`/api/users/${id}`);
    return {
      user: mapUser(res.user),
      listings: res.listings.map(mapListing),
      reviews: res.reviews || [],
    };
  },

  // Wishlist (HTTP integration with mock fallback)
  async getWishlist(): Promise<string[]> {
    return get<{ success: boolean; wishlist: string[] }>('/api/wishlist')
      .then(r => r.wishlist)
      .catch(async (error) => {
        if (error && error.isHttpError) throw error;
        await delay(200);
        return mockDB.getStoredWishlist();
      });
  },
  async toggleWishlist(bookId: string): Promise<boolean> {
    return post<{ success: boolean; isSaved: boolean }>('/api/wishlist/toggle', { bookId })
      .then(r => r.isSaved)
      .catch(async (error) => {
        if (error && error.isHttpError) throw error;
        await delay(250);
        const wishlist = mockDB.getStoredWishlist();
        const index = wishlist.indexOf(bookId);
        let isSaved = false;
        if (index > -1) {
          wishlist.splice(index, 1);
        } else {
          wishlist.push(bookId);
          isSaved = true;
        }
        mockDB.saveStoredWishlist(wishlist);
        return isSaved;
      });
  },

  // Chats & Messages (HTTP integration with mock fallback)
  async getChats(userId: string): Promise<Chat[]> {
    return get<{ success: boolean; chats: Chat[] }>('/api/chat')
      .then(r => r.chats)
      .catch(async (error) => {
        if (error && error.isHttpError) throw error;
        await delay(300);
        return mockDB.getStoredChats().filter(c => c.buyerId === userId || c.sellerId === userId);
      });
  },
  async getMessages(chatId: string): Promise<Message[]> {
    return get<{ success: boolean; messages: Message[] }>(`/api/messages/${chatId}`)
      .then(r => r.messages)
      .catch(async (error) => {
        if (error && error.isHttpError) throw error;
        await delay(200);
        return mockDB.getStoredMessages().filter(m => m.chatId === chatId).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      });
  },
  async sendMessage(chatId: string, senderId: string, text: string): Promise<Message> {
    return post<{ success: boolean; message: Message }>('/api/messages', { chatId, text })
      .then(r => r.message)
      .catch(async (error) => {
        if (error && error.isHttpError) throw error;
        await delay(100);
        const messages = mockDB.getStoredMessages();
        const newMessage: Message = {
          id: 'm_' + Math.random().toString(36).substr(2, 9),
          chatId, senderId, text, timestamp: new Date().toISOString()
        };
        messages.push(newMessage);
        mockDB.saveStoredMessages(messages);
        const chats = mockDB.getStoredChats();
        const chatIndex = chats.findIndex(c => c.id === chatId);
        if (chatIndex > -1) {
          chats[chatIndex].lastMessage = text;
          chats[chatIndex].lastMessageTime = newMessage.timestamp;
          chats[chatIndex].unread = true;
          mockDB.saveStoredChats(chats);
        }
        return newMessage;
      });
  },
  async createOrGetChat(bookId: string, buyerId: string): Promise<Chat> {
    return post<{ success: boolean; chat: Chat }>('/api/chat', { bookId })
      .then(r => r.chat)
      .catch(async (error) => {
        if (error && error.isHttpError) throw error;
        await delay(400);
        const chats = mockDB.getStoredChats();
        const books = mockDB.getStoredBooks();
        const book = books.find(b => b.id === bookId);
        if (!book) throw new Error('Book not found');
        const existing = chats.find(c => c.bookId === bookId && c.buyerId === buyerId && c.sellerId === book.sellerId);
        if (existing) return existing;
        const users = mockDB.getStoredUsers();
        const seller = users.find(u => u.id === book.sellerId) || users[0];
        const newChat: Chat = {
          id: 'c_' + Math.random().toString(36).substr(2, 9),
          bookId: book.id, bookTitle: book.title, bookImage: book.images[0], bookPrice: book.price,
          buyerId, sellerId: book.sellerId,
          otherParticipant: { id: seller.id, name: seller.name, avatar: seller.avatar, rating: seller.rating, college: seller.college },
          lastMessage: `Interested in buying "${book.title}"`,
          lastMessageTime: new Date().toISOString(), unread: true
        };
        chats.push(newChat);
        mockDB.saveStoredChats(chats);
        return newChat;
      });
  },
  async markChatAsRead(chatId: string): Promise<boolean> {
    return put<{ success: boolean }>('/api/chat/' + chatId + '/read', {})
      .then(r => r.success)
      .catch(() => true);
  },
  async addReview(sellerId: string, rating: number, comment: string): Promise<Review> {
    return post<{ success: boolean; review: Review }>(`/api/users/${sellerId}/reviews`, { rating, comment })
      .then(r => r.review);
  },
  async createReconsiderationTicket(reason: string): Promise<any> {
    return post<any>('/api/users/reconsideration-tickets', { reason });
  },
  async getReconsiderationStatus(): Promise<any> {
    return get<any>('/api/users/reconsideration-tickets/my-status');
  },

  // ---- Notifications ----
  async getNotifications(page = 1, limit = 20): Promise<{ notifications: any[]; unreadCount: number; pagination: any }> {
    return get<any>('/api/notifications', { page, limit });
  },
  async getUnreadNotificationCount(): Promise<number> {
    return get<{ success: boolean; unreadCount: number }>('/api/notifications/unread-count')
      .then(r => r.unreadCount)
      .catch(() => 0);
  },
  async markNotificationRead(notificationId: string): Promise<void> {
    await put<any>(`/api/notifications/${notificationId}/read`, {});
  },
  async markAllNotificationsRead(): Promise<void> {
    await put<any>('/api/notifications/mark-all-read', {});
  },
  async getVapidPublicKey(): Promise<string> {
    return get<{ success: boolean; publicKey: string }>('/api/users/vapid-public-key').then(r => r.publicKey);
  },
  async subscribePush(subscription: any): Promise<any> {
    return post<any>('/api/users/push-subscription', { subscription });
  },
  async unsubscribePush(endpoint: string): Promise<any> {
    return post<any>('/api/users/push-subscription/remove', { endpoint });
  },
};

export default backendApi;
