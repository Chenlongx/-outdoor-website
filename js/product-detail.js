

document.addEventListener('DOMContentLoaded', function () {
    // 页面加载时，立即显示一个默认的0星和0评论占位符
    updateMainProductRating({ average: 0, count: 0 });

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

    // 监听本地存储的变化
    window.addEventListener('storage', (e) => {
        if (e.key === 'cart') {
            updateCartCount();  // 更新购物车数量
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
            console.log(parseFloat(product.final_price).toFixed(2))
            // 更新产品信息
            const productImage = document.querySelector('.main-image img');
            const productName = document.querySelector('.product-name');
            const productTitle = document.querySelector('.product-header h1');
            const productType = document.querySelector('.product-type');
            const productPrice = document.querySelector('.current-price');
            const originalPrice = document.querySelector('.original-price');
            const discountBadge = document.querySelector('.discount-badge');
            const productStock = document.querySelector('.product-stock');
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
            if (productStock) productStock.textContent = `库存: ${product.stock}`;
            
            if (productDescription) productDescription.textContent = product.description;

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

            // tabs.forEach(tab => {
            //     tab.addEventListener('click', function () {
            //         // 获取选项卡的 data-tab 属性
            //         const targetTab = this.getAttribute('data-tab');

            //         // 从所有选项卡和选项卡窗格中删除活动类
            //         tabs.forEach(t => t.classList.remove('active'));
            //         tabPanes.forEach(pane => pane.classList.remove('active'));

            //         // 为点击的选项卡和相应的选项卡窗格添加 active 类
            //         this.classList.add('active');
            //         document.getElementById(targetTab).classList.add('active');

            //         // 点击调用loadReviews方法 渲染评论
            //         if (targetTab === 'reviews') {
            //             loadReviews(productId);
            //         }
            //     });
            // });
            tabs.forEach(tab => {
                tab.addEventListener('click', function () {
                    const targetTab = this.getAttribute('data-tab');

                    tabs.forEach(t => t.classList.remove('active'));
                    tabPanes.forEach(pane => pane.classList.remove('active'));

                    this.classList.add('active');
                    document.getElementById(targetTab).classList.add('active');

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
            const checkoutButton = document.querySelector('.proceed-checkout');

            if (checkoutButton) {
                checkoutButton.addEventListener('click', function () {
                    // 点击按钮跳转到 cart.html
                    window.location.href = '../products/cart.html';
                });
            }

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
            // imagesInTrack.forEach((image) => {
            //     image.addEventListener('click', function () {
            //         const imageUrl = this.src; // 获取点击的图片的 src 属性值
            //         modalImage.src = imageUrl; // 设置模态框中的大图
            //         caption.textContent = this.alt || "Product Image"; // 可选：设置大图的描述

            //         modal.style.display = 'block'; // 显示模态框
            //     });
            // });
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
                        console.log("product", product)
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
                    });
                }
            })
            .catch(error => {
                console.error('获取推荐产品数据失败:', error);
            });
    }

    // 添加商品到购物车
    function addToCart(product) {
        // 获取购物车数据
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        console.log("获取购物车数据" + cart)

        // 获取用户选择的颜色
        const selectedColor = document.getElementById('color-select')?.value || '';

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
                quantity: 1, // 新增 quantity 字段
                selectedColor // 添加用户选择的颜色
            };

            cart.push(productToCart);
        }

        // 保存购物车数据
        console.log(product)

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
                        <div class="reviewer-name">${r.user_name || 'Anonymous User'}</div>
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
});
