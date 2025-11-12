function goBack() {
  window.location.href = "dashboard.html";
}

// --- State → Crop mapping for all States + UTs ---
const cropData = {
  "Andhra Pradesh":["Rice","Maize","Groundnut"],
  "Arunachal Pradesh":["Rice","Maize","Millet"],
  "Assam":["Rice","Tea","Jute"],
  "Bihar":["Rice","Wheat","Maize"],
  "Chhattisgarh":["Rice","Maize","Sugarcane"],
  "Goa":["Rice","Coconut","Vegetables"],
  "Gujarat":["Cotton","Groundnut","Millet"],
  "Haryana":["Wheat","Rice","Sugarcane"],
  "Himachal Pradesh":["Apple","Wheat","Maize"],
  "Jharkhand":["Rice","Maize","Millet"],
  "Karnataka":["Cotton","Maize","Groundnut","Ragi"],
  "Kerala":["Rice","Coconut","Vegetables"],
  "Madhya Pradesh":["Soybean","Cotton","Wheat","Rice","Maize"],
  "Maharashtra":["Cotton","Soybean","Tur","Rice","Cashew","Ragi"],
  "Manipur":["Rice","Maize","Millet"],
  "Meghalaya":["Rice","Maize","Pulses"],
  "Mizoram":["Rice","Maize","Millet"],
  "Nagaland":["Rice","Maize","Millets"],
  "Odisha":["Rice","Maize","Pulses"],
  "Punjab":["Wheat","Rice","Sugarcane"],
  "Rajasthan":["Millet","Wheat","Barley"],
  "Sikkim":["Cardamom","Rice","Maize"],
  "Tamil Nadu":["Millets","Groundnut","Pulses","Cotton","Maize","Sugarcane"],
  "Telangana":["Cotton","Maize","Soybean"],
  "Tripura":["Rice","Maize","Vegetables"],
  "Uttar Pradesh":["Wheat","Rice","Sugarcane"],
  "Uttarakhand":["Rice","Wheat","Maize"],
  "West Bengal":["Rice","Jute","Sugarcane"],
  "Andaman and Nicobar Islands":["Coconut","Vegetables"],
  "Chandigarh":["Wheat","Vegetables"],
  "Dadra and Nagar Haveli":["Rice","Vegetables"],
  "Daman and Diu":["Rice","Vegetables"],
  "Delhi":["Wheat","Rice","Vegetables"],
  "Jammu and Kashmir":["Apple","Rice","Wheat"],
  "Ladakh":["Barley","Wheat"],
  "Lakshadweep":["Coconut","Vegetables"],
  "Puducherry":["Rice","Vegetables"]
};

// --- State → Representative city for weather API ---
const stateCity = {
  "Andhra Pradesh":"Vijayawada",
  "Arunachal Pradesh":"Itanagar",
  "Assam":"Guwahati",
  "Bihar":"Patna",
  "Chhattisgarh":"Raipur",
  "Goa":"Panaji",
  "Gujarat":"Ahmedabad",
  "Haryana":"Chandigarh",
  "Himachal Pradesh":"Shimla",
  "Jharkhand":"Ranchi",
  "Karnataka":"Bengaluru",
  "Kerala":"Thiruvananthapuram",
  "Madhya Pradesh":"Bhopal",
  "Maharashtra":"Mumbai",
  "Manipur":"Imphal",
  "Meghalaya":"Shillong",
  "Mizoram":"Aizawl",
  "Nagaland":"Kohima",
  "Odisha":"Bhubaneswar",
  "Punjab":"Ludhiana",
  "Rajasthan":"Jaipur",
  "Sikkim":"Gangtok",
  "Tamil Nadu":"Chennai",
  "Telangana":"Hyderabad",
  "Tripura":"Agartala",
  "Uttar Pradesh":"Lucknow",
  "Uttarakhand":"Dehradun",
  "West Bengal":"Kolkata",
  "Andaman and Nicobar Islands":"Port Blair",
  "Chandigarh":"Chandigarh",
  "Dadra and Nagar Haveli":"Silvassa",
  "Daman and Diu":"Daman",
  "Delhi":"New Delhi",
  "Jammu and Kashmir":"Srinagar",
  "Ladakh":"Leh",
  "Lakshadweep":"Kavaratti",
  "Puducherry":"Puducherry"
};

// --- Populate state dropdown ---
const stateSelect = document.getElementById("state");
Object.keys(cropData).forEach(state=>{
  const opt = document.createElement("option");
  opt.value = state;
  opt.textContent = state;
  stateSelect.appendChild(opt);
});

// --- Populate crop dropdown based on selected state ---
function loadCrops() {
  const state = document.getElementById("state").value;
  const cropSelect = document.getElementById("crop");
  cropSelect.innerHTML = '<option value="">-- Select Crop --</option>';
  if(cropData[state]){
    cropData[state].forEach(crop=>{
      const opt = document.createElement("option");
      opt.value = crop;
      opt.textContent = crop;
      cropSelect.appendChild(opt);
    });
  }
}

// --- Get weather + crop advice ---
async function getSmartWeather(){
  const state = document.getElementById("state").value;
  const crop = document.getElementById("crop").value;
  if(!state || !crop){
    alert("Select both state and crop!");
    return;
  }

  const city = stateCity[state];
  const apiKey = "86c0c5a3ed00d3f56c250dccd3f0baac";
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

  try{
    const res = await fetch(url);
    if(!res.ok) throw new Error("Weather data not found");

    const data = await res.json();
    const temp = data.main.temp;
    const humidity = data.main.humidity;
    const desc = data.weather[0].description;
    const feelsLike = data.main.feels_like;
    const windSpeed = data.wind.speed;

    // Display weather data in beautiful cards
    const weatherInfoGrid = document.getElementById("weatherInfoGrid");
    weatherInfoGrid.innerHTML = `
      <div class="weather-info-item">
        <i class="fas fa-thermometer-half" style="color: #f44336;"></i>
        <span class="value">${temp.toFixed(1)}°C</span>
        <span class="label">Temperature</span>
      </div>
      <div class="weather-info-item">
        <i class="fas fa-tint" style="color: #2196f3;"></i>
        <span class="value">${humidity}%</span>
        <span class="label">Humidity</span>
      </div>
      <div class="weather-info-item">
        <i class="fas fa-wind" style="color: #00bcd4;"></i>
        <span class="value">${windSpeed.toFixed(1)} m/s</span>
        <span class="label">Wind Speed</span>
      </div>
      <div class="weather-info-item">
        <i class="fas fa-cloud" style="color: #9e9e9e;"></i>
        <span class="value" style="font-size: 16px; text-transform: capitalize;">${desc}</span>
        <span class="label">Condition</span>
      </div>
    `;

    // --- Simple crop-weather advice ---
    let advice = "";
    if(temp < 20) advice += `❄️ Cold weather detected. Consider protecting ${crop} with covers or mulching. `;
    if(temp > 35) advice += `🔥 High temperature may stress ${crop}. Ensure adequate irrigation and shade if possible. `;
    if(humidity>80) advice += `💦 High humidity detected. Watch for fungal diseases and ensure good air circulation. `;
    if(desc.includes("rain")) advice += `🌧️ Rain is expected. Adjust irrigation schedule and check drainage systems. `;
    if(windSpeed > 10) advice += `💨 Strong winds detected. Secure tall crops and check for damage. `;
    if(advice==="") advice = `✅ Weather conditions are favorable for ${crop} cultivation today. Continue with regular farming activities.`;

    document.getElementById("advice").textContent = advice;
    document.getElementById("weatherResult").style.display="block";

  } catch(err){
    alert(err.message);
  }
}
