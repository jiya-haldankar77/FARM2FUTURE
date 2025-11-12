# 🧪 ML Model Integration Guide

## Current Setup
Your Farm2Future app now supports your soil classifier that identifies:
- **black** soil
- **cider** soil  
- **yellow** soil
- **laterite** soil
- **peat** soil

## API Response Format
Your `soil_analysis_api.py` should return this exact format:

```json
{
  "success": true,
  "soil_type": "black",  // One of: black, cider, yellow, laterite, peat
  "ph": 7.2,
  "nutrients": {
    "nitrogen": "Medium",
    "phosphorus": "High", 
    "potassium": "Low"
  },
  "moisture": 85,
  "recommendations": [
    "Black soil is excellent for cotton and sugarcane cultivation",
    "Rich in calcium carbonate, iron, magnesium and potash"
  ],
  "suitableCrops": ["Cotton", "Sugarcane", "Wheat"],
  "fertilizers": [
    "Organic Compost - Enhance soil structure",
    "Phosphorus fertilizer - Black soil is often deficient"
  ],
  "confidence": 0.92
}
```

## Integration Steps

### 1. Update server.js
Replace the mock endpoint in `server.js` (lines 396-548) with:

```javascript
app.post('/api/analyze-soil', async (req, res) => {
  try {
    console.log('Soil analysis request received');
    
    // Forward request to your Python ML API
    const formData = new FormData();
    if (req.files && req.files.image) {
      formData.append('image', req.files.image.data, req.files.image.name);
    }
    
    const response = await fetch('http://localhost:5001/analyze-soil', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    
    // Log the analysis for the user if authenticated
    if (req.session && req.session.farmerId && result.success) {
      await db.query(
        'INSERT INTO activity_log (farmer_id, activity_type, description) VALUES ($1, $2, $3)',
        [req.session.farmerId, 'soil', `Soil analysis completed - Type: ${result.soil_type}, pH: ${result.ph}`]
      );
    }
    
    res.json(result);
  } catch (error) {
    console.error('Soil analysis error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to analyze soil',
      message: 'Soil analysis service is temporarily unavailable'
    });
  }
});
```

### 2. Install Required Packages
```bash
npm install multer  # For file upload handling
```

### 3. Add File Upload Middleware
Add this to your server.js imports:
```javascript
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
```

Then update the route:
```javascript
app.post('/api/analyze-soil', upload.single('image'), async (req, res) => {
  // ... your integration code
});
```

### 4. Start Your Python API
Make sure your `soil_analysis_api.py` is running on `http://localhost:5001`

### 5. Test Integration
Use the test page: `https://farm2future.onrender.com/test-final.html`

## Current Mock Data
The app currently returns realistic mock data for all 5 soil types with:
- ✅ Proper soil-specific pH values
- ✅ Realistic moisture levels  
- ✅ Accurate crop recommendations
- ✅ Appropriate fertilizer suggestions
- ✅ Confidence scores

## Frontend Compatibility
The frontend expects either:
- `result.soil_type` (underscore format)
- `result.soilType` (camelCase format)

Both formats are supported for maximum compatibility.
