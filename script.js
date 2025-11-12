// --- Full Soil Database for all States + UTs ---
const soilData = {
  "Andhra Pradesh": {
    "Red Soil": { crops:["Rice","Maize","Groundnut"], fertilizers:["NPK 10-26-26","Organic compost"] },
    "Black Soil": { crops:["Cotton","Soybean","Chili"], fertilizers:["Urea","DAP","Compost"] }
  },
  "Arunachal Pradesh": {
    "Alluvial Soil": { crops:["Rice","Maize","Millet"], fertilizers:["NPK 10-26-26","Farmyard manure"] }
  },
  "Assam": {
    "Alluvial Soil": { crops:["Rice","Tea","Jute"], fertilizers:["NPK 10-26-26","Compost"] }
  },
  "Bihar": {
    "Alluvial Soil": { crops:["Rice","Wheat","Maize"], fertilizers:["NPK 10-26-26","Organic compost"] }
  },
  "Chhattisgarh": {
    "Red Soil": { crops:["Rice","Maize","Sugarcane"], fertilizers:["NPK 12-32-16","Urea"] }
  },
  "Goa": {
    "Laterite Soil": { crops:["Rice","Coconut","Vegetables"], fertilizers:["Organic manure","NPK 10-26-26"] }
  },
  "Gujarat": {
    "Black Soil": { crops:["Cotton","Groundnut","Millet"], fertilizers:["Urea","DAP","Potash"] }
  },
  "Haryana": {
    "Alluvial Soil": { crops:["Wheat","Rice","Sugarcane"], fertilizers:["DAP","Urea","Potash"] }
  },
  "Himachal Pradesh": {
    "Mountain Soil": { crops:["Apple","Wheat","Maize"], fertilizers:["Farmyard manure","NPK 10-26-26"] }
  },
  "Jharkhand": {
    "Red Soil": { crops:["Rice","Maize","Millet"], fertilizers:["NPK 10-26-26","Compost"] }
  },
  "Karnataka": {
    "Black Soil": { crops:["Cotton","Maize","Groundnut"], fertilizers:["Urea","NPK 20-20-0"] },
    "Red Soil": { crops:["Rice","Millets","Ragi"], fertilizers:["Compost","Superphosphate"] }
  },
  "Kerala": {
    "Laterite Soil": { crops:["Rice","Coconut","Vegetables"], fertilizers:["Organic manure","NPK 10-26-26"] }
  },
  "Madhya Pradesh": {
    "Black Soil": { crops:["Soybean","Cotton","Wheat"], fertilizers:["Urea","DAP","Compost"] },
    "Alluvial Soil": { crops:["Rice","Wheat","Maize"], fertilizers:["NPK 10-26-26","Organic compost"] }
  },
  "Maharashtra": {
    "Black Soil": { crops:["Cotton","Soybean","Tur"], fertilizers:["NPK 20-20-0","Urea","Compost"] },
    "Laterite Soil": { crops:["Rice","Cashew","Ragi"], fertilizers:["Phosphate-rich fertilizer","Organic manure"] }
  },
  "Manipur": {
    "Alluvial Soil": { crops:["Rice","Maize","Millet"], fertilizers:["NPK 10-26-26","Farmyard manure"] }
  },
  "Meghalaya": {
    "Red Soil": { crops:["Rice","Maize","Pulses"], fertilizers:["Organic manure","NPK 10-26-26"] }
  },
  "Mizoram": {
    "Alluvial Soil": { crops:["Rice","Maize","Millet"], fertilizers:["NPK 10-26-26","Compost"] }
  },
  "Nagaland": {
    "Red Soil": { crops:["Rice","Maize","Millets"], fertilizers:["Organic manure","NPK 10-26-26"] }
  },
  "Odisha": {
    "Alluvial Soil": { crops:["Rice","Maize","Pulses"], fertilizers:["NPK 10-26-26","Organic compost"] }
  },
  "Punjab": {
    "Alluvial Soil": { crops:["Wheat","Rice","Sugarcane"], fertilizers:["DAP","Urea","Potash"] }
  },
  "Rajasthan": {
    "Desert Soil": { crops:["Millet","Wheat","Barley"], fertilizers:["Urea","Superphosphate"] }
  },
  "Sikkim": {
    "Mountain Soil": { crops:["Cardamom","Rice","Maize"], fertilizers:["Organic manure","NPK 10-26-26"] }
  },
  "Tamil Nadu": {
    "Red Soil": { crops:["Millets","Groundnut","Pulses"], fertilizers:["Superphosphate","Farmyard manure"] },
    "Black Soil": { crops:["Cotton","Maize","Sugarcane"], fertilizers:["NPK 20-20-0","Urea"] }
  },
  "Telangana": {
    "Black Soil": { crops:["Cotton","Maize","Soybean"], fertilizers:["Urea","DAP","Compost"] }
  },
  "Tripura": {
    "Alluvial Soil": { crops:["Rice","Maize","Vegetables"], fertilizers:["NPK 10-26-26","Farmyard manure"] }
  },
  "Uttar Pradesh": {
    "Alluvial Soil": { crops:["Wheat","Rice","Sugarcane"], fertilizers:["DAP","Urea","Potash"] }
  },
  "Uttarakhand": {
    "Mountain Soil": { crops:["Rice","Wheat","Maize"], fertilizers:["NPK 10-26-26","Compost"] }
  },
  "West Bengal": {
    "Alluvial Soil": { crops:["Rice","Jute","Sugarcane"], fertilizers:["NPK 10-26-26","Compost"] }
  },
  // Union Territories
  "Andaman and Nicobar Islands": {
    "Red Soil": { crops:["Coconut","Vegetables"], fertilizers:["Organic manure","NPK 10-26-26"] }
  },
  "Chandigarh": {
    "Alluvial Soil": { crops:["Wheat","Vegetables"], fertilizers:["DAP","Urea"] }
  },
  "Dadra and Nagar Haveli": {
    "Laterite Soil": { crops:["Rice","Vegetables"], fertilizers:["Organic manure","NPK 10-26-26"] }
  },
  "Daman and Diu": {
    "Laterite Soil": { crops:["Rice","Vegetables"], fertilizers:["Organic manure","NPK 10-26-26"] }
  },
  "Delhi": {
    "Alluvial Soil": { crops:["Wheat","Rice","Vegetables"], fertilizers:["DAP","Urea","Compost"] }
  },
  "Jammu and Kashmir": {
    "Mountain Soil": { crops:["Apple","Rice","Wheat"], fertilizers:["Farmyard manure","NPK 10-26-26"] }
  },
  "Ladakh": {
    "Mountain Soil": { crops:["Barley","Wheat"], fertilizers:["Organic manure","NPK 10-26-26"] }
  },
  "Lakshadweep": {
    "Red Soil": { crops:["Coconut","Vegetables"], fertilizers:["Organic manure","NPK 10-26-26"] }
  },
  "Puducherry": {
    "Alluvial Soil": { crops:["Rice","Vegetables"], fertilizers:["NPK 10-26-26","Organic compost"] }
  }
};

// --- Populate state dropdown ---
const stateSelect = document.getElementById("state");
Object.keys(soilData).forEach(state => {
  const option = document.createElement("option");
  option.value = state;
  option.textContent = state;
  stateSelect.appendChild(option);
});

// --- Load soils for selected state ---
function loadSoilTypes() {
  const state = document.getElementById("state").value;
  const soilSelect = document.getElementById("soil");
  soilSelect.innerHTML = '<option value="">-- Select Soil --</option>';

  if (soilData[state]) {
    Object.keys(soilData[state]).forEach(soil => {
      const option = document.createElement("option");
      option.value = soil;
      option.textContent = soil;
      soilSelect.appendChild(option);
    });
  }
}

// --- Show crops & fertilizer ---
function showRecommendations() {
  const state = document.getElementById("state").value;
  const soil = document.getElementById("soil").value;
  const resultBox = document.getElementById("result");

  if (state && soil && soilData[state][soil]) {
    const data = soilData[state][soil];
    document.getElementById("crops").textContent = "🌾 Crops: " + data.crops.join(", ");
    document.getElementById("fertilizers").textContent = "💊 Fertilizers: " + data.fertilizers.join(", ");
    resultBox.style.display = "block";
  } else {
    alert("Please select both state and soil type!");
  }
}

// --- Back button ---
function goBack() {
  window.location.href = "dashboard.html"; // adjust if your dashboard file name is different
}

// --- Image Upload Preview ---
let selectedFile = null;

function onImageSelected(event) {
  const file = event.target.files[0];
  if (file) {
    selectedFile = file;
    const reader = new FileReader();
    reader.onload = e => {
      const img = document.getElementById("imagePreview");
      const placeholder = document.querySelector(".upload-placeholder");
      img.src = e.target.result;
      img.style.display = "block";
      placeholder.style.display = "none";
      document.getElementById("analyzeBtn").style.display = "block";
    };
    reader.readAsDataURL(file);
  }
}

// --- AI Image Analysis ---
async function analyzeImage() {
  const fileInput = document.getElementById("soilImage");
  if (!fileInput.files.length) {
    alert("Please upload a soil photo first.");
    return;
  }

  const loadingSpinner = document.getElementById("loadingSpinner");
  const aiResult = document.getElementById("aiResult");
  const analyzeBtn = document.getElementById("analyzeBtn");
  
  // Show loading
  loadingSpinner.style.display = "block";
  aiResult.style.display = "none";
  analyzeBtn.disabled = true;

  try {
    // Create FormData
    const formData = new FormData();
    formData.append('image', selectedFile);

    // Call the API (you can switch between mock and real API)
    const useMockAPI = false; // Set to false when Flask API is running
    
    let result;
    if (useMockAPI) {
      // Mock response for testing without Flask
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate delay
      result = await getMockAnalysis();
    } else {
      // Real API call
      const response = await fetch('http://localhost:5001/api/analyze-soil', {
        method: 'POST',
        body: formData
      });
      result = await response.json();
    }

    // Display results
    displayAnalysisResults(result);
    
  } catch (error) {
    console.error('Error analyzing image:', error);
    aiResult.innerHTML = `
      <div style="color: #D32F2F; padding: 1rem; background: #FFEBEE; border-radius: 8px;">
        <strong>❌ Error:</strong> ${error.message || 'Failed to analyze image. Please try again.'}
      </div>
    `;
    aiResult.style.display = "block";
  } finally {
    loadingSpinner.style.display = "none";
    analyzeBtn.disabled = false;
  }
}

// Mock analysis for testing
function getMockAnalysis() {
  const soilTypes = ["Alluvial soil", "Black Soil", "Clay soil", "Red soil"];
  const randomSoil = soilTypes[Math.floor(Math.random() * soilTypes.length)];
  
  const soilInfo = {
    "Alluvial soil": {
      crops: ["Rice", "SugarCane", "Maize", "Cotton", "Soyabean", "Jute"],
      description: "Rich in nutrients with good water retention capacity",
      fertilizers: ["NPK 10-26-26", "Organic compost", "Farmyard manure"]
    },
    "Black Soil": {
      crops: ["Wheat", "Virginia", "Jowar", "Millets", "Linseed", "Castor", "Sunflower"],
      description: "High clay content, excellent moisture retention",
      fertilizers: ["Urea", "DAP", "Compost"]
    },
    "Clay soil": {
      crops: ["Rice", "Lettuce", "Chard", "Broccoli", "Cabbage", "Snap Beans"],
      description: "Heavy soil with excellent water retention",
      fertilizers: ["Gypsum", "Organic matter", "Compost"]
    },
    "Red soil": {
      crops: ["Cotton", "Pulses", "Millets", "OilSeeds", "Potatoes"],
      description: "Iron-rich soil with good drainage",
      fertilizers: ["NPK 12-32-16", "Superphosphate", "Organic compost"]
    }
  };

  return {
    success: true,
    soil_type: randomSoil,
    confidence: Math.floor(Math.random() * 20) + 75, // 75-95%
    crops: soilInfo[randomSoil].crops,
    description: soilInfo[randomSoil].description,
    fertilizers: soilInfo[randomSoil].fertilizers
  };
}

// Display analysis results - This function is now in soil-advisor-ui.js
// Keeping this as fallback for compatibility
function displayAnalysisResults(result) {
  // Check if new UI exists
  const resultsSection = document.getElementById("resultsSection");
  if (resultsSection && typeof window.displayAnalysisResults !== 'undefined') {
    // Use new UI from soil-advisor-ui.js
    return;
  }
  
  // Fallback to old UI
  const aiResult = document.getElementById("aiResult");
  if (!aiResult) return;
  
  if (!result.success) {
    aiResult.innerHTML = `
      <div style="color: #D32F2F; padding: 1rem; background: #FFEBEE; border-radius: 8px;">
        <strong>❌ Error:</strong> ${result.error || 'Analysis failed'}
      </div>
    `;
    aiResult.style.display = "block";
    return;
  }

  aiResult.innerHTML = `
    <div style="background: linear-gradient(135deg, #E8F5E9, #C8E6C9); padding: 1.5rem; border-radius: 12px; border-left: 4px solid #2E7D32;">
      <h3 style="margin-top: 0; color: #1B5E20;">
        <i class="fas fa-check-circle"></i> Analysis Complete
      </h3>
      
      <div style="background: white; padding: 1rem; border-radius: 8px; margin: 1rem 0;">
        <h4 style="color: #2E7D32; margin-top: 0;">
          <i class="fas fa-layer-group"></i> Detected Soil Type
        </h4>
        <p style="font-size: 1.3rem; font-weight: bold; color: #1B5E20; margin: 0.5rem 0;">
          ${result.soil_type}
        </p>
        <p style="color: #666; margin: 0;">
          Confidence: <strong>${result.confidence}%</strong>
        </p>
        <p style="color: #555; font-style: italic; margin-top: 0.5rem;">
          ${result.description}
        </p>
      </div>

      <div style="background: white; padding: 1rem; border-radius: 8px; margin: 1rem 0;">
        <h4 style="color: #2E7D32; margin-top: 0;">
          <i class="fas fa-seedling"></i> Recommended Crops
        </h4>
        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
          ${result.crops.map(crop => `
            <span style="background: #E8F5E9; color: #2E7D32; padding: 0.4rem 0.8rem; border-radius: 20px; font-size: 0.9rem;">
              ${crop}
            </span>
          `).join('')}
        </div>
      </div>

      <div style="background: white; padding: 1rem; border-radius: 8px; margin: 1rem 0;">
        <h4 style="color: #2E7D32; margin-top: 0;">
          <i class="fas fa-flask"></i> Recommended Fertilizers
        </h4>
        <ul style="margin: 0; padding-left: 1.5rem; color: #555;">
          ${result.fertilizers.map(fert => `<li>${fert}</li>`).join('')}
        </ul>
      </div>

      <button onclick="resetAnalysis()" style="background: #2E7D32; color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 8px; cursor: pointer; margin-top: 1rem;">
        <i class="fas fa-redo"></i> Analyze Another Image
      </button>
    </div>
  `;
  
  aiResult.style.display = "block";
}

// Reset analysis
function resetAnalysis() {
  document.getElementById("imagePreview").style.display = "none";
  document.querySelector(".upload-placeholder").style.display = "block";
  document.getElementById("analyzeBtn").style.display = "none";
  document.getElementById("aiResult").style.display = "none";
  document.getElementById("soilImage").value = "";
  selectedFile = null;
}
