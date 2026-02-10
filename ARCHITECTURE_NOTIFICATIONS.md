# Savor Notification System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      Admin Dashboard                             │
│  (Admin updates order status: pending → preparing → delivering)  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ Order Status Update
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Supabase Database                             │
│   UPDATE orders SET status = 'delivering' WHERE id = '...'      │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ Postgres Changes Event
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                   Supabase Realtime                              │
│        Broadcasting UPDATE event to all subscribers              │
└────────────┬─────────────────────┬──────────────────────────────┘
             │                     │
     ┌───────┴───────┐    ┌────────┴─────────┐
     ↓               ↓    ↓                  ↓
┌─────────┐   ┌──────────┐   ┌───────────────────┐
│  Toast  │   │ Browser  │   │  Telegram Bot     │
│ Service │   │  Notif   │   │  Service          │
└────┬────┘   └────┬─────┘   └─────────┬─────────┘
     │             │                     │
     │             │                     │ Fetch employee
     │             │                     ↓
     │             │         ┌─────────────────────┐
     │             │         │ Get telegram_chat_id│
     │             │         └──────────┬──────────┘
     │             │                    │
     ↓             ↓                    ↓
┌─────────┐  ┌──────────┐     ┌─────────────────┐
│ UI Toast│  │  OS Pop  │     │ Telegram Message│
│  (App)  │  │   (OS)   │     │    (Phone)      │
└─────────┘  └──────────┘     └─────────────────┘
```

## Notification Flow Details

### 1. In-App Toast Notifications 🎨

**Trigger:** Realtime subscription on orders table  
**Target:** Current page users  
**Display:** Top right corner of UI  
**Duration:** 5 seconds (auto-dismiss)  
**Components:**
- `toast-context.tsx` - State management
- `toast-container.tsx` - UI rendering
- `use-order-notifications.ts` - Realtime listener

**Features:**
- Gradient backgrounds
- Context-aware icons
- Smooth animations
- Multiple toasts support
- Close button

---

### 2. Browser Push Notifications 🔔

**Trigger:** Same realtime subscription  
**Target:** Users with granted permission  
**Display:** OS notification center  
**Duration:** 5 seconds  
**Permission:** Requested on first visit

**Works When:**
- Tab is in background
- Browser is minimized
- User is on different tab

---

### 3. Telegram Bot Notifications 📱

**Trigger:** Separate realtime subscription  
**Target:** Users with linked Telegram  
**Display:** Telegram app on phone  
**Persistence:** Permanent in chat history

**Flow:**
```
1. User Registration
   ↓
   User opens bot → Sends phone number
   ↓
   Bot validates → Updates database
   ↓
   telegram_chat_id saved to employee record

2. Notification Delivery
   ↓
   Order status changes → Realtime event
   ↓
   Fetch employee record → Get telegram_chat_id
   ↓
   Parse order details → Format message
   ↓
   Send via Telegram API → User receives message
```

---

## Database Schema

### Employees Table (Updated)
```sql
CREATE TABLE employees (
  id UUID PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  telegram_chat_id TEXT,  -- NEW: Links user to Telegram
  position TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_employees_telegram_chat_id 
ON employees(telegram_chat_id);
```

---

## Component Integration

### Layout (`apps/next/app/layout.tsx`)
```tsx
<APIProvider>
  <ThemeProvider>
    <ToastProvider>           {/* Toast context */}
      <StylesProvider>
        <AuthGuard>
          <NavBar />
          {children}
          <ToastContainer />     {/* Toast UI */}
        </AuthGuard>
      </StylesProvider>
    </ToastProvider>
  </ThemeProvider>
</APIProvider>
```

### Order Page (`apps/next/app/order/page.tsx`)
```tsx
export default function OrderPage() {
  const { showToast } = useToast()
  
  // Connect toast to notification system
  useEffect(() => {
    setToastCallback((title, message, type) => {
      showToast({ title, message, type })
    })
  }, [showToast])
  
  // Enable notifications
  useOrderNotifications(companyId)
  
  // ... rest of component
}
```

### Orders Admin Page (`apps/next/app/orders/page.tsx`)
```tsx
export default function OrdersPage() {
  const { showToast } = useToast()
  
  // Same setup as order page
  useEffect(() => {
    setToastCallback((title, message, type) => {
      showToast({ title, message, type })
    })
  }, [showToast])
  
  // Enable both notification systems
  useOrderNotifications(companyId)
  useTelegramNotifications()
  
  // ... rest of component
}
```

---

## Message Examples

### Toast Notification
```
┌──────────────────────────────────────┐
│  🚚  Order Status Updated            │
│                                      │
│  Order #a1b2c3d4 is now delivering   │
│                                  [x] │
└──────────────────────────────────────┘
```

### Browser Notification
```
┌────────────────────────────┐
│ 🚚 Order Status Updated    │
│ Order #a1b2c3d4 is now     │
│ delivering                 │
└────────────────────────────┘
```

### Telegram Message
```
🚚 Order Status Update

Order ID: #a1b2c3d4
Status: Delivering
Company: Gebeya Tech

Items:
  • 2x Espresso
  • 1x Croissant

Total: ETB 85.00

Your order is on the way to your location!
```

---

## Performance Considerations

### Realtime Subscriptions
- **Toast/Browser**: Single subscription per page
- **Telegram**: Single subscription in admin dashboard
- **Filter**: By company_id (when enabled)
- **Events**: INSERT (new orders) + UPDATE (status changes)

### Optimization
- Debouncing: Status changes trigger once
- Filtering: Only notify on actual status change
- Connection: Single WebSocket per page
- Cleanup: Unsubscribe on component unmount

---

## Security

### RLS Policies
```sql
-- Users can only see their company's orders
CREATE POLICY "Users see own company orders"
ON orders FOR SELECT
USING (company_id = auth.uid());

-- Only update via authenticated functions
CREATE POLICY "Admins update orders"
ON orders FOR UPDATE
USING (is_admin(auth.uid()));
```

### Telegram Bot
- Bot token stored in environment variables
- Phone number validation
- Chat ID verification
- No sensitive data in messages

---

## Error Handling

### Toast Notifications
- Graceful fallback if toast context unavailable
- Auto-retry on failed display
- Console logging for debugging

### Browser Notifications
- Check permission status
- Request permission on first use
- Fallback to toast if denied

### Telegram Notifications
- Verify bot token exists
- Validate phone number format
- Check telegram_chat_id exists
- Log all API responses
- Graceful degradation if Telegram API fails

---

## Testing Checklist

- [ ] Toast appears on status update
- [ ] Browser notification shows when tab inactive
- [ ] Telegram bot responds to /start
- [ ] Phone registration works
- [ ] Telegram message delivered on status update
- [ ] Multiple notifications don't conflict
- [ ] Notifications work across different browsers
- [ ] Mobile Telegram app receives messages
- [ ] Error states handled gracefully
- [ ] Unsubscribe works on page leave

---

## Future Enhancements

### Potential Features
- [ ] Email notifications
- [ ] SMS notifications (Twilio)
- [ ] WhatsApp Business API
- [ ] Push notifications (PWA)
- [ ] Notification preferences UI
- [ ] Notification history log
- [ ] Read receipts
- [ ] Delivery confirmations
- [ ] Rich media in notifications
- [ ] Interactive buttons in Telegram
