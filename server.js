const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcrypt');
const PDFDocument = require('pdfkit');
const fs = require('fs');

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
  secret: 'farm2future-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Admin Routes (MUST be before static middleware)
app.get('/admin.html', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/api/admin/reviews', (req, res) => {
  govDb.query('SELECT * FROM reviews ORDER BY created_at DESC', (err, results) => {
    if (err) {
      console.error('Error fetching reviews:', err);
      return res.status(500).json([]);
    }
    res.json(results);
  });
});

app.get('/api/admin/orders', (req, res) => {
  const query = `
    SELECT 
      c.cart_id as id,
      c.user_id,
      u.username as farmer_name,
      COALESCE(p.product_name, 'Product Not Specified') as product_name,
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
    ORDER BY c.order_date DESC
  `;
  
  storeDb.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching orders:', err);
      return res.status(500).json([]);
    }
    res.json(results);
  });
});

app.get('/api/admin/users', (req, res) => {
  const query = `
    SELECT 
      user_id as id,
      username,
      email,
      phone,
      address
    FROM users
    ORDER BY user_id DESC
  `;
  
  storeDb.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).json([]);
    }
    res.json(results);
  });
});

app.get('/api/admin/gov-submissions', (req, res) => {
  govDb.query('SELECT * FROM user_inputs ORDER BY created_at DESC', (err, results) => {
    if (err) {
      console.error('Error fetching gov submissions:', err);
      return res.status(500).json([]);
    }
    res.json(results);
  });
});

// Delete endpoints
app.delete('/api/admin/reviews/:id', (req, res) => {
  const { id } = req.params;
  govDb.query('DELETE FROM reviews WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error('Error deleting review:', err);
      return res.status(500).json({ error: 'Failed to delete' });
    }
    res.json({ success: true });
  });
});

app.delete('/api/admin/orders/:id', (req, res) => {
  const { id } = req.params;
  storeDb.query('DELETE FROM cart WHERE cart_id = ?', [id], (err, result) => {
    if (err) {
      console.error('Error deleting order:', err);
      return res.status(500).json({ error: 'Failed to delete' });
    }
    res.json({ success: true });
  });
});

app.delete('/api/admin/users/:id', (req, res) => {
  const { id } = req.params;
  storeDb.query('DELETE FROM users WHERE user_id = ?', [id], (err, result) => {
    if (err) {
      console.error('Error deleting user:', err);
      return res.status(500).json({ error: 'Failed to delete' });
    }
    res.json({ success: true });
  });
});

app.delete('/api/admin/gov/:id', (req, res) => {
  const { id } = req.params;
  govDb.query('DELETE FROM user_inputs WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error('Error deleting gov submission:', err);
      return res.status(500).json({ error: 'Failed to delete' });
    }
    res.json({ success: true });
  });
});

// Review & Support Route (MUST be before static middleware)
app.get('/rev.php', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.sendFile(path.join(__dirname, 'rev-page.html'));
});

app.post('/api/submit-review', (req, res) => {
  // Handle review submission
  const { name, email, date, review } = req.body;
  
  if (!name || !email || !date || !review) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }
  
  // Store review in database
  const query = 'INSERT INTO reviews (name, email, review_date, review) VALUES (?, ?, ?, ?)';
  
  govDb.query(query, [name, email, date, review], (err, result) => {
    if (err) {
      console.error('Error storing review:', err);
      return res.status(500).json({ success: false, message: 'Failed to store review' });
    }
    
    console.log('Review submitted successfully:', { id: result.insertId, name, email, date });
    res.json({ success: true, message: 'Review submitted successfully', reviewId: result.insertId });
  });
});

// Government Schemes Route (MUST be before static middleware)
app.get('/gov.php', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.sendFile(path.join(__dirname, 'gov-schemes.html'));
});

app.post('/gov.php', (req, res) => {
  const { name, email, state, district, land_size, crop_type, irrigation, farmer_type, goal } = req.body;
  
  // Government Schemes Database
  const schemesDatabase = [
    {
      title: 'PM-Kisan Samman Nidhi',
      description: 'Direct income support of ₹6,000/year to small and marginal farmers in three equal installments.',
      link: 'https://pmkisan.gov.in/',
      tags: ['Loan', 'Subsidy', 'General', 'SC/ST', 'Women', 'Marginal/Small'],
      icon: '💰',
      details: 'PM-KISAN provides financial assistance of ₹6,000 per year to all landholding farmer families across the country, payable in three equal installments of ₹2,000 each every four months.',
      documents: ['Aadhaar Card', 'Land Ownership Documents', 'Bank Account Details', 'Passport Size Photo'],
      benefits: ['₹6,000 annual income support', 'Direct bank transfer', 'No intermediaries', 'Quick processing', 'Covers all landholding farmers'],
      howToApply: 'Visit the official PM-KISAN portal (pmkisan.gov.in), click on "Farmers Corner", select "New Farmer Registration", fill in required details including Aadhaar number, bank account, and land records. Alternatively, visit your nearest Common Service Center (CSC) or contact your village Patwari/Lekhpal for assistance.'
    },
    {
      title: 'Pradhan Mantri Fasal Bima Yojana',
      description: 'Comprehensive crop insurance scheme protecting farmers against crop failure due to natural calamities.',
      link: 'https://pmfby.gov.in/',
      tags: ['Insurance', 'General', 'SC/ST', 'Women', 'Marginal/Small'],
      icon: '🛡️',
      details: 'PMFBY provides comprehensive insurance coverage against crop loss due to non-preventable natural risks from pre-sowing to post-harvest. Farmers pay only 2% premium for Kharif crops, 1.5% for Rabi crops, and 5% for horticultural crops.',
      documents: ['Aadhaar Card', 'Land Records/Tenancy Agreement', 'Bank Account Details', 'Sowing Certificate', 'Crop Details'],
      benefits: ['Low premium rates', 'Coverage for all stages of crop cycle', 'Quick claim settlement', 'Protection against natural calamities', 'Coverage for post-harvest losses'],
      howToApply: 'Apply through your bank if you have a crop loan, or visit the PMFBY portal (pmfby.gov.in), select your state and scheme, fill the application form with crop and land details. You can also apply through Common Service Centers (CSCs), agriculture offices, or insurance company agents.'
    },
    {
      title: 'Kisan Credit Card (KCC)',
      description: 'Provides timely access to credit for agricultural needs at subsidized interest rates up to ₹3 lakh.',
      link: 'https://www.rbi.org.in/',
      tags: ['Loan', 'General', 'SC/ST', 'Women', 'Marginal/Small'],
      icon: '💳',
      details: 'KCC provides farmers with adequate and timely credit for agricultural operations including crop production, post-harvest expenses, and consumption needs. Interest subvention of 2% and additional 3% prompt repayment incentive available.',
      documents: ['Aadhaar Card', 'PAN Card', 'Land Ownership Proof', 'Passport Size Photos', 'Address Proof'],
      benefits: ['Credit limit up to ₹3 lakh without collateral', 'Low interest rates (4% effective)', 'Flexible repayment', 'Insurance coverage', 'ATM-cum-Debit card facility'],
      howToApply: 'Visit your nearest bank branch (commercial banks, RRBs, or cooperative banks), submit the application form along with required documents. Banks will assess your credit requirement based on land holding and cropping pattern. Card will be issued within 2-3 weeks of application.'
    },
    {
      title: 'Pradhan Mantri Krishi Sinchayee Yojana',
      description: 'Subsidy for drip and sprinkler irrigation systems to improve water-use efficiency and expand irrigation.',
      link: 'https://pmksy.gov.in/',
      tags: ['Subsidy', 'Machinery', 'Drip', 'General', 'SC/ST', 'Women'],
      icon: '💧',
      details: 'PMKSY aims to expand cultivable area under irrigation, improve water use efficiency, and promote precision irrigation. Provides subsidy for micro-irrigation systems including drip and sprinkler irrigation.',
      documents: ['Aadhaar Card', 'Land Ownership Documents', 'Bank Account Details', 'Caste Certificate (if applicable)', 'Water Source Proof'],
      benefits: ['Up to 55% subsidy for small/marginal farmers', '45% subsidy for other farmers', 'Additional benefits for SC/ST farmers', 'Water conservation', 'Increased crop yield'],
      howToApply: 'Visit your State Agriculture Department or Horticulture Department office. Submit application with land details and proposed irrigation system. Application can also be submitted online through state agriculture portals. After approval, install the system from empaneled vendors and claim subsidy.'
    },
    {
      title: 'Sub-Mission on Agricultural Mechanization',
      description: 'Financial assistance for purchasing agricultural machinery and equipment with 40-50% subsidy.',
      link: 'https://agricoop.gov.in/',
      tags: ['Machinery', 'Subsidy', 'General', 'SC/ST', 'Women', 'Marginal/Small'],
      icon: '🚜',
      details: 'Promotes farm mechanization to increase agricultural productivity and reduce drudgery. Provides financial assistance for purchase of tractors, power tillers, harvesters, and other farm equipment.',
      documents: ['Aadhaar Card', 'Land Records', 'Bank Account Details', 'Caste Certificate (if applicable)', 'Income Certificate'],
      benefits: ['40-50% subsidy on machinery', 'Priority to SC/ST and women farmers', 'Custom Hiring Centers support', 'Training on equipment operation', 'Reduced labor costs'],
      howToApply: 'Register on your State Agriculture Department portal or visit District Agriculture Office. Submit online application with required documents. After approval, purchase machinery from authorized dealers and submit bills for subsidy claim. Subsidy will be directly transferred to your bank account.'
    },
    {
      title: 'National Mission on Sustainable Agriculture',
      description: 'Promotes sustainable farming practices, soil health management, and organic farming with training support.',
      link: 'https://agricoop.gov.in/en/divisiontype/NMSA',
      tags: ['Training', 'Subsidy', 'General', 'SC/ST', 'Women'],
      icon: '🌱',
      details: 'NMSA focuses on making agriculture more productive, sustainable, and climate resilient. Promotes resource conservation technologies, integrated farming systems, and soil health management.',
      documents: ['Aadhaar Card', 'Land Ownership Proof', 'Bank Account Details', 'Farmer Registration Certificate'],
      benefits: ['Free training on sustainable practices', 'Subsidy for organic inputs', 'Soil health card', 'Technical guidance', 'Market linkages for organic produce'],
      howToApply: 'Contact your District Agriculture Office or Krishi Vigyan Kendra (KVK). Enroll in training programs and farmer field schools. Apply for subsidies through state agriculture portals. Participate in cluster-based organic farming programs for additional benefits.'
    },
    {
      title: 'Soil Health Card Scheme',
      description: 'Free soil testing and customized recommendations to improve crop yield and maintain soil fertility.',
      link: 'https://soilhealth.dac.gov.in/',
      tags: ['Training', 'General', 'SC/ST', 'Women', 'Marginal/Small'],
      icon: '🧪',
      details: 'Provides soil health cards to farmers every 2 years with information on nutrient status and recommendations on appropriate dosage of nutrients for improving soil health and fertility.',
      documents: ['Aadhaar Card', 'Land Records', 'Mobile Number for SMS updates'],
      benefits: ['Free soil testing', 'Customized fertilizer recommendations', 'Improved crop yield', 'Cost savings on fertilizers', 'Better soil health management'],
      howToApply: 'Visit your nearest Soil Testing Laboratory or contact Village Level Worker (VLW). Collect soil samples as per guidelines (available on portal). Submit samples at testing center. Soil Health Card will be issued within 30 days with detailed nutrient analysis and recommendations.'
    },
    {
      title: 'Paramparagat Krishi Vikas Yojana',
      description: 'Promotes organic farming through cluster approach with ₹50,000/hectare financial support over 3 years.',
      link: 'https://pgsindia-ncof.gov.in/pkvy/',
      tags: ['Subsidy', 'Training', 'General', 'SC/ST', 'Women'],
      icon: '🌾',
      details: 'PKVY promotes organic farming through cluster-based approach with financial assistance of ₹50,000 per hectare over 3 years. Focuses on organic inputs, certification, and market development.',
      documents: ['Aadhaar Card', 'Land Records', 'Bank Account Details', 'Cluster Formation Certificate'],
      benefits: ['₹50,000/hectare financial support', 'Organic certification assistance', 'Training on organic practices', 'Market linkages', 'Premium prices for organic produce'],
      howToApply: 'Form or join a cluster of farmers (minimum 50 farmers with 50 hectares). Contact District Agriculture Officer for cluster registration. Submit application through state agriculture portal. Receive training and financial assistance in phases over 3 years.'
    },
    {
      title: 'Rashtriya Krishi Vikas Yojana',
      description: 'State-specific agricultural development projects with funding support to increase farmer income.',
      link: 'https://rkvy.nic.in/',
      tags: ['Subsidy', 'Loan', 'General', 'SC/ST', 'Women', 'Marginal/Small'],
      icon: '📈',
      details: 'RKVY provides states with flexibility to plan and execute agriculture development programs based on local needs. Supports infrastructure development, technology adoption, and value chain strengthening.',
      documents: ['Aadhaar Card', 'Project Proposal', 'Land Documents', 'Bank Account Details'],
      benefits: ['Flexible state-specific schemes', 'Infrastructure development support', 'Technology adoption assistance', 'Value addition support', 'Market infrastructure'],
      howToApply: 'Check with your State Agriculture Department for ongoing RKVY projects. Submit project proposal or application for specific components. Applications are processed at district and state levels. Benefits vary based on project type and state guidelines.'
    },
    {
      title: 'e-NAM (National Agriculture Market)',
      description: 'Online trading platform connecting farmers to buyers nationwide for better price realization.',
      link: 'https://enam.gov.in/web/',
      tags: ['Training', 'General', 'SC/ST', 'Women', 'Marginal/Small'],
      icon: '🌐',
      details: 'e-NAM is a pan-India electronic trading portal integrating existing APMC mandis. Provides transparent price discovery, online payment, and quality assurance for agricultural commodities.',
      documents: ['Aadhaar Card', 'Bank Account Details', 'Mobile Number', 'Produce Quality Certificate'],
      benefits: ['Better price realization', 'Transparent auction process', 'Online payment', 'Access to nationwide buyers', 'Quality-based pricing'],
      howToApply: 'Visit nearest e-NAM integrated mandi. Register with mandi authorities providing Aadhaar and bank details. Bring your produce for quality testing. Participate in online auction. Payment will be credited to your account within 24 hours.'
    },
    {
      title: 'Gramin Bhandaran Yojana',
      description: 'Financial assistance for construction of rural godowns with subsidy for safe storage of agricultural produce.',
      link: 'https://nhb.gov.in/',
      tags: ['Subsidy', 'Loan', 'General', 'SC/ST', 'Women'],
      icon: '🏭️',
      details: 'Provides financial assistance for construction/renovation of rural godowns with capacity of 100 tonnes to 30,000 tonnes. Helps farmers store produce and sell at better prices.',
      documents: ['Aadhaar Card', 'Land Ownership Proof', 'Project Report', 'Bank Account Details', 'NOC from local authorities'],
      benefits: ['Capital subsidy up to 25%', 'Low-interest bank loans', 'Reduced post-harvest losses', 'Better price realization', 'Storage infrastructure'],
      howToApply: 'Prepare detailed project report with cost estimates. Apply through NABARD or designated banks. Submit land documents and NOC. After approval, construct godown as per specifications. Subsidy will be released in phases upon inspection.'
    },
    {
      title: 'National Beekeeping & Honey Mission',
      description: 'Promotes beekeeping with training, equipment subsidy, and market linkages for additional income.',
      link: 'https://nhmb.nhb.gov.in/',
      tags: ['Training', 'Subsidy', 'General', 'SC/ST', 'Women', 'Marginal/Small'],
      icon: '🐝',
      details: 'NBHM promotes scientific beekeeping for increasing agricultural productivity through pollination and providing additional income. Provides training, equipment subsidy, and market support.',
      documents: ['Aadhaar Card', 'Land/Location Details', 'Bank Account Details', 'Training Certificate'],
      benefits: ['40-50% subsidy on beekeeping equipment', 'Free training programs', 'Bee colony supply', 'Market linkages for honey', 'Additional income source'],
      howToApply: 'Contact State Horticulture/Agriculture Department or Khadi and Village Industries Commission (KVIC). Attend beekeeping training program. Submit application for equipment subsidy. Purchase bee boxes and colonies from approved suppliers. Start beekeeping with technical support.'
    }
  ];
  
  // Store user input in database
  const insertQuery = `
    INSERT INTO user_inputs (name, email, state, district, land_size, crop_type, irrigation_method, farmer_type, need_goal) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  govDb.query(insertQuery, [name, email, state, district, land_size, crop_type, irrigation, farmer_type, goal], (err, result) => {
    if (err) {
      console.error('Error storing user input:', err);
      // Continue even if storage fails
    } else {
      console.log('User input stored successfully:', { id: result.insertId, name, email, state, district, farmer_type, goal });
    }
  });
  
  // Filter schemes
  let recommendedSchemes = schemesDatabase.filter(scheme => 
    scheme.tags.includes(goal) || scheme.tags.includes(farmer_type) || scheme.tags.includes(irrigation)
  );
  
  if (recommendedSchemes.length === 0) {
    recommendedSchemes = schemesDatabase.slice(0, 6);
  }
  
  res.json({ schemes: recommendedSchemes });
});

// Static files middleware (MUST be after custom routes)
app.use(express.static(path.join(__dirname)));

// MySQL Database Connection - Farm Dashboard
const db = mysql.createConnection({
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: 'upsc2027',
  database: 'farm_dashboard'
});

db.connect((err) => {
  if (err) {
    console.error('❌ Farm Dashboard database connection failed:', err);
    return;
  }
  console.log('✅ Connected to Farm Dashboard MySQL database');
});

// MySQL Database Connection - Store/Market
const storeDb = mysql.createConnection({
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: 'upsc2027',
  database: 'farm_market'
});

storeDb.connect((err) => {
  if (err) {
    console.error('❌ Farm Market database connection failed:', err);
    return;
  }
  console.log('✅ Connected to Farm Market MySQL database');
});

// MySQL Database Connection - Government Schemes & Reviews
const govDb = mysql.createConnection({
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: 'upsc2027',
  database: 'gov'
});

govDb.connect((err) => {
  if (err) {
    console.error('❌ Gov database connection failed:', err);
    console.log('💡 Please run the gov.sql file to create the database and tables');
    return;
  }
  console.log('✅ Connected to Gov MySQL database');
});

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
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  
  const query = 'SELECT * FROM farmer WHERE email = ?';
  db.query(query, [email], async (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const farmer = results[0];
    
    // For demo: simple password check (in production use bcrypt)
    if (password === farmer.password) {
      req.session.farmerId = farmer.farmer_id;
      req.session.farmerName = farmer.name;
      
      // Log activity
      const activityQuery = 'INSERT INTO activity_log (farmer_id, activity_type, description) VALUES (?, ?, ?)';
      db.query(activityQuery, [farmer.farmer_id, 'login', 'Farmer logged in']);
      
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
  });
});

// Sign Up
app.post('/api/signup', (req, res) => {
  const { name, email, password } = req.body;
  
  // Check if user already exists
  const checkQuery = 'SELECT * FROM farmer WHERE email = ?';
  db.query(checkQuery, [email], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (results.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    // Insert new farmer
    const insertQuery = 'INSERT INTO farmer (name, email, password) VALUES (?, ?, ?)';
    db.query(insertQuery, [name, email, password], (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to create account' });
      }
      
      res.json({ 
        success: true, 
        message: 'Account created successfully! Please login.' 
      });
    });
  });
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

// ============ CROP ROUTES ============

// Farming tips database
const farmingTips = {
  'Wheat': {
    description: 'Wheat is a cereal grain that is a staple food worldwide.',
    soilType: 'Well-drained loamy soil with pH 6.0-7.5',
    climate: 'Cool, moist weather during growth; warm, dry weather during harvest',
    waterRequirement: 'Moderate - 450-650mm during growing season',
    sowingTime: 'October-November (Rabi season)',
    harvestTime: '4-5 months after sowing',
    tips: [
      'Prepare field thoroughly with 2-3 ploughings',
      'Use certified seeds (100-125 kg/hectare)',
      'Apply NPK fertilizers: 120:60:40 kg/hectare',
      'Irrigate 4-6 times during crop period',
      'Control weeds within 30-40 days of sowing',
      'Watch for rust, aphids, and termites',
      'Harvest when grain moisture is 20-25%'
    ]
  },
  'Rice': {
    description: 'Rice is the staple food for more than half of the world\'s population.',
    soilType: 'Clay or clay loam soil with good water retention',
    climate: 'Hot and humid climate with temperatures 20-35°C',
    waterRequirement: 'High - requires standing water (1200-1500mm)',
    sowingTime: 'June-July (Kharif season)',
    harvestTime: '3-4 months after transplanting',
    tips: [
      'Prepare nursery beds 3-4 weeks before transplanting',
      'Transplant 25-30 day old seedlings',
      'Maintain 5-7cm water level in field',
      'Apply fertilizers: 120:60:40 NPK kg/hectare',
      'Control weeds regularly, especially in first 40 days',
      'Watch for stem borers, leaf folders, and blast disease',
      'Drain field 10-15 days before harvest'
    ]
  },
  'Tomato': {
    description: 'Tomato is a popular vegetable crop rich in vitamins and minerals.',
    soilType: 'Well-drained sandy loam to clay loam, pH 6.0-7.0',
    climate: 'Warm season crop, optimal temperature 20-25°C',
    waterRequirement: 'Moderate - regular irrigation needed',
    sowingTime: 'Year-round (varies by region)',
    harvestTime: '60-80 days after transplanting',
    tips: [
      'Raise seedlings in nursery for 4-5 weeks',
      'Transplant at 45x30 cm spacing',
      'Provide support with stakes or cages',
      'Apply organic manure and NPK fertilizers',
      'Water regularly but avoid waterlogging',
      'Prune suckers for better fruit quality',
      'Control early blight, late blight, and fruit borers',
      'Harvest when fruits are firm and fully colored'
    ]
  },
  'Corn': {
    description: 'Corn (Maize) is a versatile cereal crop used for food, feed, and fuel.',
    soilType: 'Well-drained fertile loam soil, pH 5.5-7.0',
    climate: 'Warm weather crop, temperature 21-27°C',
    waterRequirement: 'Moderate to high - 500-800mm during season',
    sowingTime: 'June-July (Kharif) or February-March (Rabi)',
    harvestTime: '80-110 days after sowing',
    tips: [
      'Use quality hybrid seeds (20-25 kg/hectare)',
      'Sow at 60x20 cm spacing',
      'Apply basal dose of fertilizers before sowing',
      'Provide top dressing at knee-high stage',
      'Irrigate at critical stages: tasseling and grain filling',
      'Control fall armyworm and stem borers',
      'Harvest when grain moisture is 20-25%',
      'Dry properly before storage'
    ]
  },
  'Potato': {
    description: 'Potato is an important vegetable crop and staple food in many countries.',
    soilType: 'Well-drained sandy loam to loam soil, pH 5.5-6.5',
    climate: 'Cool weather crop, optimal temperature 15-20°C',
    waterRequirement: 'Moderate - 500-700mm during growing season',
    sowingTime: 'October-November (Plains), March-April (Hills)',
    harvestTime: '90-120 days after planting',
    tips: [
      'Use certified disease-free seed tubers',
      'Cut large tubers ensuring 2-3 eyes per piece',
      'Plant at 60x20 cm spacing, 5-7 cm deep',
      'Earth up (hilling) 2-3 times during growth',
      'Apply NPK fertilizers: 120:80:100 kg/hectare',
      'Irrigate regularly, especially during tuber formation',
      'Control late blight with fungicides',
      'Harvest when plants turn yellow and die back'
    ]
  }
};

// Generate PDF with farming tips
function generateCropPDF(cropName, farmerName, location, sowingDate) {
  return new Promise((resolve, reject) => {
    const tips = farmingTips[cropName] || {
      description: 'General farming crop',
      tips: ['Follow local agricultural guidelines', 'Consult with agricultural experts']
    };
    
    // Create PDF directory if it doesn't exist
    const pdfDir = path.join(__dirname, 'crop-pdfs');
    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir);
    }
    
    const fileName = `${cropName}_${Date.now()}.pdf`;
    const filePath = path.join(pdfDir, fileName);
    
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);
    
    doc.pipe(stream);
    
    // Header
    doc.fontSize(24).fillColor('#2e7d32').text('Farm2Future', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(20).fillColor('#333').text(`${cropName} Farming Guide`, { align: 'center' });
    doc.moveDown(1);
    
    // Farmer details
    doc.fontSize(12).fillColor('#666');
    doc.text(`Farmer: ${farmerName}`, { continued: false });
    if (location) doc.text(`Location: ${location}`);
    if (sowingDate) doc.text(`Sowing Date: ${new Date(sowingDate).toLocaleDateString()}`);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`);
    doc.moveDown(1);
    
    // Separator line
    doc.strokeColor('#2e7d32').lineWidth(2).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(1);
    
    // Description
    if (tips.description) {
      doc.fontSize(14).fillColor('#2e7d32').text('About ' + cropName, { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(11).fillColor('#333').text(tips.description);
      doc.moveDown(1);
    }
    
    // Growing Conditions
    doc.fontSize(14).fillColor('#2e7d32').text('Growing Conditions', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11);
    
    if (tips.soilType) {
      doc.fillColor('#2e7d32').text('Soil Type:', { continued: false });
      doc.fillColor('#333').text(tips.soilType);
      doc.moveDown(0.3);
    }
    if (tips.climate) {
      doc.fillColor('#2e7d32').text('Climate:', { continued: false });
      doc.fillColor('#333').text(tips.climate);
      doc.moveDown(0.3);
    }
    if (tips.waterRequirement) {
      doc.fillColor('#2e7d32').text('Water Requirement:', { continued: false });
      doc.fillColor('#333').text(tips.waterRequirement);
      doc.moveDown(0.3);
    }
    if (tips.sowingTime) {
      doc.fillColor('#2e7d32').text('Sowing Time:', { continued: false });
      doc.fillColor('#333').text(tips.sowingTime);
      doc.moveDown(0.3);
    }
    if (tips.harvestTime) {
      doc.fillColor('#2e7d32').text('Harvest Time:', { continued: false });
      doc.fillColor('#333').text(tips.harvestTime);
      doc.moveDown(0.3);
    }
    doc.moveDown(0.5);
    
    // Farming Tips
    doc.fontSize(14).fillColor('#2e7d32').text('Farming Tips & Best Practices', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11).fillColor('#333');
    
    if (tips.tips && tips.tips.length > 0) {
      tips.tips.forEach((tip, index) => {
        doc.fillColor('#2e7d32').text(`${index + 1}. `, { continued: true }).fillColor('#333').text(tip);
        doc.moveDown(0.3);
      });
    }
    
    // Footer
    doc.moveDown(2);
    doc.fontSize(10).fillColor('#999').text('Generated by Farm2Future Dashboard', { align: 'center' });
    doc.text('For more information, consult local agricultural experts', { align: 'center' });
    
    doc.end();
    
    stream.on('finish', () => {
      resolve(fileName);
    });
    
    stream.on('error', (err) => {
      reject(err);
    });
  });
}

// Add new crop
app.post('/api/crops', isAuthenticated, async (req, res) => {
  const { crop_name, crop_type, sowing_date, location } = req.body;
  const farmerId = req.session.farmerId;
  const farmerName = req.session.farmerName;
  
  const query = 'INSERT INTO crops (farmer_id, crop_name, crop_type, sowing_date, location) VALUES (?, ?, ?, ?, ?)';
  
  db.query(query, [farmerId, crop_name, crop_type, sowing_date, location], async (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to add crop' });
    }
    
    // Generate PDF with farming tips
    let pdfFileName = null;
    try {
      pdfFileName = await generateCropPDF(crop_name, farmerName, location, sowing_date);
    } catch (pdfError) {
      console.error('PDF generation error:', pdfError);
    }
    
    // Log activity
    const activityQuery = 'INSERT INTO activity_log (farmer_id, activity_type, description) VALUES (?, ?, ?)';
    db.query(activityQuery, [farmerId, 'crop_added', `New crop added: ${crop_name}`]);
    
    res.json({ 
      success: true, 
      message: 'Crop added successfully',
      cropId: result.insertId,
      pdfFile: pdfFileName
    });
  });
});

// Download PDF
app.get('/api/download-pdf/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'crop-pdfs', filename);
  
  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).json({ error: 'PDF not found' });
  }
});

// Get all crops
app.get('/api/crops', isAuthenticated, (req, res) => {
  const farmerId = req.session.farmerId;
  
  const query = 'SELECT * FROM crops WHERE farmer_id = ? ORDER BY created_at DESC';
  db.query(query, [farmerId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch crops' });
    }
    res.json(results);
  });
});

// Delete crop
app.delete('/api/crops/:id', isAuthenticated, (req, res) => {
  const cropId = req.params.id;
  const farmerId = req.session.farmerId;
  
  const query = 'DELETE FROM crops WHERE crop_id = ? AND farmer_id = ?';
  
  db.query(query, [cropId, farmerId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete crop' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Crop not found' });
    }
    
    // Log activity
    const activityQuery = 'INSERT INTO activity_log (farmer_id, activity_type, description) VALUES (?, ?, ?)';
    db.query(activityQuery, [farmerId, 'crop_deleted', `Crop deleted from database`]);
    
    res.json({ success: true, message: 'Crop deleted successfully' });
  });
});

// ============ TASK ROUTES ============

// Get all tasks
app.get('/api/tasks', isAuthenticated, (req, res) => {
  const farmerId = req.session.farmerId;
  
  const query = 'SELECT * FROM tasks WHERE farmer_id = ? ORDER BY due_date ASC, created_at DESC';
  db.query(query, [farmerId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch tasks' });
    }
    res.json(results);
  });
});

// Add new task
app.post('/api/tasks', isAuthenticated, (req, res) => {
  const { task_name, due_date } = req.body;
  const farmerId = req.session.farmerId;
  
  const query = 'INSERT INTO tasks (farmer_id, task_name, due_date) VALUES (?, ?, ?)';
  
  db.query(query, [farmerId, task_name, due_date], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to add task' });
    }
    
    res.json({ 
      success: true, 
      message: 'Task added successfully',
      taskId: result.insertId
    });
  });
});

// Update task status
app.put('/api/tasks/:id', isAuthenticated, (req, res) => {
  const taskId = req.params.id;
  const { status } = req.body;
  const farmerId = req.session.farmerId;
  
  const query = 'UPDATE tasks SET status = ? WHERE task_id = ? AND farmer_id = ?';
  
  db.query(query, [status, taskId, farmerId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to update task' });
    }
    
    if (status === 'Completed') {
      // Log activity
      const activityQuery = 'INSERT INTO activity_log (farmer_id, activity_type, description) VALUES (?, ?, ?)';
      db.query(activityQuery, [farmerId, 'task_completed', 'Daily tasks completed']);
    }
    
    res.json({ success: true, message: 'Task updated successfully' });
  });
});

// ============ ANALYTICS ROUTES ============

// Get analytics data
app.get('/api/analytics', isAuthenticated, (req, res) => {
  const farmerId = req.session.farmerId;
  
  const query = 'SELECT * FROM analytics WHERE farmer_id = ? ORDER BY created_at DESC LIMIT 10';
  db.query(query, [farmerId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch analytics' });
    }
    
    // If no data, return dummy data
    if (results.length === 0) {
      const dummyData = [
        { soil_moisture_level: '78%', rainfall_status: '30%', temperature: 26.5, created_at: new Date() },
        { soil_moisture_level: '75%', rainfall_status: '25%', temperature: 27.0, created_at: new Date(Date.now() - 86400000) },
        { soil_moisture_level: '80%', rainfall_status: '40%', temperature: 25.5, created_at: new Date(Date.now() - 172800000) }
      ];
      return res.json(dummyData);
    }
    
    res.json(results);
  });
});

// Add analytics data
app.post('/api/analytics', isAuthenticated, (req, res) => {
  const { soil_moisture_level, rainfall_status, irrigation_status, temperature } = req.body;
  const farmerId = req.session.farmerId;
  
  const query = 'INSERT INTO analytics (farmer_id, soil_moisture_level, rainfall_status, irrigation_status, temperature) VALUES (?, ?, ?, ?, ?)';
  
  db.query(query, [farmerId, soil_moisture_level, rainfall_status, irrigation_status, temperature], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to add analytics' });
    }
    
    res.json({ success: true, message: 'Analytics data added' });
  });
});

// ============ ACTIVITY LOG ROUTES ============

// Get recent activities
app.get('/api/activities', isAuthenticated, (req, res) => {
  const farmerId = req.session.farmerId;
  
  const query = 'SELECT * FROM activity_log WHERE farmer_id = ? ORDER BY timestamp DESC LIMIT 10';
  db.query(query, [farmerId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch activities' });
    }
    res.json(results);
  });
});

// Add activity
app.post('/api/activities', isAuthenticated, (req, res) => {
  const { activity_type, description } = req.body;
  const farmerId = req.session.farmerId;
  
  const query = 'INSERT INTO activity_log (farmer_id, activity_type, description) VALUES (?, ?, ?)';
  
  db.query(query, [farmerId, activity_type, description], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to add activity' });
    }
    
    res.json({ success: true, message: 'Activity logged' });
  });
});

// Delete activity
app.delete('/api/activities/:id', isAuthenticated, (req, res) => {
  const activityId = req.params.id;
  const farmerId = req.session.farmerId;
  
  const query = 'DELETE FROM activity_log WHERE activity_id = ? AND farmer_id = ?';
  
  db.query(query, [activityId, farmerId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete activity' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    
    res.json({ success: true, message: 'Activity deleted' });
  });
});

// ============ DUMMY DATA SEEDER ============

// Seed dummy activities (for testing)
app.post('/api/seed-activities', isAuthenticated, (req, res) => {
  const farmerId = req.session.farmerId;
  
  const activities = [
    { type: 'irrigation', desc: 'Irrigation system activated' },
    { type: 'crop_added', desc: 'New crop added: Wheat Field A' },
    { type: 'weather', desc: 'Rain detected in your area' },
    { type: 'soil', desc: 'Soil moisture level is optimal' },
    { type: 'task_completed', desc: 'Daily tasks completed' }
  ];
  
  activities.forEach((activity, index) => {
    const query = 'INSERT INTO activity_log (farmer_id, activity_type, description, timestamp) VALUES (?, ?, ?, ?)';
    const timestamp = new Date(Date.now() - (index * 3600000)); // Each activity 1 hour apart
    db.query(query, [farmerId, activity.type, activity.desc, timestamp]);
  });
  
  res.json({ success: true, message: 'Dummy activities seeded' });
});

// ==================== STORE/MARKET ORDER ENDPOINTS ====================

// Create new order - Save to cart table
app.post('/api/orders', (req, res) => {
  const {
    orderId,
    userEmail,
    customerName,
    customerPhone,
    deliveryAddress,
    deliveryDate,
    subtotal,
    deliveryCharge,
    totalAmount,
    paymentMethod,
    items
  } = req.body;

  // First, check if user exists, if not create user
  const checkUserQuery = 'SELECT user_id FROM users WHERE email = ?';
  
  storeDb.query(checkUserQuery, [userEmail], (err, userResults) => {
    if (err) {
      console.error('Error checking user:', err);
      return res.status(500).json({ error: 'Failed to check user' });
    }

    let userId;
    
    const insertOrders = (userId) => {
      // Insert each item as a separate cart entry with status 'Ordered'
      if (items && items.length > 0) {
        let insertedCount = 0;
        let hasError = false;

        items.forEach((item, index) => {
          const price = parseFloat(item.price.replace(/[^\d.]/g, ''));
          const itemTotal = price * item.quantity;

          // First check if product exists
          const checkProductQuery = 'SELECT product_id FROM products WHERE product_name = ?';
          
          storeDb.query(checkProductQuery, [item.name], (err, productResults) => {
            let productId = null;
            
            if (!err && productResults.length > 0) {
              productId = productResults[0].product_id;
            }

            // Insert into cart table
            const cartQuery = `
              INSERT INTO cart 
              (user_id, product_id, quantity, total_price, status, order_date, 
               delivery_address, payment_mode, payment_status)
              VALUES (?, ?, ?, ?, 'Ordered', NOW(), ?, ?, 'Paid')
            `;

            // Convert payment method to match ENUM values
            const paymentModeValue = paymentMethod.toUpperCase() === 'COD' ? 'Cash on Delivery' : 'UPI';

            storeDb.query(
              cartQuery,
              [userId, productId, item.quantity, itemTotal, deliveryAddress, paymentModeValue],
              (err) => {
                if (err && !hasError) {
                  hasError = true;
                  console.error('Error inserting cart item:', err);
                  return res.status(500).json({ error: 'Failed to save order items' });
                }

                insertedCount++;
                
                if (insertedCount === items.length && !hasError) {
                  res.json({ 
                    success: true, 
                    message: 'Order created successfully',
                    orderId: orderId
                  });
                }
              }
            );
          });
        });
      } else {
        res.json({ 
          success: true, 
          message: 'Order created successfully',
          orderId: orderId
        });
      }
    };

    if (userResults.length > 0) {
      // User exists
      userId = userResults[0].user_id;
      insertOrders(userId);
    } else {
      // Create new user without password
      const insertUserQuery = `
        INSERT INTO users (username, email, phone, address)
        VALUES (?, ?, ?, ?)
      `;
      
      storeDb.query(
        insertUserQuery,
        [customerName, userEmail, customerPhone, deliveryAddress],
        (err, result) => {
          if (err) {
            console.error('Error creating user:', err);
            return res.status(500).json({ error: 'Failed to create user' });
          }
          
          userId = result.insertId;
          insertOrders(userId);
        }
      );
    }
  });
});

// Get all orders from cart table
app.get('/api/orders', (req, res) => {
  const query = `
    SELECT 
      c.cart_id,
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
    ORDER BY c.order_date DESC
  `;
  
  storeDb.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching orders:', err);
      return res.status(500).json({ error: 'Failed to fetch orders' });
    }
    res.json(results);
  });
});

// Get orders by user email
app.get('/api/orders/user/:email', (req, res) => {
  const { email } = req.params;
  
  const query = `
    SELECT 
      c.cart_id,
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
    WHERE u.email = ? AND c.status = 'Ordered'
    ORDER BY c.order_date DESC
  `;
  
  storeDb.query(query, [email], (err, results) => {
    if (err) {
      console.error('Error fetching user orders:', err);
      return res.status(500).json({ error: 'Failed to fetch user orders' });
    }
    res.json(results);
  });
});

// Update cart/order status
app.put('/api/orders/:cartId/status', (req, res) => {
  const { cartId } = req.params;
  const { status, paymentStatus } = req.body;
  
  let query = 'UPDATE cart SET ';
  const updates = [];
  const values = [];
  
  if (status) {
    updates.push('status = ?');
    values.push(status);
  }
  
  if (paymentStatus) {
    updates.push('payment_status = ?');
    values.push(paymentStatus);
  }
  
  query += updates.join(', ') + ' WHERE cart_id = ?';
  values.push(cartId);
  
  storeDb.query(query, values, (err, result) => {
    if (err) {
      console.error('Error updating order:', err);
      return res.status(500).json({ error: 'Failed to update order' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json({ success: true, message: 'Order updated successfully' });
  });
});

// Get sales summary from cart table
app.get('/api/sales/summary', (req, res) => {
  const query = `
    SELECT 
      DATE(order_date) as sale_date,
      COUNT(cart_id) as total_orders,
      SUM(total_price) as total_revenue,
      AVG(total_price) as avg_order_value,
      SUM(CASE WHEN payment_mode = 'UPI' THEN 1 ELSE 0 END) as upi_orders,
      SUM(CASE WHEN payment_mode = 'Cash on Delivery' THEN 1 ELSE 0 END) as cod_orders
    FROM cart
    WHERE status = 'Ordered' AND payment_status = 'Paid'
    GROUP BY DATE(order_date)
    ORDER BY sale_date DESC
    LIMIT 30
  `;
  
  storeDb.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching sales summary:', err);
      return res.status(500).json({ error: 'Failed to fetch sales summary' });
    }
    res.json(results);
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard.html`);
  console.log(`🔐 Login: http://localhost:${PORT}/login.html`);
  console.log(`🌾 Govt Schemes: http://localhost:${PORT}/gov.php`);
});
