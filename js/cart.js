// ✅ 添加：在 cart.js 的最顶部或一个单独的文件中定义 window.CartManager
window.CartManager = {
    getCartItems: function () {
        const cart = localStorage.getItem('cart');
        try {
            const parsedCart = cart ? JSON.parse(cart) : [];
            return parsedCart;
        } catch (e) {
            console.error('Error parsing cart data:', e);
            return [];
        }
    },
    saveCartItems: function (cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
    },
};


document.addEventListener('DOMContentLoaded', function () {
    const sameAsShipping = document.getElementById("same-as-shipping");
    const billingForm = document.getElementById("billing-address-form");

    const countrySelect = document.getElementById('shipping-country');
    const stateContainer = document.getElementById('shipping-state-container');

    function toggleStateField() {
        const country = countrySelect.value;
        // 需要州/省字段的国家
        const needStateCountries = ['US', 'CA', 'AU'];

        if (needStateCountries.includes(country)) {
            stateContainer.style.display = 'block';
        } else {
            stateContainer.style.display = 'none';
            // 如果隐藏时想清空州/省值，也可以加下面一行：
            // document.getElementById('shipping-state').value = '';
        }
    }

      // 页面加载时运行一次，确保初始状态正确
    toggleStateField();

    // 通过 IP API 自动选择国家
    fetch('https://ipapi.co/json/')
    .then(response => response.json())
    .then(data => {
        const detectedCountry = data.country_code; // e.g. "US", "GB", etc.
        console.log("Detected country:", detectedCountry);

        const countrySelect = document.getElementById('shipping-country');
        if (!countrySelect) return;

        // 检查下拉框中是否存在该选项
        const hasOption = [...countrySelect.options].some(opt => opt.value === detectedCountry);

        if (hasOption) {
        countrySelect.value = detectedCountry;
        } else {
        // 如果定位到了但不在列表中，默认 US
        countrySelect.value = 'US';
        }

        toggleStateField(); // 更新州/省显示
    })
    .catch(err => {
        console.warn("IP API failed, fallback to default country US", err);

        // 如果定位失败，默认美国
        const countrySelect = document.getElementById('shipping-country');
        if (countrySelect) {
        countrySelect.value = 'US';
        toggleStateField(); 
        }
    });

    // 国家选择变化时调用
    countrySelect.addEventListener('change', toggleStateField);

    sameAsShipping.addEventListener("change", function () {
        if (this.checked) {
            billingForm.style.display = "none";
        } else {
            billingForm.style.display = "block";
        }
    });

    initCart();
    renderPayPalButton();
    let appliedPromoCode = null;  // 用于记录当前应用的优惠码

    // 全局变量
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const navActions = document.querySelector('.nav-actions');

    mobileMenuBtn.addEventListener('click', () => {
        // 如果不存在移动菜单，则创建一个
        if (!document.querySelector('.mobile-menu')) {
            // 创建移动菜单容器
            const mobileMenu = document.createElement('div');
            mobileMenu.classList.add('mobile-menu');

            // Clone navigation links
            const navLinksClone = navLinks.cloneNode(true);

            // Create a close button
            const closeBtn = document.createElement('div');
            closeBtn.classList.add('close-btn');
            closeBtn.innerHTML = '<i class="fas fa-times"></i>';
            // closeBtn.addEventListener('click', () => {
            //     mobileMenu.classList.remove('active');
            //     document.body.style.overflow = 'auto';
            // });

            closeBtn.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                mobileMenu.style.transform = 'translateX(-100%)'; // 隐藏菜单
                document.body.style.overflow = 'auto';
            });


            // Append elements to mobile menu
            mobileMenu.appendChild(closeBtn);
            mobileMenu.appendChild(navLinksClone);

            // 点击菜单项后关闭移动菜单
            const navAnchors = navLinksClone.querySelectorAll('a');
            navAnchors.forEach(anchor => {
                anchor.addEventListener('click', () => {
                    mobileMenu.classList.remove('active');
                    mobileMenu.style.transform = 'translateX(-100%)';
                    document.body.style.overflow = 'auto';
                });
            });

            // Clone nav actions
            const actionsContainer = document.createElement('div');
            actionsContainer.classList.add('mobile-actions');

            const navActionsClone = navActions.cloneNode(true);
            actionsContainer.appendChild(navActionsClone);

            mobileMenu.appendChild(actionsContainer);

            // Append mobile menu to body
            document.body.appendChild(mobileMenu);

            // Add styles to mobile menu
            mobileMenu.style.position = 'fixed';
            mobileMenu.style.top = '0';
            mobileMenu.style.left = '0';
            mobileMenu.style.width = '100%';
            mobileMenu.style.height = '100vh';
            mobileMenu.style.background = 'white';
            mobileMenu.style.zIndex = '2000';
            mobileMenu.style.padding = '2rem';
            mobileMenu.style.transform = 'translateX(-100%)';
            mobileMenu.style.transition = 'transform 0.3s ease-in-out';

            closeBtn.style.position = 'absolute';
            closeBtn.style.top = '1rem';
            closeBtn.style.right = '1rem';
            closeBtn.style.fontSize = '1.5rem';
            closeBtn.style.cursor = 'pointer';

            navLinksClone.style.display = 'flex';
            navLinksClone.style.flexDirection = 'column';
            navLinksClone.style.marginTop = '3rem';

            // Style all list items in navLinksClone
            const navItems = navLinksClone.querySelectorAll('li');
            navItems.forEach(item => {
                item.style.margin = '0.75rem 0';
                item.style.padding = '0.5rem 0';
                item.style.borderBottom = '1px solid #eee';
            });

            actionsContainer.style.display = 'flex';
            actionsContainer.style.justifyContent = 'center';
            actionsContainer.style.marginTop = '2rem';
            actionsContainer.style.gap = '2rem';
        }

        // 切换移动菜单
        const mobileMenu = document.querySelector('.mobile-menu');
        mobileMenu.classList.toggle('active');

        // 设置活动状态的样式
        if (mobileMenu.classList.contains('active')) {
            mobileMenu.style.transform = 'translateX(0)';
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        } else {
            mobileMenu.style.transform = 'translateX(-100%)';
            document.body.style.overflow = 'auto';
        }
    });

    // 继续购物按钮
    const continueShoppingBtn = document.querySelector('.continue-shopping');
    if (continueShoppingBtn) {
        continueShoppingBtn.addEventListener('click', function () {
            window.location.href = '../index.html';
        });
    }

    // 更新购物车按钮
    const updateCartBtn = document.querySelector('.update-cart');
    if (updateCartBtn) {
        updateCartBtn.addEventListener('click', function () {
            updateCartDisplay();
            updateOrderSummary();
            showNotification('Shopping cart updated');
        });
    }
    // ✅ 添加：监听 variant-select 的变化，更新 localStorage 中的 selectedColor
    document.querySelectorAll('.variant-select').forEach(select => {
        select.addEventListener('change', function () {
            const productId = this.dataset.productId;
            const variantLabel = this.dataset.variant;
            const selectedValue = this.value;

            console.log('Clicked select element:', this); // 输出完整 select 元素
            console.log('Selected option value:', selectedValue); // 输出所选值
            console.log('Selected option text:', this.options[this.selectedIndex].text); // 输出所选文本

            let cart = window.CartManager.getCartItems();
            // const item = cart.find(p => p.id === productId);
            const item = cart.find(p => String(p.id) === String(productId));

            if (item) {
                if (variantLabel === 'color') {
                    item.selectedColor = selectedValue;
                    console.log(`Updated ${item.name} color to: ${selectedValue}`);
                    window.CartManager.saveCartItems(cart);
                    updateCartDisplay(); // 刷新购物车显示
                }

                window.CartManager.saveCartItems(cart);
            } else {
                console.warn(`Product with id ${productId} not found in cart.`);
            }
        });
    });



    // 渲染 PayPal 按钮
    // async function renderPayPalButton() {
    //     if (!window.paypal) {
    //         // console.error("PayPal SDK has not loaded.");
    //         return;
    //     }

    //     let currentOrderItemsForStorage = [];

    //     const paypalButtons = window.paypal.Buttons({
    //         style: {
    //             shape: 'rect',
    //             layout: 'vertical',
    //             color: 'gold',
    //             label: 'paypal',
    //         },
    //         locale: 'en_US',  // 强制使用英文（美国），可以改成其他语言代码如 'en_GB', 'zh_CN' 等
            

    //         // 创建订单信息
    //         createOrder: async function (data, actions) {

    //             // 1. 从你的 HTML 表单中获取用户填写的收货地址信息
    //             const shippingFirstName = document.querySelector('#shipping-firstname').value;
    //             const shippingLastName = document.querySelector('#shipping-lastname').value;
    //             const shippingFullName = `${shippingFirstName} ${shippingLastName}`; // 将姓和名合并
    //             const shippingCountry = document.querySelector('#shipping-country').value; // 国家代码 (例如 'US')
    //             const shippingStreet = document.querySelector('#shipping-address').value;
    //             const shippingCity = document.querySelector('#shipping-city').value;
    //             const shippingPostal = document.querySelector('#shipping-zip').value;

    //             // 注意：你的 HTML 中没有州/省的输入框，这里做了兼容处理。
    //             // 如果将来添加了 ID 为 'shipping-state' 的输入框，代码也能自动获取其值。
    //             const shippingState = document.querySelector('#shipping-state')?.value || '';

    //             // 2. （可选）表单验证：确保必填项都已填写
    //             if (!shippingFirstName || !shippingLastName || !shippingStreet || !shippingCity || !shippingPostal || !shippingCountry) {
    //                 console.warn("⚠️ 收货地址不完整 (createOrder 阶段)");
    //                 showNotification('Please fill out all required shipping address fields.', 'error');
    //                 // 通过返回一个被拒绝的 Promise 来阻止 PayPal 窗口打开
    //                 return Promise.reject(new Error('Shipping address is incomplete.'));
    //             }

    //             // 3. 照常获取购物车和运费信息，并调用后端函数验证价格
    //             const cart = getCart();
    //             const selectedShippingCost = parseFloat(document.getElementById('shipping-options').value);

    //             const response = await fetch('/.netlify/functions/validate-price', {
    //                 method: 'POST',
    //                 headers: { 'Content-Type': 'application/json' },
    //                 body: JSON.stringify({
    //                     cart: cart,
    //                     promoCode: appliedPromoCode,
    //                     selectedShipping: selectedShippingCost
    //                 })
    //             });

    //             const result = await response.json();

    //             if (!response.ok) {
    //                 throw new Error('Could not validate price.');
    //             }

    //             // 触发 Facebook Pixel 的事件，使用后端校验的价格
    //             fbq('track', 'InitiateCheckout', { value: result.total, currency: 'USD' });

    //             // 4. 创建 PayPal 订单，并在 purchase_units 中附加 shipping 对象
    //             return actions.order.create({
    //                 purchase_units: [{
    //                     amount: {
    //                         currency_code: 'USD',
    //                         value: result.total.toFixed(2), // 使用后端返回的总金额
    //                         breakdown: {
    //                             item_total: {
    //                                 currency_code: 'USD',
    //                                 value: result.subtotal.toFixed(2),
    //                             },
    //                             shipping: {
    //                                 currency_code: 'USD',
    //                                 value: result.shipping.toFixed(2),
    //                             }
    //                         }
    //                     },
    //                     // ✅ 关键步骤：将从表单获取的地址信息构建成 shipping 对象传递给 PayPal
    //                     shipping: {
    //                         name: {
    //                             full_name: shippingFullName // PayPal 要求是全名
    //                         },
    //                         address: {
    //                             address_line_1: shippingStreet,    // 街道地址
    //                             admin_area_2: shippingCity,        // 城市
    //                             admin_area_1: shippingState,       // 州/省 (State/Province)
    //                             postal_code: shippingPostal,       // 邮政编码
    //                             country_code: shippingCountry      // 两位国家代码 (e.g., "US")
    //                         }
    //                     },
    //                     items: result.items.map(item => ({
    //                         name: item.name,
    //                         unit_amount: { currency_code: 'USD', value: item.unit_amount.toFixed(2) },
    //                         quantity: item.quantity
    //                     }))
    //                 }]
    //             });
    //         },

    //         // 支付成功后的处理
    //         onApprove: async function (data, actions) {
    //             return actions.order.capture().then(async function (details) {

    //                 // ✅ PayPal 返回的付款人信息（保留备用）
    //                 const paypalPayer = {
    //                     email: details.payer.email_address,
    //                     given_name: details.payer.name.given_name,
    //                     surname: details.payer.name.surname,
    //                     paypal_shipping: details.purchase_units[0].shipping || null  // 可能为空
    //                 };

    //                 console.log("PayPal 返回的地址信息(可能为空):", paypalPayer.paypal_shipping);

    //                 // ✅ 前端表单的地址（履约用）
    //                 const shippingFirstName = document.querySelector('#shipping-firstname').value;
    //                 const shippingPhone = document.querySelector('#shipping-phone').value;
    //                 const shippingLastName = document.querySelector('#shipping-lastname').value;
    //                 const shippingFullName = `${shippingFirstName} ${shippingLastName}`;
    //                 const shippingCountry = document.querySelector('#shipping-country').value;
    //                 const shippingStreet = document.querySelector('#shipping-address').value;
    //                 const shippingCity = document.querySelector('#shipping-city').value;
    //                 const shippingPostal = document.querySelector('#shipping-zip').value;
    //                 const shippingState = document.querySelector('#shipping-state')?.value || '';




    //                 // ✅ 最终用于发货的地址（前端为准）
    //                 const finalShippingAddress = {
    //                     full_name: shippingFullName,
    //                     phone_number: shippingPhone,
    //                     email: paypalPayer.email,
    //                     address_line_1: shippingStreet,
    //                     city: shippingCity,
    //                     state: shippingState,
    //                     postal_code: shippingPostal,
    //                     country: shippingCountry,
    //                 };

    //                 // ✅ 获取账单地址（billing）
    //                 const useShippingAsBilling = document.querySelector('#same-as-shipping').checked;
    //                 const billingAddress = useShippingAsBilling
    //                     ? { ...finalShippingAddress }
    //                     : {
    //                         full_name: `${document.querySelector('#billing-firstname').value} ${document.querySelector('#billing-lastname').value}`,
    //                         phone_number: document.querySelector('#billing-phone').value,
    //                         email: paypalPayer.email,
    //                         address_line_1: document.querySelector('#billing-address').value,
    //                         city: document.querySelector('#billing-city').value,
    //                         postal_code: document.querySelector('#billing-zip').value,
    //                         country: document.querySelector('#billing-country').value,
    //                         state: '', // 如你未来添加 billing-state 可补充
    //                     };

    //                 // ✅ 同时把 PayPal 返回的地址也存起来，方便后端对比
    //                 const paypalShippingAddress = paypalPayer.paypal_shipping ? {
    //                     full_name: paypalPayer.paypal_shipping.name.full_name,
    //                     address_line_1: paypalPayer.paypal_shipping.address.address_line_1,
    //                     city: paypalPayer.paypal_shipping.address.admin_area_2,
    //                     state: paypalPayer.paypal_shipping.address.admin_area_1,
    //                     postal_code: paypalPayer.paypal_shipping.address.postal_code,
    //                     country: paypalPayer.paypal_shipping.address.country_code
    //                 } : null;

    //                 // console.log("前端地址:", finalShippingAddress);
    //                 // console.log("PayPal 返回地址:", paypalShippingAddress);
                    
    //                 // ✅ 订单总金额（你可能需要 result.total 之类的）
    //                 const totalAmount = details.purchase_units[0].amount.value;

    //                 // ✅ 购物车商品
    //                 const itemsToSave = currentOrderItemsForStorage.map(item => ({
    //                     id: item.id,
    //                     name: item.name,
    //                     price: item.price,
    //                     description: item.description,
    //                     quantity: item.quantity,
    //                     ...item
    //                 }));

    //                 // ✅ 订单对象（包含两份地址，方便后台核对）
    //                 const order = {
    //                     total_amount: totalAmount,
    //                     items: itemsToSave,
    //                     shipping_address: finalShippingAddress,   // ✅ 用这个履约
    //                     billing_address: billingAddress, // ✅ 加入账单地址
    //                     paypal_address: paypalShippingAddress,   // ✅ 仅存储对比用
    //                     payer_info: paypalPayer,                 // ✅ 保存付款人信息
    //                 };

    //                 const payload = {
    //                     order,           // 订单信息
    //                     items: itemsToSave  // 商品列表
    //                 };

    //                 // console.log("即将发送到后端的 payload:", JSON.stringify(payload, null, 2));

    //                 // ✅ 发到后端存储
    //                 const response = await fetch('/.netlify/functions/store-order', {
    //                     method: 'POST',
    //                     headers: { 'Content-Type': 'application/json' },
    //                     body: JSON.stringify(payload)
    //                 });
    //                 const result = await response.json();

    //                 if (response.ok) {
    //                     console.log('订单已成功保存:', result);
    //                     if (result.orderId) localStorage.setItem('orderId', result.orderId);
    //                 } else {
    //                     console.error('保存订单时出错:', result);
    //                     showNotification('处理订单时出错，请重试。');
    //                 }

    //                 // ✅ 存本地，跳转到确认页面
    //                 localStorage.setItem('orderData', JSON.stringify(payload));
    //                 window.location.href = '../products/checkout.html';
    //             });
    //         },


    //         // 支付失败的处理
    //         onCancel: function (data) {
    //             // 交易已取消
    //             showNotification('Transaction Cancelled');
    //         },

    //         // 错误处理
    //         onError: function (error) {
    //             // 付款失败转跳到whatsapp客户联系页面
    //             console.error('付款处理过程中出现错误:', error);
    //             // alert('付款过程中出现问题');
    //             showNotification("Payment error, please contact online customer service")
    //             // window.location.href = 'https://wa.me/8613326425565?text=Hello,%20I%20want%20to%20place%20an%20order';
    //         }
    //     });

    //     // 渲染 PayPal 按钮
    //     paypalButtons.render('#paypal-button-container');
    // }

    async function renderPayPalButton() {
        if (!window.paypal) {
            // console.error("PayPal SDK has not loaded.");
            return;
        }

        let currentOrderItemsForStorage = [];

        const paypalButtons = window.paypal.Buttons({
            style: {
                shape: 'rect',
                layout: 'vertical',
                color: 'gold',
                label: 'paypal',
            },
            locale: 'en_US',

            // 创建订单信息
            createOrder: async function (data, actions) {

                // 1. 从你的 HTML 表单中获取用户填写的收货地址信息
                const shippingFirstName = document.querySelector('#shipping-firstname').value;
                const shippingLastName = document.querySelector('#shipping-lastname').value;
                const shippingFullName = `${shippingFirstName} ${shippingLastName}`.trim(); // 合并姓名并去除前后空格
                const shippingCountry = document.querySelector('#shipping-country').value;
                const shippingStreet = document.querySelector('#shipping-address').value;
                const shippingCity = document.querySelector('#shipping-city').value;
                const shippingPostal = document.querySelector('#shipping-zip').value;
                const shippingState = document.querySelector('#shipping-state')?.value || '';

                // 2. 照常获取购物车和运费信息，并调用后端函数验证价格
                const cart = getCart();
                const selectedShippingCost = parseFloat(document.getElementById('shipping-options').value);
                currentOrderItemsForStorage = cart; // 在这里保存当前购物车的状态

                const response = await fetch('/.netlify/functions/validate-price', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        cart: cart,
                        promoCode: appliedPromoCode,
                        selectedShipping: selectedShippingCost
                    })
                });

                const result = await response.json();

                if (!response.ok) {
                    showNotification(result.error || 'Could not validate price.', 'error');
                    return Promise.reject(new Error('Could not validate price.'));
                }

                // 触发 Facebook Pixel 的事件
                fbq('track', 'InitiateCheckout', { value: result.total, currency: 'USD' });
                
                // 3. ✅【核心修改】创建一个基础的订单对象 (purchase_unit)
                const purchase_unit = {
                    amount: {
                        currency_code: 'USD',
                        value: result.total.toFixed(2),
                        breakdown: {
                            item_total: {
                                currency_code: 'USD',
                                value: result.subtotal.toFixed(2),
                            },
                            shipping: {
                                currency_code: 'USD',
                                value: result.shipping.toFixed(2),
                            }
                        }
                    },
                    items: result.items.map(item => ({
                        name: item.name,
                        unit_amount: { currency_code: 'USD', value: item.unit_amount.toFixed(2) },
                        quantity: item.quantity
                    }))
                };

                // 4. ✅【核心修改】检查表单地址是否完整。如果完整，则附加到订单；否则，让 PayPal 处理。
                if (shippingFirstName && shippingLastName && shippingStreet && shippingCity && shippingPostal && shippingCountry) {
                    console.log("✅ 表单地址完整，将其预设到 PayPal 订单中。");
                    // 将从表单获取的地址信息构建成 shipping 对象传递给 PayPal
                    purchase_unit.shipping = {
                        name: {
                            full_name: shippingFullName
                        },
                        address: {
                            address_line_1: shippingStreet,    // 街道地址
                            admin_area_2: shippingCity,      // 城市
                            admin_area_1: shippingState,     // 州/省
                            postal_code: shippingPostal,     // 邮政编码
                            country_code: shippingCountry    // 两位国家代码
                        }
                    };
                } else {
                    console.warn("⚠️ 表单收货地址不完整，将由用户在 PayPal 页面中选择或输入。");
                    // 不添加 shipping 对象，PayPal 将使用其账户中的默认地址或要求用户提供。
                }

                // 5. 创建 PayPal 订单
                return actions.order.create({
                    purchase_units: [purchase_unit] // 使用我们动态构建的 purchase_unit
                });
            },

            // 支付成功后的处理
            onApprove: async function (data, actions) {
                return actions.order.capture().then(async function (details) {
                    
                    // ✅【核心修改】直接使用 PayPal 返回的、经过用户确认的地址作为最终履约地址
                    // 这是最可靠的数据源
                    const confirmedShippingDetails = details.purchase_units[0].shipping;

                    if (!confirmedShippingDetails || !confirmedShippingDetails.address) {
                        // 这种情况很少见，但可能发生在数字商品或特定配置中
                        // 如果没有地址，则无法发货，需要通知客户并记录错误
                        console.error("❌ 严重错误: PayPal 没有返回收货地址，无法完成订单。");
                        showNotification('Could not retrieve shipping address from PayPal. Please contact support.', 'error');
                        return; // 阻止后续流程
                    }

                    console.log("✅ 用户在 PayPal 确认的最终地址:", confirmedShippingDetails);

                    // ✅ 构建最终用于发货的地址 (以 PayPal 返回的为准)
                    const finalShippingAddress = {
                        full_name: confirmedShippingDetails.name.full_name,
                        // 电话号码不是 PayPal 的标准返回字段，我们仍然尝试从表单获取
                        phone_number: document.querySelector('#shipping-phone').value,
                        email: details.payer.email_address, // 邮箱从 payer 信息获取
                        address_line_1: confirmedShippingDetails.address.address_line_1,
                        city: confirmedShippingDetails.address.admin_area_2,
                        state: confirmedShippingDetails.address.admin_area_1,
                        postal_code: confirmedShippingDetails.address.postal_code,
                        country: confirmedShippingDetails.address.country_code,
                    };
                    
                    // 获取账单地址 (billing)
                    const useShippingAsBilling = document.querySelector('#same-as-shipping').checked;
                    const billingAddress = useShippingAsBilling
                        ? { ...finalShippingAddress, phone_number: document.querySelector('#billing-phone').value || finalShippingAddress.phone_number }
                        : {
                            full_name: `${document.querySelector('#billing-firstname').value} ${document.querySelector('#billing-lastname').value}`,
                            phone_number: document.querySelector('#billing-phone').value,
                            email: details.payer.email_address,
                            address_line_1: document.querySelector('#billing-address').value,
                            city: document.querySelector('#billing-city').value,
                            postal_code: document.querySelector('#billing-zip').value,
                            country: document.querySelector('#billing-country').value,
                            state: document.querySelector('#billing-state')?.value || '',
                        };

                    const totalAmount = details.purchase_units[0].amount.value;
                    const itemsToSave = currentOrderItemsForStorage.map(item => ({ ...item }));

                    // 构建将要发送到后端的订单对象
                    const order = {
                        total_amount: totalAmount,
                        items: itemsToSave,
                        shipping_address: finalShippingAddress, // ✅ 使用 PayPal 确认的地址履约
                        billing_address: billingAddress,
                        // 为了方便后端对比，可以把 PayPal 返回的原始 Payer 信息也存起来
                        payer_info: {
                            email: details.payer.email_address,
                            given_name: details.payer.name.given_name,
                            surname: details.payer.name.surname,
                            paypal_id: details.payer.payer_id
                        },
                    };

                    const payload = {
                        order,
                        items: itemsToSave
                    };

                    // 发送到后端存储
                    const response = await fetch('/.netlify/functions/store-order', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    const result = await response.json();

                    if (response.ok) {
                        console.log('订单已成功保存:', result);
                        if (result.orderId) localStorage.setItem('orderId', result.orderId);
                    } else {
                        console.error('保存订单时出错:', result);
                        showNotification('处理订单时出错，请重试。');
                    }

                    // 存本地，跳转到确认页面
                    localStorage.setItem('orderData', JSON.stringify(payload));
                    window.location.href = '../products/checkout.html';
                });
            },


            // 支付失败的处理
            onCancel: function (data) {
                showNotification('Transaction Cancelled');
            },

            // 错误处理
            onError: function (error) {
                console.error('付款处理过程中出现错误:', error);
                showNotification("Payment error, please contact online customer service");
                // window.location.href = 'https://wa.me/8613326425565?text=Hello,%20I%20want%20to%20place%20an%20order';
            }
        });

        // 渲染 PayPal 按钮
        paypalButtons.render('#paypal-button-container');
    }


    // 获取购物车数据
    function getCart() {
        const cart = localStorage.getItem('cart');
        return cart ? JSON.parse(cart) : [];
    }


    // 应用促销代码按钮
    const promoBtn = document.querySelector('.promo-input button');
    if (promoBtn) {
        promoBtn.addEventListener('click', function () {
            const promoInput = document.querySelector('.promo-input input');
            if (promoInput && promoInput.value.trim()) {
                // 获取用户输入的优惠码
                const promoCode = promoInput.value.trim().toUpperCase();

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

                // 在发送请求前显示加载遮罩
                showLoadingOverlay()

                // 发送优惠码到后端进行校验
                fetch('/.netlify/functions/consume-promo-code', {
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
                        // 请求成功或失败后隐藏加载遮罩
                        hideLoadingOverlay();
                        if (data.success) {
                            // 如果优惠码有效，应用折扣
                            applyDiscount(data.discount_percentage); // 假设后端返回折扣值
                            showNotification(`Coupon code applied: ${data.discount_percentage}% off!`, 'success');
                            appliedPromoCode = promoCode; // 保存当前有效优惠码

                            // ✅ 计算并更新优惠金额显示
                            const discountAmountElement = document.getElementById('discount-amount');
                            if (discountAmountElement) {
                                const discountValue = totalProductPrice * (data.discount_percentage / 100);
                                console.log("促销优惠金额：----------", discountValue)
                                discountAmountElement.textContent = `-$${discountValue.toFixed(2)}`;
                            }
                        } else {
                            switch (data.error_code) {
                                case 1001:
                                    showNotification('Please enter a promo code.', 'error');
                                    break;
                                case 1003:
                                    showNotification('This promo code does not exist.', 'error');
                                    break;
                                case 1004:
                                    showNotification('This promo code has already been used.', 'error');
                                    break;
                                case 1005:
                                    showNotification('This promo code has expired.', 'error');
                                    break;
                                default:
                                    showNotification(data.message || 'An error occurred. Please try again.', 'error');
                            }
                        }
                    })
                    .catch(error => {
                        // 请求失败后隐藏加载遮罩
                        hideLoadingOverlay();
                        console.error('Error:', error);
                        showNotification('There was an error with coupon code validation.', 'error');
                        //如果请求失败，重置优惠金额显示
                        const discountAmountElement = document.getElementById('discount-amount');
                        if (discountAmountElement) {
                            discountAmountElement.textContent = '-$0.00';
                        }
                        appliedPromoCode = null; // 清除已应用的优惠码
                        updateOrderSummary(); // 重新计算并更新订单总价
                    });
            } else {
                showNotification('Please enter the discount code。', 'error');
                // ✅ 如果输入为空，重置优惠金额显示
                const discountAmountElement = document.getElementById('discount-amount');
                if (discountAmountElement) {
                    discountAmountElement.textContent = '-$0.00';
                }
                appliedPromoCode = null; // 清除已应用的优惠码
                updateOrderSummary(); // 重新计算并更新订单总价
            }
        });
    }


    // 转跳到弹窗页面
    const checkoutbtn = document.querySelector('.checkout-btn');
    const modal = document.getElementById('custom-modal');

    if (checkoutbtn && modal) {
        checkoutbtn.addEventListener('click', function (e) {
            e.preventDefault();
            modal.style.display = 'flex';
        });
    }


    const closeBtn = document.getElementById('close-modal');
    const closemodal = document.getElementById('custom-modal');

    if (closeBtn && closemodal) {
        closeBtn.addEventListener('click', function () {
            closemodal.style.display = 'none';
        });
    }

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

    const userIconLink = document.getElementById('userIconLink');
    if (userIconLink) {
        userIconLink.addEventListener('click', function (event) {
            showRegistrationComingSoon(event); // Call your function
        });
    }


    // 每隔 20 秒随机弹一次
    setTimeout(showRecentPurchasePopup, 5000);   // 第一次，页面加载后 5 秒
    setTimeout(showRecentPurchasePopup, 35000);  // 第二次，35 秒后
});


// === 最近购买弹窗 ===
function showRecentPurchasePopup() {
  const popup = document.getElementById('recent-purchase-popup');
  if (!popup) return;

  const fakePurchases = [
    { name: 'Sarah', location: 'New York', product: 'Camping Tent', time: '2 minutes ago' },
    { name: 'David', location: 'California', product: 'Hiking Backpack', time: '5 minutes ago' },
    { name: 'Emily', location: 'London', product: 'Portable Blender', time: '3 minutes ago' },
    { name: 'Tom', location: 'Sydney', product: 'Outdoor Jacket', time: '8 minutes ago' },
    { name: 'Anna', location: 'Berlin', product: 'Waterproof Boots', time: '4 minutes ago' },
  ];

  const randomPurchase = fakePurchases[Math.floor(Math.random() * fakePurchases.length)];

  popup.innerHTML = `✔ <strong>${randomPurchase.name}</strong> from ${randomPurchase.location} just bought <strong>${randomPurchase.product}</strong> (${randomPurchase.time})`;
  popup.style.display = 'block';

  // 3 秒后自动隐藏
  setTimeout(() => {
    popup.style.display = 'none';
  }, 3000);
}


// 初始化购物车功能
function initCart() {
    updateCartDisplay();
    updateOrderSummary();
    updateCartCount();

    // 传入 Netlify 函数地址、推荐商品数量、渲染函数
    fetchAndRenderSuggestedProducts('/.netlify/functions/fetch-products', 3, renderProducts);
}

// 加载遮罩的辅助函数（显示）
function showLoadingOverlay() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.classList.add('active');
    }
}

// 加载遮罩的辅助函数（隐藏）
function hideLoadingOverlay() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.classList.remove('active');
    }
}

// 用户注册功能
function showRegistrationComingSoon(event) {
    event.preventDefault(); // Prevents the default link behavior (e.g., navigating to '#')
    showNotification("Hi there! Our registration feature isn't quite ready yet, but it's coming soon. Thanks for your patience!");
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
    });
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
    console.log("创建的购物车元素：", item)
    console.log("selectedColor 渲染测试：", item.selectedColor);
    console.log("attributes 渲染测试：", item.attributes)
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.dataset.productId = item.id;

    const hasVariants = Array.isArray(item.variant_options) && item.variant_options.length > 0;

    div.innerHTML = `
        <div class="item-image">
            <img src="${item.image_url || 'https://via.placeholder.com/150'}" alt="${item.name}" 
                 onerror="this.src='https://via.placeholder.com/150';">
        </div>
        <div class="item-details">
            <h3>${item.name}</h3>
            <p class="item-attributes">
                ${hasVariants
            ? generateVariantSelectHTML(item)
            : (item.selectedColor ? `<span class="selected-color">Color: ${item.selectedColor}</span>` : 'No specifications')
        }
            </p>
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

    if (totalElement) {
        totalElement.textContent = `$${total.toFixed(2)}`;
    } else {
        console.warn('total element not found');
    }


    // —— 同步每一行的“规格”显示 ——  
    cart.forEach(item => {
        const cartItemEl = document.querySelector(`.cart-item[data-product-id="${item.id}"]`);
        if (!cartItemEl) return;

        // 在这里判断是否已经有class="variant-group"，就跳过 ——  
        if (cartItemEl.querySelector('.variant-group')) {
            return;
        }

        const attrEl = cartItemEl.querySelector('.item-attributes');
        if (!attrEl) return;

        // 只有当还没有生成过 .variant-group 时，才去渲染下拉
        if (
            Array.isArray(item.variant_options) &&
            item.variant_options.length &&
            !attrEl.querySelector('.variant-group')
        ) {
            // 确保 item.selectedColor 有默认值（取第一项）
            if (!item.selectedColor) {
                const colorVariant = item.variant_options.find(v => v.label === 'color')
                    || item.variant_options[0];
                item.selectedColor = Array.isArray(colorVariant.options) && colorVariant.options.length
                    ? colorVariant.options[0]
                    : '';
            }

            // 渲染下拉菜单
            attrEl.innerHTML = generateVariantSelectHTML(item);

            // 重新绑定 change 事件
            const select = attrEl.querySelector('.variant-select');
            select.addEventListener('change', function () {
                const productId = this.dataset.productId;
                const selectedVal = this.value;
                const cartArr = window.CartManager.getCartItems();
                const cartItem = cartArr.find(i => String(i.id) === String(productId));
                if (cartItem) {
                    cartItem.selectedColor = selectedVal;
                    window.CartManager.saveCartItems(cartArr);
                    // 可选：刷新 summary/规格显示
                    updateOrderSummary();
                }
            });
        }
        // 如果没有 variant_options，或者已经生成过下拉，就保留现状
    });
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
function calculateShipping(subtotal) {
    if (subtotal === 0) return 0; // 空购物车不收运费
    return subtotal > 49 ? 0 : 10;
}

// 获取购物车数据
function getCart() {
    const cart = localStorage.getItem('cart');
    try {
        const parsedCart = cart ? JSON.parse(cart) : [];
        parsedCart.forEach((item, index) => {
            console.log(`第 ${index + 1} 个商品:`);
            console.log('ID:', item.id);
            console.log('名称:', item.name);
            console.log('数量:', item.quantity);
            console.log('价格:', item.price);
            console.log('所选颜色 (selectedColor):', item.selectedColor || '未指定');
            console.log('---');
        });

        return parsedCart;
        // return cart ? JSON.parse(cart) : [];
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
    // 过滤出移除的商品
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);

    console.log("点击移除商品：", cart)
    // 保存本地
    saveCart(cart);

    // 更新购物车显示
    updateCartDisplay();

    // 更新订单详细信息
    updateOrderSummary();

    // 更新购物车按钮的数量
    updateCartCount();

    // 调用输出方法
    showNotification('Item has been removed from cart');
}

// 更新数量
function updateQuantity(productId, change) {
    let cart = getCart();
    const item = cart.find(item => item.id === productId);
    if (item) {
        const maxQty = item.stock || 10;  // 如果有 stock 字段就用它，否则默认10
        item.quantity = Math.max(1, Math.min(maxQty, item.quantity + change));
        saveCart(cart);
        updateCartDisplay();
        updateOrderSummary();
        updateCartCount();
    }
}

// 通过输入更新数量
function updateQuantityInput(productId, value) {
    const quantity = parseInt(value);
    if (quantity >= 1 && quantity <= 100) {
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
        showNotification('Item saved for later purchase.');
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
    switch (type) {
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

// 添加辅助函数
function generateVariantSelectHTML(item) {
    if (!item.variant_options || !Array.isArray(item.variant_options) || item.variant_options.length === 0) {
        return '<p class="item-attributes">No variants</p>';
    }

    return item.variant_options.map(variant => {
        console.log('生成 select 时的 item.id:', item);
        const label = variant.label;
        const options = variant.options || [];
        const selectId = `variant-${label}-${item.id}`;

        const optionsHTML = options.map(option => {
            const selected = (option === item.selectedColor) ? 'selected' : '';
            return `<option value="${option}" ${selected}>${option}</option>`;
        }).join('');

        console.log(optionsHTML)

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

// 猜你喜欢（产品）
function renderProducts(products) {
    const productsGrid = document.getElementById('suggested-products');
    if (!productsGrid) return;

    productsGrid.innerHTML = '';
    products.forEach((product, index) => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card animated';
        productCard.style.opacity = '0';
        productCard.style.transform = 'translateY(20px)';
        productCard.style.transitionDelay = `${index * 100}ms`;

        productCard.innerHTML = `
            <img src="${product.image_url}" alt="${product.name}" loading="lazy" onerror="this.style.display='none'">
            <h3>${product.name}</h3>
            <div class="price">
                <span class="current-price">$${product.final_price}</span>
                <span class="original-price">$${parseFloat(product.price).toFixed(2)}</span>
            </div>
            <button class="add-to-cart">ADD TO CART</button>
        `;

        // 点击跳转到详情页
        productCard.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart')) {
                return;
            }
            localStorage.setItem('currentProduct', JSON.stringify(product));
            const productUUID = product.id;
            const productNameForUrl = product.name.replace(/\s+/g, '-').toLowerCase();
            window.location.href = `../products/product-detail.html?id=${productUUID}-${productNameForUrl}`;
        });

        // 加入购物车按钮单独处理
        const addToCartBtn = productCard.querySelector('.add-to-cart');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                console.log("将产品加入到购物车前的数据：", product)
                addToCart(product);
                // 更新购物车显示
                updateCartDisplay();

                // 更新订单详细信息
                updateOrderSummary();

                // 更新购物车按钮的数量
                updateCartCount();
            });
        }

        productsGrid.appendChild(productCard);

        // 启动动画
        setTimeout(() => {
            productCard.style.opacity = '1';
            productCard.style.transform = 'translateY(0)';
        }, 50);
    });
}


// 添加商品到购物车
function addToCart(product) {
    const productToAdd = {
        ...product,
        quantity: 1,  // 默认数量
        price: parseFloat(product.final_price || product.price) || 0,
    };

    const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
    cartItems.push(productToAdd);
    localStorage.setItem('cart', JSON.stringify(cartItems));
    showNotification(`${product.name} Added to cart`);
}


// 从后端（Netlify 函数）获取所有商品，随机选出 3 个，并调用回调函数渲染
async function fetchAndRenderSuggestedProducts(endpoint, count = 3, renderFn = renderProducts) {
    try {
        const response = await fetch(endpoint);
        const products = await response.json();

        // console.log("获取到的产品数据：", products)

        if (!Array.isArray(products)) {
            throw new Error('产品数据格式无效');
        }

        const shuffled = products.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, count);

        renderFn(selected); // 渲染推荐商品
    } catch (error) {
        console.error('加载推荐产品出错:', error);
    }
}