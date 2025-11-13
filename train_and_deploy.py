#!/usr/bin/env python3
"""
Integrated Training and Deployment Script
Connects train_soil_classifier_improved.py with soil_analysis_api.py
"""

import os
import sys
import requests
import time
from pathlib import Path

def check_api_running(port=5001, max_retries=5):
    """Check if the API is running"""
    for i in range(max_retries):
        try:
            response = requests.get(f'http://localhost:{port}/health', timeout=5)
            if response.status_code == 200:
                return True
        except:
            pass
        time.sleep(1)
    return False

def reload_api_model(port=5001):
    """Reload the model in the running API"""
    try:
        response = requests.post(f'http://localhost:{port}/api/reload-model', timeout=30)
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print("✅ API model reloaded successfully!")
                print(f"   Model type: {data.get('model_type')}")
                print(f"   Classes: {data.get('class_names')}")
                return True
            else:
                print(f"❌ Failed to reload API model: {data.get('error')}")
                return False
        else:
            print(f"❌ API reload failed with status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error reloading API model: {str(e)}")
        return False

def train_model():
    """Train the improved soil classifier"""
    print("\n" + "="*60)
    print("STARTING SOIL CLASSIFIER TRAINING")
    print("="*60)
    
    # Import and run the training script
    try:
        from train_soil_classifier_improved import main as train_main
        train_main()
        return True
    except Exception as e:
        print(f"❌ Training failed: {str(e)}")
        return False

def test_api_with_sample():
    """Test the API with a sample image"""
    print("\n" + "="*60)
    print("TESTING API WITH SAMPLE IMAGE")
    print("="*60)
    
    # Find a sample image
    soil_types_dir = Path('Soil types')
    sample_image = None
    
    for soil_type in soil_types_dir.iterdir():
        if soil_type.is_dir():
            for img_file in soil_type.glob('*.jpg'):
                sample_image = img_file
                break
        if sample_image:
            break
    
    if not sample_image:
        print("❌ No sample images found in 'Soil types' directory")
        return False
    
    try:
        with open(sample_image, 'rb') as f:
            files = {'image': f}
            response = requests.post('http://localhost:5001/api/analyze-soil', files=files, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ API test successful!")
            print(f"   Sample image: {sample_image}")
            print(f"   Predicted soil: {data.get('soil_type')}")
            print(f"   Confidence: {data.get('confidence')}%")
            return True
        else:
            print(f"❌ API test failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ API test error: {str(e)}")
        return False

def main():
    """Main integration workflow"""
    print("\n" + "="*80)
    print("SOIL CLASSIFIER TRAINING & DEPLOYMENT INTEGRATION")
    print("="*80)
    
    # Check if data directory exists
    if not Path('Soil types').exists():
        print("❌ 'Soil types' directory not found!")
        print("   Please ensure your training data is in the 'Soil types' directory")
        return False
    
    # Step 1: Train the model
    print("\n🚀 Step 1: Training the improved soil classifier...")
    if not train_model():
        print("❌ Training failed. Stopping integration.")
        return False
    
    # Step 2: Check if API is running
    print("\n🚀 Step 2: Checking if API is running...")
    api_running = check_api_running()
    
    if api_running:
        print("✅ API is running. Reloading model...")
        # Step 3: Reload the model in the API
        if reload_api_model():
            print("✅ Model successfully reloaded in API!")
        else:
            print("⚠️ Failed to reload model in API. You may need to restart the API.")
    else:
        print("⚠️ API is not running.")
        print("   To start the API, run: python3 soil_analysis_api.py")
        print("   Then you can reload the model using: curl -X POST http://localhost:5001/api/reload-model")
    
    # Step 4: Test the integration
    if api_running:
        print("\n🚀 Step 3: Testing the integration...")
        if test_api_with_sample():
            print("\n🎉 INTEGRATION SUCCESSFUL!")
            print("   Your soil classifier is trained and the API is working!")
        else:
            print("\n⚠️ API test failed. Check the logs for details.")
    
    print("\n" + "="*80)
    print("INTEGRATION COMPLETE")
    print("="*80)
    print("\nNext steps:")
    print("1. If API is not running, start it with: python3 soil_analysis_api.py")
    print("2. Test the API at: http://localhost:5001/health")
    print("3. Use the soil analysis at: http://localhost:5001/api/analyze-soil")
    
    return True

if __name__ == "__main__":
    main()
