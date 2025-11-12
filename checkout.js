// Load cart from localStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let selectedPaymentMethod = null;
let orderData = {};

// Function to render cart items
function renderCart() {
    const cartItems = document.getElementById('cartItems');
    const cartSummary = document.getElementById('cartSummary');
    
    if(cart.length === 0){
        cartItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <h3>Your cart is empty</h3>
                <p>Add some products to get started!</p>
                <a href="market.html" style="display:inline-block; margin-top:20px; padding:12px 24px; background:#2e7d32; color:white; text-decoration:none; border-radius:8px;">Go to Marketplace</a>
            </div>
        `;
        cartSummary.style.display = 'none';
        return;
    }

    cartSummary.style.display = 'block';
    let subtotal = 0;

    cartItems.innerHTML = cart.map((item, index) => {
        const price = parseFloat(item.price.replace(/\D/g, ''));
        subtotal += price * item.quantity;
        
        return `
            <div class="cart-item">
                <div class="item-details">
                    <h3>${item.name}</h3>
                    <p>Price: ₹${price}</p>
                </div>
                <div class="item-price">₹${price * item.quantity}</div>
                <div class="item-quantity">
                    <button class="qty-btn" onclick="updateQuantity(${index}, -1)">-</button>
                    <span style="font-weight:600; min-width:30px; text-align:center;">${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQuantity(${index}, 1)">+</button>
                </div>
                <button class="remove-btn" onclick="removeItem(${index})">
                    <i class="fas fa-trash"></i> Remove
                </button>
            </div>
        `;
    }).join('');

    const delivery = 50;
    const total = subtotal + delivery;

    document.getElementById('subtotal').textContent = subtotal;
    document.getElementById('delivery').textContent = delivery;
    document.getElementById('total').textContent = total;
}

function updateQuantity(index, change) {
    cart[index].quantity += change;
    if(cart[index].quantity < 1) cart[index].quantity = 1;
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
}

function removeItem(index) {
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
}

function openDeliveryModal() {
    // Set minimum date (3 days from now)
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 3);
    
    // Set maximum date (7 days from now)
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 7);
    
    const dateInput = document.getElementById('deliveryDateInput');
    dateInput.min = minDate.toISOString().split('T')[0];
    dateInput.max = maxDate.toISOString().split('T')[0];
    dateInput.value = minDate.toISOString().split('T')[0]; // Default to 3 days
    
    // Pre-fill customer name if logged in
    const userName = localStorage.getItem('userName');
    if (userName) {
        document.getElementById('customerName').value = userName;
    }
    
    document.getElementById('deliveryModal').classList.add('active');
}

function closeDeliveryModal() {
    document.getElementById('deliveryModal').classList.remove('active');
}

function proceedToPayment() {
    const customerName = document.getElementById('customerName').value.trim();
    const customerPhone = document.getElementById('customerPhone').value.trim();
    const deliveryDate = document.getElementById('deliveryDateInput').value;
    const deliveryAddress = document.getElementById('deliveryAddress').value.trim();
    
    if (!customerName) {
        alert('Please enter your full name');
        return;
    }
    
    if (!customerPhone) {
        alert('Please enter your phone number');
        return;
    }
    
    if (customerPhone.length < 10) {
        alert('Please enter a valid phone number');
        return;
    }
    
    if (!deliveryDate) {
        alert('Please select a delivery date');
        return;
    }
    
    if (!deliveryAddress) {
        alert('Please enter your delivery address');
        return;
    }
    
    // Store delivery info temporarily
    localStorage.setItem('tempCustomerName', customerName);
    localStorage.setItem('tempCustomerPhone', customerPhone);
    localStorage.setItem('tempDeliveryDate', deliveryDate);
    localStorage.setItem('tempDeliveryAddress', deliveryAddress);
    
    // Close delivery modal and open payment modal
    document.getElementById('deliveryModal').classList.remove('active');
    setTimeout(() => {
        document.getElementById('paymentModal').classList.add('active');
    }, 300);
}

function openPaymentModal() {
    document.getElementById('paymentModal').classList.add('active');
}

function closePaymentModal() {
    document.getElementById('paymentModal').classList.remove('active');
}

function selectPayment(method) {
    selectedPaymentMethod = method;
    
    // Remove selected class from all options
    document.querySelectorAll('.payment-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    
    // Add selected class to chosen option
    document.getElementById(`${method}-option`).classList.add('selected');
    
    // Enable confirm button
    const confirmBtn = document.getElementById('confirmPaymentBtn');
    confirmBtn.disabled = false;
    confirmBtn.style.opacity = '1';
}

function processPayment() {
    if(!selectedPaymentMethod) {
        alert('Please select a payment method');
        return;
    }
    
    // Get customer info and delivery details
    const customerEmail = localStorage.getItem('userEmail') || 'admin@gmail.com';
    const customerName = localStorage.getItem('tempCustomerName') || 'Customer';
    const customerPhone = localStorage.getItem('tempCustomerPhone') || '';
    const deliveryDateStr = localStorage.getItem('tempDeliveryDate');
    const deliveryAddress = localStorage.getItem('tempDeliveryAddress');
    
    // Generate order ID
    const orderId = 'ORD' + Date.now();
    
    // Format delivery date
    const deliveryDate = new Date(deliveryDateStr);
    const formattedDeliveryDate = deliveryDate.toLocaleDateString('en-IN', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    // Store order data
    orderData = {
        orderId: orderId,
        items: cart,
        subtotal: parseFloat(document.getElementById('subtotal').textContent),
        delivery: parseFloat(document.getElementById('delivery').textContent),
        total: parseFloat(document.getElementById('total').textContent),
        paymentMethod: selectedPaymentMethod,
        date: new Date().toLocaleString(),
        deliveryDate: formattedDeliveryDate,
        deliveryAddress: deliveryAddress,
        customerEmail: customerEmail,
        customerName: customerName,
        customerPhone: customerPhone
    };
    
    // Save order to database
    saveOrderToDatabase(orderData);
    
    // Close payment modal
    document.getElementById('paymentModal').classList.remove('active');
    
    // Show success modal
    setTimeout(() => {
        document.getElementById('orderId').textContent = orderId;
        document.getElementById('successModal').classList.add('active');
    }, 300);
}

async function saveOrderToDatabase(orderData) {
    try {
        // Convert delivery date string to MySQL date format
        const deliveryDateObj = new Date(localStorage.getItem('tempDeliveryDate'));
        const mysqlDate = deliveryDateObj.toISOString().split('T')[0];
        
        const API_URL = window.location.hostname === 'localhost' 
            ? 'http://localhost:10000/api' 
            : `${window.location.protocol}//${window.location.host}/api`;
        const response = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                orderId: orderData.orderId,
                userEmail: orderData.customerEmail,
                customerName: orderData.customerName,
                customerPhone: orderData.customerPhone,
                deliveryAddress: orderData.deliveryAddress,
                deliveryDate: mysqlDate,
                subtotal: orderData.subtotal,
                deliveryCharge: orderData.delivery,
                totalAmount: orderData.total,
                paymentMethod: orderData.paymentMethod.toUpperCase(),
                items: orderData.items
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Order saved to database:', result.orderId);
        } else {
            console.error('❌ Failed to save order:', result.error);
        }
    } catch (error) {
        console.error('❌ Error saving order to database:', error);
    }
}

function downloadBill() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(46, 125, 50);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('Farm2Future', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text('Invoice / Bill', 105, 30, { align: 'center' });
    
    // Customer & Order details
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('Customer Details:', 20, 50);
    
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.text(`Name: ${orderData.customerName}`, 20, 56);
    doc.text(`Phone: ${orderData.customerPhone}`, 20, 62);
    doc.text(`Email: ${orderData.customerEmail}`, 20, 68);
    
    // Delivery Address (with text wrapping)
    doc.text('Delivery Address:', 20, 74);
    const addressLines = doc.splitTextToSize(orderData.deliveryAddress, 85);
    doc.text(addressLines, 20, 80);
    
    // Order Info on right side
    doc.setFont(undefined, 'bold');
    doc.text('Order Details:', 110, 50);
    
    doc.setFont(undefined, 'normal');
    doc.text(`Order ID: ${orderData.orderId}`, 110, 56);
    doc.text(`Order Date: ${orderData.date}`, 110, 62);
    doc.text(`Payment: ${orderData.paymentMethod.toUpperCase()}`, 110, 68);
    doc.text(`Delivery Date:`, 110, 74);
    doc.text(`${orderData.deliveryDate}`, 110, 80);
    
    // Line separator
    doc.setDrawColor(46, 125, 50);
    doc.setLineWidth(0.5);
    doc.line(20, 95, 190, 95);
    
    // Items header
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Item', 20, 105);
    doc.text('Qty', 120, 105);
    doc.text('Price', 150, 105);
    doc.text('Total', 175, 105);
    
    // Items
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    let yPos = 115;
    
    orderData.items.forEach(item => {
        const price = parseFloat(item.price.replace(/\D/g, ''));
        const total = price * item.quantity;
        
        doc.text(item.name, 20, yPos);
        doc.text(item.quantity.toString(), 120, yPos);
        doc.text(`₹${price}`, 150, yPos);
        doc.text(`₹${total}`, 175, yPos);
        yPos += 8;
    });
    
    // Line separator
    yPos += 5;
    doc.line(20, yPos, 190, yPos);
    
    // Summary
    yPos += 10;
    doc.text('Subtotal:', 120, yPos);
    doc.text(`₹${orderData.subtotal}`, 175, yPos);
    
    yPos += 8;
    doc.text('Delivery Charges:', 120, yPos);
    doc.text(`₹${orderData.delivery}`, 175, yPos);
    
    yPos += 8;
    doc.setFont(undefined, 'bold');
    doc.setFontSize(12);
    doc.text('Total Amount:', 120, yPos);
    doc.text(`₹${orderData.total}`, 175, yPos);
    
    // Footer
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Thank you for shopping with Farm2Future!', 105, 280, { align: 'center' });
    doc.text('For support, contact: support@farm2future.com', 105, 286, { align: 'center' });
    
    // Save PDF
    doc.save(`Farm2Future_Invoice_${orderData.orderId}.pdf`);
    
    // Clear cart and temp data after download
    setTimeout(() => {
        localStorage.removeItem('cart');
        localStorage.removeItem('tempCustomerName');
        localStorage.removeItem('tempCustomerPhone');
        localStorage.removeItem('tempDeliveryDate');
        localStorage.removeItem('tempDeliveryAddress');
        cart = [];
    }, 1000);
}

// Close modal when clicking outside
document.addEventListener('click', function(event) {
    const deliveryModal = document.getElementById('deliveryModal');
    const paymentModal = document.getElementById('paymentModal');
    
    if (event.target === deliveryModal) {
        closeDeliveryModal();
    }
    
    if (event.target === paymentModal) {
        closePaymentModal();
    }
});

// Initial render
renderCart();
