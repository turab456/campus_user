# Campus Marketplace - Admin Dashboard

A comprehensive admin panel for the Campus Marketplace platform with user management, listing moderation, fraud detection, and spam monitoring capabilities.

## Features

### 🛡️ User Management
- **View all users** with filtering and pagination
- **Approve/Reject** user registrations
- **Flag suspicious users** for review
- **Delete users** with reason documentation
- **Track user ratings** and review counts
- **Monitor spam/scam scores** for each user

### 📦 Listing Management
- **Review all listings** before publication
- **Approve/Reject listings** with reasons
- **Delete fraudulent listings**
- **Track fraud risk scores**
- **Analyze listing details** including images, description quality
- **Monitor pricing anomalies**

### 🚨 Fraud Detection
- **Automatic fraud scoring** for listings and users
- **Suspicious activity detection**
- **Generate fraud reports**
- **Track fraud patterns**
- **High-risk item identification**

### 🚫 Spam & Scam Detection
- **Real-time spam detection** on messages
- **Advanced spam scoring algorithm**
- **Track unwanted messages**
- **Delete harmful content**
- **Monitor user spam patterns**
- **Multi-factor spam detection** (keywords, patterns, behavior)

### 📊 Dashboard
- **Overview statistics** (users, listings, messages)
- **Key metrics** display
- **High-risk user alerts**
- **Recent spam reports**
- **System health monitoring**

## Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Backend**: Node.js/Express
- **Database**: MongoDB
- **State Management**: React Context
- **HTTP Client**: Axios
- **UI Components**: Lucide Icons, Custom Components

## Installation

### Prerequisites
- Node.js 18+
- MongoDB running locally or remote
- The main marketplace backend running

### Setup Admin Frontend

```bash
cd admin

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

The admin panel will be available at `http://localhost:5173`

### Setup Backend Admin Routes

The admin backend routes are already integrated into the main marketplace backend. Make sure:

1. `backend/src/controllers/adminController.js` exists
2. `backend/src/routes/admin.js` exists
3. `backend/app.js` includes the admin router
4. The `isAdmin` middleware is properly configured

## Default Admin Login

```
Email: admin@campus.edu
Password: admin123
```

⚠️ **For production, change these credentials immediately!**

## Admin Routes

### Dashboard
- `GET /api/admin/dashboard` - Get dashboard statistics

### User Management
- `GET /api/admin/users` - List all users
- `GET /api/admin/users/:userId` - Get user details
- `POST /api/admin/users/:userId/approve` - Approve user
- `POST /api/admin/users/:userId/reject` - Reject user
- `DELETE /api/admin/users/:userId` - Delete user
- `POST /api/admin/users/:userId/flag` - Flag user
- `POST /api/admin/users/:userId/unflag` - Unflag user

### Listing Management
- `GET /api/admin/listings` - List all listings
- `GET /api/admin/listings/:listingId` - Get listing details
- `POST /api/admin/listings/:listingId/approve` - Approve listing
- `POST /api/admin/listings/:listingId/reject` - Reject listing
- `DELETE /api/admin/listings/:listingId` - Delete listing
- `POST /api/admin/listings/:listingId/flag` - Flag listing

### Fraud Detection
- `GET /api/admin/fraud-reports` - Get fraud reports
- `POST /api/admin/fraud-reports` - Create fraud report

### Spam Detection
- `GET /api/admin/spam-reports` - Get spam reports
- `DELETE /api/admin/messages/:messageId` - Delete message
- `POST /api/admin/spam-reports` - Report spam

### Statistics
- `GET /api/admin/statistics/users` - User statistics
- `GET /api/admin/statistics/listings` - Listing statistics
- `GET /api/admin/statistics/spam` - Spam statistics

## Spam Detection Algorithm

The admin panel uses an advanced spam detection system that analyzes:

1. **Keyword Matching** - Detects common spam keywords
2. **Pattern Detection** - Identifies scam patterns (payment methods, classic scams)
3. **URL Analysis** - Flags excessive URL usage
4. **Capitalization** - Detects EXCESSIVE ALL-CAPS messages
5. **Character Repetition** - Identifies repeated characters
6. **Phone Number Detection** - Tracks suspicious phone sharing
7. **Message Length** - Flags very short messages

**Spam Score Levels:**
- **HIGH (70-100)**: Likely spam/scam - immediate action recommended
- **MEDIUM (40-69)**: Suspicious - review recommended
- **LOW (20-39)**: Minor concerns
- **SAFE (0-19)**: Safe to allow

## Fraud Detection Algorithm

Fraud scoring for listings considers:

1. **Price Anomalies** - Unrealistic discounts (>70%)
2. **Description Quality** - Short or missing descriptions
3. **Image Count** - Missing or limited images
4. **Item Condition** - Poor condition items
5. **Spam Content** - Spam in title/description
6. **Seller Risk Score** - Seller's historical fraud score

User fraud scoring considers:

1. **Rating History** - Low ratings
2. **Review Count** - Few reviews for account age
3. **Email Verification** - Unverified accounts
4. **Account Behavior** - Suspicious patterns

## File Structure

```
admin/
├── src/
│   ├── pages/
│   │   ├── AdminLoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── UserManagementPage.tsx
│   │   ├── ListingManagementPage.tsx
│   │   ├── FraudDetectionPage.tsx
│   │   └── SpamDetectionPage.tsx
│   ├── components/
│   │   ├── AdminNavbar.tsx
│   │   ├── AdminSidebar.tsx
│   │   ├── Alert.tsx
│   │   ├── DataTable.tsx
│   │   ├── Modal.tsx
│   │   ├── ScoreIndicator.tsx
│   │   └── StatCard.tsx
│   ├── services/
│   │   └── adminApi.ts
│   ├── context/
│   │   └── AdminAuthContext.tsx
│   ├── hooks/
│   │   └── useAdminProtection.ts
│   ├── utils/
│   │   └── detectionAlgorithms.ts
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Usage Guide

### Logging In
1. Navigate to `http://localhost:5173` (or your admin URL)
2. Enter admin credentials
3. Click Login

### Managing Users
1. Go to **User Management**
2. View user list with filtering options
3. Click on a user to see detailed profile
4. Use action buttons to approve, flag, or delete users
5. Provide reason for any action taken

### Managing Listings
1. Navigate to **Listing Management**
2. Review listings with fraud scores
3. Click to view full details including images
4. Approve, reject, or delete listings
5. Flag suspicious listings for review

### Monitoring Fraud
1. Check **Fraud Detection** dashboard
2. Review high-risk items (score ≥ 70)
3. View detailed fraud reports
4. Take action on flagged items

### Handling Spam
1. Go to **Spam & Scam Detection**
2. Review flagged messages with spam scores
3. View spam report details
4. Delete harmful messages with reason
5. Monitor repeat offenders

## Performance Optimization

- **Pagination** - All lists support pagination for performance
- **Lazy Loading** - Images and data loaded on-demand
- **Caching** - Browser caching for API responses
- **Debouncing** - Search and filter operations debounced
- **Code Splitting** - Route-based code splitting enabled

## Security Features

- **JWT Authentication** - Secure token-based auth
- **Role-Based Access Control** - Only admins can access admin routes
- **Protected Routes** - Frontend route protection
- **CSRF Protection** - Token-based requests
- **Rate Limiting** - API rate limiting on backend
- **Audit Logging** - All admin actions logged

## Contributing

When adding new features to the admin panel:

1. Follow existing component patterns
2. Use TypeScript for type safety
3. Add proper error handling
4. Update this README
5. Test thoroughly in multiple scenarios

## Support

For issues or questions about the admin panel, please contact the development team or file an issue in the project repository.

## License

Proprietary - Campus Marketplace Admin Dashboard
