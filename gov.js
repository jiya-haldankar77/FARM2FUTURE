// Example scheme database for matching
const schemes = [
  {
    name: "PM-Kisan Samman Nidhi",
    eligibility: { maxLandSize: 2, farmerType: ["Marginal/Small"] },
    benefit: "₹6,000/year direct income support",
    documents: ["Aadhaar", "Land Record", "Bank Passbook"],
    deadline: "Ongoing"
  },
  {
    name: "Pradhan Mantri Fasal Bima Yojana",
    eligibility: { maxLandSize: 10, farmerType: ["General", "SC/ST", "Women", "Marginal/Small"] },
    benefit: "Crop insurance against natural calamities",
    documents: ["Crop Details", "Aadhaar", "Bank Account"],
    deadline: "Ongoing"
  },
  {
    name: "Kisan Credit Card (KCC)",
    eligibility: { maxLandSize: 20, farmerType: ["General", "SC/ST", "Women", "Marginal/Small"] },
    benefit: "Credit facility at low interest rates",
    documents: ["Land Record", "Aadhaar", "Bank Passbook"],
    deadline: "Ongoing"
  }
];

// Handle form submission
document.getElementById("farmer-profile")?.addEventListener("submit", function (e) {
  e.preventDefault();

  const farmer = {
    state: document.getElementById("state").value,
    district: document.getElementById("district").value,
    landSize: parseFloat(document.getElementById("land-size").value),
    crop: document.getElementById("crop").value,
    irrigation: document.getElementById("irrigation").value,
    farmerType: document.getElementById("farmer-type").value,
    goal: document.getElementById("goal").value,
  };

  const matched = matchSchemes(farmer, schemes);
  displaySchemes(matched);
});

// Match schemes based on eligibility
function matchSchemes(farmer, schemes) {
  return schemes.filter(scheme => {
    const landOk = farmer.landSize <= scheme.eligibility.maxLandSize;
    const typeOk = scheme.eligibility.farmerType.includes(farmer.farmerType);
    return landOk && typeOk;
  });
}

// Display matched schemes
function displaySchemes(matched) {
  const container = document.getElementById("scheme-results");
  container.innerHTML = "";

  if (matched.length === 0) {
    container.innerHTML = "<p>No schemes found for your profile. ❌</p>";
    return;
  }

  matched.forEach(scheme => {
    const card = document.createElement("div");
    card.className = "scheme-card";
    card.innerHTML = `
      <h3>${scheme.name}</h3>
      <p>✔️ Eligible for your profile</p>
      <p>💰 Benefit: ${scheme.benefit}</p>
      <p>📄 Documents: ${scheme.documents.join(", ")}</p>
      <p>📆 Deadline: ${scheme.deadline}</p>
      <button onclick="alert('Redirecting to application portal...')">Apply</button>
    `;
    container.appendChild(card);
  });
}
