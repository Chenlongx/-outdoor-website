document.addEventListener('DOMContentLoaded', function() {
    let currentProducts = []; // 存储当前产品数据
    let currentCategory = 'all'; // 当前选中的分类
    let currentDiscount = 20; // 修改默认折扣为20%
    let currentSort = 'featured'; // 当前排序方式

    // 初始化购物车

    console.log('页面加载完成，开始获取数据...');
    startCountdown()
    updateFloatingCartCount();

    // 从Netlify 函数获取数据（获取优惠码）
    fetch('/.netlify/functions/get-unused-codes')  // 调用你定义的Netlify函数
    .then(response => {
        // console.log('获取优惠码响应:', response);
        if (!response.ok) {
            throw new Error('获取优惠码失败');
        }
        return response.json();
    })
    .then(codesData => {
        console.log('成功获取优惠码数据:', codesData);

        // 在页面上展示优惠码
        const promoCodeContainer = document.getElementById('promo-code');
        const copyButton = document.getElementById('copy-btn');

        if (promoCodeContainer && copyButton) {
            if (codesData && codesData.codes) {
                // 取第一个未使用的优惠码展示
                const code = codesData.codes.code;
                console.log("成功获取优惠码",code)
                promoCodeContainer.textContent = code;  // 显示优惠码

                // 设置复制按钮的点击事件
                copyButton.addEventListener('click', () => {
                    navigator.clipboard.writeText(code)
                        .then(() => {
                            alert('Copied the coupon code!');
                        })
                        .catch(err => {
                            console.error('无法复制优惠码:', err);
                        });
                });
            } else {
                promoCodeContainer.textContent = 'No coupon codes available';
                copyButton.disabled = true;
            }
        }
    })
    .catch(error => {
        console.error('获取优惠码失败:', error);
    });


    // 从 Netlify 函数获取数据
    fetch('/.netlify/functions/fetch-products')
        .then(response => {
            console.log('收到响应:', response);
            if (!response.ok) {
                throw new Error('网络响应不正常');
            }
            return response.json();
        })
        .then(data => {
            console.log('成功获取数据:', data);
    
            // 为每个产品添加模拟折扣数据
            currentProducts = data.map(product => ({
                ...product,
                rating: Math.random() * 2 + 3, // 随机生成3-5星的评分
                rating_count: Math.floor(Math.random() * 100) + 50 // 随机生成50-150条评价
            }));
    
            console.log('当前展示的产品数量:', currentProducts.length);
    
            // 检查产品网格元素是否存在
            const productGrid = document.querySelector('.product-grid');
            console.log('产品网格元素:', productGrid);
            
            if (productGrid) {
                // 渲染类别标签
                renderCategoryTabs();
                const filteredProducts = filterProducts();
                console.log('过滤后的产品数量:', filteredProducts.length);
                renderProducts(filteredProducts);
                setupEventListeners();
                // 设置默认选中的折扣按钮
                setDefaultDiscountFilter();
            } else {
                console.error('未找到产品网格元素');
            }
        })
        .catch(error => {
            console.error('获取数据失败:', error);
        });

    // 倒计时器
    async function startCountdown() {
        const countdownElement = document.getElementById('countdown');
        if (!countdownElement) return;

        try {
            // Fetch the end time from the Netlify function
            const response = await fetch('/.netlify/functions/get-activities');  // 调用Netlify函数
            const data = await response.json();
            
            // 获取从函数中返回的活动结束时间
            const countdownDate = new Date(data.endTime);  // 假设endTime是一个ISO格式的时间字符串

            function updateCountdown() {
                const now = new Date().getTime();
                const distance = countdownDate - now;

                // Calculate time units
                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);

                // Update DOM
                document.getElementById('days').textContent = days.toString().padStart(2, '0');
                document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
                document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
                document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');

                // If countdown is over
                if (distance < 0) {
                    clearInterval(countdownInterval);
                    countdownElement.innerHTML = 'Promotion Ended';
                }
            }

            // Initial call to update the countdown immediately
            updateCountdown();

            // Update countdown every second
            const countdownInterval = setInterval(updateCountdown, 1000);

        } catch (error) {
            console.error('Error fetching end time:', error);
        }
    }

    // 渲染类别标签
    function renderCategoryTabs() {
        const categoryTabs = document.querySelector('.category-tabs');
        if (!categoryTabs) return;

        // 获取所有唯一的类别
        const categories = ['all', ...new Set(currentProducts.map(product => product.category))];
        console.log('获取到的类别:', categories);

        // 清空现有的标签
        categoryTabs.innerHTML = '';

        // 创建并添加类别标签
        categories.forEach(category => {
            const button = document.createElement('button');
            button.className = `category-tab ${category === 'all' ? 'active' : ''}`;
            button.setAttribute('data-category', category);
            button.textContent = category === 'all' ? 'All Deals' : category;
            categoryTabs.appendChild(button);
        });
    }

    // 设置默认选中的折扣按钮
    function setDefaultDiscountFilter() {
        const discountFilters = document.querySelectorAll('.discount-filter');
        discountFilters.forEach(filter => {
            if (filter.getAttribute('data-discount') === '20') {
                filter.classList.add('active');
            } else {
                filter.classList.remove('active');
            }
        });
    }

    // 过滤产品
    function filterProducts() {
        let filteredProducts = [...currentProducts];
        console.log('开始过滤产品，初始数量:', filteredProducts.length);

        // 按分类过滤
        if (currentCategory !== 'all') {
            filteredProducts = filteredProducts.filter(product => 
                product.category === currentCategory
            );
            console.log('按分类过滤后数量:', filteredProducts.length);
        }

        // 按折扣过滤
        filteredProducts = filteredProducts.filter(product => 
            (1 - parseFloat(product.discount)) * 100 >= currentDiscount
        );
        console.log('按折扣过滤后数量:', filteredProducts.length);

        // 排序
        const sortedProducts = sortProducts(filteredProducts, currentSort);
        console.log('排序后产品数量:', sortedProducts.length);
        return sortedProducts;
    }

    // 排序函数
    function sortProducts(products, sortType) {
        const sortedProducts = [...products];
        switch(sortType) {
            case 'discount':
                sortedProducts.sort((a, b) => b.discount - a.discount);
                break;
            case 'price-low':
                sortedProducts.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
                break;
            case 'price-high':
                sortedProducts.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
                break;
            case 'newest':
                sortedProducts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                break;
            default: // featured
                sortedProducts.sort((a, b) => b.rating - a.rating);
        }
        return sortedProducts;
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

    // 渲染产品
    function renderProducts(products) {
        const productGrid = document.querySelector('.product-grid');
        if (!productGrid) {
            console.error('渲染产品时未找到产品网格元素');
            return;
        }

        console.log('开始渲染产品，数量:', products.length);
        productGrid.innerHTML = '';

        if (products.length === 0) {
            productGrid.innerHTML = '<p class="no-products">No matching products found</p>';
            return;
        }

        products.forEach(product => {
            const productCard = createProductCard(product);
            productGrid.appendChild(productCard);
        });
        console.log('产品渲染完成');
    }

    // 创建产品卡片
    function createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.setAttribute('data-category', product.category);
        card.setAttribute('data-discount', product.discount);

        // 处理 price 和 discount
        card.innerHTML = `
            <div class="discount-tag">-${product.discount_percent}%</div>
            <img src="${product.image_url}" alt="${product.name}" class="product-image">
            <h3>${product.name}</h3>
            <p class="product-description">${product.description}</p>
            <div class="price">
                <span class="current-price">$${parseFloat(product.final_price).toFixed(2)}</span>
                <span class="original-price">$${parseFloat(product.price).toFixed(2)}</span>
            </div>
            <div class="rating">
                ${generateRatingStars(product.rating)}
                <span class="rating-count">(${product.rating_count})</span>
            </div>
            <button class="add-to-cart" data-product-id="${product.id}">Add to Cart</button>
        `;

        // 添加点击事件
        const productImage = card.querySelector('.product-image');
        productImage.addEventListener('click', (e) => {
            if (!e.target.classList.contains('add-to-cart')) {
                // 存储当前产品 
                // localStorage.setItem('currentProduct', JSON.stringify(product));

                // 使用产品名称生成友好的 URL 格式，去除空格并转换为小写字母
                const productNameForUrl = product.name.replace(/\s+/g, '-').toLowerCase();
        
                // 跳转到产品详情页
                window.location.href = `./product-detail.html?id=${product.id}-${productNameForUrl}`;
            }
        });
        
        // 添加购物车按钮事件
        const addToCartBtn = card.querySelector('.add-to-cart');
        addToCartBtn.addEventListener('click', (e) => {
            e.stopPropagation();

            // 存储当前点击的产品信息到 localStorage
            // localStorage.setItem('currentProduct', JSON.stringify(product));

            addToCart(product);

            // 更新页面信息
            updateCartDisplay()

            updateOrderSummary()
            
        });

        return card;
    }

    // 生成评分星星
    function generateRatingStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        let stars = '';

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars += '<i class="fas fa-star"></i>';
            } else if (i === fullStars && hasHalfStar) {
                stars += '<i class="fas fa-star-half-alt"></i>';
            } else {
                stars += '<i class="far fa-star"></i>';
            }
        }

        return stars;
    }

    // 设置事件监听器
    function setupEventListeners() {
        // 分类标签点击事件
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                currentCategory = tab.getAttribute('data-category');
                document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                renderProducts(filterProducts());
            });
        });

        // 折扣过滤点击事件
        document.querySelectorAll('.discount-filter').forEach(filter => {
            filter.addEventListener('click', () => {
                currentDiscount = parseInt(filter.getAttribute('data-discount'));
                document.querySelectorAll('.discount-filter').forEach(f => f.classList.remove('active'));
                filter.classList.add('active');
                renderProducts(filterProducts());
            });
        });

        // 排序选择事件
        const sortSelect = document.querySelector('.sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', () => {
                currentSort = sortSelect.value;
                renderProducts(filterProducts());
            });
        }
    }

    // 显示通知
    function showNotification(message) {
        // 获取现有的通知容器，如果没有则创建一个
        let notificationContainer = document.querySelector('.notification-container');
    
        if (!notificationContainer) {
            // 创建新的通知容器
            notificationContainer = document.createElement('div');
            notificationContainer.classList.add('notification-container');
            document.body.appendChild(notificationContainer);
    
            // 样式化通知容器
            notificationContainer.style.position = 'fixed';
            notificationContainer.style.top = '10px'; // 设置通知容器距离顶部的位置
            notificationContainer.style.right = '20px'; // 设置通知容器距离右侧的位置
            notificationContainer.style.zIndex = '9999'; // 确保通知在最上层
            notificationContainer.style.maxWidth = '300px'; // 设置最大宽度
            notificationContainer.style.overflow = 'hidden'; // 防止内容超出
            notificationContainer.style.display = 'flex';
            notificationContainer.style.flexDirection = 'column';
            notificationContainer.style.alignItems = 'flex-start';
            notificationContainer.style.gap = '10px'; // 确保通知之间有间距
        }
    
        // 创建新的通知
        const notification = document.createElement('div');
        notification.classList.add('notification');
        notification.textContent = message;
    
        // 为通知设置样式
        notification.style.backgroundColor = 'var(--primary-color)';
        notification.style.color = 'white';
        notification.style.padding = '12px 20px';
        notification.style.borderRadius = '4px';
        notification.style.boxShadow = '0 3px 10px rgba(0,0,0,0.15)';
        notification.style.opacity = '1'; // 确保通知初始时可见
        notification.style.transition = 'opacity 0.3s ease';
    
        // 将通知添加到容器中
        notificationContainer.appendChild(notification);
    
        // 隐藏通知，3秒后移除
        setTimeout(() => {
            notification.style.opacity = '0'; // 渐隐效果
        }, 1000);
    
        // 在渐隐效果完成后删除通知
        setTimeout(() => {
            notification.remove();
        }, 3300);
    }
    

    // 添加到购物车
    function addToCart(product) {
        // 获取购物车数据
        let cart = JSON.parse(localStorage.getItem('cart')) || [];

        const existingItem = cart.find(item => item.id === product.id);
        
        if (existingItem) {
            // 如果产品已在购物车中，增加数量
            existingItem.quantity += 1;
        } else {
            // 如果产品不在购物车中，直接添加整个 product 对象
            // product.quantity = 1; // 默认数量为 1
            // cart.push(product);
            // 把产品所有字段都保存进去，但价格字段用打折价 final_price
            const productToCart = {
                ...product,
                price: parseFloat(product.final_price).toFixed(2), // 覆盖原price为折扣价
                quantity: 1 // 新增 quantity 字段
            };

            cart.push(productToCart);
        }
        
        // 保存购物车数据
        console.log(product)
        
        localStorage.setItem('cart', JSON.stringify(cart));

        // 更新购物车数量显示
        updateCartCount();

        // 更新悬浮购物车按钮数量
        updateFloatingCartCount();
        
        // 显示添加成功提示
        showNotification(product.name +'Item has been added to cart');
    }




    // 更新购物车数量显示
    function updateCartCount() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
        }
    }

    // 监听 localStorage 变化，更新购物车的数量
    window.addEventListener('storage', function(event) {
        if (event.key === 'cart') {
            updateFloatingCartCount();
        }
    });

    // 更新悬浮购物车按钮购物车数量
    function updateFloatingCartCount() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
        const cartCountElement = document.querySelector('.floating-cart-btn .cart-count');
        if (cartCountElement) {
            cartCountElement.textContent = cartCount;
        }
    }
    
}); 