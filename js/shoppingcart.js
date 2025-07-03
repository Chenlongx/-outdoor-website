// ✅ 添加：在最顶部定义 window.CartManager，用于管理购物车数据的持久化
// 这使得购物车数据在用户会话期间保持不变，即使关闭浏览器再打开也能保留。
window.CartManager = {
    // 获取购物车中的所有商品
    getCartItems: function () {
        const cart = localStorage.getItem('cart');
        try {
            // 尝试解析存储的购物车数据，如果为空则返回空数组
            const parsedCart = cart ? JSON.parse(cart) : [];
            return parsedCart;
        } catch (e) {
            // 解析错误时记录日志并返回空数组，避免程序崩溃
            console.error('Error parsing cart data:', e); // 解析购物车数据错误
            return [];
        }
    },
    // 保存购物车商品到本地存储
    saveCartItems: function (cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
    },
};

// 用于记录当前成功应用的优惠码，全局变量
let appliedPromoCode = null;

// 当前结账步骤，初始化为第一步
let currentStep = 1;
// 结账总步数
const maxStep = 3;

// 新增：用于存储从 countries.json 加载的数据
let countriesData = {};

// 新增：加载国家和地区数据并填充下拉列表
async function loadCountriesAndStates() {
    try {
        const response = await fetch('../countries.json'); // 假设 countries.json 在与 shoppingcart.js 相同的目录
        countriesData = await response.json();
        populateCountries(); // 填充国家下拉列表
    } catch (error) {
        console.error('Error loading countries data:', error); // 加载国家数据时出错
    }
}

// 新增：填充国家下拉列表
function populateCountries() {
    const countrySelect = document.getElementById('country');
    if (countrySelect) {
        // 清空现有选项，只保留“选择国家”
        countrySelect.innerHTML = '<option value="">Select country</option>';
        for (const code in countriesData) {
            const option = document.createElement('option');
            option.value = code;
            option.textContent = countriesData[code].name;
            countrySelect.appendChild(option);
        }
    }
}

// 新增：根据选择的国家填充州/省下拉列表
function populateStates(countryCode) {
    const stateSelect = document.getElementById('state');
    if (stateSelect) {
        stateSelect.innerHTML = '<option value="">Select state</option>'; // 清空现有选项

        if (countryCode && countriesData[countryCode] && countriesData[countryCode].states) {
            countriesData[countryCode].states.forEach(state => {
                const option = document.createElement('option');
                option.value = state;
                option.textContent = state;
                stateSelect.appendChild(option);
            });
        }
    }
}


// Payment processing 付款处理 (现在主要用于调用 PayPal SDK 处理支付)
async function processPayment() {
    const loadingOverlayElement = document.getElementById('loading-overlay');

    if (loadingOverlayElement) { // 再次检查元素是否存在
        showLoadingOverlay(); // 显示加载动画
        await new Promise(resolve => setTimeout(resolve, 2000)); // 模拟网络请求

        // 确保在隐藏时元素仍然存在
        if (document.getElementById('loading-overlay')) {
            hideLoadingOverlay(); // 隐藏加载动画
        } else {
            console.warn('Warning: #loading-overlay element disappeared before hiding it.');
        }
    } else {
        console.error('Error: #loading-overlay element not found when trying to show/hide.');
    }

    const orderNumber = `SUMMIT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    showSuccessModal(orderNumber);

    const nextBtn = document.getElementById('next-btn'); // 确保 ID 与 HTML 匹配

    // 显示加载状态，禁用按钮
    nextBtn.classList.add('loading');
    nextBtn.disabled = true;
    nextBtn.textContent = 'Processing...'; // 处理中...
}


function loadPayPalSDK() {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://www.paypal.com/sdk/js?client-id=Abbe3Rs_UB-zn_sQ7z0QGQog51tqtHHKqlFFbcY4VLJDCMGNGudxWXnA0ODyjkFPr6gPMnF4cuTE8nNf&currency=USD&locale=en_US';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('PayPal SDK 加载失败'));
        document.head.appendChild(script);
    });
}

// Initialize app 初始化应用程序
// 当 DOM 内容加载完毕时执行
document.addEventListener('DOMContentLoaded', () => {
    
    // 从原先的结账脚本保留的 UI 相关初始化
    updateStepButtons(); // 更新步骤按钮的显示状态（“下一步”、“上一步”）
    initializeFormValidation(); // 初始化表单验证，用于收货地址等表单
    initializePaymentMethods(); // 初始化支付方式的选择逻辑

    // 调用加载国家和地区数据的函数
    loadCountriesAndStates();

    // 为国家选择框添加事件监听器，当国家改变时更新州/省列表
    const countrySelect = document.getElementById('country');
    if (countrySelect) {
        countrySelect.addEventListener('change', function() {
            populateStates(this.value);
        });
    }

    // 从 cart.js 引入的购物车核心初始化逻辑
    initCart(); // 初始化购物车商品的显示、订单摘要的计算和购物车数量徽章的更新
    // renderPayPalButton(); // 渲染 PayPal 支付按钮到指定容器

    // 从 cart.js 引入的其他事件监听器

    // “继续购物”按钮的事件监听器
    const continueShoppingBtn = document.querySelector('.continue-shopping');
    if (continueShoppingBtn) {
        continueShoppingBtn.addEventListener('click', function () {
            // 点击后跳转到首页或产品列表页
            window.location.href = '../index.html';
        });
    }

    // “更新购物车”按钮的事件监听器 (如果您的 HTML 中有此按钮)
    const updateCartBtn = document.querySelector('.update-cart');
    if (updateCartBtn) {
        updateCartBtn.addEventListener('click', function () {
            // 手动点击更新时，刷新购物车显示和订单摘要
            updateCartDisplay();
            updateOrderSummary();
            showNotification('Shopping cart updated'); // 显示“购物车已更新”通知
        });
    }

    // ✅ 添加：监听所有商品变体选择器（variant-select）的变化
    // 用户在购物车页面更改商品颜色、尺寸等选项时，更新购物车数据
    document.querySelectorAll('.variant-select').forEach(select => {
        select.addEventListener('change', function () {
            const productId = this.dataset.productId; // 获取商品 ID
            const variantLabel = this.dataset.variant; // 获取变体标签（例如 'color'）
            const selectedValue = this.value; // 获取选中的值

            let cart = window.CartManager.getCartItems(); // 获取当前购物车数据
            const item = cart.find(p => String(p.id) === String(productId)); // 找到对应的商品项

            if (item) {
                // 如果是颜色变体，更新 selectedColor 属性
                if (variantLabel === 'color') {
                    item.selectedColor = selectedValue;
                }
                // 对于其他类型的变体（如果存在），也可以在这里添加逻辑更新商品项的相应属性
                // item[variantLabel] = selectedValue; // 示例：更新通用变体属性
                window.CartManager.saveCartItems(cart); // 保存更新后的购物车数据
                updateCartDisplay(); // 刷新购物车显示，以反映变体变化
            } else {
                console.warn(`Product with id ${productId} not found in cart.`); // 警告：购物车中未找到该商品
            }
        });
    });

    // “应用促销代码”按钮的事件监听器 (逻辑从旧 cart.js 复制并整合)
    const promoBtn = document.querySelector('.promo-input button');
    if (promoBtn) {
        promoBtn.addEventListener('click', function () {
            const promoInput = document.querySelector('.promo-input input');
            // 检查输入框是否有值
            if (promoInput && promoInput.value.trim()) {
                const promoCode = promoInput.value.trim().toUpperCase(); // 获取并转换为大写
                const cartItems = getCart(); // 获取购物车商品
                let totalProductPrice = 0;
                // 计算购物车中所有商品的总价（不含运费和折扣前）
                cartItems.forEach(item => {
                    totalProductPrice += parseFloat(item.price) * item.quantity;
                });

                // 验证总价是否满足优惠码的最低要求
                if (totalProductPrice < 49) {
                    showNotification('Total cart price must be at least $49 to apply a promo code.', 'error'); // 总购物车价格必须至少为 49 美元才能应用促销代码。
                    return;
                }

                showLoadingOverlay(); // 显示加载遮罩，表示正在处理

                // 发送请求到 Netlify 函数进行优惠码验证
                fetch('/.netlify/functions/consume-promo-code', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ promoCode: promoCode }),
                })
                    .then(response => response.json())
                    .then(data => {
                        hideLoadingOverlay(); // 隐藏加载遮罩
                        if (data.success) {
                            applyDiscount(data.discount_percentage); // 调用函数应用折扣
                            showNotification(`Coupon code applied: ${data.discount_percentage}% off!`, 'success'); // 显示成功通知
                            appliedPromoCode = promoCode; // 保存当前应用的优惠码
                            const discountAmountElement = document.getElementById('discount-amount');
                            if (discountAmountElement) {
                                // 显示实际的折扣金额
                                const discountValue = totalProductPrice * (data.discount_percentage / 100);
                                discountAmountElement.textContent = `-$${discountValue.toFixed(2)}`;
                            }
                        } else {
                            // 根据后端返回的错误代码显示不同的错误信息
                            switch (data.error_code) {
                                case 1001: showNotification('Please enter a promo code.', 'error'); break; // 请输入优惠码。
                                case 1003: showNotification('This promo code does not exist.', 'error'); break; // 此促销代码不存在。
                                case 1004: showNotification('This promo code has already been used.', 'error'); break; // 此促销代码已使用。
                                case 1005: showNotification('This promo code has expired.', 'error'); break; // 此促销代码已过期。
                                default: showNotification(data.message || 'An error occurred. Please try again.', 'error'); // 发生错误。请再试一次。
                            }
                        }
                    })
                    .catch(error => {
                        // 请求失败时的错误处理
                        hideLoadingOverlay();
                        console.error('Error:', error);
                        showNotification('There was an error with coupon code validation.', 'error'); // 优惠券代码验证出现错误。
                        const discountAmountElement = document.getElementById('discount-amount');
                        if (discountAmountElement) {
                            discountAmountElement.textContent = '-$0.00'; // 清空折扣显示
                        }
                        appliedPromoCode = null; // 清除已应用的优惠码
                        updateOrderSummary(); // 重新计算并更新订单总价
                    });
            } else {
                // 如果促销代码输入为空
                showNotification('Please enter the discount code。', 'error'); // 请输入折扣码。
                const discountAmountElement = document.getElementById('discount-amount');
                if (discountAmountElement) {
                    discountAmountElement.textContent = '-$0.00'; // 清空折扣显示
                }
                appliedPromoCode = null; // 清除已应用的优惠码
                updateOrderSummary(); // 重新计算并更新订单总价
            }
        });
    }

    // 结账按钮点击时显示自定义弹窗的逻辑
    const checkoutbtn = document.querySelector('.checkout-btn');
    const modal = document.getElementById('custom-modal');
    if (checkoutbtn && modal) {
        checkoutbtn.addEventListener('click', function (e) {
            e.preventDefault(); // 阻止默认的表单提交行为
            modal.style.display = 'flex'; // 显示弹窗
        });
    }

    // 关闭自定义弹窗的按钮事件监听器
    const closeBtn = document.getElementById('close-modal');
    const closemodal = document.getElementById('custom-modal');
    if (closeBtn && closemodal) {
        closeBtn.addEventListener('click', function () {
            closemodal.style.display = 'none'; // 隐藏弹窗
        });
    }

    // “联系支持”按钮的事件监听器
    const contactBtn = document.getElementById('contact-support');
    if (contactBtn) {
        contactBtn.addEventListener('click', function () {
            // 跳转到 WhatsApp 联系页面
            window.location.href = 'https://wa.me/8613326425565?text=Hello,%20I%20want%20to%20place%20an%20order';
        });
    }

    // 监听本地存储（localStorage）的变化
    window.addEventListener('storage', (e) => {
        // 当 'cart' 键的数据发生变化时，更新购物车数量显示
        if (e.key === 'cart') {
            updateCartCount();
        }
    });

    // 用户图标链接的事件监听器
    const userIconLink = document.getElementById('userIconLink');
    if (userIconLink) {
        userIconLink.addEventListener('click', function (event) {
            // 显示注册功能即将推出的提示
            showRegistrationComingSoon(event);
        });
    }
});


// Step navigation functions 步骤导航功能
// “下一步”按钮点击事件处理
async function nextStep() {
    // 如果当前步骤未达到最大步骤
    if (currentStep < maxStep) {
        // 验证当前步骤的表单数据是否有效
        if (validateCurrentStep()) {
            currentStep++; // 移动到下一步
            updateStepDisplay(); // 更新步骤显示
            updateStepButtons(); // 更新步骤按钮
        }
    } else {
        // 如果已是最后一步，执行支付处理逻辑
        try {
            // 假设 processPayment() 是一个异步函数，并且它会处理自己的加载状态
            await processPayment(); // 等待支付处理完成
            // 如果 processPayment() 也会显示成功模态框，则此处无需额外添加。
            // 任何支付成功后的操作（例如清空购物车）可以在这里处理，
            // 或者在 processPayment() 函数内部，或者在成功模态框的“继续购物”按钮中处理。
        } catch (error) {
            console.error('支付处理失败:', error);
            // 处理支付失败的情况：
            // 1. 隐藏加载覆盖层（如果它仍然可见的话，processPayment() 理论上应该处理这个）
            // 2. 向用户显示错误消息（例如，使用一个专门的错误模态框或 alert 提示）
            //    示例: alert('处理您的支付时出现问题，请重试。');
            // 3. 可选地，回退到上一步或允许用户重试。
        }
    }
}

// “上一步”按钮点击事件处理
function previousStep() {
    // 如果当前步骤大于第一步
    if (currentStep > 1) {
        currentStep--; // 移动到上一步
        updateStepDisplay(); // 更新步骤显示
        updateStepButtons(); // 更新步骤按钮
    }
}

// 更新步骤显示，高亮当前步骤
function updateStepDisplay() {
    // 更新进度指示器（顶部的数字或图标）
    document.querySelectorAll('.step').forEach((step, index) => {
        const stepNumber = index + 1;
        if (stepNumber <= currentStep) {
            step.classList.add('active'); // 为当前及之前的步骤添加 active 类
        } else {
            step.classList.remove('active');
        }
    });

    // 更新步骤内容区域的显示
    document.querySelectorAll('.step-content').forEach((content, index) => {
        const stepNumber = index + 1;
        if (stepNumber === currentStep) {
            content.classList.add('active'); // 显示当前步骤的内容
        } else {
            content.classList.remove('active'); // 隐藏其他步骤的内容
        }
    });
}

// 更新“上一步”和“下一步”按钮的文本和禁用状态
function updateStepButtons() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    // “上一步”按钮：在第一步时禁用
    prevBtn.disabled = currentStep === 1;

    // “下一步”按钮：在最后一步时显示“完成付款”，否则显示“继续”
    if (currentStep === maxStep) {
        nextBtn.innerHTML = '<i class="fas fa-lock"></i> Complete Payment'; // 完成付款
        nextBtn.className = 'btn btn-primary'; // 确保样式正确
    } else {
        nextBtn.innerHTML = 'Continue'; // 继续
        nextBtn.className = 'btn btn-primary'; // 确保样式正确
    }
}

// ============== 从 cart.js 复制的核心购物车和支付逻辑 START ==============

// // 渲染 PayPal 按钮
// async function renderPayPalButton() {
//     // 检查 PayPal SDK 是否已加载，如果未加载则可能需要稍后重试或显示提示
//     if (!window.paypal) {
//         // console.error("PayPal SDK has not loaded."); // PayPal SDK 未加载。
//         return;
//     }

//     // 用于存储当前订单的商品详情，以便在支付成功后保存到本地
//     let currentOrderItemsForStorage = [];

//     // 初始化 PayPal 按钮
//     const paypalButtons = window.paypal.Buttons({
//         style: {
//             shape: 'rect', // 按钮形状
//             layout: 'vertical', // 垂直布局
//             color: 'gold', // 按钮颜色
//             label: 'paypal', // 按钮标签
//         },
//         locale: 'en_US', // 强制使用英文（美国），可根据需要修改为其他语言代码
//         // createOrder 在用户点击 PayPal 按钮时触发，用于创建订单
//         createOrder: async function (data, actions) {
//             const cart = getCart(); // 获取购物车中的所有商品
//             const shippingSelect = document.getElementById('shipping-options');
//             // 获取用户选择的运费金额，如果元素不存在则默认为 0
//             const selectedShipping = shippingSelect ? parseFloat(shippingSelect.value) : 0;

//             // 向后端（Netlify 函数）发送请求，验证商品价格并计算折扣后的总金额
//             const response = await fetch('/.netlify/functions/validate-price', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({
//                     cart: cart, // 购物车商品
//                     promoCode: appliedPromoCode, // 当前应用的优惠码 (可能为 null)
//                     selectedShipping: selectedShipping // 选中的运费金额
//                 })
//             });

//             const result = await response.json();

//             if (!response.ok) {
//                 throw new Error('Unable to fetch price'); // 无法获取价格
//             }

//             const subtotal = result.subtotal; // 后端计算的折扣后小计
//             const shipping = result.shipping; // 后端计算的运费
//             const totalAmount = result.total; // 后端计算的最终总金额
//             let processedItems = result.items; // 后端返回的包含折扣价格的商品列表

//             // 新增部分：从页面中获取最新的 selectedColor 和其他变体信息
//             // 确保 PayPal 订单详情中包含用户选择的商品变体（如颜色）
//             const updatedProcessedItems = processedItems.map(item => {
//                 // 查找购物车中对应的商品元素
//                 const productElement = document.querySelector(`.cart-item[data-product-id="${item.id}"]`);
//                 let itemVariants = {}; // 用于存储找到的商品变体

//                 if (productElement) {
//                     const variantSelects = productElement.querySelectorAll('.variant-select');
//                     variantSelects.forEach(selectElement => {
//                         const variantLabel = selectElement.dataset.variant;
//                         const selectedValue = selectElement.value;

//                         if (variantLabel) {
//                             itemVariants[variantLabel] = selectedValue; // 存储变体标签和值
//                         }
//                     });
//                 }

//                 let descriptionParts = [];
//                 // 将所有变体信息组合成一个描述字符串
//                 for (const label in itemVariants) {
//                     if (itemVariants.hasOwnProperty(label)) {
//                         descriptionParts.push(`${label}: ${itemVariants[label]}`);
//                     }
//                 }
//                 const combinedDescription = descriptionParts.length > 0 ? descriptionParts.join(', ') : 'No specifications'; // 无规格

//                 return {
//                     ...item, // 包含商品所有原始属性
//                     ...itemVariants, // 包含用户选择的变体属性
//                     description: combinedDescription // 更新商品描述
//                 };
//             });
//             currentOrderItemsForStorage = updatedProcessedItems; // 保存更新后的商品列表，用于 onApprove

//             // 创建 PayPal 订单
//             return actions.order.create({
//                 purchase_units: [{
//                     amount: {
//                         currency_code: 'USD', // 货币代码
//                         value: totalAmount, // 订单总金额
//                         breakdown: {
//                             item_total: {
//                                 currency_code: 'USD',
//                                 value: subtotal.toFixed(2), // 小计（折扣后）
//                             },
//                             shipping: {
//                                 currency_code: 'USD',
//                                 value: shipping.toFixed(2), // 运费
//                             },
//                         },
//                     },
//                     // 将 totalAmount 存储为 custom_id，方便在 onApprove 中访问
//                     custom_id: totalAmount,
//                     // 订单中的商品详情
//                     items: currentOrderItemsForStorage.map(item => ({
//                         name: item.name,
//                         unit_amount: {
//                             currency_code: 'USD',
//                             value: item.unit_amount.toFixed(2),
//                         },
//                         quantity: item.quantity,
//                         description: item.description, // 包含变体信息的商品描述
//                     })),
//                 }],
//             });
//         },

//         // onApprove 在用户成功完成 PayPal 支付时触发
//         onApprove: async function (data, actions) {
//             // 捕获订单详情
//             return actions.order.capture().then(async function (details) {
//                 // 处理优惠码消费：如果使用了优惠码，则通知后端将其标记为已使用
//                 if (appliedPromoCode) {
//                     try {
//                         const res = await fetch('/.netlify/functions/consume-promo-code', {
//                             method: 'POST',
//                             headers: { 'Content-Type': 'application/json' },
//                             body: JSON.stringify({ promoCode: appliedPromoCode, consumed: true }), // 标记为已消费
//                         });
//                         const result = await res.json();
//                         if (result.success) {
//                             console.log('优惠码成功标记为已使用'); // 优惠码成功标记为已使用
//                             appliedPromoCode = null; // 清除变量，避免重复消费
//                         } else {
//                             console.warn('优惠码标记失败:', result.message); // 优惠码标记失败
//                         }
//                     } catch (err) {
//                         console.error('消费优惠码失败:', err); // 消费优惠码失败
//                     }
//                 }

//                 // 从 PayPal 返回的详情中提取订单信息
//                 const totalAmount = details.purchase_units[0].custom_id; // 从 custom_id 获取总金额
//                 const shippingDetails = details.purchase_units[0].shipping;
//                 const shippingAddress = shippingDetails?.address;

//                 const email_address = details.payer.email_address;
//                 const fullName = shippingDetails?.name?.full_name || 'N/A'; // 获取收货人全名
//                 const streetAddress = shippingAddress?.address_line_1 || 'Address not provided'; // 未提供地址
//                 const city = shippingAddress?.admin_area_2 || 'City not provided'; // 未提供城市
//                 const state = shippingAddress?.admin_area_1 || 'State not provided'; // 未提供省/州
//                 const postalCode = shippingAddress?.postal_code || 'Postal code not provided'; // 未提供邮政编码
//                 const countryCode = shippingAddress?.country_code || 'Country not provided'; // 未提供国家

//                 // 构建要保存到后端或本地的订单对象
//                 const order = {
//                     full_name: fullName,
//                     email: email_address,
//                     address_line_1: streetAddress,
//                     city: city,
//                     state: state,
//                     postal_code: postalCode,
//                     country: countryCode,
//                     total_amount: totalAmount,
//                 };

//                 // 构建要保存的商品列表（包含所有相关属性）
//                 const itemsToSave = currentOrderItemsForStorage.map(item => ({
//                     id: item.id,
//                     name: item.name,
//                     price: item.price,
//                     description: item.description,
//                     quantity: item.quantity,
//                     ...item // 包含所有原始属性以及在 createOrder 中添加的变体属性
//                 }));

//                 // 将订单信息和商品列表发送到后端（Netlify 函数）进行存储
//                 const response = await fetch('/.netlify/functions/store-order', {
//                     method: 'POST',
//                     headers: { 'Content-Type': 'application/json' },
//                     body: JSON.stringify({ order: order, items: itemsToSave })
//                 });
//                 const result = await response.json();

//                 if (response.ok) {
//                     console.log('订单已成功保存:', result); // 订单已成功保存
//                     if (result.orderId) {
//                         localStorage.setItem('orderId', result.orderId); // 保存订单 ID
//                     }
//                     localStorage.setItem('orderData', JSON.stringify(order)); // 保存订单数据
//                     localStorage.setItem('orderItems', JSON.stringify(itemsToSave)); // 保存订单商品

//                     // ✅ 这里是关键修改：不再重定向，而是直接显示成功弹窗并重置购物车
//                     showSuccessModal(); // 调用原先的成功模态框，显示支付成功信息
//                     resetCart(); // 重置购物车，清空已支付的商品
//                 } else {
//                     console.error('保存订单时出错:', result); // 保存订单时出错
//                     showNotification('处理订单时出错。请重试。', 'error'); // 处理订单时出错。请重试。
//                 }
//             });
//         },

//         // onCancel 在用户取消 PayPal 支付时触发
//         onCancel: function (data) {
//             showNotification('Transaction Cancelled', 'info'); // 交易已取消
//         },

//         // onError 在 PayPal 支付过程中出现错误时触发
//         onError: function (error) {
//             console.error('付款处理过程中出现错误:', error); // 付款处理过程中出现错误
//             showNotification("Payment error, please contact online customer service", 'error') // 付款错误，请联系在线客服
//         }
//     });

//     // 将 PayPal 按钮渲染到 HTML 中 ID 为 'paypal-button-container' 的元素中
//     paypalButtons.render('#paypal-button-container');
// }

// 获取购物车数据
function getCart() {
    return window.CartManager.getCartItems();
}

// 保存购物车数据
function saveCart(cart) {
    window.CartManager.saveCartItems(cart);
}

// 初始化购物车功能
function initCart() {
    updateCartDisplay(); // 更新购物车商品的列表显示
    updateOrderSummary(); // 更新订单总价、运费、小计等信息
    updateCartCount(); // 更新购物车图标上的商品数量

    // 传入 Netlify 函数地址、推荐商品数量、渲染函数 (如果需要显示推荐商品)
    // fetchAndRenderSuggestedProducts('/.netlify/functions/fetch-products', 3, renderProducts);
}

// 加载遮罩的辅助函数（显示）
function showLoadingOverlay() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.classList.add('active'); // 添加 active 类以显示遮罩
    }
}

// 加载遮罩的辅助函数（隐藏）
function hideLoadingOverlay() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.classList.remove('active'); // 移除 active 类以隐藏遮罩
    }
}

// 显示注册功能即将推出提示
function showRegistrationComingSoon(event) {
    event.preventDefault(); // 阻止默认链接行为
    showNotification("Hi there! Our registration feature isn't quite ready yet, but it's coming soon. Thanks for your patience!"); // 嘿！我们的注册功能尚未完全准备好，但很快就会推出。感谢您的耐心等待！
}

// 更新购物车显示
function updateCartDisplay() {
    // ✅ 修正：获取 ID 为 'cart-items' 的元素，这是您 HTML 中实际的购物车商品容器
    const cartItemsContainer = document.getElementById('cart-items');
    // 如果您在页面顶部有显示购物车商品总数的元素，例如 id="cart-item-count"
    const cartItemCount = document.getElementById('cart-item-count');

    // 确保 cartItemsContainer 元素存在，否则打印警告并退出函数
    if (!cartItemsContainer) {
        console.warn('无法找到 ID 为 "cart-items" 的元素。请确保 shoppingcart.html 中存在此 ID 的 div。');
        return;
    }

    const cart = getCart(); // 从 localStorage 获取购物车数据（假设 getCart() 函数已定义）

    cartItemsContainer.innerHTML = ''; // 清空现有内容，准备重新渲染所有购物车商品

    // 更新购物车商品总数显示（如果 cartItemCount 元素存在）
    if (cartItemCount) {
        cartItemCount.textContent = Array.isArray(cart) ? cart.length.toString() : '0';
    }

    // 如果购物车为空，显示相应的提示信息
    if (!Array.isArray(cart) || cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="empty-cart"><p>您的购物车是空的。现在就开始购物吧！</p></div>';
        return;
    }

    // 遍历购物车中的每个商品，为其创建 HTML 元素并添加到容器中
    cart.forEach(item => {
        const cartItemElement = createCartItemElement(item);
        cartItemsContainer.appendChild(cartItemElement);
    });

    // ✅ 事件委托：为整个 cartItemsContainer 绑定一个点击事件监听器
    // 这可以捕获其内部所有数量增减和移除按钮的点击事件
    // 先移除旧的监听器以防止重复绑定（在 DOM 内容被 innerHTML 清空并重新添加时，这很重要）
    cartItemsContainer.removeEventListener('click', handleCartItemClick);
    cartItemsContainer.addEventListener('click', handleCartItemClick);

    // ✅ 为数量输入框添加 change 事件监听器，同样使用事件委托处理
    // 遍历所有带有 'quantity-input' 类的 input 元素，并为它们绑定事件
    cartItemsContainer.querySelectorAll('input.quantity-input').forEach(input => {
        input.removeEventListener('change', handleQuantityInputChange); // 避免重复绑定
        input.addEventListener('change', handleQuantityInputChange);
    });
}

// 处理购物车项的点击事件（通过事件委托）
function handleCartItemClick(event) {
    const target = event.target; // 获取实际被点击的元素
    const cartItem = target.closest('.cart-item'); // 找到最近的父级 .cart-item 元素

    if (!cartItem) return; // 如果点击的不是购物车项内部的有效元素，则不处理

    const productId = cartItem.dataset.productId; // 从 cart-item 元素的 data-product-id 中获取商品ID
    // 获取点击的按钮上的 data-action 属性，或者从其最近的 button 父级获取
    const action = target.dataset.action || target.closest('button')?.dataset.action;

    if (!productId || !action) return;

    switch (action) {
        case 'minus':
            // 明确调用我们需要的函数
            updateQuantity(productId, -1);
            break;
        case 'plus':
            // 明确调用我们需要的函数
            updateQuantity(productId, 1);
            break;
        case 'remove':
            // JS中定义的函数是 removeFromCart
            removeFromCart(productId);
            break;
    }
}



// 创建单个购物车商品项的 HTML 元素
function createCartItemElement(item) {
    const itemElement = document.createElement('div');
    itemElement.className = 'cart-item';
    itemElement.dataset.productId = item.id; // 用于事件委托识别商品 ID

    // 根据 item.originalPrice 是否存在来调整价格显示，以支持原价和现价的展示
    const priceHtml = item.originalPrice ?
        `<span class="current-price">$${item.price.toFixed(2)}</span>
         <span class="original-price">$${item.originalPrice.toFixed(2)}</span>` :
        `<span class="current-price">$${item.price.toFixed(2)}</span>`;

    // 构建变体选择 HTML (如果商品有颜色、尺寸等变体选项)
    let variantSelectHtml = '';
    if (item.variants && item.variants.length > 0) {
        variantSelectHtml += `<div class="item-variants">`;
        item.variants.forEach(variant => {
            const variantId = `variant-${item.id}-${variant.label}`; // 确保ID的唯一性
            // 假设变体值存储在 item 的同名属性上 (如 item.color)
            const selectedValue = item[variant.label] || '';
            variantSelectHtml += `
                <label for="${variantId}">${variant.label}:</label>
                <select id="${variantId}" class="variant-select" data-product-id="${item.id}" data-variant="${variant.label}">
                    ${variant.options.map(option => `<option value="${option}" ${selectedValue === option ? 'selected' : ''}>${option}</option>`).join('')}
                </select>
            `;
        });
        variantSelectHtml += `</div>`;
    }

    itemElement.innerHTML = `
        <img src="${item.image}" alt="${item.name}" class="item-image">
        <div class="item-details">
            <h3 class="item-name">${item.name}</h3>
            <div class="item-pricing">
                ${priceHtml}
            </div>
            ${variantSelectHtml}
        </div>
        <div class="item-controls">
            <button class="qty-btn minus" data-action="minus">
                <i class="fas fa-minus"></i>
            </button>
            <span class="quantity">${item.quantity}</span>
            <button class="qty-btn plus" data-action="plus">
                <i class="fas fa-plus"></i>
            </button>
            <button class="remove-btn" data-action="remove">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;

    return itemElement;
}

// 更新订单摘要（小计、运费、总计、折扣）
function updateOrderSummary() {
    const cart = getCart(); // 获取购物车数据
    let subtotal = 0;
    let shippingCost = 0;
    const freeShippingThreshold = 49.90; // 免运费门槛，您可以根据需要调整

    cart.forEach(item => {
        // 确保 price 和 quantity 是数字，防止字符串拼接或计算错误
        const price = parseFloat(item.price);
        const quantity = parseInt(item.quantity);

        if (!isNaN(price) && !isNaN(quantity)) {
            subtotal += price * quantity;
        } else {
            console.warn('购物车中发现无效的商品价格或数量:', item);
        }
    });

    // 更新 HTML 元素 - 小计
    const subtotalElement = document.getElementById('subtotal');
    if (subtotalElement) {
        subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    } else {
        console.warn('无法找到 ID 为 "subtotal" 的元素。');
    }

    // 处理折扣金额的显示
    const discountAmountElement = document.getElementById('discount-amount');
    // 假设 appliedPromoCode 和 discountAmountElement 的逻辑已正确处理
    // 如果没有折扣或元素不存在，通常显示为 '-$0.00'
    if (discountAmountElement) {
        // 如果您的折扣逻辑（例如，通过 applyDiscount 函数设置的值）会更新这个元素，
        // 则此处的代码可能需要根据您的实际折扣处理方式进行调整。
        // 暂时保持为默认值，确保不会阻碍其他金额更新。
        if (!appliedPromoCode) { // 如果没有应用优惠码，确保显示为0
            discountAmountElement.textContent = '-$0.00';
        }
        // 如果有优惠码，并且其值由其他逻辑更新，这里不需要再设置
    }

    // 处理运费显示
    // 默认运费逻辑（您可以根据需要调整）
    if (subtotal > 0 && subtotal < freeShippingThreshold) {
        shippingCost = 9.90; // 假设运费为 $5.00
    } else {
        shippingCost = 0; // 达到免运费门槛或购物车为空时免运费
    }
    const shippingElement = document.getElementById('shipping-cost');
    if (shippingElement) {
        shippingElement.textContent = `$${shippingCost.toFixed(2)}`;
    } else {
        console.warn('无法找到 ID 为 "shipping-cost" 的元素。');
    }

    // 总计计算：小计 + 运费 - 折扣 (如果适用)
    let total = subtotal + shippingCost;
    // 如果 discountAmountElement 存在并且其内容表示一个负值折扣
    if (discountAmountElement && discountAmountElement.textContent.startsWith('-$')) {
        const discountValue = parseFloat(discountAmountElement.textContent.replace('-$', ''));
        if (!isNaN(discountValue)) {
            total -= discountValue;
        }
    }

    // 更新 HTML 元素 - 总计
    const totalAmountElement = document.getElementById('total-amount');
    if (totalAmountElement) {
        totalAmountElement.textContent = `$${total.toFixed(2)}`;
    } else {
        console.warn('无法找到 ID 为 "total-amount" 的元素。');
    }

    const orderSummaryTotalElement = document.getElementById('order-summary-total');
    if (orderSummaryTotalElement) {
        orderSummaryTotalElement.textContent = `$${total.toFixed(2)}`;
    } else {
        console.warn('无法找到 ID 为 "order-summary-total" 的元素。');
    }
}


// 计算购物车中所有商品的未折扣小计
function calculateSubtotal(cart) {
    if (!Array.isArray(cart)) {
        return 0;
    }
    return cart.reduce((total, item) => {
        const price = parseFloat(item.price || 0);
        const quantity = parseInt(item.quantity || 1);
        return total + (price * quantity);
    }, 0);
}

// 计算运费：商品总价超过 $49 免运费，否则运费 $10
function calculateShipping(subtotal) {
    if (subtotal === 0) return 0; // 空购物车不收运费
    return subtotal > 49 ? 0 : 10;
}

// 从购物车中移除商品
function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId); // 过滤掉要移除的商品
    saveCart(cart); // 保存更新后的购物车
    updateCartDisplay(); // 更新显示
    updateOrderSummary(); // 更新订单摘要
    updateCartCount(); // 更新购物车数量徽章
    showNotification('Item has been removed from cart', 'info'); // 商品已从购物车中移除
}



// 更新商品数量 (+1 或 -1)
function updateQuantity(productId, change) {
    let cart = getCart();
    const item = cart.find(p => String(p.id) === String(productId)); // 查找商品（确保 ID 类型匹配）
    if (item) {
        const newQuantity = (item.quantity || 1) + change;
        // 确保数量不小于 1
        item.quantity = Math.max(1, newQuantity);

        saveCart(cart);         // 保存更新到 localStorage
        updateCartDisplay();    // 重新渲染整个购物车列表
        updateOrderSummary();   // 更新总价
        updateCartCount();      // 更新顶部数量角标
    } else {
        console.warn(`在 updateQuantity 中未找到 ID 为 ${productId} 的商品。`);
    }
}

// 通过输入框直接修改商品数量
function updateQuantityInput(productId, newQuantityStr) {
    let newQuantity = parseInt(newQuantityStr);
    if (isNaN(newQuantity) || newQuantity < 1) {
        newQuantity = 1; // 确保数量至少为1，避免无效输入
    }

    let cart = getCart(); // 获取当前购物车数据
    const itemIndex = cart.findIndex(item => item.id === productId);

    if (itemIndex > -1) {
        if (cart[itemIndex].quantity !== newQuantity) { // 仅当数量实际发生变化时才执行更新
            cart[itemIndex].quantity = newQuantity;
            saveCart(cart); // 保存更新后的购物车数据到 localStorage
            updateCartDisplay(); // 重新渲染购物车显示
            updateOrderSummary(); // 更新订单摘要
            updateCartCount(); // 更新购物车顶部的商品数量
            showNotification('Shopping cart updated', 'success'); // 显示更新成功的通知
        }
    }
}


/**
 * 处理数量输入框的 change 事件。
 * @param {Event} event - change 事件对象。
 */
function handleQuantityInputChange(event) {
    const target = event.target;
    // 检查事件目标是否是带有 'quantity-input' 类的 input 元素
    if (target.classList.contains('quantity-input')) {
        const productId = parseInt(target.dataset.productId); // 获取对应的商品ID
        const newQuantity = target.value; // 获取输入的新数量
        if (!isNaN(productId)) {
            updateQuantityInput(productId, newQuantity); // 调用更新函数
        }
    }
}

// 将商品移到“稍后保存”列表
function saveForLater(productId) {
    let cart = getCart();
    // 获取或初始化“稍后保存”列表
    let savedItems = JSON.parse(localStorage.getItem('savedItems') || '[]');

    const item = cart.find(item => String(item.id) === String(productId)); // 查找商品
    if (item) {
        savedItems.push(item); // 将商品添加到“稍后保存”列表
        cart = cart.filter(item => String(item.id) !== String(productId)); // 从购物车中移除商品

        saveCart(cart); // 保存更新后的购物车
        localStorage.setItem('savedItems', JSON.stringify(savedItems)); // 保存“稍后保存”列表
        updateCartDisplay(); // 更新显示
        updateOrderSummary(); // 更新订单摘要
        updateCartCount(); // 更新购物车数量徽章
        showNotification('Item saved for later purchase.', 'info'); // 商品已保存以备稍后购买。
    }
}

// 更新购物车图标上的商品总数徽章
function updateCartCount() {
    const cart = getCart();
    if (!Array.isArray(cart)) {
        return;
    }
    // 计算购物车中所有商品的总数量
    const totalItems = cart.reduce((total, item) => total + (parseInt(item.quantity || 1)), 0);
    const cartCountElements = document.querySelectorAll('.cart-count'); // 获取所有购物车计数徽章元素

    // 更新所有徽章的文本内容
    cartCountElements.forEach(element => {
        element.textContent = totalItems.toString();
    });
}

// 显示空购物车消息（当购物车为空时调用）
function showEmptyCartMessage() {
    const cartItemsContainer = document.getElementById('cart-items-container');
    if (cartItemsContainer) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart-message" style="text-align: center; padding: 3rem 1rem;">
                <div class="empty-cart-icon" style="font-size: 3rem; color: var(--gray-color); margin-bottom: 1rem;">
                    <i class="fas fa-shopping-cart"></i>
                </div>
                <h3>Your cart is empty</h3> <p>Looks like you haven't added any items to your cart yet.</p> <a href="products.html" class="btn-primary" style="display: inline-block; margin-top: 1rem; padding: 0.75rem 1.5rem; background-color: var(--primary-color); color: white; border-radius: 5px; text-decoration: none;">Browse Products</a> </div>
        `;
    }

    // 将订单摘要中的金额重置为 0
    document.getElementById('subtotal').textContent = '$0.00';
    document.getElementById('shipping').textContent = '$0.00';
    document.getElementById('total').textContent = '$0.00';

    // 禁用结账按钮
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.disabled = true;
        checkoutBtn.style.opacity = '0.5';
        checkoutBtn.style.cursor = 'not-allowed';
    }
}

// 通知系统：在页面右上角显示临时通知（成功、错误、信息）
function showNotification(message, type = 'success') {
    let notificationContainer = document.querySelector('.notification-container');

    // 如果通知容器不存在，则创建它并添加到 body
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.classList.add('notification-container');
        document.body.appendChild(notificationContainer);

        // 设置容器样式
        Object.assign(notificationContainer.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: '9999',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
        });
    }

    const notification = document.createElement('div');
    notification.classList.add('notification', `notification-${type}`);

    let icon;
    let bgColor;
    // 根据通知类型设置图标和背景颜色
    switch (type) {
        case 'success':
            icon = 'fa-check-circle'; // 成功图标
            bgColor = '#10b981'; // 绿色
            break;
        case 'error':
            icon = 'fa-exclamation-circle'; // 错误图标
            bgColor = '#ef4444'; // 红色
            break;
        case 'info':
        default:
            icon = 'fa-info-circle'; // 信息图标
            bgColor = '#3b82f6'; // 蓝色
    }

    // 设置通知内容的 HTML
    notification.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
    `;

    // 设置通知的样式
    Object.assign(notification.style, {
        color: 'white',
        padding: '12px 20px',
        backgroundColor: bgColor,
        borderRadius: '4px',
        boxShadow: '0 3px 10px rgba(0,0,0,0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        transform: 'translateX(150%)', // 初始状态：在屏幕外
        transition: 'transform 0.3s ease' // 过渡动画
    });

    notificationContainer.appendChild(notification);

    // 动画进入：移入屏幕内
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);

    // 3 秒后动画移出并移除元素
    setTimeout(() => {
        notification.style.transform = 'translateX(150%)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// 辅助函数：生成商品变体选择的 HTML 下拉菜单
function generateVariantSelectHTML(item) {
    // 如果没有变体选项，则返回默认文本
    if (!item.variant_options || !Array.isArray(item.variant_options) || item.variant_options.length === 0) {
        return '<p class="item-attributes">No variants</p>'; // 无变体
    }

    // 为每个变体（如颜色、尺寸）生成一个下拉菜单
    return item.variant_options.map(variant => {
        const label = variant.label; // 变体标签（例如“Color”）
        const options = variant.options || []; // 变体选项数组（例如 ["Red", "Blue"]）
        const selectId = `variant-${label}-${item.id}`; // 下拉菜单的唯一 ID

        // 生成下拉菜单中的选项 HTML
        const optionsHTML = options.map(option => {
            // 根据商品当前的选中颜色设置选中状态
            const selected = (option === item.selectedColor) ? 'selected' : '';
            return `<option value="${option}" ${selected}>${option}</option>`;
        }).join('');

        // 返回完整的变体选择组 HTML
        return `
            <div class="variant-group">
                <label for="${selectId}">${label.charAt(0).toUpperCase() + label.slice(1)}:</label>
                <select class="variant-select" id="${selectId}" data-product-id="${item.id}" data-variant="${label}">
                    ${optionsHTML}
                </select>
            </div>
        `;
    }).join('');
}

// 应用折扣：更新订单摘要中的折扣金额和总价
function applyDiscount(percentage) {
    const cart = getCart();
    const subtotal = calculateSubtotal(cart);
    const discount = subtotal * (percentage / 100);
    const shipping = calculateShipping(subtotal);
    const total = subtotal + shipping - discount;

    const subtotalEl = document.getElementById('subtotal');
    const shippingEl = document.getElementById('shipping-cost') || document.getElementById('shipping'); // 两种写法兼容
    const totalEl = document.getElementById('total-amount') || document.getElementById('total');
    const discountEl = document.getElementById('discount-amount');
    const discountRow = document.getElementById('discount-row');

    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    if (shippingEl) shippingEl.textContent = `$${shipping.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
    if (discountEl) discountEl.textContent = `-$${discount.toFixed(2)}`;
    if (discountRow) discountRow.style.display = 'flex';
}
// 更新运输费用显示（此函数主要用于运费选项变化时，如果您的页面有此功能）
function updateShipping(cost) {
    const cart = getCart();
    const subtotal = calculateSubtotal(cart);
    const total = subtotal + cost;

    document.getElementById('shipping').textContent = cost === 0 ? 'FREE' : `$${cost.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
}

// 从后端获取推荐产品并渲染（可选功能，如果您的页面有“猜你喜欢”模块）
async function fetchAndRenderSuggestedProducts(endpoint, count = 3, renderFn = renderProducts) {
    try {
        const response = await fetch(endpoint);
        const products = await response.json();

        if (!Array.isArray(products)) {
            throw new Error('Invalid product data format'); // 产品数据格式无效
        }

        // 随机选择指定数量的商品
        const shuffled = products.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, count);

        if (renderFn) renderFn(selected); // 调用渲染函数
    } catch (error) {
        console.error('Error loading recommended products:', error); // 加载推荐产品出错
    }
}

// 渲染推荐产品到页面（如果需要显示推荐商品）
function renderProducts(products) {
    const productsGrid = document.getElementById('suggested-products');
    if (!productsGrid) return;

    productsGrid.innerHTML = '';
    products.forEach((product, index) => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card animated';
        productCard.style.opacity = '0';
        productCard.style.transform = 'translateY(20px)';
        productCard.style.transitionDelay = `${index * 100}ms`; // 延迟动画效果

        productCard.innerHTML = `
            <img src="${product.image_url}" alt="${product.name}" loading="lazy" onerror="this.style.display='none'">
            <h3>${product.name}</h3>
            <div class="price">
                <span class="current-price">$${parseFloat(product.final_price || product.price).toFixed(2)}</span>
                ${product.final_price && product.price && product.final_price < product.price ? `<span class="original-price">$${parseFloat(product.price).toFixed(2)}</span>` : ''}
            </div>
            <button class="add-to-cart">ADD TO CART</button>
        `;

        // 点击产品卡片跳转到产品详情页
        productCard.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart')) {
                return; // 如果点击的是“添加到购物车”按钮，则不跳转
            }
            localStorage.setItem('currentProduct', JSON.stringify(product));
            const productUUID = product.id;
            const productNameForUrl = product.name.replace(/\s+/g, '-').toLowerCase();
            window.location.href = `../products/product-detail.html?id=${productUUID}-${productNameForUrl}`;
        });

        // “添加到购物车”按钮事件
        const addToCartBtn = productCard.querySelector('.add-to-cart');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // 阻止事件冒泡到产品卡片上
                addToCart(product); // 将产品添加到购物车
                updateCartDisplay(); // 更新购物车显示
                updateOrderSummary(); // 更新订单摘要
                updateCartCount(); // 更新购物车数量徽章
            });
        }

        productsGrid.appendChild(productCard);

        // 动画效果：逐渐显示产品卡片
        setTimeout(() => {
            productCard.style.opacity = '1';
            productCard.style.transform = 'translateY(0)';
        }, 50);
    });
}

// 添加商品到购物车（此函数主要在推荐产品模块中使用）
function addToCart(product) {
    const productToAdd = {
        ...product, // 复制所有产品属性
        quantity: 1,  // 默认数量为 1
        price: parseFloat(product.final_price || product.price) || 0, // 使用最终价格或原价
    };

    const cartItems = JSON.parse(localStorage.getItem('cart') || '[]'); // 获取当前购物车
    cartItems.push(productToAdd); // 添加新商品
    localStorage.setItem('cart', JSON.stringify(cartItems)); // 保存回 localStorage
    showNotification(`${product.name} Added to cart`, 'success'); // 显示“已添加到购物车”通知
}


// ============== 从 cart.js 复制的核心购物车和支付逻辑 END ==============


// Form validation 表单验证
// 初始化表单验证功能
function initializeFormValidation() {
    const form = document.getElementById('shipping-form'); // 获取配送信息表单
    if (form) {
        // 获取所有需要验证的输入框和选择框
        const inputs = form.querySelectorAll('input[required], select[required]');
        inputs.forEach(input => {
            input.addEventListener('blur', () => validateField(input)); // 失去焦点时验证字段
            input.addEventListener('input', () => clearFieldError(input)); // 用户输入时清除错误信息
        });
    }
}

// 验证单个表单字段
function validateField(field) {
    const value = field.value.trim(); // 获取字段值并去除前后空格
    const errorElement = field.parentElement?.querySelector('.error-message'); // 获取错误信息显示元素

    let isValid = true;
    let errorMessage = '';

    // 必填字段验证
    if (field.required && !value) {
        isValid = false;
        errorMessage = 'This field is required'; // 此字段为必填项
    } else if (field.type === 'email' && value && !isValidEmail(value)) {
        // 电子邮件格式验证
        isValid = false;
        errorMessage = 'Please enter a valid email address'; // 请输入有效的电子邮件地址
    } else if (field.type === 'tel' && value && !isValidPhone(value)) {
        // 电话号码格式验证
        isValid = false;
        errorMessage = 'Please enter a valid phone number'; // 请输入有效的电话号码
    } else if (field.name === 'zipCode' && value && !isValidZipCode(value)) {
        // 邮政编码格式验证
        isValid = false;
        errorMessage = 'Please enter a valid ZIP code'; // 请输入有效的邮政编码
    }

    // 更新字段的视觉状态（添加/移除错误类）
    if (isValid) {
        field.classList.remove('error');
    } else {
        field.classList.add('error');
    }

    // 显示/隐藏错误信息文本
    if (errorElement) {
        errorElement.textContent = errorMessage;
    }

    return isValid; // 返回验证结果
}

// 清除字段的错误状态和信息
function clearFieldError(field) {
    field.classList.remove('error'); // 移除错误样式
    const errorElement = field.parentElement?.querySelector('.error-message');
    if (errorElement) {
        errorElement.textContent = ''; // 清空错误信息文本
    }
}

// 验证当前步骤（例如，配送信息步骤）中的所有表单字段
function validateCurrentStep() {
    if (currentStep === 2) {
        // 验证配送表单
        const form = document.getElementById('shipping-form');
        if (form) {
            const inputs = form.querySelectorAll('input[required], select[required]');
            let allValid = true;
            inputs.forEach(input => {
                // 依次验证每个字段，如果有任何一个字段无效，则整体验证失败
                if (!validateField(input)) {
                    allValid = false;
                }
            });
            if (!allValid) {
                showNotification('Please fill in all required fields correctly.', 'error'); // 请正确填写所有必填字段。
            }
            return allValid;
        }
    }
    return true; // 其他步骤默认验证通过
}

// Validation helpers 验证辅助函数
// 验证电子邮件格式
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// 验证电话号码格式
function isValidPhone(phone) {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    // 简单验证：包含数字、空格、破折号、加号、括号，且数字至少 10 位
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

// 验证邮政编码格式
function isValidZipCode(zipCode) {
    const zipRegex = /^\d{5}(-\d{4})?$/; // 5 位数字或 5-4 位数字格式
    return zipRegex.test(zipCode);
}

// Payment methods 支付方式
// 初始化支付方式选择逻辑
function initializePaymentMethods() {
    const paymentInputs = document.querySelectorAll('input[name="payment"]'); // 获取所有支付方式单选按钮
    const cardDetails = document.getElementById('card-details'); // 获取银行卡详细信息输入区域
    paymentInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            const target = e.target;
            if (cardDetails) {
                // 如果选择“银行卡”支付，则显示银行卡详情输入区域，否则隐藏
                cardDetails.style.display = target.value === 'card' ? 'block' : 'none';
            }
        });
    });
}

// Payment processing 付款处理 (现在主要用于显示加载状态，实际支付由 PayPal SDK 处理)
// function processPayment() {
//     const nextBtn = document.getElementById('next-btn');

//     // 显示加载状态，禁用按钮
//     nextBtn.classList.add('loading');
//     nextBtn.disabled = true;
//     nextBtn.textContent = 'Processing...'; // 处理中...

//     // 短暂模拟处理状态，然后恢复按钮。实际支付将由用户点击 PayPal 按钮后触发。
//     setTimeout(() => {
//         nextBtn.classList.remove('loading');
//         nextBtn.disabled = false;
//         nextBtn.innerHTML = '<i class="fas fa-lock"></i> Complete Payment'; // 完成付款
//         // 重要的：实际的支付成功弹窗和购物车重置由 PayPal SDK 的 onApprove 函数处理
//     }, 1000); // 1 秒后恢复按钮，因为 PayPal 可能会很快弹出支付窗口
// }

// 显示支付成功模态框
function showSuccessModal() {
    const modal = document.getElementById('success-modal');
    const orderNumber = document.getElementById('order-number'); // 订单号显示元素
    const deliveryDate = document.getElementById('delivery-date'); // 配送日期显示元素
    if (modal && orderNumber && deliveryDate) {
        // 生成一个随机的订单号
        const randomId = Math.random().toString(36).substr(2, 9).toUpperCase();
        orderNumber.textContent = `SGH-${randomId}`;

        // 计算预计配送日期（从现在起 5 天）
        const deliveryDateValue = new Date();
        deliveryDateValue.setDate(deliveryDateValue.getDate() + 5);
        deliveryDate.textContent = deliveryDateValue.toLocaleDateString(); // 本地化日期格式

        modal.classList.add('show'); // 显示成功模态框
    }
}

// “继续购物”按钮点击事件处理（在支付成功模态框中）
function continueShopping() {
    const modal = document.getElementById('success-modal');
    if (modal) {
        modal.classList.remove('show'); // 隐藏成功模态框
    }

    // 重置表单和购物车状态
    resetCart();
    // 也可以跳转到首页或产品列表页
    // window.location.href = '../index.html';
}

// 重置购物车和结账流程到初始状态
function resetCart() {
    currentStep = 1; // 重置当前步骤为第一步
    updateStepDisplay(); // 更新步骤显示
    updateStepButtons(); // 更新步骤按钮

    // 清空配送信息表单
    const form = document.getElementById('shipping-form');
    if (form) {
        form.reset(); // 重置表单字段
        // 清除所有错误状态和错误信息
        form.querySelectorAll('.error').forEach(field => field.classList.remove('error'));
        form.querySelectorAll('.error-message').forEach(error => (error).textContent = '');
    }
    // 清空本地存储中的购物车数据
    saveCart([]);
    updateCartDisplay(); // 更新购物车显示为“空”
    updateOrderSummary(); // 重置订单摘要
    updateCartCount(); // 重置购物车数量徽章
}

// Make functions globally available 使函数全局可用
// 这些函数可以通过 HTML 中的 onclick 属性直接调用
window.updateQuantity = updateQuantity; // 更新商品数量
window.removeItem = removeFromCart; // 从购物车移除商品
window.nextStep = nextStep; // 下一步
window.previousStep = previousStep; // 上一步
window.continueShopping = continueShopping; // 继续购物