document.addEventListener("DOMContentLoaded", () => {

  const searchInput = document.getElementById("search-input");
  const categoryFilter = document.getElementById("category-filter");
  const subtotalEl = document.getElementById("subtotal");
  const totalEl = document.getElementById("grand-total");
  const orderBtn = document.querySelector(".order-btn");

  function updateTotals() {
    let sum = 0;

    document.querySelectorAll(".cart-card").forEach(card => {
      if (card.style.display === "none") return;

      const qty = parseInt(card.querySelector(".qty").value) || 0;
      const price = parseInt(card.querySelector(".price").dataset.price) || 0;
      const total = qty * price;

      card.querySelector(".item-total").textContent = total + " грн";
      sum += total;
    });

    subtotalEl.textContent = sum + " грн";
    totalEl.textContent = sum + " грн";
  }

  function applyFilters() {
    const text = searchInput.value.toLowerCase();
    const category = categoryFilter.value;

    document.querySelectorAll(".cart-card").forEach(card => {
      const name = card.querySelector("h3").textContent.toLowerCase();
      const matchText = name.includes(text);
      const matchCat = category === "all" || card.dataset.category === category;

      card.style.display = matchText && matchCat ? "grid" : "none";
    });

    updateTotals();
  }

  document.addEventListener("input", e => {
    if (e.target.classList.contains("qty")) {
      updateTotals();
    }
  });

  document.addEventListener("click", e => {
    if (e.target.classList.contains("remove-btn")) {
      e.target.closest(".cart-card").remove();
      updateTotals();
    }
  });

  searchInput.addEventListener("input", applyFilters);
  categoryFilter.addEventListener("change", applyFilters);

  orderBtn.addEventListener("click", () => {
    const total = parseInt(totalEl.textContent) || 0;
    if (total === 0) {
      alert("Кошик порожній!");
      return;
    }
    alert(`Замовлення оформлено на суму: ${total} грн. Дякуємо!`);
  });

  updateTotals();
});
