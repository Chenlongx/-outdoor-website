// Summer Sale Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize category tabs
    initCategoryTabs();

    // Initialize discount filters
    initDiscountFilters();

    // Initialize sort select
    initSortSelect();

    // Initialize promo code copy button
    initPromoCopy();

    // Initialize product cards
    initProductCards();
});

// Initialize category tabs
function initCategoryTabs() {
    const categoryTabs = document.querySelectorAll('.category-tab');
    const productCards = document.querySelectorAll('.product-card');

    categoryTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            categoryTabs.forEach(t => t.classList.remove('active'));

            // Add active class to clicked tab
            this.classList.add('active');

            const category = this.getAttribute('data-category');

            // Show/hide products based on category
            productCards.forEach(card => {
                if (category === 'all' || card.getAttribute('data-category') === category) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });

            // Apply discount filter if active
            const activeDiscountFilter = document.querySelector('.discount-filter.active');
            if (activeDiscountFilter) {
                applyDiscountFilter(activeDiscountFilter.getAttribute('data-discount'));
            }
        });
    });
}

// Initialize discount filters
function initDiscountFilters() {
    const discountFilters = document.querySelectorAll('.discount-filter');

    discountFilters.forEach(filter => {
        filter.addEventListener('click', function() {
            // Remove active class from all filters
            discountFilters.forEach(f => f.classList.remove('active'));

            // Add active class to clicked filter
            this.classList.add('active');

            // Apply discount filter
            applyDiscountFilter(this.getAttribute('data-discount'));
        });
    });
}

// Apply discount filter
function applyDiscountFilter(minDiscount) {
    const productCards = document.querySelectorAll('.product-card');
    const activeCategory = document.querySelector('.category-tab.active').getAttribute('data-category');

    productCards.forEach(card => {
        const cardDiscount = parseInt(card.getAttribute('data-discount'));
        const cardCategory = card.getAttribute('data-category');

        // First check category
        const categoryMatch = activeCategory === 'all' || cardCategory === activeCategory;

        // Then check discount
        if (categoryMatch && cardDiscount >= parseInt(minDiscount)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Initialize sort select
function initSortSelect() {
    const sortSelect = document.querySelector('.sort-select');

    sortSelect.addEventListener('change', function() {
        const sortValue = this.value;
        const productGrid = document.querySelector('.product-grid');
        const productCards = Array.from(document.querySelectorAll('.product-card'));

        // Sort products based on selected option
        switch(sortValue) {
            case 'discount':
                sortProductsByDiscount(productCards, productGrid);
                break;
            case 'price-low':
                sortProductsByPrice(productCards, productGrid, 'asc');
                break;
            case 'price-high':
                sortProductsByPrice(productCards, productGrid, 'desc');
                break;
            case 'newest':
                sortProductsByNewest(productCards, productGrid);
                break;
            case 'featured':
            default:
                // Reset to original order
                sortProductsByFeatured(productCards, productGrid);
                break;
        }
    });
}

// Sort products by discount
function sortProductsByDiscount(productCards, productGrid) {
    productCards.sort((a, b) => {
        const aDiscount = parseInt(a.getAttribute('data-discount'));
        const bDiscount = parseInt(b.getAttribute('data-discount'));
        return bDiscount - aDiscount;
    });

    // Reorder in DOM
    reorderProducts(productCards, productGrid);
}

// Sort products by price
function sortProductsByPrice(productCards, productGrid, direction) {
    productCards.sort((a, b) => {
        const aPrice = parseFloat(a.querySelector('.current-price').textContent.replace('$', ''));
        const bPrice = parseFloat(b.querySelector('.current-price').textContent.replace('$', ''));

        return direction === 'asc' ? aPrice - bPrice : bPrice - aPrice;
    });

    // Reorder in DOM
    reorderProducts(productCards, productGrid);
}

// Sort products by newest (mock implementation)
function sortProductsByNewest(productCards, productGrid) {
    // In a real app, this would use a date attribute
    // For demo, we'll use a random shuffle
    productCards.sort(() => Math.random() - 0.5);

    // Reorder in DOM
    reorderProducts(productCards, productGrid);
}

// Sort products by featured (original order)
function sortProductsByFeatured(productCards, productGrid) {
    // In a real app, this would reset to a default order
    // For demo, we'll just sort by category alphabetically
    productCards.sort((a, b) => {
        const aCategory = a.getAttribute('data-category');
        const bCategory = b.getAttribute('data-category');
        return aCategory.localeCompare(bCategory);
    });

    // Reorder in DOM
    reorderProducts(productCards, productGrid);
}

// Reorder products in DOM
function reorderProducts(sortedCards, productGrid) {
    sortedCards.forEach(card => {
        productGrid.appendChild(card);
    });
}

// Initialize promo code copy button
function initPromoCopy() {
    const copyButton = document.querySelector('.copy-code');

    if (copyButton) {
        copyButton.addEventListener('click', function() {
            const promoCode = this.getAttribute('data-code');

            // Create temporary input element
            const tempInput = document.createElement('input');
            tempInput.value = promoCode;
            document.body.appendChild(tempInput);

            // Select and copy text
            tempInput.select();
            document.execCommand('copy');

            // Remove temporary element
            document.body.removeChild(tempInput);

            // Update button text temporarily
            const originalText = this.textContent;
            this.textContent = 'Copied!';

            // Reset button text after delay
            setTimeout(() => {
                this.textContent = originalText;
            }, 2000);

            // Show notification
            showNotification(`Promo code ${promoCode} copied to clipboard!`);
        });
    }
}

// Initialize product cards
function initProductCards() {
    const addToCartButtons = document.querySelectorAll('.product-card .add-to-cart');

    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productCard = this.closest('.product-card');
            const productName = productCard.querySelector('h3').textContent;

            // Animation for adding to cart
            button.textContent = 'ADDED!';
            button.style.backgroundColor = 'var(--secondary-color)';

            // Show notification
            showNotification(`${productName} added to cart!`);

            // Update cart count
            const cartCount = document.querySelector('.cart-count');
            if (cartCount) {
                cartCount.textContent = (parseInt(cartCount.textContent) + 1).toString();
            }

            // Reset button after 2 seconds
            setTimeout(() => {
                button.textContent = 'ADD TO CART';
                button.style.backgroundColor = '';
            }, 2000);
        });
    });
}

// Notification system
function showNotification(message) {
    // Check if notification container exists
    let notificationContainer = document.querySelector('.notification-container');

    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.classList.add('notification-container');
        document.body.appendChild(notificationContainer);

        // Style notification container
        notificationContainer.style.position = 'fixed';
        notificationContainer.style.top = '20px';
        notificationContainer.style.right = '20px';
        notificationContainer.style.zIndex = '9999';
    }

    // Create notification
    const notification = document.createElement('div');
    notification.classList.add('notification');
    notification.textContent = message;

    // Style notification
    notification.style.backgroundColor = 'var(--primary-color)';
    notification.style.color = 'white';
    notification.style.padding = '12px 20px';
    notification.style.borderRadius = '4px';
    notification.style.marginBottom = '10px';
    notification.style.boxShadow = '0 3px 10px rgba(0,0,0,0.15)';
    notification.style.transform = 'translateX(150%)';
    notification.style.transition = 'transform 0.3s ease';

    // Add notification to container
    notificationContainer.appendChild(notification);

    // Animate notification
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);

    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(150%)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}
