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
  origin: ['https://farm2future.onrender.com', 'http://localhost:10000', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
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

// Debug environment variables
console.log('🔍 Environment Variables Debug:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DATABASE_URL:', process.env.DATABASE_URL);

// PostgreSQL Database Connection
const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

// Fix incomplete hostname in DATABASE_URL
let databaseUrl = process.env.DATABASE_URL;
if (databaseUrl && databaseUrl.includes('dpg-') && !databaseUrl.includes('.render.com')) {
  // Fix incomplete hostname
  databaseUrl = databaseUrl.replace(/dpg-([a-zA-Z0-9]+)-a/, 'dpg-$1-a.oregon-postgres.render.com');
  console.log('🔧 Fixed DATABASE_URL hostname');
}

// If DATABASE_URL is provided (Render fallback), use it
let db;
if (databaseUrl) {
  console.log('📡 Using DATABASE_URL connection string');
  console.log('🔗 Connection URL:', databaseUrl.replace(/:[^:@]*@/, ':****@')); // Hide password
  db = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  });
} else {
  console.log('🔧 Using individual database config:', dbConfig);
  db = new Pool(dbConfig);
}

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

// API Test route
app.get('/api/test', (req, res) => {
  res.json({ 
    status: 'success', 
    message: 'Farm2Future API is working!',
    timestamp: new Date().toISOString()
  });
});

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

// Review & Support route
app.get('/rev.php', (req, res) => {
  res.sendFile(path.join(__dirname, 'rev-page.html'));
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

// Review submission endpoint
app.post('/api/submit-review', async (req, res) => {
  const { name, email, date, review } = req.body;
  
  if (!name || !email || !date || !review) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }
  
  try {
    const result = await db.query(
      'INSERT INTO reviews (name, email, review_date, review) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, date, review]
    );
    
    console.log('Review submitted successfully:', { id: result.rows[0].id, name, email, date });
    res.json({ success: true, message: 'Review submitted successfully', reviewId: result.rows[0].id });
  } catch (error) {
    console.error('Error storing review:', error);
    res.status(500).json({ success: false, message: 'Failed to store review' });
  }
});

// ============ SOIL ANALYSIS API ============

// Soil analysis endpoint (mock results since ML service isn't running)
app.post('/api/analyze-soil', async (req, res) => {
  try {
    console.log('Soil analysis request received');
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock soil analysis results
    const mockResults = {
      success: true,
      soilType: 'Loamy Soil',
      ph: 6.8,
      nutrients: {
        nitrogen: 'Medium',
        phosphorus: 'High',
        potassium: 'Medium'
      },
      moisture: 76,
      recommendations: [
        'Your soil has optimal pH levels for most crops',
        'Consider adding organic matter to improve soil structure',
        'Phosphorus levels are excellent - good for root development',
        'Monitor nitrogen levels and add compost if needed'
      ],
      suitableCrops: ['Tomatoes', 'Wheat', 'Corn', 'Beans', 'Carrots'],
      confidence: 0.92
    };
    
    // Log the analysis for the user if authenticated
    if (req.session && req.session.farmerId) {
      try {
        await db.query(
          'INSERT INTO activity_log (farmer_id, activity_type, description) VALUES ($1, $2, $3)',
          [req.session.farmerId, 'soil', `Soil analysis completed - Type: ${mockResults.soilType}, pH: ${mockResults.ph}`]
        );
      } catch (dbError) {
        console.error('Error logging soil analysis:', dbError);
        // Continue anyway
      }
    }
    
    console.log('Soil analysis completed successfully');
    res.json(mockResults);
  } catch (error) {
    console.error('Soil analysis error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to analyze soil',
      message: 'Soil analysis service is temporarily unavailable'
    });
  }
});

// ============ DASHBOARD API ENDPOINTS ============

// Get activities
app.get('/api/activities', isAuthenticated, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM activity_log WHERE farmer_id = $1 ORDER BY created_at DESC LIMIT 10',
      [req.session.farmerId]
    );
    res.json(result.rows.map(activity => ({
      activity_id: activity.log_id,
      activity_type: activity.activity_type,
      description: activity.description,
      timestamp: activity.created_at
    })));
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

// Add activity
app.post('/api/activities', isAuthenticated, async (req, res) => {
  const { activity_type, description } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO activity_log (farmer_id, activity_type, description) VALUES ($1, $2, $3) RETURNING *',
      [req.session.farmerId, activity_type, description]
    );
    res.json({ success: true, activity: result.rows[0] });
  } catch (error) {
    console.error('Error adding activity:', error);
    res.status(500).json({ error: 'Failed to add activity' });
  }
});

// Delete activity
app.delete('/api/activities/:id', isAuthenticated, async (req, res) => {
  const { id } = req.params;
  try {
    await db.query(
      'DELETE FROM activity_log WHERE log_id = $1 AND farmer_id = $2',
      [id, req.session.farmerId]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting activity:', error);
    res.status(500).json({ error: 'Failed to delete activity' });
  }
});

// Get crops
app.get('/api/crops', isAuthenticated, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM crops WHERE farmer_id = $1 ORDER BY created_at DESC',
      [req.session.farmerId]
    );
    // Always return an array, even if empty
    res.json({ crops: result.rows || [] });
  } catch (error) {
    console.error('Error fetching crops:', error);
    res.status(500).json({ crops: [], error: 'Failed to fetch crops' });
  }
});

// Add crop
app.post('/api/crops', isAuthenticated, async (req, res) => {
  const { crop_name, crop_type, sowing_date, location } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO crops (farmer_id, crop_name, crop_type, sowing_date, location) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.session.farmerId, crop_name, crop_type, sowing_date, location]
    );
    
    // Log activity
    await db.query(
      'INSERT INTO activity_log (farmer_id, activity_type, description) VALUES ($1, $2, $3)',
      [req.session.farmerId, 'crop_added', `New crop added: ${crop_name}`]
    );
    
    res.json({ success: true, crop: result.rows[0] });
  } catch (error) {
    console.error('Error adding crop:', error);
    res.status(500).json({ error: 'Failed to add crop' });
  }
});

// Seed dummy activities
app.post('/api/seed-activities', isAuthenticated, async (req, res) => {
  try {
    const dummyActivities = [
      { type: 'irrigation', description: 'Watered tomato field - 2 hours' },
      { type: 'crop_added', description: 'Added new wheat crop - 5 acres' },
      { type: 'soil', description: 'Soil pH tested - Results: 6.8 (Good)' },
      { type: 'task_completed', description: 'Fertilizer application completed' },
      { type: 'weather', description: 'Weather alert: Rain expected tomorrow' }
    ];
    
    for (const activity of dummyActivities) {
      await db.query(
        'INSERT INTO activity_log (farmer_id, activity_type, description) VALUES ($1, $2, $3)',
        [req.session.farmerId, activity.type, activity.description]
      );
    }
    
    res.json({ success: true, message: 'Sample activities added' });
  } catch (error) {
    console.error('Error seeding activities:', error);
    res.status(500).json({ error: 'Failed to seed activities' });
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
