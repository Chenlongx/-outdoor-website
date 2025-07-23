document.addEventListener('DOMContentLoaded', function () {
    let currentProducts = []; // 存储当前产品数据
    let currentCategory = null; // 当前选中的分类
    let currentSubcategory = null; // 当前选中的子分类
    let currentPage = 1; // 当前页码
    let currentSort = 'default'; // 当前排序方式
    const productsPerPage = 12; // 每页显示的产品数量
    let originalProducts = [];

    const searchTrigger = document.getElementById('header-search');
    const searchOverlay = document.querySelector('.search-overlay');
    const closeButton = document.getElementById('close-search');
    // 搜索功能
    initSearch()

    // 倒计时
    startCountdown()

    // 点击搜索图标显示搜索框
    if(searchTrigger){
        searchTrigger.addEventListener('click', (e) => {
            e.preventDefault(); // 阻止默认链接行为
            searchOverlay.style.opacity = '1';
            searchOverlay.style.display = "inline-flex";
            searchOverlay.style.visibility = 'visible';
        });
    }


    // 点击关闭按钮隐藏搜索框
    if(closeButton){
        closeButton.addEventListener('click', () => {
            searchOverlay.style.opacity = '0';
            searchOverlay.style.visibility = 'hidden';
        });
    }


    // 点击遮罩层关闭（排除搜索容器内部的点击）
    if(searchOverlay){
        searchOverlay.addEventListener('click', (e) => {
            // 检查点击是否发生在遮罩层而不是搜索容器内部
            if (e.target === searchOverlay) {
                searchOverlay.style.opacity = '0';
                searchOverlay.style.visibility = 'hidden';
            }
        });
    }


    // 按ESC键关闭
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && searchOverlay.style.visibility === 'visible') {
            searchOverlay.style.opacity = '0';
            searchOverlay.style.visibility = 'hidden';
        }
    });

    const productsGrid = document.getElementById('products-grid'); // 获取产品网格
    const skeletonGridContainer = document.getElementById('skeleton-grid-container'); // 获取骨架屏容器

    // 显示骨架屏
    if (skeletonGridContainer) {
        skeletonGridContainer.classList.remove('hidden');
        if (productsGrid) {
            productsGrid.style.display = 'none'; // 暂时隐藏实际产品网格
        }
    }

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
            const items = JSON.parse(localStorage.getItem('cart')) || [];
            // 遍历每个购物车项，确保 quantity 是数字
            return items.map(item => ({
                ...item,
                quantity: parseFloat(item.quantity) || 0 // 将 quantity 转换为数字，如果转换失败则默认为 0
            }));
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
            
            console.log("购物车数量： " + totalItems)
            
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

    // —— 调用封装视图切换方法 —— 
    setupViewToggle();

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
                    currentCategory = null;
                } else {
                    currentProducts = data.filter(product =>
                        product.category && product.category.toLowerCase().includes(currentCategory.toLowerCase())
                    );

                    // ✅ 如果还是没匹配到，隐藏分类侧边栏
                    if (currentProducts.length === 0) {
                        // const sidebar = document.querySelector('.categories-sidebar');
                        // if (sidebar) sidebar.style.display = 'none';

                        // 隐藏分页
                        const paginationnone = document.querySelector('.pagination');
                        if (paginationnone) paginationnone.style.display = 'none';

                        // 👇 没有子分类时显示提示信息
                        const subcategoriesNav = document.querySelector('.subcategories-nav');
                        subcategoriesNav.innerHTML = `<p style="padding: 1rem; color: #888;">No related products found</p>`;

                        // 数据加载完毕，隐藏骨架屏，显示产品网格（即使没有产品也要隐藏骨架屏）
                        if (skeletonGridContainer) {
                            skeletonGridContainer.classList.add('hidden');
                        }
                        if (productsGrid) {
                            productsGrid.style.display = 'grid'; // 确保网格布局可见
                        }
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

            // 数据加载完毕，隐藏骨架屏，显示产品网格
            if (skeletonGridContainer) {
                skeletonGridContainer.classList.add('hidden');
            }
            if (productsGrid) {
                productsGrid.style.display = 'grid'; // 确保网格布局可见
            }
        })
        .catch(error => {
            console.error('获取数据失败:', error);

            // 发生错误时也要隐藏骨架屏
            if (skeletonGridContainer) {
                skeletonGridContainer.classList.add('hidden');
            }
            if (productsGrid) {
                productsGrid.style.display = 'grid'; // 确保网格布局可见
            }
        });

    // 渲染分类侧边栏
    function renderCategories() {
        const categoriesSidebar = document.querySelector('.sidebar-right');
        if (!categoriesSidebar) return;

        const productsContent = document.querySelector('.products-content');

        const categoriesList = document.createElement('ul');
        categoriesList.className = 'categories-list';

        // --- START: 添加 All Products 选项 ---
        const allProductsItem = document.createElement('li');
        allProductsItem.className = 'category-item all-products-item active'; // 默认选中 All Products
        allProductsItem.textContent = 'All Products';
        allProductsItem.addEventListener('click', () => {
            currentCategory = null; // 清除当前分类
            currentSubcategory = null; // 清除当前子分类
            currentPage = 1; // 重置页码
            renderSubcategories(); // 渲染子分类（此时应该为空或提示）
            renderProducts(getPaginatedProducts()); // 渲染所有产品
            updateActiveCategory(allProductsItem); // 更新激活状态

            // 点击 All Products 后隐藏手机端浮动菜单
            if (window.innerWidth <= 768 && isMobileMenuOpen) {
                categoriesList.classList.remove('is-floating');
                showAllButton.classList.remove('active');
                isMobileMenuOpen = false;
                document.removeEventListener('click', closeFloatingMobileMenu);
            }
        });
        categoriesList.appendChild(allProductsItem);
        // --- END: 添加 All Products 选项 ---

        // 从产品数据中提取所有主分类
        const mainCategories = [...new Set(originalProducts
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

                // 点击某个分类项后隐藏手机端浮动菜单
                if (window.innerWidth <= 768 && isMobileMenuOpen) {
                    categoriesList.classList.remove('is-floating');
                    showAllButton.classList.remove('active');
                    isMobileMenuOpen = false;
                    document.removeEventListener('click', closeFloatingMobileMenu);
                }
            });
            categoriesList.appendChild(categoryItem);
        });

        // 添加 "Show All" 按钮
        const showAllButton = document.createElement('button');
        showAllButton.className = 'show-all-btn';
        showAllButton.innerHTML = 'Show All <i class="fas fa-chevron-down"></i>';

        // **核心修改：先添加 categoriesList，再根据条件添加 showAllButton**

        // categoriesList 总是添加到 categoriesSidebar
        categoriesSidebar.appendChild(categoriesList); 

        if (window.innerWidth <= 768 && productsContent) {
            // 手机端：添加到 .products-content 容器
            const productsFilters = productsContent.querySelector('.products-filters');
            if (productsFilters) {
                productsFilters.appendChild(showAllButton);
            } else {
                // 如果没有 products-filters，添加到 products-content 的开头
                productsContent.insertBefore(showAllButton, productsContent.firstChild); 
            }
        } else {
            // **电脑端：在 categoriesList 之后，添加到 .sidebar-right**
            categoriesSidebar.appendChild(showAllButton);
        }

        // 手机菜单打开状态变量 (放在事件监听器之前)
        let isMobileMenuOpen = false;

        // Event listener for the "Show All" button
        showAllButton.addEventListener('click', (event) => {
            event.stopPropagation(); // 阻止事件冒泡

            if (window.innerWidth <= 768) {
                isMobileMenuOpen = !isMobileMenuOpen;

                categoriesList.classList.toggle('is-floating', isMobileMenuOpen);
                showAllButton.classList.toggle('active', isMobileMenuOpen);

                if (isMobileMenuOpen) {
                    document.addEventListener('click', closeFloatingMobileMenu);
                } else {
                    document.removeEventListener('click', closeFloatingMobileMenu);
                }
            } else {
                categoriesList.classList.toggle('expanded');
                showAllButton.classList.toggle('active');
            }
        });

        // 用于关闭浮动菜单（手机端）的函数
        function closeFloatingMobileMenu(event) {
            if (categoriesList && showAllButton && !categoriesList.contains(event.target) && !showAllButton.contains(event.target)) {
                if (isMobileMenuOpen) {
                    categoriesList.classList.remove('is-floating');
                    showAllButton.classList.remove('active');
                    isMobileMenuOpen = false;
                    document.removeEventListener('click', closeFloatingMobileMenu);
                }
            }
        }

        // 如果没有从 URL 获取到分类，则默认选中 All Products
        if (!urlCategory) {
            updateActiveCategory(allProductsItem);
        } else {
            // 如果有 urlCategory，则高亮对应的分类
            const initialCategoryItem = document.querySelector(`.category-item[data-category="${currentCategory}"]`);
            if (initialCategoryItem) {
                updateActiveCategory(initialCategoryItem);
            }
        }
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
        let filteredProducts = [...currentProducts]; // ✅ 修改此处

        // 按分类和子分类过滤
        if (currentCategory) {
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
    async function renderProducts(products) { // 标记为 async
        const productsGrid = document.querySelector('.products-grid');
        if (!productsGrid) return;

        productsGrid.innerHTML = '';

        // 使用 Promise.all 等待所有产品卡片创建完成
        // ✅ 修改：将 allRatings 传递给 createProductCard
        const productCardPromises = products.map((product, index) =>
            createProductCard(product, index) // 传递 allRatings
        );

        const productCards = await Promise.all(productCardPromises); // 等待所有卡片promise完成
        productCards.forEach(card => {
            productsGrid.appendChild(card);
        });

        // 更新分页
        renderPagination(currentProducts.length);

        // 注入 ItemList 结构化数据 (如果您的页面需要)
        injectItemListJsonLD(products);
    }

    async function createProductCard(product, index, allRatings) { // ✅ 添加 allRatings 参数
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

        // ✅ 添加遮罩层
        const overlay = document.createElement('div');
        overlay.className = 'image-overlay';
        productImage.appendChild(overlay);

        // 为图片容器添加点击事件，跳转到产品详情页
        productImage.addEventListener('click', (e) => {
            window.location.href = productLink.href; // 点击图片容器跳转到详情页
        });

        // 计算折扣价，保证是数字类型
        const discountedPrice = parseFloat(product.final_price) || 0; // 使用 final_price 而不是手动计算

        // 创建产品信息容器
        const productInfo = document.createElement('div');
        productInfo.className = 'product-info';
        productInfo.innerHTML = `
            <h2 class="product-name">${product.name}</h2>
            <p class="product-stock">stock items: ${product.stock}</p>
            <p class="product-description">${product.description}</p>
            <div class="product-items-center">
                <p class="product-price">$${discountedPrice.toFixed(2)}</p>
                <p class="product-original-price">
                    $${parseFloat(product.price).toFixed(2)}
                </p>
            </div>
            <button class="btn-primary add-to-cart-btn" data-product-id="${product.id}">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shopping-cart" aria-hidden="true" style="vertical-align: middle; margin-right: 6px;">
                    <circle cx="8" cy="21" r="1"></circle>
                    <circle cx="19" cy="21" r="1"></circle>
                    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
                </svg>
                ADD TO CART
            </button>
        `;

        // 将图片和产品信息容器添加到跳转链接容器中
        productLink.appendChild(productImage);
        productLink.appendChild(productInfo);

        // 为加入购物车按钮添加单独的点击事件
        const addToCartBtn = productInfo.querySelector('.add-to-cart-btn');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                const productId = e.target.getAttribute('data-product-id');
                // 查找 currentProducts 中与 productId 匹配的产品
                const productToAddToCart = currentProducts.find(p => p.id === productId);
                if (productToAddToCart) {
                    cart.addToCart(productToAddToCart);
                }
            });
        }

        // 将跳转链接添加到卡片容器中
        card.appendChild(productLink);

        // ✅ 从 allRatings 对象中查找当前产品的评分数据
        // 如果没有找到（例如，该产品没有评论），则返回默认的 { average: 0, count: 0 }
        // const ratingData = allRatings[product.id] || { average: 0, count: 0 };
        // console.log(`产品 ${product.id} 的评分数据 (从批量结果中获取):`, ratingData);


        // ✅ 注入产品级结构化数据，并传入评分数据
        injectProductJsonLD(product, { average: 0, count: 0 }); // 传递默认的评分数据
        // injectProductJsonLD(product, ratingData);

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
    function injectProductJsonLD(product, ratingData = { average: 0, count: 0 }) { // 添加 ratingData 参数
        const script = document.createElement('script');
        script.type = 'application/ld+json';

        const productSchema = {
            "@context": "https://schema.org",
            "@type": "Product",
            "name": product.name,
            "image": product.image_url,
            // 确保 product.description 存在，否则提供空字符串或默认描述
            "description": product.description || `Explore ${product.name} at SummitGearHub.`,
            "sku": product.id,
            "brand": {
                "@type": "Brand",
                "name": "summitgearhub"
            },
            "offers": {
                "@type": "Offer",
                "url": `${window.location.origin}/products/product-detail.html?id=${product.id}-${product.name.replace(/\s+/g, '-').toLowerCase()}`,
                "priceCurrency": "USD",
                // 确保 final_price 存在，否则使用 price
                "price": parseFloat(product.final_price || product.price).toFixed(2),
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
                    },
                    "deliveryTime": {
                        "@type": "DeliveryTime",
                        "hasDeliveryMethod": "https://schema.org/ShippingDelivery",
                        "transitTime": {
                            "@type": "QuantitativeValue",
                            "minValue": 5,
                            "maxValue": 7,
                            "unitCode": "day"
                        },
                        "businessDays": {
                            "@type": "OpeningHoursSpecification",
                            "dayOfWeek": [
                                "https://schema.org/Monday",
                                "https://schema.org/Tuesday",
                                "https://schema.org/Wednesday",
                                "https://schema.org/Thursday",
                                "https://schema.org/Friday"
                            ]
                        }
                    }
                }
            },
            "hasMerchantReturnPolicy": {
                "@type": "MerchantReturnPolicy",
                "merchantReturnDays": 30,
                "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
                "returnMethod": "https://schema.org/ReturnByMail",
                "returnShippingFees": "https://schema.org/ReturnFeesCustomerResponsibility",
                "restockingFee": {
                    "@type": "MonetaryAmount",
                    "value": 0.00,
                    "currency": "USD"
                },
                "url": `https://summitgearhub.com/products/support`
            }
        };

        // ✅ 只有有真实评论时才添加 aggregateRating
        if (ratingData.count > 0 && ratingData.average > 0) {
            productSchema.aggregateRating = {
            "@type": "AggregateRating",
            "ratingValue": ratingData.average.toFixed(1),
            "reviewCount": String(ratingData.count)
            };
        }

        script.textContent = JSON.stringify(productSchema, null, 2);
        document.head.appendChild(script);
    }


    // 封装视图切换方法
    function setupViewToggle(
        gridSelector = '.products-grid',
        btnSelector = '.view-btn',
        mobileMaxWidth = 768
    ) {
        const viewBtns = document.querySelectorAll(btnSelector);
        const productsGrid = document.querySelector(gridSelector);
        if (!productsGrid || viewBtns.length === 0) return;

        // 初始状态：移动端默认两列网格
        productsGrid.classList.remove('list-view');
        productsGrid.classList.add('grid-view');
        viewBtns.forEach(b => b.classList.remove('active'));
        const defaultBtn = document.querySelector(`${btnSelector}[data-view="grid"]`);
        if (defaultBtn) defaultBtn.classList.add('active');

        viewBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                if (window.innerWidth <= mobileMaxWidth) {
                    const view = btn.dataset.view;
                    productsGrid.classList.toggle('list-view', view === 'list');
                    productsGrid.classList.toggle('grid-view', view === 'grid');
                }
                // 切换按钮 active 样式
                viewBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > mobileMaxWidth) {
                // 桌面端重置，保持默认布局
                productsGrid.classList.remove('list-view', 'grid-view');
                viewBtns.forEach(b => b.classList.remove('active'));
            }
        });
    }

    // 搜索功能
    function initSearch() {
        const searchOverlay = document.getElementById('search-overlay');
        const searchInput = document.getElementById('search-input');
        const closeSearch = document.getElementById('close-search');
        const headerSearch = document.getElementById('header-search');
        const heroOverlay = document.querySelector('.hero-overlay');

        // 打开搜索框
        if (headerSearch && searchOverlay && searchInput) {
            // 打开搜索框
            headerSearch.addEventListener('click', (e) => {
                e.preventDefault();
                searchOverlay.style.display = 'flex';
                searchInput.focus();

                // ✅ 隐藏 hero-overlay
                if (heroOverlay) {
                    heroOverlay.style.display = 'none';
                }
            });
        }

        // 关闭搜索框
        if (closeSearch) {
            closeSearch.addEventListener('click', () => {
                searchOverlay.style.display = 'none';

                if (heroOverlay) {
                    heroOverlay.style.display = 'block';
                }
            });
        }

        // 点击遮罩层关闭搜索框
        if(searchOverlay){
            searchOverlay.addEventListener('click', (e) => {
                if (e.target === searchOverlay) {
                    searchOverlay.style.display = 'none';
                }
            });
        }

        // 处理搜索
        if(searchInput){
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const searchQuery = searchInput.value.trim();
                    if (searchQuery) {
                        window.location.href = `../products/search.html?q=${encodeURIComponent(searchQuery)}`;
                    }
                }
            });
        }

    }

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

});