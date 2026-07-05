# Violation System - Integration Guide

Quick reference for integrating the violation system with your frontend and understanding the complete flow.

## Quick Start

### 1. Database Models Updated ✅
- **User**: Added spam/scam scores, block status, warnings
- **Listing**: Added sale confirmation tracking
- **Message**: Already had spam score

### 2. New Files Created ✅
```
backend/
├── src/
│   ├── controllers/violationController.js    # Main violation logic
│   ├── middlewares/checkBlocked.js           # Middleware to block users
│   ├── routes/violations.js                  # Violation routes
│   ├── utils/scoreManager.js                 # Score management utilities
│   └── scripts/seed.js                       # Admin seeding (already run)
└── app.js                                     # Updated with routes
```

### 3. Routes Available ✅
All routes prefixed with `/api/violations`

## Feature Flows

### Flow 1: Unwanted Message Report

```
User A sends spam message to User B
    ↓
User B reports the message
    ↓
POST /api/violations/report-message
    {messageId, reason}
    ↓
Backend increases User A's spam score by +15
    ↓
If score >= 50: Send warning
If score >= 75: Block account
    ↓
Message flagged in system
    ↓
Admin dashboard shows updated scores
```

**Frontend Implementation:**
```javascript
// In message list/chat component
<button onClick={() => reportMessage(messageId, reason)}>
  Report Message
</button>

// Handler function
const reportMessage = async (messageId, reason) => {
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
    showAlert('Sender account suspended');
  }
};
```

### Flow 2: Sale Confirmation

```
Seller creates listing → Buyer purchases → Chat created
    ↓
Seller marks as sold
    ↓
POST /api/violations/mark-sold/:listingId
    ↓
System waits for buyer confirmation
    ↓
Buyer confirms receipt
    ↓
POST /api/violations/confirm-receipt/:listingId
    ↓
Transaction complete (no scam score increase)
    ↓
Admin can see confirmed sales in dashboard
```

**Frontend Implementation:**
```javascript
// Seller view - button to mark as sold
<button onClick={() => markAsSold(listingId)}>
  Mark as Sold
</button>

// Buyer view - button to confirm receipt
<button onClick={() => confirmReceipt(listingId)}>
  Confirm Receipt
</button>

const markAsSold = async (listingId) => {
  const response = await fetch(`/api/violations/mark-sold/${listingId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  showAlert(data.message);
};

const confirmReceipt = async (listingId) => {
  const response = await fetch(`/api/violations/confirm-receipt/${listingId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  showSuccess(data.message);
};
```

### Flow 3: Admin Action

```
Admin views user in admin dashboard
    ↓
Sees spam/scam scores and warnings
    ↓
Can take action:
  - Block user immediately
  - Unblock user
  - Reset scores
    ↓
System logs the action
    ↓
Blocked user cannot perform actions
```

## Component Integration Checklist

### ✅ Backend Ready
- [x] Models updated
- [x] Controllers created
- [x] Routes created
- [x] Middleware created
- [x] Utilities created
- [x] Routes integrated into app.js

### ⚙️ Frontend To-Do

#### 1. Add Report Message Button
Location: Message component / Chat view
```jsx
<button 
  className="text-red-600 hover:bg-red-50"
  onClick={() => setShowReportModal(true)}
>
  Report Message
</button>
```

#### 2. Add Mark as Sold Button
Location: Listing details (seller view)
```jsx
{isOwner && !listing.isSold && (
  <button 
    className="bg-blue-600 text-white"
    onClick={handleMarkAsSold}
  >
    Mark as Sold
  </button>
)}
```

#### 3. Add Confirm Receipt Button
Location: Listing details (buyer view)
```jsx
{isBuyer && listing.isSold && !listing.buyerConfirmedReceipt && (
  <button 
    className="bg-green-600 text-white"
    onClick={handleConfirmReceipt}
  >
    Confirm Receipt
  </button>
)}
```

#### 4. Show User Block Status
Location: Before taking action on a user
```jsx
const checkUserBlocked = async (userId) => {
  const response = await fetch(`/api/violations/check-blocked/${userId}`);
  const data = await response.json();
  
  if (data.data.blocked) {
    showError('This user account is suspended');
    return true;
  }
  return false;
};

// Use before sending message, creating listing, etc.
if (await checkUserBlocked(userId)) {
  return; // Prevent action
}
```

#### 5. Display User Warnings in Admin
Location: Admin user details panel
```jsx
const [userWarnings, setUserWarnings] = useState(null);

useEffect(() => {
  const fetchWarnings = async () => {
    const response = await fetch(`/api/violations/warnings/${userId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    setUserWarnings(data.data);
  };
  fetchWarnings();
}, [userId]);

// Display
<div className="space-y-2">
  <p>Spam Score: {userWarnings?.spamScore}/100</p>
  <p>Scam Score: {userWarnings?.scamScore}/100</p>
  <p>Total Violations: {userWarnings?.violationCount}</p>
  {userWarnings?.blocked && (
    <p className="text-red-600 font-bold">
      ⚠️ ACCOUNT BLOCKED
    </p>
  )}
</div>
```

## Middleware Integration

The `checkBlocked` middleware is automatically applied to all protected routes. If a user is blocked, they'll get:

```json
{
  "success": false,
  "blocked": true,
  "message": "Your account has been suspended due to policy violations",
  "blockReason": "Spam score exceeded threshold (78/100)",
  "blockedAt": "2026-07-04T12:00:00Z"
}
```

## Testing the System

### Test Scenario 1: Report Message
```bash
# 1. Send a message between two users
# 2. Report the message as unwanted
# 3. Check admin dashboard for updated score
# 4. Verify message is flagged
```

### Test Scenario 2: Sale Confirmation
```bash
# 1. Create a listing
# 2. Let another user purchase it
# 3. Mark as sold
# 4. Confirm receipt as buyer
# 5. Check transaction is complete
```

### Test Scenario 3: Auto Block
```bash
# 1. Admin manually increases user's score to 75+
# 2. Try to perform any action as that user
# 3. Should get blocked response
# 4. Verify user is blocked in admin panel
```

## Error Handling

```javascript
// Common error scenarios
const handleViolationError = (error) => {
  const response = error.response?.data;
  
  if (response?.blocked) {
    // User is blocked
    showAlert('Your account has been suspended');
    redirectToSupportPage();
  } else if (response?.warning) {
    // User received warning
    showAlert(response.warningMessage);
  } else {
    // Other error
    showAlert('An error occurred');
  }
};
```

## Admin Dashboard Updates

The admin dashboard already shows:
- User spam/scam scores
- Block status
- Warning count
- Can manually block/unblock users
- Can reset scores

Just ensure these fields are displayed in user details:
```javascript
<ScoreIndicator score={user.spamScore} label="Spam Score" />
<ScoreIndicator score={user.scamScore} label="Scam Score" />
{user.blocked && <BlockedBadge reason={user.blockReason} />}
```

## Configuration

To adjust thresholds, edit `backend/src/utils/scoreManager.js`:

```javascript
// Current thresholds
const SPAM_WARNING_THRESHOLD = 50;    // Send warning at 50
const SCAM_WARNING_THRESHOLD = 50;
const BLOCK_THRESHOLD = 75;            // Block at 75

// Example: Make blocking stricter
const BLOCK_THRESHOLD = 50;  // Block at 50 instead of 75
```

## Next Steps

1. **Frontend Development**
   - Add report buttons to chat/message interface
   - Add sale confirmation flow
   - Show user block status before actions
   - Display warnings in user profile

2. **Testing**
   - Test all violation flows
   - Test edge cases
   - Load test the system
   - Manual testing with admin

3. **Monitoring**
   - Check violation logs regularly
   - Review blocked users
   - Adjust thresholds based on data
   - Gather user feedback

4. **Polish**
   - Add more detailed warnings
   - Send email notifications
   - Add appeal process
   - Create help documentation for users

## Support

For questions about implementation:
1. Check `VIOLATION_SYSTEM.md` for detailed API docs
2. Review controller code comments
3. Check backend logs for errors
4. Test with admin account first
