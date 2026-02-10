# Debugging Real-Time Notifications

## Step-by-Step Debugging Guide

### 1. Open Browser Console
- Press `F12` or `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Option+I` (Mac)
- Go to the **Console** tab

### 2. Check for These Log Messages

When the page loads, you should see:
```
Realtime subscription status: SUBSCRIBED
```

If you see `CLOSED` or `CHANNEL_ERROR`, there's an issue.

### 3. Test Order Status Update

When you update an order status in Supabase, you should see:
```
Order status updated! {payload object}
[UPDATE] 👨‍🍳 Order Status Updated: Order #abc123 is now preparing
```

### 4. Common Issues & Fixes

#### Issue: "Realtime subscription status: CLOSED"
**Fix:** Check that Realtime is enabled on the orders table
1. Go to Supabase Dashboard → Database → Replication
2. Make sure `orders` table has Realtime toggle **ON**

#### Issue: "No console logs appearing"
**Possible causes:**
1. **RLS Policies blocking updates**
   - The filter `company_id=eq.${companyId}` might not match
   - Check that the order you're updating has the same company_id as your logged-in user

2. **Subscription filter not working**
   - Try removing the filter temporarily to test

3. **WebSocket connection blocked**
   - Check browser console for WebSocket errors
   - Check firewall/proxy settings

#### Issue: "Getting INSERT but not UPDATE notifications"
**Fix:** The status field might not be updating properly
- Make sure you're actually changing the `status` field
- Check that `updated_at` is also being updated

### 5. Manual Test Commands

Run these in browser console to test:

```javascript
// Check current subscription status
console.log('Channels:', supabase.getChannels());

// Check notification permission
console.log('Notification permission:', Notification.permission);

// Test notification manually
new Notification('Test', { body: 'This is a test notification' });
```

### 6. Quick Fix: Remove Filter Temporarily

If notifications still don't work, try this temporary fix to see ALL orders:

In `/packages/api/use-order-notifications.ts`, change line 50 and 72:
```typescript
// Remove the filter temporarily
filter: undefined, // Was: companyId ? `company_id=eq.${companyId}` : undefined,
```

This will help you determine if it's a filtering issue or a realtime issue.

### 7. Verify Realtime is Actually Enabled

Run this SQL in Supabase SQL Editor:
```sql
-- Check if orders table is in the publication
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
```

You should see `orders` in the results. If not, run:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
```

### 8. Check Network Tab

1. Open DevTools → Network tab
2. Filter by "WS" (WebSocket)
3. Look for a connection to Supabase realtime
4. Check if it's connected (green indicator)

---

## Quick Debug Version

Want to see more detailed logs? Let me know and I can add verbose logging to help troubleshoot!
