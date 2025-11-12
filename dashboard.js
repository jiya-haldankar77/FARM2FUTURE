// API Base URL
const API_URL = 'http://localhost:3000/api';

// Check authentication on page load
document.addEventListener('DOMContentLoaded', async () => {
  await checkAuthentication();
  await loadActivities();
  await loadWeatherForecast();
  
  // Refresh activities every 30 seconds
  setInterval(loadActivities, 30000);
});

// Check if user is authenticated
async function checkAuthentication() {
  try {
    const response = await fetch(`${API_URL}/check-session`, {
      credentials: 'include'
    });
    const data = await response.json();
    
    if (!data.authenticated) {
      window.location.href = 'login.html';
      return;
    }
    
    // Update farmer name in UI
    if (data.farmerName) {
      document.getElementById('farmerName').textContent = data.farmerName;
      document.getElementById('welcomeName').textContent = data.farmerName;
    }
  } catch (error) {
    console.error('Authentication check failed:', error);
    window.location.href = 'login.html';
  }
}

// Logout function
async function logout() {
  try {
    await fetch(`${API_URL}/logout`, {
      method: 'POST',
      credentials: 'include'
    });
    window.location.href = 'login.html?msg=logout';
  } catch (error) {
    console.error('Logout failed:', error);
    window.location.href = 'login.html';
  }
}

// ============ ACTIVITIES ============

// Load recent activities
async function loadActivities() {
  const activityList = document.getElementById('activityList');
  
  try {
    const response = await fetch(`${API_URL}/activities`, {
      credentials: 'include'
    });
    
    if (!response.ok) throw new Error('Failed to fetch activities');
    
    const activities = await response.json();
    
    if (activities.length === 0) {
      activityList.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-inbox"></i>
          <p>No recent activities</p>
          <button class="btn-primary" onclick="seedDummyActivities()" style="max-width: 200px; margin: 10px auto;">
            Add Sample Data
          </button>
        </div>
      `;
      return;
    }
    
    activityList.innerHTML = activities.map(activity => {
      const icon = getActivityIcon(activity.activity_type);
      const timeAgo = getTimeAgo(new Date(activity.timestamp));
      
      return `
        <div class="activity-item">
          <div class="activity-icon ${activity.activity_type}">
            <i class="fas ${icon}"></i>
          </div>
          <div class="activity-details">
            <p>${activity.description}</p>
            <span class="time">${timeAgo}</span>
          </div>
          <button class="delete-activity-btn" onclick="deleteActivity(${activity.activity_id})" title="Delete activity">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `;
    }).join('');
  } catch (error) {
    console.error('Error loading activities:', error);
    activityList.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-exclamation-triangle"></i>
        <p>Failed to load activities</p>
      </div>
    `;
  }
}

// Get icon for activity type
function getActivityIcon(type) {
  const icons = {
    'irrigation': 'fa-tint',
    'crop_added': 'fa-seedling',
    'crop': 'fa-seedling',
    'weather': 'fa-cloud-rain',
    'rain': 'fa-cloud-rain',
    'soil': 'fa-mountain',
    'task_completed': 'fa-check-circle',
    'task': 'fa-tasks',
    'login': 'fa-sign-in-alt'
  };
  return icons[type] || 'fa-circle';
}

// Calculate time ago
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  
  if (seconds < 60) return `${seconds} sec ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hour${Math.floor(seconds / 3600) > 1 ? 's' : ''} ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} day${Math.floor(seconds / 86400) > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString();
}

// Refresh activities
async function refreshActivities() {
  const activityList = document.getElementById('activityList');
  activityList.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Refreshing...</div>';
  await loadActivities();
}

// Seed dummy activities for testing
async function seedDummyActivities() {
  try {
    const response = await fetch(`${API_URL}/seed-activities`, {
      method: 'POST',
      credentials: 'include'
    });
    
    if (response.ok) {
      await loadActivities();
      showNotification('Sample activities added!', 'success');
    }
  } catch (error) {
    console.error('Error seeding activities:', error);
    showNotification('Failed to add sample data', 'error');
  }
}

// Delete activity
async function deleteActivity(activityId) {
  if (!confirm('Are you sure you want to delete this activity?')) {
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/activities/${activityId}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    
    if (response.ok) {
      showNotification('Activity deleted successfully', 'success');
      await loadActivities();
    } else {
      const data = await response.json();
      showNotification(data.error || 'Failed to delete activity', 'error');
    }
  } catch (error) {
    console.error('Error deleting activity:', error);
    showNotification('Failed to delete activity', 'error');
  }
}

// ============ ADD CROP ============

function openAddCropModal() {
  document.getElementById('addCropModal').classList.add('active');
}

async function addCrop(event) {
  event.preventDefault();
  
  const cropName = document.getElementById('cropType').value; // Use selected crop from dropdown
  const cropData = {
    crop_name: cropName,
    crop_type: cropName, // Same as crop name for the 5 main crops
    sowing_date: document.getElementById('sowingDate').value,
    location: document.getElementById('location').value
  };
  
  try {
    const response = await fetch(`${API_URL}/crops`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(cropData)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      showNotification(`Crop "${cropData.crop_name}" added successfully!`, 'success');
      
      // Download PDF if generated
      if (result.pdfFile) {
        setTimeout(() => {
          const downloadLink = document.createElement('a');
          downloadLink.href = `${API_URL}/download-pdf/${result.pdfFile}`;
          downloadLink.download = result.pdfFile;
          downloadLink.click();
          showNotification(`📄 Farming guide PDF downloaded!`, 'success');
        }, 1000);
      }
      
      document.getElementById('addCropForm').reset();
      closeModal('addCropModal');
      await loadActivities(); // Refresh activities
    } else {
      showNotification(result.error || 'Failed to add crop', 'error');
    }
  } catch (error) {
    console.error('Error adding crop:', error);
    showNotification('Failed to add crop', 'error');
  }
}

// ============ VIEW CROPS ============

async function viewCrops() {
  openModal('viewCropsModal');
  await loadCrops();
}

async function loadCrops() {
  try {
    const response = await fetch(`${API_URL}/crops`, {
      credentials: 'include'
    });
    
    const crops = await response.json();
    const cropsList = document.getElementById('cropsList');
    
    if (crops.length === 0) {
      cropsList.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-seedling"></i>
          <p>No crops added yet</p>
        </div>
      `;
      return;
    }
    
    cropsList.innerHTML = crops.map(crop => `
      <div class="crop-item">
        <div class="crop-icon">
          <i class="fas fa-seedling"></i>
        </div>
        <div class="crop-details">
          <h4>${crop.crop_name}</h4>
          <p>Location: ${crop.location || 'Not specified'}</p>
          <p>Sowing Date: ${crop.sowing_date ? new Date(crop.sowing_date).toLocaleDateString() : 'Not specified'}</p>
        </div>
        <button class="delete-btn" onclick="deleteCrop(${crop.crop_id}, '${crop.crop_name}')" title="Delete crop">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading crops:', error);
  }
}

async function deleteCrop(cropId, cropName) {
  if (!confirm(`Are you sure you want to delete ${cropName}?`)) {
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/crops/${cropId}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    
    if (response.ok) {
      showNotification(`${cropName} deleted successfully`, 'success');
      await loadCrops();
      await loadActivities();
    } else {
      const data = await response.json();
      showNotification(data.error || 'Failed to delete crop', 'error');
    }
  } catch (error) {
    console.error('Error deleting crop:', error);
    showNotification('Failed to delete crop', 'error');
  }
}

// ============ TASKS ============

function openViewTasksModal() {
  document.getElementById('viewTasksModal').classList.add('active');
  loadTasks();
}

async function loadTasks() {
  const tasksList = document.getElementById('tasksList');
  
  try {
    const response = await fetch(`${API_URL}/tasks`, {
      credentials: 'include'
    });
    
    if (!response.ok) throw new Error('Failed to fetch tasks');
    
    const tasks = await response.json();
    
    if (tasks.length === 0) {
      tasksList.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-clipboard-list"></i>
          <p>No tasks yet. Add your first task below!</p>
        </div>
      `;
      return;
    }
    
    tasksList.innerHTML = tasks.map(task => `
      <div class="task-item ${task.status === 'Completed' ? 'completed' : ''}">
        <div>
          <strong>${task.task_name}</strong>
          ${task.due_date ? `<br><small>Due: ${new Date(task.due_date).toLocaleDateString()}</small>` : ''}
        </div>
        <div class="task-actions">
          ${task.status !== 'Completed' ? `
            <button class="btn-small btn-complete" onclick="updateTaskStatus(${task.task_id}, 'Completed')">
              <i class="fas fa-check"></i> Complete
            </button>
          ` : ''}
          <span class="badge ${task.status === 'Completed' ? 'success' : 'warning'}">
            ${task.status}
          </span>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading tasks:', error);
    tasksList.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>Failed to load tasks</p></div>';
  }
}

async function addTask(event) {
  event.preventDefault();
  
  const taskData = {
    task_name: document.getElementById('taskName').value,
    due_date: document.getElementById('dueDate').value
  };
  
  try {
    const response = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(taskData)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      showNotification('Task added successfully!', 'success');
      document.getElementById('addTaskForm').reset();
      await loadTasks();
    } else {
      showNotification(result.error || 'Failed to add task', 'error');
    }
  } catch (error) {
    console.error('Error adding task:', error);
    showNotification('Failed to add task', 'error');
  }
}

async function updateTaskStatus(taskId, status) {
  try {
    const response = await fetch(`${API_URL}/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status })
    });
    
    if (response.ok) {
      showNotification('Task updated!', 'success');
      await loadTasks();
      await loadActivities(); // Refresh activities
    }
  } catch (error) {
    console.error('Error updating task:', error);
    showNotification('Failed to update task', 'error');
  }
}

// ============ ANALYTICS ============

function openAnalyticsModal() {
  document.getElementById('analyticsModal').classList.add('active');
  loadAnalytics();
}

async function loadAnalytics() {
  try {
    const response = await fetch(`${API_URL}/analytics`, {
      credentials: 'include'
    });
    
    if (!response.ok) throw new Error('Failed to fetch analytics');
    
    const data = await response.json();
    
    // Create charts
    createSoilMoistureChart(data);
    createTemperatureChart(data);
    createRainfallChart(data);
  } catch (error) {
    console.error('Error loading analytics:', error);
  }
}

function createSoilMoistureChart(data) {
  const ctx = document.getElementById('soilMoistureChart');
  if (!ctx) return;
  
  // Simple bar chart using div elements (no external library needed)
  const values = data.map(d => parseInt(d.soil_moisture_level) || 0).reverse();
  const labels = data.map((d, i) => `Day ${i + 1}`).reverse();
  
  ctx.innerHTML = `
    <div style="display: flex; align-items: flex-end; justify-content: space-around; height: 200px; border-bottom: 2px solid #ddd;">
      ${values.map((val, i) => `
        <div style="text-align: center; flex: 1;">
          <div style="background: #4a7c2c; height: ${val * 2}px; margin: 0 5px; border-radius: 5px 5px 0 0;"></div>
          <small>${val}%</small>
        </div>
      `).join('')}
    </div>
  `;
}

function createTemperatureChart(data) {
  const ctx = document.getElementById('temperatureChart');
  if (!ctx) return;
  
  const values = data.map(d => parseFloat(d.temperature) || 0).reverse();
  
  ctx.innerHTML = `
    <div style="display: flex; align-items: flex-end; justify-content: space-around; height: 200px; border-bottom: 2px solid #ddd;">
      ${values.map((val, i) => `
        <div style="text-align: center; flex: 1;">
          <div style="background: #ff9800; height: ${val * 5}px; margin: 0 5px; border-radius: 5px 5px 0 0;"></div>
          <small>${val}°C</small>
        </div>
      `).join('')}
    </div>
  `;
}

function createRainfallChart(data) {
  const ctx = document.getElementById('rainfallChart');
  if (!ctx) return;
  
  const values = data.map(d => parseInt(d.rainfall_status) || 0).reverse();
  
  ctx.innerHTML = `
    <div style="display: flex; align-items: flex-end; justify-content: space-around; height: 200px; border-bottom: 2px solid #ddd;">
      ${values.map((val, i) => `
        <div style="text-align: center; flex: 1;">
          <div style="background: #2196f3; height: ${val * 3}px; margin: 0 5px; border-radius: 5px 5px 0 0;"></div>
          <small>${val}%</small>
        </div>
      `).join('')}
    </div>
  `;
}

// ============ CHATBOT ============

function openHelpModal() {
  document.getElementById('helpModal').classList.add('active');
}

function sendChatMessage() {
  const input = document.getElementById('chatInput');
  const message = input.value.trim();
  
  if (!message) return;
  
  // Add user message
  addChatMessage(message, 'user');
  input.value = '';
  
  // Simulate bot response
  setTimeout(() => {
    const response = getBotResponse(message);
    addChatMessage(response, 'bot');
  }, 500);
}

function addChatMessage(message, sender) {
  const chatMessages = document.getElementById('chatMessages');
  const messageDiv = document.createElement('div');
  messageDiv.className = `chat-message ${sender}`;
  messageDiv.innerHTML = `<p>${message}</p>`;
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function getBotResponse(message) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('irrigation') || lowerMessage.includes('water')) {
    return '💧 For optimal irrigation: Water early morning or evening. Check soil moisture before watering. Most crops need 1-2 inches of water per week.';
  }
  
  if (lowerMessage.includes('fertilizer') || lowerMessage.includes('nutrient')) {
    return '🌾 Fertilizer tips: Use NPK (Nitrogen-Phosphorus-Potassium) based on soil test. Apply during growing season. Organic options include compost and manure.';
  }
  
  if (lowerMessage.includes('pest') || lowerMessage.includes('insect')) {
    return '🐛 Pest control: Use integrated pest management (IPM). Try neem oil for organic control. Monitor regularly and remove affected plants quickly.';
  }
  
  if (lowerMessage.includes('weather') || lowerMessage.includes('rain')) {
    return '🌤️ Weather advice: Check forecast regularly. Protect crops before heavy rain. Adjust irrigation based on rainfall. Consider crop covers for extreme weather.';
  }
  
  if (lowerMessage.includes('crop') || lowerMessage.includes('plant')) {
    return '🌱 Crop management: Rotate crops annually. Choose varieties suited to your climate. Practice companion planting. Monitor growth stages regularly.';
  }
  
  return '🤔 I can help with irrigation, fertilizers, pest control, weather advice, and crop management. What would you like to know more about?';
}

// ============ MODAL FUNCTIONS ============

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
}

// Close modal when clicking outside
window.onclick = function(event) {
  if (event.target.classList.contains('modal')) {
    event.target.classList.remove('active');
  }
};

// ============ WEATHER FORECAST ============

function loadWeatherForecast() {
  const forecastData = [
    { day: 'Mon', icon: 'fa-sun', temp: '28°', rain: '10%' },
    { day: 'Tue', icon: 'fa-cloud-sun', temp: '26°', rain: '20%' },
    { day: 'Wed', icon: 'fa-cloud-rain', temp: '24°', rain: '70%' },
    { day: 'Thu', icon: 'fa-cloud-sun-rain', temp: '25°', rain: '40%' },
    { day: 'Fri', icon: 'fa-sun', temp: '27°', rain: '0%' }
  ];
  
  const forecastContainer = document.querySelector('.weather-forecast');
  if (forecastContainer) {
    forecastContainer.innerHTML = forecastData.map(day => `
      <div class="forecast-item">
        <span class="day">${day.day}</span>
        <i class="fas ${day.icon}"></i>
        <span class="temp">${day.temp}</span>
        <span class="rain">${day.rain}</span>
      </div>
    `).join('');
  }
}

// ============ NOTIFICATIONS ============

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Add animation styles
const style = document.createElement('style');
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
