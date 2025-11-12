"""
Improved Soil Type Classification Model
Enhanced version with better techniques for small datasets
"""

import os
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
import json
from datetime import datetime

import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau, ModelCheckpoint
from sklearn.metrics import classification_report, confusion_matrix
import warnings
warnings.filterwarnings('ignore')

# Set random seeds for reproducibility
np.random.seed(42)
tf.random.set_seed(42)

class ImprovedSoilClassifier:
    def __init__(self, data_dir, img_size=(224, 224), batch_size=8):
        """
        Initialize the Improved Soil Classifier
        Optimized for small datasets
        """
        self.data_dir = Path(data_dir)
        self.img_size = img_size
        self.batch_size = batch_size
        self.model = None
        self.history = None
        self.class_names = None
        
        # Create output directories
        self.output_dir = Path('soil_model_output_improved')
        self.output_dir.mkdir(exist_ok=True)
        (self.output_dir / 'plots').mkdir(exist_ok=True)
        (self.output_dir / 'models').mkdir(exist_ok=True)
        
        print(f"✓ Initialized Improved Soil Classifier")
        print(f"✓ Data directory: {self.data_dir}")
        print(f"✓ Image size: {self.img_size}")
        print(f"✓ Batch size: {self.batch_size}")
    
    def prepare_data(self, validation_split=0.15):
        """
        Prepare training and validation data with AGGRESSIVE augmentation
        Using smaller validation split for small datasets
        """
        print("\n" + "="*60)
        print("PREPARING DATA WITH AGGRESSIVE AUGMENTATION")
        print("="*60)
        
        # VERY AGGRESSIVE data augmentation for small datasets
        train_datagen = ImageDataGenerator(
            rescale=1./255,
            validation_split=validation_split,
            rotation_range=40,
            width_shift_range=0.3,
            height_shift_range=0.3,
            shear_range=0.3,
            zoom_range=0.3,
            horizontal_flip=True,
            vertical_flip=True,
            brightness_range=[0.7, 1.3],
            channel_shift_range=30,
            fill_mode='nearest'
        )
        
        # Only rescaling for validation
        val_datagen = ImageDataGenerator(
            rescale=1./255,
            validation_split=validation_split
        )
        
        # Training data generator
        self.train_generator = train_datagen.flow_from_directory(
            self.data_dir,
            target_size=self.img_size,
            batch_size=self.batch_size,
            class_mode='categorical',
            subset='training',
            shuffle=True,
            seed=42
        )
        
        # Validation data generator
        self.val_generator = val_datagen.flow_from_directory(
            self.data_dir,
            target_size=self.img_size,
            batch_size=self.batch_size,
            class_mode='categorical',
            subset='validation',
            shuffle=False,
            seed=42
        )
        
        self.class_names = list(self.train_generator.class_indices.keys())
        self.num_classes = len(self.class_names)
        
        print(f"\n✓ Found {self.train_generator.samples} training images")
        print(f"✓ Found {self.val_generator.samples} validation images")
        print(f"✓ Number of classes: {self.num_classes}")
        print(f"✓ Class names: {self.class_names}")
        
        # Calculate class weights for imbalanced data
        class_counts = {}
        for class_name in self.class_names:
            class_dir = self.data_dir / class_name
            class_counts[class_name] = len(list(class_dir.glob('*.jpg'))) + len(list(class_dir.glob('*.jpeg')))
        
        total_samples = sum(class_counts.values())
        self.class_weights = {
            i: total_samples / (self.num_classes * count) 
            for i, (name, count) in enumerate(class_counts.items())
        }
        
        print(f"\n✓ Class weights (for imbalanced data):")
        for i, name in enumerate(self.class_names):
            print(f"   {name}: {self.class_weights[i]:.2f}")
        
        # Save class mapping
        class_mapping = {idx: name for name, idx in self.train_generator.class_indices.items()}
        with open(self.output_dir / 'class_mapping.json', 'w') as f:
            json.dump(class_mapping, f, indent=2)
        
        return self.train_generator, self.val_generator
    
    def build_model(self):
        """
        Build a simpler model using MobileNetV2 (better for small datasets)
        """
        print("\n" + "="*60)
        print("BUILDING IMPROVED MODEL")
        print("="*60)
        
        # Load pre-trained MobileNetV2 (lighter than EfficientNet)
        base_model = MobileNetV2(
            include_top=False,
            weights='imagenet',
            input_shape=(*self.img_size, 3)
        )
        
        # Freeze base model
        base_model.trainable = False
        
        # Build simpler model to prevent overfitting
        inputs = keras.Input(shape=(*self.img_size, 3))
        
        # Pre-trained model
        x = base_model(inputs, training=False)
        
        # Simpler classification head
        x = layers.GlobalAveragePooling2D()(x)
        x = layers.Dropout(0.5)(x)  # Higher dropout
        x = layers.Dense(128, activation='relu', kernel_regularizer=keras.regularizers.l2(0.01))(x)
        x = layers.Dropout(0.4)(x)
        x = layers.Dense(64, activation='relu', kernel_regularizer=keras.regularizers.l2(0.01))(x)
        x = layers.Dropout(0.3)(x)
        outputs = layers.Dense(self.num_classes, activation='softmax')(x)
        
        self.model = keras.Model(inputs, outputs)
        
        # Compile with label smoothing to prevent overconfidence
        self.model.compile(
            optimizer=keras.optimizers.legacy.Adam(learning_rate=0.0005),
            loss=keras.losses.CategoricalCrossentropy(label_smoothing=0.1),
            metrics=['accuracy', keras.metrics.TopKCategoricalAccuracy(k=2, name='top_2_accuracy')]
        )
        
        print(f"\n✓ Model built successfully")
        print(f"✓ Total parameters: {self.model.count_params():,}")
        print(f"✓ Using MobileNetV2 (optimized for small datasets)")
        
        return self.model
    
    def train(self, epochs=100):
        """
        Train with more epochs and better callbacks
        """
        print("\n" + "="*60)
        print("TRAINING IMPROVED MODEL")
        print("="*60)
        
        # Better callbacks
        early_stopping = EarlyStopping(
            monitor='val_accuracy',
            patience=20,
            restore_best_weights=True,
            verbose=1,
            mode='max'
        )
        
        reduce_lr = ReduceLROnPlateau(
            monitor='val_accuracy',
            factor=0.5,
            patience=8,
            min_lr=1e-7,
            verbose=1,
            mode='max'
        )
        
        checkpoint = ModelCheckpoint(
            str(self.output_dir / 'models' / 'best_model.h5'),
            monitor='val_accuracy',
            save_best_only=True,
            verbose=1,
            mode='max'
        )
        
        # Train with class weights
        history = self.model.fit(
            self.train_generator,
            validation_data=self.val_generator,
            epochs=epochs,
            callbacks=[early_stopping, reduce_lr, checkpoint],
            class_weight=self.class_weights,
            verbose=1
        )
        
        self.history = history.history
        
        print("\n✓ Training completed!")
        return self.history
    
    def fine_tune(self, epochs=50):
        """
        Fine-tune the model by unfreezing some layers
        """
        print("\n" + "="*60)
        print("FINE-TUNING MODEL")
        print("="*60)
        
        # Load best model from previous training
        self.model = keras.models.load_model(self.output_dir / 'models' / 'best_model.h5')
        
        # Unfreeze the last 30 layers of base model
        base_model = self.model.layers[1]
        base_model.trainable = True
        
        # Freeze all layers except the last 30
        for layer in base_model.layers[:-30]:
            layer.trainable = False
        
        # Recompile with lower learning rate
        self.model.compile(
            optimizer=keras.optimizers.legacy.Adam(learning_rate=0.00005),
            loss=keras.losses.CategoricalCrossentropy(label_smoothing=0.1),
            metrics=['accuracy', keras.metrics.TopKCategoricalAccuracy(k=2, name='top_2_accuracy')]
        )
        
        early_stopping = EarlyStopping(
            monitor='val_accuracy',
            patience=15,
            restore_best_weights=True,
            verbose=1,
            mode='max'
        )
        
        reduce_lr = ReduceLROnPlateau(
            monitor='val_accuracy',
            factor=0.5,
            patience=6,
            min_lr=1e-8,
            verbose=1,
            mode='max'
        )
        
        checkpoint = ModelCheckpoint(
            str(self.output_dir / 'models' / 'best_model_finetuned.h5'),
            monitor='val_accuracy',
            save_best_only=True,
            verbose=1,
            mode='max'
        )
        
        history = self.model.fit(
            self.train_generator,
            validation_data=self.val_generator,
            epochs=epochs,
            callbacks=[early_stopping, reduce_lr, checkpoint],
            class_weight=self.class_weights,
            verbose=1
        )
        
        # Combine histories
        if self.history:
            for key in history.history.keys():
                self.history[key].extend(history.history[key])
        
        print("\n✓ Fine-tuning completed!")
        return self.history
    
    def evaluate(self):
        """Evaluate the model"""
        print("\n" + "="*60)
        print("EVALUATING MODEL")
        print("="*60)
        
        results = self.model.evaluate(self.val_generator, verbose=1)
        
        print(f"\n✓ Validation Loss: {results[0]:.4f}")
        print(f"✓ Validation Accuracy: {results[1]:.4f}")
        print(f"✓ Top-2 Accuracy: {results[2]:.4f}")
        
        # Get predictions
        self.val_generator.reset()
        predictions = self.model.predict(self.val_generator, verbose=1)
        y_pred = np.argmax(predictions, axis=1)
        y_true = self.val_generator.classes
        
        # Classification report
        print("\n" + "="*60)
        print("CLASSIFICATION REPORT")
        print("="*60)
        report = classification_report(y_true, y_pred, target_names=self.class_names, zero_division=0)
        print(report)
        
        # Save report
        with open(self.output_dir / 'classification_report.txt', 'w') as f:
            f.write(f"Validation Accuracy: {results[1]:.4f}\n")
            f.write(f"Top-2 Accuracy: {results[2]:.4f}\n\n")
            f.write(report)
        
        # Confusion matrix
        cm = confusion_matrix(y_true, y_pred)
        self._plot_confusion_matrix(cm)
        
        return results, report, cm
    
    def _plot_confusion_matrix(self, cm):
        """Plot confusion matrix"""
        plt.figure(figsize=(10, 8))
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
                   xticklabels=self.class_names,
                   yticklabels=self.class_names)
        plt.title('Confusion Matrix - Improved Soil Classifier', fontsize=16, fontweight='bold')
        plt.ylabel('True Label', fontsize=12)
        plt.xlabel('Predicted Label', fontsize=12)
        plt.tight_layout()
        plt.savefig(self.output_dir / 'plots' / 'confusion_matrix.png', dpi=300, bbox_inches='tight')
        plt.close()
        print(f"✓ Saved confusion matrix")
    
    def plot_training_history(self):
        """Plot training history"""
        if self.history is None:
            return
        
        fig, axes = plt.subplots(1, 2, figsize=(15, 5))
        
        axes[0].plot(self.history['accuracy'], label='Training', linewidth=2)
        axes[0].plot(self.history['val_accuracy'], label='Validation', linewidth=2)
        axes[0].set_title('Model Accuracy', fontsize=14, fontweight='bold')
        axes[0].set_xlabel('Epoch')
        axes[0].set_ylabel('Accuracy')
        axes[0].legend()
        axes[0].grid(True, alpha=0.3)
        
        axes[1].plot(self.history['loss'], label='Training', linewidth=2)
        axes[1].plot(self.history['val_loss'], label='Validation', linewidth=2)
        axes[1].set_title('Model Loss', fontsize=14, fontweight='bold')
        axes[1].set_xlabel('Epoch')
        axes[1].set_ylabel('Loss')
        axes[1].legend()
        axes[1].grid(True, alpha=0.3)
        
        plt.tight_layout()
        plt.savefig(self.output_dir / 'plots' / 'training_history.png', dpi=300)
        plt.close()
        print(f"✓ Saved training history")
    
    def save_model(self):
        """Save the final model"""
        model_path = self.output_dir / 'models' / 'soil_classifier_final.h5'
        self.model.save(model_path)
        print(f"✓ Saved final model to {model_path}")


def main():
    print("\n" + "="*60)
    print("IMPROVED SOIL CLASSIFICATION - OPTIMIZED FOR SMALL DATASETS")
    print("="*60)
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Configuration - optimized for small datasets
    DATA_DIR = 'Soil types'
    IMG_SIZE = (224, 224)
    BATCH_SIZE = 8  # Smaller batch size
    INITIAL_EPOCHS = 100
    FINETUNE_EPOCHS = 50
    
    print(f"\nGPU Available: {tf.config.list_physical_devices('GPU')}")
    print(f"TensorFlow Version: {tf.__version__}")
    
    # Initialize
    classifier = ImprovedSoilClassifier(
        data_dir=DATA_DIR,
        img_size=IMG_SIZE,
        batch_size=BATCH_SIZE
    )
    
    # Prepare data
    classifier.prepare_data(validation_split=0.15)
    
    # Build model
    classifier.build_model()
    
    # Train
    classifier.train(epochs=INITIAL_EPOCHS)
    
    # Fine-tune
    classifier.fine_tune(epochs=FINETUNE_EPOCHS)
    
    # Plot history
    classifier.plot_training_history()
    
    # Evaluate
    classifier.evaluate()
    
    # Save
    classifier.save_model()
    
    print("\n" + "="*60)
    print("TRAINING COMPLETED!")
    print("="*60)
    print(f"Finished at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"\nOutputs saved to: {classifier.output_dir}")


if __name__ == "__main__":
    main()
