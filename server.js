const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcrypt');
const PDFDocument = require('pdfkit');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'farm2future-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// PostgreSQL Database Connection
const db = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test database connection
db.connect((err, client, release) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
    return;
  }
  console.log('✅ Connected to PostgreSQL database');
  release();
});

// Create tables if they don't exist
const createTables = async () => {
  try {
    // Farmer table
    await db.query(`
      CREATE TABLE IF NOT EXISTS farmer (
        farmer_id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Crops table
    await db.query(`
      CREATE TABLE IF NOT EXISTS crops (
        crop_id SERIAL PRIMARY KEY,
        farmer_id INTEGER REFERENCES farmer(farmer_id),
        crop_name VARCHAR(255) NOT NULL,
        crop_type VARCHAR(255),
        sowing_date DATE,
        location VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Activity log table
    await db.query(`
      CREATE TABLE IF NOT EXISTS activity_log (
        log_id SERIAL PRIMARY KEY,
        farmer_id INTEGER REFERENCES farmer(farmer_id),
        activity_type VARCHAR(255),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Users table (for store)
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Products table
    await db.query(`
      CREATE TABLE IF NOT EXISTS products (
        product_id SERIAL PRIMARY KEY,
        product_name VARCHAR(255) NOT NULL,
        price DECIMAL(10,2),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Cart table
    await db.query(`
      CREATE TABLE IF NOT EXISTS cart (
        cart_id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(user_id),
        product_id INTEGER REFERENCES products(product_id),
        quantity INTEGER DEFAULT 1,
        total_price DECIMAL(10,2),
        status VARCHAR(50) DEFAULT 'Pending',
        order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        delivery_address TEXT,
        payment_mode VARCHAR(50),
        payment_status VARCHAR(50) DEFAULT 'Pending'
      )
    `);

    // Reviews table
    await db.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        review_date DATE,
        review TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // User inputs table (for government schemes)
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_inputs (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        state VARCHAR(255),
        district VARCHAR(255),
        land_size VARCHAR(255),
        crop_type VARCHAR(255),
        irrigation_method VARCHAR(255),
        farmer_type VARCHAR(255),
        need_goal VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Database tables created/verified successfully');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
  }
};

// Initialize tables
createTables();

// Static files middleware
app.use(express.static(path.join(__dirname)));

// Authentication Middleware
const isAuthenticated = (req, res, next) => {
  if (req.session.farmerId) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// ============ AUTHENTICATION ROUTES ============

// Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const result = await db.query('SELECT * FROM farmer WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const farmer = result.rows[0];
    
    // For demo: simple password check (in production use bcrypt)
    if (password === farmer.password) {
      req.session.farmerId = farmer.farmer_id;
      req.session.farmerName = farmer.name;
      
      // Log activity
      await db.query(
        'INSERT INTO activity_log (farmer_id, activity_type, description) VALUES ($1, $2, $3)',
        [farmer.farmer_id, 'login', 'Farmer logged in']
      );
      
      res.json({ 
        success: true, 
        farmer: { 
          id: farmer.farmer_id, 
          name: farmer.name, 
          email: farmer.email 
        } 
      });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Sign Up
app.post('/api/signup', async (req, res) => {
  const { name, email, password } = req.body;
  
  try {
    // Check if user already exists
    const checkResult = await db.query('SELECT * FROM farmer WHERE email = $1', [email]);
    
    if (checkResult.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    // Insert new farmer
    await db.query(
      'INSERT INTO farmer (name, email, password) VALUES ($1, $2, $3)',
      [name, email, password]
    );
    
    res.json({ 
      success: true, 
      message: 'Account created successfully! Please login.' 
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// Logout
app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// Check session
app.get('/api/check-session', (req, res) => {
  if (req.session.farmerId) {
    res.json({ 
      authenticated: true, 
      farmerId: req.session.farmerId,
      farmerName: req.session.farmerName
    });
  } else {
    res.json({ authenticated: false });
  }
});

// ============ BASIC ROUTES ============

// Home route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Dashboard route
app.get('/dashboard.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Login route
app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

// Government schemes route
app.get('/gov.php', (req, res) => {
  res.sendFile(path.join(__dirname, 'gov-schemes.html'));
});

// Simple government schemes endpoint
app.post('/gov.php', async (req, res) => {
  const { name, email, state, district, land_size, crop_type, irrigation, farmer_type, goal } = req.body;
  
  try {
    // Store user input
    await db.query(`
      INSERT INTO user_inputs (name, email, state, district, land_size, crop_type, irrigation_method, farmer_type, need_goal) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [name, email, state, district, land_size, crop_type, irrigation, farmer_type, goal]);
    
    // Return some sample schemes
    const schemes = [
      {
        title: 'PM-Kisan Samman Nidhi',
        description: 'Direct income support of ₹6,000/year to small and marginal farmers.',
        link: 'https://pmkisan.gov.in/',
        icon: '💰'
      },
      {
        title: 'Pradhan Mantri Fasal Bima Yojana',
        description: 'Comprehensive crop insurance scheme protecting farmers against crop failure.',
        link: 'https://pmfby.gov.in/',
        icon: '🛡️'
      }
    ];
    
    res.json({ schemes });
  } catch (error) {
    console.error('Gov schemes error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

// Start server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard.html`);
  console.log(`🔐 Login: http://localhost:${PORT}/login.html`);
  console.log(`🌾 Govt Schemes: http://localhost:${PORT}/gov.php`);
});
