# 🎯 Train Real Soil Classification Model

## Step-by-Step Guide to Train Your Own Model

### Step 1: Install Kaggle CLI
```bash
pip3 install kaggle
```

### Step 2: Setup Kaggle API Credentials

1. **Go to Kaggle Account Settings:**
   - Visit: https://www.kaggle.com/settings
   - Scroll to "API" section
   - Click "Create New API Token"
   - This downloads `kaggle.json`

2. **Setup credentials:**
   ```bash
   mkdir -p ~/.kaggle
   mv ~/Downloads/kaggle.json ~/.kaggle/
   chmod 600 ~/.kaggle/kaggle.json
   ```

### Step 3: Download the Dataset

**Option A: Using the download script (Recommended)**
```bash
cd /Users/jiya/Documents/wb\ t/mn
source venv/bin/activate
python3 download_dataset.py
```

**Option B: Manual download**
```bash
kaggle datasets download -d prasanshasatpathy/soil-types -p /Users/jiya/Documents/wb\ t/mn
unzip soil-types.zip
```

### Step 4: Train the Model
```bash
cd /Users/jiya/Documents/wb\ t/mn
source venv/bin/activate
python3 train_soil_model.py
```

**Training will take 15-30 minutes** depending on your hardware.

### Step 5: Restart Flask API

After training completes, restart the Flask API:
```bash
# Stop current API (Ctrl+C or)
lsof -ti:5001 | xargs kill -9

# Start with new model
source venv/bin/activate
python3 soil_analysis_api.py
```

You should see:
```
✅ Real ML model loaded successfully!
```

### Step 6: Test with Real Predictions

1. **Enable real API in frontend:**
   Edit `script.js` line 211:
   ```javascript
   const useMockAPI = false; // Change from true to false
   ```

2. **Test it:**
   - Go to: http://localhost:3000/index.html
   - Upload a soil image
   - Get real AI predictions!

## Dataset Information

**Source:** https://www.kaggle.com/datasets/prasanshasatpathy/soil-types/data

**Soil Types:**
1. Alluvial soil
2. Black Soil
3. Clay soil
4. Red soil

**Expected Accuracy:** 85-95% after training

## Troubleshooting

### Issue: "Kaggle API credentials not found"
**Solution:** Follow Step 2 above carefully

### Issue: "Dataset not found"
**Solution:** Make sure the dataset extracted to `/Users/jiya/Documents/wb t/mn/Dataset/`

### Issue: Training is slow
**Solution:** 
- Reduce epochs in `train_soil_model.py` (line 130)
- Reduce image size to (100, 100) instead of (150, 150)
- Use fewer training images

### Issue: Low accuracy
**Solution:**
- Train for more epochs
- Add more data augmentation
- Try different learning rates

## Model Architecture

The trained model uses:
- 4 Convolutional blocks with BatchNormalization
- MaxPooling for downsampling
- Dropout for regularization
- Dense layers for classification
- Softmax activation for 4 classes

## Files Created

- `soil_model.h5` - Trained model (will be created after training)
- `train_soil_model.py` - Training script
- `download_dataset.py` - Dataset downloader
- `soil_analysis_api.py` - Flask API (already configured)

## Quick Commands Reference

```bash
# Download dataset
python3 download_dataset.py

# Train model
python3 train_soil_model.py

# Start API with trained model
python3 soil_analysis_api.py

# Test in browser
open http://localhost:3000/index.html
```

## Expected Output After Training

```
✅ Model saved to: soil_model.h5
📈 Final Training Accuracy: 92.45%
📈 Final Validation Accuracy: 89.32%
✨ Training complete! You can now use the model in the Flask API.
```

Good luck with training! 🚀🌾
