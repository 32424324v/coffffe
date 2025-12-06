document.addEventListener('DOMContentLoaded', () => {
    // 1. Елементи для динамічного оновлення
    const container = document.querySelector('.container');
    const itemRowsContainer = document.querySelector('.cart-items');
    
    // Елементи управління фільтром
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    
    // Елементи для розрахунків
    const subtotalDisplay = document.querySelector('.cart-summary .item-row:nth-child(1) .item-total');
    const discountDisplay = document.querySelector('.cart-summary .item-row:nth-child(2) .item-total');
    const deliveryDisplay = document.querySelector('.cart-summary .item-row:nth-child(3) .item-total');
    const grandTotalDisplay = document.querySelector('.cart-summary h3:last-of-type');
    const deliveryMethodSelect = document.querySelector('select[name="delivery_method"]');
    const updateCartButton = document.querySelector('.cart-items .cta-button');
    const checkoutButton = document.querySelector('.checkout-button');

    // Базові константи
    const DISCOUNT_RATE = 0.10; // 10%
    const COURIER_COST = 500; // 500 грн
    const FREE_DELIVERY = 0; // 0 грн

    /**
     * Парсить ціну з текстового рядка, ігноруючи "грн."
     * @param {string} text - Рядок ціни (наприклад, "1250 грн.")
     * @returns {number} - Числове значення ціни
     */
    const parsePrice = (text) => {
        return parseInt(text.replace('грн.', '').replace(/\s/g, '').replace('.', '').trim());
    };

    /**
     * Форматує число назад у рядок з " грн."
     * @param {number} price - Числове значення ціни
     * @returns {string} - Форматований рядок
     */
    const formatPrice = (price) => {
        // Використовуємо toLocaleString для додавання пробілів як роздільник тисяч
        return `${price.toLocaleString('uk-UA').replace(',', ' ')} грн.`;
    };

    /**
     * 🔎 Фільтрує та відображає/приховує товари на основі пошуку та фільтру.
     */
    const applyFilters = () => {
        const searchText = searchInput.value.toLowerCase().trim();
        const selectedCategory = categoryFilter.value;
        
        // Оновлюємо список рядків товарів після можливого видалення
        const currentItemRows = itemRowsContainer.querySelectorAll('.item-row:not(.header-row)');

        currentItemRows.forEach(row => {
            const title = row.querySelector('h4').textContent.toLowerCase();
            const category = row.dataset.category; // Отримуємо категорію з data-category="x"

            // Логіка пошуку
            const matchesSearch = title.includes(searchText);

            // Логіка фільтрації за категорією
            const matchesCategory = selectedCategory === 'all' || category === selectedCategory;

            // Відображаємо рядок, якщо він відповідає обом критеріям
            if (matchesSearch && matchesCategory) {
                row.style.display = 'flex';
            } else {
                row.style.display = 'none';
            }
        });
        
        // Після фільтрації кошик все одно потрібно перерахувати, оскільки 
        // фільтрація не впливає на загальну суму, лише на відображення.
        // updateCartTotals();
    };


    /**
     * 💰 Обчислює та оновлює загальні суми кошика.
     */
    const updateCartTotals = () => {
        let itemsSubtotal = 0;
        
        // Оновлюємо список рядків товарів після можливого видалення
        const currentItemRows = itemRowsContainer.querySelectorAll('.item-row:not(.header-row)');

        // 1. Проходимо по кожному товару
        currentItemRows.forEach(row => {
            const quantityInput = row.querySelector('.item-quantity input');
            // Перевіряємо, чи існує цей рядок і його елементи
            if (!quantityInput) return; 
            
            const pricePerUnitText = row.querySelector('.item-price').textContent;
            const itemTotalDisplay = row.querySelector('.item-total');

            const quantity = parseInt(quantityInput.value) || 0; // Захист від NaN
            const pricePerUnit = parsePrice(pricePerUnitText);

            // Розрахунок "Всього" для окремого товару
            const itemTotal = quantity * pricePerUnit;
            itemTotalDisplay.textContent = formatPrice(itemTotal);

            // Додавання до загальної суми товарів
            itemsSubtotal += itemTotal;
        });

        // 2. Розрахунок знижки, доставки та загальної суми

        // Знижка (застосовується до суми товарів)
        const discountAmount = Math.round(itemsSubtotal * DISCOUNT_RATE);
        const subtotalAfterDiscount = itemsSubtotal - discountAmount;
        
        // Вартість доставки
        let deliveryCost = COURIER_COST;
        
        if (deliveryMethodSelect.value === 'pickup') {
            deliveryCost = FREE_DELIVERY;
        }
        
        // Оновлюємо лейбли у селекті
        document.querySelector('select[name="delivery_method"] option[value="courier"]').textContent = `Кур’єр (${formatPrice(COURIER_COST)})`;
        document.querySelector('select[name="delivery_method"] option[value="pickup"]').textContent = `Самовивіз (безкоштовно)`;

        // Кінцева загальна сума
        const grandTotal = subtotalAfterDiscount + deliveryCost;

        // 3. Оновлення відображення у Зведенні замовлення
        
        // Сума товарів
        subtotalDisplay.textContent = formatPrice(itemsSubtotal);

        // Знижка
        discountDisplay.textContent = `-${formatPrice(discountAmount)} (${DISCOUNT_RATE * 100}%)`;

        // Доставка
        if (deliveryCost > 0) {
            deliveryDisplay.textContent = formatPrice(deliveryCost);
        } else {
            deliveryDisplay.textContent = 'Безкоштовно';
        }
        
        // Всього
        grandTotalDisplay.textContent = `Всього: ${formatPrice(grandTotal)}`;
    };

    // --- Додавання обробників подій ---

    // Обробники для пошуку та фільтрації
    searchInput.addEventListener('input', applyFilters);
    categoryFilter.addEventListener('change', applyFilters);
    
    // Обробники для кількості, видалення та оновлення
    itemRowsContainer.addEventListener('input', (event) => {
        if (event.target.type === 'number' && event.target.closest('.item-row:not(.header-row)')) {
            updateCartTotals();
        }
    });

    itemRowsContainer.addEventListener('click', (event) => {
        if (event.target.type === 'button' && event.target.textContent.includes('Видалити')) {
            // Видаляємо рядок товару
            event.target.closest('.item-row').remove();
            // Перераховуємо суми та повторно застосовуємо фільтри
            updateCartTotals(); 
            applyFilters();
        }
    });
    
    deliveryMethodSelect.addEventListener('change', updateCartTotals);
    updateCartButton.addEventListener('click', updateCartTotals);


    // --- Ініціалізація: перший розрахунок та фільтрація ---
    updateCartTotals();
    applyFilters();

    // --- Анімація кнопки "Оформити замовлення" ---
    // Додаємо CSS-клас для анімації (як було в попередньому варіанті)
    checkoutButton.classList.add('animate-border');

});
