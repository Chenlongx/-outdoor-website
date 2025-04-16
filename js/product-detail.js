// Product Detail Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // 从 localStorage 获取产品信息
    const product = JSON.parse(localStorage.getItem('currentProduct'));
    console.log(product)
    if (!product) {
        // 如果没有产品信息，重定向回产品列表页
        window.location.href = './products.html';
        return;
    }

    // 更新页面标题
    document.title = `${product.name} | WildGear`;

    // 更新产品信息
    const productImage = document.querySelector('.main-image img');
    const productName = document.querySelector('.product-name');
    const productTitle = document.querySelector('.product-header h1');
    const productType = document.querySelector('.product-type');
    const productPrice = document.querySelector('.product-price');
    const productStock = document.querySelector('.product-stock');
    const productDescription = document.querySelector('.product-description');

    if (productImage) productImage.src = product.image_url;
    if (productName) productName.textContent = product.name;
    
    if (productTitle)  productTitle.textContent = product.name;
    if (productType) productType.textContent = product.producttype;
    if (productPrice) productPrice.textContent = `$${product.price}`;
    if (productStock) productStock.textContent = `库存: ${product.stock}`;
    if (productDescription) productDescription.textContent = product.description;

    // 设置加入购物车按钮的事件监听器
    const addToCartBtn = document.querySelector('.add-to-cart-btn');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
            // 获取购物车数据
            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            
            // 检查产品是否已在购物车中
            const existingItem = cart.find(item => item.id === product.id);
            
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                // 确保产品图片路径正确保存
                const productToAdd = {
                    ...product,
                    image: product.image_url, // 确保使用image_url作为image属性
                    quantity: 1
                };
                
                console.log('从产品详情页添加到购物车的产品:', productToAdd);
                cart.push(productToAdd);
            }
            
            // 保存购物车数据
            localStorage.setItem('cart', JSON.stringify(cart));
            
            // 显示添加成功提示
            showNotification(`${product.name} 已添加到购物车`);
        });
    }

    // 🆕 下面是新增的：渲染产品详情
    // if (product.details && product.details.length > 0) {
    //     const details = product.details;
    
    //     // 1. 更新 .tab-pane.active h2
    //     const titleH2 = document.querySelector('.tab-pane.active h2');
    //     if (titleH2 && details[0]) {
    //         titleH2.textContent = details[0].title;
    //     }
    
    //     // 2. 更新第一个段落 p
    //     const firstParagraphs = document.querySelectorAll('.tab-pane.active .description-paragraph');
    //     if (firstParagraphs.length > 0 && details[0]) {
    //         const descriptionParts = details[0].description.split('\n'); // 按换行分段
    //         firstParagraphs.forEach((p, idx) => {
    //             if (descriptionParts[idx]) {
    //                 p.innerHTML = descriptionParts[idx];
    //             }
    //         });
    //     }
    
    //     // 3. 动态生成 feature-highlight
    //     const productFeaturesContainer = document.querySelector('.product-features');
    //     if (productFeaturesContainer) {
    //         // 清空旧的 feature
    //         productFeaturesContainer.innerHTML = '';
    
    //         // 从 details[1] 开始，因为 details[0] 是头部描述
    //         details.slice(1).forEach((detail, index) => {
    //             // 创建新的 feature-highlight 元素
    //             const featureDiv = document.createElement('div');
    //             featureDiv.className = index % 2 === 0 ? 'feature-highlight' : 'feature-highlight reverse'; // 偶数正常，奇数加 reverse
    
    //             featureDiv.innerHTML = `
    //                 <div class="highlight-image">
    //                     <img src="${detail.image}" alt="Feature Image">
    //                 </div>
    //                 <div class="highlight-content">
    //                     <h3 class="feature-title">${detail.title}</h3>
    //                     <p class="feature-description">${detail.description.replace(/\n/g, '<br>')}</p>
    //                 </div>
    //             `;
    
    //             productFeaturesContainer.appendChild(featureDiv);
    //         });
    //     }
    // }

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










    // 🆕 渲染规格表（specifications）
    if (product.specifications) {
        const specifications = product.specifications; // 规格字段
        const specsTable = document.querySelector('.specs-table'); // 找到规格表容器

        if (specsTable) {
            // 清空旧的内容
            specsTable.innerHTML = '';

            // 遍历规格 JSON，动态生成行
            for (const [key, value] of Object.entries(specifications)) {
                const row = document.createElement('div');
                row.className = 'specs-row';
                row.innerHTML = `
                    <div class="specs-label">${key}</div>
                    <div class="specs-value">${value}</div>
                `;
                specsTable.appendChild(row);
            }
        }
    }
    
    // 🆕 渲染包含内容（package_includes）
    if (product.package_includes && Array.isArray(product.package_includes)) {
        const includedList = document.querySelector('.included-list');

        if (includedList) {
            // 清空旧的
            includedList.innerHTML = '';

            // 遍历数组，每个内容生成一个li
            product.package_includes.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                includedList.appendChild(li);
            });
        }
    }

    // 推荐产品区域
    let currentProducts = [];

    fetch('/.netlify/functions/fetch-products')
        .then(response => response.json())
        .then(data => {
            currentProducts = data;
            console.log('获取到的产品数据:', currentProducts);

            if (currentProducts && currentProducts.length > 0) {
                const shuffled = currentProducts.sort(() => 0.5 - Math.random());
                const selectedProducts = shuffled.slice(0, 3);

                const productGrid = document.querySelector('.product-grid');
                productGrid.innerHTML = ''; // 先清空旧的 grid 内容

                selectedProducts.forEach(product => {
                    // 动态创建每个product-card
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
            console.error('获取数据失败:', error);
        });




    // 显示通知的函数
    function showNotification(message) {
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


    // setThumbnailClickEvent();
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
    
});
