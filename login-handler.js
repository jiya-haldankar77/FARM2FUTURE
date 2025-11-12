// Login Handler
const API_URL = 'http://localhost:3000/api';

async function login() {
  const email = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  if (!email || !password) {
    showMessage('Please enter both email and password', 'error');
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      // Store user email in localStorage for checkout
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userName', data.farmer.name);
      
      showMessage('Login successful! Redirecting...', 'success');
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1000);
    } else {
      showMessage(data.error || 'Login failed. Please check your credentials.', 'error');
    }
  } catch (error) {
    console.error('Login error:', error);
    showMessage('Connection error. Please make sure the server is running.', 'error');
  }
}

function showMessage(message, type) {
  const logoutMsg = document.getElementById('logout-msg');
  logoutMsg.innerHTML = `
    <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> 
    ${message}
  `;
  logoutMsg.style.display = 'block';
  logoutMsg.style.background = type === 'success' ? '#e8f5e9' : '#ffebee';
  logoutMsg.style.color = type === 'success' ? '#2e7d32' : '#c62828';
  logoutMsg.style.padding = '12px';
  logoutMsg.style.borderRadius = '8px';
  logoutMsg.style.marginTop = '15px';
}

// Check for logout message
window.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('msg') === 'logout') {
    showMessage('You have been logged out successfully.', 'success');
  }
});
