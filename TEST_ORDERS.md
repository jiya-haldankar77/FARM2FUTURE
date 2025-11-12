# Testing Order Storage in MySQL

## ✅ Setup Complete!

Orders are now saved to your existing `cart` table with `status = 'Ordered'`

## 🧪 How to Test

### Step 1: Make Sure Database is Running
```bash
# Check if MySQL is running
mysql -u root -p
```

### Step 2: Verify Database Exists
```sql
USE farm_market;
SHOW TABLES;
```

You should see:
- users
- products  
- cart

### Step 3: Check Current Data
```sql
-- View all orders
SELECT * FROM cart WHERE status = 'Ordered';

-- View with user details
SELECT 
    u.username,
    u.email,
    u.phone,
    p.product_name,
    c.quantity,
    c.total_price,
    c.status,
    c.order_date,
    c.delivery_address,
    c.payment_mode,
    c.payment_status
FROM cart c
LEFT JOIN users u ON c.user_id = u.user_id
LEFT JOIN products p ON c.product_id = p.product_id
WHERE c.status = 'Ordered'
ORDER BY c.order_date DESC;
```

### Step 4: Test the Flow

1. **Start the server:**
```bash
cd "/Users/jiya/Documents/wb t/mn"
node server.js
```

2. **Open the application:**
   - Go to: http://localhost:3000/login.html
   - Login with: admin@gmail.com / admin1234

3. **Make a purchase:**
   - Go to Marketplace or Nursery
   - Add items to cart
   - Click Cart button
   - Fill in delivery details:
     - Name
     - Phone
     - Delivery Date
     - Address
   - Select payment method (UPI/COD)
   - Complete payment

4. **Check the database:**
```sql
-- Refresh to see new orders
SELECT 
    u.username,
    u.email,
    p.product_name,
    c.quantity,
    c.total_price,
    c.order_date,
    c.payment_mode
FROM cart c
LEFT JOIN users u ON c.user_id = u.user_id
LEFT JOIN products p ON c.product_id = p.product_id
WHERE c.status = 'Ordered'
ORDER BY c.order_date DESC
LIMIT 5;
```

## 📊 What Gets Stored

In the `cart` table with `status = 'Ordered'`:

| Field | Description | Example |
|-------|-------------|---------|
| cart_id | Unique ID | 1, 2, 3... |
| user_id | User reference | 1 |
| product_id | Product reference | NULL (for nursery items) |
| quantity | Number of items | 2 |
| total_price | Item total | 299.00 |
| status | Order status | 'Ordered' |
| order_date | When ordered | 2025-11-10 14:30:00 |
| delivery_address | Full address | "Farm House, District..." |
| payment_mode | Payment method | 'UPI' or 'Cash on Delivery' |
| payment_status | Payment status | 'Paid' |

## 🔍 Useful Queries

### Get Today's Orders
```sql
SELECT * FROM cart 
WHERE status = 'Ordered' 
AND DATE(order_date) = CURDATE();
```

### Get Orders by Email
```sql
SELECT 
    c.*,
    u.username,
    u.email
FROM cart c
JOIN users u ON c.user_id = u.user_id
WHERE u.email = 'admin@gmail.com'
AND c.status = 'Ordered';
```

### Get Total Sales
```sql
SELECT 
    COUNT(*) as total_orders,
    SUM(total_price) as total_revenue
FROM cart 
WHERE status = 'Ordered' 
AND payment_status = 'Paid';
```

### Get Orders by Payment Method
```sql
SELECT 
    payment_mode,
    COUNT(*) as order_count,
    SUM(total_price) as revenue
FROM cart
WHERE status = 'Ordered'
GROUP BY payment_mode;
```

## 🐛 Troubleshooting

### Orders Not Showing Up?

1. **Check server console for errors:**
```bash
# Look for messages like:
✅ Order saved to database: ORD1731234567890
# or
❌ Error saving order to database: ...
```

2. **Check browser console (F12):**
```javascript
// Look for:
✅ Order saved to database: ORD1731234567890
// or
❌ Failed to save order: ...
```

3. **Verify database connection:**
```sql
-- In MySQL:
SHOW PROCESSLIST;
```

4. **Check if user was created:**
```sql
SELECT * FROM users WHERE email = 'admin@gmail.com';
```

5. **Check cart table:**
```sql
SELECT * FROM cart ORDER BY added_at DESC LIMIT 5;
```

## ✨ Features

✅ Auto-creates user if doesn't exist
✅ Stores each product as separate cart entry
✅ Sets status to 'Ordered'
✅ Marks payment_status as 'Paid'
✅ Records order_date automatically
✅ Saves delivery address
✅ Saves payment method (UPI/COD)
✅ Links to user_id
✅ Links to product_id (if product exists)

## 🎯 Expected Behavior

After completing checkout:
1. User record created/found in `users` table
2. Each cart item inserted into `cart` table with:
   - status = 'Ordered'
   - payment_status = 'Paid'
   - order_date = NOW()
   - delivery_address = user's address
   - payment_mode = UPI or Cash on Delivery
3. PDF bill downloaded
4. Success message shown

## 📱 API Test (Optional)

Test the API directly:
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "TEST123",
    "userEmail": "test@example.com",
    "customerName": "Test User",
    "customerPhone": "9876543210",
    "deliveryAddress": "Test Address",
    "deliveryDate": "2025-11-15",
    "subtotal": 299,
    "deliveryCharge": 50,
    "totalAmount": 349,
    "paymentMethod": "UPI",
    "items": [
      {
        "name": "Bamboo Saplings",
        "price": "₹299",
        "quantity": 1
      }
    ]
  }'
```

Then check:
```sql
SELECT * FROM cart WHERE status = 'Ordered' ORDER BY order_date DESC LIMIT 1;
```

You should see the test order!
