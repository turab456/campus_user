# User Violation & Blocking System

Complete documentation for the Campus Marketplace user violation tracking and automatic blocking system.

## Overview

The violation system automatically tracks user behavior and takes action when users:
- Send unwanted/spam messages
- Mark items as sold but don't confirm with buyer
- Exhibit other suspicious behavior

## How It Works

### Score System

Each user has two violation scores:

| Score | Max | Purpose | Warning Threshold | Block Threshold |
|-------|-----|---------|-------------------|-----------------|
| **Spam Score** | 100 | Tracks unwanted messages, spam behavior | 50 | 75 |
| **Scam Score** | 100 | Tracks potential fraud, unconfirmed sales | 50 | 75 |

### Automatic Actions

#### 1. Score Increase (0-49)
- User receives violation record in their warning history
- No visible warning sent yet

#### 2. Warning Issued (50-74)
- User receives warning notification
- Account remains active
- User can still perform actions
- Multiple warnings recorded

#### 3. Account Blocked (75+)
- User account automatically blocked
- Cannot perform any marketplace actions
- Cannot send messages or create listings
- Must contact support for manual review

### Violation Types & Score Changes

#### Unwanted Messages (Spam)
```
Action: Report unwanted message
Spam Score Increase: +15
Example Reasons:
- Harassment
- Spam content
- Inappropriate language
- Solicitation
```

#### Unconfirmed Sale (Scam)
```
Action: Seller marks as sold, buyer doesn't confirm receipt
Scam Score Increase: +20
Trigger: Automatic after timeout period
Reason: Potential non-delivery or fraud
```

#### Multiple Violations
```
Each violation increases the corresponding score
Multiple violations accelerate blocking
Violations remain in user history permanently
```

## API Endpoints

### User Endpoints

#### Report Unwanted Message
```http
POST /api/violations/report-message
Authorization: Bearer {token}

Body:
{
  "messageId": "507f1f77bcf86cd799439011",
  "reason": "Harassment"
}

Response:
{
  "success": true,
  "message": "Message reported successfully",
  "data": {
    "senderStatus": {
      "blocked": false,
      "warning": true,
      "warningMessage": "Your spam score is 50/100. Repeated violations may result in account suspension.",
      "currentScore": 50
    }
  }
}
```

#### Mark Listing as Sold
```http
POST /api/violations/mark-sold/:listingId
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Listing marked as sold. Waiting for buyer confirmation...",
  "data": {
    "listing": {...},
    "buyerId": "507f1f77bcf86cd799439011",
    "buyerEmail": "buyer@example.com",
    "requiresConfirmation": true
  }
}
```

#### Confirm Receipt of Purchase
```http
POST /api/violations/confirm-receipt/:listingId
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Receipt confirmed successfully",
  "data": {
    "listing": {...},
    "confirmedAt": "2026-07-04T12:00:00Z"
  }
}
```

#### Get User Warnings
```http
GET /api/violations/warnings/:userId
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "warnings": [
      {
        "reason": "Unwanted message reported: Harassment",
        "spamScore": 50,
        "createdAt": "2026-07-04T10:00:00Z"
      },
      {
        "reason": "Unwanted message reported: Spam content",
        "spamScore": 65,
        "createdAt": "2026-07-04T11:00:00Z"
      }
    ],
    "spamScore": 65,
    "scamScore": 0,
    "violationCount": 2,
    "blocked": false,
    "blockReason": null
  }
}
```

#### Check If User Is Blocked
```http
GET /api/violations/check-blocked/:userId

Response:
{
  "success": true,
  "data": {
    "blocked": false,
    "blockReason": null,
    "blockedAt": null,
    "spamScore": 65,
    "scamScore": 0,
    "exists": true
  }
}
```

### Admin Endpoints

#### Report Unconfirmed Sale
```http
POST /api/violations/report-unconfirmed-sale
Authorization: Bearer {admin_token}

Body:
{
  "listingId": "507f1f77bcf86cd799439011",
  "sellerId": "507f1f77bcf86cd799439012",
  "reason": "Custom reason (optional)"
}

Response:
{
  "success": true,
  "message": "Unconfirmed sale reported",
  "data": {
    "sellerStatus": {
      "blocked": false,
      "warning": true,
      "warningMessage": "Your scam score is 50/100...",
      "currentScore": 50
    }
  }
}
```

#### Block User
```http
POST /api/violations/block-user
Authorization: Bearer {admin_token}

Body:
{
  "userId": "507f1f77bcf86cd799439011",
  "reason": "Multiple scam complaints"
}

Response:
{
  "success": true,
  "message": "User blocked successfully",
  "data": {
    "blocked": true,
    "blockReason": "Multiple scam complaints"
  }
}
```

#### Unblock User
```http
POST /api/violations/unblock-user
Authorization: Bearer {admin_token}

Body:
{
  "userId": "507f1f77bcf86cd799439011",
  "reason": "Manual review completed - false positive"
}

Response:
{
  "success": true,
  "message": "User unblocked successfully"
}
```

#### Reset User Scores
```http
POST /api/violations/reset-scores
Authorization: Bearer {admin_token}

Body:
{
  "userId": "507f1f77bcf86cd799439011",
  "reason": "Appeal approved - issue resolved"
}

Response:
{
  "success": true,
  "message": "Scores reset successfully",
  "data": {
    "user": {...},
    "spamScore": 0,
    "scamScore": 0,
    "violationCount": 0,
    "warnings": []
  }
}
```

## Frontend Integration

### Check If User Is Blocked Before Action

```javascript
import { adminApi } from './services/adminApi';

const checkUserBlocked = async (userId) => {
  try {
    const response = await fetch(`/api/violations/check-blocked/${userId}`);
    const data = await response.json();
    
    if (data.data.blocked) {
      showError(`Account suspended: ${data.data.blockReason}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error checking user status:', error);
    return false;
  }
};
```

### Report Unwanted Message

```javascript
const reportMessage = async (messageId, reason) => {
  try {
    const response = await fetch('/api/violations/report-message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ messageId, reason })
    });
    
    const data = await response.json();
    
    if (data.data.senderStatus.blocked) {
      showAlert('User account has been suspended for violations');
    } else if (data.data.senderStatus.warning) {
      showAlert(`Warning issued: ${data.data.senderStatus.warningMessage}`);
    }
  } catch (error) {
    console.error('Error reporting message:', error);
  }
};
```

### Mark Listing as Sold

```javascript
const markAsSold = async (listingId) => {
  try {
    const response = await fetch(`/api/violations/mark-sold/${listingId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      showAlert(`Listing marked as sold. Waiting for buyer confirmation from ${data.data.buyerEmail}`);
    }
  } catch (error) {
    console.error('Error marking as sold:', error);
  }
};
```

### Confirm Receipt

```javascript
const confirmReceipt = async (listingId) => {
  try {
    const response = await fetch(`/api/violations/confirm-receipt/${listingId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      showSuccess('Receipt confirmed! Transaction complete.');
    }
  } catch (error) {
    console.error('Error confirming receipt:', error);
  }
};
```

## User Data Model

### User Document Updates

```javascript
{
  ...otherFields,
  
  // Violation Scores
  spamScore: 65,              // 0-100
  scamScore: 20,              // 0-100
  
  // Blocking
  blocked: false,
  blockReason: null,
  blockedAt: null,
  
  // Violation History
  warnings: [
    {
      reason: "Unwanted message reported: Harassment",
      spamScore: 50,
      createdAt: "2026-07-04T10:00:00Z"
    },
    {
      reason: "Unwanted message reported: Spam",
      spamScore: 65,
      createdAt: "2026-07-04T11:00:00Z"
    }
  ],
  
  violationCount: 2,
  
  timestamps...
}
```

### Listing Document Updates

```javascript
{
  ...otherFields,
  
  // Sale Tracking
  isSold: true,
  soldAt: "2026-07-04T10:00:00Z",
  
  // Buyer Confirmation
  buyerConfirmedReceipt: false,
  confirmedAt: null,
  buyer: ObjectId,
  
  timestamps...
}
```

## Blocking Behavior

### What Blocked Users Cannot Do
- ❌ Create new listings
- ❌ Send messages
- ❌ Update profile
- ❌ Make purchases
- ❌ Leave reviews
- ❌ Mark items as sold
- ❌ Confirm receipt

### What Blocked Users Can Do
- ✅ View their profile
- ✅ View their listings (read-only)
- ✅ View their purchase history
- ✅ Contact support
- ✅ Submit appeals

### API Response for Blocked User

When a blocked user attempts any action:

```json
{
  "success": false,
  "blocked": true,
  "message": "Your account has been suspended due to policy violations",
  "blockReason": "Spam score exceeded threshold (78/100)",
  "blockedAt": "2026-07-04T12:00:00Z",
  "supportEmail": "support@campus-marketplace.edu"
}
```

## Admin Dashboard Integration

### View User Violations
The admin dashboard already shows:
- Spam and scam scores in user details
- Warning history
- Block status
- Total violation count

### Take Action in Admin Panel
Admins can:
- ✅ View all violations for a user
- ✅ Manually block users
- ✅ Unblock users
- ✅ Reset violation scores
- ✅ Generate violation reports

## Logging

All violations and actions are logged for audit trails:

```
INFO: Score increased for user admin@campus.edu: spamScore 50 → 65 (reason: Unwanted message reported: Harassment)
WARN: Warning issued for user admin@campus.edu: spamScore = 65
ERROR: User blocked: admin@campus.edu - Reason: Spam score exceeded threshold (78/100)
INFO: User unblocked by admin: admin@campus.edu. Reason: Manual review completed
```

## Configuration

Adjust thresholds in `backend/src/utils/scoreManager.js`:

```javascript
const SPAM_WARNING_THRESHOLD = 50;      // Issue warning
const SCAM_WARNING_THRESHOLD = 50;
const BLOCK_THRESHOLD = 75;             // Block user
```

## Best Practices

1. **Regular Monitoring**
   - Review high-score users weekly
   - Manually investigate suspicious patterns
   - Adjust thresholds if needed

2. **User Communication**
   - Send clear warning messages
   - Explain policy violations
   - Provide appeal process

3. **Appeal Process**
   - Allow users to appeal blocks
   - Manually review appeals
   - Document decisions

4. **Data Privacy**
   - Log all admin actions
   - Keep audit trail
   - Comply with regulations

## Support & Troubleshooting

### User Blocked by Mistake
1. Admin reviews the user's history
2. Confirms it's a false positive
3. Calls `/api/violations/unblock-user` with reason
4. Resets scores if appropriate

### Score Not Updating
1. Check middleware is applied to routes
2. Verify `checkBlocked` is in the request chain
3. Check error logs for issues
4. Ensure database connection is active

### Appeals
1. User contacts support with appeal
2. Admin reviews violation history
3. Admin verifies if appeal is valid
4. Admin either unblocks or denies with reason
