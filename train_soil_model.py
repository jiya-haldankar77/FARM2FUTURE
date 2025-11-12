"""
Train a CNN model for soil classification
Using Kaggle dataset: https://www.kaggle.com/datasets/prasanshasatpathy/soil-types/data
Dataset structure:
  Dataset/
    Train/
      Alluvial soil/
      Black Soil/
      Clay soil/
      Red soil/
"""

import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout, BatchNormalization
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau
import os

# Dataset path - Using the downloaded Soil types dataset
DATASET_PATH = '/Users/jiya/Documents/wb t/mn/Soil types'

# Check if dataset exists
if not os.path.exists(DATASET_PATH):
    print(f"❌ Dataset not found at: {DATASET_PATH}")
    print("Please update DATASET_PATH in this script to point to your dataset folder")
    exit(1)

print(f"✅ Dataset found at: {DATASET_PATH}")

# Check available soil types
soil_types = [d for d in os.listdir(DATASET_PATH) if os.path.isdir(os.path.join(DATASET_PATH, d)) and not d.startswith('.')]
print(f"📋 Available soil types: {soil_types}")
num_classes = len(soil_types)
print(f"🎯 Number of classes: {num_classes}")

# Data augmentation for training
train_datagen = ImageDataGenerator(
    rescale=1./255,
    rotation_range=20,
    width_shift_range=0.2,
    height_shift_range=0.2,
    shear_range=0.2,
    zoom_range=0.2,
    horizontal_flip=True,
    validation_split=0.2  # Use 20% for validation
)

# Load training data (directly from Dataset folder, no Train subfolder)
print("\n📂 Loading training data...")
train_generator = train_datagen.flow_from_directory(
    DATASET_PATH,
    target_size=(150, 150),
    batch_size=32,
    class_mode='categorical',
    subset='training'
)

# Load validation data
print("📂 Loading validation data...")
validation_generator = train_datagen.flow_from_directory(
    DATASET_PATH,
    target_size=(150, 150),
    batch_size=32,
    class_mode='categorical',
    subset='validation'
)

print(f"\n✅ Found {train_generator.samples} training images")
print(f"✅ Found {validation_generator.samples} validation images")
print(f"📋 Classes: {list(train_generator.class_indices.keys())}")

# Build improved CNN model
print("\n🏗️ Building improved CNN model...")
model = Sequential([
    # First convolutional block
    Conv2D(32, (3, 3), activation='relu', input_shape=(150, 150, 3)),
    BatchNormalization(),
    MaxPooling2D(2, 2),
    
    # Second convolutional block
    Conv2D(64, (3, 3), activation='relu'),
    BatchNormalization(),
    MaxPooling2D(2, 2),
    
    # Third convolutional block
    Conv2D(128, (3, 3), activation='relu'),
    BatchNormalization(),
    MaxPooling2D(2, 2),
    
    # Fourth convolutional block
    Conv2D(256, (3, 3), activation='relu'),
    BatchNormalization(),
    MaxPooling2D(2, 2),
    
    # Flatten and dense layers
    Flatten(),
    Dense(512, activation='relu'),
    BatchNormalization(),
    Dropout(0.5),
    Dense(256, activation='relu'),
    Dropout(0.3),
    Dense(num_classes, activation='softmax')  # Dynamic number of classes
])

# Compile model
model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

print("\n📊 Model Summary:")
model.summary()

# Callbacks for better training
early_stopping = EarlyStopping(
    monitor='val_loss',
    patience=5,
    restore_best_weights=True,
    verbose=1
)

reduce_lr = ReduceLROnPlateau(
    monitor='val_loss',
    factor=0.5,
    patience=3,
    min_lr=0.00001,
    verbose=1
)

# Train model
print("\n🚀 Starting training...")
print("This may take 15-30 minutes depending on your hardware...")
history = model.fit(
    train_generator,
    epochs=30,
    validation_data=validation_generator,
    callbacks=[early_stopping, reduce_lr],
    verbose=1
)

# Save model
model_path = 'soil_model.h5'
model.save(model_path)
print(f"\n✅ Model saved to: {model_path}")

# Print final accuracy
final_train_acc = history.history['accuracy'][-1]
final_val_acc = history.history['val_accuracy'][-1]
print(f"\n📈 Final Training Accuracy: {final_train_acc*100:.2f}%")
print(f"📈 Final Validation Accuracy: {final_val_acc*100:.2f}%")

print("\n✨ Training complete! You can now use the model in the Flask API.")
print("Restart the Flask API to load the new model.")
