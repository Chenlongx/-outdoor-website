// 全局变量
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');
const navActions = document.querySelector('.nav-actions');



// 移动菜单切换
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


// 粘性标题
function initStickyHeader() {
    const header = document.querySelector('header');
    const announcement = document.querySelector('.announcement-bar');
    if (!header || !announcement) return;

    let lastScrollY = window.scrollY;
    let ticking = false;
    let announcementHeight = announcement.offsetHeight;
    const threshold = announcementHeight + 5;

    // 使用防抖函数优化resize事件
    const updateHeight = debounce(() => {
        announcementHeight = announcement.offsetHeight;
    }, 100);

    window.addEventListener('resize', updateHeight);

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                handleScroll();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    function handleScroll() {
        const currentScrollY = window.scrollY;
        const scrollDirection = currentScrollY > lastScrollY ? 'down' : 'up';

        // 避免边界值频繁切换
        if (currentScrollY >= threshold) {
            if (!header.classList.contains('sticky')) {
                header.classList.add('sticky');
                announcement.style.transform = 'translateY(-100%)';
            }
        } else {
            if (header.classList.contains('sticky')) {
                header.classList.remove('sticky');
                announcement.style.transform = 'translateY(0)';
            }
        }

        // 记录最后滚动位置
        lastScrollY = currentScrollY;
    }
}

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}


// 添加商品到购物车
function addToCart(product) {
    if (typeof CartManager !== 'undefined' && CartManager.addToCart) {
        CartManager.addToCart(product);
        showNotification(`${product.name} Added to cart`);
    } else {
        // fallback：本地缓存购物车
        const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
        cartItems.push(product);
        localStorage.setItem('cart', JSON.stringify(cartItems));
        showNotification(`${product.name} Added to cart (local cache)`);
    }
}

// 初始化产品卡
function initProductCards() {
    const addToCartButtons = document.querySelectorAll('.add-to-cart');

    addToCartButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation(); // 阻止冒泡，避免跳转

            const productCard = this.closest('.product-card');
            const productName = productCard.querySelector('h3').textContent;
            const productImage = productCard.querySelector('img').src;
            const productPrice = productCard.querySelector('.current-price').textContent.replace('$', '');

            const product = {
                id: Date.now().toString(),
                name: productName,
                image_url: productImage,
                price: parseFloat(productPrice),
                quantity: 1
            };

            addToCart(product); // ✅ 替换未定义的函数
            this.textContent = 'ADDED!';
            this.style.backgroundColor = '#4c956c';

            setTimeout(() => {
                this.textContent = 'ADD TO CART';
                this.style.backgroundColor = '';
            }, 2000);
        });
    });
}

// 通知系统
function showNotification(message) {
    // Check if notification container exists
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

// 播放视频功能
function initVideoPlayers() {
    const playButtons = document.querySelectorAll('.play-button');

    playButtons.forEach(button => {
        button.addEventListener('click', function() {
            const videoContainer = this.closest('.solution-video, .story-video');
            const img = videoContainer.querySelector('img');

            // Create a modal for video playback
            const modal = document.createElement('div');
            modal.classList.add('video-modal');

            // Create modal content
            const modalContent = document.createElement('div');
            modalContent.classList.add('video-modal-content');

            // Create close button
            const closeBtn = document.createElement('div');
            closeBtn.classList.add('video-modal-close');
            closeBtn.innerHTML = '<i class="fas fa-times"></i>';

            // Create mock video (for demo purposes)
            const videoElement = document.createElement('div');
            videoElement.classList.add('mock-video');
            videoElement.innerHTML = `
                <i class="fas fa-play-circle"></i>
                <p>Video Player Placeholder</p>
                <p class="video-title">${img.alt}</p>
            `;

            // Append elements
            modalContent.appendChild(closeBtn);
            modalContent.appendChild(videoElement);
            modal.appendChild(modalContent);
            document.body.appendChild(modal);

            // Add styles
            modal.style.position = 'fixed';
            modal.style.top = '0';
            modal.style.left = '0';
            modal.style.width = '100%';
            modal.style.height = '100%';
            modal.style.backgroundColor = 'rgba(0,0,0,0.9)';
            modal.style.display = 'flex';
            modal.style.justifyContent = 'center';
            modal.style.alignItems = 'center';
            modal.style.zIndex = '3000';

            modalContent.style.position = 'relative';
            modalContent.style.width = '80%';
            modalContent.style.maxWidth = '800px';
            modalContent.style.backgroundColor = '#222';
            modalContent.style.borderRadius = '8px';
            modalContent.style.overflow = 'hidden';

            closeBtn.style.position = 'absolute';
            closeBtn.style.top = '10px';
            closeBtn.style.right = '10px';
            closeBtn.style.color = 'white';
            closeBtn.style.fontSize = '1.5rem';
            closeBtn.style.cursor = 'pointer';
            closeBtn.style.zIndex = '10';

            videoElement.style.height = '450px';
            videoElement.style.display = 'flex';
            videoElement.style.flexDirection = 'column';
            videoElement.style.justifyContent = 'center';
            videoElement.style.alignItems = 'center';
            videoElement.style.color = 'white';
            videoElement.style.textAlign = 'center';

            videoElement.querySelector('i').style.fontSize = '4rem';
            videoElement.querySelector('i').style.marginBottom = '1rem';
            videoElement.querySelector('p').style.fontSize = '1.2rem';
            videoElement.querySelector('.video-title').style.marginTop = '1rem';
            videoElement.querySelector('.video-title').style.fontWeight = 'bold';

            // Close button functionality
            closeBtn.addEventListener('click', () => {
                modal.remove();
            });

            // Also close when clicking outside the content
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                }
            });
        });
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
                    window.location.href = `./products/search.html?q=${encodeURIComponent(searchQuery)}`;
                }
            }
        });
    }

}

// 获取购物车数据
function getCart() {
    const cart = localStorage.getItem('cart');
    try {
        const parsedCart = cart ? JSON.parse(cart) : [];
        
        return parsedCart;
        // return cart ? JSON.parse(cart) : [];
    } catch (e) {
        console.error('Error parsing cart data:', e);
        return [];
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


// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    // 更新购物车数量
    updateCartCount()
    // JavaScript 加载高清图
    const isMobile = window.innerWidth <= 768; // 或用 640, 480，自行调整
    if (isMobile) {
        const hero = document.getElementById('hero');
        const img = new Image();
        img.src = './img/hero-mobile-background.webp';
    
        img.onload = () => {
          hero.classList.add('loaded');
        };
    } else {
        // 桌面端直接使用高清图，不加载 JS
        // document.getElementById('hero').classList.add('loaded');
        const hero = document.getElementById('hero');
        if (hero) {
            hero.classList.add('loaded'); // 将触发 CSS 中设置高清图
        }
    }

    // 初始化购物车（不会重复定义）
    if (typeof CartManager !== 'undefined' && CartManager.init) {
        CartManager.init();
    }
    // 畅销商品优惠数据展示(产品折扣价)
    function renderProducts(products) {
        const productsGrid = document.getElementById('dynamic-products');
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
                window.location.href = `./products/product-detail.html?id=${productUUID}-${productNameForUrl}`;
            });
    
            // 加入购物车按钮单独处理
            const addToCartBtn = productCard.querySelector('.add-to-cart');
            if (addToCartBtn) {
                addToCartBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    console.log("将产品加入到购物车前的数据：", product)
                    addToCart(product);
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
    // 从Netlify函数获取数据
    fetch('/.netlify/functions/fetch-products')
    .then(response => response.json())
    .then(data => {
        console.log(data)
    // 只取前4个商品作为推荐
    const bestSellers = data.slice(0, 4);
    if(bestSellers){
        renderProducts(bestSellers);
    }
    
    // 保持原有动画效果
    setTimeout(() => {
        document.querySelectorAll('.product-card').forEach((card, index) => {
        card.style.opacity = 1;
        card.style.transform = 'translateY(0)';
        card.style.transitionDelay = `${index * 100}ms`;
        });
    }, 100);
    })
    .catch(error => {
    console.error('Error loading products:', error);
    document.getElementById('dynamic-products').innerHTML = `
        <div class="error">Currently unavailable products</div>
    `;
    });


    const searchTrigger = document.getElementById('header-search');
    const searchOverlay = document.querySelector('.search-overlay');
    const closeButton = document.getElementById('close-search');
    // loadProducts();
    startCountdown();
    initStickyHeader();
    // initProductCards();
    initVideoPlayers();
    
    // 初始化购物车
    if (typeof CartManager !== 'undefined' && CartManager.init) {
        CartManager.init();
    }


    // 初始化导航的平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            if (this.getAttribute('href') !== '#') {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    window.scrollTo({
                        top: target.offsetTop - 100,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // 滚动到视图时为元素添加动画
    const animateOnScroll = () => {
        const elements = document.querySelectorAll(
            '.category-item, .product-card, .release-item, .featured-item, .story-card'
        );

        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;

            if (elementPosition < windowHeight - 100) {
                element.classList.add('animated');
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    };

    // 设置动画元素的初始样式
    document.querySelectorAll('.category-item, .product-card, .release-item, .featured-item, .story-card').forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });

    // 滚动时运行动画
    window.addEventListener('scroll', animateOnScroll);

    // 页面加载时运行一次
    animateOnScroll();


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

    initSearch();
});
