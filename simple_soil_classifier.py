"""
Simple rule-based soil classifier using color analysis
This is a temporary solution until you train the real CNN model
"""

import numpy as np
from PIL import Image

class SimpleSoilClassifier:
    """
    Simple color-based soil classifier
    Analyzes dominant colors to predict soil type
    """
    
    def predict(self, img_array):
        """
        Predict soil type based on color analysis
        img_array: numpy array of shape (1, 150, 150, 3) normalized to [0, 1]
        """
        # Denormalize to get RGB values
        img = (img_array[0] * 255).astype(np.uint8)
        
        # Calculate average RGB values
        avg_r = np.mean(img[:, :, 0])
        avg_g = np.mean(img[:, :, 1])
        avg_b = np.mean(img[:, :, 2])
        
        # Calculate color ratios
        total = avg_r + avg_g + avg_b
        r_ratio = avg_r / total if total > 0 else 0
        g_ratio = avg_g / total if total > 0 else 0
        b_ratio = avg_b / total if total > 0 else 0
        
        # Calculate brightness
        brightness = (avg_r + avg_g + avg_b) / 3
        
        # Soil type classification based on color characteristics
        scores = np.zeros(4)  # [Alluvial, Black, Clay, Red]
        
        # Red soil: High red component, lower green/blue
        if r_ratio > 0.38 and brightness > 80:
            scores[3] = 0.7 + (r_ratio - 0.38) * 2
        
        # Black soil: Low brightness, balanced colors
        if brightness < 70 and abs(r_ratio - g_ratio) < 0.05:
            scores[1] = 0.8 - (brightness / 100)
        
        # Alluvial soil: Moderate brightness, slightly yellowish
        if 70 < brightness < 120 and g_ratio > r_ratio * 0.9:
            scores[0] = 0.6 + ((brightness - 70) / 100)
        
        # Clay soil: Grayish, moderate brightness
        if 60 < brightness < 100 and abs(r_ratio - g_ratio) < 0.08 and abs(g_ratio - b_ratio) < 0.08:
            scores[2] = 0.65
        
        # Normalize scores to sum to 1
        if scores.sum() > 0:
            scores = scores / scores.sum()
        else:
            # Default to random if no clear match
            scores = np.array([0.25, 0.25, 0.25, 0.25])
        
        return scores.reshape(1, 4)

# Test the classifier
if __name__ == "__main__":
    print("🧪 Testing Simple Soil Classifier...")
    classifier = SimpleSoilClassifier()
    
    # Create a test image (red soil simulation)
    test_img = np.ones((1, 150, 150, 3)) * 0.6
    test_img[0, :, :, 0] = 0.8  # More red
    
    prediction = classifier.predict(test_img)
    labels = ["Alluvial soil", "Black Soil", "Clay soil", "Red soil"]
    
    print("\nPredictions:")
    for i, label in enumerate(labels):
        print(f"  {label}: {prediction[0][i]*100:.2f}%")
    
    predicted_idx = prediction.argmax()
    print(f"\n✅ Predicted: {labels[predicted_idx]}")
