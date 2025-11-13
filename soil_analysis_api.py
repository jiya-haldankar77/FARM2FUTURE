from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
from tensorflow.keras.preprocessing import image
import numpy as np
import os
from PIL import Image
import io

app = Flask(__name__)
CORS(app)

# Load the trained model and class mapping
try:
    # Try to load the improved model first
    model = tf.keras.models.load_model('soil_model_output_improved/models/soil_classifier_final.h5')
    print("✅ Improved CNN model loaded successfully!")
    MODEL_TYPE = 'improved'
    
    # Load class mapping from the improved model training
    try:
        import json
        with open('soil_model_output_improved/class_mapping.json', 'r') as f:
            class_mapping = json.load(f)
        labels = [class_mapping[str(i)] for i in range(len(class_mapping))]
        print(f"✅ Loaded class mapping: {labels}")
    except:
        print("⚠️ Could not load class mapping, using default labels")
        labels = ["Black Soil", "Cinder Soil", "Laterite Soil", "Peat Soil", "Yellow Soil"]
        
except:
    try:
        # Fallback to old model
        model = tf.keras.models.load_model('soil_model.h5')
        print("✅ Standard CNN model loaded successfully!")
        MODEL_TYPE = 'standard'
        labels = ["Black Soil", "Cinder Soil", "Laterite Soil", "Peat Soil", "Yellow Soil"]
    except:
        print("⚠️ CNN model file not found. Using color-based classifier...")
        # Fallback to simple color-based classifier
        try:
            from simple_soil_classifier import SimpleSoilClassifier
            model = SimpleSoilClassifier()
            print("✅ Simple color-based classifier loaded!")
            MODEL_TYPE = 'simple'
            labels = ["Black Soil", "Cinder Soil", "Laterite Soil", "Peat Soil", "Yellow Soil"]
        except:
            print("⚠️ Using random mock model for testing.")
            class MockModel:
                def predict(self, img_array):
                    return np.random.rand(1, 5)
            model = MockModel()
            MODEL_TYPE = 'mock'
            labels = ["Black Soil", "Cinder Soil", "Laterite Soil", "Peat Soil", "Yellow Soil"]

# Define soil types and their suitable crops
soil_info = {
    "Black Soil": {
        "crops": ["Cotton", "Wheat", "Jowar", "Millets", "Linseed", "Castor", "Sunflower"],
        "description": "High clay content, excellent moisture retention, rich in calcium and magnesium",
        "fertilizers": ["Urea", "DAP", "Compost", "Potassium"]
    },
    "Cinder Soil": {
        "crops": ["Grapes", "Olives", "Lavender", "Drought-resistant crops"],
        "description": "Volcanic soil, excellent drainage, porous structure",
        "fertilizers": ["Organic compost", "Balanced NPK", "Micronutrients"]
    },
    "Laterite Soil": {
        "crops": ["Cashew", "Coconut", "Tea", "Coffee", "Rubber", "Tapioca"],
        "description": "Iron and aluminum rich, acidic, good for plantation crops",
        "fertilizers": ["Lime", "Organic manure", "Phosphate fertilizers"]
    },
    "Peat Soil": {
        "crops": ["Vegetables", "Berries", "Flowers", "Lettuce", "Celery"],
        "description": "High organic matter, acidic, excellent water retention",
        "fertilizers": ["Lime (to reduce acidity)", "Balanced NPK", "Compost"]
    },
    "Yellow Soil": {
        "crops": ["Maize", "Tobacco", "Potatoes", "Wheat", "Pulses"],
        "description": "Sandy texture, low fertility, needs fertilization",
        "fertilizers": ["NPK 20-20-20", "Organic matter", "Green manure"]
    }
}

@app.route('/api/analyze-soil', methods=['POST'])
def analyze_soil():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        file = request.files['image']
        
        # Read and preprocess the image
        img_bytes = file.read()
        img = Image.open(io.BytesIO(img_bytes))
        
        # Use 224x224 for improved model, 150x150 for others
        img_size = (224, 224) if MODEL_TYPE == 'improved' else (150, 150)
        img = img.resize(img_size)
        
        # Convert to array and normalize
        img_array = image.img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0)
        img_array = img_array / 255.0
        
        # Predict
        predictions = model.predict(img_array)
        predicted_index = predictions.argmax()
        predicted_soil = labels[predicted_index]
        confidence = float(predictions[0][predicted_index]) * 100
        
        # Get soil information
        soil_data = soil_info.get(predicted_soil, {})
        
        return jsonify({
            'success': True,
            'soil_type': predicted_soil,
            'confidence': round(confidence, 2),
            'crops': soil_data.get('crops', []),
            'description': soil_data.get('description', ''),
            'fertilizers': soil_data.get('fertilizers', []),
            'all_predictions': {
                labels[i]: round(float(predictions[0][i]) * 100, 2) 
                for i in range(len(labels))
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'model_type': MODEL_TYPE,
        'num_classes': len(labels),
        'class_names': labels
    })

@app.route('/api/reload-model', methods=['POST'])
def reload_model():
    """Reload the model after retraining"""
    global model, MODEL_TYPE, labels
    
    try:
        # Try to load the improved model first
        new_model = tf.keras.models.load_model('soil_model_output_improved/models/soil_classifier_final.h5')
        
        # Load class mapping
        try:
            import json
            with open('soil_model_output_improved/class_mapping.json', 'r') as f:
                class_mapping = json.load(f)
            new_labels = [class_mapping[str(i)] for i in range(len(class_mapping))]
        except:
            new_labels = ["Black Soil", "Cinder Soil", "Laterite Soil", "Peat Soil", "Yellow Soil"]
        
        # Update global variables
        model = new_model
        MODEL_TYPE = 'improved'
        labels = new_labels
        
        return jsonify({
            'success': True,
            'message': 'Model reloaded successfully',
            'model_type': MODEL_TYPE,
            'class_names': labels
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Failed to reload model: {str(e)}'
        }), 500

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=False)
