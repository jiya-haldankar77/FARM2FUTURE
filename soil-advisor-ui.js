/* ============================================
   SOIL HEALTH ADVISOR - UI INTERACTIONS
   ============================================ */

// Toggle between AI and Manual mode
function toggleManualMode() {
  const uploadSection = document.getElementById('uploadSection');
  const manualSection = document.getElementById('manualSection');
  
  if (manualSection.style.display === 'none') {
    uploadSection.style.display = 'none';
    manualSection.style.display = 'block';
    manualSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    manualSection.style.display = 'none';
    uploadSection.style.display = 'block';
    uploadSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// Enhanced image preview with animation
function onImageSelected(event) {
  const file = event.target.files[0];
  if (file) {
    selectedFile = file;
    const reader = new FileReader();
    reader.onload = e => {
      const img = document.getElementById("imagePreview");
      const placeholder = document.getElementById("uploadPlaceholder");
      const analyzeBtn = document.getElementById("analyzeBtn");
      
      img.src = e.target.result;
      img.style.display = "block";
      placeholder.style.display = "none";
      analyzeBtn.style.display = "flex";
      
      // Smooth scroll to analyze button
      setTimeout(() => {
        analyzeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 300);
    };
    reader.readAsDataURL(file);
  }
}

// Enhanced loading state
function showLoading() {
  const loadingSpinner = document.getElementById("loadingSpinner");
  const analyzeBtn = document.getElementById("analyzeBtn");
  
  loadingSpinner.style.display = "block";
  analyzeBtn.style.display = "none";
}

function hideLoading() {
  const loadingSpinner = document.getElementById("loadingSpinner");
  document.getElementById("loadingSpinner").style.display = "none";
}

// Enhanced results display with modern cards
function displayAnalysisResults(result) {
  const resultsSection = document.getElementById("resultsSection");
  
  // Store result globally for PDF generation
  if (result.success) {
    latestAnalysisResult = result;
  }
  
  if (!result.success) {
    resultsSection.innerHTML = `
      <div class="result-card" style="border-left-color: var(--error-red);">
        <div class="card-header">
          <div class="card-icon" style="background: var(--error-red);">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <h3>Analysis Failed</h3>
        </div>
        <p style="color: var(--text-medium);">${result.error || 'Unable to analyze the image. Please try again.'}</p>
      </div>
    `;
    resultsSection.style.display = "block";
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }

  // Create stunning results display
  resultsSection.innerHTML = `
    <!-- Success Banner -->
    <div class="results-banner">
      <i class="fas fa-check-circle"></i>
      <h2>Analysis Complete!</h2>
      <p>Your Soil Health Report is Ready</p>
    </div>

    <!-- Results Grid -->
    <div class="results-grid">
      
      <!-- Soil Type Card -->
      <div class="result-card soil-type-card">
        <div class="card-header">
          <div class="card-icon">
            <i class="fas fa-layer-group"></i>
          </div>
          <h3>Detected Soil Type</h3>
        </div>
        <div class="soil-type-result">
          <div class="soil-type-name">${result.soil_type}</div>
          <div class="confidence-bar">
            <div class="confidence-label">
              <span>Confidence Level</span>
              <span><strong>${result.confidence}%</strong></span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${result.confidence}%"></div>
            </div>
          </div>
          <p class="soil-description">${result.description}</p>
        </div>
      </div>

      <!-- Recommended Crops Card -->
      <div class="result-card crops-card">
        <div class="card-header">
          <div class="card-icon">
            <i class="fas fa-seedling"></i>
          </div>
          <h3>Recommended Crops</h3>
        </div>
        <div class="crop-tags">
          ${result.crops.map(crop => `
            <div class="crop-tag">
              <i class="fas fa-leaf"></i>
              <span>${crop}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Recommended Fertilizers Card -->
      <div class="result-card fertilizers-card">
        <div class="card-header">
          <div class="card-icon">
            <i class="fas fa-flask"></i>
          </div>
          <h3>Essential Amendments</h3>
        </div>
        <ul class="fertilizer-list">
          ${result.fertilizers.map((fert, index) => `
            <li class="fertilizer-item">
              <div class="fertilizer-icon">
                <i class="fas fa-vial"></i>
              </div>
              <span class="fertilizer-name">${fert}</span>
            </li>
          `).join('')}
        </ul>
      </div>

    </div>

    <!-- Action Buttons -->
    <div class="results-actions">
      <button onclick="resetAnalysis()" class="btn-primary">
        <i class="fas fa-redo"></i>
        <span>Analyze Another Sample</span>
      </button>
      <button onclick="downloadReport()" class="btn-secondary">
        <i class="fas fa-download"></i>
        <span>Download Report</span>
      </button>
    </div>
  `;
  
  resultsSection.style.display = "block";
  
  // Smooth scroll to results
  setTimeout(() => {
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
  
  // Animate progress bar
  setTimeout(() => {
    const progressFill = document.querySelector('.progress-fill');
    if (progressFill) {
      progressFill.style.width = '0%';
      setTimeout(() => {
        progressFill.style.width = `${result.confidence}%`;
      }, 100);
    }
  }, 300);
}

// Reset analysis to initial state
function resetAnalysis() {
  const imagePreview = document.getElementById("imagePreview");
  const placeholder = document.getElementById("uploadPlaceholder");
  const analyzeBtn = document.getElementById("analyzeBtn");
  const resultsSection = document.getElementById("resultsSection");
  const soilImage = document.getElementById("soilImage");
  
  imagePreview.style.display = "none";
  placeholder.style.display = "block";
  analyzeBtn.style.display = "none";
  resultsSection.style.display = "none";
  soilImage.value = "";
  selectedFile = null;
  
  // Scroll back to upload section
  document.getElementById("uploadSection").scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Global variable to store latest analysis result
let latestAnalysisResult = null;

// Download report functionality with PDF generation
function downloadReport() {
  if (!latestAnalysisResult) {
    alert('No analysis data available. Please analyze a soil sample first.');
    return;
  }
  
  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Colors
    const primaryGreen = [34, 139, 34];
    const terracotta = [184, 92, 56];
    const gold = [255, 215, 0];
    const darkText = [44, 62, 80];
    const lightGray = [245, 245, 245];
    
    // Page setup
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yPos = margin;
    
    // Header with gradient effect (simulated with rectangles)
    doc.setFillColor(...primaryGreen);
    doc.rect(0, 0, pageWidth, 45, 'F');
    
    // Logo/Icon (simplified circle with leaf symbol)
    doc.setFillColor(255, 255, 255);
    doc.circle(25, 22, 10, 'F');
    doc.setFillColor(...primaryGreen);
    doc.setFontSize(14);
    doc.text('F2F', 17, 26);
    
    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont(undefined, 'bold');
    doc.text('Soil Health Analysis Report', 45, 20);
    
    // Subtitle - FARM2FUTURE
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text('FARM2FUTURE - AI-Powered Soil Analysis', 45, 30);
    
    yPos = 55;
    
    // Date and time
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(...darkText);
    const currentDate = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.text(`Generated: ${currentDate}`, margin, yPos);
    yPos += 15;
    
    // Divider line
    doc.setDrawColor(...primaryGreen);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;
    
    // Section 1: Detected Soil Type
    doc.setFillColor(...terracotta);
    doc.rect(margin, yPos, 5, 8, 'F');
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...terracotta);
    doc.text('Detected Soil Type', margin + 8, yPos + 6);
    yPos += 15;
    
    // Soil type name
    doc.setFontSize(20);
    doc.setTextColor(...darkText);
    doc.text(latestAnalysisResult.soil_type, margin, yPos);
    yPos += 10;
    
    // Confidence
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Confidence: ${latestAnalysisResult.confidence}%`, margin, yPos);
    yPos += 5;
    
    // Confidence bar
    const barWidth = 100;
    const barHeight = 6;
    doc.setFillColor(...lightGray);
    doc.rect(margin, yPos, barWidth, barHeight, 'F');
    doc.setFillColor(...primaryGreen);
    doc.rect(margin, yPos, (barWidth * latestAnalysisResult.confidence / 100), barHeight, 'F');
    yPos += 12;
    
    // Description
    doc.setFontSize(10);
    doc.setFont(undefined, 'italic');
    const descLines = doc.splitTextToSize(latestAnalysisResult.description, pageWidth - 2 * margin);
    doc.text(descLines, margin, yPos);
    yPos += descLines.length * 5 + 10;
    
    // Section 2: Recommended Crops
    doc.setFillColor(...primaryGreen);
    doc.rect(margin, yPos, 5, 8, 'F');
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...primaryGreen);
    doc.text('Recommended Crops', margin + 8, yPos + 6);
    yPos += 15;
    
    // Crops list
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(...darkText);
    
    const cropsPerRow = 3;
    const cropBoxWidth = (pageWidth - 2 * margin - 10) / cropsPerRow;
    let cropX = margin;
    let cropY = yPos;
    
    latestAnalysisResult.crops.forEach((crop, index) => {
      if (index > 0 && index % cropsPerRow === 0) {
        cropY += 12;
        cropX = margin;
      }
      
      // Crop box
      doc.setFillColor(232, 245, 233);
      doc.roundedRect(cropX, cropY, cropBoxWidth - 5, 10, 2, 2, 'F');
      
      // Add small green circle as bullet
      doc.setFillColor(...primaryGreen);
      doc.circle(cropX + 4, cropY + 5, 1.5, 'F');
      
      // Crop name
      doc.setTextColor(...primaryGreen);
      doc.setFontSize(10);
      doc.text(crop, cropX + 8, cropY + 7);
      
      cropX += cropBoxWidth;
    });
    
    yPos = cropY + 20;
    
    // Section 3: Essential Amendments (Fertilizers)
    if (yPos > pageHeight - 80) {
      doc.addPage();
      yPos = margin;
    }
    
    doc.setFillColor(...gold);
    doc.rect(margin, yPos, 5, 8, 'F');
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(184, 134, 11);
    doc.text('Essential Amendments', margin + 8, yPos + 6);
    yPos += 15;
    
    // Fertilizers list
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(...darkText);
    
    latestAnalysisResult.fertilizers.forEach((fertilizer, index) => {
      // Bullet point
      doc.setFillColor(...gold);
      doc.circle(margin + 2, yPos - 2, 1.5, 'F');
      doc.text(fertilizer, margin + 8, yPos);
      yPos += 8;
    });
    
    yPos += 10;
    
    // Recommendations section
    if (yPos > pageHeight - 80) {
      doc.addPage();
      yPos = margin;
    }
    
    doc.setDrawColor(...primaryGreen);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...darkText);
    doc.text('General Recommendations', margin, yPos);
    yPos += 10;
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    const recommendations = [
      '• Test soil pH regularly to maintain optimal growing conditions',
      '• Apply fertilizers according to crop requirements and soil test results',
      '• Practice crop rotation to maintain soil health and prevent nutrient depletion',
      '• Add organic matter to improve soil structure and water retention',
      '• Monitor soil moisture levels and adjust irrigation accordingly'
    ];
    
    recommendations.forEach(rec => {
      // Check if we need a new page
      if (yPos > pageHeight - 40) {
        doc.addPage();
        yPos = margin;
      }
      
      const recLines = doc.splitTextToSize(rec, pageWidth - 2 * margin);
      doc.text(recLines, margin, yPos);
      yPos += recLines.length * 5 + 3;
    });
    
    // Ensure enough space before footer
    if (yPos > pageHeight - 30) {
      doc.addPage();
      yPos = margin;
    }
    
    // Footer
    const footerY = pageHeight - 15;
    doc.setDrawColor(...lightGray);
    doc.line(margin, footerY - 8, pageWidth - margin, footerY - 8);
    
    // Footer text
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.setFont(undefined, 'normal');
    doc.text('FARM2FUTURE', margin, footerY);
    
    doc.setFont(undefined, 'italic');
    doc.setTextColor(150, 150, 150);
    doc.text('Powered by AI & Machine Learning', pageWidth / 2, footerY, { align: 'center' });
    
    doc.setFont(undefined, 'normal');
    doc.text(`Page 1 of ${doc.internal.pages.length - 1}`, pageWidth - margin, footerY, { align: 'right' });
    
    // Save the PDF
    const fileName = `Soil_Analysis_Report_${latestAnalysisResult.soil_type.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`;
    doc.save(fileName);
    
    // Show success message
    showNotification('PDF report downloaded successfully!', 'success');
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Error generating PDF report. Please try again.');
  }
}

// Show notification (helper function)
function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#27AE60' : '#3498DB'};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  notification.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
    <span style="margin-left: 0.5rem;">${message}</span>
  `;
  
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
  
  // Add animations
  if (!document.getElementById('notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
}

// Enhanced analyze image function
async function analyzeImage() {
  const fileInput = document.getElementById("soilImage");
  if (!fileInput.files.length) {
    alert("Please upload a soil photo first.");
    return;
  }

  showLoading();
  const resultsSection = document.getElementById("resultsSection");
  resultsSection.style.display = "none";

  try {
    const formData = new FormData();
    formData.append('image', selectedFile);

    const useMockAPI = false; // Set to true for testing without backend
    
    let result;
    if (useMockAPI) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      result = await getMockAnalysis();
    } else {
      const response = await fetch('http://localhost:5001/api/analyze-soil', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      result = await response.json();
    }

    displayAnalysisResults(result);
    
  } catch (error) {
    console.error('Error analyzing image:', error);
    displayAnalysisResults({
      success: false,
      error: error.message || 'Failed to analyze image. Please ensure the API server is running and try again.'
    });
  } finally {
    hideLoading();
  }
}

// Drag and drop functionality
const uploadZone = document.getElementById('uploadZone');

if (uploadZone) {
  uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.style.borderColor = 'var(--primary-green)';
    uploadZone.style.background = 'rgba(34, 139, 34, 0.05)';
  });

  uploadZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    uploadZone.style.borderColor = '';
    uploadZone.style.background = '';
  });

  uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.style.borderColor = '';
    uploadZone.style.background = '';
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const fileInput = document.getElementById('soilImage');
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInput.files = dataTransfer.files;
        
        // Trigger the change event
        const event = new Event('change', { bubbles: true });
        fileInput.dispatchEvent(event);
      } else {
        alert('Please upload an image file (JPG, PNG, JPEG)');
      }
    }
  });
}

// Smooth scroll for all internal links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

console.log('✅ Soil Health Advisor UI loaded successfully!');
