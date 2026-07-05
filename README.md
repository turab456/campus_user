# Campus Marketplace

A modern, full-stack marketplace application for campus communities with a powerful admin dashboard for moderation and fraud detection.

## 📱 Features

### Main Marketplace
- **Browse & List Items** - Students can buy, sell, and browse campus items
- **Secure Authentication** - Email verification and JWT tokens
- **User Ratings** - Community trust system
- **Wishlist** - Save favorite items
- **Real-time Chat** - Direct messaging with Socket.io
- **Categories** - Organized item browsing
- **Search & Filter** - Advanced item discovery

### 🛡️ Admin Dashboard
- **User Management** - Approve, flag, and delete users
- **Listing Moderation** - Review and approve listings
- **Fraud Detection** - Advanced fraud scoring system
- **Spam Detection** - Real-time spam and scam monitoring
- **Message Monitoring** - Track and delete harmful messages
- **Analytics Dashboard** - Key metrics and alerts

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB
- npm or yarn

### Installation

1. **Clone and install dependencies**
```bash
npm install
cd backend && npm install && cd ..
cd admin && npm install && cd ..
```

2. **Configure environment variables**
```bash
# Root directory - .env
VITE_API_URL=http://localhost:5000

# backend/.env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/campus-marketplace
CLIENT_URL=http://localhost:5173
JWT_SECRET=your-secret-key
```

3. **Start development servers**
```bash
# Terminal 1 - Main Frontend
npm run dev

# Terminal 2 - Backend
cd backend && npm run dev

# Terminal 3 - Admin Panel
npm run admin:dev
```

Services will be available at:
- **Main App**: http://localhost:5173
- **Backend**: http://localhost:5000
- **Admin Panel**: http://localhost:5173 (separate instance on port 5173)
- **API Docs**: http://localhost:5000/api-docs

## 📁 Project Structure

```
.
├── src/                      # Main frontend (React + TypeScript)
├── backend/                  # Node.js/Express backend
│   ├── src/
│   │   ├── models/          # MongoDB schemas
│   │   ├── controllers/      # Route handlers
│   │   ├── routes/          # API routes
│   │   ├── middlewares/      # Custom middleware
│   │   ├── config/          # Configuration files
│   │   └── utils/           # Helper functions
│   └── package.json
├── admin/                    # Admin Dashboard (React + TypeScript)
│   ├── src/
│   │   ├── pages/           # Admin pages
│   │   ├── components/      # UI components
│   │   ├── services/        # API services
│   │   ├── context/         # React context
│   │   └── utils/           # Helper functions
│   └── package.json
└── package.json              # Root scripts
```

## 🔐 Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt encryption
- **CORS Protection** - Cross-origin request control
- **Rate Limiting** - Prevent API abuse
- **Input Validation** - Schema validation with Zod
- **Role-Based Access Control** - User and admin roles
- **Helmet.js** - HTTP header security
- **Content Moderation** - AI-powered content filtering

## 👨‍💻 Development

### Main Frontend Commands
```bash
npm run dev       # Start dev server
npm run build     # Production build
npm run preview   # Preview build
npm run lint      # Run linter
```

### Admin Panel Commands
```bash
npm run admin:dev      # Start admin dev server
npm run admin:build    # Build admin for production
npm run admin:install  # Install admin dependencies
```

### Backend Commands
```bash
cd backend
npm run dev       # Start dev server
npm run build     # Production build
npm start         # Production start
```

## 🛡️ Admin Dashboard

### Default Credentials
```
Email: admin@campus.edu
Password: admin123
```

⚠️ **Change these immediately in production!**

### Admin Features

**Dashboard**
- Overview statistics
- High-risk user alerts
- Recent spam reports
- System health monitoring

**User Management**
- View all registered users
- Approve/reject signups
- Flag suspicious accounts
- Delete users with reason
- Monitor spam/scam scores

**Listing Management**
- Review listings before publication
- Approve/reject listings
- Delete fraudulent items
- Track fraud risk scores
- Analyze item quality

**Fraud Detection**
- Automatic fraud scoring
- Identify suspicious patterns
- Generate fraud reports
- High-risk item identification
- Seller reputation tracking

**Spam & Scam Detection**
- Real-time message analysis
- Advanced spam algorithms
- Delete harmful content
- Monitor user behavior
- Track repeat offenders

For detailed admin documentation, see [Admin Dashboard Guide](./admin/README.md)

## 🔧 API Endpoints

### Authentication
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/verify-email
POST   /api/auth/forgot-password
```

### Listings
```
GET    /api/listings
GET    /api/listings/:id
POST   /api/listings
PUT    /api/listings/:id
DELETE /api/listings/:id
```

### Users
```
GET    /api/users/me
PUT    /api/users/me
GET    /api/users/:id
GET    /api/users/:id/reviews
```

### Admin
```
GET    /api/admin/dashboard
GET    /api/admin/users
GET    /api/admin/listings
GET    /api/admin/spam-reports
DELETE /api/admin/users/:userId
DELETE /api/admin/messages/:messageId
```

See `backend/swagger.json` for full API documentation.

## 🌐 Environment Variables

### Main Frontend (.env)
```
VITE_API_URL=http://localhost:5000
```

### Backend (.env)
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/campus-marketplace
CLIENT_URL=http://localhost:5173
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
SMTP_HOST=your-email-host
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASS=your-password
CLOUDINARY_NAME=your-name
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

Proprietary - Campus Marketplace
