document.addEventListener("DOMContentLoaded", () => {
  // Елементи DOM
  const searchInput = document.getElementById("search-input");
  const categoryFilter = document.getElementById("category-filter");
  const subtotalEl = document.getElementById("subtotal");
  const totalEl = document.getElementById("grand-total");
  const orderBtn = document.querySelector(".order-btn");
  const cartItemsContainer = document.querySelector(".cart-items");
  const cartCards = document.querySelectorAll(".cart-card");
  
  // Створюємо повідомлення про порожній кошик
  const emptyCartMessage = document.createElement("div");
  emptyCartMessage.className = "empty-cart-message";
  emptyCartMessage.innerHTML = `
    <h3>😔 Ваш кошик порожній</h3>
    <p>Додайте товари з <a href="shop.html">магазину</a>, щоб зробити замовлення.</p>
  `;
  cartItemsContainer.appendChild(emptyCartMessage);
  
  // Форматування валюти
  function formatCurrency(amount) {
    return new Intl.NumberFormat('uk-UA', {
      style: 'currency',
      currency: 'UAH',
      minimumFractionDigits: 0
    }).format(amount);
  }
  
  // Оновлення загальної суми
  function updateTotals() {
    let sum = 0;
    let visibleItems = 0;
    
    document.querySelectorAll(".cart-card").forEach(card => {
      if (card.style.display === "none" || card.classList.contains("removed")) return;
      
      const qty = parseInt(card.querySelector(".qty").value) || 0;
      const price = parseInt(card.querySelector(".price").dataset.price) || 0;
      const total = qty * price;
      
      card.querySelector(".item-total").textContent = formatCurrency(total);
      sum += total;
      visibleItems++;
    });
    
    subtotalEl.textContent = formatCurrency(sum);
    totalEl.textContent = formatCurrency(sum);
    
    // Показуємо/ховаємо повідомлення про порожній кошик
    if (visibleItems === 0) {
      emptyCartMessage.classList.add("show");
      orderBtn.disabled = true;
      orderBtn.style.opacity = "0.6";
      orderBtn.textContent = "Кошик порожній";
    } else {
      emptyCartMessage.classList.remove("show");
      orderBtn.disabled = false;
      orderBtn.style.opacity = "1";
      orderBtn.textContent = "Оформити замовлення";
    }
    
    // Оновлюємо заголовок кошика з кількістю товарів
    const cartTitle = document.querySelector(".cart-items h2");
    if (cartTitle) {
      const baseTitle = "Ваш кошик";
      cartTitle.textContent = visibleItems > 0 
        ? `${baseTitle} (${visibleItems} товар${visibleItems > 1 ? 'и' : ''})`
        : baseTitle;
    }
    
    return sum;
  }
  
  // Застосування фільтрів
  function applyFilters() {
    const text = searchInput.value.toLowerCase().trim();
    const category = categoryFilter.value;
    
    document.querySelectorAll(".cart-card").forEach(card => {
      if (card.classList.contains("removed")) return;
      
      const name = card.querySelector("h3").textContent.toLowerCase();
      const description = card.querySelector("p").textContent.toLowerCase();
      const matchText = text === '' || name.includes(text) || description.includes(text);
      const matchCat = category === "all" || card.dataset.category === category;
      
      card.style.display = matchText && matchCat ? "grid" : "none";
    });
    
    updateTotals();
  }
  
  // Валідація кількості
  function validateQuantity(input) {
    const value = parseInt(input.value);
    const min = parseInt(input.min) || 1;
    
    if (isNaN(value) || value < min) {
      input.value = min;
    }
    
    if (value > 99) {
      input.value = 99;
    }
    
    updateTotals();
  }
  
  // Видалення товару
  function removeItem(card) {
    card.style.animation = "fadeOut 0.3s ease forwards";
    
    setTimeout(() => {
      card.classList.add("removed");
      card.style.display = "none";
      updateTotals();
      
      // Анімація видалення
      const event = new CustomEvent('itemRemoved', { 
        detail: { itemName: card.querySelector("h3").textContent }
      });
      document.dispatchEvent(event);
    }, 300);
  }
  
  // Додавання CSS анімацій
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeOut {
      from { opacity: 1; transform: translateX(0); }
      to { opacity: 0; transform: translateX(-20px); }
    }
    
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.02); }
      100% { transform: scale(1); }
    }
    
    .qty.updated {
      animation: pulse 0.3s ease;
    }
  `;
  document.head.appendChild(style);
  
  // Обробники подій
  document.addEventListener("input", e => {
    if (e.target.classList.contains("qty")) {
      validateQuantity(e.target);
      e.target.classList.add("updated");
      setTimeout(() => e.target.classList.remove("updated"), 300);
    }
  });
  
  document.addEventListener("click", e => {
    if (e.target.classList.contains("remove-btn")) {
      const card = e.target.closest(".cart-card");
      if (confirm(`Видалити "${card.querySelector("h3").textContent}" з кошика?`)) {
        removeItem(card);
      }
    }
  });
  
  searchInput.addEventListener("input", () => {
    clearTimeout(searchInput._timer);
    searchInput._timer = setTimeout(applyFilters, 300);
  });
  
  categoryFilter.addEventListener("change", applyFilters);
  
  orderBtn.addEventListener("click", () => {
    const total = parseInt(totalEl.textContent.replace(/\D/g, '')) || 0;
    
    if (total === 0) {
      alert("Кошик порожній! Додайте товари перед оформленням замовлення.");
      return;
    }
    
    const itemCount = document.querySelectorAll(".cart-card:not(.removed)").length;
    
    if (confirm(`Оформити замовлення на суму ${formatCurrency(total)} (${itemCount} товар${itemCount > 1 ? 'ів' : ''})?`)) {
      // Симуляція оформлення замовлення
      orderBtn.disabled = true;
      orderBtn.textContent = "Обробка...";
      orderBtn.style.background = "#95a5a6";
      
      setTimeout(() => {
        alert(`✅ Замовлення успішно оформлено!\n\nСума: ${formatCurrency(total)}\nТоварів: ${itemCount}\n\nДякуємо за покупку!`);
        
        // Очищення кошика після успішного замовлення
        document.querySelectorAll(".cart-card").forEach(card => removeItem(card));
        
        // Скидання кнопки
        setTimeout(() => {
          orderBtn.disabled = false;
          orderBtn.textContent = "Оформити замовлення";
          orderBtn.style.background = "";
          updateTotals();
        }, 500);
      }, 1500);
    }
  });
  
  // Додаткова функціональність: збереження кошика в localStorage
  function saveCartToStorage() {
    const cartData = [];
    
    document.querySelectorAll(".cart-card:not(.removed)").forEach(card => {
      if (card.style.display !== "none") {
        cartData.push({
          name: card.querySelector("h3").textContent,
          qty: card.querySelector(".qty").value,
          price: card.querySelector(".price").dataset.price,
          category: card.dataset.category
        });
      }
    });
    
    localStorage.setItem('coffeeShopCart', JSON.stringify(cartData));
  }
  
  // Автозбереження при змінах
  document.addEventListener("input", () => {
    if (event.target.classList.contains("qty")) {
      saveCartToStorage();
    }
  });
  
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("remove-btn")) {
      setTimeout(saveCartToStorage, 350);
    }
  });
  
  // Ініціалізація
  applyFilters();
  updateTotals();
  saveCartToStorage();
  
  // Додаткове повідомлення при спробі закрити сторінку з непорожнім кошиком
  window.addEventListener('beforeunload', (e) => {
    const itemCount = document.querySelectorAll(".cart-card:not(.removed)").length;
    
    if (itemCount > 0) {
      e.preventDefault();
      e.returnValue = 'У вашому кошику є товари. Ви впевнені, що хочете залишити сторінку?';
      return e.returnValue;
    }
  });
  
  console.log("🛒 Кошик ініціалізовано. Готовий до роботи!");
});
