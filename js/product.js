// 产品详情页面 JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize product thumbnails
    initProductThumbnails();

    // Initialize product tabs
    initProductTabs();

    // Initialize quantity selector
    initQuantitySelector();

    // Initialize product options (color, size)
    initProductOptions();

    // Initialize product actions
    initProductActions();

    // Initialize review features
    initReviewFeatures();
});

// 初始化产品缩略图
function initProductThumbnails() {
    const thumbnails = document.querySelectorAll('.thumbnail');
    const mainImage = document.getElementById('main-product-image');

    if (!thumbnails.length || !mainImage) return;

    thumbnails.forEach(thumb => {
        thumb.addEventListener('click', function() {
            // Remove active class from all thumbnails
            thumbnails.forEach(t => t.classList.remove('active'));

            // Add active class to clicked thumbnail
            this.classList.add('active');

            // Update main image source
            const newImageSrc = this.getAttribute('data-image');
            mainImage.src = newImageSrc;

            // Add a subtle fade-in effect to the main image
            mainImage.style.opacity = '0.7';
            setTimeout(() => {
                mainImage.style.opacity = '1';
            }, 50);
        });
    });
}

// 初始化产品标签
function initProductTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    if (!tabBtns.length || !tabPanes.length) return;

    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons and panes
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));

            // Add active class to clicked button
            this.classList.add('active');

            // Show corresponding tab pane
            const tabId = this.getAttribute('data-tab');
            const tabPane = document.getElementById(tabId);
            if (tabPane) {
                tabPane.classList.add('active');
            }
        });
    });

    // Check if there's a reviews hash in the URL
    if (window.location.hash === '#reviews' && document.getElementById('reviews-tab')) {
        // Trigger click on reviews tab
        document.getElementById('reviews-tab').click();

        // Scroll to reviews section with a slight delay to allow tab to show
        setTimeout(() => {
            const reviewsSection = document.getElementById('reviews');
            if (reviewsSection) {
                reviewsSection.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    }

    // Add hash change event listener for review links
    const reviewLinks = document.querySelectorAll('a[href="#reviews"]');
    reviewLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            if (document.getElementById('reviews-tab')) {
                document.getElementById('reviews-tab').click();

                setTimeout(() => {
                    const reviewsSection = document.getElementById('reviews');
                    if (reviewsSection) {
                        reviewsSection.scrollIntoView({ behavior: 'smooth' });
                    }
                }, 100);
            }
        });
    });
}

// 初始化数量选择器
function initQuantitySelector() {
    const decreaseBtn = document.querySelector('.quantity-btn.decrease');
    const increaseBtn = document.querySelector('.quantity-btn.increase');
    const quantityInput = document.querySelector('.quantity-input');

    if (!decreaseBtn || !increaseBtn || !quantityInput) return;

    decreaseBtn.addEventListener('click', function() {
        let value = parseInt(quantityInput.value);
        if (value > 1) {
            quantityInput.value = value - 1;
        }
    });

    increaseBtn.addEventListener('click', function() {
        let value = parseInt(quantityInput.value);
        const max = parseInt(quantityInput.getAttribute('max') || 10);
        if (value < max) {
            quantityInput.value = value + 1;
        }
    });

    quantityInput.addEventListener('change', function() {
        let value = parseInt(this.value);
        const min = parseInt(this.getAttribute('min') || 1);
        const max = parseInt(this.getAttribute('max') || 10);

        if (isNaN(value) || value < min) {
            this.value = min;
        } else if (value > max) {
            this.value = max;
        }
    });
}

// 初始化产品选项（颜色、尺寸）
function initProductOptions() {
    // Color options
    const colorOptions = document.querySelectorAll('.color-option');

    colorOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove selected class from all color options
            colorOptions.forEach(o => o.classList.remove('selected'));

            // Add selected class to clicked option
            this.classList.add('selected');

            // Get selected color (could be used to update images or other elements)
            const selectedColor = this.getAttribute('data-color');
            console.log('Selected color:', selectedColor);
        });
    });

    // Size options
    const sizeOptions = document.querySelectorAll('.size-option');

    sizeOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove selected class from all size options
            sizeOptions.forEach(o => o.classList.remove('selected'));

            // Add selected class to clicked option
            this.classList.add('selected');

            // Get selected size
            const selectedSize = this.getAttribute('data-size');
            console.log('Selected size:', selectedSize);
        });
    });

    // Size guide link
    const sizeGuideLink = document.querySelector('.size-guide-link');

    if (sizeGuideLink) {
        sizeGuideLink.addEventListener('click', function(e) {
            e.preventDefault();

            // Create modal for size guide
            const modal = document.createElement('div');
            modal.classList.add('size-guide-modal');

            // Create modal content
            modal.innerHTML = `
                <div class="size-guide-content">
                    <div class="size-guide-header">
                        <h3>Size Guide</h3>
                        <button class="size-guide-close"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="size-guide-body">
                        <p>Please refer to the size chart below to find your perfect fit.</p>
                        <table class="size-chart">
                            <tr>
                                <th>US Size</th>
                                <th>EU Size</th>
                                <th>UK Size</th>
                                <th>Foot Length (inches)</th>
                                <th>Foot Length (cm)</th>
                            </tr>
                            <tr>
                                <td>7</td>
                                <td>40</td>
                                <td>6.5</td>
                                <td>9.6"</td>
                                <td>24.4 cm</td>
                            </tr>
                            <tr>
                                <td>8</td>
                                <td>41</td>
                                <td>7.5</td>
                                <td>9.9"</td>
                                <td>25.1 cm</td>
                            </tr>
                            <tr>
                                <td>9</td>
                                <td>42</td>
                                <td>8.5</td>
                                <td>10.2"</td>
                                <td>25.9 cm</td>
                            </tr>
                            <tr>
                                <td>10</td>
                                <td>43</td>
                                <td>9.5</td>
                                <td>10.5"</td>
                                <td>26.7 cm</td>
                            </tr>
                            <tr>
                                <td>11</td>
                                <td>44</td>
                                <td>10.5</td>
                                <td>10.8"</td>
                                <td>27.5 cm</td>
                            </tr>
                            <tr>
                                <td>12</td>
                                <td>45</td>
                                <td>11.5</td>
                                <td>11.2"</td>
                                <td>28.4 cm</td>
                            </tr>
                        </table>
                        <div class="measuring-tips">
                            <h4>How to Measure</h4>
                            <p>For the most accurate sizing, measure your foot as follows:</p>
                            <ol>
                                <li>Stand on a piece of paper with your heel against a wall.</li>
                                <li>Mark the longest part of your foot on the paper.</li>
                                <li>Measure the distance from the wall to the mark.</li>
                                <li>Use this measurement to find your size in the chart above.</li>
                            </ol>
                            <p><strong>Pro Tip:</strong> If you're between sizes, we recommend sizing up for a more comfortable fit.</p>
                        </div>
                    </div>
                </div>
            `;

            // Style the modal
            modal.style.position = 'fixed';
            modal.style.top = '0';
            modal.style.left = '0';
            modal.style.width = '100%';
            modal.style.height = '100%';
            modal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            modal.style.display = 'flex';
            modal.style.justifyContent = 'center';
            modal.style.alignItems = 'center';
            modal.style.zIndex = '9999';

            // Add modal to body
            document.body.appendChild(modal);

            // Style modal content
            const content = modal.querySelector('.size-guide-content');
            content.style.backgroundColor = 'white';
            content.style.borderRadius = '8px';
            content.style.maxWidth = '800px';
            content.style.width = '90%';
            content.style.maxHeight = '90vh';
            content.style.overflowY = 'auto';
            content.style.position = 'relative';

            // Style header
            const header = modal.querySelector('.size-guide-header');
            header.style.padding = '1.5rem';
            header.style.borderBottom = '1px solid #eee';
            header.style.display = 'flex';
            header.style.justifyContent = 'space-between';
            header.style.alignItems = 'center';

            // Style close button
            const closeBtn = modal.querySelector('.size-guide-close');
            closeBtn.style.background = 'none';
            closeBtn.style.border = 'none';
            closeBtn.style.fontSize = '1.25rem';
            closeBtn.style.cursor = 'pointer';
            closeBtn.style.color = '#666';

            // Style body
            const body = modal.querySelector('.size-guide-body');
            body.style.padding = '1.5rem';

            // Style table
            const table = modal.querySelector('.size-chart');
            table.style.width = '100%';
            table.style.borderCollapse = 'collapse';
            table.style.marginBottom = '1.5rem';

            // Style table cells
            const cells = modal.querySelectorAll('.size-chart th, .size-chart td');
            cells.forEach(cell => {
                cell.style.padding = '0.75rem';
                cell.style.border = '1px solid #ddd';
                cell.style.textAlign = 'center';
            });

            // Style table headers
            const headers = modal.querySelectorAll('.size-chart th');
            headers.forEach(th => {
                th.style.backgroundColor = '#f8f8f8';
                th.style.fontWeight = 'bold';
            });

            // Style measuring tips
            const tips = modal.querySelector('.measuring-tips');
            tips.style.backgroundColor = '#f8f8f8';
            tips.style.padding = '1.25rem';
            tips.style.borderRadius = '4px';

            // Add close functionality
            closeBtn.addEventListener('click', function() {
                document.body.removeChild(modal);
            });

            // Close on click outside content
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    document.body.removeChild(modal);
                }
            });
        });
    }
}

// 初始化产品操作
function initProductActions() {
    // Add to Cart button
    const addToCartBtn = document.querySelector('.btn-add-to-cart');

    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', function() {
            // Get product details
            const productName = document.querySelector('.product-info h1').textContent;
            const quantity = parseInt(document.querySelector('.quantity-input').value);

            // Get selected options
            const selectedColor = document.querySelector('.color-option.selected')?.getAttribute('data-color') || 'default';
            const selectedSize = document.querySelector('.size-option.selected')?.getAttribute('data-size') || 'default';

            // Mock adding product to cart
            console.log('Adding to cart:', {
                name: productName,
                quantity: quantity,
                color: selectedColor,
                size: selectedSize
            });

            // Show add to cart animation/notification
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fas fa-check"></i> Added to Cart';
            this.style.backgroundColor = 'var(--secondary-color)';

            // Update cart count in header
            updateCartCount(quantity);

            // Show notification
            showNotification(`${productName} added to cart!`);

            // Reset button after delay
            setTimeout(() => {
                this.innerHTML = originalText;
                this.style.backgroundColor = '';
            }, 2000);
        });
    }

    // Buy Now button
    const buyNowBtn = document.querySelector('.btn-buy-now');

    if (buyNowBtn) {
        buyNowBtn.addEventListener('click', function() {
            // Same as Add to Cart, but redirect to checkout
            addToCartBtn.click();

            // For demo, just show a notification
            setTimeout(() => {
                showNotification('Proceeding to checkout...', 'info');
            }, 500);
        });
    }

    // Wishlist button
    const wishlistBtn = document.querySelector('.btn-wishlist');

    if (wishlistBtn) {
        wishlistBtn.addEventListener('click', function() {
            this.classList.toggle('active');

            if (this.classList.contains('active')) {
                this.innerHTML = '<i class="fas fa-heart"></i>';
                showNotification('Added to your wishlist!');
            } else {
                this.innerHTML = '<i class="far fa-heart"></i>';
                showNotification('Removed from your wishlist!');
            }
        });
    }
}

// 初始化审核功能
function initReviewFeatures() {
    // Review filter
    const ratingFilter = document.querySelector('.rating-filter');

    if (ratingFilter) {
        ratingFilter.addEventListener('change', function() {
            const selectedRating = this.value;
            const reviewItems = document.querySelectorAll('.review-item');

            reviewItems.forEach(item => {
                const starsCount = item.querySelector('.review-rating').querySelectorAll('.fas.fa-star').length;

                if (selectedRating === 'all' || parseInt(selectedRating) === starsCount) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }

    // Review sort
    const reviewSort = document.querySelector('.review-sort');

    if (reviewSort) {
        reviewSort.addEventListener('change', function() {
            const sortValue = this.value;
            const reviewsList = document.querySelector('.reviews-list');
            const reviewItems = Array.from(document.querySelectorAll('.review-item'));

            switch (sortValue) {
                case 'newest':
                    // Sort by date (newest first) - assuming date format like "Month DD, YYYY"
                    reviewItems.sort((a, b) => {
                        const dateA = new Date(a.querySelector('.review-date').textContent);
                        const dateB = new Date(b.querySelector('.review-date').textContent);
                        return dateB - dateA;
                    });
                    break;
                case 'oldest':
                    // Sort by date (oldest first)
                    reviewItems.sort((a, b) => {
                        const dateA = new Date(a.querySelector('.review-date').textContent);
                        const dateB = new Date(b.querySelector('.review-date').textContent);
                        return dateA - dateB;
                    });
                    break;
                case 'highest':
                    // Sort by rating (highest first)
                    reviewItems.sort((a, b) => {
                        const ratingA = a.querySelector('.review-rating').querySelectorAll('.fas.fa-star').length;
                        const ratingB = b.querySelector('.review-rating').querySelectorAll('.fas.fa-star').length;
                        return ratingB - ratingA;
                    });
                    break;
                case 'lowest':
                    // Sort by rating (lowest first)
                    reviewItems.sort((a, b) => {
                        const ratingA = a.querySelector('.review-rating').querySelectorAll('.fas.fa-star').length;
                        const ratingB = b.querySelector('.review-rating').querySelectorAll('.fas.fa-star').length;
                        return ratingA - ratingB;
                    });
                    break;
            }

            // Reorder items
            reviewItems.forEach(item => {
                reviewsList.appendChild(item);
            });
        });
    }

    // Review pagination
    const paginationBtns = document.querySelectorAll('.pagination-btn');

    paginationBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.classList.contains('active') || this.classList.contains('next')) return;

            // Remove active class from all buttons
            paginationBtns.forEach(b => b.classList.remove('active'));

            // Add active class to clicked button
            this.classList.add('active');

            // In a real app, this would load the next page of reviews
            // For demo, we'll just show a notification
            showNotification('Loading more reviews...', 'info');
        });
    });

    // Write review button
    const writeReviewBtn = document.querySelector('.btn-write-review');

    if (writeReviewBtn) {
        writeReviewBtn.addEventListener('click', function() {
            // In a real app, this would open a review form
            // For demo, we'll just show a notification
            showNotification('Review form would open here!', 'info');
        });
    }

    // Helpful buttons
    const helpfulBtns = document.querySelectorAll('.helpful-btn');

    helpfulBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Extract current count
            const countText = this.textContent.match(/\((\d+)\)/);
            if (countText && countText[1]) {
                const currentCount = parseInt(countText[1]);
                // Update count text (increment by 1)
                this.textContent = this.textContent.replace(/\(\d+\)/, `(${currentCount + 1})`);

                // Add a visual indication that the button was clicked
                this.style.backgroundColor = 'var(--light-gray)';
                this.style.color = 'var(--primary-color)';
                this.style.fontWeight = 'bold';

                // Disable both buttons in this review to prevent multiple votes
                const reviewItem = this.closest('.review-item');
                reviewItem.querySelectorAll('.helpful-btn').forEach(b => {
                    b.disabled = true;
                    b.style.cursor = 'default';
                });

                // Show notification
                showNotification('Thanks for your feedback!');
            }
        });
    });

    // Review images (for modal view)
    const reviewImages = document.querySelectorAll('.review-images img');

    reviewImages.forEach(img => {
        img.addEventListener('click', function() {
            // Create modal for image
            const modal = document.createElement('div');
            modal.classList.add('image-modal');

            // Create image container
            const imgContainer = document.createElement('div');
            imgContainer.classList.add('modal-image-container');

            // Create enlarged image
            const enlargedImg = document.createElement('img');
            enlargedImg.src = this.src;
            enlargedImg.alt = this.alt;

            // Create close button
            const closeBtn = document.createElement('button');
            closeBtn.classList.add('modal-close');
            closeBtn.innerHTML = '<i class="fas fa-times"></i>';

            // Append elements
            imgContainer.appendChild(enlargedImg);
            modal.appendChild(imgContainer);
            modal.appendChild(closeBtn);
            document.body.appendChild(modal);

            // Style modal
            modal.style.position = 'fixed';
            modal.style.top = '0';
            modal.style.left = '0';
            modal.style.width = '100%';
            modal.style.height = '100%';
            modal.style.backgroundColor = 'rgba(0,0,0,0.9)';
            modal.style.display = 'flex';
            modal.style.justifyContent = 'center';
            modal.style.alignItems = 'center';
            modal.style.zIndex = '9999';

            // Style image container
            imgContainer.style.position = 'relative';
            imgContainer.style.maxWidth = '90%';
            imgContainer.style.maxHeight = '90%';

            // Style image
            enlargedImg.style.maxWidth = '100%';
            enlargedImg.style.maxHeight = '90vh';
            enlargedImg.style.display = 'block';
            enlargedImg.style.boxShadow = '0 5px 30px rgba(0,0,0,0.3)';

            // Style close button
            closeBtn.style.position = 'absolute';
            closeBtn.style.top = '20px';
            closeBtn.style.right = '20px';
            closeBtn.style.background = 'none';
            closeBtn.style.border = 'none';
            closeBtn.style.color = 'white';
            closeBtn.style.fontSize = '2rem';
            closeBtn.style.cursor = 'pointer';

            // Add close functionality
            closeBtn.addEventListener('click', () => {
                document.body.removeChild(modal);
            });

            // Close on click outside image
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    document.body.removeChild(modal);
                }
            });
        });
    });
}

// 更新购物车计数徽章
function updateCartCount(quantity) {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        const currentCount = parseInt(cartCount.textContent || '0');
        cartCount.textContent = currentCount + quantity;

        // Add a brief animation effect
        cartCount.style.transform = 'scale(1.5)';
        setTimeout(() => {
            cartCount.style.transform = 'scale(1)';
        }, 300);
    }
}

// 显示通知
function showNotification(message, type = 'success') {
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

    // Set icon based on notification type
    let icon = 'check-circle';
    let bgColor = 'var(--primary-color)';

    switch (type) {
        case 'success':
            icon = 'check-circle';
            bgColor = 'var(--primary-color)';
            break;
        case 'error':
            icon = 'exclamation-circle';
            bgColor = 'var(--danger-color)';
            break;
        case 'info':
            icon = 'info-circle';
            bgColor = 'var(--accent-color)';
            break;
    }

    notification.innerHTML = `<i class="fas fa-${icon}"></i> ${message}`;

    // Style notification
    notification.style.backgroundColor = bgColor;
    notification.style.color = 'white';
    notification.style.padding = '12px 20px';
    notification.style.borderRadius = '4px';
    notification.style.marginBottom = '10px';
    notification.style.boxShadow = '0 3px 10px rgba(0,0,0,0.15)';
    notification.style.display = 'flex';
    notification.style.alignItems = 'center';
    notification.style.gap = '10px';
    notification.style.transform = 'translateX(120%)';
    notification.style.transition = 'transform 0.3s ease';

    // Add notification to container
    notificationContainer.appendChild(notification);

    // Animate notification
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);

    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(120%)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}
