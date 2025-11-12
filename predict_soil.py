"""
Soil Type Prediction Script
Use the trained model to predict soil types from new images
"""

import os
import json
import numpy as np
import matplotlib.pyplot as plt
from pathlib import Path
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras.preprocessing import image
import argparse


class SoilPredictor:
    def __init__(self, model_path, class_mapping_path):
        """
        Initialize the Soil Predictor
        
        Args:
            model_path: Path to the trained model (.h5 file)
            class_mapping_path: Path to class_mapping.json
        """
        print("Loading model...")
        self.model = keras.models.load_model(model_path)
        print(f"✓ Model loaded from {model_path}")
        
        # Load class mapping
        with open(class_mapping_path, 'r') as f:
            self.class_mapping = json.load(f)
        
        # Convert keys to integers
        self.class_mapping = {int(k): v for k, v in self.class_mapping.items()}
        self.class_names = [self.class_mapping[i] for i in sorted(self.class_mapping.keys())]
        
        print(f"✓ Loaded class mapping: {self.class_names}")
        
        self.img_size = (224, 224)
    
    def preprocess_image(self, img_path):
        """
        Preprocess a single image for prediction
        
        Args:
            img_path: Path to the image file
            
        Returns:
            Preprocessed image array
        """
        img = image.load_img(img_path, target_size=self.img_size)
        img_array = image.img_to_array(img)
        img_array = img_array / 255.0  # Normalize
        img_array = np.expand_dims(img_array, axis=0)  # Add batch dimension
        return img_array, img
    
    def predict_single(self, img_path, show_plot=True):
        """
        Predict soil type for a single image
        
        Args:
            img_path: Path to the image file
            show_plot: Whether to display the prediction plot
            
        Returns:
            Dictionary with prediction results
        """
        # Preprocess image
        img_array, original_img = self.preprocess_image(img_path)
        
        # Make prediction
        predictions = self.model.predict(img_array, verbose=0)
        predicted_class_idx = np.argmax(predictions[0])
        predicted_class = self.class_names[predicted_class_idx]
        confidence = predictions[0][predicted_class_idx] * 100
        
        # Get top 3 predictions
        top_3_idx = np.argsort(predictions[0])[-3:][::-1]
        top_3_predictions = [
            {
                'class': self.class_names[idx],
                'confidence': predictions[0][idx] * 100
            }
            for idx in top_3_idx
        ]
        
        result = {
            'image_path': img_path,
            'predicted_class': predicted_class,
            'confidence': confidence,
            'top_3_predictions': top_3_predictions
        }
        
        # Print results
        print("\n" + "="*60)
        print(f"Image: {Path(img_path).name}")
        print("="*60)
        print(f"Predicted Soil Type: {predicted_class}")
        print(f"Confidence: {confidence:.2f}%")
        print("\nTop 3 Predictions:")
        for i, pred in enumerate(top_3_predictions, 1):
            print(f"  {i}. {pred['class']}: {pred['confidence']:.2f}%")
        
        # Visualize
        if show_plot:
            self._plot_prediction(original_img, result)
        
        return result
    
    def _plot_prediction(self, img, result):
        """Plot the image with prediction results"""
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6))
        
        # Display image
        ax1.imshow(img)
        ax1.axis('off')
        ax1.set_title(f"Predicted: {result['predicted_class']}\nConfidence: {result['confidence']:.2f}%",
                     fontsize=14, fontweight='bold', color='green' if result['confidence'] > 80 else 'orange')
        
        # Display confidence bars
        classes = [pred['class'] for pred in result['top_3_predictions']]
        confidences = [pred['confidence'] for pred in result['top_3_predictions']]
        colors = ['green', 'orange', 'red']
        
        bars = ax2.barh(classes, confidences, color=colors)
        ax2.set_xlabel('Confidence (%)', fontsize=12)
        ax2.set_title('Top 3 Predictions', fontsize=14, fontweight='bold')
        ax2.set_xlim(0, 100)
        
        # Add value labels on bars
        for bar, conf in zip(bars, confidences):
            ax2.text(conf + 2, bar.get_y() + bar.get_height()/2, 
                    f'{conf:.1f}%', va='center', fontsize=10, fontweight='bold')
        
        plt.tight_layout()
        plt.show()
    
    def predict_batch(self, image_dir, output_file='predictions.txt'):
        """
        Predict soil types for all images in a directory
        
        Args:
            image_dir: Directory containing images
            output_file: File to save predictions
        """
        image_dir = Path(image_dir)
        image_extensions = ['.jpg', '.jpeg', '.png', '.bmp']
        
        # Find all images
        image_files = []
        for ext in image_extensions:
            image_files.extend(list(image_dir.glob(f'*{ext}')))
            image_files.extend(list(image_dir.glob(f'*{ext.upper()}')))
        
        if not image_files:
            print(f"No images found in {image_dir}")
            return
        
        print(f"\nFound {len(image_files)} images")
        print("Processing...")
        
        results = []
        for img_path in image_files:
            result = self.predict_single(str(img_path), show_plot=False)
            results.append(result)
        
        # Save results
        with open(output_file, 'w') as f:
            f.write("SOIL TYPE PREDICTIONS\n")
            f.write("="*60 + "\n\n")
            for result in results:
                f.write(f"Image: {Path(result['image_path']).name}\n")
                f.write(f"Predicted: {result['predicted_class']}\n")
                f.write(f"Confidence: {result['confidence']:.2f}%\n")
                f.write("-"*60 + "\n")
        
        print(f"\n✓ Predictions saved to {output_file}")
        
        # Summary
        print("\n" + "="*60)
        print("PREDICTION SUMMARY")
        print("="*60)
        class_counts = {}
        for result in results:
            pred_class = result['predicted_class']
            class_counts[pred_class] = class_counts.get(pred_class, 0) + 1
        
        for soil_type, count in sorted(class_counts.items()):
            print(f"{soil_type}: {count} images ({count/len(results)*100:.1f}%)")
        
        return results


def main():
    parser = argparse.ArgumentParser(description='Predict soil types from images')
    parser.add_argument('--model', type=str, default='soil_model_output_improved/models/soil_classifier_final.h5',
                       help='Path to the trained model')
    parser.add_argument('--mapping', type=str, default='soil_model_output_improved/class_mapping.json',
                       help='Path to class mapping JSON')
    parser.add_argument('--image', type=str, help='Path to a single image to predict')
    parser.add_argument('--dir', type=str, help='Directory containing images to predict')
    parser.add_argument('--output', type=str, default='predictions.txt',
                       help='Output file for batch predictions')
    
    args = parser.parse_args()
    
    # Initialize predictor
    predictor = SoilPredictor(args.model, args.mapping)
    
    if args.image:
        # Single image prediction
        predictor.predict_single(args.image, show_plot=True)
    elif args.dir:
        # Batch prediction
        predictor.predict_batch(args.dir, args.output)
    else:
        print("Please provide either --image or --dir argument")
        print("\nExamples:")
        print("  Single image: python predict_soil.py --image path/to/image.jpg")
        print("  Batch: python predict_soil.py --dir path/to/images/")


if __name__ == "__main__":
    main()
