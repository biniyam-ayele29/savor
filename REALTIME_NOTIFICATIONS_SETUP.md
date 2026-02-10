# Real-Time Order Notifications Setup

## ✅ Code Changes Complete!

I've implemented real-time notifications for your Savor app. Here's what I did:

### Files Created/Modified:
1. ✅ `/packages/api/use-order-notifications.ts` - Real-time subscription hook
2. ✅ `/packages/app/features/notifications/notification-button.tsx` - UI button component
3. ✅ `/apps/next/app/order/page.tsx` - Integrated notifications
4. ✅ `/packages/api/index.ts` - Exported new hook

---

## 🔧 What YOU Need to Do (Supabase Setup)

### Step 1: Enable Realtime on Your Supabase Project

Run these commands to enable Realtime for the `orders` table:

#### Option A: Using Supabase Dashboard (Easiest)
1. Go to: https://supabase.com/dashboard/project/bfwjqaudgrfuhhtavqdk
2. Click on **Database** in the left sidebar
3. Click on **Replication** tab
4. Find the `orders` table in the list
5. Toggle **Realtime** to **ON** for the `orders` table
6. Click **Save**

#### Option B: Using SQL (Alternative)
1. Go to: https://supabase.com/dashboard/project/bfwjqaudgrfuhhtavqdk/sql/new
2. Run this SQL command:

\`\`\`sql
-- Enable Realtime for orders table
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
\`\`\`

3. Click **Run**

---

### Step 2: Verify Row Level Security (RLS) Policies

Make sure your `orders` table has proper RLS policies so users can only see their company's orders:

\`\`\`sql
-- Check if RLS is enabled (should return true)
SELECT relname, relrowsecurity 
FROM pg_class 
WHERE relname = 'orders';

-- If RLS is not enabled, enable it:
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Add policy to allow users to see their company's orders
CREATE POLICY "Users can view their company orders"
ON orders FOR SELECT
USING (
  company_id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
    UNION
    SELECT company_id FROM company_admins WHERE user_id = auth.uid()
  )
);

-- Add policy to allow users to insert orders for their company
CREATE POLICY "Users can insert orders for their company"
ON orders FOR INSERT
WITH CHECK (
  company_id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
    UNION
    SELECT company_id FROM company_admins WHERE user_id = auth.uid()
  )
);
\`\`\`

---

### Step 3: Test the Notifications

1. **Start your development server** if it's not already running
2. **Open the Order page** in your browser
3. **Click "Enable Notifications"** button (top right of the order page)
4. **Allow notifications** when the browser prompts you
5. **Test it:**
   - Place a new order → You should see a notification!
   - Update an order status in Supabase Dashboard → You should see an update notification!

---

## 🎉 Features Implemented

### Real-Time Updates
- ✅ **New Order Notifications** - Get notified when a new order is placed
- ✅ **Status Change Notifications** - Get notified when order status changes
- ✅ **Auto UI Refresh** - Order list updates automatically without refresh
- ✅ **Browser Notifications** - Native OS notifications with sound
- ✅ **In-App Notifications** - Console logs as fallback

### Notification Types
- 🛒 **New Order**: "New Order Received! Order #ABC123 - ETB 150"
- ⏳ **Pending**: "Order Status Updated - Order #ABC123 is now pending"
- 👨‍🍳 **Preparing**: "Order Status Updated - Order #ABC123 is now preparing"
- 🚚 **Delivering**: "Order Status Updated - Order #ABC123 is now delivering"
- ✅ **Delivered**: "Order Status Updated - Order #ABC123 is now delivered"

### UI Components
- ✅ **Enable Notifications Button** - Shows in order page header
- ✅ **Permission Status Indicator** - Green badge when active
- ✅ **Blocked Warning** - Red badge if user denied permissions

---

## 🔍 How It Works

1. **Supabase Realtime** listens for changes to the `orders` table
2. **When a new order is inserted** → Notification triggered
3. **When an order status updates** → Notification triggered
4. **React Query cache** is invalidated → UI refreshes automatically
5. **Browser Notifications API** shows OS-level notifications

---

## 🐛 Troubleshooting

### "Notifications not working"
- ✅ Check browser console for "Realtime subscription status: SUBSCRIBED"
- ✅ Make sure you enabled Realtime on orders table in Supabase
- ✅ Check browser notification permissions (should be "granted")
- ✅ Try in Chrome/Firefox (some browsers block notifications)

### "Can't see other company's orders"
- ✅ This is correct! RLS policies ensure users only see their company's orders
- ✅ Each user is filtered by their `company_id`

### "Notifications not showing in browser"
- ✅ Click the notification button to request permissions
- ✅ Check browser settings → Site settings → Notifications
- ✅ Make sure "Do Not Disturb" is off on your OS

---

## 📱 Next Steps (Optional Enhancements)

Want to add more features? Here are some ideas:

1. **Sound notifications** - Add custom notification sounds
2. **Toast notifications** - In-app toasts instead of browser notifications
3. **Notification history** - Keep a log of all notifications
4. **Custom notification settings** - Let users choose what to be notified about
5. **Push notifications** - For mobile apps using service workers

Let me know if you want any of these implemented!

---

## 🎯 Summary

**What I did:**
- ✅ Created real-time subscription hook
- ✅ Added notification permission button
- ✅ Integrated into order page
- ✅ Set up automatic UI refresh

**What you need to do:**
1. Enable Realtime on \`orders\` table in Supabase Dashboard
2. Verify RLS policies are set up
3. Test by placing an order and updating status

That's it! Once you enable Realtime in Supabase, notifications will work automatically! 🚀
