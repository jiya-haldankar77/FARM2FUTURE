"""
Download Kaggle Soil Types Dataset
Dataset: https://www.kaggle.com/datasets/prasanshasatpathy/soil-types/data

Prerequisites:
1. Install kaggle: pip install kaggle
2. Setup Kaggle API credentials:
   - Go to https://www.kaggle.com/settings
   - Click "Create New API Token"
   - Save kaggle.json to ~/.kaggle/kaggle.json
   - chmod 600 ~/.kaggle/kaggle.json
"""

import os
import zipfile
import shutil

def download_dataset():
    print("📥 Downloading Kaggle Soil Types Dataset...")
    print("=" * 60)
    
    # Check if kaggle is installed
    try:
        import kaggle
    except ImportError:
        print("❌ Kaggle package not installed!")
        print("Install it with: pip install kaggle")
        return False
    
    # Check if API credentials exist
    kaggle_dir = os.path.expanduser("~/.kaggle")
    kaggle_json = os.path.join(kaggle_dir, "kaggle.json")
    
    if not os.path.exists(kaggle_json):
        print("❌ Kaggle API credentials not found!")
        print("\nSetup instructions:")
        print("1. Go to https://www.kaggle.com/settings")
        print("2. Scroll to 'API' section")
        print("3. Click 'Create New API Token'")
        print("4. Save the downloaded kaggle.json to ~/.kaggle/")
        print("5. Run: chmod 600 ~/.kaggle/kaggle.json")
        return False
    
    # Download dataset
    dataset_name = "prasanshasatpathy/soil-types"
    download_path = "/Users/jiya/Documents/wb t/mn"
    
    print(f"\n📂 Downloading to: {download_path}")
    
    try:
        os.system(f'kaggle datasets download -d {dataset_name} -p "{download_path}"')
        
        # Unzip the dataset
        zip_file = os.path.join(download_path, "soil-types.zip")
        
        if os.path.exists(zip_file):
            print("\n📦 Extracting dataset...")
            with zipfile.ZipFile(zip_file, 'r') as zip_ref:
                zip_ref.extractall(download_path)
            
            # Remove zip file
            os.remove(zip_file)
            print("✅ Dataset extracted successfully!")
            
            # Check dataset structure
            dataset_dir = os.path.join(download_path, "Dataset")
            if os.path.exists(dataset_dir):
                train_dir = os.path.join(dataset_dir, "Train")
                if os.path.exists(train_dir):
                    soil_types = os.listdir(train_dir)
                    soil_types = [s for s in soil_types if not s.startswith('.')]
                    print(f"\n📋 Found {len(soil_types)} soil types:")
                    for soil in soil_types:
                        soil_path = os.path.join(train_dir, soil)
                        if os.path.isdir(soil_path):
                            num_images = len([f for f in os.listdir(soil_path) if f.endswith(('.jpg', '.jpeg', '.png'))])
                            print(f"   - {soil}: {num_images} images")
                    
                    print("\n✅ Dataset ready for training!")
                    print(f"📂 Dataset location: {dataset_dir}")
                    print("\nNext step: Run 'python3 train_soil_model.py' to train the model")
                    return True
            else:
                print("⚠️ Dataset structure not as expected. Please check manually.")
                return False
        else:
            print("❌ Download failed. Zip file not found.")
            return False
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

if __name__ == "__main__":
    print("🌾 Kaggle Soil Types Dataset Downloader")
    print("=" * 60)
    download_dataset()
