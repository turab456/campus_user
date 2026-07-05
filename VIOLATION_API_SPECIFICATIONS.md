# API Endpoint Specifications - Violation System

Complete reference for all 9 violation endpoints with request/response examples.

## Base URL
```
http://localhost:5000/api/violations
```

## Authentication
- Use JWT token in header: `Authorization: Bearer {token}`
- Public endpoints marked explicitly
- Admin endpoints require user.role === 'admin'

---

## Endpoints

### 1. Check If User Is Blocked
**Public Endpoint (No Auth Required)**

```http
GET /check-blocked/:userId
```

**Parameters:**
- `:userId` (path) - User ID to check

**Response - User Not Blocked:**
```json
{
  "success": true,
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "blocked": false,
    "spamScore": 30,
    "scamScore": 45
  }
}
```

**Response - User Blocked:**
```json
{
  "success": true,
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "blocked": true,
    "blockReason": "Spam score exceeded threshold (78/100)",
    "blockedAt": "2026-07-04T10:30:00Z",
    "spamScore": 78,
    "scamScore": 20
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "User not found"
}
```

---

### 2. Report Unwanted Message
**Protected Endpoint**

```http
POST /report-message
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "messageId": "507f1f77bcf86cd799439012",
  "reason": "Harassment"
}
```

**Reason Options:**
- "Spam"
- "Harassment"
- "Inappropriate Content"
- "Solicitation"
- "Scam"
- "Other"

**Response - Warning Issued:**
```json
{
  "success": true,
  "message": "Message reported successfully",
  "data": {
    "messageId": "507f1f77bcf86cd799439012",
    "message": {
      "id": "507f1f77bcf86cd799439012",
      "spamScore": 15,
      "flagged": true,
      "flagReason": "Spam score updated by violation report"
    },
    "senderStatus": {
      "blocked": false,
      "warning": true,
      "currentScore": 50,
      "warningMessage": "Your spam score is 50/100. Repeated violations may result in account suspension."
    }
  }
}
```

**Response - User Now Blocked:**
```json
{
  "success": true,
  "message": "Message reported successfully",
  "data": {
    "messageId": "507f1f77bcf86cd799439012",
    "senderStatus": {
      "blocked": true,
      "blockReason": "Spam score exceeded threshold (75/100)",
      "blockedAt": "2026-07-04T10:30:00Z"
    }
  }
}
```

**Error Response - Already Blocked:**
```json
{
  "success": false,
  "blocked": true,
  "message": "Your account has been suspended due to policy violations",
  "blockReason": "Spam score exceeded threshold (78/100)",
  "blockedAt": "2026-07-04T10:30:00Z"
}
```

**Error Response - Missing Field:**
```json
{
  "success": false,
  "message": "messageId and reason are required"
}
```

---

### 3. Mark Listing as Sold
**Protected Endpoint**

```http
POST /mark-sold/:listingId
Authorization: Bearer {token}
```

**Parameters:**
- `:listingId` (path) - Listing ID to mark as sold

**Request Body:**
```json
{}
```

**Response - Success:**
```json
{
  "success": true,
  "message": "Listing marked as sold. Waiting for buyer confirmation.",
  "data": {
    "listing": {
      "id": "507f1f77bcf86cd799439013",
      "isSold": true,
      "soldAt": "2026-07-04T10:30:00Z",
      "buyerConfirmedReceipt": false
    }
  }
}
```

**Error Response - User Blocked:**
```json
{
  "success": false,
  "blocked": true,
  "message": "Your account has been suspended due to policy violations"
}
```

**Error Response - Not Owner:**
```json
{
  "success": false,
  "message": "Only the listing owner can mark items as sold"
}
```

**Error Response - Already Sold:**
```json
{
  "success": false,
  "message": "Listing is already marked as sold"
}
```

---

### 4. Confirm Receipt (Buyer)
**Protected Endpoint**

```http
POST /confirm-receipt/:listingId
Authorization: Bearer {token}
```

**Parameters:**
- `:listingId` (path) - Listing ID to confirm receipt for

**Request Body:**
```json
{}
```

**Response - Success:**
```json
{
  "success": true,
  "message": "Receipt confirmed. Transaction complete.",
  "data": {
    "listing": {
      "id": "507f1f77bcf86cd799439013",
      "isSold": true,
      "buyerConfirmedReceipt": true,
      "confirmedAt": "2026-07-04T10:35:00Z"
    }
  }
}
```

**Error Response - Not Buyer:**
```json
{
  "success": false,
  "message": "Only the buyer can confirm receipt"
}
```

**Error Response - Not Marked as Sold:**
```json
{
  "success": false,
  "message": "Listing is not marked as sold yet"
}
```

**Error Response - Already Confirmed:**
```json
{
  "success": false,
  "message": "Receipt has already been confirmed"
}
```

---

### 5. Get User Violations
**Protected Endpoint**

```http
GET /warnings/:userId
Authorization: Bearer {token}
```

**Parameters:**
- `:userId` (path) - User ID to get violations for

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "spamScore": 45,
    "scamScore": 20,
    "violationCount": 3,
    "blocked": false,
    "blockReason": null,
    "blockedAt": null,
    "warnings": [
      {
        "_id": "507f1f77bcf86cd799439020",
        "reason": "Unwanted message reported",
        "spamScore": 15,
        "scamScore": 0,
        "createdAt": "2026-07-04T10:00:00Z"
      },
      {
        "_id": "507f1f77bcf86cd799439021",
        "reason": "Unwanted message reported",
        "spamScore": 15,
        "scamScore": 0,
        "createdAt": "2026-07-04T10:10:00Z"
      },
      {
        "_id": "507f1f77bcf86cd799439022",
        "reason": "Unwanted message reported",
        "spamScore": 15,
        "scamScore": 0,
        "createdAt": "2026-07-04T10:20:00Z"
      }
    ]
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "User not found"
}
```

---

### 6. Report Unconfirmed Sale (Admin)
**Protected Admin Endpoint**

```http
POST /report-unconfirmed-sale
Authorization: Bearer {adminToken}
Content-Type: application/json
```

**Request Body:**
```json
{
  "sellerId": "507f1f77bcf86cd799439011",
  "listingId": "507f1f77bcf86cd799439013",
  "reason": "Listing marked as sold but buyer never received"
}
```

**Response - Warning Issued:**
```json
{
  "success": true,
  "message": "Unconfirmed sale reported",
  "data": {
    "sellerStatus": {
      "blocked": false,
      "warning": true,
      "currentScore": 50,
      "currentScamScore": 20,
      "warningMessage": "Your scam score is 50/100. Repeated violations may result in account suspension."
    }
  }
}
```

**Response - User Blocked:**
```json
{
  "success": true,
  "message": "Unconfirmed sale reported",
  "data": {
    "sellerStatus": {
      "blocked": true,
      "blockReason": "Scam score exceeded threshold (75/100)"
    }
  }
}
```

**Error Response - Not Admin:**
```json
{
  "success": false,
  "message": "Only admins can report unconfirmed sales"
}
```

---

### 7. Block User (Admin)
**Protected Admin Endpoint**

```http
POST /block-user
Authorization: Bearer {adminToken}
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "reason": "Multiple scam complaints"
}
```

**Response - Success:**
```json
{
  "success": true,
  "message": "User blocked successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "blocked": true,
      "blockReason": "Multiple scam complaints",
      "blockedAt": "2026-07-04T10:30:00Z"
    }
  }
}
```

**Error Response - Already Blocked:**
```json
{
  "success": false,
  "message": "User is already blocked"
}
```

**Error Response - Not Admin:**
```json
{
  "success": false,
  "message": "Only admins can block users"
}
```

---

### 8. Unblock User (Admin)
**Protected Admin Endpoint**

```http
POST /unblock-user
Authorization: Bearer {adminToken}
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "reason": "Appeal approved"
}
```

**Response - Success:**
```json
{
  "success": true,
  "message": "User unblocked successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "blocked": false,
      "blockReason": null,
      "blockedAt": null
    }
  }
}
```

**Error Response - Not Blocked:**
```json
{
  "success": false,
  "message": "User is not blocked"
}
```

---

### 9. Reset Violation Scores (Admin)
**Protected Admin Endpoint**

```http
POST /reset-scores
Authorization: Bearer {adminToken}
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "reason": "False positive violations - system error"
}
```

**Response - Success:**
```json
{
  "success": true,
  "message": "Violation scores reset successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "spamScore": 0,
      "scamScore": 0,
      "violationCount": 0,
      "warnings": []
    }
  }
}
```

**Error Response - Not Admin:**
```json
{
  "success": false,
  "message": "Only admins can reset scores"
}
```

---

## Error Codes

| Code | Meaning | Action |
|------|---------|--------|
| 400 | Bad Request | Check required fields |
| 401 | Unauthorized | Verify JWT token |
| 403 | Forbidden | User blocked or insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Check backend logs |

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Validation error |
| 401 | Auth error |
| 403 | Access denied or blocked |
| 404 | Not found |
| 500 | Server error |

---

## Common Response Fields

### Success Response
```json
{
  "success": true,
  "message": "Description of what happened",
  "data": {
    // Response-specific data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "ErrorType (if applicable)"
}
```

### Blocking Response
```json
{
  "success": false,
  "blocked": true,
  "message": "Your account has been suspended due to policy violations",
  "blockReason": "Reason user was blocked",
  "blockedAt": "ISO 8601 timestamp"
}
```

---

## Testing with cURL

### Test Public Endpoint
```bash
curl -X GET "http://localhost:5000/api/violations/check-blocked/507f1f77bcf86cd799439011"
```

### Test Protected Endpoint
```bash
curl -X POST "http://localhost:5000/api/violations/report-message" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messageId": "507f1f77bcf86cd799439012",
    "reason": "Spam"
  }'
```

### Test Admin Endpoint
```bash
curl -X POST "http://localhost:5000/api/violations/block-user" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "507f1f77bcf86cd799439011",
    "reason": "Multiple violations"
  }'
```

---

## Rate Limiting

No specific rate limits yet. Recommended:
- Report endpoints: 10 per minute per user
- Check blocked: 100 per minute
- Admin endpoints: 50 per minute per admin

Configure in middlewares/rateLimiter.js

---

## Best Practices

1. **Always check blocked status before actions:**
   - Call GET /check-blocked before messaging
   - Call before creating listings

2. **Handle all response types:**
   - Success with no warning
   - Success with warning issued
   - Success with user blocked
   - Error states

3. **Log all violations:**
   - Store reason with report
   - Track reporter ID
   - Include timestamp

4. **Validate input:**
   - Check messageId exists
   - Check userId format
   - Sanitize reason text

5. **Handle timeouts:**
   - 30-second default timeout
   - Retry failed requests
   - Log retry attempts

---

## Example Workflows

### Workflow 1: Report Message
```
1. User clicks "Report" on message
2. Frontend shows reason modal
3. User selects reason
4. POST /report-message
5. Check response status:
   - If blocked=true: Show account suspended message
   - If warning=true: Show warning message
   - Else: Show report submitted message
```

### Workflow 2: Complete Sale
```
1. Seller clicks "Mark as Sold"
2. POST /mark-sold/listingId
3. System updates listing, waits for buyer
4. Buyer sees "Confirm Receipt" button
5. Buyer clicks "Confirm Receipt"
6. POST /confirm-receipt/listingId
7. Transaction complete, no violations
```

### Workflow 3: Admin Investigation
```
1. Admin views user in dashboard
2. GET /warnings/userId
3. Sees violation history and scores
4. If suspicious: POST /block-user
5. User cannot perform actions
6. Later: POST /unblock-user if needed
```

---

**Version**: 1.0  
**Last Updated**: 2026-07-04  
**Status**: Production Ready
