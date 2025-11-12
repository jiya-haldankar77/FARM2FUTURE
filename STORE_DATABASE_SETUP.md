# Farm2Future Store Database Setup Guide

## 📦 Database Schema Overview

The `farm_market` database stores all order and purchase information from the marketplace and nursery.

## 🗄️ Database Tables

### 1. **users** - Customer Information
- `user_id` - Primary key
- `username` - Customer name
- `email` - Unique email address
- `password` - Encrypted password
- `phone` - Contact number
- `address` - Default address

### 2. **products** - Marketplace Products
- `product_id` - Primary key
- `product_name` - Product name
- `price` - Product price
- `quantity` - Available quantity
- `seller_name` - Seller information
- `contact_number` - Seller contact
- `address` - Seller location
- `reviews` - Customer reviews
- `rating` - Product rating
- `image_url` - Product image

### 3. **orders** - Main Order Information
- `order_id` - Unique order ID (e.g., ORD1731234567890)
- `user_email` - Customer email
- `customer_name` - Full name
- `customer_phone` - Phone number
- `delivery_address` - Complete delivery address
- `delivery_date` - Expected delivery date
- `order_date` - Order placement timestamp
- `subtotal` - Items total
- `delivery_charge` - Delivery fee (₹50)
- `total_amount` - Grand total
- `payment_method` - UPI or COD
- `payment_status` - Pending/Paid/Failed
- `order_status` - Pending/Confirmed/Shipped/Delivered/Cancelled

### 4. **order_items** - Individual Products in Orders
- `item_id` - Primary key
- `order_id` - Foreign key to orders
- `product_name` - Product name
- `product_price` - Price per unit
- `quantity` - Number of items
- `item_total` - Total for this item

### 5. **cart** - Temporary Shopping Cart
- `cart_id` - Primary key
- `user_email` - Customer email
- `product_name` - Product name
- `product_price` - Price
- `quantity` - Quantity
- `added_at` - Timestamp

### 6. **nursery_products** - Nursery Plant Catalog
- `nursery_id` - Primary key
- `product_name` - Plant name
- `description` - Plant details
- `price` - Price
- `category` - Plant category
- `stock_quantity` - Available stock
- `image_url` - Plant image

## 📊 Database Views

### **order_details_view**
Complete order information with all items concatenated:
```sql
SELECT * FROM order_details_view;
```

### **sales_summary**
Daily sales statistics:
```sql
SELECT * FROM sales_summary;
```

## 🚀 Setup Instructions

### Step 1: Create Database
```bash
mysql -u root -p
```

### Step 2: Run Schema
```sql
source /Users/jiya/Documents/wb\ t/mn/store.sql
```

### Step 3: Insert Sample Data (Optional)
```sql
source /Users/jiya/Documents/wb\ t/mn/store_sample_data.sql
```

### Step 4: Verify Setup
```sql
USE farm_market;
SHOW TABLES;
SELECT * FROM order_details_view;
```

## 🔌 API Endpoints

### Create Order
```http
POST http://localhost:3000/api/orders
Content-Type: application/json

{
  "orderId": "ORD1731234567890",
  "userEmail": "admin@gmail.com",
  "customerName": "John Doe",
  "customerPhone": "9876543210",
  "deliveryAddress": "Complete address",
  "deliveryDate": "2025-11-14",
  "subtotal": 299.00,
  "deliveryCharge": 50.00,
  "totalAmount": 349.00,
  "paymentMethod": "UPI",
  "items": [
    {
      "name": "Bamboo Saplings",
      "price": "₹299",
      "quantity": 1
    }
  ]
}
```

### Get All Orders
```http
GET http://localhost:3000/api/orders
```

### Get Order by ID
```http
GET http://localhost:3000/api/orders/ORD1731234567890
```

### Get User Orders
```http
GET http://localhost:3000/api/orders/user/admin@gmail.com
```

### Update Order Status
```http
PUT http://localhost:3000/api/orders/ORD1731234567890/status
Content-Type: application/json

{
  "orderStatus": "Shipped",
  "paymentStatus": "Paid"
}
```

### Get Sales Summary
```http
GET http://localhost:3000/api/sales/summary
```

## 📝 Order Flow

1. **User adds items to cart** (localStorage)
2. **User proceeds to checkout**
3. **User enters delivery details:**
   - Full Name
   - Phone Number
   - Delivery Date (3-7 days)
   - Delivery Address
4. **User selects payment method** (UPI/COD)
5. **Order is created:**
   - Saved to `orders` table
   - Items saved to `order_items` table
   - PDF bill generated
6. **Order tracking available**

## 🔍 Useful Queries

### View All Orders
```sql
SELECT * FROM order_details_view ORDER BY order_date DESC;
```

### Get Today's Orders
```sql
SELECT * FROM orders WHERE DATE(order_date) = CURDATE();
```

### Get Pending Orders
```sql
SELECT * FROM orders WHERE order_status = 'Pending';
```

### Get Total Sales
```sql
SELECT 
    COUNT(*) as total_orders,
    SUM(total_amount) as total_revenue
FROM orders 
WHERE payment_status = 'Paid';
```

### Get Top Products
```sql
SELECT 
    product_name,
    SUM(quantity) as total_sold,
    SUM(item_total) as revenue
FROM order_items
GROUP BY product_name
ORDER BY total_sold DESC
LIMIT 10;
```

### Get Customer Order History
```sql
SELECT * FROM orders 
WHERE user_email = 'admin@gmail.com'
ORDER BY order_date DESC;
```

## 🎯 Features

✅ Complete order tracking
✅ Customer information storage
✅ Payment method tracking
✅ Delivery date management
✅ Order status updates
✅ Sales analytics
✅ Product inventory
✅ Order history
✅ PDF bill generation
✅ Multi-product orders

## 🔐 Security Notes

- Passwords should be hashed (use bcrypt)
- Use prepared statements (already implemented)
- Validate all inputs
- Sanitize user data
- Use HTTPS in production
- Implement rate limiting
- Add authentication middleware

## 📱 Integration

The checkout system automatically saves orders to the database when:
- User completes payment
- Payment method is selected (UPI/COD)
- All required fields are filled

Orders are saved with:
- Unique Order ID
- Customer details (name, phone, email)
- Delivery information (address, date)
- Payment details (method, status)
- All purchased items
- Pricing breakdown

## 🎉 Success!

Your store database is now ready to track all orders from:
- ✅ Marketplace (market.html)
- ✅ Nursery (nursery.html)
- ✅ Checkout (checkout.html)

All orders are automatically saved to MySQL and can be viewed, tracked, and managed through the API endpoints!
