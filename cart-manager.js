// Менеджер кошика - спільні функції для всіх сторінок

// Отримання кошика з localStorage
function getCart() {
  const cartJson = localStorage.getItem('coffeeShopCart');
  return cartJson ? JSON.parse(cartJson) : [];
}

// Збереження кошика в localStorage
function saveCart(cart) {
  localStorage.setItem('coffeeShopCart', JSON.stringify(cart));
}

// Оновлення лічильника кошика
function updateCartCount() {
  const cart = getCart();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartCounts = document.querySelectorAll('.cart-count');
  
  cartCounts.forEach(cartCount => {
    cartCount.textContent = totalItems;
    cartCount.style.display = totalItems > 0 ? 'inline-block' : 'none';
  });
}

// Додавання товару в кошик
function addToCart(productId, products) {
  const cart = getCart();
  const product = products.find(p => p.id === productId);
  
  if (!product) return false;
  
  const existingItem = cart.find(item => item.id === productId);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category,
      quantity: 1
    });
  }
  
  saveCart(cart);
  updateCartCount();
  return true;
}

// Видалення товару з кошика
function removeFromCart(productId) {
  const cart = getCart();
  const updatedCart = cart.filter(item => item.id !== productId);
  saveCart(updatedCart);
  updateCartCount();
}

// Оновлення кількості товару
function updateQuantity(productId, quantity) {
  const cart = getCart();
  const item = cart.find(item
