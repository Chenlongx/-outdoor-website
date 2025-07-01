// 获取URL中的搜索关键词
function getSearchQuery() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('q') || '';  // 如果没有搜索关键词，返回空字符串
}


// 添加商品到购物车
function addToCart(product) {
    // 直接使用本地缓存，移除 CartManager 的判断
    const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
    cartItems.push(product);
    localStorage.setItem('cart', JSON.stringify(cartItems));
    showNotification(`${product.name} Added to cart`); // 统一通知
}

// 渲染搜索结果
function renderSearchResults(products) {
    const resultsContainer = document.querySelector('.search-results-grid');
    resultsContainer.innerHTML = ''; // 清空现有结果

    if (products.length === 0) {
        resultsContainer.innerHTML = `
            <div class="no-results">
                No products found. Please try other keywords.
            </div>
        `;
        return;
    }

    // 显示所有找到的产品
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <img src="${product.image_url}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <div class="price-container">
                    <span class="current-price">$${product.price}</span>
                    ${product.originalPrice ? `<span class="original-price">$${product.originalPrice}</span>` : ''}
                </div>
                <p class="product-description">${product.description}</p>
                <button class="add-to-cart" data-product-id="${product.id}">
                    Add to Cart
                </button>
            </div>
        `;
        resultsContainer.appendChild(productCard);

        // 为产品卡片本身添加点击事件，用于跳转到产品详情页
        productCard.addEventListener('click', (event) => {
            // 检查点击事件是否来自“添加到购物车”按钮，如果是，则不执行页面跳转
            if (!event.target.classList.contains('add-to-cart')) {
                const productUUID = product.id;
                const productNameForUrl = product.name.replace(/\s+/g, '-').toLowerCase();
                window.location.href = `product-detail.html?id=${productUUID}-${productNameForUrl}`;
            }
        });

    });

    // 添加"加入购物车"按钮的点击事件
    resultsContainer.addEventListener('click', function (event) {
        if (event.target.classList.contains('add-to-cart')) {
            const productId = event.target.dataset.productId;
            // 找到对应的产品对象
            const productToAdd = products.find(p => p.id === productId);

            if (productToAdd) {
                // 直接调用你上面定义的 addToCart 函数
                addToCart(productToAdd);
            } else {
                console.error('Error: Product not found for ID:', productId);
            }
            event.stopPropagation(); // 阻止事件冒泡，避免触发产品卡片的跳转事件
        }
    });
}



// 显示通知
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// 从后端获取产品数据
async function fetchProducts(query = '') {
    try {
        // 显示加载状态
        document.querySelector('.search-results-grid').innerHTML = '<div class="loading">Loading products...</div>';

        // 从后端API获取产品数据
        const response = await fetch(`/.netlify/functions/search-products?q=${encodeURIComponent(query)}`);

        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }

        const products = await response.json();

        // 更新结果数量
        document.querySelector('.result-count').textContent = `Found ${products.length} products`;

        // 渲染搜索结果
        renderSearchResults(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        document.querySelector('.search-results-grid').innerHTML = '<div class="error">Error loading products. Please try again later.</div>';
    }
}



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

// 从 localStorage 中安全地获取购物车数据
function getCart() {
    try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        return Array.isArray(cart) ? cart : []; // 确保返回的是数组
    } catch (error) {
        console.error("Error parsing cart data from localStorage:", error);
        return [];
    }
}

// 更新购物车显示（用于购物车图标旁的数量）
function updateCartDisplay() {
    // 在搜索页面，我们主要关心的是更新购物车图标旁边的数量。
    const cartItemCount = document.getElementById('cart-item-count'); // 假设你的购物车数量元素ID是 cart-item-count
    const cart = getCart();

    console.log(cart)

    if (cartItemCount) {
        cartItemCount.textContent = Array.isArray(cart) ? cart.length : 0;
    }

    // 以下代码块通常用于显示购物车详情列表，在搜索页面可能不需要
    const cartItemsContainer = document.getElementById('cart-items-container');
    if (cartItemsContainer) { // 只有当元素存在时才尝试更新其内容
        cartItemsContainer.innerHTML = '';
        if (!Array.isArray(cart) || cart.length === 0) {
            cartItemsContainer.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
        } else {
            cart.forEach(item => {
            });
        }
    } else {
        // console.warn('cart-items-container not found on this page.');
    }
}

// 初始化搜索页面
function initSearchPage() {
    const query = getSearchQuery();  // 从URL获取搜索关键词
    const searchKeyword = document.querySelector('.search-keyword');

    searchKeyword.textContent = query ? `"${query}"` : 'No search query provided';  // 显示搜索关键词

    // 倒计时
    startCountdown()

    // 从后端获取产品数据
    fetchProducts(query);

    // 购车数量
    updateCartDisplay()
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initSearchPage);
