// Cart Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize cart functionality
    initCart();

    // Continue Shopping button
    const continueShoppingBtn = document.querySelector('.continue-shopping');
    if (continueShoppingBtn) {
        continueShoppingBtn.addEventListener('click', function() {
            window.location.href = '../index.html';
        });
    }

    // Update Cart button
    const updateCartBtn = document.querySelector('.update-cart');
    if (updateCartBtn) {
        updateCartBtn.addEventListener('click', function() {
            updateCartDisplay();
            updateOrderSummary();
            showNotification('Shopping cart updated');
        });
    }

    // Checkout button
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            const cart = getCart();
            if (cart.length === 0) {
                showNotification('Shopping cart is empty', 'error');
                return;
            }
            showNotification('Redirecting to checkout page...', 'info');
            // In a real application, this would redirect to the checkout page
        });
    }else {
        console.warn('.checkout-btn not found');
    }

    // Apply promo code button
    const promoBtn = document.querySelector('.promo-input button');
    if (promoBtn) {
        promoBtn.addEventListener('click', function() {
            const promoInput = document.querySelector('.promo-input input');
            if (promoInput && promoInput.value.trim()) {
                // Check if promo code is valid (mock implementation)
                if (promoInput.value.trim().toUpperCase() === 'SUMMER25') {
                    applyDiscount(25);
                    showNotification('优惠码已应用：25%折扣！', 'success');
                } else if (promoInput.value.trim().toUpperCase() === 'FREE') {
                    updateShipping(0);
                    showNotification('已应用免运费！', 'success');
                } else {
                    showNotification('无效的优惠码，请重试。', 'error');
                }
            } else {
                showNotification('请输入优惠码。', 'error');
            }
        });
    }

    // Initialize suggested products
    initSuggestedProducts();

    // document.querySelector('.checkout-btn').addEventListener('click', function(e) {
    //     e.preventDefault(); // 阻止正常提交
    //     document.getElementById('custom-modal').style.display = 'flex'; // 显示弹窗
    // });
    const checkoutbtn = document.querySelector('.checkout-btn');
    const modal = document.getElementById('custom-modal');

    if (checkoutbtn && modal) {
        checkoutbtn.addEventListener('click', function (e) {
            e.preventDefault();
            modal.style.display = 'flex';
        });
    }
    
    // document.getElementById('close-modal').addEventListener('click', function() {
    //     document.getElementById('custom-modal').style.display = 'none'; // 关闭弹窗
    // });

    const closeBtn = document.getElementById('close-modal');
    const closemodal = document.getElementById('custom-modal');

    if (closeBtn && closemodal) {
        closeBtn.addEventListener('click', function () {
            closemodal.style.display = 'none';
        });
    }
    
    // document.getElementById('contact-support').addEventListener('click', function() {
    //     // 跳转到你的 WhatsApp
    //     window.location.href = 'https://wa.me/8613326425565?text=Hello,%20I%20want%20to%20place%20an%20order';
    // });

    const contactBtn = document.getElementById('contact-support');

    if (contactBtn) {
        contactBtn.addEventListener('click', function () {
            window.location.href = 'https://wa.me/8613326425565?text=Hello,%20I%20want%20to%20place%20an%20order';
        });
    }

});

// Initialize cart functionality
function initCart() {
    updateCartDisplay();
    updateOrderSummary();
    updateCartCount();
}

// Update cart display
function updateCartDisplay() {
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartItemCount = document.getElementById('cart-item-count');

    const cart = getCart();

    if (!cartItemsContainer) {
        console.warn('cart-items-container not found');
        return; // 直接返回，不执行后面
    }
    
    cartItemsContainer.innerHTML = '';
    if (cartItemCount) {
        cartItemCount.textContent = Array.isArray(cart) ? cart.length : 0;
    }
    
    if (!Array.isArray(cart) || cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
        return;
    }
    
    cart.forEach(item => {
        const cartItem = createCartItemElement(item);
        cartItemsContainer.appendChild(cartItem);
    });

    // 添加事件委托
    cartItemsContainer.addEventListener('click', (e) => {
        const target = e.target.closest('button');
        if (!target) return;

        const productId = target.closest('.cart-item').dataset.productId;

        if (target.classList.contains('remove-item')) {
            removeFromCart(productId);
        } else if (target.classList.contains('save-for-later')) {
            saveForLater(productId);
        } else if (target.classList.contains('decrease')) {
            updateQuantity(productId, -1);
        } else if (target.classList.contains('increase')) {
            updateQuantity(productId, 1);
        }
    });

    cartItemsContainer.querySelectorAll('input[type="number"]').forEach(input => {
        input.addEventListener('change', (e) => {
            const productId = e.target.closest('.cart-item').dataset.productId;
            updateQuantityInput(productId, e.target.value);
        });
    });
}
// Create cart item element
function createCartItemElement(item) {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.dataset.productId = item.id;
    
    div.innerHTML = `
        <div class="item-image">
            <img src="${item.image_url || 'https://via.placeholder.com/150'}" alt="${item.name}" 
                 onerror="this.src='https://via.placeholder.com/150';">
        </div>
        <div class="item-details">
            <h3>${item.name}</h3>
            <p class="item-attributes">${item.attributes || ''}</p>
            <button class="save-for-later">
                <i class="far fa-heart"></i> Save for Later
            </button>
            <button class="remove-item">
                <i class="fas fa-trash-alt"></i> Remove
            </button>
        </div>
        <div class="item-price">$${parseFloat(item.price).toFixed(2)}</div>
        <div class="item-quantity">
            <button class="quantity-btn decrease">-</button>
            <input type="number" value="${item.quantity}" min="1" max="10">
            <button class="quantity-btn increase">+</button>
        </div>
        <div class="item-total">$${(parseFloat(item.price) * item.quantity).toFixed(2)}</div>
    `;
    
    return div;
}

// Update order summary
function updateOrderSummary() {
    const cart = getCart();
    const subtotal = calculateSubtotal(cart);
    const shipping = calculateShipping(subtotal);
    const tax = calculateTax(subtotal);
    const total = subtotal + shipping + tax;

    const subtotalElement = document.getElementById('subtotal');
    const shippingElement = document.getElementById('shipping');
    const taxElement = document.getElementById('tax');
    const totalElement = document.getElementById('total');

    if (subtotalElement) {
        subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    } else {
        console.warn('subtotal element not found');
    }

    if (shippingElement) {
        shippingElement.textContent = `$${shipping.toFixed(2)}`;
    } else {
        console.warn('shipping element not found');
    }

    if (taxElement) {
        taxElement.textContent = `$${tax.toFixed(2)}`;
    } else {
        console.warn('tax element not found');
    }

    if (totalElement) {
        totalElement.textContent = `$${total.toFixed(2)}`;
    } else {
        console.warn('total element not found');
    }
}


// Calculate subtotal
function calculateSubtotal(cart) {
    if (!Array.isArray(cart)) {
        console.warn('Cart is not an array:', cart);
        return 0;
    }
    return cart.reduce((total, item) => {
        const price = parseFloat(item.price || 0);
        const quantity = parseInt(item.quantity || 1);
        return total + (price * quantity);
    }, 0);
}

// Calculate shipping
function calculateShipping(subtotal) {
    return subtotal > 100 ? 0 : 10;
}

// Calculate tax
function calculateTax(subtotal) {
    return subtotal * 0.08; // 8% tax
}

// Get cart data
function getCart() {
    const cart = localStorage.getItem('cart');
    try {
        return cart ? JSON.parse(cart) : [];
    } catch (e) {
        console.error('Error parsing cart data:', e);
        return [];
    }
}

// Save cart data
function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Remove item from cart
function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
    updateCartDisplay();
    updateOrderSummary();
    updateCartCount();
    showNotification('Item has been removed from cart');
}

// Update quantity
function updateQuantity(productId, change) {
    let cart = getCart();
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = Math.max(1, Math.min(10, item.quantity + change));
        saveCart(cart);
        updateCartDisplay();
        updateOrderSummary();
        updateCartCount();
    }
}

// Update quantity via input
function updateQuantityInput(productId, value) {
    const quantity = parseInt(value);
    if (quantity >= 1 && quantity <= 10) {
        let cart = getCart();
        const item = cart.find(item => item.id === productId);
        if (item) {
            item.quantity = quantity;
            saveCart(cart);
            updateCartDisplay();
            updateOrderSummary();
            updateCartCount();
        }
    }
}

// Save for later
function saveForLater(productId) {
    let cart = getCart();
    let savedItems = JSON.parse(localStorage.getItem('savedItems') || '[]');
    
    const item = cart.find(item => item.id === productId);
    if (item) {
        savedItems.push(item);
        cart = cart.filter(item => item.id !== productId);
        
        saveCart(cart);
        localStorage.setItem('savedItems', JSON.stringify(savedItems));
        updateCartDisplay();
        updateOrderSummary();
        updateCartCount();
        showNotification('商品已保存到稍后购买');
    }
}

// Update cart count badge
function updateCartCount() {
    const cart = getCart();
    if (!Array.isArray(cart)) {
        console.warn('Cart is not an array:', cart);
        return;
    }
    const totalItems = cart.reduce((total, item) => total + (parseInt(item.quantity || 1)), 0);
    const cartCountElements = document.querySelectorAll('.cart-count');
    
    cartCountElements.forEach(element => {
        element.textContent = totalItems.toString();
    });
}

// Show empty cart message
function showEmptyCartMessage() {
    const cartItems = document.querySelector('.cart-items');
    const emptyMessage = document.createElement('div');
    emptyMessage.classList.add('empty-cart-message');
    emptyMessage.innerHTML = `
        <div class="empty-cart-icon">
            <i class="fas fa-shopping-cart"></i>
        </div>
        <h3>Your cart is empty</h3>
        <p>Looks like you haven't added any items to your cart yet.</p>
        <a href="products.html" class="btn-primary">Browse Products</a>
    `;

    // Style the empty message
    emptyMessage.style.textAlign = 'center';
    emptyMessage.style.padding = '3rem 1rem';

    // Clear cart items container and add empty message
    cartItems.innerHTML = '';
    cartItems.appendChild(emptyMessage);

    // Update cart summary
    const subtotalElement = document.querySelector('.summary-row:nth-child(1) span:last-child');
    subtotalElement.textContent = '$0.00';

    const taxElement = document.querySelector('.summary-row:nth-child(3) span:last-child');
    taxElement.textContent = '$0.00';

    const totalElement = document.querySelector('.summary-total span:last-child');
    totalElement.textContent = '$0.00';

    // Disable checkout button
    const checkoutBtn = document.querySelector('.checkout-btn');
    checkoutBtn.disabled = true;
    checkoutBtn.style.opacity = '0.5';
    checkoutBtn.style.cursor = 'not-allowed';
}

// Update cart after quantity changes
function updateCart() {
    // This would typically sync with a backend or localStorage
    // For demo purposes, we just recalculate totals
    updateCartDisplay();
}

// Initialize suggested products
function initSuggestedProducts() {
    const addToCartButtons = document.querySelectorAll('.suggested-products .add-to-cart');

    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productCard = this.closest('.product-card');
            const productName = productCard.querySelector('h3').textContent;

            // Animation for adding to cart
            button.textContent = 'ADDED!';
            button.style.backgroundColor = 'var(--secondary-color)';

            // Show notification
            showNotification(`${productName} added to cart!`, 'success');

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
function showNotification(message, type = 'success') {
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
    notification.classList.add('notification', `notification-${type}`);

    // Create icon based on type
    let icon;
    switch(type) {
        case 'success':
            icon = 'fa-check-circle';
            notification.style.backgroundColor = 'var(--primary-color)';
            break;
        case 'error':
            icon = 'fa-exclamation-circle';
            notification.style.backgroundColor = 'var(--danger-color)';
            break;
        case 'info':
        default:
            icon = 'fa-info-circle';
            notification.style.backgroundColor = 'var(--accent-color)';
    }

    notification.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
    `;

    // Style notification
    notification.style.color = 'white';
    notification.style.padding = '12px 20px';
    notification.style.borderRadius = '4px';
    notification.style.marginBottom = '10px';
    notification.style.boxShadow = '0 3px 10px rgba(0,0,0,0.15)';
    notification.style.display = 'flex';
    notification.style.alignItems = 'center';
    notification.style.gap = '10px';
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

// Cart Management Core Functions
const CartManager = {
    // Get cart items from localStorage
    getCartItems() {
        const cartItems = localStorage.getItem('cart');
        // console.log('Raw cart data from localStorage:', cartItems); // 调试输出
        try {
            return cartItems ? JSON.parse(cartItems) : [];
        } catch (e) {
            console.error('Error parsing cart data:', e);
            return [];
        }
    },

    // Save cart items to localStorage
    saveCartItems(items) {
        if (!Array.isArray(items)) {
            console.warn('Items is not an array:', items);
            items = [];
        }
        localStorage.setItem('cart', JSON.stringify(items));
        this.updateCartUI();
    },

    // Add item to cart
    addToCart(product) {
        const cartItems = this.getCartItems();
        const existingItem = cartItems.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cartItems.push({
                ...product,
                quantity: 1
            });
        }

        this.saveCartItems(cartItems);
        this.updateCartCount();
        return true;
    },

    // Update cart count in header
    updateCartCount() {
        const cartItems = this.getCartItems();
        if (!Array.isArray(cartItems)) {
            console.warn('Cart items is not an array:', cartItems);
            return;
        }
        
        const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
        
        // 更新购物车图标上的数量
        const cartIcon = document.querySelector('.fa-shopping-cart');
        if (cartIcon) {
            const cartCountElement = document.querySelector('.cart-count');
            if (cartCountElement) {
                cartCountElement.textContent = cartCount;
                // cartCountElement.style.display = cartCount > 0 ? 'block' : 'none';
            } else if (cartCount > 0) {
                // 如果不存在数量元素，则创建一个
                const countElement = document.createElement('span');
                countElement.classList.add('cart-count');
                countElement.textContent = cartCount;
                countElement.style.position = 'absolute';
                countElement.style.top = '-8px';
                countElement.style.right = '-8px';
                countElement.style.backgroundColor = 'var(--primary-color)';
                countElement.style.color = 'white';
                countElement.style.borderRadius = '50%';
                countElement.style.width = '18px';
                countElement.style.height = '18px';
                countElement.style.fontSize = '12px';
                countElement.style.display = 'flex';
                countElement.style.justifyContent = 'center';
                countElement.style.alignItems = 'center';
                
                const cartLink = document.querySelector('a[href="./products/cart.html"]');
                if (cartLink) {
                    cartLink.style.position = 'relative';
                    cartLink.appendChild(countElement);
                }
            }
        }
    },

    // Update cart UI
    updateCartUI() {
        const cartItems = this.getCartItems();
        const cartItemsContainer = document.getElementById('cart-items-container');
        const cartItemCount = document.getElementById('cart-item-count');
        
        if (!cartItemsContainer) {
            console.warn('Cart items container not found');
            return;
        }
    
        // 添加检查，确保 cartItems 是数组
        if (!Array.isArray(cartItems)) {
            console.error('cartItems is not an array:', cartItems);
            cartItemsContainer.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
            this.updateCartSummary();
            return;
        }
    
        // 更新商品数量显示
        if (cartItemCount) {
            cartItemCount.textContent = cartItems.length.toString();
        }
    
        if (cartItems.length === 0) {
            cartItemsContainer.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
            this.updateCartSummary();
            return;
        }

        // Update cart items display
        let cartHTML = `
            <div class="cart-headers">
                <span class="header-product">Product</span>
                <span class="header-price">Price</span>
                <span class="header-quantity">Quantity</span>
                <span class="header-total">Total</span>
            </div>
        `;
        
        cartItems.forEach(item => {
            // 获取产品图片 - 使用image_url属性
            let imagePath = item.image_url || 'https://via.placeholder.com/150x150?text=No+Image';
            console.log("获取到的图片地址：" + imagePath);
            
            // 检查图片路径是否有效
            if (!imagePath || imagePath === 'undefined' || imagePath === 'null') {
                imagePath = 'https://via.placeholder.com/150x150?text=No+Image';
            }
            
            // 确保price是数字类型
            const price = parseFloat(item.price || 0);
            const total = price * (parseInt(item.quantity || 1));
            
            cartHTML += `
                <div class="cart-item" data-id="${item.id}">
                    <div class="item-image">
                        <img src="${imagePath}" alt="${item.name || 'Product'}" 
                             onerror="this.src='https://via.placeholder.com/150x150?text=No+Image'">
                    </div>
                    <div class="item-details">
                        <h3>${item.name || 'Unnamed Product'}</h3>
                        <p class="item-attributes">
                            ${item.color ? `Color: ${item.color}` : ''}
                            ${item.size ? ` | Size: ${item.size}` : ''}
                        </p>
                        <button class="remove-item"><i class="fas fa-trash-alt"></i> Remove</button>
                        <button class="save-for-later"><i class="far fa-heart"></i> Save for Later</button>
                    </div>
                    <div class="item-price">$${price.toFixed(2)}</div>
                    <div class="item-quantity">
                        <button class="quantity-btn decrease">-</button>
                        <input type="number" value="${item.quantity || 1}" min="1" max="10">
                        <button class="quantity-btn increase">+</button>
                    </div>
                    <div class="item-total">$${total.toFixed(2)}</div>
                </div>
            `;
        });

        cartHTML += `
            <div class="cart-actions">
                <button class="continue-shopping"><i class="fas fa-arrow-left"></i> Continue Shopping</button>
                <button class="update-cart">Update Cart</button>
            </div>
        `;

        cartItemsContainer.innerHTML = cartHTML;
        this.initCartEventListeners();
        this.updateCartSummary();
    },

    // Initialize cart event listeners
    initCartEventListeners() {
        // Remove item buttons
        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', (e) => {
                const cartItem = e.target.closest('.cart-item');
                const itemId = cartItem.dataset.id;
                this.removeFromCart(itemId);
            });
        });

        // Save for later buttons
        document.querySelectorAll('.save-for-later').forEach(button => {
            button.addEventListener('click', (e) => {
                const cartItem = e.target.closest('.cart-item');
                const itemId = cartItem.dataset.id;
                this.saveForLater(itemId);
            });
        });

        // Quantity buttons
        document.querySelectorAll('.quantity-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const cartItem = e.target.closest('.cart-item');
                const itemId = cartItem.dataset.id;
                const isIncrease = e.target.classList.contains('increase');
                this.updateQuantity(itemId, isIncrease ? 1 : -1);
            });
        });

        // Quantity inputs
        document.querySelectorAll('.item-quantity input').forEach(input => {
            input.addEventListener('change', (e) => {
                const cartItem = e.target.closest('.cart-item');
                const itemId = cartItem.dataset.id;
                const newValue = parseInt(e.target.value);
                if (newValue > 0 && newValue <= 10) {
                    this.updateQuantityInput(itemId, newValue);
                } else {
                    e.target.value = 1;
                }
            });
        });

        // Continue shopping button
        const continueShoppingBtn = document.querySelector('.continue-shopping');
        if (continueShoppingBtn) {
            continueShoppingBtn.addEventListener('click', () => {
                window.location.href = '../index.html';
            });
        }

        // Update cart button
        const updateCartBtn = document.querySelector('.update-cart');
        if (updateCartBtn) {
            updateCartBtn.addEventListener('click', () => {
                this.updateCartUI();
                this.updateCartSummary();
                showNotification('Shopping cart updated');
            });
        }
    },

    // Remove item from cart
    removeFromCart(itemId) {
        const cartItems = this.getCartItems();
        const updatedItems = cartItems.filter(item => item.id !== itemId);
        this.saveCartItems(updatedItems);
        showNotification('Item has been removed from cart');
    },

    // Save item for later
    saveForLater(itemId) {
        const cartItems = this.getCartItems();
        const item = cartItems.find(item => item.id === itemId);
        if (item) {
            // 这里可以实现保存到"稍后购买"的功能
            showNotification('Item has been saved for later');
        }
    },

    // Update quantity
    updateQuantity(itemId, change) {
        const cartItems = this.getCartItems();
        const item = cartItems.find(item => item.id === itemId);
        if (item) {
            const newQuantity = item.quantity + change;
            if (newQuantity > 0 && newQuantity <= 10) {
                item.quantity = newQuantity;
                this.saveCartItems(cartItems);
            }
        }
    },

    // Update quantity input
    updateQuantityInput(itemId, value) {
        const cartItems = this.getCartItems();
        const item = cartItems.find(item => item.id === itemId);
        if (item) {
            item.quantity = value;
            this.saveCartItems(cartItems);
        }
    },

    // Update cart summary
    updateCartSummary() {
        const cartItems = this.getCartItems();
        const subtotal = this.calculateSubtotal(cartItems);
        const shipping = this.calculateShipping(subtotal);
        const tax = this.calculateTax(subtotal);
        const total = subtotal + shipping + tax;

        // Update summary elements
        const subtotalElement = document.getElementById('subtotal');
        const shippingElement = document.getElementById('shipping');
        const taxElement = document.getElementById('tax');
        const totalElement = document.getElementById('total');

        if (subtotalElement) subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
        if (shippingElement) shippingElement.textContent = `$${shipping.toFixed(2)}`;
        if (taxElement) taxElement.textContent = `$${tax.toFixed(2)}`;
        if (totalElement) totalElement.textContent = `$${total.toFixed(2)}`;
    },

    // Calculate subtotal
    calculateSubtotal(cartItems) {
        return cartItems.reduce((total, item) => {
            return total + (parseFloat(item.price || 0) * (parseInt(item.quantity || 1)));
        }, 0);
    },

    // Calculate shipping
    calculateShipping(subtotal) {
        return subtotal > 100 ? 0 : 10; // Free shipping over $100
    },

    // Calculate tax
    calculateTax(subtotal) {
        return subtotal * 0.08; // 8% tax
    },

    // Initialize cart
    init() {
        this.updateCartUI();
        this.updateCartCount();
    }
};

// 当DOM加载完成后初始化购物车
document.addEventListener('DOMContentLoaded', function() {
    CartManager.init();
});

// Apply discount
function applyDiscount(percentage) {
    const cart = getCart();
    const subtotal = calculateSubtotal(cart);
    const discount = subtotal * (percentage / 100);
    const shipping = calculateShipping(subtotal);
    const tax = calculateTax(subtotal);
    const total = subtotal + shipping + tax - discount;
    
    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('shipping').textContent = `$${shipping.toFixed(2)}`;
    document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
}

// Update shipping
function updateShipping(cost) {
    const cart = getCart();
    const subtotal = calculateSubtotal(cart);
    const tax = calculateTax(subtotal);
    const total = subtotal + cost + tax;
    
    document.getElementById('shipping').textContent = cost === 0 ? 'FREE' : `$${cost.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
}
