document.addEventListener('DOMContentLoaded', function() {
    let currentProducts = []; // 存储当前产品数据
    let currentCategory = 'all'; // 当前选中的分类
    let currentDiscount = 20; // 修改默认折扣为20%
    let currentSort = 'featured'; // 当前排序方式

    // 初始化购物车
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    console.log('页面加载完成，开始获取数据...');

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
                discount: Math.floor(Math.random() * 20) + 20, // 随机生成20-40%的折扣
                rating: Math.random() * 2 + 3, // 随机生成3-5星的评分
                rating_count: Math.floor(Math.random() * 100) + 50 // 随机生成50-150条评价
            }));
            console.log('当前产品数量:', currentProducts.length);
            
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
            product.discount >= currentDiscount
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
            productGrid.innerHTML = '<p class="no-products">没有找到符合条件的商品</p>';
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
        
        const currentPrice = (product.price * (1 - product.discount / 100)).toFixed(2);
        
        card.innerHTML = `
            <div class="discount-tag">-${product.discount}%</div>
            <img src="${product.image_url}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p class="product-description">${product.description}</p>
            <div class="price">
                <span class="current-price">$${currentPrice}</span>
                <span class="original-price">$${product.price}</span>
            </div>
            <div class="rating">
                ${generateRatingStars(product.rating)}
                <span class="rating-count">(${product.rating_count})</span>
            </div>
            <button class="add-to-cart" data-product-id="${product.id}">Add to Cart</button>
        `;

        // 添加点击事件
        card.addEventListener('click', (e) => {
            if (!e.target.classList.contains('add-to-cart')) {
                // 存储当前产品信息
                localStorage.setItem('currentProduct', JSON.stringify(product));
                // 跳转到产品详情页
                window.location.href = 'product-detail.html';
            }
        });
        
        // 添加购物车按钮事件
        const addToCartBtn = card.querySelector('.add-to-cart');
        addToCartBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            addToCart(product);
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

    // 添加到购物车
    function addToCart(product) {
        const existingItem = cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                image: product.image_url,
                price: product.price,
                quantity: 1
            });
        }
        
        // 保存购物车数据
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // 更新购物车数量显示
        updateCartCount();
        
        // 显示添加成功提示
        showNotification('商品已添加到购物车');
    }

    // 更新购物车数量显示
    function updateCartCount() {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
        }
    }

    // 显示通知
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // 2秒后移除通知
        setTimeout(() => {
            notification.remove();
        }, 2000);
    }
}); 