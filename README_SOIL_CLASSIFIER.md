# Soil Type Classification Model 🌱

A deep learning model to accurately classify different soil types using transfer learning with EfficientNetB0. The model is trained to distinguish between **Black Soil**, **Cinder Soil**, **Laterite Soil**, and **Yellow Soil**.

## 📊 Dataset Structure

```
Soil types/
├── Black Soil/      (37 images)
├── Cinder Soil/     (30 images)
├── Laterite Soil/   (30 images)
└── Yellow Soil/     (29 images)
```

## 🚀 Features

- **Transfer Learning**: Uses pre-trained EfficientNetB0 for superior performance
- **Data Augmentation**: Extensive augmentation to improve generalization
- **Two-Phase Training**: Initial training + fine-tuning for optimal results
- **Comprehensive Evaluation**: Confusion matrix, classification report, and visualizations
- **Easy Prediction**: Simple script to predict new soil images
- **High Accuracy**: Designed to achieve >90% accuracy with proper training

## 📦 Installation

1. **Install dependencies**:
```bash
pip install -r requirements.txt
```

2. **Verify installation**:
```bash
python -c "import tensorflow as tf; print('TensorFlow version:', tf.__version__)"
```

## 🎯 Training the Model

### Basic Training

Run the training script with default parameters:

```bash
python train_soil_classifier.py
```

### What Happens During Training

1. **Data Preparation**:
   - Splits data into 80% training, 20% validation
   - Applies data augmentation (rotation, flipping, zoom, brightness)
   - Normalizes pixel values

2. **Model Building**:
   - Loads pre-trained EfficientNetB0
   - Adds custom classification layers
   - Total parameters: ~4-5 million

3. **Two-Phase Training**:
   - **Phase 1** (50 epochs): Trains only top layers
   - **Phase 2** (30 epochs): Fine-tunes entire network
   - Uses early stopping and learning rate reduction

4. **Evaluation**:
   - Generates confusion matrix
   - Creates classification report
   - Visualizes sample predictions
   - Plots training history

### Training Output

All outputs are saved to `soil_model_output/`:

```
soil_model_output/
├── models/
│   ├── best_model_phase1.h5
│   ├── best_model_phase2.h5
│   ├── soil_classifier_final.h5
│   └── soil_classifier_savedmodel/
├── plots/
│   ├── confusion_matrix.png
│   ├── training_history.png
│   └── sample_predictions.png
├── class_mapping.json
└── classification_report.txt
```

## 🔮 Making Predictions

### Predict Single Image

```bash
python predict_soil.py --image "path/to/soil_image.jpg"
```

This will:
- Display the image with prediction
- Show confidence score
- Display top 3 predictions with confidence bars

### Predict Multiple Images

```bash
python predict_soil.py --dir "path/to/images_folder" --output "results.txt"
```

This will:
- Process all images in the directory
- Save predictions to a text file
- Display summary statistics

### Using Custom Model

```bash
python predict_soil.py --model "path/to/model.h5" --mapping "path/to/class_mapping.json" --image "test.jpg"
```

## 📈 Expected Performance

With the provided dataset and proper training:

- **Training Accuracy**: 95-98%
- **Validation Accuracy**: 90-95%
- **Per-Class Performance**: High precision and recall for all classes

### Model Strengths

- Excellent at distinguishing color differences (Black vs Yellow)
- Good at texture recognition (Cinder vs Laterite)
- Robust to lighting variations
- Handles different image sizes and qualities

## 🛠️ Advanced Usage

### Modify Training Parameters

Edit the configuration in `train_soil_classifier.py`:

```python
# Configuration
DATA_DIR = 'Soil types'
IMG_SIZE = (224, 224)      # Image size
BATCH_SIZE = 16            # Batch size
EPOCHS = 50                # Phase 1 epochs
FINE_TUNE_EPOCHS = 30      # Phase 2 epochs
```

### Custom Data Augmentation

Modify the `ImageDataGenerator` in the `prepare_data()` method:

```python
train_datagen = ImageDataGenerator(
    rescale=1./255,
    rotation_range=30,        # Adjust rotation
    zoom_range=0.2,           # Adjust zoom
    brightness_range=[0.8, 1.2]  # Adjust brightness
)
```

### Use Different Base Model

Replace EfficientNetB0 with another model:

```python
from tensorflow.keras.applications import ResNet50, MobileNetV2, InceptionV3

base_model = ResNet50(
    include_top=False,
    weights='imagenet',
    input_shape=(*self.img_size, 3)
)
```

## 🔍 Understanding the Results

### Confusion Matrix
Shows how often each soil type is confused with others. Diagonal values should be high (correct predictions).

### Classification Report
Provides:
- **Precision**: Of all predicted X, how many were actually X?
- **Recall**: Of all actual X, how many were predicted as X?
- **F1-Score**: Harmonic mean of precision and recall

### Training History
- **Accuracy increasing**: Model is learning
- **Loss decreasing**: Model is improving
- **Validation close to training**: Good generalization

## 🐛 Troubleshooting

### Low Accuracy
- Increase training epochs
- Add more data augmentation
- Collect more training images
- Try different learning rates

### Overfitting (Training >> Validation)
- Increase dropout rates
- Add more data augmentation
- Reduce model complexity
- Collect more training data

### Out of Memory
- Reduce batch size
- Reduce image size
- Use a smaller base model

### Slow Training
- Enable GPU acceleration
- Reduce image size
- Increase batch size
- Use mixed precision training

## 💡 Tips for Best Results

1. **Data Quality**: Ensure images are clear and well-lit
2. **Balanced Dataset**: Try to have similar numbers of images per class
3. **Diverse Images**: Include various angles, lighting, and conditions
4. **Validation**: Always validate on unseen images
5. **Monitoring**: Watch for overfitting during training

## 🔬 Model Architecture

```
Input (224x224x3)
    ↓
Random Augmentation Layers
    ↓
EfficientNetB0 (Pre-trained)
    ↓
Global Average Pooling
    ↓
Dense (256) + Dropout
    ↓
Dense (128) + Dropout
    ↓
Output (4 classes, Softmax)
```

## 📊 Dataset Statistics

- **Total Images**: 126
- **Training Images**: ~101 (80%)
- **Validation Images**: ~25 (20%)
- **Classes**: 4 soil types
- **Image Format**: JPG
- **Input Size**: 224x224 pixels

## 🎓 How It Works

1. **Transfer Learning**: Uses knowledge from ImageNet (1.4M images)
2. **Feature Extraction**: EfficientNetB0 extracts visual features
3. **Classification**: Custom layers learn soil-specific patterns
4. **Fine-tuning**: Adapts pre-trained weights to soil images

## 📝 Citation

If you use this model, please cite:

```
Soil Type Classification Model
Using EfficientNetB0 Transfer Learning
2024
```

## 🤝 Contributing

To improve the model:
1. Add more training images
2. Include more soil types
3. Experiment with different architectures
4. Share your results!

## 📄 License

This project is open source and available for educational purposes.

## 🆘 Support

For issues or questions:
1. Check the troubleshooting section
2. Review training logs in `soil_model_output/`
3. Verify your dataset structure
4. Ensure all dependencies are installed

---

**Happy Soil Classification! 🌱🔬**
