function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (username === "admin" && password === "1234") {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("username", username);
        window.location.href = "dashboard.html";
    } else {
        alert("Invalid credentials!");
    }
}

function logout() {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("username");

    // Show message before redirect
    alert("Thanks for visiting!");
    window.location.href = "index.html";
}

// Protect dashboard page
window.onload = function() {
    if (window.location.pathname.includes("dashboard.html")) {
        if (localStorage.getItem("isLoggedIn") !== "true") {
            alert("Please login first!");
            window.location.href = "index.html";
        }
    }
}

const answers = {
  // 🌱 Crop & Soil
  fertilizer: "🌱 For rice, use NPK 10-26-26. For vegetables, try organic compost.",
  soil: "🧪 Soil testing can be done at Krishi Vigyan Kendra (KVK) or using soil testing kits.",
  soilhealth: "🌿 Add organic manure, rotate crops, and avoid excessive chemicals to improve soil health.",
  seeds: "🌾 Certified seeds are available from ICAR centers and agri-dealers.",
  hybridseeds: "🌱 Hybrid seeds are developed by crossing two varieties for better yield and resistance.",
  tips: "📈 Use good seeds, proper spacing, crop rotation, and timely irrigation for higher yield.",
  croprotation: "🔄 Planting different crops in sequence improves soil fertility and reduces pests.",
  intercropping: "🌽🌾 Intercropping means growing two or more crops together to maximize space and reduce risk.",
  covercrops: "🌱 Cover crops like clover or legumes protect soil and add fertility.",
  weeds: "🌿 Control weeds using mulching, timely weeding, or herbicides if needed.",

  // 💧 Water & Irrigation
  water: "💧 Drip irrigation saves up to 60% water compared to flood irrigation.",
  irrigation: "🚰 Irrigation methods include drip, sprinkler, canal, and furrow irrigation.",
  drip: "💦 Drip irrigation delivers water directly to plant roots, saving water and fertilizer.",
  sprinkler: "🌧️ Sprinkler irrigation sprays water like rainfall, useful for many crops.",
  rainwater: "☔ Rainwater can be harvested in ponds or tanks and reused for irrigation.",
  mulching: "🍂 Mulching with straw or plastic reduces evaporation and controls weeds.",
  precisionirrigation: "🎯 Precision irrigation uses sensors and automation for efficient water use.",
  drought: "🌵 Grow drought-tolerant crops like millets, pulses, or sorghum.",
  waterquality: "🔍 Water quality testing ensures salinity and pH are suitable for crops.",
  flood: "🌊 Drain excess water quickly and plant flood-resistant crops.",

  // 🐛 Pests & Diseases
  pest: "🐛 Use neem oil spray or pheromone traps as organic pest control.",
  organicpest: "🍃 Garlic-chili spray and neem oil are effective organic pest solutions.",
  neemoil: "🌿 Neem oil works as a natural insecticide and antifungal spray.",
  biocontrol: "🦋 Biological control uses natural predators like ladybugs or parasitoid wasps.",
  disease: "🦠 Disease-resistant seed varieties and crop rotation prevent diseases.",
  fungus: "🍄 Use fungicides or copper-based sprays to control fungal infections.",
  insects: "🐞 Light traps and sticky traps can reduce harmful insect populations.",
  rodents: "🐭 Use traps, fencing, and proper grain storage to stop rodents.",
  storagepests: "📦 Keep grains in airtight silos or bags with neem leaves to avoid storage pests.",
  ipm: "🧩 Integrated Pest Management (IPM) combines organic, chemical, and biological methods.",

  // ☀️ Weather & Climate
  weather: "☀️ Use IMD website or apps like Skymet to check weather.",
  climate: "🌍 Mixed cropping, drought-resistant seeds, and water harvesting help farmers adapt.",
  frost: "❄️ Use crop covers or sprinklers to protect from frost damage.",
  heatwave: "🔥 Provide shade nets and extra irrigation during heatwaves.",
  rainfall: "🌧️ Rainfall can be predicted using IMD forecasts or mobile apps.",
  monsoon: "☔ Prepare fields with drainage and sow monsoon crops like paddy or maize.",
  droughtcrops: "🌾 Millets, pulses, and castor are good drought-tolerant crops.",
  floodcrops: "🌿 Crops like jute, rice, and sugarcane can tolerate floods.",
  wind: "🍃 Plant windbreak trees or hedges to reduce wind damage.",
  climatecrops: "🌱 Climate-smart crops include millets, pulses, and short-duration rice varieties.",

  // 🛠️ Technology & Modern Farming
  technology: "🤖 Drones, mobile apps, and IoT sensors improve farming efficiency.",
  machines: "🚜 Small farmers can use seed drills, power tillers, and mini harvesters.",
  solar: "🔆 Solar pumps and dryers save energy and reduce cost.",
  drones: "🛩️ Drones are used for spraying pesticides and monitoring crop health.",
  sensors: "📡 Soil moisture and temperature sensors help in precision farming.",
  ai: "🤖 AI predicts crop diseases, weather, and market trends.",
  hydroponics: "💧 Hydroponics grows plants without soil using nutrient water.",
  aquaponics: "🐟🌱 Aquaponics combines fish farming with hydroponics for efficiency.",
  aquaculture: "🐟 Aquaculture is fish farming in ponds or tanks.",
  greenhouse: "🏡 Greenhouse farming protects crops and allows year-round production.",

  // 📈 Market, Finance & Govt
  market: "📊 You can check today’s crop prices at e-NAM portal or local mandi.",
  mandi: "🛒 Register at your local mandi or on e-NAM for better selling prices.",
  export: "🌍 Farmers can export crops via APEDA after registration.",
  loan: "🏦 Kisan Credit Card (KCC) provides easy loans for farmers.",
  insurance: "🌾 PM Fasal Bima Yojana covers crop losses due to natural calamities.",
  scheme: "📢 Govt schemes include PM-KISAN, Soil Health Card, and e-NAM market.",
  subsidy: "💰 Subsidies are available for seeds, fertilizers, solar pumps, and tractors.",
  training: "🎓 Training is available at KVKs and Agricultural Universities.",
  fpos: "👨‍👩‍👧‍👦 Farmer Producer Organizations help farmers sell in groups for better prices.",
  storage: "🏚 Use airtight silos or warehouses with fumigation for safe storage.",

  // 🌾 Other Farming Practices
  organicfarming: "🌱 Organic farming avoids chemicals and uses compost, biofertilizers, and crop rotation.",
  permaculture: "🌿 Permaculture designs farms that mimic natural ecosystems.",
  verticalfarming: "🏢 Vertical farming grows crops in stacked layers, often indoors.",
  mixedfarming: "🌾🐓 Mixed farming means growing crops and rearing animals together.",
  livestock: "🐄 Integrated livestock provides manure and income along with crops.",
  beekeeping: "🍯 Beekeeping increases pollination and gives honey as income.",
  fishfarming: "🐠 Fish farming is raising fish in ponds, cages, or tanks for income.",
  silkworm: "🧵 Sericulture is rearing silkworms to produce silk.",
  goatfarming: "🐐 Goat farming provides milk, meat, and manure with low investment.",
  poultry: "🐓 Poultry farming gives eggs and meat and is easy to start."
};



function askQuestion(type) {
  const chatbox = document.getElementById("chatbox");

  // User question
  const userMsg = document.createElement("div");
  userMsg.className = "user";
  userMsg.textContent = document.querySelector(`button[onclick="askQuestion('${type}')"]`).textContent;
  chatbox.appendChild(userMsg);

  // Bot answer
  const botMsg = document.createElement("div");
  botMsg.className = "bot";
  botMsg.textContent = answers[type] || "🤔 I don’t have an answer for that yet.";
  chatbox.appendChild(botMsg);

  // Scroll to bottom
  chatbox.scrollTop = chatbox.scrollHeight;
}
// Load existing cart from localStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];

const productCards = document.querySelectorAll('.product-card');

productCards.forEach(card => {
    // Button container
    const btnContainer = document.createElement('div');
    btnContainer.style.marginTop = '10px';
    btnContainer.style.textAlign = 'center';

    // Add to Cart button
    const cartBtn = document.createElement('button');
    cartBtn.textContent = '🛒 Add to Cart';
    cartBtn.style.padding = '8px 12px';
    cartBtn.style.border = 'none';
    cartBtn.style.background = '#2e7d32';
    cartBtn.style.color = 'white';
    cartBtn.style.borderRadius = '5px';
    cartBtn.style.cursor = 'pointer';
    cartBtn.style.fontWeight = 'bold';

    btnContainer.appendChild(cartBtn);
    card.appendChild(btnContainer);

    // Add to Cart functionality
    cartBtn.addEventListener('click', () => {
        const productName = card.querySelector('h3').textContent;
        const productPrice = card.querySelector('p').textContent.match(/₹[\d,]+/)[0];

        // Check if product already in cart
        const existing = cart.find(item => item.name === productName);
        if(existing){
            existing.quantity += 1;
        } else {
            cart.push({ name: productName, price: productPrice, quantity: 1 });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        alert(`${productName} added to cart! 🛒`);
    });
});
const govCard = document.getElementById("gov-card");
if (govCard) {
  govCard.addEventListener("click", () => {
    window.location.href = "gov.html";  
  });
}


// State to top 3 crops mapping
const stateCrops = {
  "Andhra Pradesh": ["Rice", "Groundnut", "Cotton"],
  "Arunachal Pradesh": ["Maize", "Rice", "Millet"],
  "Assam": ["Rice", "Tea", "Jute"],
  "Bihar": ["Rice", "Wheat", "Maize"],
  "Chhattisgarh": ["Rice", "Maize", "Sugarcane"],
  "Goa": ["Rice", "Coconut", "Cashew"],
  "Gujarat": ["Groundnut", "Cotton", "Wheat"],
  "Haryana": ["Wheat", "Rice", "Sugarcane"],
  "Himachal Pradesh": ["Maize", "Wheat", "Apple"],
  "Jharkhand": ["Rice", "Maize", "Wheat"],
  "Karnataka": ["Rice", "Sugarcane", "Cotton"],
  "Kerala": ["Rice", "Coconut", "Rubber"],
  "Madhya Pradesh": ["Wheat", "Soybean", "Rice"],
  "Maharashtra": ["Sugarcane", "Cotton", "Soybean"],
  "Manipur": ["Rice", "Maize", "Sugarcane"],
  "Meghalaya": ["Rice", "Potato", "Maize"],
  "Mizoram": ["Rice", "Maize", "Potato"],
  "Nagaland": ["Rice", "Maize", "Millet"],
  "Odisha": ["Rice", "Sugarcane", "Groundnut"],
  "Punjab": ["Wheat", "Rice", "Cotton"],
  "Rajasthan": ["Wheat", "Bajra", "Mustard"],
  "Sikkim": ["Rice", "Maize", "Potato"],
  "Tamil Nadu": ["Rice", "Banana", "Groundnut"],
  "Telangana": ["Rice", "Cotton", "Maize"],
  "Tripura": ["Rice", "Sugarcane", "Maize"],
  "Uttar Pradesh": ["Wheat", "Rice", "Sugarcane"],
  "Uttarakhand": ["Rice", "Wheat", "Maize"],
  "West Bengal": ["Rice", "Potato", "Jute"]
};

document.addEventListener("DOMContentLoaded", () => {

  // --- Populate State & Crop dropdowns only if they exist ---
  const stateSelect = document.getElementById("state");
  const cropSelect = document.getElementById("crop");
  if (stateSelect && cropSelect) {
    Object.keys(stateCrops).forEach(state => {
      const option = document.createElement("option");
      option.value = state;
      option.textContent = state;
      stateSelect.appendChild(option);
    });

    stateSelect.addEventListener("change", () => {
      const selectedState = stateSelect.value;
      cropSelect.innerHTML = '<option value="">Select a Crop</option>';
      if (selectedState && stateCrops[selectedState]) {
        stateCrops[selectedState].forEach(crop => {
          const option = document.createElement("option");
          option.value = crop.toLowerCase();
          option.textContent = crop;
          cropSelect.appendChild(option);
        });
      }
    });
  }

  // --- Setup dashboard card navigation ---
  const cards = [
    { id: "water-card", url: "water.html" },
    { id: "gov-card", url: "gov.html" },
    { id: "weather-card", url: "weather.html" },
    { id: "soil-card", url: "soil.html" }
  ];

  cards.forEach(card => {
    const element = document.getElementById(card.id);
    if (element) {
      element.style.cursor = "pointer";
      element.addEventListener("click", () => {
        window.location.href = card.url;
      });
    }
  });
});

// Logout function
function logout() {
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("username");
  alert("✨ Thanks for visiting! ✨");
  window.location.href = "login.html";
}
