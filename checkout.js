// Load cart from localStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];

const container = document.querySelector('.checkout-container');
const totalElem = document.getElementById('cart-total');
const buyBtn = document.getElementById('buy-now');

// Function to render cart items
function renderCart() {
    container.innerHTML = '';
    if(cart.length === 0){
        container.innerHTML = '<p>Your cart is empty 🛒</p>';
        buyBtn.style.display = 'none';
        totalElem.textContent = '0';
        return;
    }

    buyBtn.style.display = 'inline-block';
    let totalPrice = 0;

    cart.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.style.border = '1px solid #ccc';
        itemDiv.style.borderRadius = '10px';
        itemDiv.style.padding = '10px';
        itemDiv.style.marginBottom = '10px';
        itemDiv.style.display = 'flex';
        itemDiv.style.justifyContent = 'space-between';
        itemDiv.style.alignItems = 'center';

        itemDiv.innerHTML = `
            <div>
                <p><b>${item.name}</b></p>
                <p>Price: ${item.price}</p>
            </div>
            <div>
                <input type="number" value="${item.quantity}" min="1" data-index="${index}" class="qty-input" style="width:50px; margin-right:10px;">
                <button class="remove-btn" data-index="${index}" style="padding:5px 10px; background:#d32f2f; color:white; border:none; border-radius:5px; cursor:pointer;">Remove</button>
            </div>
        `;

        container.appendChild(itemDiv);

        totalPrice += parseFloat(item.price.replace(/\D/g, '')) * item.quantity;
    });

    totalElem.textContent = totalPrice;

    // Update quantity dynamically
    document.querySelectorAll('.qty-input').forEach(input => {
        input.addEventListener('change', (e) => {
            const idx = e.target.getAttribute('data-index');
            cart[idx].quantity = parseInt(e.target.value);
            localStorage.setItem('cart', JSON.stringify(cart));
            renderCart(); // refresh total
        });
    });

    // Remove item
    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = e.target.getAttribute('data-index');
            cart.splice(idx, 1);
            localStorage.setItem('cart', JSON.stringify(cart));
            renderCart();
        });
    });
}

// Buy Now functionality
buyBtn.addEventListener('click', () => {
    if(cart.length === 0) return;
    alert('Thank you for your purchase! 💳');
    localStorage.removeItem('cart'); // clear cart
    window.location.href = 'market.html';
});

// Initial render
renderCart();
