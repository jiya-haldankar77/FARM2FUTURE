# 🌱 Soil Analysis Feature - Farm2Future

## Overview
The Soil Analysis feature allows farmers to upload soil images and get instant AI-powered recommendations for suitable crops and fertilizers.

## Features
- ✅ AI-based soil type detection (Alluvial, Black, Clay, Red)
- ✅ Crop recommendations based on soil type
- ✅ Fertilizer suggestions
- ✅ Confidence score for predictions
- ✅ Beautiful, responsive UI
- ✅ Mock mode for testing without ML model

## How to Use

### Option 1: Mock Mode (No ML Model Required)
The feature is currently set to **mock mode** which works immediately without any ML model setup.

1. Navigate to: `http://localhost:3000/index.html`
2. Click on the upload area or drag & drop a soil image
3. Click "Analyze Soil" button
4. Get instant results with crop and fertilizer recommendations

### Option 2: Real AI Model (Requires Setup)

#### Prerequisites
```bash
pip install flask flask-cors tensorflow pillow numpy
```

#### Steps:

1. **Prepare Your Model**
   - Place your trained TensorFlow model file as `soil_model.h5` in the project directory
   - Or update the model loading code in `soil_analysis_api.py`

2. **Update the Model Loading**
   Edit `soil_analysis_api.py` line 13:
   ```python
   # Replace MockModel with:
   model = tf.keras.models.load_model('soil_model.h5')
   ```

3. **Start the Flask API**
   ```bash
   python soil_analysis_api.py
   ```
   The API will run on `http://localhost:5000`

4. **Enable Real API in Frontend**
   Edit `script.js` line 211:
   ```javascript
   const useMockAPI = false; // Change to false
   ```

5. **Test the Feature**
   - Upload a soil image
   - The image will be sent to the Flask API
   - Real AI predictions will be returned

## Soil Types Supported
1. **Alluvial Soil** - Rice, SugarCane, Maize, Cotton, Soyabean, Jute
2. **Black Soil** - Wheat, Virginia, Jowar, Millets, Linseed, Castor, Sunflower
3. **Clay Soil** - Rice, Lettuce, Chard, Broccoli, Cabbage, Snap Beans
4. **Red Soil** - Cotton, Pulses, Millets, OilSeeds, Potatoes

## API Endpoints

### POST `/api/analyze-soil`
Upload soil image for analysis

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: image file

**Response:**
```json
{
  "success": true,
  "soil_type": "Black Soil",
  "confidence": 87.5,
  "crops": ["Wheat", "Virginia", "Jowar"],
  "description": "High clay content, excellent moisture retention",
  "fertilizers": ["Urea", "DAP", "Compost"]
}
```

### GET `/health`
Check API health status

## Training Your Own Model

If you want to train your own soil classification model:

1. **Dataset Structure:**
```
Dataset/
├── Train/
│   ├── Alluvial soil/
│   ├── Black Soil/
│   ├── Clay soil/
│   └── Red soil/
└── Test/
    ├── Alluvial soil/
    ├── Black Soil/
    ├── Clay soil/
    └── Red soil/
```

2. **Model Training Code:**
```python
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout
from tensorflow.keras.preprocessing.image import ImageDataGenerator

# Data augmentation
train_datagen = ImageDataGenerator(
    rescale=1./255,
    rotation_range=20,
    width_shift_range=0.2,
    height_shift_range=0.2,
    horizontal_flip=True
)

# Load training data
train_generator = train_datagen.flow_from_directory(
    'Dataset/Train',
    target_size=(150, 150),
    batch_size=32,
    class_mode='categorical'
)

# Build model
model = Sequential([
    Conv2D(32, (3, 3), activation='relu', input_shape=(150, 150, 3)),
    MaxPooling2D(2, 2),
    Conv2D(64, (3, 3), activation='relu'),
    MaxPooling2D(2, 2),
    Conv2D(128, (3, 3), activation='relu'),
    MaxPooling2D(2, 2),
    Flatten(),
    Dense(512, activation='relu'),
    Dropout(0.5),
    Dense(4, activation='softmax')
])

model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
model.fit(train_generator, epochs=20)
model.save('soil_model.h5')
```

## Troubleshooting

### Issue: CORS Error
**Solution:** Make sure Flask-CORS is installed and the API is running

### Issue: Model Not Loading
**Solution:** Check the model file path and ensure TensorFlow is installed

### Issue: Low Accuracy
**Solution:** 
- Use more training data
- Increase training epochs
- Add data augmentation
- Try different model architectures

## Files Created
- `index.html` - Updated with AI analysis UI
- `script.js` - Updated with analysis logic
- `style.css` - Updated with styling
- `soil_analysis_api.py` - Flask API for ML predictions

## Next Steps
1. Collect more soil images for training
2. Train a robust CNN model
3. Deploy the Flask API to a cloud server
4. Add more soil types
5. Include pH level detection
6. Add moisture content analysis
