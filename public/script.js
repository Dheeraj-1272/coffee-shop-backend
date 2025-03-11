document.addEventListener('DOMContentLoaded', () => {
  const cartItems = [];
  const cartList = document.querySelector('.cart-items');
  const totalElement = document.querySelector('.total');

  // Add to cart functionality
  document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', () => {
      const item = button.parentElement;
      const itemName = item.getAttribute('data-name');
      const itemPrice = parseFloat(item.getAttribute('data-price'));

      const existingItem = cartItems.find(cartItem => cartItem.name === itemName);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cartItems.push({ name: itemName, price: itemPrice, quantity: 1 });
      }

      updateCart();
    });
  });

  // Update cart display
  function updateCart() {
    cartList.innerHTML = '';
    let total = 0;

    cartItems.forEach(item => {
      const li = document.createElement('li');
      li.innerHTML = `
        <span>${item.name} (${item.quantity})</span>
        <span>₹${item.price * item.quantity}</span>
      `;
      cartList.appendChild(li);
      total += item.price * item.quantity;
    });

    totalElement.textContent = total.toFixed(2);
  }

  // Checkout functionality
  document.querySelector('.checkout').addEventListener('click', async () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty!');
    } else {
      const customerName = document.getElementById('customer-name');
      const customerPhone = document.getElementById('customer-phone');

      if (!customerName.value || !customerPhone.value) {
        alert('Please enter your name and phone number.');
        return;
      }

      const total = parseFloat(totalElement.textContent);

      // Send order to the backend
      const response = await fetch('https://coffee-shop-6bxa.onrender.com/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems,
          total,
          customerName: customerName.value,
          customerPhone: customerPhone.value,
        }),
      });

      const { success } = await response.json();
      if (success) {
        alert('Order placed successfully! We will prepare your food.');
        cartItems.length = 0; // Clear the cart
        updateCart();
        customerName.value = ''; // Clear name input field
        customerPhone.value = ''; // Clear phone input field
      } else {
        alert('Failed to place the order. Please try again.');
      }
    }
  });
});
