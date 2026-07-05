# Admin Panel Setup & Quick Start Guide

## Overview

A complete admin dashboard has been created with comprehensive features for managing the Campus Marketplace platform. This includes user management, listing moderation, fraud detection, and spam/scam monitoring.

## 📁 What Was Created

### New Admin Application
Located in `/admin` directory with complete React + TypeScript frontend:

```
admin/
├── src/
│   ├── pages/                    # Admin pages
│   │   ├── AdminLoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── UserManagementPage.tsx
│   │   ├── ListingManagementPage.tsx
│   │   ├── FraudDetectionPage.tsx
│   │   └── SpamDetectionPage.tsx
│   ├── components/               # Reusable UI components
│   │   ├── AdminNavbar.tsx
│   │   ├── AdminSidebar.tsx
│   │   ├── Alert.tsx
│   │   ├── DataTable.tsx
│   │   ├── Modal.tsx
│   │   ├── ScoreIndicator.tsx
│   │   └── StatCard.tsx
│   ├── services/                 # API communication
│   │   └── adminApi.ts
│   ├── context/                  # State management
│   │   └── AdminAuthContext.tsx
│   ├── hooks/                    # Custom hooks
│   │   └── useAdminProtection.ts
│   ├── utils/                    # Helper functions
│   │   └── detectionAlgorithms.ts
│   ├── types/                    # TypeScript types
│   └── App.tsx                   # Main app component
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

### Backend Updates
- **adminController.js** - All admin logic (dashboard, users, listings, fraud, spam)
- **admin.js** - Protected routes for admin operations
- Updated Models:
  - User: Added `spamScore`, `scamScore`, `flagged`, `flagReason`
  - Listing: Added `fraudScore`, `flagged`, `flagReason`, `approved`, `rejectReason`
  - Message: Added `spamScore`, `flagged`, `flagReason`

## 🚀 Installation & Running

### Step 1: Install Admin Dependencies
```bash
cd admin
npm install
cd ..
```

Or use the root script:
```bash
npm run admin:install
```

### Step 2: Start All Services

**Option A: Separate Terminal Windows (Recommended)**

```bash
# Terminal 1: Main Frontend (http://localhost:5173)
npm run dev

# Terminal 2: Backend API (http://localhost:5000)
cd backend && npm run dev

# Terminal 3: Admin Panel (http://localhost:5173)
npm run admin:dev
```

**Option B: Using npm Scripts**

```bash
npm run admin:dev        # Start admin dev server only
npm run admin:build      # Build admin for production
```

### Step 3: Access the Services

| Service | URL | Purpose |
|---------|-----|---------|
| Main Frontend | http://localhost:5173 | Customer marketplace |
| Backend API | http://localhost:5000 | API server |
| Admin Dashboard | http://localhost:5173 | Admin panel (note: run separately) |
| API Docs | http://localhost:5000/api-docs | Swagger documentation |

## 🔑 Default Admin Credentials

```
Email: admin@campus.edu
Password: admin123
```

**⚠️ IMPORTANT:** Change these credentials immediately in production!

To change admin credentials:
1. Modify them in the User model seeding script
2. Or create a new admin user via the backend API
3. Update login UI with new credentials if needed

## 🎯 Main Features

### 1. Dashboard
- **Overview Statistics**: Total users, listings, messages
- **Alert System**: Flagged users/listings count
- **High-Risk Users**: Real-time monitoring of suspicious accounts
- **Recent Spam Reports**: Quick access to latest violations

### 2. User Management
- **User List**: Browse all users with pagination
- **User Details**: View complete user profile and history
- **Approval System**: Accept or reject pending users
- **Flagging System**: Mark users for manual review
- **Delete Option**: Remove problematic users
- **Spam/Scam Scores**: Monitor user risk levels

### 3. Listing Management
- **Listing Review**: View all listings before publication
- **Approval Workflow**: Approve, reject, or flag listings
- **Fraud Scoring**: Automatic fraud risk calculation
- **Image Preview**: Visual inspection of items
- **Description Analysis**: Quality and spam detection
- **Price Analysis**: Detect suspicious pricing

### 4. Fraud Detection
- **Risk Scoring**: Automatic fraud score (0-100)
- **High-Risk Alerts**: Items with score ≥ 70
- **Pattern Analysis**: Identify suspicious behaviors
- **Report Generation**: Document fraud incidents
- **Historical Tracking**: Monitor repeat offenders

### 5. Spam & Scam Detection
- **Message Scanning**: Real-time message analysis
- **Spam Scoring**: Advanced detection algorithm
- **Content Deletion**: Remove harmful messages
- **User Isolation**: Track serial spammers
- **Pattern Recognition**: Identify scam tactics

## 🧠 Detection Algorithms

### Spam Detection Algorithm
Analyzes messages for:
- **Spam Keywords** (click here, buy now, guaranteed, etc.)
- **Scam Patterns** (payment methods, classic scams, etc.)
- **Excessive URLs** (more than 3 URLs)
- **ALL CAPS** (>30% capitalization)
- **Character Repetition** (repeated characters)
- **Phone Numbers** (multiple phone numbers)
- **Message Length** (very short messages)

**Scoring:**
- HIGH (70-100): Immediate action needed
- MEDIUM (40-69): Review recommended
- LOW (20-39): Minor concerns
- SAFE (0-19): Acceptable

### Fraud Detection Algorithm
Analyzes listings for:
- **Price Anomalies** (discounts >70%)
- **Description Quality** (short/missing descriptions)
- **Image Count** (no images = higher risk)
- **Item Condition** (poor condition items)
- **Spam Content** (spam in title/description)
- **Seller History** (seller's fraud score)

### User Risk Scoring
Considers:
- **Low Ratings** (<3.0 stars)
- **Few Reviews** (new accounts)
- **Unverified Email** (not verified)
- **Short Name** (<3 characters)

## 📊 Dashboard Metrics

The admin dashboard displays:
- **Total Users**: Complete user count
- **Total Listings**: All items in marketplace
- **Total Messages**: Communication volume
- **Flagged Users**: Accounts under review
- **Flagged Listings**: Items under review
- **Spam Reports**: Total violations reported

## 🔒 Security Features

- **Role-Based Access**: Only admins can access admin routes
- **JWT Authentication**: Secure token-based authentication
- **Protected Routes**: Frontend route protection
- **API Rate Limiting**: Prevent abuse
- **Audit Logging**: Track all admin actions
- **Password Hashing**: Secure credential storage

## 🛠️ API Endpoints

### Dashboard
- `GET /api/admin/dashboard`

### Users
- `GET /api/admin/users` - List all users
- `GET /api/admin/users/:userId` - Get user details
- `DELETE /api/admin/users/:userId` - Delete user
- `POST /api/admin/users/:userId/flag` - Flag user
- `POST /api/admin/users/:userId/unflag` - Unflag user

### Listings
- `GET /api/admin/listings` - List all listings
- `GET /api/admin/listings/:listingId` - Get listing details
- `POST /api/admin/listings/:listingId/approve` - Approve listing
- `POST /api/admin/listings/:listingId/reject` - Reject listing
- `DELETE /api/admin/listings/:listingId` - Delete listing
- `POST /api/admin/listings/:listingId/flag` - Flag listing

### Fraud
- `GET /api/admin/fraud-reports` - Get fraud reports
- `POST /api/admin/fraud-reports` - Create fraud report

### Spam
- `GET /api/admin/spam-reports` - Get spam reports
- `DELETE /api/admin/messages/:messageId` - Delete message
- `POST /api/admin/spam-reports` - Report spam

## 📱 UI Components

- **StatCard**: Display key metrics
- **DataTable**: Paginated data display with actions
- **Modal**: Dialog for detailed information
- **ScoreIndicator**: Visual score display (0-100)
- **Alert**: Success/error/warning messages
- **AdminNavbar**: Navigation and user info
- **AdminSidebar**: Menu navigation

## 🔧 Customization

### Change Admin Port
Edit `admin/vite.config.ts`:
```typescript
server: {
  port: 5174,  // Change from 5173 to 5174
}
```

### Modify Spam Detection
Edit `admin/src/utils/detectionAlgorithms.ts`:
- Add/remove spam keywords
- Adjust scoring weights
- Customize detection patterns

### Update Theme
Edit `admin/src/index.css` and `tailwind.config.js` for styling changes

## 📝 Production Checklist

Before deploying to production:

- [ ] Change admin credentials
- [ ] Update API endpoints
- [ ] Enable HTTPS
- [ ] Configure proper CORS
- [ ] Set up monitoring/logging
- [ ] Backup database
- [ ] Update environment variables
- [ ] Test all features
- [ ] Set up admin user accounts
- [ ] Review security policies

## 🐛 Troubleshooting

### Admin page not loading
- Check if backend is running on port 5000
- Verify environment variables are set
- Check browser console for errors

### Login fails
- Verify admin credentials
- Check backend logs
- Ensure JWT secret is configured

### Detection algorithms not working
- Verify message/listing has required fields
- Check if spamScore/fraudScore fields exist in models
- Review algorithm thresholds

### API errors
- Ensure admin middleware is applied
- Check user has admin role
- Verify authentication token is valid

## 📚 Additional Resources

- [Admin README](./admin/README.md) - Detailed admin documentation
- [Backend API Docs](./backend/swagger.json) - API specification
- [Main README](./README.md) - Project overview

## 🎓 Next Steps

1. Test admin login with default credentials
2. Explore dashboard and check metrics
3. Review some listings and users
4. Test spam detection on messages
5. Try user flagging and deletion
6. Set up production admin accounts
7. Configure monitoring and alerts

## 📞 Support

For issues or questions:
1. Check the admin README
2. Review API documentation
3. Check backend logs
4. Verify environment configuration

---

**Status**: ✅ Complete - Admin panel fully implemented and ready to use
