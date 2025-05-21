document.addEventListener('DOMContentLoaded', function () {
    let currentProducts = []; // 存储当前产品数据
    let currentCategory = null; // 当前选中的分类
    let currentSubcategory = null; // 当前选中的子分类
    let currentPage = 1; // 当前页码
    let currentSort = 'default'; // 当前排序方式
    const productsPerPage = 12; // 每页显示的产品数量
    let originalProducts = [];

    // 获取首页携带的产品参数
    const urlParams = new URLSearchParams(window.location.search);
    const urlCategory = urlParams.get('category');
    const urlSubcategory = urlParams.get('subcategory');


    function highlightCategoryInSidebar() {
        const categoryItems = document.querySelectorAll('.category-item');
        categoryItems.forEach(item => {
            if (item.textContent.toLowerCase() === currentCategory.toLowerCase()) {
                item.classList.add('active');
            }
        });
    }

    // 购物车管理对象
    const cart = {
        getCartItems() {
            return JSON.parse(localStorage.getItem('cart')) || [];
        },
        saveCartItems(items) {
            localStorage.setItem('cart', JSON.stringify(items));
        },
        addToCart(product) {
            const items = this.getCartItems();
            const existingItem = items.find(item => item.id === product.id);

            if (existingItem) {
                existingItem.quantity += 1; // 如果已存在，增加数量
            } else {
                const discountedPrice = parseFloat(product.final_price) || 0; // 使用折扣后的final_price

                // 确保产品图片路径正确保存
                const productToAdd = {
                    ...product,
                    price: discountedPrice, // 👉 保存折扣后的价格
                    image: product.image_url, // 确保使用image_url作为image属性
                    quantity: 1 // 新增产品，默认数量为 1
                };


                items.push(productToAdd);
            }

            this.saveCartItems(items);
            this.updateCartCount();
            this.showNotification(`${product.name} Added to cart`);
        },
        updateCartCount() {
            const items = this.getCartItems();
            const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
            // 页面右上角购物车的数量
            const cartCount = document.querySelectorAll('.cart-count');
            if (cartCount.length > 0) {
                // 遍历所有的 .cart-count 元素并更新它们的数量
                cartCount.forEach(cartCount => {
                    cartCount.textContent = totalItems;  // 设置为购物车的总数量
                });
            }
        },
        showNotification(message) {
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
    };

    // 监听本地存储的变化
    window.addEventListener('storage', (e) => {
        if (e.key === 'cart') {
            cart.updateCartCount();  // 更新购物车数量
        }
    });

    // 从 Netlify 函数获取数据
    fetch('/.netlify/functions/fetch-products')
        .then(response => response.json())
        .then(data => {
            originalProducts = data; // <== 保存原始完整数据
            currentProducts = data;
            console.log('获取到的产品数据:', data);
            renderCategories();

            if (urlCategory) {
                currentCategory = decodeURIComponent(urlCategory);
                currentSubcategory = urlSubcategory ? decodeURIComponent(urlSubcategory) : null;

                // 使用 name 字段进行模糊匹配（忽略大小写）
                const filteredByName = data.filter(product =>
                    product.name.toLowerCase().includes(currentCategory.toLowerCase())
                );

                // 如果匹配到则用过滤后的数据渲染，否则默认按原分类字段过滤
                if (filteredByName.length > 0) {
                    currentProducts = filteredByName;
                    console.log('按 name 模糊匹配后的产品:', currentProducts);
                } else {
                    currentProducts = data.filter(product =>
                        product.category && product.category.toLowerCase().includes(currentCategory.toLowerCase())
                    );

                    // ✅ 如果还是没匹配到，隐藏分类侧边栏
                    if (currentProducts.length === 0) {
                        const sidebar = document.querySelector('.categories-sidebar');
                        if (sidebar) sidebar.style.display = 'none';

                        // 隐藏分页
                        const paginationnone = document.querySelector('.pagination');
                        if (paginationnone) paginationnone.style.display = 'none';

                        // 👇 没有子分类时显示提示信息
                        const subcategoriesNav = document.querySelector('.subcategories-nav');
                        subcategoriesNav.innerHTML = `<p style="padding: 1rem; color: #888;">No related products found</p>`;
                        return;
                    }
                }

                // 生成canonical链接（通过js生成）
                // 获取当前完整 URL（不包含锚点）
                const currentUrl = window.location.origin + window.location.pathname + window.location.search;
                // 创建 canonical 标签
                const canonical = document.createElement('link');
                canonical.setAttribute('rel', 'canonical');

                // 根据是否有 category 参数设置 canonical href
                if (urlCategory) {
                    canonical.setAttribute('href', currentUrl);
                } else {
                    canonical.setAttribute('href', 'https://summitgearhub.com/products/');
                }

                // 插入到 <head> 中（如果已有旧 canonical 可先删除）
                const oldCanonical = document.querySelector('link[rel="canonical"]');
                if (oldCanonical) {
                    oldCanonical.remove();
                }
                document.head.appendChild(canonical);

                renderSubcategories();
                renderProducts(getPaginatedProducts());
                highlightCategoryInSidebar();
            } else {
                currentProducts = data; // ✅ 缺失的这一行补上！
                renderProducts(getPaginatedProducts());
            }

            cart.updateCartCount(); // 初始化购物车计数
            setupCartEventListeners(); // 设置购物车事件监听器
        })
        .catch(error => {
            console.error('获取数据失败:', error);
        });

    // 渲染分类侧边栏
    function renderCategories() {
        const categoriesSidebar = document.querySelector('.categories-sidebar');
        if (!categoriesSidebar) return;

        const categoriesList = document.createElement('ul');
        categoriesList.className = 'categories-list';

        // 从产品数据中提取所有主分类
        const mainCategories = [...new Set(currentProducts
            .map(product => product.category)
            .filter(category => category))];

        // 点击选项项展示相关的产品
        mainCategories.forEach(category => {
            const categoryItem = document.createElement('li');
            categoryItem.className = 'category-item';
            categoryItem.textContent = category;
            categoryItem.addEventListener('click', () => {
                console.log(categoryItem)
                currentCategory = category;
                currentSubcategory = null;
                currentPage = 1;
                renderSubcategories();
                renderProducts(getPaginatedProducts());
                updateActiveCategory(categoryItem);
            });
            categoriesList.appendChild(categoryItem);
        });

        categoriesSidebar.appendChild(categoriesList);
    }

    // 渲染子分类导航
    function renderSubcategories() {
        const subcategoriesNav = document.querySelector('.subcategories-nav');
        if (!subcategoriesNav) return;

        subcategoriesNav.innerHTML = '';

        if (currentCategory) {
            // 从产品数据中提取当前主分类下的所有子分类
            const subcategories = [...new Set(currentProducts
                .filter(product => product.category === currentCategory)
                .map(product => product.subcategory)
                .filter(subcategory => subcategory))];

            if (subcategories.length > 0) {
                const subcategoriesList = document.createElement('ul');
                subcategoriesList.className = 'subcategories-list';

                subcategories.forEach(subcategory => {
                    const subcategoryItem = document.createElement('li');
                    subcategoryItem.className = 'subcategory-item';
                    subcategoryItem.textContent = subcategory;
                    subcategoryItem.addEventListener('click', () => {
                        currentSubcategory = subcategory;
                        currentPage = 1;
                        renderProducts(getPaginatedProducts());
                        updateActiveSubcategory(subcategoryItem);
                    });
                    subcategoriesList.appendChild(subcategoryItem);
                });

                subcategoriesNav.appendChild(subcategoriesList);
            }
        }
    }

    // 更新活动分类样式
    function updateActiveCategory(activeItem) {
        document.querySelectorAll('.category-item').forEach(item => {
            item.classList.remove('active');
        });
        activeItem.classList.add('active');
    }

    // 更新活动子分类样式
    function updateActiveSubcategory(activeItem) {
        document.querySelectorAll('.subcategory-item').forEach(item => {
            item.classList.remove('active');
        });
        activeItem.classList.add('active');
    }

    // 获取分页后的产品
    function getPaginatedProducts() {
        let filteredProducts = [...currentProducts];

        // 按分类和子分类过滤
        if (currentCategory && currentProducts === originalProducts) {
            filteredProducts = filteredProducts.filter(product =>
                product.category === currentCategory
            );
        }
        if (currentSubcategory) {
            filteredProducts = filteredProducts.filter(product =>
                product.subcategory === currentSubcategory
            );
        }

        // 排序
        filteredProducts = sortProducts(filteredProducts, currentSort);

        // 分页
        const startIndex = (currentPage - 1) * productsPerPage;
        const endIndex = startIndex + productsPerPage;
        return filteredProducts.slice(startIndex, endIndex);
    }

    // 添加排序事件监听器
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', function () {
            currentSort = this.value;
            currentPage = 1; // 重置页码
            renderProducts(getPaginatedProducts());
            renderPagination(currentProducts.length);
        });
    }

    // 排序函数
    function sortProducts(products, sortType) {
        const sortedProducts = [...products];
        switch (sortType) {
            case 'price-asc':
                sortedProducts.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
                break;
            case 'price-desc':
                sortedProducts.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
                break;
            case 'name-asc':
                sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-desc':
                sortedProducts.sort((a, b) => b.name.localeCompare(a.name));
                break;
            default:
                sortedProducts.sort((a, b) => a.id - b.id);
        }
        return sortedProducts;
    }

    // 渲染产品到页面
    function renderProducts(products) {
        const productsGrid = document.querySelector('.products-grid');
        if (!productsGrid) return;

        productsGrid.innerHTML = '';

        products.forEach(product => {
            const productCard = createProductCard(product);
            productsGrid.appendChild(productCard);
        });

        // 更新分页
        renderPagination(currentProducts.length);

        injectItemListJsonLD(products);
    }

    function createProductCard(product, index) {
        const card = document.createElement('div');
        card.className = 'product-card';

        // 使用产品名称生成友好的 URL 格式，去除空格并转换为小写字母
        const productNameForUrl = product.name.replace(/\s+/g, '-').toLowerCase();

        // 创建跳转到详情页的链接，包含简化后的 ID 和产品名称
        const productLink = document.createElement('a');
        productLink.href = `./product-detail.html?id=${product.id}-${productNameForUrl}`; // 生成带有简短 ID 和产品名称的 URL
        productLink.className = 'product-link';
        productLink.setAttribute('aria-label', `View details of ${product.name}`);

        // 创建图片容器
        const productImage = document.createElement('div');
        productImage.className = 'product-image';

        // 在图片容器中添加图片
        const img = document.createElement('img');
        img.src = product.image_url;
        img.alt = product.name;
        img.loading = 'lazy';

        // 页面首屏的前 3 张图片用高优先级、其余继续懒加载
        if (index < 3) {
            img.loading = 'eager';
            img.setAttribute('fetchpriority', 'high');
        } else {
            img.loading = 'lazy';
            img.setAttribute('fetchpriority', 'low');
        }

        // 将图片添加到图片容器
        productImage.appendChild(img);

        // 为图片容器添加点击事件，跳转到产品详情页
        productImage.addEventListener('click', (e) => {
            window.location.href = productLink.href; // 点击图片容器跳转到详情页
        });

        // 计算折扣价，保证是数字类型
        // const price = parseFloat(product.price) || 0;
        // const discount = parseFloat(product.discount) || 1;
        // const discountedPrice = (price * discount).toFixed(2);
        const discountedPrice = parseFloat(product.final_price) || 0; // 使用 final_price 而不是手动计算

        // 创建产品信息容器
        const productInfo = document.createElement('div');
        productInfo.className = 'product-info';
        productInfo.innerHTML = `
            <h2 class="product-name">${product.name}</h2>
            <p class="product-original-price">
                Original Price: $${parseFloat(product.price).toFixed(2)}
            </p>
            <p class="product-price">$${discountedPrice.toFixed(2)}</p>
            <p class="product-stock">stock items: ${product.stock}</p>
            <p class="product-description">${product.description}</p>
            <button class="add-to-cart-btn" data-product-id="${product.id}">add to the cart</button>
        `;

        // 将图片和产品信息容器添加到跳转链接容器中
        productLink.appendChild(productImage);
        productLink.appendChild(productInfo);

        // 为加入购物车按钮添加单独的点击事件
        const addToCartBtn = productInfo.querySelector('.add-to-cart-btn');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // 阻止事件冒泡，确保按钮点击不触发跳转
                e.preventDefault();  // 阻止默认行为
                const productId = e.target.getAttribute('data-product-id');
                const product = currentProducts.find(p => p.id === productId); // 查找对应的产品
                // cart.addToCart(productId);
                if (product) {
                    cart.addToCart(product); // 调用 cart 对象的 addToCart 方法
                }
                // 将产品
            });
        }

        // 将跳转链接添加到卡片容器中
        card.appendChild(productLink);

        // ✅ 插入产品级结构化数据
        injectProductJsonLD(product);

        return card;
    }



    // 渲染分页
    function renderPagination(totalProducts) {
        const pagination = document.querySelector('.pagination');
        if (!pagination) return;

        const totalPages = Math.ceil(totalProducts / productsPerPage);
        const pageNumbers = document.querySelector('.page-numbers');
        pageNumbers.innerHTML = '';

        // 上一页按钮
        const prevButton = document.createElement('button');
        prevButton.className = 'page-btn';
        prevButton.textContent = 'Previous page';
        prevButton.disabled = currentPage === 1;
        prevButton.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderProducts(getPaginatedProducts());
                renderPagination(totalProducts);
            }
        });
        pageNumbers.appendChild(prevButton);

        // 页码按钮
        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement('button');
            pageButton.className = `page-btn ${i === currentPage ? 'active' : ''}`;
            pageButton.textContent = i;
            pageButton.addEventListener('click', () => {
                currentPage = i;
                renderProducts(getPaginatedProducts());
                renderPagination(totalProducts);
            });
            pageNumbers.appendChild(pageButton);
        }

        // 下一页按钮
        const nextButton = document.createElement('button');
        nextButton.className = 'page-btn';
        nextButton.textContent = 'Next Page';
        nextButton.disabled = currentPage === totalPages;
        nextButton.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderProducts(getPaginatedProducts());
                renderPagination(totalProducts);
            }
        });
        pageNumbers.appendChild(nextButton);
    }

    // 设置购物车事件监听器
    function setupCartEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart-btn')) {
                const productId = e.target.getAttribute('data-product-id');
                addToCart(productId);
            }
        });
    }

    // 添加到购物车
    function addToCart(productId) {
        const product = currentProducts.find(p => p.id === productId);
        if (product) {
            cart.addToCart(product);
        }
    }

    // 定义一个函数 injectItemListJsonLD(products)，生成 JSON-LD 并插入 <script type="application/ld+json"> 标签
    function injectItemListJsonLD(products) {
        // 移除旧的 JSON-LD（避免重复）
        const oldScript = document.getElementById('jsonld-itemlist');
        if (oldScript) oldScript.remove();

        // 创建结构化数据对象
        const itemList = {
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": "WildGear Product Listing",
            "url": window.location.href,
            "numberOfItems": products.length,
            "itemListElement": products.map((product, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "url": `${window.location.origin}/products/product-detail.html?id=${product.id}-${product.name.replace(/\s+/g, '-').toLowerCase()}`
            }))
        };

        // 创建并插入新的 JSON-LD 脚本标签
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = 'jsonld-itemlist';
        script.textContent = JSON.stringify(itemList, null, 2); // 格式化方便调试
        document.head.appendChild(script);
    }
    // 定义产品级结构化数据函数
    function injectProductJsonLD(product) {
        const script = document.createElement('script');
        script.type = 'application/ld+json';

        const productSchema = {
            "@context": "https://schema.org",
            "@type": "Product",
            "name": product.name,
            "image": product.image_url,
            "description": product.description,
            "sku": product.id,
            "brand": {
                "@type": "Brand",
                "name": "WildGear"
            },
            "offers": {
                "@type": "Offer",
                "url": `${window.location.origin}/products/product-detail.html?id=${product.id}-${product.name.replace(/\s+/g, '-').toLowerCase()}`,
                "priceCurrency": "USD",
                "price": parseFloat(product.final_price).toFixed(2),
                "availability": "https://schema.org/InStock",
                "priceValidUntil": "2028-12-31",
                "shippingDetails": {
                    "@type": "OfferShippingDetails",
                    "shippingDestination": {
                        "@type": "DefinedRegion",
                        "addressCountry": "US"
                    },
                    "shippingRate": {
                        "@type": "MonetaryAmount",
                        "value": "0.00",
                        "currency": "USD"
                    },
                    "shippingThreshold": {
                        "@type": "MonetaryAmount",
                        "value": "49.90",
                        "currency": "USD"
                    }
                }
            }
        };

        script.textContent = JSON.stringify(productSchema, null, 2);
        document.head.appendChild(script);
    }

});