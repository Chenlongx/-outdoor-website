

document.addEventListener('DOMContentLoaded', function () {
    // 页面加载时，立即显示一个默认的0星和0评论占位符
    updateMainProductRating({ average: 0, count: 0 });

    startCountdown()

    // // 从 URL 获取产品 ID
    const urlParams = new URLSearchParams(window.location.search);
    const productParam = urlParams.get('id'); // 获取 URL 中的 id 参数
    if (!productParam) {
        // 如果没有产品ID，重定向回产品列表页
        window.location.href = './products.html';
        return;
    }

    // 使用正则表达式提取完整 UUID 和产品名称
    const regex = /^([a-f0-9]{8}-([a-f0-9]{4}-){3}[a-f0-9]{12})-(.*)$/i;
    const match = productParam.match(regex);

    if (!match) {
        // 如果没有匹配到正确的格式，重定向回产品列表页
        window.location.href = './products.html';
        return;
    }

    const productId = match[1]; // 完整的 UUID
    const productNameForUrl = match[3]; // 产品名称部分（去掉 UUID 后的部分）
    console.log(productNameForUrl)

    // 将产品名称部分拼接到class="container"容器中
    const breadcrumbContainer = document.querySelector('.container ul');
    if (breadcrumbContainer) {
        const productBreadcrumb = document.createElement('li');
        productBreadcrumb.textContent = `${productNameForUrl}`;
        // 给元素添加 CSS 类
        productBreadcrumb.classList.add('breadcrumb-item');
        breadcrumbContainer.appendChild(productBreadcrumb);
    }

    const BrowseCountEl = document.getElementById('BrowseCount');

    function updateBrowseCount() {
        const randomCount = Math.floor(Math.random() * 5) + 1;
        if (BrowseCountEl) {
            BrowseCountEl.textContent = randomCount;
        }
    }

    updateBrowseCount();
    setInterval(updateBrowseCount, 10000);

    // 监听本地存储的变化
    window.addEventListener('storage', (e) => {
        if (e.key === 'cart') {
            updateCartCount();  // 更新购物车数量
        }
    });

    // 定位需要操作的元素
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const navActions = document.querySelector('.nav-actions');

    // 移动菜单栏事件监听
    mobileMenuBtn.addEventListener('click', () => {
        let mobileMenu = document.querySelector('.mobile-menu');

        // 如果菜单不存在，则创建它
        if (!mobileMenu) {
            mobileMenu = document.createElement('div');
            mobileMenu.classList.add('mobile-menu');

            // 创建关闭按钮
            const closeBtn = document.createElement('div');
            closeBtn.classList.add('close-btn');
            closeBtn.innerHTML = '<i class="fas fa-times"></i>';
            closeBtn.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                document.body.style.overflow = 'auto';
            });

            // 克隆导航链接和操作按钮
            const navLinksClone = navLinks.cloneNode(true);
            const actionsContainer = document.createElement('div');
            actionsContainer.classList.add('mobile-actions');
            const navActionsClone = navActions.cloneNode(true);
            actionsContainer.appendChild(navActionsClone);

            // 将克隆的元素和关闭按钮添加到移动菜单中
            mobileMenu.appendChild(closeBtn);
            mobileMenu.appendChild(navLinksClone);
            mobileMenu.appendChild(actionsContainer);

            // 将完整的菜单添加到 body 中
            document.body.appendChild(mobileMenu);
        }

        // 切换 .active 类来显示或隐藏菜单
        // setTimeout 确保浏览器有时间渲染菜单，然后再触发过渡动画
        setTimeout(() => {
            mobileMenu.classList.toggle('active');
        }, 10);

        // 根据菜单的激活状态，防止背景滚动
        if (mobileMenu.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    });



    // 通过 API 获取产品信息
    fetch(`/.netlify/functions/fetch-product-by-id?id=${productId}`)
        .then(response => response.json())
        .then(product => {

            loadReviews(productId, 1, 5, 'mostRecent');

            // 更新页面标题
            document.title = `${product.name} | WildGear`;

            // console.log("获取到的数据: " + JSON.stringify(product, null, 2));
            // console.log(parseFloat(product.final_price).toFixed(2))
            // 更新产品信息
            const productImage = document.querySelector('.main-image img');
            const productName = document.querySelector('.product-name');
            const productTitle = document.querySelector('.product-header h1');
            const productType = document.querySelector('.product-type');
            const productPrice = document.querySelector('.current-price');
            const originalPrice = document.querySelector('.original-price');
            const discountBadge = document.querySelector('.discount-badge');
            const stockStatusElement = document.getElementById('stock-status');
            const productDescription = document.querySelector('.product-description');


            // 展示型号选择
            const productVariants = document.querySelector('.product-variants');

            if (productImage) productImage.src = product.image_url;
            if (productName) productName.textContent = product.name;
            if (productTitle) productTitle.textContent = product.name;
            if (productType) productType.textContent = product.producttype;
            const finalPrice = parseFloat(product.final_price);
            if (productPrice && !isNaN(finalPrice)) {
                productPrice.textContent = `$${finalPrice.toFixed(2)}`; // 使用 final_price 显示折扣价
            } else {
                productPrice.textContent = `$${product.price}`; // 如果 final_price 无效，显示原价
            }
            if (originalPrice) originalPrice.textContent = parseFloat(product.price).toFixed(2);
            if (discountBadge) discountBadge.textContent = `Limited Time ${product.discount_percent}% OFF`;
            // if (productStock) productStock.textContent = `库存: ${product.stock}`;

            const productQuantityInput = document.getElementById('quantity');
            const addToCartButton = document.getElementById('add-to-cart');
            const addToCartText = document.getElementById('add-to-cart-text');
            const stock = product.stock; // 假设 product.stock 是从后端获取到的库存数量
            if (stock <= 0) {
                stockStatusElement.textContent = 'Sorry, this item is out of stock!';
                stockStatusElement.classList.add('out-of-stock');
                // 售罄时禁用加入购物车按钮和数量选择
                addToCartButton.disabled = true;
                if (addToCartText) addToCartText.textContent = 'Out of Stock';
                productQuantityInput.disabled = true;
                productQuantityInput.value = 0;
            } else if (stock > 0 && stock <= 10) { // 假设库存小于等于10件为低库存
                stockStatusElement.textContent = `Only ${stock} left in stock! Grab yours before it's gone!`;
                stockStatusElement.classList.add('low-stock');
                addToCartButton.disabled = false;
                if (addToCartText) addToCartText.textContent = 'ADD TO CART';
                productQuantityInput.disabled = false;
                // 确保用户不能选择超过库存的数量
                productQuantityInput.max = stock;
                if (parseInt(productQuantityInput.value) > stock) {
                    productQuantityInput.value = stock; // 如果已选数量大于库存，则设置为库存量
                }
            } else {
                stockStatusElement.textContent = `In stock: ${stock} units available.`;
                stockStatusElement.classList.remove('low-stock', 'out-of-stock'); // 移除低库存和售罄样式
                addToCartButton.disabled = false;
                if (addToCartText) addToCartText.textContent = 'ADD TO CART';
                productQuantityInput.disabled = false;
                productQuantityInput.max = null; // 移除最大数量限制
            }

            // if (productDescription) productDescription.textContent = product.description;
            if (productDescription && product.description) {
                productDescription.innerHTML = product.description.replace(/\n/g, '<br>');
            }

            if (productVariants && Array.isArray(product.variant_options) && product.variant_options.length > 0) {
                // console.log("获取到的型号选项:", product.variant_options);
                // 清空原有内容（避免重复插入）
                productVariants.innerHTML = '';
                product.variant_options.forEach(variant => {
                    // 创建变体组容器
                    const group = document.createElement('div');
                    group.className = 'variant-group';

                    // 创建 label
                    const label = document.createElement('label');
                    label.textContent = `${variant.label.charAt(0).toUpperCase() + variant.label.slice(1)}: `;
                    label.setAttribute('for', `${variant.label}-select`);

                    // 创建 select
                    const select = document.createElement('select');
                    select.id = `${variant.label}-select`;
                    select.name = variant.label;
                    select.style.width = '150px'; // 设置宽度为 150px

                    // 填充选项
                    variant.options.forEach(option => {
                        const opt = document.createElement('option');
                        opt.value = option;
                        opt.textContent = option;
                        select.appendChild(opt);
                    });

                    // 添加到 group
                    group.appendChild(label);
                    group.appendChild(select);

                    // 添加到页面容器
                    productVariants.appendChild(group);

                })
            }

            // 设置加入购物车按钮的事件监听器
            const addToCartBtn = document.querySelector('.add-to-cart-btn');
            if (addToCartBtn) {
                product.id = productId; // 设置 id，用于购物车追踪
                addToCartBtn.addEventListener('click', (e) => {
                    e.stopPropagation();

                    // 存储当前点击的产品信息到 localStorage
                    // localStorage.setItem('currentProduct', JSON.stringify(product));
                    console.log("储存前的数据：", product)
                    addToCart(product);
                    showNotification(`${product.name} Added to cart`);
                    updateCartCount()
                });
            }

            if (product.details && product.details.length > 0) {
                const details = product.details;

                const descriptionHeader = document.querySelector('.tab-pane.active .product-description-header');
                const productFeaturesContainer = document.querySelector('.tab-pane.active .product-features');

                if (descriptionHeader) descriptionHeader.innerHTML = '';
                if (productFeaturesContainer) productFeaturesContainer.innerHTML = '';

                let featureIndex = 0; // 用来控制 feature-highlight 和 reverse

                details.forEach(detail => {
                    if (detail.type === 'heading') {
                        const h2 = document.createElement('h2');
                        h2.textContent = detail.text;
                        descriptionHeader.appendChild(h2);
                    } else if (detail.type === 'paragraph') {
                        const p = document.createElement('p');
                        p.className = 'description-paragraph';
                        p.innerHTML = detail.text.replace(/\n/g, '<br>'); // 支持换行
                        descriptionHeader.appendChild(p);
                    } else if (detail.type === 'image') {
                        const featureDiv = document.createElement('div');
                        featureDiv.className = featureIndex % 2 === 0 ? 'feature-highlight' : 'feature-highlight reverse';

                        featureDiv.innerHTML = `
                            <div class="highlight-image">
                                <img src="${detail.url}" alt="${detail.alt || 'Feature Image'}">
                            </div>
                            <div class="highlight-content">
                                <!-- 图片部分没有特定 title/description，这里可以补充 -->
                            </div>
                        `;

                        productFeaturesContainer.appendChild(featureDiv);
                        featureIndex++;
                    }
                });
            }

            if (product.video_url) {
                const videoId = getYouTubeVideoId(product.video_url);
                if (videoId) {
                    const videoPreview = document.getElementById('videoPreview');
                    const youtubeIframe = document.getElementById('youtubeVideo'); // Corrected ID
                    const videoLoadingSpinner = document.getElementById('videoLoadingSpinner'); // 获取加载指示器元素

                    if (videoPreview && youtubeIframe) {
                        // 设置视频预览的缩略图
                        const videoThumbnailImg = videoPreview.querySelector('img');
                        if (videoThumbnailImg) {
                            videoThumbnailImg.src = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`; // Use maxresdefault for best quality
                            videoThumbnailImg.alt = `Product Video Thumbnail for ${product.name}`;
                        }

                        // 在预览中添加点击监听器来播放视频
                        videoPreview.addEventListener('click', () => {
                            videoPreview.style.display = 'none'; // 隐藏预览
                            videoLoadingSpinner.style.display = 'flex'; // 显示加载指示器

                            // 设置 iframe src，一旦设置，iframe就会开始加载视频
                            youtubeIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;

                            // 监听 iframe 的加载完成事件
                            // 'load' 事件在 iframe 的内容完全加载后触发
                            youtubeIframe.onload = () => {
                                videoLoadingSpinner.style.display = 'none'; // 隐藏加载指示器
                                youtubeIframe.style.display = 'block'; // 显示 iframe
                                youtubeIframe.onload = null; // 移除事件监听器，防止重复触发
                            };
                        });

                        // 确保 iframe 最初是隐藏的并且显示预览
                        youtubeIframe.style.display = 'none';
                        videoPreview.style.display = 'block';

                    } else {
                        console.warn("HTML 中未找到 ID 为“videoPreview”或“youtubeVideo”的元素。");
                    }
                } else {
                    console.warn("无法从提供的 URL 中提取 YouTube 视频 ID：", product.video_url);
                }
            } else {
                // 如果 product.video_url 是 null，隐藏视频标签和视频内容区域
                const videoTab = document.querySelector('.tab[data-tab="video"]');
                const videoTabPane = document.getElementById('video'); // 这个ID对应 <div class="tab-pane" id="video">

                if (videoTab) {
                    videoTab.style.display = 'none'; // 隐藏视频标签
                }
                if (videoTabPane) {
                    videoTabPane.style.display = 'none'; // 隐藏视频内容区域
                }

            }

            // 渲染产品详细信息：规格，包含内容等
            renderProductDetails(product);

            // 渲染产品将信息插入 <script type="application/ld+json"> 标签
            injectItemListJsonLD([product]);

            // 渲染推荐产品区域
            renderRecommendedProducts();

            updateCartCount()

            // 生成主图滑动区
            const mainImageTrack = document.querySelector('.image-track');
            const imageTrackPrevBtn = document.getElementById('imageTrackPrev');
            const imageTrackNextBtn = document.getElementById('imageTrackNext');
            if (mainImageTrack && Array.isArray(product.product_details_url)) {
                mainImageTrack.innerHTML = ''; // 清空

                product.product_details_url.forEach((url, index) => {
                    const img = document.createElement('img');
                    img.src = url;
                    img.alt = `Product Main Image ${index + 1}`;
                    mainImageTrack.appendChild(img);
                });
            }
            // 图片轨道滑动功能
            if (imageTrackPrevBtn && imageTrackNextBtn && mainImageTrack) {
                // 判断当前屏幕宽度是否大于等于 992px
                // 这里的 992px 应该与CSS媒体查询中的 min-width 保持一致
                if (window.innerWidth >= 992) {
                    // 点击“下一个”按钮时
                    imageTrackNextBtn.addEventListener('click', () => {
                        const currentScrollLeft = mainImageTrack.scrollLeft; // 获取当前滚动位置
                        const imageWidth = mainImageTrack.offsetWidth; // 获取 image-track 的可视宽度，即单张图片的宽度
                        mainImageTrack.scrollTo({
                            left: currentScrollLeft + imageWidth, // 向右滚动一个图片宽度
                            behavior: 'smooth' // 平滑滚动
                        });
                    });

                    // 点击“上一个”按钮时
                    imageTrackPrevBtn.addEventListener('click', () => {
                        const currentScrollLeft = mainImageTrack.scrollLeft; // 获取当前滚动位置
                        const imageWidth = mainImageTrack.offsetWidth; // 获取 image-track 的可视宽度，即单张图片的宽度
                        mainImageTrack.scrollTo({
                            left: currentScrollLeft - imageWidth, // 向左滚动一个图片宽度
                            behavior: 'smooth' // 平滑滚动
                        });
                    });
                }
            }

            // 动态生成缩略图
            const thumbnailsContainer = document.querySelector('.thumbnail-images');
            if (thumbnailsContainer && Array.isArray(product.product_details_url)) {
                thumbnailsContainer.innerHTML = ''; // 清空

                product.product_details_url.forEach((url, index) => {
                    const thumbnailDiv = document.createElement('div');
                    thumbnailDiv.classList.add('thumbnail');
                    if (index === 0) {
                        thumbnailDiv.classList.add('active'); // 默认第一个
                    }
                    thumbnailDiv.setAttribute('data-image', url);

                    const img = document.createElement('img');
                    img.src = url;
                    img.alt = `Product Thumbnail ${index + 1}`;

                    thumbnailDiv.appendChild(img);
                    thumbnailsContainer.appendChild(thumbnailDiv);
                });
            }

            const setThumbnailClickEvent = () => {
                const thumbnails = document.querySelectorAll('.thumbnail');
                const mainImages = document.querySelectorAll('.image-track img');

                thumbnails.forEach((thumbnail, index) => {
                    // 移除旧的事件监听器（可选，防止重复绑定）
                    thumbnail.removeEventListener('pointerdown', handleThumbnailClick);
                    thumbnail.addEventListener('pointerdown', handleThumbnailClick);

                    function handleThumbnailClick() {
                        // 移除所有缩略图的 'active' 类
                        thumbnails.forEach(t => t.classList.remove('active'));
                        // 为当前缩略图添加 'active' 类
                        this.classList.add('active');

                        // 确保滚动到对应的主图
                        if (mainImages[index]) {
                            const targetImage = mainImages[index];
                            // 使用 scrollIntoView 确保滚动
                            // targetImage.scrollIntoView({ behavior: 'smooth', inline: 'center' });

                            // 可选：强制触发滚动（如果 scrollIntoView 不生效）
                            const container = targetImage.closest('.image-track');
                            if (container) {
                                const offset = targetImage.offsetLeft - (container.offsetWidth / 2) + (targetImage.offsetWidth / 2);
                                container.scrollTo({ left: offset, behavior: 'smooth' });
                            }
                        }
                    }
                });
            };

            // ✅ 添加鼠标拖动滑动功能（适配 desktop）
            const enableThumbnailDragging = () => {
                const container = document.querySelector('.thumbnail-images');
                if (!container) return;

                let isDown = false;
                let startX;
                let scrollLeft;

                container.addEventListener('mousedown', (e) => {
                    isDown = true;
                    container.classList.add('dragging');
                    startX = e.pageX - container.offsetLeft;
                    scrollLeft = container.scrollLeft;
                });

                document.addEventListener('mouseup', () => {
                    if (isDown) {
                        isDown = false;
                        container.classList.remove('dragging');
                    }
                });

                document.addEventListener('mousemove', (e) => {
                    if (!isDown) return;
                    e.preventDefault();
                    const x = e.pageX - container.offsetLeft;
                    const walk = (x - startX) * 1.5;
                    container.scrollLeft = scrollLeft - walk;
                });

                // 防止拖动时选中文本
                container.addEventListener('dragstart', (e) => e.preventDefault());
            };

            // 调用函数
            setThumbnailClickEvent();
            enableThumbnailDragging();

            // 数量选择器
            const quantityInput = document.getElementById('quantity');
            const decreaseBtn = document.getElementById('decrease-quantity');
            const increaseBtn = document.getElementById('increase-quantity');

            if (decreaseBtn && increaseBtn && quantityInput) {
                decreaseBtn.addEventListener('click', function () {
                    let currentValue = parseInt(quantityInput.value);
                    if (currentValue > 1) {
                        quantityInput.value = currentValue - 1;
                    }
                });

                increaseBtn.addEventListener('click', function () {
                    let currentValue = parseInt(quantityInput.value);
                    if (currentValue < 10) {
                        quantityInput.value = currentValue + 1;
                    }
                });

                // 确保输入有效
                quantityInput.addEventListener('change', function () {
                    let value = parseInt(this.value);
                    if (isNaN(value) || value < 1) {
                        this.value = 1;
                    } else if (value > 10) {
                        this.value = 10;
                    }
                });
            }


            // 愿望清单按钮切换
            const wishlistBtn = document.querySelector('.wishlist-btn');

            if (wishlistBtn) {
                wishlistBtn.addEventListener('click', function () {
                    const icon = this.querySelector('i');

                    if (icon.classList.contains('far')) {
                        icon.classList.remove('far');
                        icon.classList.add('fas');
                        this.style.backgroundColor = '#ffeeee';
                        this.style.color = '#e63946';
                        this.style.borderColor = '#ffcccc';
                        showNotification('Added to wishlist');
                    } else {
                        icon.classList.remove('fas');
                        icon.classList.add('far');
                        this.style.backgroundColor = '';
                        this.style.color = '';
                        this.style.borderColor = '';
                        showNotification('Removed from wishlist');
                    }
                });
            }



            // 产品详情标签
            const tabs = document.querySelectorAll('.tab');
            const tabPanes = document.querySelectorAll('.tab-pane');
            // 获取评论筛选下拉菜单
            const reviewFilterDropdown = document.querySelector('.filter-dropdown');

            tabs.forEach(tab => {
                tab.addEventListener('click', function () {
                    const targetTab = this.getAttribute('data-tab');

                    tabs.forEach(t => t.classList.remove('active'));
                    tabPanes.forEach(pane => pane.classList.remove('active'));

                    this.classList.add('active');
                    document.getElementById(targetTab).classList.add('active');

                    // --- NEW: Video Tab Specific Logic ---
                    // 获取视频元素，确保它们存在
                    const youtubeVideo = document.getElementById('youtubeVideo');
                    const videoPreview = document.getElementById('videoPreview');

                    if (targetTab !== 'video') {
                        // 并且视频正在播放（即iframe是可见的）
                        if (youtubeVideo && youtubeVideo.style.display === 'block') {
                            youtubeVideo.src = ''; // 停止视频播放 (清空 src 会停止 YouTube 视频)
                            youtubeVideo.style.display = 'none'; // 隐藏 iframe
                            if (videoPreview) {
                                videoPreview.classList.remove('hidden'); // 重新显示视频预览图
                            }
                        }
                    }

                    // 点击评论选项卡时加载评论，并考虑当前的排序方式
                    if (targetTab === 'reviews') {
                        let initialSortKey = 'mostRecent'; // 默认排序
                        if (reviewFilterDropdown) {
                            const selectedOption = reviewFilterDropdown.value;
                            if (selectedOption === 'Highest Rated') {
                                initialSortKey = 'highestRated';
                            } else if (selectedOption === 'Lowest Rated') {
                                initialSortKey = 'lowestRated';
                            }
                        }
                        loadReviews(productId, 1, 5, initialSortKey);
                    }
                });
            });

            // 添加评论筛选下拉菜单的事件监听器
            if (reviewFilterDropdown) {
                reviewFilterDropdown.addEventListener('change', function () {
                    const selectedSortOrder = this.value;
                    let sortKey;
                    if (selectedSortOrder === 'Most Recent') {
                        sortKey = 'mostRecent';
                    } else if (selectedSortOrder === 'Highest Rated') {
                        sortKey = 'highestRated';
                    } else if (selectedSortOrder === 'Lowest Rated') {
                        sortKey = 'lowestRated';
                    }
                    loadReviews(productId, 1, 5, sortKey); // 重新加载评论，从第一页开始
                });
            }


            // 写评论按钮：点击展开评论表单
            const writeReviewBtn = document.querySelector('#reviews .btn-secondary');
            let reviewRecaptchaWidgetId = null;

            // 2. 点击按钮：显示/隐藏或创建表单
            writeReviewBtn.addEventListener('click', () => {
                // 如果表单不存在，就创建
                if (!document.getElementById('review-form')) {
                    const formContainer = document.createElement('div');
                    formContainer.id = 'review-form';
                    formContainer.classList.add('review-form'); // 用于CSS定位/样式
                    formContainer.innerHTML = `
                  <button type="button" class="review-form-close">❌</button>
                  <h3>Write a Review</h3>
                  <div class="form-row">
                    <label for="review-rating">Rating:</label>
                    <select id="review-rating">
                      <option value="5">⭐⭐⭐⭐⭐</option>
                      <option value="4">⭐⭐⭐⭐</option>
                      <option value="3">⭐⭐⭐</option>
                      <option value="2">⭐⭐</option>
                      <option value="1">⭐</option>
                    </select>
                  </div>
                  <div class="form-row">
                    <label for="review-body">Your Review:</label>
                    <textarea id="review-body" rows="4" placeholder="Write your review here…"></textarea>
                  </div>
                  <div class="form-row">
                    <label for="review-images-input">Add Images (max 5):</label>
                    <input type="file" id="review-images-input" accept="image/*" multiple>
                  </div>
                  <!-- ←—— 这里插入 reCAPTCHA 容器 -->
                  <div class="form-row">
                      <label>reCAPTCHA Verification：</label>
                      <div id="recaptcha-container"
                          class="g-recaptcha"
                          data-sitekey="6Le7QUYrAAAAAMSKBLj8a8b49jeXWzsCSe0lANbG">
                      </div>
                  </div>
                  <div class="form-actions">
                    <button id="submit-review" class="btn-primary">Send</button>
                  </div>
                `;
                    // 插入到“Write a Review”按钮后面
                    writeReviewBtn.parentNode.insertBefore(formContainer, writeReviewBtn.nextSibling);

                    // 关闭按钮
                    formContainer.querySelector('.review-form-close')
                        .addEventListener('click', () => formContainer.remove());

                    // 回车提交（不含 Shift+Enter）
                    formContainer.querySelector('#review-body')
                        .addEventListener('keypress', e => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                submitReview();
                            }
                        });

                    // 在容器插入后，手动渲染 reCAPTCHA
                    if (window.grecaptcha && grecaptcha.ready) {
                        grecaptcha.ready(() => {
                            reviewRecaptchaWidgetId = grecaptcha.render(
                                'recaptcha-container',
                                { sitekey: '6Le7QUYrAAAAAMSKBLj8a8b49jeXWzsCSe0lANbG' }
                            );
                        });
                    } else {
                        console.error('reCAPTCHA 库尚未加载');
                    }

                    // 点击“Send”提交
                    formContainer.querySelector('#submit-review')
                        .addEventListener('click', submitReview);

                } else {
                    // 已经创建过表单：切换显示/隐藏
                    document.getElementById('review-form').classList.toggle('hidden');
                }
            });


            // 3. 提交评论的函数（示例）
            async function submitReview() {
                const form = document.getElementById('review-form');
                const rating = form.querySelector('#review-rating').value;
                const body = form.querySelector('#review-body').value.trim();
                // 最多上传 5 张图片
                const files = Array.from(form.querySelector('#review-images-input').files).slice(0, 5);



                const token = grecaptcha.getResponse(reviewRecaptchaWidgetId);
                if (!token) {
                    alert('请先完成 reCAPTCHA 验证');
                    return;
                }


                // 先等 API 加载完
                // 1) 用 FormData 构造 multipart/form-data
                const formData = new FormData();
                console.log('productId:', productId);
                formData.append('productId', productId);
                formData.append('rating', rating);
                formData.append('body', body);
                formData.append('recaptcha', token); // 添加 token
                files.forEach(file => formData.append('images', file));

                console.log('获取到的图片:', files);

                for (let [key, value] of formData.entries()) {
                    console.log(`FormData ${key}:`, value);
                }



                try {
                    // 2) 直接 POST 到 reviews 函数
                    const res = await fetch('/.netlify/functions/get-reviews', {
                        method: 'POST',
                        body: formData
                    });

                    // 检查响应状态
                    if (!res.ok) {
                        const errorText = await res.text();
                        throw new Error(`Server error: ${res.status} - ${errorText}`);
                    }

                    // 解析响应
                    let json;
                    try {
                        json = await res.json();
                    } catch (parseErr) {
                        console.error('Failed to parse response as JSON:', parseErr);
                        throw new Error('Invalid server response: Unable to parse JSON');
                    }

                    // 检查是否有错误
                    if (json === null || typeof json !== 'object') {
                        throw new Error('Invalid server response: Empty or non-object response');
                    }
                    if (json.error) {
                        throw new Error(json.error);
                    }

                    // 3) 上传成功后，刷新评论列表并关闭表单
                    console.log('Review submitted successfully:', json);
                    loadReviews(productId);
                    showNotification("Comment sent successfully")
                    form.remove();
                    // 评论成功发送消息

                    grecaptcha.reset(reviewRecaptchaWidgetId);
                } catch (err) {
                    console.error('Submit review failed:', err);
                    alert('Failed to submit review: ' + err.message);
                }


            }


            // 移动端分类导航
            const categoryItems = document.querySelectorAll('.category-item');

            categoryItems.forEach(item => {
                const itemLink = item.querySelector('a');

                // 对于移动设备，添加切换子类别/超级菜单显示的功能
                if (window.innerWidth <= 768) {
                    itemLink.addEventListener('click', function (e) {
                        const parent = this.parentElement;

                        // 检查此项目是否有子类别下拉菜单或超级菜单
                        const hasDropdown = parent.querySelector('.subcategory-dropdown') !== null;
                        const hasMegaMenu = parent.querySelector('.mega-menu') !== null;

                        if (hasDropdown || hasMegaMenu) {
                            e.preventDefault();

                            // 切换公开课
                            if (parent.classList.contains('open')) {
                                parent.classList.remove('open');
                            } else {
                                // 首先关闭所有其他开放的类别
                                document.querySelectorAll('.category-item.open').forEach(openItem => {
                                    if (openItem !== parent) {
                                        openItem.classList.remove('open');
                                    }
                                });

                                parent.classList.add('open');
                            }
                        }
                    });
                }
            });

            // 查看图像预览
            const reviewImages = document.querySelectorAll('.review-images img');

            reviewImages.forEach(img => {
                img.addEventListener('click', function () {
                    const modal = document.createElement('div');
                    modal.classList.add('image-preview-modal');

                    const modalImg = document.createElement('img');
                    modalImg.src = this.src;

                    const closeBtn = document.createElement('span');
                    closeBtn.classList.add('close-preview');
                    closeBtn.innerHTML = '&times;';

                    modal.appendChild(closeBtn);
                    modal.appendChild(modalImg);
                    document.body.appendChild(modal);

                    // 样式模式
                    modal.style.position = 'fixed';
                    modal.style.top = '0';
                    modal.style.left = '0';
                    modal.style.width = '100%';
                    modal.style.height = '100%';
                    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
                    modal.style.display = 'flex';
                    modal.style.alignItems = 'center';
                    modal.style.justifyContent = 'center';
                    modal.style.zIndex = '2000';

                    closeBtn.style.position = 'absolute';
                    closeBtn.style.top = '20px';
                    closeBtn.style.right = '30px';
                    closeBtn.style.color = 'white';
                    closeBtn.style.fontSize = '40px';
                    closeBtn.style.fontWeight = 'bold';
                    closeBtn.style.cursor = 'pointer';

                    modalImg.style.maxWidth = '90%';
                    modalImg.style.maxHeight = '90%';
                    modalImg.style.objectFit = 'contain';

                    closeBtn.addEventListener('click', function () {
                        modal.remove();
                    });

                    modal.addEventListener('click', function (e) {
                        if (e.target === modal) {
                            modal.remove();
                        }
                    });
                });
            });

            // 点击购物车转跳到购物车页面
            // const checkoutButton = document.querySelector('.proceed-checkout');

            // if (checkoutButton) {
            //     checkoutButton.addEventListener('click', function () {
            //         // 点击按钮跳转到 cart.html
            //         window.location.href = '../products/cart.html';
            //     });
            // }

            // 获取“继续结账”按钮（或你点击用的按钮）和侧边栏元素
            const checkoutButton = document.querySelector('.proceed-checkout');
            const closeSidebar = document.getElementById('closeSidebar');
            const checkoutButtonID = document.getElementById('checkoutBtn');

            if (checkoutButton) {
                checkoutButton.addEventListener('click', openCheckoutSidebar);
            }

            if (closeSidebar) {
                closeSidebar.addEventListener('click', function () {
                    const sidebar = document.getElementById('checkoutSidebar');
                    sidebar.style.display = 'none';
                    sidebar.classList.remove('active');

                    // 隐藏遮罩层
                    if (overlay) overlay.classList.remove('active');

                    // 恢复主页面滚动
                    document.body.style.overflow = 'auto';
                });
            }


            checkoutButtonID.addEventListener('click', function () {
                window.location.href = './cart.html';
            });

            // 点击查看更多
            const btn = document.querySelector('.read-more-btn');
            const desc = document.querySelector('.product-description');

            btn.addEventListener('click', () => {
                desc.classList.toggle('expanded');
                if (desc.classList.contains('expanded')) {
                    btn.textContent = 'Close';
                } else {
                    btn.textContent = 'See more';
                }
            });

            // 主图滑动
            const mainImage = document.querySelector('.main-image');

            let isDown = false;
            let startX;
            let scrollLeft;
            let velocity = 0;
            let momentumID = null;

            mainImage.addEventListener('mousedown', (e) => {
                isDown = true;
                startX = e.pageX - mainImage.offsetLeft;
                scrollLeft = mainImage.scrollLeft;
                velocity = 0;
                cancelMomentumTracking();
            });

            mainImage.addEventListener('mouseleave', () => {
                if (isDown) {
                    isDown = false;
                    beginMomentumTracking();
                }
            });

            mainImage.addEventListener('mouseup', () => {
                if (isDown) {
                    isDown = false;
                    beginMomentumTracking();
                }
            });

            mainImage.addEventListener('mousemove', (e) => {
                if (!isDown) return;
                e.preventDefault();
                const x = e.pageX - mainImage.offsetLeft;
                const walk = (x - startX);
                const prevScrollLeft = mainImage.scrollLeft;
                mainImage.scrollLeft = scrollLeft - walk;
                velocity = mainImage.scrollLeft - prevScrollLeft;
            });

            // 惯性动效
            function beginMomentumTracking() {
                cancelMomentumTracking();
                momentumID = requestAnimationFrame(momentumLoop);
            }

            function cancelMomentumTracking() {
                if (momentumID) {
                    cancelAnimationFrame(momentumID);
                    momentumID = null;
                }
            }

            function momentumLoop() {
                mainImage.scrollLeft += velocity;
                velocity *= 0.95; // 摩擦力，逐渐停下来，越小滑越远
                if (Math.abs(velocity) > 0.5) {
                    momentumID = requestAnimationFrame(momentumLoop);
                }
            }

            // 获取 image-track 中的所有图片
            const imagesInTrack = document.querySelectorAll('.image-track img');
            // 获取模态框及相关元素
            const modal = document.getElementById('imageModal');
            const modalImage = document.getElementById('modalImage');
            const caption = document.getElementById('caption');
            const closeModal = document.getElementById('closeModal');
            const prevBtn = document.getElementById('prevImage');
            const nextBtn = document.getElementById('nextImage');

            let currentIndex = 0;

            function showImage(index) {
                const image = imagesInTrack[index];
                modalImage.src = image.src;
                caption.textContent = image.alt || 'Product Image';
                currentIndex = index;
            }


            // 为 image-track 中的每张图片添加点击事件监听器
            imagesInTrack.forEach((image, index) => {
                image.addEventListener('click', () => {
                    showImage(index);
                    modal.style.display = 'block';
                });
            });


            // 左右切换按钮
            prevBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                currentIndex = (currentIndex - 1 + imagesInTrack.length) % imagesInTrack.length;
                showImage(currentIndex);
            });

            nextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                currentIndex = (currentIndex + 1) % imagesInTrack.length;
                showImage(currentIndex);
            });

            // 关闭模态框
            closeModal.addEventListener('click', function () {
                modal.style.display = 'none'; // 隐藏模态框
            });

            // 点击模态框外部区域时关闭模态框
            modal.addEventListener('click', function (e) {
                if (e.target === modal) {
                    modal.style.display = 'none'; // 隐藏模态框
                }
            });

            // 可选：支持键盘方向键左右切图
            // document.addEventListener('keydown', (e) => {
            //     if (modal.style.display === 'block') {
            //         if (e.key === 'ArrowLeft') prevBtn.click();
            //         if (e.key === 'ArrowRight') nextBtn.click();
            //         if (e.key === 'Escape') modal.style.display = 'none';
            //     }
            // });


        })
        .catch(error => {
            console.error('获取产品信息失败:', error);
            showNotification('Failed to obtain product information, please try again later');
        });


    // 主方法：打开侧栏并渲染购物车
    function openCheckoutSidebar() {
        const sidebar = document.getElementById('checkoutSidebar');
        if (!sidebar) return;

        // 显示侧边栏
        sidebar.style.display = 'block';
        sidebar.classList.add('active');

        // 显示遮罩层
        overlay.classList.add('active');

        // 禁用主页面滚动
        document.body.style.overflow = 'hidden';

        // 获取购物车数据并渲染
        const cartItems = getCart(); // 使用你已有的方法
        // console.log("cartItems的值为: " + JSON.stringify(cartItems, null, 2))
        renderCartItems(cartItems);

        
    }

    // 渲染购物车商品到侧栏
    function renderCartItems(items) {
        const cartContainer = document.getElementById('cartItems');
        const subtotalElement = document.getElementById('subtotal');
        const shippingElement = document.getElementById('shippingSidebar');
        const totalElement = document.getElementById('total');

        // 如果购物车为空
        if (items.length === 0) {
            cartContainer.innerHTML = `
                <div class="empty-cart">
                    <div class="empty-cart-icon">🛒</div>
                    <p>Your cart is empty.</p>
                    <p>Add some items to start shopping!</p>
                </div>
            `;
            subtotalElement.textContent = '$0.00';
            shippingElement.textContent = '$0.00';
            totalElement.textContent = '$0.00';
            return;
        }

        let subtotal = 0;
        cartContainer.innerHTML = '';

        console.log("Items的值为: " + JSON.stringify(items, null, 2));

        items.forEach(item => {
            const itemTotal = item.price * (item.quantity != null ? item.quantity : 1);
            subtotal += itemTotal;

            const itemHTML = `
                <div class="cart-item" data-id="${item.id}" data-color="${item.selectedColor || 'default'}">
                    <img src="${item.image_url}" alt="${item.producttype}" class="cart-item-image">
                    <div class="cart-item-details">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-options">
                            ${item.variant_options?.[0]?.label || 'Option'}:
                            ${item.selectedColor || item.variant_options?.[0]?.options?.[0] || 'Default'}
                        </div>
                        <div class="cart-item-price">${item.quantity || 1} × $${Number(item.price).toFixed(2)}</div>
                        <div class="cart-item-quantity">
                            <button class="qty-btn decrease" data-id="${item.id}" data-color="${item.selectedColor || 'default'}">-</button>
                            <input type="number" value="${item.quantity || 1}" min="1" class="qty-input" data-id="${item.id}" data-color="${item.selectedColor || 'default'}">
                            <button class="qty-btn increase" data-id="${item.id}" data-color="${item.selectedColor || 'default'}">+</button>
                        </div>
                    </div>
                </div>
            `;
            cartContainer.insertAdjacentHTML('beforeend', itemHTML);
        });

        // 计算运费
        const shippingFee = calculateShipping(subtotal);
        const total = subtotal + shippingFee;

        console.log("计算出来的运费：" + shippingFee);

        // 更新价格显示
        subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
        shippingElement.textContent = `$${shippingFee.toFixed(2)}`;
        totalElement.textContent = `$${total.toFixed(2)}`;

        // 绑定数量按钮事件
        bindCartItemEvents();
    }

    // 颜色名称映射（根据你的原始代码复制）
    function getColorName(color) {
        const colorNames = {
            'black': '黑色',
            'blue': '蓝色',
            'green': '绿色',
            'red': '红色'
        };
        return colorNames[color] || color;
    }

    // 数量修改按钮事件绑定（你也可以直接调用购物车类的方法）
    function bindCartItemEvents() {
        const container = document.getElementById('cartItems');
        if (!container) {
            console.error('cartItems 容器不存在');
            return;
        }

        // 移除旧的事件监听器，防止重复绑定
        container.removeEventListener('click', handleClick);
        container.removeEventListener('input', handleInput);

        // 定义点击事件处理函数
        function handleClick(e) {
            const target = e.target;
            if (!target.classList.contains('qty-btn')) return; // 只处理 qty-btn 的点击

            const productId = target.getAttribute('data-id');
            const color = target.getAttribute('data-color') || 'default';
            console.log('点击事件 - productId:', productId, 'color:', color, 'button:', target.className);

            if (!productId) {
                console.error('缺少 data-id 属性');
                showNotification('无法更新数量，商品ID缺失！');
                return;
            }

            let cart = getCart();
            const item = cart.find(i => i.id === productId && (i.selectedColor || 'default') === color);

            if (!item) {
                console.error('未找到匹配的购物车项目:', productId, color);
                showNotification('无法更新数量，购物车项目不存在！');
                return;
            }

            console.log('找到的购物车项目:', item);

            if (target.classList.contains('decrease')) {
                if (item.quantity > 1) {
                    item.quantity -= 1;
                    localStorage.setItem('cart', JSON.stringify(cart));
                    renderCartItems(cart);
                }
            } else if (target.classList.contains('increase')) {
                if (item.stock && item.quantity >= item.stock) {
                    showNotification('无法增加，库存不足！');
                    return;
                }
                item.quantity += 1;
                localStorage.setItem('cart', JSON.stringify(cart));
                renderCartItems(cart);
            }
        }

        // 定义输入事件处理函数
        function handleInput(e) {
            const target = e.target;
            if (!target.classList.contains('qty-input')) return;

            const productId = target.getAttribute('data-id');
            const color = target.getAttribute('data-color') || 'default';
            const newQuantity = parseInt(target.value);

            console.log('输入框更新 - productId:', productId, 'color:', color, 'newQuantity:', newQuantity);

            let cart = getCart();
            const item = cart.find(i => i.id === productId && (i.selectedColor || 'default') === color);

            if (!item) {
                console.error('未找到匹配的购物车项目:', productId, color);
                showNotification('无法更新数量，购物车项目不存在！');
                return;
            }

            if (isNaN(newQuantity) || newQuantity < 1) {
                target.value = 1;
                item.quantity = 1;
            } else if (item.stock && newQuantity > item.stock) {
                showNotification('输入的数量超过库存！');
                target.value = item.stock;
                item.quantity = item.stock;
            } else {
                item.quantity = newQuantity;
            }

            localStorage.setItem('cart', JSON.stringify(cart));
            renderCartItems(cart);
        }

        // 绑定事件监听器
        container.addEventListener('click', handleClick);
        container.addEventListener('input', handleInput);
    }

    // 封装显示消息方法
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

    // 渲染产品详细信息（例如规格、包含内容等）
    function renderProductDetails(product) {
        // 渲染规格表
        if (product.specifications) {
            const specsTable = document.querySelector('.specs-table');
            specsTable.innerHTML = '';
            Object.entries(product.specifications).forEach(([key, value]) => {
                const row = document.createElement('div');
                row.className = 'specs-row';
                row.innerHTML = `
                    <div class="specs-label">${key}</div>
                    <div class="specs-value">${value}</div>
                `;
                specsTable.appendChild(row);
            });
        }

        // 渲染包含内容
        if (product.package_includes) {
            const includedList = document.querySelector('.included-list');
            includedList.innerHTML = '';
            product.package_includes.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                includedList.appendChild(li);
            });
        }
    }

    // 渲染推荐产品区域（猜你喜欢）
    function renderRecommendedProducts() {
        let currentProducts = [];

        fetch('/.netlify/functions/fetch-products') // 替换成你后端的获取产品 API
            .then(response => response.json())
            .then(data => {
                currentProducts = data;
                if (currentProducts && currentProducts.length > 0) {
                    const shuffled = currentProducts.sort(() => 0.5 - Math.random());
                    const selectedProducts = shuffled.slice(0, 3);

                    const productGrid = document.querySelector('.product-grid');
                    productGrid.innerHTML = ''; // 先清空旧的 grid 内容

                    selectedProducts.forEach(product => {
                        const card = document.createElement('div');
                        card.className = 'product-card';
                        card.innerHTML = `
                            <img src="${product.image_url}" alt="Product Image">
                            <h3>${product.producttype || product.name}</h3>
                            <div class="price">
                                <span class="current-price">$${product.final_price}</span>
                                <span class="original-price" style="display:none;"></span>
                            </div>
                            <button class="add-to-cart">ADD TO CART</button>
                        `;
                        productGrid.appendChild(card); // 把新建的card加到grid里

                        // 为产品卡片本身添加点击事件，用于跳转到产品详情页
                        card.addEventListener('click', (event) => {
                            // 检查点击事件是否来自“添加到购物车”按钮，如果是，则不执行页面跳转
                            if (!event.target.classList.contains('add-to-cart')) {
                                const productUUID = product.id;
                                const productNameForUrl = product.name.replace(/\s+/g, '-').toLowerCase();
                                window.location.href = `product-detail.html?id=${productUUID}-${productNameForUrl}`;
                            }
                        });
                    });
                }
            })
            .catch(error => {
                console.error('获取推荐产品数据失败:', error);
            });
    }

    // 添加商品到购物车
    function addToCart(product) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        console.log("添加购物车 - 原始购物车数据:", JSON.stringify(cart, null, 2));

        const selectedColor = document.getElementById('color-select')?.value || 'default';
        console.log("添加购物车 - 选择的颜色:", selectedColor, "产品ID:", product.id);

        const existingItem = cart.find(item => item.id === product.id && (item.selectedColor || 'default') === selectedColor);

        if (existingItem) {
            existingItem.quantity += 1;
            console.log("更新现有商品数量:", existingItem);
        } else {
            const productToCart = {
                ...product,
                price: parseFloat(product.final_price).toFixed(2),
                quantity: 1,
                selectedColor
            };
            cart.push(productToCart);
            console.log("添加新商品到购物车:", productToCart);
        }

        console.log("更新后的购物车:", JSON.stringify(cart, null, 2));
        localStorage.setItem('cart', JSON.stringify(cart));
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
            "name": products[0]?.name || "Product Listing",
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

    /**
     * 拉取并渲染评论
     * @param {string} productId 
     */
    async function loadReviews(productId, page = 1, perPage = 5, sortOrder = 'mostRecent') {
        const listEl = document.querySelector('#reviews .reviews-list');
        const paginationEl = document.querySelector('#reviews .pagination');
        const reviewsSection = document.getElementById('reviews'); // 获取评论区的父元素
        if (!listEl || !paginationEl) return;

        listEl.innerHTML = '<p>loading...…</p>'; // 修改加载提示为中文

        try {
            const res = await fetch(`/.netlify/functions/get-reviews?productId=${productId}`);
            if (!res.ok) throw new Error('网络错误'); // 修改错误信息为中文
            let allReviews = await res.json();

            // 根据 sortOrder 对评论进行排序
            if (sortOrder === 'highestRated') {
                allReviews.sort((a, b) => b.rating - a.rating); // 评分从高到低
            } else if (sortOrder === 'lowestRated') {
                allReviews.sort((a, b) => a.rating - b.rating); // 评分从低到高
            } else { // 'mostRecent' (默认)
                allReviews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); // 日期从新到旧
            }

            const totalReviews = allReviews.length;
            const totalPages = Math.ceil(totalReviews / perPage);
            const start = (page - 1) * perPage;
            const pagedReviews = allReviews.slice(start, start + perPage);

            if (pagedReviews.length === 0) {
                listEl.innerHTML = '<p>No comments yet — Be the first to leave a review!</p>'; // 修改提示为中文
                paginationEl.innerHTML = '';
                reviewsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

                // 如果没有评论，产品顶部的评分也显示为0
                updateMainProductRating({ average: 0, count: 0 }); // <-- 在这里调用
                return;
            }

            listEl.innerHTML = pagedReviews.map(r => `
                <div class="review-item">
                    <div class="reviewer-info">
                        <div class="reviewer-name">${r.username || 'Anonymous User'}</div>
                        ${r.is_verified ? '<span class="verified-badge">Verified Buyer</span>' : ''}
                        <div class="review-date">${new Date(r.created_at).toLocaleDateString()}</div>
                    </div>
                    <div class="review-rating">
                        ${'★'.repeat(r.rating) + '☆'.repeat(5 - r.rating)}
                    </div>
                    <p class="review-body">${r.body}</p>
                    ${r.image_urls?.length ? `<div class="review-images">${r.image_urls.map(url => `<img src="${url}" alt="评论图片">`).join('')}</div>` : ''}
                </div>
            `).join('');

            renderPagination(page, totalPages, productId); // 分页导航

            const ratingRes = await fetch(`/.netlify/functions/get-reviews?productId=${productId}&rating=true`);
            if (ratingRes.ok) {
                const ratingData = await ratingRes.json();
                updateReviewSummary(ratingData);
                updateRatingBreakdown(ratingData);
                updateMainProductRating(ratingData); // <-- 在这里调用更新主产品评分的函数
            }
            reviewsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } catch (err) {
            console.error(err);
            listEl.innerHTML = '<p>Failed to load comments, please try again later。</p>'; // 修改错误信息为中文
            paginationEl.innerHTML = '';
            updateMainProductRating({ average: 0, count: 0 }); // 失败时也更新为0
        }
    }

    // 更新评论星级
    function updateReviewSummary({ average, count }) {
        const ratingNumber = document.querySelector('.reviews-summary .rating-number');
        const totalReviews = document.querySelector('.reviews-summary .total-reviews');
        const starsContainer = document.querySelector('.reviews-summary .rating-stars');

        if (ratingNumber) ratingNumber.textContent = average.toFixed(1);
        if (totalReviews) totalReviews.textContent = `Based on ${count} review${count !== 1 ? 's' : ''}`;

        if (starsContainer) {
            // 根据平均值更新星星（最多5颗）
            starsContainer.innerHTML = '';
            const fullStars = Math.floor(average);
            const halfStar = average - fullStars >= 0.5;
            const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

            for (let i = 0; i < fullStars; i++) {
                starsContainer.innerHTML += '<i class="fas fa-star"></i>';
            }
            if (halfStar) {
                starsContainer.innerHTML += '<i class="fas fa-star-half-alt"></i>';
            }
            for (let i = 0; i < emptyStars; i++) {
                starsContainer.innerHTML += '<i class="far fa-star"></i>';
            }
        }
    }

    // ============== 新增函数：更新产品顶部的星级和评论数量 ==============
    function updateMainProductRating({ average, count }) {
        const mainStarsContainer = document.querySelector('.product-main-stars'); // 使用新的类名
        const mainReviewsCount = document.querySelector('.product-main-reviews-count'); // 使用新的类名

        if (mainStarsContainer) {
            mainStarsContainer.innerHTML = ''; // 清空现有星级
            const fullStars = Math.floor(average);
            const halfStar = average - fullStars >= 0.5;
            const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

            for (let i = 0; i < fullStars; i++) {
                mainStarsContainer.innerHTML += '<i class="fas fa-star"></i>';
            }
            if (halfStar) {
                mainStarsContainer.innerHTML += '<i class="fas fa-star-half-alt"></i>';
            }
            for (let i = 0; i < emptyStars; i++) {
                mainStarsContainer.innerHTML += '<i class="far fa-star"></i>';
            }
        }

        if (mainReviewsCount) {
            mainReviewsCount.textContent = `${average.toFixed(1)} (${count} reviews)`; // 显示如 "4.5 (128 reviews)"
        }
    }

    function updateRatingBreakdown({ stars = {}, count = 0 }) {
        const breakdown = document.querySelector('.rating-breakdown');
        if (!breakdown) return;

        [5, 4, 3, 2, 1].forEach(star => {
            const row = breakdown.querySelector(`.rating-row:nth-child(${6 - star})`);
            const bar = row.querySelector('.progress');
            const percent = row.querySelector('.percent');

            const value = stars[star] || 0;
            const percentage = count > 0 ? Math.round((value / count) * 100) : 0;

            bar.style.width = `${percentage}%`;
            percent.textContent = `${percentage}%`;
        });
    }

    // renderPagination 函数（ 分页逻辑目标）
    function renderPagination(currentPage, totalPages, productId) {
        const container = document.querySelector('#reviews .pagination');
        if (!container) return;

        container.innerHTML = '';

        if (totalPages <= 1) return; // 不显示分页

        const createPageLink = (page, label = page, isActive = false) => {
            const a = document.createElement('a');
            a.href = '#';
            a.textContent = label;
            if (isActive) a.classList.add('active');
            a.addEventListener('click', (e) => {
                e.preventDefault();
                // 重新加载评论时，保留当前的排序方式
                const currentSortOrder = document.querySelector('.filter-dropdown')?.value || 'Most Recent';
                let sortKey;
                if (currentSortOrder === 'Most Recent') {
                    sortKey = 'mostRecent';
                } else if (currentSortOrder === 'Highest Rated') {
                    sortKey = 'highestRated';
                } else if (currentSortOrder === 'Lowest Rated') {
                    sortKey = 'lowestRated';
                }
                loadReviews(productId, page, 5, sortKey);
            });
            return a;
        };

        // always show first page
        container.appendChild(createPageLink(1, '1', currentPage === 1));

        // show second and third if applicable
        if (totalPages >= 2) {
            container.appendChild(createPageLink(2, '2', currentPage === 2));
        }

        if (totalPages >= 3) {
            container.appendChild(createPageLink(3, '3', currentPage === 3));
        }

        // 如果还有更多页，显示 "..." 和最后一页
        if (totalPages > 3) {
            if (currentPage > 3 && currentPage < totalPages) {
                const span = document.createElement('span');
                span.textContent = '...';
                container.appendChild(span);

                container.appendChild(createPageLink(currentPage, currentPage, true));
            }

            if (currentPage < totalPages - 1) {
                const span = document.createElement('span');
                span.textContent = '...';
                container.appendChild(span);
            }

            container.appendChild(createPageLink(totalPages, totalPages, currentPage === totalPages));
        }

        // Next 按钮
        if (currentPage < totalPages) {
            const next = document.createElement('a');
            next.href = '#';
            next.className = 'next';
            next.innerHTML = `下一页 <i class="fas fa-chevron-right"></i>`; // 修改为中文
            next.addEventListener('click', (e) => {
                e.preventDefault();
                const currentSortOrder = document.querySelector('.filter-dropdown')?.value || 'Most Recent';
                let sortKey;
                if (currentSortOrder === 'Most Recent') {
                    sortKey = 'mostRecent';
                } else if (currentSortOrder === 'Highest Rated') {
                    sortKey = 'highestRated';
                } else if (currentSortOrder === 'Lowest Rated') {
                    sortKey = 'lowestRated';
                }
                loadReviews(productId, currentPage + 1, 5, sortKey);
            });
            container.appendChild(next);
        }
    }

    let currentReviewImages = [];
    let currentImageIndex = 0;

    // 点击放大图片
    document.addEventListener('click', function (e) {
        // 打开模态框并记录当前图片
        if (e.target.matches('.review-images img')) {
            // 找到当前点击图片所在的评论项
            const reviewItem = e.target.closest('.review-item');
            const images = Array.from(reviewItem.querySelectorAll('.review-images img'));
            currentReviewImages = images.map(img => img.src);
            currentImageIndex = images.indexOf(e.target);

            document.getElementById('reviewModalImg').src = currentReviewImages[currentImageIndex];
            document.getElementById('reviewImageModal').style.display = 'flex';
        }

        // 关闭模态框
        if (
            e.target.matches('#closeReviewModal') ||
            e.target.id === 'reviewImageModal'
        ) {
            document.getElementById('reviewImageModal').style.display = 'none';
        }

        // 切换上一张图片
        if (e.target.id === 'prevImage') {
            if (currentReviewImages.length === 0) return;
            currentImageIndex = (currentImageIndex - 1 + currentReviewImages.length) % currentReviewImages.length;
            document.getElementById('reviewModalImg').src = currentReviewImages[currentImageIndex];
        }

        // 切换下一张图片
        if (e.target.id === 'nextImage') {
            if (currentReviewImages.length === 0) return;
            currentImageIndex = (currentImageIndex + 1) % currentReviewImages.length;
            document.getElementById('reviewModalImg').src = currentReviewImages[currentImageIndex];
        }
    });

    function getCart() {
        return JSON.parse(localStorage.getItem('cart')) || [];
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

    // 从各种 YouTube URL 中提取视频 ID 的函数
    function getYouTubeVideoId(url) {
        if (!url) {
            return null;
        }
        const regExp = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|)([\w-]{11})(?:\S+)?/i;
        const match = url.match(regExp);
        return (match && match[1]) ? match[1] : null;
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

    // 计算运费
    function calculateShipping(subtotal) {
        if (subtotal === 0) return 0; // 空购物车不收运费
        return subtotal > 49 ? 0 : 4.9;
    }

    if (window.paypal) {
        paypal.Buttons({
            style: {
                layout: 'vertical',
                color: 'gold',
                shape: 'rect',
                label: 'paypal'
            },
            createOrder: async function (data, actions) {
                // 获取购物车中的所有商品
                // 假设 getCart() 返回的是一个商品数组，每个商品包含 name, price, quantity 等
                const cartItems = getCart(); // 使用您已有的获取购物车数据的方法

                const selectedShippingCost = parseFloat(document.getElementById('shippingSidebar').value);

                const response = await fetch('/.netlify/functions/validate-price', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        cart: cartItems,
                        selectedShipping: selectedShippingCost
                    })
                });

                const result = await response.json();

                if (!response.ok) {
                    showNotification(result.error || 'Could not validate price.', 'error');
                    return Promise.reject(new Error('Could not validate price.'));
                }


                // 触发 AddPaymentInfo 事件
                if (window.fbq && cartItems.length > 0) {
                    const totalValue = cartItems.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0);
                    const contentIds = cartItems.map(item => item.id);
                    const numItems = cartItems.reduce((total, item) => total + item.quantity, 0);

                    fbq('track', 'InitiateCheckout', {
                        value: totalValue.toFixed(2),
                        currency: 'USD',
                        content_ids: contentIds,
                        num_items: numItems,
                        content_type: 'product'
                    });
                }

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

                // ✅ 这行是关键：返回创建订单
                return actions.order.create({
                    purchase_units: [purchase_unit]
                });

            },
            onApprove: function (data, actions) {
                return actions.order.capture().then(async function (details) {
                    const confirmedShippingDetails = details.purchase_units[0].shipping;

                    const shippingAddress = {
                        full_name: confirmedShippingDetails.name.full_name,
                        phone_number: confirmedShippingDetails.phone?.phone_number?.national_number || '',
                        address_line_1: confirmedShippingDetails.address.address_line_1,
                        city: confirmedShippingDetails.address.admin_area_2,
                        state: confirmedShippingDetails.address.admin_area_1,
                        postal_code: confirmedShippingDetails.address.postal_code,
                        country: confirmedShippingDetails.address.country_code,
                        email: details.payer.email_address, // 邮箱从 payer 获取
                    };

                    const payerInfo = {
                        email_address: details.payer.email_address,
                        name: {
                            given_name: details.payer.name?.given_name || '',
                            surname: details.payer.name?.surname || '',
                        }
                    };

                    const payload = {
                        order: {
                            shipping_address: shippingAddress,
                            paypal_address: {},  // 如果需要，可以传 PayPal 原始地址
                            payer_info: payerInfo,
                            total_amount: parseFloat(details.purchase_units[0].amount.value) || 0,
                            status: details.status,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                        },
                        items: getCart(),
                    };

                    try {
                        const response = await fetch('/.netlify/functions/store-order', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(payload),
                        });

                        const result = await response.json();

                        if (response.ok) {
                            console.log('订单已成功保存:', result);
                            if (result.orderId) localStorage.setItem('orderId', result.orderId);
                        } else {
                            console.error('保存订单时出错:', result);
                            showNotification('An error occurred while processing your order. Please try again.');
                        }
                    } catch (err) {
                        console.error('发送订单时发生异常:', err);
                        showNotification('Failed to submit the order. Please check your network and try again.');
                    }

                    // 存本地，跳转到确认页面
                    localStorage.setItem('orderData', JSON.stringify(payload));
                    window.location.href = '../products/checkout.html';
                });
            },

            onCancel: function (data) {
                showNotification('Transaction Cancelled');
            },

            onError: function (err) {
                console.error('PayPal Checkout error', err);
                showNotification('An error occurred during PayPal payment.');
            }
        }).render('#paypal-button-container');
    }
});
