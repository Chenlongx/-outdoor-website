



document.addEventListener('DOMContentLoaded', function() {
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
                // 确保产品图片路径正确保存
                const productToAdd = {
                    ...product,
                    image: product.image_url, // 确保使用image_url作为image属性
                    quantity: 1 // 新增产品，默认数量为 1
                };
                
                console.log('添加到购物车的产品:', productToAdd);
                items.push(productToAdd);
            }
            
            this.saveCartItems(items);
            this.updateCartCount();
            this.showNotification(`${product.name} 已添加到购物车`);
        },
        updateCartCount() {
            const items = this.getCartItems();
            const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
            const cartCount = document.querySelector('.cart-count');
            if (cartCount) {
                cartCount.textContent = totalItems;
            }
        },
        showNotification(message) {
            const notification = document.createElement('div');
            notification.className = 'notification';
            notification.textContent = message;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.classList.add('show');
            }, 100);
            
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }, 3000);
        }
    };


    // 从 Netlify 函数获取数据
    fetch('/.netlify/functions/fetch-products')
        .then(response => response.json())
        .then(data => {
            originalProducts = data; // <== 保存原始完整数据
            currentProducts = data;
            console.log('获取到的产品数据:', data);
            renderCategories();

            // 如果 URL 携带了 category 参数，则设置当前分类
            // if (urlCategory) {
            //     currentCategory = decodeURIComponent(urlCategory);
            //     currentSubcategory = urlSubcategory ? decodeURIComponent(urlSubcategory) : null;

            //     console.log(currentCategory)
        
            //     renderSubcategories();
            //     renderProducts(getPaginatedProducts());
            //     highlightCategoryInSidebar();
            // } else {
            //     renderProducts(getPaginatedProducts());
            // }

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
                }
              
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
        sortSelect.addEventListener('change', function() {
            currentSort = this.value;
            currentPage = 1; // 重置页码
            renderProducts(getPaginatedProducts());
            renderPagination(currentProducts.length);
        });
    }

    // 排序函数
    function sortProducts(products, sortType) {
        const sortedProducts = [...products];
        switch(sortType) {
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
    }

    // 创建产品卡片
    function createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        
        card.innerHTML = `
            <div class="product-image">
                <img src="${product.image_url}" alt="${product.name}" loading="lazy">
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-type">${product.producttype}</p>
                <p class="product-price">$${product.price}</p>
                <p class="product-stock">stock items: ${product.stock}</p>
                <p class="product-description">${product.description}</p>
                <button class="add-to-cart-btn" data-product-id="${product.id}">
                    add to the cart
                </button>
            </div>
        `;

        // 添加点击事件，跳转到产品详情页
        card.addEventListener('click', (e) => {
            // 如果点击的是加入购物车按钮，不进行跳转
            if (e.target.classList.contains('add-to-cart-btn')) {
                return;
            }
            // 将产品信息存储到 localStorage
            localStorage.setItem('currentProduct', JSON.stringify(product));
            // 跳转到产品详情页
            window.location.href = './product-detail.html';
        });

        // 为加入购物车按钮添加单独的点击事件
        const addToCartBtn = card.querySelector('.add-to-cart-btn');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // 阻止事件冒泡
                const productId = e.target.getAttribute('data-product-id');
                addToCart(productId);
            });
        }

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

});