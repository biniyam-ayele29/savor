# Notification System Documentation

## Overview

The Savor app now features a comprehensive notification system that captures browser notifications and stores them in a persistent notification center accessible via a bell icon in the top navbar.

## Features

### 1. **Notification Bell Icon**
- Located in the top navbar between the company logo and theme toggle
- Shows a red badge with unread notification count
- Click to open dropdown with notification history

### 2. **Notification Storage**
- Notifications are persisted to `localStorage`
- Stores last 50 notifications
- Each notification includes:
  - Title and body
  - Type (new order or order update)
  - Timestamp
  - Read/unread status

### 3. **Notification Types**
- **New Orders** (🛒): When a new order is placed
- **Order Updates** (📦): When order status changes (preparing, delivering, delivered)

### 4. **Notification Actions**
- **Mark as read**: Click individual notification
- **Mark all as read**: Click checkmark icon in header
- **Delete notification**: Click X icon on individual notification
- **Clear all**: Click trash icon in header

## Architecture

### Components

#### 1. `notification-store.tsx`
Context provider that manages notification state:
- Stores notifications in React state and localStorage
- Provides methods to add, read, and delete notifications
- Tracks unread count

#### 2. `notification-bell.tsx`
UI component that displays:
- Bell icon with unread badge
- Dropdown with notification list
- Timestamp formatting (e.g., "2m ago", "3h ago")
- Empty state when no notifications

#### 3. `notification-store-initializer.tsx`
Connects the notification hook to the notification store
- Must be placed inside both `NotificationProvider` and `AuthGuard`
- Sets up callback for storing notifications

### Data Flow

```
Order Event (Insert/Update)
    ↓
useOrderNotifications hook
    ↓
setNotificationStoreCallback
    ↓
NotificationStore.addNotification
    ↓
localStorage + React State
    ↓
NotificationBell UI updates
```

## Integration Points

### 1. Layout Setup (`apps/next/app/layout.tsx`)

```tsx
<NotificationProvider>
  <AuthGuard>
    <NotificationStoreInitializer />
    <NavBar />
    {children}
  </AuthGuard>
</NotificationProvider>
```

### 2. Navbar Integration (`apps/next/app/navbar.tsx`)

```tsx
import { NotificationBell } from 'app/features/notifications/notification-bell';

// In the navbar render:
<NotificationBell />
```

### 3. API Integration (`packages/api/use-order-notifications.ts`)

```tsx
// Save to notification store
if (notificationStoreCallback) {
    notificationStoreCallback(title, body, type);
}

// Also show browser notification
if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body, icon, badge });
}
```

## Usage

### For End Users

1. **Enable Notifications**
   - Click "Enable Notifications" button on dashboard/orders page
   - Grant browser permission when prompted

2. **View Notifications**
   - Click bell icon in navbar
   - Scroll through notification history
   - Click notification to mark as read

3. **Manage Notifications**
   - Mark individual notifications as read by clicking
   - Use "Mark all as read" for bulk actions
   - Delete individual or all notifications

### For Developers

#### Adding New Notification Types

Edit `use-order-notifications.ts`:

```typescript
showNotification(
    'Your Title',
    'Your message body',
    'new' // or 'update'
);
```

#### Customizing Notification Display

Edit `notification-bell.tsx`:

```typescript
const getNotificationIcon = (type: 'new' | 'update') => {
    if (type === 'new') return '🛒';
    return '📦';
    // Add more types here
};
```

#### Adjusting Storage Limits

Edit `notification-store.tsx`:

```typescript
const MAX_NOTIFICATIONS = 50; // Change this value
```

## Browser Compatibility

- Requires browser with `Notification` API support
- localStorage required for persistence
- Falls back gracefully if APIs not available

## Styling

The notification system uses the app's theme context:
- Respects light/dark mode
- Uses consistent color palette from `theme-context`
- Responsive design for mobile/desktop

## Future Enhancements

Potential improvements:
- [ ] Filter notifications by type
- [ ] Search functionality
- [ ] Notification sound toggle
- [ ] Export notification history
- [ ] Notification categories
- [ ] Custom notification actions (e.g., "View Order")
