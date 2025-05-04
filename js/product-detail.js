document.addEventListener('DOMContentLoaded', function() {
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


    // 通过 API 获取产品信息
    fetch(`/.netlify/functions/fetch-product-by-id?id=${productId}`)
        .then(response => response.json())
        .then(product => {

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
            const originalPrice =  document.querySelector('.original-price');
            const discountBadge =  document.querySelector('.discount-badge');
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
            if(originalPrice) originalPrice.textContent = parseFloat(product.price).toFixed(2);
            if(discountBadge) discountBadge.textContent = `${product.discount_percent}% OFF`;
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
                addToCartBtn.addEventListener('click', (e) => {
                    // let cart = JSON.parse(localStorage.getItem('cart')) || [];

                    // const existingItem = cart.find(item => item.id === product.id);
                    
                    // if (existingItem) {
                    //     existingItem.quantity += 1; // 如果已存在，增加数量
                    // } else {
                    //     const productToAdd = {
                    //         ...product,
                    //         image: product.image_url, // 确保使用image_url作为image属性
                    //         price: product.final_price,  // 确保添加折扣后的价格
                    //         quantity: 1
                    //     };
                    //     cart.push(productToAdd);
                    // }
                    // localStorage.setItem('cart', JSON.stringify(cart));
                    // console.log(`${product.name} 已经添加到购物车`)
                    e.stopPropagation();

                    // 存储当前点击的产品信息到 localStorage
                    // localStorage.setItem('currentProduct', JSON.stringify(product));
                    console.log("储存前的数据：", product)
                    addToCart(product);
                    showNotification(`${product.name} Added to cart`);
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

            // 渲染推荐产品区域
            renderRecommendedProducts();

            // 生成主图滑动区
            const mainImageTrack = document.querySelector('.image-track');
            if (mainImageTrack && Array.isArray(product.product_details_url)) {
                mainImageTrack.innerHTML = ''; // 清空

                product.product_details_url.forEach((url, index) => {
                    const img = document.createElement('img');
                    img.src = url;
                    img.alt = `Product Main Image ${index + 1}`;
                    mainImageTrack.appendChild(img);
                });
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
                            targetImage.scrollIntoView({ behavior: 'smooth', inline: 'center' });
            
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
            
            // 调用函数
            setThumbnailClickEvent();
        
            // 数量选择器
            const quantityInput = document.getElementById('quantity');
            const decreaseBtn = document.getElementById('decrease-quantity');
            const increaseBtn = document.getElementById('increase-quantity');
        
            if (decreaseBtn && increaseBtn && quantityInput) {
                decreaseBtn.addEventListener('click', function() {
                    let currentValue = parseInt(quantityInput.value);
                    if (currentValue > 1) {
                        quantityInput.value = currentValue - 1;
                    }
                });
        
                increaseBtn.addEventListener('click', function() {
                    let currentValue = parseInt(quantityInput.value);
                    if (currentValue < 10) {
                        quantityInput.value = currentValue + 1;
                    }
                });
        
                // 确保输入有效
                quantityInput.addEventListener('change', function() {
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
                wishlistBtn.addEventListener('click', function() {
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
        
            tabs.forEach(tab => {
                tab.addEventListener('click', function() {
                    // 获取选项卡的 data-tab 属性
                    const targetTab = this.getAttribute('data-tab');
        
                    // 从所有选项卡和选项卡窗格中删除活动类
                    tabs.forEach(t => t.classList.remove('active'));
                    tabPanes.forEach(pane => pane.classList.remove('active'));
        
                    // 为点击的选项卡和相应的选项卡窗格添加 active 类
                    this.classList.add('active');
                    document.getElementById(targetTab).classList.add('active');
                });
            });
        
            // 移动端分类导航
            const categoryItems = document.querySelectorAll('.category-item');
        
            categoryItems.forEach(item => {
                const itemLink = item.querySelector('a');
        
                // 对于移动设备，添加切换子类别/超级菜单显示的功能
                if (window.innerWidth <= 768) {
                    itemLink.addEventListener('click', function(e) {
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
                img.addEventListener('click', function() {
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
        
                    closeBtn.addEventListener('click', function() {
                        modal.remove();
                    });
        
                    modal.addEventListener('click', function(e) {
                        if (e.target === modal) {
                            modal.remove();
                        }
                    });
                });
            });
        
            // 点击购物车转跳到购物车页面
            const checkoutButton = document.querySelector('.proceed-checkout');
        
            if (checkoutButton) {
                checkoutButton.addEventListener('click', function() {
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
        
            // 为 image-track 中的每张图片添加点击事件监听器
            imagesInTrack.forEach((image) => {
                image.addEventListener('click', function() {
                    const imageUrl = this.src; // 获取点击的图片的 src 属性值
                    modalImage.src = imageUrl; // 设置模态框中的大图
                    caption.textContent = this.alt || "Product Image"; // 可选：设置大图的描述
                    
                    modal.style.display = 'block'; // 显示模态框
                });
            });
        
            // 关闭模态框
            closeModal.addEventListener('click', function() {
                modal.style.display = 'none'; // 隐藏模态框
            });
        
            // 点击模态框外部区域时关闭模态框
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    modal.style.display = 'none'; // 隐藏模态框
                }
            });



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

    // 渲染推荐产品区域
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
                                <span class="current-price">$${product.price}</span>
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
    }

});
