document.addEventListener('DOMContentLoaded', () => {
    // 1. Елементи для динамічного оновлення
    const container = document.querySelector('.container');
    const itemRows = container.querySelectorAll('.item-row:not(.header-row)');
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
        return parseInt(text.replace('грн.', '').replace('.', '').trim());
    };

    /**
     * Форматує число назад у рядок з " грн."
     * @param {number} price - Числове значення ціни
     * @returns {string} - Форматований рядок
     */
    const formatPrice = (price) => {
        return `${price.toLocaleString('uk-UA')} грн.`;
    };

    /**
     * 💰 Обчислює та оновлює загальні суми кошика.
     */
    const updateCartTotals = () => {
        let itemsSubtotal = 0;
        
        // 1. Проходимо по кожному товару
        itemRows.forEach(row => {
            const quantityInput = row.querySelector('.item-quantity input');
            const pricePerUnitText = row.querySelector('.item-price').textContent;
            const itemTotalDisplay = row.querySelector('.item-total');

            const quantity = parseInt(quantityInput.value);
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
        let deliveryMethodName = "Кур’єр";

        if (deliveryMethodSelect.value === 'pickup') {
            deliveryCost = FREE_DELIVERY;
            deliveryMethodName = "Самовивіз";
        }
        
        // Перевіряємо, чи "Кур'єр" обрано в селекті, і оновлюємо лейбл
        const deliveryLabel = document.querySelector('select[name="delivery_method"] option[value="courier"]').textContent;
        // Оновлюємо, якщо була зміна
        if (deliveryLabel !== `Кур’єр (${formatPrice(COURIER_COST)})`) {
            document.querySelector('select[name="delivery_method"] option[value="courier"]').textContent = `Кур’єр (${formatPrice(COURIER_COST)})`;
            document.querySelector('select[name="delivery_method"] option[value="pickup"]').textContent = `Самовивіз (безкоштовно)`;
        }

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

    // 1. Обробники для зміни кількості
    itemRows.forEach(row => {
        const quantityInput = row.querySelector('.item-quantity input');
        const removeButton = row.querySelector('.item-details button');

        // Оновлення при зміні кількості
        quantityInput.addEventListener('input', updateCartTotals);

        // Обробник для кнопки "Видалити" (для демонстрації)
        removeButton.addEventListener('click', () => {
             // Це зазвичай вимагає AJAX-запиту, але для демо-скрипту просто видаляємо рядок
            row.remove();
            // Потрібно оновити itemRows для updateCartTotals, але простіше просто викликати функцію
            updateCartTotals(); 
        });
    });

    // 2. Обробник для зміни методу доставки
    deliveryMethodSelect.addEventListener('change', updateCartTotals);

    // 3. Обробник для кнопки "Оновити кошик" (для демонстрації)
    updateCartButton.addEventListener('click', updateCartTotals);

    // --- Ініціалізація: перший розрахунок ---
    updateCartTotals();

    // --- 4. Анімація кнопки "Оформити замовлення" ---
    
    // Додаємо CSS-клас для анімації (припускаючи, що його буде визначено у `styles.css`)
    checkoutButton.classList.add('animate-border');

    // Примітка: Без використання keyframes у `styles.css` для візуального ефекту, 
    // ви можете використати просту анімацію на основі інтервалу, але це не оптимально.
    // Найкраще додати наступний CSS до `styles.css`:
    /* @keyframes pulse-border {
        0% { box-shadow: 0 0 0 0 rgba(255, 165, 0, 0.7); }
        70% { box-shadow: 0 0 0 5px rgba(255, 165, 0, 0); }
        100% { box-shadow: 0 0 0 0 rgba(255, 165, 0, 0); }
    }
    .checkout-button.animate-border {
        animation: pulse-border 2s infinite;
        border: 2px solid orange; 
    }
    */
    
});
