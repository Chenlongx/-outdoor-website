// 获取URL中的搜索关键词
function getSearchQuery() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('q') || '';  // 如果没有搜索关键词，返回空字符串
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
    });

    // 添加"加入购物车"按钮的点击事件
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.target.getAttribute('data-product-id');
            addToCart(productId, products);
        });
    });
}

// 添加到购物车
function addToCart(productId, products) {
    const product = products.find(p => p.id === productId);
    
    if (product) {
        CartManager.addToCart(product);
        showNotification('Product added to cart');
    }
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

// 初始化搜索页面
function initSearchPage() {
    const query = getSearchQuery();  // 从URL获取搜索关键词
    const searchKeyword = document.querySelector('.search-keyword');
    
    searchKeyword.textContent = query ? `"${query}"` : 'No search query provided';  // 显示搜索关键词

    // 从后端获取产品数据
    fetchProducts(query);
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initSearchPage);
