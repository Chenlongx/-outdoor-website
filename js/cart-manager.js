// 购物车管理器
const CartManager = {
    // 获取购物车中的商品
    getCartItems() {
        const cartItems = localStorage.getItem('cart');
        // console.log('CartManager: 从localStorage获取的原始购物车数据:', cartItems);
        try {
            const parsedItems = cartItems ? JSON.parse(cartItems) : [];
            // console.log('CartManager: 解析后的购物车数据:', parsedItems);
            return parsedItems;
        } catch (e) {
            // console.error('CartManager: 解析购物车数据时出错:', e);
            return [];
        }
    },

    // 保存购物车商品
    saveCartItems(items) {
        if (!Array.isArray(items)) {
            console.warn('CartManager: items不是数组:', items);
            items = [];
        }
        // console.log('CartManager: 保存到localStorage的购物车数据:', items);
        localStorage.setItem('cart', JSON.stringify(items));
        this.updateCartCount();
        this.updateCartUI();
    },

    // 添加商品到购物车
    addToCart(product) {
        // console.log('CartManager: 添加到购物车的产品:', product);
        const cartItems = this.getCartItems();
        const existingItem = cartItems.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            // 确保产品图片路径正确保存
            const productToAdd = {
                ...product,
                image: product.image_url || product.image, // 优先使用image_url，如果没有则使用image
                quantity: 1
            };
            // console.log('CartManager: 处理后的产品数据:', productToAdd);
            cartItems.push(productToAdd);
        }

        this.saveCartItems(cartItems);
        this.updateCartCount();
        return true;
    },

    // 更新购物车数量显示
    updateCartCount() {
        const cartItems = this.getCartItems();
        const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
        
        // 更新购物车图标上的数量
        const cartIcon = document.querySelector('.fa-shopping-cart');
        if (cartIcon) {
            const cartCountElement = document.querySelector('.cart-count');
            if (cartCountElement) {
                cartCountElement.textContent = cartCount;
                cartCountElement.style.display = cartCount > 0 ? 'block' : 'none';
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

    // 更新购物车UI
    updateCartUI() {
        const cartItems = this.getCartItems();
        const cartItemsContainer = document.getElementById('cart-items-container');
        const cartItemCount = document.getElementById('cart-item-count');
        
        if (!cartItemsContainer) {
            // console.warn('CartManager: 未找到购物车容器');
            return;
        }
    
        // 添加检查，确保 cartItems 是数组
        if (!Array.isArray(cartItems)) {
            // console.error('CartManager: cartItems不是数组:', cartItems);
            cartItemsContainer.innerHTML = '<div class="empty-cart">Your shopping cart is empty</div>';
            this.updateCartSummary();
            return;
        }
    
        // 更新商品数量显示
        if (cartItemCount) {
            cartItemCount.textContent = cartItems.length.toString();
        }
    
        if (cartItems.length === 0) {
            cartItemsContainer.innerHTML = '<div class="empty-cart">Your shopping cart is empty</div>';
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
            // 确保price是数字类型
            const price = parseFloat(item.price || 0);
            const total = price * (parseInt(item.quantity || 1));
            
            // 获取产品图片
            let imagePath = item.image || 'https://via.placeholder.com/150x150?text=No+Image';
            console.log("CartManager: 获取到的图片地址：" + imagePath);
            
            // 检查图片路径是否有效
            if (!imagePath || imagePath === 'undefined' || imagePath === 'null') {
                imagePath = 'https://via.placeholder.com/150x150?text=No+Image';
            }
            
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

    // 初始化购物车事件监听器
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

    // 从购物车中移除商品
    removeFromCart(itemId) {
        const cartItems = this.getCartItems();
        const updatedItems = cartItems.filter(item => item.id !== itemId);
        this.saveCartItems(updatedItems);
        showNotification('Item has been removed from cart');
    },

    // 保存商品到稍后购买
    saveForLater(itemId) {
        const cartItems = this.getCartItems();
        const item = cartItems.find(item => item.id === itemId);
        if (item) {
            // 这里可以实现保存到"稍后购买"的功能
            showNotification('Item has been saved for later');
        }
    },

    // 更新商品数量
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

    // 更新商品数量输入
    updateQuantityInput(itemId, value) {
        const cartItems = this.getCartItems();
        const item = cartItems.find(item => item.id === itemId);
        if (item) {
            item.quantity = value;
            this.saveCartItems(cartItems);
        }
    },

    // 更新购物车摘要
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

    // 计算小计
    calculateSubtotal(cartItems) {
        return cartItems.reduce((total, item) => {
            return total + (parseFloat(item.price || 0) * (parseInt(item.quantity || 1)));
        }, 0);
    },

    // 计算运费
    calculateShipping(subtotal) {
        return subtotal > 100 ? 0 : 10; // Free shipping over $100
    },

    // 计算税费
    calculateTax(subtotal) {
        return subtotal * 0.08; // 8% tax
    },

    // 初始化购物车
    init() {
        this.updateCartUI();
        this.updateCartCount();
    }
};

// 当DOM加载完成后初始化购物车
document.addEventListener('DOMContentLoaded', function() {
    CartManager.init();
}); 