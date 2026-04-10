# Notification System - Implementation Guide

## Overview
The notification system has been redesigned with a modern UI and robust backend integration to provide real-time compliance alerts to users.

---

## What Was Fixed

### Backend Issues
1. **Missing `/count` endpoint** - Added new endpoint to fetch unread notification count for badge display
2. **No filtering support** - Added query parameters for `is_read` and `type` filtering
3. **Limited pagination** - Enhanced with configurable limit (max 200)
4. **Poor error handling** - Added try-catch blocks and database rollback on errors

### Frontend Issues
1. **Wrong property names** - Changed from `n.details` to `n.metadata_json` (matches backend schema)
2. **Missing title field** - Now displays both `title` and `message` fields
3. **No filtering** - Added filter bar for All, Unread, Risk, Success, Monitoring
4. **Broken API calls** - Fixed endpoints and added proper error handling
5. **Outdated UI** - Completely redesigned with modern card-based layout

---

## Architecture

### Backend Components

#### 1. API Endpoints (`/api/v1/notifications/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get user's notifications with filters |
| GET | `/count` | Get unread notification count |
| PATCH | `/{id}/read` | Mark notification as read |
| POST | `/mark-all-read` | Mark all notifications as read |
| DELETE | `/{id}` | Delete a notification |

**Query Parameters for GET `/`:**
- `skip` (int): Number of records to skip (default: 0)
- `limit` (int): Max records to return (default: 50, max: 200)
- `is_read` (bool): Filter by read status
- `type` (string): Filter by notification type

#### 2. Notification Types
- `screening` - Screening completion alerts
- `monitoring` - Ongoing monitoring alerts
- `risk_alert` - High-risk match alerts
- `success` - Successful operations
- `info` - General information
- `security` - Security-related events
- `system` - System notifications
- `billing` - Billing/subscription updates

#### 3. Priority Levels
- `urgent` - Requires immediate attention
- `high` - Important, review soon
- `normal` - Standard notification
- `low` - Informational

#### 4. Service Functions (`notification_service.py`)

```python
create_notification(db, notification)       # Create new notification
get_notifications(db, user_id, ...)         # Get with filters
get_unread_count(db, user_id)               # Get unread count
mark_as_read(db, notification_id, user_id)  # Mark single as read
mark_all_as_read(db, user_id)               # Mark all as read
delete_notification(db, notification_id, user_id)  # Delete notification
```

### Frontend Components

#### 1. Notification Center Page (`/activity`)
- **Location**: `frontend/app/(dashboard)/activity/page.tsx`
- **Features**:
  - Filter bar (All, Unread, Risk, Success, Monitoring)
  - Mark all as read button
  - Refresh button with loading spinner
  - Smart timestamp formatting (e.g., "5m ago", "2h ago")
  - Priority badges (Urgent, High, Normal, Low)
  - Quick action buttons (Mark read, View details, Delete)
  - Empty state illustrations
  - Error handling with retry

#### 2. Header Badge
- **Location**: `frontend/app/(dashboard)/layout.tsx`
- **Features**:
  - Real-time unread count display
  - Auto-refresh every 30 seconds
  - Clickable bell icon → navigates to `/activity`
  - Badge shows count (99+ for overflow)
  - Pulse animation for attention

---

## Database Schema

```sql
Table: notifications
├── id: UUID (primary key)
├── user_id: String (foreign key → users.username)
├── title: String
├── message: Text
├── type: String (indexed)
├── priority: String (default: "normal")
├── link: String (nullable)
├── is_read: Boolean (default: false)
├── metadata_json: JSONB (nullable)
└── created_at: DateTime
```

---

## Usage Examples

### Creating a Notification (Backend)

```python
from app.services import notification_service
from app.schemas import notifications as notification_schemas

notification_service.create_notification(
    db=db,
    notification=notification_schemas.NotificationCreate(
        user_id="john.doe",
        title="High-Risk Match Found",
        message="Screening for 'John Smith' returned 2 matches on OFAC sanctions list.",
        type="risk_alert",
        priority="high",
        link="/screenings/SCR-12345",
        metadata_json={
            "screening_id": "SCR-12345",
            "match_count": 2,
            "risk_level": "HIGH"
        }
    )
)
```

### Fetching Notifications (Frontend)

```typescript
// Get all notifications
const res = await fetch('/api/v1/notifications/?limit=50', {
  headers: { Authorization: `Bearer ${token}` }
});

// Get only unread
const res = await fetch('/api/v1/notifications/?is_read=false', {
  headers: { Authorization: `Bearer ${token}` }
});

// Get unread count
const res = await fetch('/api/v1/notifications/count', {
  headers: { Authorization: `Bearer ${token}` }
});
```

---

## UI/UX Features

### Color Coding
| Type | Icon Color | Background |
|------|------------|------------|
| Risk Alert | Red (#ef4444) | rgba(239, 68, 68, 0.15) |
| Success | Green (#22c55e) | rgba(34, 197, 94, 0.15) |
| Monitoring | Blue (#3b82f6) | rgba(59, 130, 246, 0.15) |
| Security | Amber (#f59e0b) | rgba(245, 158, 11, 0.15) |
| System/Info | Slate (#64748b) | rgba(148, 163, 184, 0.15) |

### Smart Timestamps
- `< 1 min`: "Just now"
- `< 60 min`: "Xm ago"
- `< 24 hrs`: "Xh ago"
- `< 7 days`: "Xd ago"
- `> 7 days`: Full date

### Unread Indicator
- Blue left border (4px)
- Gradient background fade from left
- Removed on hover (surface changes)

---

## Testing

### Seed Test Data
```bash
cd backend
python scripts/seed_notifications.py
```

This creates:
- 3 sample screenings
- 6 notifications (mixed types, read/unread)
- Timestamps spread over 2 days

### Manual Testing Checklist
- [ ] Navigate to `/activity` - page loads
- [ ] Check header bell - shows unread count
- [ ] Click bell icon - navigates to notification center
- [ ] Apply filters - All, Unread, Risk, Success, Monitoring
- [ ] Mark single notification as read
- [ ] Mark all as read
- [ ] Delete a notification
- [ ] Click refresh button
- [ ] Verify responsive design on mobile
- [ ] Check dark/light theme compatibility

---

## Future Enhancements

1. **WebSocket Support** - Real-time push notifications
2. **Email Notifications** - Critical alerts via email
3. **Push Notifications** - Browser push API
4. **Bulk Actions** - Select multiple notifications
5. **Pagination** - Load more / infinite scroll
6. **Search** - Search notifications by keyword
7. **Categories** - Group by date (Today, Yesterday, This Week)
8. **Archive** - Archive instead of delete
9. **Notification Preferences** - User settings for types/channels
10. **Mobile Push** - Integrate with mobile app

---

## Troubleshooting

### "Failed to fetch notifications"
- Check backend is running on port 8000
- Verify JWT token in localStorage is valid
- Check browser console for CORS errors
- Ensure `NEXT_PUBLIC_API_URL` is correct

### Badge not showing count
- Check `/api/v1/notifications/count` endpoint response
- Verify 30-second interval is working
- Check CSS animation is not disabled

### Notifications not appearing
- Run seed script: `python scripts/seed_notifications.py`
- Check database `notifications` table
- Verify `user_id` matches logged-in user

---

## Files Modified

### Backend
- `backend/app/api/notifications.py` - Added `/count` endpoint, filters
- `backend/app/services/notification_service.py` - Enhanced with error handling, `get_unread_count`

### Frontend
- `frontend/app/(dashboard)/activity/page.tsx` - Complete redesign
- `frontend/app/(dashboard)/activity/page.module.css` - New modern UI styles
- `frontend/app/(dashboard)/layout.tsx` - Added badge count, auto-refresh
- `frontend/app/(dashboard)/layout.module.css` - Badge styling with animation

---

## API Reference

### GET `/api/v1/notifications/count`
**Response:**
```json
{
  "unread_count": 5,
  "user_id": "john.doe"
}
```

### GET `/api/v1/notifications/?limit=50&is_read=false`
**Response:**
```json
[
  {
    "id": "uuid-here",
    "title": "High-Risk Match Found",
    "message": "Screening returned 2 matches on sanctions list.",
    "type": "risk_alert",
    "priority": "high",
    "link": "/screenings/SCR-123",
    "metadata_json": {"screening_id": "SCR-123"},
    "is_read": false,
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

---

**Last Updated**: April 9, 2026
**Version**: 2.0
**Status**: Production Ready
