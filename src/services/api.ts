import type { Book, User, Review, Chat, Message, SearchFilters } from '../types';
import * as mockDB from './mockData';

// Simulated delay helper
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  // --- BOOKS & LISTINGS ---
  async getBooks(filters?: Partial<SearchFilters>): Promise<Book[]> {
    await delay(350);
    let books = mockDB.getStoredBooks();
    
    // Filter active items only
    books = books.filter(b => b.status === 'active');

    if (!filters) return books;

    const { query, category, condition, minPrice, maxPrice, college, sort } = filters;

    if (query) {
      const q = query.toLowerCase();
      books = books.filter(
        b => b.title.toLowerCase().includes(q) || 
             b.author.toLowerCase().includes(q) || 
             b.description.toLowerCase().includes(q)
      );
    }

    if (category && category !== 'all') {
      books = books.filter(b => b.category === category);
    }

    if (condition && condition.length > 0) {
      books = books.filter(b => condition.includes(b.condition));
    }

    if (minPrice !== undefined) {
      books = books.filter(b => b.price >= minPrice);
    }

    if (maxPrice !== undefined) {
      books = books.filter(b => b.price <= maxPrice);
    }

    if (college) {
      books = books.filter(b => b.college.toLowerCase().includes(college.toLowerCase()));
    }

    // Sort
    if (sort) {
      if (sort === 'price_low') {
        books.sort((a, b) => a.price - b.price);
      } else if (sort === 'price_high') {
        books.sort((a, b) => b.price - a.price);
      } else if (sort === 'condition_desc') {
        const conditionWeight = { 'New': 5, 'Like New': 4, 'Very Good': 3, 'Good': 2, 'Acceptable': 1 };
        books.sort((a, b) => (conditionWeight[b.condition] || 0) - (conditionWeight[a.condition] || 0));
      } else {
        // default recent
        books.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    }

    return books;
  },

  async getBookById(id: string): Promise<Book | null> {
    await delay(250);
    const books = mockDB.getStoredBooks();
    return books.find(b => b.id === id) || null;
  },

  async createListing(
    listingData: Omit<Book, 'id' | 'sellerId' | 'sellerName' | 'sellerRating' | 'sellerAvatar' | 'createdAt' | 'status'>,
    sellerId: string
  ): Promise<Book> {
    await delay(500);
    const books = mockDB.getStoredBooks();
    const users = mockDB.getStoredUsers();
    const seller = users.find(u => u.id === sellerId) || users[0];

    const newBook: Book = {
      ...listingData,
      id: 'b_' + Math.random().toString(36).substr(2, 9),
      sellerId: seller.id,
      sellerName: seller.name,
      sellerRating: seller.rating,
      sellerAvatar: seller.avatar,
      createdAt: new Date().toISOString(),
      status: 'active'
    };

    books.push(newBook);
    mockDB.saveStoredBooks(books);
    return newBook;
  },

  async updateListing(id: string, updates: Partial<Book>): Promise<Book> {
    await delay(400);
    const books = mockDB.getStoredBooks();
    const index = books.findIndex(b => b.id === id);
    if (index === -1) throw new Error('Listing not found');

    books[index] = { ...books[index], ...updates };
    mockDB.saveStoredBooks(books);
    return books[index];
  },

  async markAsSold(id: string): Promise<Book> {
    return this.updateListing(id, { status: 'sold' });
  },

  async deleteListing(id: string): Promise<boolean> {
    await delay(300);
    let books = mockDB.getStoredBooks();
    const initialLen = books.length;
    books = books.filter(b => b.id !== id);
    mockDB.saveStoredBooks(books);
    return books.length < initialLen;
  },

  // --- USER & SELLER PROFILE ---
  async getUserProfile(id: string): Promise<User | null> {
    await delay(200);
    const users = mockDB.getStoredUsers();
    return users.find(u => u.id === id) || null;
  },

  async updateProfile(id: string, updates: Partial<User>): Promise<User> {
    await delay(400);
    const users = mockDB.getStoredUsers();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) throw new Error('User not found');

    users[index] = { ...users[index], ...updates };
    
    // Also sync the seller profile info in all active listings
    let books = mockDB.getStoredBooks();
    books = books.map(book => {
      if (book.sellerId === id) {
        return {
          ...book,
          sellerName: updates.name || book.sellerName,
          sellerAvatar: updates.avatar || book.sellerAvatar,
          college: updates.college || book.college,
          department: updates.department || book.department,
          semester: updates.semester || book.semester,
        };
      }
      return book;
    });
    mockDB.saveStoredBooks(books);
    mockDB.saveStoredUsers(users);
    return users[index];
  },

  async getSellerDetails(id: string): Promise<{ user: User; reviews: Review[]; listings: Book[] } | null> {
    await delay(350);
    const users = mockDB.getStoredUsers();
    const user = users.find(u => u.id === id);
    if (!user) return null;

    const allReviews = mockDB.getStoredReviews();
    const reviews = allReviews[id] || [];

    const allBooks = mockDB.getStoredBooks();
    const listings = allBooks.filter(b => b.sellerId === id);

    return { user, reviews, listings };
  },

  // --- WISHLIST ---
  async getWishlist(): Promise<string[]> {
    await delay(200);
    return mockDB.getStoredWishlist();
  },

  async toggleWishlist(bookId: string): Promise<boolean> {
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
  },

  // --- CHATS & MESSAGES ---
  async getChats(userId: string): Promise<Chat[]> {
    await delay(300);
    const chats = mockDB.getStoredChats();
    // Return chats where user is either buyer or seller
    return chats.filter(c => c.buyerId === userId || c.sellerId === userId);
  },

  async getMessages(chatId: string): Promise<Message[]> {
    await delay(200);
    const messages = mockDB.getStoredMessages();
    return messages.filter(m => m.chatId === chatId).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  },

  async sendMessage(chatId: string, senderId: string, text: string): Promise<Message> {
    await delay(100);
    const messages = mockDB.getStoredMessages();
    const newMessage: Message = {
      id: 'm_' + Math.random().toString(36).substr(2, 9),
      chatId,
      senderId,
      text,
      timestamp: new Date().toISOString()
    };

    messages.push(newMessage);
    mockDB.saveStoredMessages(messages);

    // Update last message in the chat
    const chats = mockDB.getStoredChats();
    const chatIndex = chats.findIndex(c => c.id === chatId);
    if (chatIndex > -1) {
      chats[chatIndex].lastMessage = text;
      chats[chatIndex].lastMessageTime = newMessage.timestamp;
      chats[chatIndex].unread = true; // Mark as unread for the recipient
      mockDB.saveStoredChats(chats);
    }

    return newMessage;
  },

  async createOrGetChat(bookId: string, buyerId: string): Promise<Chat> {
    await delay(400);
    const chats = mockDB.getStoredChats();
    const books = mockDB.getStoredBooks();
    const book = books.find(b => b.id === bookId);
    if (!book) throw new Error('Book not found');

    // Check if chat already exists between this buyer and seller on this book
    const existing = chats.find(c => c.bookId === bookId && c.buyerId === buyerId && c.sellerId === book.sellerId);
    if (existing) return existing;

    const users = mockDB.getStoredUsers();
    const seller = users.find(u => u.id === book.sellerId) || users[0];

    const newChat: Chat = {
      id: 'c_' + Math.random().toString(36).substr(2, 9),
      bookId: book.id,
      bookTitle: book.title,
      bookImage: book.images[0],
      bookPrice: book.price,
      buyerId,
      sellerId: book.sellerId,
      otherParticipant: {
        id: seller.id,
        name: seller.name,
        avatar: seller.avatar,
        rating: seller.rating,
        college: seller.college
      },
      lastMessage: `Interested in buying "${book.title}"`,
      lastMessageTime: new Date().toISOString(),
      unread: true
    };

    chats.push(newChat);
    mockDB.saveStoredChats(chats);

    // Push initial automated message
    const messages = mockDB.getStoredMessages();
    messages.push({
      id: 'm_' + Math.random().toString(36).substr(2, 9),
      chatId: newChat.id,
      senderId: buyerId,
      text: `Hey, I am interested in buying your book "${book.title}" for ₹${book.price}. Is it still available for pickup?`,
      timestamp: new Date().toISOString()
    });
    mockDB.saveStoredMessages(messages);

    return newChat;
  }
};
