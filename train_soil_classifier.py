"""
Soil Type Classification Model
Trains a deep learning model to classify different soil types using transfer learning
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
from tensorflow.keras.applications import EfficientNetB0
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau, ModelCheckpoint
from sklearn.metrics import classification_report, confusion_matrix
import warnings
warnings.filterwarnings('ignore')

# Set random seeds for reproducibility
np.random.seed(42)
tf.random.set_seed(42)

class SoilClassifier:
    def __init__(self, data_dir, img_size=(224, 224), batch_size=16):
        """
        Initialize the Soil Classifier
        
        Args:
            data_dir: Path to directory containing soil type folders
            img_size: Target image size (height, width)
            batch_size: Batch size for training
        """
        self.data_dir = Path(data_dir)
        self.img_size = img_size
        self.batch_size = batch_size
        self.model = None
        self.history = None
        self.class_names = None
        
        # Create output directories
        self.output_dir = Path('soil_model_output')
        self.output_dir.mkdir(exist_ok=True)
        (self.output_dir / 'plots').mkdir(exist_ok=True)
        (self.output_dir / 'models').mkdir(exist_ok=True)
        
        print(f"✓ Initialized Soil Classifier")
        print(f"✓ Data directory: {self.data_dir}")
        print(f"✓ Image size: {self.img_size}")
        print(f"✓ Batch size: {self.batch_size}")
    
    def prepare_data(self, validation_split=0.2):
        """
        Prepare training and validation data with augmentation
        
        Args:
            validation_split: Fraction of data to use for validation
        """
        print("\n" + "="*60)
        print("PREPARING DATA")
        print("="*60)
        
        # Data augmentation for training - helps model generalize better
        train_datagen = ImageDataGenerator(
            rescale=1./255,
            validation_split=validation_split,
            rotation_range=30,
            width_shift_range=0.2,
            height_shift_range=0.2,
            shear_range=0.2,
            zoom_range=0.2,
            horizontal_flip=True,
            vertical_flip=True,
            brightness_range=[0.8, 1.2],
            fill_mode='nearest'
        )
        
        # Only rescaling for validation data
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
        
        # Save class mapping
        class_mapping = {idx: name for name, idx in self.train_generator.class_indices.items()}
        with open(self.output_dir / 'class_mapping.json', 'w') as f:
            json.dump(class_mapping, f, indent=2)
        print(f"✓ Saved class mapping to {self.output_dir / 'class_mapping.json'}")
        
        return self.train_generator, self.val_generator
    
    def build_model(self):
        """
        Build a transfer learning model using EfficientNetB0
        """
        print("\n" + "="*60)
        print("BUILDING MODEL")
        print("="*60)
        
        # Load pre-trained EfficientNetB0 without top layers
        base_model = EfficientNetB0(
            include_top=False,
            weights='imagenet',
            input_shape=(*self.img_size, 3)
        )
        
        # Freeze base model initially
        base_model.trainable = False
        
        # Build the model
        inputs = keras.Input(shape=(*self.img_size, 3))
        
        # Data augmentation layers (applied during training only)
        x = layers.RandomFlip("horizontal_and_vertical")(inputs)
        x = layers.RandomRotation(0.2)(x)
        
        # Pre-trained model
        x = base_model(x, training=False)
        
        # Custom classification head
        x = layers.GlobalAveragePooling2D()(x)
        x = layers.BatchNormalization()(x)
        x = layers.Dropout(0.3)(x)
        x = layers.Dense(256, activation='relu')(x)
        x = layers.BatchNormalization()(x)
        x = layers.Dropout(0.3)(x)
        x = layers.Dense(128, activation='relu')(x)
        x = layers.Dropout(0.2)(x)
        outputs = layers.Dense(self.num_classes, activation='softmax')(x)
        
        self.model = keras.Model(inputs, outputs)
        
        # Compile model
        self.model.compile(
            optimizer=keras.optimizers.Adam(learning_rate=0.001),
            loss='categorical_crossentropy',
            metrics=['accuracy', keras.metrics.TopKCategoricalAccuracy(k=2, name='top_2_accuracy')]
        )
        
        print(f"\n✓ Model built successfully")
        print(f"✓ Total parameters: {self.model.count_params():,}")
        print(f"✓ Using transfer learning with EfficientNetB0")
        
        return self.model
    
    def train(self, epochs=50, fine_tune_epochs=30):
        """
        Train the model in two phases:
        1. Train only the top layers
        2. Fine-tune the entire model
        
        Args:
            epochs: Number of epochs for initial training
            fine_tune_epochs: Number of epochs for fine-tuning
        """
        print("\n" + "="*60)
        print("TRAINING MODEL - PHASE 1: INITIAL TRAINING")
        print("="*60)
        
        # Callbacks
        early_stopping = EarlyStopping(
            monitor='val_loss',
            patience=10,
            restore_best_weights=True,
            verbose=1
        )
        
        reduce_lr = ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=5,
            min_lr=1e-7,
            verbose=1
        )
        
        checkpoint = ModelCheckpoint(
            str(self.output_dir / 'models' / 'best_model_phase1.h5'),
            monitor='val_accuracy',
            save_best_only=True,
            verbose=1
        )
        
        # Phase 1: Train only top layers
        history1 = self.model.fit(
            self.train_generator,
            validation_data=self.val_generator,
            epochs=epochs,
            callbacks=[early_stopping, reduce_lr, checkpoint],
            verbose=1
        )
        
        # Phase 2: Fine-tune the entire model
        print("\n" + "="*60)
        print("TRAINING MODEL - PHASE 2: FINE-TUNING")
        print("="*60)
        
        # Unfreeze base model for fine-tuning
        base_model = self.model.layers[3]  # EfficientNetB0 layer
        base_model.trainable = True
        
        # Freeze the first 80% of layers, fine-tune the rest
        fine_tune_at = int(len(base_model.layers) * 0.8)
        for layer in base_model.layers[:fine_tune_at]:
            layer.trainable = False
        
        # Recompile with lower learning rate
        self.model.compile(
            optimizer=keras.optimizers.Adam(learning_rate=0.0001),
            loss='categorical_crossentropy',
            metrics=['accuracy', keras.metrics.TopKCategoricalAccuracy(k=2, name='top_2_accuracy')]
        )
        
        checkpoint2 = ModelCheckpoint(
            str(self.output_dir / 'models' / 'best_model_phase2.h5'),
            monitor='val_accuracy',
            save_best_only=True,
            verbose=1
        )
        
        history2 = self.model.fit(
            self.train_generator,
            validation_data=self.val_generator,
            epochs=fine_tune_epochs,
            callbacks=[early_stopping, reduce_lr, checkpoint2],
            verbose=1
        )
        
        # Combine histories
        self.history = {
            'accuracy': history1.history['accuracy'] + history2.history['accuracy'],
            'val_accuracy': history1.history['val_accuracy'] + history2.history['val_accuracy'],
            'loss': history1.history['loss'] + history2.history['loss'],
            'val_loss': history1.history['val_loss'] + history2.history['val_loss']
        }
        
        print("\n✓ Training completed!")
        return self.history
    
    def evaluate(self):
        """
        Evaluate the model and generate comprehensive metrics
        """
        print("\n" + "="*60)
        print("EVALUATING MODEL")
        print("="*60)
        
        # Evaluate on validation set
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
        report = classification_report(y_true, y_pred, target_names=self.class_names)
        print(report)
        
        # Save report
        with open(self.output_dir / 'classification_report.txt', 'w') as f:
            f.write(report)
        
        # Confusion matrix
        cm = confusion_matrix(y_true, y_pred)
        self._plot_confusion_matrix(cm)
        
        return results, report, cm
    
    def _plot_confusion_matrix(self, cm):
        """Plot and save confusion matrix"""
        plt.figure(figsize=(10, 8))
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
                   xticklabels=self.class_names,
                   yticklabels=self.class_names)
        plt.title('Confusion Matrix - Soil Type Classification', fontsize=16, fontweight='bold')
        plt.ylabel('True Label', fontsize=12)
        plt.xlabel('Predicted Label', fontsize=12)
        plt.tight_layout()
        plt.savefig(self.output_dir / 'plots' / 'confusion_matrix.png', dpi=300, bbox_inches='tight')
        plt.close()
        print(f"✓ Saved confusion matrix to {self.output_dir / 'plots' / 'confusion_matrix.png'}")
    
    def plot_training_history(self):
        """Plot and save training history"""
        if self.history is None:
            print("No training history available")
            return
        
        fig, axes = plt.subplots(1, 2, figsize=(15, 5))
        
        # Accuracy plot
        axes[0].plot(self.history['accuracy'], label='Training Accuracy', linewidth=2)
        axes[0].plot(self.history['val_accuracy'], label='Validation Accuracy', linewidth=2)
        axes[0].set_title('Model Accuracy Over Time', fontsize=14, fontweight='bold')
        axes[0].set_xlabel('Epoch', fontsize=12)
        axes[0].set_ylabel('Accuracy', fontsize=12)
        axes[0].legend(fontsize=10)
        axes[0].grid(True, alpha=0.3)
        
        # Loss plot
        axes[1].plot(self.history['loss'], label='Training Loss', linewidth=2)
        axes[1].plot(self.history['val_loss'], label='Validation Loss', linewidth=2)
        axes[1].set_title('Model Loss Over Time', fontsize=14, fontweight='bold')
        axes[1].set_xlabel('Epoch', fontsize=12)
        axes[1].set_ylabel('Loss', fontsize=12)
        axes[1].legend(fontsize=10)
        axes[1].grid(True, alpha=0.3)
        
        plt.tight_layout()
        plt.savefig(self.output_dir / 'plots' / 'training_history.png', dpi=300, bbox_inches='tight')
        plt.close()
        print(f"✓ Saved training history to {self.output_dir / 'plots' / 'training_history.png'}")
    
    def save_model(self, filename='soil_classifier_final.h5'):
        """Save the trained model"""
        model_path = self.output_dir / 'models' / filename
        self.model.save(model_path)
        print(f"✓ Saved final model to {model_path}")
        
        # Also save in TensorFlow SavedModel format
        savedmodel_path = self.output_dir / 'models' / 'soil_classifier_savedmodel'
        self.model.save(savedmodel_path)
        print(f"✓ Saved model in SavedModel format to {savedmodel_path}")
    
    def visualize_predictions(self, num_images=16):
        """Visualize sample predictions"""
        self.val_generator.reset()
        
        # Get a batch of images
        images, labels = next(self.val_generator)
        predictions = self.model.predict(images[:num_images])
        
        # Plot
        rows = 4
        cols = 4
        fig, axes = plt.subplots(rows, cols, figsize=(16, 16))
        axes = axes.ravel()
        
        for i in range(min(num_images, len(images))):
            axes[i].imshow(images[i])
            axes[i].axis('off')
            
            true_label = self.class_names[np.argmax(labels[i])]
            pred_label = self.class_names[np.argmax(predictions[i])]
            confidence = np.max(predictions[i]) * 100
            
            color = 'green' if true_label == pred_label else 'red'
            axes[i].set_title(f'True: {true_label}\nPred: {pred_label}\nConf: {confidence:.1f}%',
                            fontsize=10, color=color, fontweight='bold')
        
        plt.tight_layout()
        plt.savefig(self.output_dir / 'plots' / 'sample_predictions.png', dpi=300, bbox_inches='tight')
        plt.close()
        print(f"✓ Saved sample predictions to {self.output_dir / 'plots' / 'sample_predictions.png'}")


def main():
    """Main training pipeline"""
    print("\n" + "="*60)
    print("SOIL TYPE CLASSIFICATION - TRAINING PIPELINE")
    print("="*60)
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Configuration
    DATA_DIR = 'Soil types'
    IMG_SIZE = (224, 224)
    BATCH_SIZE = 16
    EPOCHS = 50
    FINE_TUNE_EPOCHS = 30
    
    # Check if GPU is available
    print(f"\nGPU Available: {tf.config.list_physical_devices('GPU')}")
    print(f"TensorFlow Version: {tf.__version__}")
    
    # Initialize classifier
    classifier = SoilClassifier(
        data_dir=DATA_DIR,
        img_size=IMG_SIZE,
        batch_size=BATCH_SIZE
    )
    
    # Prepare data
    classifier.prepare_data(validation_split=0.2)
    
    # Build model
    classifier.build_model()
    
    # Print model summary
    print("\n" + "="*60)
    print("MODEL ARCHITECTURE")
    print("="*60)
    classifier.model.summary()
    
    # Train model
    classifier.train(epochs=EPOCHS, fine_tune_epochs=FINE_TUNE_EPOCHS)
    
    # Plot training history
    classifier.plot_training_history()
    
    # Evaluate model
    classifier.evaluate()
    
    # Visualize predictions
    classifier.visualize_predictions()
    
    # Save model
    classifier.save_model()
    
    print("\n" + "="*60)
    print("TRAINING COMPLETED SUCCESSFULLY!")
    print("="*60)
    print(f"Finished at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"\nAll outputs saved to: {classifier.output_dir}")
    print("\nGenerated files:")
    print("  - Models: soil_model_output/models/")
    print("  - Plots: soil_model_output/plots/")
    print("  - Class mapping: soil_model_output/class_mapping.json")
    print("  - Classification report: soil_model_output/classification_report.txt")


if __name__ == "__main__":
    main()
