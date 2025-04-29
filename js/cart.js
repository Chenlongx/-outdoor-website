document.addEventListener('DOMContentLoaded', function() {
    // Initialize cart functionality
    initCart();

    renderPayPalButton();

    // 继续购物按钮
    const continueShoppingBtn = document.querySelector('.continue-shopping');
    if (continueShoppingBtn) {
        continueShoppingBtn.addEventListener('click', function() {
            window.location.href = '../index.html';
        });
    }

    // 更新购物车按钮
    const updateCartBtn = document.querySelector('.update-cart');
    if (updateCartBtn) {
        updateCartBtn.addEventListener('click', function() {
            updateCartDisplay();
            updateOrderSummary();
            showNotification('Shopping cart updated');
        });
    }

    // 结帐按钮
    // const checkoutBtn = document.querySelector('.checkout-btn');
    // if (checkoutBtn) {
    //     checkoutBtn.addEventListener('click', function() {
    //         const cart = getCart();
    //         if (cart.length === 0) {
    //             showNotification('Shopping cart is empty', 'error');
    //             return;
    //         }
    //         showNotification('Redirecting to checkout page...', 'info');
    //         // In a real application, this would redirect to the checkout page
    //     });
    // }else {
    //     console.warn('.checkout-btn not found');
    // }

    // 渲染 PayPal 按钮
    async function renderPayPalButton() {
        const paypalButtons = window.paypal.Buttons({
            style: {
                shape: 'rect',
                layout: 'vertical',
                color: 'gold',
                label: 'paypal',
            },
            // 动态计算并传递总金额
            createOrder: async function(data, actions) {
                const cart = getCart(); // 获取购物车信息
    
                // 计算购物车总金额
                const subtotal = calculateSubtotal(cart); // 计算小计
                console.log("计算小计" + subtotal)
                const shipping = calculateShipping(subtotal); // 计算运费
                console.log("计算运费" + shipping)
                const totalAmount = (subtotal + shipping).toFixed(2); // 总金额 = 小计 + 运费
                
                // 需要返回后端验证商品的价格


                // 创建订单并返回给 PayPal
                return actions.order.create({
                    purchase_units: [{
                        amount: {
                            currency_code: 'USD',
                            value: totalAmount, // 订单总金额
                            breakdown: {
                                item_total: {
                                    currency_code: 'USD',
                                    value: subtotal.toFixed(2), // 小计
                                },
                                shipping: {
                                    currency_code: 'USD',
                                    value: shipping.toFixed(2), // 运费
                                },
                            },
                        },
                        items: cart.map(item => ({
                            name: item.name,
                            unit_amount: {
                                currency_code: 'USD',
                                value: parseFloat(item.price).toFixed(2), // 商品单价
                            },
                            quantity: item.quantity,
                        })),
                    }],
                });
            },
    
            // 支付成功后的处理
            onApprove: async function(data, actions) {
                // 处理支付成功的情况
                return actions.order.capture().then(function(details) {
                    // 获取客户的昵称
                    console.log("Payment details: ", JSON.stringify(details, null, 2));
                    // 获取完整的收货地址信息
                    const shippingAddress = details.purchase_units[0].shipping.address;
            
                    // 打印完整的收货地址信息
                    // console.log('Shipping Address:', shippingAddress);

                    // 客户信息
                    const email_address = details.payer.email_address;
                    const fullName = details.purchase_units[0].shipping.name.full_name;
                    const given_name = details.payer.name.given_name;
                    const surname = details.payer.name.surname;
                    console.log('email:', email_address)
                    console.log('Full Name:', fullName);
                    console.log('given_name:', given_name)
                    console.log('surname:', surname)
                    
                    // 获取并打印各个字段
                    const streetAddress = shippingAddress.address_line_1 || 'Address not provided';
                    const city = shippingAddress.admin_area_2 || 'City not provided';
                    const state = shippingAddress.admin_area_1 || 'State not provided';
                    const postalCode = shippingAddress.postal_code || 'Postal code not provided';
                    const countryCode = shippingAddress.country_code || 'Country not provided';
                    // 输出地址信息
                    console.log('国家:', countryCode);
                    console.log('城市:', city);
                    console.log('街道地址:', streetAddress);
                    console.log('邮政编码:', postalCode);
                    console.log('状态:', state);
                    // 交易成功后处理（比如跳转到感谢页面）
                    // alert('交易完成 ' + details.payer.name.given_name);

                    console.log("交易完成！！！！！！！！！")
                    // 携带信息转跳至另一个页面，如果客户有相关的地址信息，自动填写进去，并且让客户确认是否正确，如错误可以自行修改
                    // window.location.href = '/thank-you';
                });
            },
    
            // 支付失败的处理
            onCancel: function(data) {
                alert('交易已取消');
            },
    
            // 错误处理
            onError: function(error) {
                // 付款失败转跳到whatsapp客户联系页面
                console.error('付款处理过程中出现错误:', error);
                // alert('付款过程中出现问题');
                
            }
        });
    
        // 渲染 PayPal 按钮
        paypalButtons.render('#paypal-button-container');
    }

    // 获取总金额
    function getTotalAmount() {
        const cart = getCart();
        const subtotal = calculateSubtotal(cart);
        const shippingCost = localStorage.getItem('shippingCost') || 10;  // 从 localStorage 获取运费
        return (subtotal + parseFloat(shippingCost)).toFixed(2);  // 返回总金额（小计 + 运费）
    }

    // 获取购物车数据
    function getCart() {
        const cart = localStorage.getItem('cart');
        return cart ? JSON.parse(cart) : [];
    }


    // 向用户显示结果的示例函数。您可以使用您网站的 UI 库。
    function resultMessage(message) {
        const container = document.querySelector("#result-message");
        container.innerHTML = message;
    }


    // 监听运费选择变化
    // const shippingSelect = document.getElementById('shipping-options');
    // if (shippingSelect) {
    //     shippingSelect.addEventListener('change', function() {
    //         console.log
    //         updateOrderSummary(); // 运送方式改变时更新购物车摘要
    //     });
    // }

    // 应用促销代码按钮
    const promoBtn = document.querySelector('.promo-input button');
    if (promoBtn) {
        promoBtn.addEventListener('click', function() {
            const promoInput = document.querySelector('.promo-input input');
            if (promoInput && promoInput.value.trim()) {
                // 获取用户输入的优惠码
                const promoCode = promoInput.value.trim().toUpperCase();

                // 获取产品的价格（计算好的价格），从localStorage中获取购物车的商品（商品的ID），然后提交到后端进行计算价格
                // const cartItems = localStorage.getItem('cart');
                // console.log(cartItems)

                // 获取购物车中的所有商品
                const cartItems = getCart();  // 假设你有一个getCart()函数返回购物车中的商品数组
                let totalProductPrice = 0;

                // 计算购物车中所有商品的总价
                cartItems.forEach(item => {
                    totalProductPrice += parseFloat(item.price) * item.quantity;
                });

                // 限制价格为两位小数
                const productPrice = totalProductPrice.toFixed(2);
                console.log("前端商品的总价: $" + productPrice);

                // 判断购物车总价是否超过49美元
                if (totalProductPrice < 49) {
                    showNotification('Total cart price must be at least $49 to apply a promo code.', 'error');
                    return; // 如果不符合条件，直接返回，不再执行后续代码
                }

                // 发送优惠码到后端进行校验
                fetch('/.netlify/functions/verify-promo-code', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        promoCode: promoCode,
                    }),
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // 如果优惠码有效，应用折扣
                        applyDiscount(data.discount); // 假设后端返回折扣值
                        showNotification(`Coupon code applied: ${data.discount}% off!`, 'success');

                        // 使用优惠码优惠百分之25%

                    } else {
                        // 如果优惠码无效
                        showNotification('Invalid coupon code, please try again.', 'error');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    showNotification('There was an error with coupon code validation.', 'error');
                });
            } else {
                showNotification('Please enter the discount code。', 'error');
            }
        });
    }
    // 初始化推荐产品
    initSuggestedProducts();

    // document.querySelector('.checkout-btn').addEventListener('click', function(e) {
    //     e.preventDefault(); // 阻止正常提交
    //     document.getElementById('custom-modal').style.display = 'flex'; // 显示弹窗
    // });
    // 转跳到弹窗页面
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

    // 监听本地存储的变化
    window.addEventListener('storage', (e) => {
        if (e.key === 'cart') {
            updateCartCount();  // 更新购物车数量
        }
    });
});

// 初始化购物车功能
function initCart() {
    updateCartDisplay();
    updateOrderSummary();
    updateCartCount();
}

// 更新购物车显示
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

    // 事件委托，避免重复绑定
    cartItemsContainer.removeEventListener('click', handleCartItemClick); // 移除已有的事件监听器
    cartItemsContainer.addEventListener('click', handleCartItemClick);  // 绑定新的事件监听器

    // 添加事件委托
    cartItemsContainer.querySelectorAll('input[type="number"]').forEach(input => {
        input.addEventListener('change', (e) => {
            const productId = e.target.closest('.cart-item').dataset.productId;
            updateQuantityInput(productId, e.target.value);
        });
    }, { once: true });
}


// 处理购物车项的点击事件
function handleCartItemClick(e) {
    const target = e.target.closest('button');
    if (!target) return;

    // 尝试查找包含 cart-item 类的父元素
    const cartItem = target.closest('.cart-item');
    if (!cartItem) return;  // 如果没有找到，直接返回

    const productId = target.closest('.cart-item').dataset.productId;

    if (target.classList.contains('remove-item')) {
        e.stopPropagation();
        removeFromCart(productId);
    } else if (target.classList.contains('save-for-later')) {
        saveForLater(productId);
    } else if (target.classList.contains('decrease')) {
        updateQuantity(productId, -1);
    } else if (target.classList.contains('increase')) {
        updateQuantity(productId, 1);
    }
}


// 创建购物车商品元素
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
            <button class="remove-item">
                <i class="fas fa-trash-alt"></i> Remove
            </button>
            <button class="save-for-later">
                <i class="far fa-heart"></i> Save for Later
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

// 更新订单摘要
function updateOrderSummary() {
    const cart = getCart();
    const subtotal = calculateSubtotal(cart);
    const shipping = calculateShipping(subtotal);
    
    // const tax = calculateTax(subtotal);
    // const total = subtotal + shipping + tax;
    // 确保 subtotal 和 shipping 都是有效的数值
    if (isNaN(subtotal) || isNaN(shipping)) {
        console.error("Subtotal or shipping is invalid");
        return;
    }
    const total = subtotal + shipping;  // 只计算小计和运费

    const subtotalElement = document.getElementById('subtotal');
    const shippingElement = document.getElementById('shipping');
    // const taxElement = document.getElementById('tax');
    const totalElement = document.getElementById('total');

    if (subtotalElement) {
        subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
        console.log("shippingElement" + subtotal.toFixed(2))
    } else {
        console.warn('subtotal element not found');
    }

    if (shippingElement) {
        shippingElement.textContent = `$${shipping.toFixed(2)}`;
        console.log("shippingElement" + subtotal.toFixed(2));
    } else {
        console.warn('shipping element not found');
    }

    // if (taxElement) {
    //     taxElement.textContent = `$${tax.toFixed(2)}`;
    // } else {
    //     console.warn('tax element not found');
    // }

    if (totalElement) {
        totalElement.textContent = `$${total.toFixed(2)}`;
    } else {
        console.warn('total element not found');
    }
}


// 计算小计
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

// 计算运费
// function calculateShipping(subtotal) {
//     return subtotal > 49 ? 0 : 10;
// }
function calculateShipping(subtotal, selectedShippingCost) {
    // 如果购物车小计大于49美元，免运费
    if (subtotal > 49) {
        return 0;  // 满49免运费
    }

    // 否则返回选择的运费（可以是标准或加急运费）
    return selectedShippingCost;
}

// 计算税额
// function calculateTax(subtotal) {
//     return subtotal * 0.08; // 8% tax
// }

// 获取购物车数据
function getCart() {
    const cart = localStorage.getItem('cart');
    try {
        return cart ? JSON.parse(cart) : [];
    } catch (e) {
        console.error('Error parsing cart data:', e);
        return [];
    }
}

// 保存购物车数据
function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// 从购物车中移除商品
function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
    updateCartDisplay();
    updateOrderSummary();
    updateCartCount();
    showNotification('Item has been removed from cart');
}

// 更新数量
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

// 通过输入更新数量
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

// 保存以供稍后使用
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

// 更新购物车计数徽章
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

// 显示空购物车消息
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

// 数量变化后更新购物车
function updateCart() {
    // This would typically sync with a backend or localStorage
    // For demo purposes, we just recalculate totals
    updateCartDisplay();
}

// 初始化推荐产品
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

// 通知系统
function showNotification(message, type = 'success') {
    // 检查通知容器是否存在
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

// 购物车管理核心功能
window.CartManager = window.CartManager || {
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

    // 将购物车商品保存到本地存储
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

        const originalPrice = parseFloat(product.price) || 0;
        const discountRate = parseFloat(product.discount) || 1;
        const discountedPrice = (originalPrice * discountRate).toFixed(2);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cartItems.push({
                ...product,
                price: discountedPrice,
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

    // 更新购物车 UI
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

        // 更新购物车商品显示
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

    // 初始化购物车事件监听器
    initCartEventListeners() {
        // 删除项目按钮
        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', (e) => {
                const cartItem = e.target.closest('.cart-item');
                const itemId = cartItem.dataset.id;
                this.removeFromCart(itemId);
            });
        });

        // 稍后保存按钮
        document.querySelectorAll('.save-for-later').forEach(button => {
            button.addEventListener('click', (e) => {
                const cartItem = e.target.closest('.cart-item');
                const itemId = cartItem.dataset.id;
                this.saveForLater(itemId);
            });
        });

        // 数量按钮
        document.querySelectorAll('.quantity-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const cartItem = e.target.closest('.cart-item');
                const itemId = cartItem.dataset.id;
                const isIncrease = e.target.classList.contains('increase');
                this.updateQuantity(itemId, isIncrease ? 1 : -1);
            });
        });

        // 数量输入
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

        // 继续购物按钮
        const continueShoppingBtn = document.querySelector('.continue-shopping');
        if (continueShoppingBtn) {
            continueShoppingBtn.addEventListener('click', () => {
                window.location.href = '../index.html';
            });
        }

        // 更新购物车按钮
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
        // showNotification('Item has been removed from cart');
    },

    // 保存项目以供稍后使用
    saveForLater(itemId) {
        const cartItems = this.getCartItems();
        const item = cartItems.find(item => item.id === itemId);
        if (item) {
            // 这里可以实现保存到"稍后购买"的功能
            showNotification('Item has been saved for later');
        }
    },

    // 更新数量
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

    // 更新数量输入
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
        // const shipping = this.calculateShipping(subtotal);
        // 判断客户是否选择加急，若选择还是需要添加计算运费的
        // 获取用户选择的运送方式
        const shippingSelect = document.getElementById('shipping-options');
        const selectedShippingCost = shippingSelect ? parseFloat(shippingSelect.value) : 10; // 默认10为标准运费
        
        console.log("selectedShippingCost" + selectedShippingCost)
        // 计算运费
        const shipping = this.calculateShipping(subtotal, selectedShippingCost); // 传递选择的运费到 calculateShipping

        // const tax = this.calculateTax(subtotal);
        // const total = subtotal + shipping + tax;
        // 总价（不包括税收）
        const total = subtotal + shipping;

        // 更新摘要元素
        const subtotalElement = document.getElementById('subtotal');
        const shippingElement = document.getElementById('shipping');
        // const taxElement = document.getElementById('tax');
        const totalElement = document.getElementById('total');

        if (subtotalElement) subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
        if (shippingElement) shippingElement.textContent = `$${shipping.toFixed(2)}`;
        // if (taxElement) taxElement.textContent = `$${tax.toFixed(2)}`;
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
        return subtotal > 49 ? 0 : 10; // 超过 49 美元即可免费送货
    },

    // 计算税额
    // calculateTax(subtotal) {
    //     return subtotal * 0.08; // 8% tax
    // },

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

// 申请折扣
function applyDiscount(percentage) {
    const cart = getCart();
    const subtotal = calculateSubtotal(cart);
    const discount = subtotal * (percentage / 100);
    const shipping = calculateShipping(subtotal);
    // const tax = calculateTax(subtotal);
    // const total = subtotal + shipping + tax - discount;
    const total = subtotal + shipping - discount;  // 计算总金额时不涉及税费
    
    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('shipping').textContent = `$${shipping.toFixed(2)}`;
    // document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
}

// 更新运输
function updateShipping(cost) {
    const cart = getCart();
    const subtotal = calculateSubtotal(cart);
    // const tax = calculateTax(subtotal);
    // const total = subtotal + cost + tax;
    const total = subtotal + cost;  // 不再涉及税费
    
    document.getElementById('shipping').textContent = cost === 0 ? 'FREE' : `$${cost.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
}
