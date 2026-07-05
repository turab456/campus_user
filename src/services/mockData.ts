import type { Book, User, Review, Chat, Message } from '../types';

// Standard high-quality mock listings to seed
const SEED_BOOKS: Book[] = [
  {
    id: 'b1',
    title: 'Introduction to Algorithms (CLRS)',
    author: 'Thomas H. Cormen, Charles E. Leiserson',
    category: 'books',
    condition: 'Very Good',
    price: 650,
    originalPrice: 1200,
    description: 'Third edition. Extremely helpful for DSA (Data Structures & Algorithms) classes and interview preparations. The pages have very minimal highlighting. Binding is perfectly intact.',
    images: [
      'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80'
    ],
    sellerId: 'u2',
    sellerName: 'Aarav Sharma',
    sellerRating: 4.8,
    sellerAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    college: 'RV College of Engineering (RVCE), Bangalore',
    department: 'Computer Science & Engineering',
    semester: 5,
    pickupLocation: 'Sardar Patel Block, Campus Hostel',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    isFeatured: true,
    isPopular: true,
    status: 'active'
  },
  {
    id: 'b2',
    title: 'Engineering Electromagnetics',
    author: 'William H. Hayt, John A. Buck',
    category: 'books',
    condition: 'Good',
    price: 320,
    originalPrice: 850,
    description: '8th Edition. Essential for 3rd semester ECE students. Contains some pencil marks and marginal notes, but overall clean and very usable.',
    images: [
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&auto=format&fit=crop&q=80'
    ],
    sellerId: 'u3',
    sellerName: 'Neha Reddy',
    sellerRating: 4.5,
    sellerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    college: 'RV College of Engineering (RVCE), Bangalore',
    department: 'Electronics & Communication Engineering',
    semester: 3,
    pickupLocation: 'ECE Department Block Floor 2',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    isFeatured: true,
    isPopular: false,
    status: 'active'
  },
  {
    id: 'b3',
    title: 'Casio fx-991EX Scientific Calculator',
    author: 'Casio',
    category: 'calculators',
    condition: 'Like New',
    price: 900,
    originalPrice: 1600,
    description: 'ClassWiz edition scientific calculator. Absolutely pristine condition. Used only for one semester exams. Includes the cover case and original user manual.',
    images: [
      'https://images.unsplash.com/photo-1594897030264-ab7d87efc473?w=800&auto=format&fit=crop&q=80'
    ],
    sellerId: 'u4',
    sellerName: 'Rohan Verma',
    sellerRating: 4.9,
    sellerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    college: 'PES University, Bangalore',
    department: 'Mechanical Engineering',
    semester: 7,
    pickupLocation: 'Main Campus Food Court',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    isFeatured: false,
    isPopular: true,
    status: 'active'
  },
  {
    id: 'b4',
    title: 'Atlas Cycle (Single Speed)',
    author: 'Atlas',
    category: 'cycles',
    condition: 'Good',
    price: 2200,
    originalPrice: 5500,
    description: 'Black single speed bicycle. Very convenient for commuting around the large campus. Chain and tires in good shape, brakes working perfectly. Selling since I am graduating.',
    images: [
      'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&auto=format&fit=crop&q=80'
    ],
    sellerId: 'u2',
    sellerName: 'Aarav Sharma',
    sellerRating: 4.8,
    sellerAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    college: 'RV College of Engineering (RVCE), Bangalore',
    department: 'Computer Science & Engineering',
    semester: 8,
    pickupLocation: 'Hostel Block-D Cycle Stand',
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    isFeatured: false,
    isPopular: true,
    status: 'active'
  },
  {
    id: 'b5',
    title: 'Pathology Text Book - Harsh Mohan',
    author: 'Harsh Mohan',
    category: 'books',
    condition: 'Very Good',
    price: 800,
    originalPrice: 1900,
    description: '8th edition Textbook of Pathology. Heavy volume, but essential for 2nd year medical students. Zero stains, pages are neat with standard underlining in a few modules.',
    images: [
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=80'
    ],
    sellerId: 'u5',
    sellerName: 'Dr. Priya Nair',
    sellerRating: 4.7,
    sellerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    college: 'Bangalore Medical College and Research Institute (BMCRI)',
    department: 'MBBS',
    semester: 4,
    pickupLocation: 'College Library Lounge',
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    isFeatured: false,
    isPopular: false,
    status: 'active'
  },
  {
    id: 'b6',
    title: 'Arduino Complete Starter Kit',
    author: 'Robodo',
    category: 'project-components',
    condition: 'New',
    price: 1100,
    originalPrice: 2000,
    description: 'Unused Arduino Uno R3 starter kit with breadboard, jumper cables, LCD display module, ultrasonic sensor, IR remote, motors, and assorted LEDs/resistors. Perfect for lab projects.',
    images: [
      'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=800&auto=format&fit=crop&q=80'
    ],
    sellerId: 'u4',
    sellerName: 'Rohan Verma',
    sellerRating: 4.9,
    sellerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    college: 'PES University, Bangalore',
    department: 'Mechanical Engineering',
    semester: 7,
    pickupLocation: 'Mechanical Lab Block',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    isFeatured: true,
    isPopular: true,
    status: 'active'
  },
  {
    id: 'b7',
    title: 'Hostel Single Bed Mattress',
    author: 'Sleepwell',
    category: 'hostel-essentials',
    condition: 'Very Good',
    price: 1200,
    originalPrice: 3200,
    description: '3-inch single bed coir mattress. Bought it new last year. Clean, dust-free, and always used with a mattress protector. Extremely comfortable.',
    images: [
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&auto=format&fit=crop&q=80'
    ],
    sellerId: 'u3',
    sellerName: 'Neha Reddy',
    sellerRating: 4.5,
    sellerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    college: 'RV College of Engineering (RVCE), Bangalore',
    department: 'Electronics & Communication Engineering',
    semester: 3,
    pickupLocation: 'Girls Hostel Block A Reception',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    isFeatured: false,
    isPopular: false,
    status: 'active'
  }
];

const SEED_USERS: User[] = [
  {
    id: 'u1', // The active logged-in user
    name: 'Karan Kumar',
    email: 'karan.cs22@rvce.edu.in',
    college: 'RV College of Engineering (RVCE), Bangalore',
    department: 'Computer Science & Engineering',
    semester: 5,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    rating: 4.7,
    reviewsCount: 4,
    joinedDate: '2024-08-15T00:00:00.000Z'
  },
  {
    id: 'u2',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@rvce.edu.in',
    college: 'RV College of Engineering (RVCE), Bangalore',
    department: 'Computer Science & Engineering',
    semester: 5,
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    rating: 4.8,
    reviewsCount: 12,
    joinedDate: '2023-09-01T00:00:00.000Z'
  },
  {
    id: 'u3',
    name: 'Neha Reddy',
    email: 'neha.reddy@rvce.edu.in',
    college: 'RV College of Engineering (RVCE), Bangalore',
    department: 'Electronics & Communication Engineering',
    semester: 3,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    rating: 4.5,
    reviewsCount: 6,
    joinedDate: '2024-01-10T00:00:00.000Z'
  },
  {
    id: 'u4',
    name: 'Rohan Verma',
    email: 'rohan.v@pes.edu',
    college: 'PES University, Bangalore',
    department: 'Mechanical Engineering',
    semester: 7,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviewsCount: 18,
    joinedDate: '2023-07-20T00:00:00.000Z'
  },
  {
    id: 'u5',
    name: 'Dr. Priya Nair',
    email: 'priya.nair@bmcri.edu.in',
    college: 'Bangalore Medical College and Research Institute (BMCRI)',
    department: 'MBBS',
    semester: 4,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    rating: 4.7,
    reviewsCount: 9,
    joinedDate: '2023-11-15T00:00:00.000Z'
  }
];

const SEED_REVIEWS: Record<string, Review[]> = {
  u2: [
    {
      id: 'r1',
      reviewerName: 'Karan Kumar',
      reviewerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      rating: 5,
      comment: 'Aarav is very prompt. Met up at the college library and completed the swap in 2 minutes. The book condition was exactly as described.',
      createdAt: '2026-06-15T12:00:00.000Z'
    },
    {
      id: 'r2',
      reviewerName: 'Preeti Deshmukh',
      reviewerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      rating: 4,
      comment: 'Good communication. Honest about minor pencil marks in the textbook.',
      createdAt: '2026-05-20T10:30:00.000Z'
    }
  ],
  u3: [
    {
      id: 'r3',
      reviewerName: 'Abhishek Roy',
      reviewerAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
      rating: 5,
      comment: 'Very polite junior, met near the girls hostel block. The mattress was clean.',
      createdAt: '2026-06-28T16:15:00.000Z'
    }
  ]
};

const SEED_CHATS: Chat[] = [
  {
    id: 'c1',
    bookId: 'b1',
    bookTitle: 'Introduction to Algorithms (CLRS)',
    bookImage: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=800&auto=format&fit=crop&q=80',
    bookPrice: 650,
    buyerId: 'u1',
    sellerId: 'u2',
    otherParticipant: {
      id: 'u2',
      name: 'Aarav Sharma',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      rating: 4.8,
      college: 'RV College of Engineering (RVCE), Bangalore'
    },
    lastMessage: 'Hey Karan, we can meet tomorrow at 1:30 PM outside the library.',
    lastMessageTime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    unread: true
  }
];

const SEED_MESSAGES: Message[] = [
  {
    id: 'm1',
    chatId: 'c1',
    senderId: 'u1',
    text: 'Hey Aarav, is the Algorithms book still available?',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'm2',
    chatId: 'c1',
    senderId: 'u2',
    text: 'Yes! It is available. I have it with me in hostel.',
    timestamp: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'm3',
    chatId: 'c1',
    senderId: 'u1',
    text: 'Great, can we meet on campus tomorrow to check it and pick it up?',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'm4',
    chatId: 'c1',
    senderId: 'u2',
    text: 'Hey Karan, we can meet tomorrow at 1:30 PM outside the library.',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
  }
];

// Helper to interact with LocalStorage database
export const initializeDB = () => {
  if (!localStorage.getItem('cm_books')) {
    localStorage.setItem('cm_books', JSON.stringify(SEED_BOOKS));
  }
  if (!localStorage.getItem('cm_users')) {
    localStorage.setItem('cm_users', JSON.stringify(SEED_USERS));
  }
  if (!localStorage.getItem('cm_reviews')) {
    localStorage.setItem('cm_reviews', JSON.stringify(SEED_REVIEWS));
  }
  if (!localStorage.getItem('cm_chats')) {
    localStorage.setItem('cm_chats', JSON.stringify(SEED_CHATS));
  }
  if (!localStorage.getItem('cm_messages')) {
    localStorage.setItem('cm_messages', JSON.stringify(SEED_MESSAGES));
  }
  if (!localStorage.getItem('cm_wishlist')) {
    localStorage.setItem('cm_wishlist', JSON.stringify(['b2', 'b3'])); // pre-fill a couple of wishlist items
  }
};

// Accessors for Mock Data
export const getStoredBooks = (): Book[] => {
  initializeDB();
  return JSON.parse(localStorage.getItem('cm_books') || '[]');
};

export const saveStoredBooks = (books: Book[]) => {
  localStorage.setItem('cm_books', JSON.stringify(books));
};

export const getStoredUsers = (): User[] => {
  initializeDB();
  return JSON.parse(localStorage.getItem('cm_users') || '[]');
};

export const saveStoredUsers = (users: User[]) => {
  localStorage.setItem('cm_users', JSON.stringify(users));
};

export const getStoredReviews = (): Record<string, Review[]> => {
  initializeDB();
  return JSON.parse(localStorage.getItem('cm_reviews') || '{}');
};

export const saveStoredReviews = (reviews: Record<string, Review[]>) => {
  localStorage.setItem('cm_reviews', JSON.stringify(reviews));
};

export const getStoredChats = (): Chat[] => {
  initializeDB();
  return JSON.parse(localStorage.getItem('cm_chats') || '[]');
};

export const saveStoredChats = (chats: Chat[]) => {
  localStorage.setItem('cm_chats', JSON.stringify(chats));
};

export const getStoredMessages = (): Message[] => {
  initializeDB();
  return JSON.parse(localStorage.getItem('cm_messages') || '[]');
};

export const saveStoredMessages = (messages: Message[]) => {
  localStorage.setItem('cm_messages', JSON.stringify(messages));
};

export const getStoredWishlist = (): string[] => {
  initializeDB();
  return JSON.parse(localStorage.getItem('cm_wishlist') || '[]');
};

export const saveStoredWishlist = (wishlist: string[]) => {
  localStorage.setItem('cm_wishlist', JSON.stringify(wishlist));
};
