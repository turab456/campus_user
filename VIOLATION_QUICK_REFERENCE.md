# Violation System - Quick Reference

Fast lookup for common tasks and API calls.

## 🎯 Quick Start (For Developers)

### Backend is Ready ✅
Everything is implemented and tested. Just need frontend integration.

### Current Status
- Models: ✅ Updated
- Controllers: ✅ Created
- Routes: ✅ Created
- Middleware: ✅ Created
- Documentation: ✅ Complete
- Seed Data: ✅ Admin account ready

### What You Need to Do
1. Add report buttons to UI
2. Add confirm receipt flow
3. Display block status
4. Show warnings to users
5. Test all flows

## 📊 Score System at a Glance

```
User Spam Score:         User Scam Score:
0 ──────────────── 49    0 ──────────────── 49
        ↓                        ↓
   SAFE ZONE                SAFE ZONE

50 ──────────────── 74    50 ──────────────── 74
   ⚠️ WARNING ISSUED         ⚠️ WARNING ISSUED

75 ──────────────── 100   75 ──────────────── 100
   🚫 ACCOUNT BLOCKED         🚫 ACCOUNT BLOCKED
```

## 📡 Common API Calls

### Check If User Is Blocked
```javascript
// No auth needed
fetch(`/api/violations/check-blocked/${userId}`)
  .then(r => r.json())
  .then(data => {
    if (data.data.blocked) {
      console.log('User is blocked:', data.data.blockReason);
    }
  });
```

### Report Unwanted Message
```javascript
// Requires auth token
fetch(`/api/violations/report-message`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    messageId: '507f1f77bcf86cd799439011',
    reason: 'Harassment'
  })
})
.then(r => r.json())
.then(data => {
  console.log(data.data.senderStatus);
  // {blocked: true/false, warning: true/false, ...}
});
```

### Mark Listing as Sold
```javascript
fetch(`/api/violations/mark-sold/${listingId}`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(data => console.log('Marked as sold, waiting for confirmation'));
```

### Confirm Receipt (Buyer)
```javascript
fetch(`/api/violations/confirm-receipt/${listingId}`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(data => console.log('Receipt confirmed'));
```

### Get User Warnings (Admin)
```javascript
fetch(`/api/violations/warnings/${userId}`, {
  headers: { 'Authorization': `Bearer ${adminToken}` }
})
.then(r => r.json())
.then(data => {
  console.log('Spam Score:', data.data.spamScore);
  console.log('Warnings:', data.data.warnings);
  console.log('Blocked:', data.data.blocked);
});
```

### Block User (Admin)
```javascript
fetch(`/api/violations/block-user`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`
  },
  body: JSON.stringify({
    userId: '507f1f77bcf86cd799439011',
    reason: 'Multiple scam complaints'
  })
});
```

### Unblock User (Admin)
```javascript
fetch(`/api/violations/unblock-user`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`
  },
  body: JSON.stringify({
    userId: '507f1f77bcf86cd799439011',
    reason: 'Appeal approved'
  })
});
```

## 🔍 Response Types

### Success - No Action Needed
```json
{
  "blocked": false,
  "warning": false,
  "scoreUpdated": true,
  "currentScore": 30
}
```

### Warning Issued
```json
{
  "blocked": false,
  "warning": true,
  "warningMessage": "Your spam score is 50/100. Repeated violations may result in account suspension.",
  "currentScore": 50
}
```

### User Blocked
```json
{
  "blocked": true,
  "warning": false,
  "blockReason": "Spam score exceeded threshold (78/100)"
}
```

### Blocked User Tries Action
```json
{
  "success": false,
  "blocked": true,
  "message": "Your account has been suspended due to policy violations",
  "blockReason": "Spam score exceeded threshold (78/100)",
  "blockedAt": "2026-07-04T12:00:00Z"
}
```

## 🖥️ Frontend Components Needed

### 1. Report Message Modal
```
Header: "Report Message"
Options:
  - Harassment
  - Spam
  - Inappropriate Content
  - Solicitation
  - Other
[Submit] [Cancel]
```

### 2. Confirm Sale Dialog
**Seller Side:**
```
"Item marked as sold. Waiting for buyer confirmation."
[Cancel] [Close]
```

**Buyer Side:**
```
"Did you receive the item?"
[Yes, confirm receipt] [No, report issue]
```

### 3. Block Status Alert
```
🚫 ACCOUNT SUSPENDED
Your account has been suspended due to policy violations.
Reason: Spam score exceeded threshold

Contact: support@campus-marketplace.edu
```

### 4. Warning Notification
```
⚠️ WARNING
Your spam score is 50/100.
Repeated violations may result in account suspension.
[Got it]
```

## 🛠️ Debugging

### Check If Backend Routes Work
```bash
# Test public endpoint
curl http://localhost:5000/api/violations/check-blocked/507f1f77bcf86cd799439011

# Should return:
# {"success":true,"data":{"blocked":false,...}}
```

### Check Middleware
- If you get 403, middleware is working
- If you get other errors, check auth token
- If user is blocked, they get 403 automatically

### Check Score Updated
```javascript
// Before and after reporting
fetch(`/api/violations/check-blocked/${userId}`)
  .then(r => r.json())
  .then(data => console.log('Current score:', data.data.spamScore));
```

### View Logs
```bash
# Check backend logs for violations
cd backend
npm run dev
# Look for lines like:
# INFO: Score increased for user email@example.com...
# ERROR: User blocked: email@example.com...
```

## 📋 Violation Points Reference

| Action | Spam +15 | Scam +20 |
|--------|:-------:|:-------:|
| Report unwanted message | ✅ | |
| Unconfirmed sale (admin) | | ✅ |
| Seller marks sold but buyer doesn't confirm | | ✅ |
| Manual admin block | Both | Both |

## ⏱️ Timeouts (To Implement Later)

Currently manual, can be automated:
- Auto-report after 7 days if buyer doesn't confirm
- Auto-warn at score 50
- Auto-block at score 75
- Auto-reset appeals after 30 days

## 🎓 Common Patterns

### Check before messaging
```javascript
const canUserMessage = async (userId) => {
  const res = await fetch(`/api/violations/check-blocked/${userId}`);
  const data = await res.json();
  return !data.data.blocked;
};

if (await canUserMessage(userId)) {
  openChatWindow();
} else {
  showAlert('This user is blocked');
}
```

### Report with loading
```javascript
const [loading, setLoading] = useState(false);

const reportMessage = async (messageId, reason) => {
  setLoading(true);
  try {
    const res = await fetch(`/api/violations/report-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ messageId, reason })
    });
    const data = await res.json();
    
    if (data.data.senderStatus.blocked) {
      showAlert('User account has been suspended');
    } else if (data.data.senderStatus.warning) {
      showAlert('Warning issued to user');
    } else {
      showAlert('Report submitted');
    }
  } finally {
    setLoading(false);
  }
};
```

## 🚀 Performance Tips

1. Cache block status for user (5-10 min)
2. Batch warning checks on startup
3. Show UI optimistically, then verify
4. Debounce API calls

## 🔐 Security Tips

1. Always verify auth before blocking
2. Log all admin actions
3. Never show scores to regular users
4. Require reason for manual actions
5. Audit appeals regularly

## 📞 When Something Breaks

1. Check backend is running: `npm run dev` in backend
2. Check database connection
3. Check JWT token is valid
4. Check user has admin role (for admin endpoints)
5. Check middleware order in routes
6. Review error logs

## 📚 Full Documentation

- **API Docs**: `VIOLATION_SYSTEM.md`
- **Integration**: `VIOLATION_INTEGRATION.md`
- **Implementation**: `VIOLATION_IMPLEMENTATION.md`
- **This File**: `VIOLATION_QUICK_REFERENCE.md`

---

**Last Updated**: 2026-07-04  
**Status**: ✅ Production Ready  
**Backend Syntax**: ✅ Verified
