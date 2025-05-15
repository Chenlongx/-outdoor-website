const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');
const navActions = document.querySelector('.nav-actions');

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    initMobileMenu();
    // 倒计时器
    startCountdown();

    initCategoryTabs();
    initFaqToggle();
    initTestimonialSlider();
    initStickyHeader();
    initAnimations();
});

// 移动菜单切换
function initMobileMenu() {
    if (!mobileMenuBtn) return;

    mobileMenuBtn.addEventListener('click', () => {
        // Create a mobile menu if it doesn't exist
        if (!document.querySelector('.mobile-menu')) {
            // Create mobile menu container
            const mobileMenu = document.createElement('div');
            mobileMenu.classList.add('mobile-menu');

            // Clone navigation links
            const navLinksClone = navLinks.cloneNode(true);

            // Create a close button
            const closeBtn = document.createElement('div');
            closeBtn.classList.add('close-btn');
            closeBtn.innerHTML = '<i class="fas fa-times"></i>';
            closeBtn.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                document.body.style.overflow = 'auto';
            });

            // Append elements to mobile menu
            mobileMenu.appendChild(closeBtn);
            mobileMenu.appendChild(navLinksClone);

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

        // Toggle the mobile menu
        const mobileMenu = document.querySelector('.mobile-menu');
        mobileMenu.classList.toggle('active');

        // Set styles for active state
        if (mobileMenu.classList.contains('active')) {
            mobileMenu.style.transform = 'translateX(0)';
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        } else {
            mobileMenu.style.transform = 'translateX(-100%)';
            document.body.style.overflow = 'auto';
        }
    });
}

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

// 渲染活动卡片
function renderActivityCards(activityCategories) {
    const grid = document.querySelector('.activity-grid');
    grid.innerHTML = ''; // 清空旧卡片
  
    activityCategories.forEach(item => {
      const activity = item.activitiespage;
      const category = item.activitiespage_categories?.name?.toLowerCase() || 'unknown';
  
      const description = activity.description;
      const title = description?.title || activity.name;
      const duration = description?.duration || activity.duration;
      const difficulty = description?.difficulty || 'Unspecified';
      const start = activity.start_time?.split('T')[0] || '';
      const end = activity.end_time?.split('T')[0] || '';
  
      // 图片处理（支持对象或数组）
      let imageHtml = '';
      let images = [];
  
      if (Array.isArray(activity.content_images)) {
        images = activity.content_images;
      } else if (activity.content_images && typeof activity.content_images === 'object') {
        images = [activity.content_images];
      }
  
      images.forEach(img => {
        if (img?.url) {
          imageHtml += `<img src="${img.url}" alt="${img.alt || ''}">`;
        }
      });
  
      const card = document.createElement('div');
      card.className = 'activity-card';
      card.dataset.category = category;
  
      card.innerHTML = `
        <div class="activity-image">${imageHtml}</div>
        <div class="activity-info">
          <h3>${title}</h3>
          <p>${description?.highlights?.[0] || 'Join this outdoor experience!'}</p>
          <div class="activity-meta">
            <span><i class="fas fa-calendar"></i> ${start} – ${end}</span>
            <span><i class="fas fa-clock"></i> ${duration}</span>
          </div>
          <a href="activity-detail.html?id=${item.activity_id}" class="btn-secondary">Learn More</a>
        </div>
      `;
  
      grid.appendChild(card);
    });
  }


// 类别选项卡过滤
async function initCategoryTabs() {
    const categoryTabsContainer = document.querySelector('.category-tabs');
    // const activityCards = document.querySelectorAll('.activity-card');

    // if (!categoryTabsContainer || !activityCards.length) {
    //     console.warn('Category tabs container or activity cards not found');
    //     return;
    // }

    try {
        // 获取分类数据
        const response = await fetch('/.netlify/functions/fetch-activity-categories');
        if (!response.ok) {
            throw new Error('Failed to fetch category data');
        }

        const data = await response.json();

        console.log("获取到的data数据：", data)
        renderActivityCards(data.activityCategories);
        // activitiespage_categories，name，description.title，description.duration，start_time, end_time

        // 提取分类数组（含 name 和 slug）
        const categoryNames = Array.isArray(data.categoryNames) ? data.categoryNames : [];

        // 清空现有分类按钮
        categoryTabsContainer.innerHTML = '';

        // 添加 “All Activities” 按钮
        const allButton = document.createElement('button');
        allButton.className = 'category-tab active';
        allButton.dataset.category = 'all';
        allButton.textContent = 'All Activities';
        categoryTabsContainer.appendChild(allButton);

        // 动态添加每个分类按钮
        categoryNames.forEach(name => {
            const button = document.createElement('button');
            button.className = 'category-tab';
            button.dataset.category = name.toLowerCase(); // 用作过滤匹配（slug）
            button.textContent = name; // 显示人类可读名称
            categoryTabsContainer.appendChild(button);
        });

        // 添加点击事件
        const categoryTabs = categoryTabsContainer.querySelectorAll('.category-tab');
        categoryTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                categoryTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
        
                const category = tab.dataset.category;
        
                // ⬇️ 关键：每次点击时动态重新获取卡片元素
                const activityCards = document.querySelectorAll('.activity-card');
        
                activityCards.forEach(card => {
                    const cardCategories = card.dataset.category?.split(' ') || [];
                    card.style.display = (category === 'all' || cardCategories.includes(category)) ? 'block' : 'none';
                });
        
                setTimeout(() => {
                    activityCards.forEach(card => {
                        if (card.style.display === 'block') {
                            card.classList.add('animate');
                        } else {
                            card.classList.remove('animate');
                        }
                    });
                }, 50);
            });
        });

    } catch (error) {
        console.error('Error loading category tabs:', error);
        // 如果出错了，保留静态 HTML 按钮行为
        const fallbackTabs = categoryTabsContainer.querySelectorAll('.category-tab');
        fallbackTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                fallbackTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                const category = tab.dataset.category;
                activityCards.forEach(card => {
                    const cardCategories = card.dataset.category?.split(' ') || [];
                    card.style.display = category === 'all' || cardCategories.includes(category) ? 'block' : 'none';
                });

                setTimeout(() => {
                    activityCards.forEach(card => {
                        if (card.style.display === 'block') {
                            card.classList.add('animate');
                        } else {
                            card.classList.remove('animate');
                        }
                    });
                }, 50);
            });
        });
    }
}


// 常见问题解答手风琴（RFQ）
function initFaqToggle() {
    const faqItems = document.querySelectorAll('.faq-item');

    if (!faqItems.length) return;

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');

        question.addEventListener('click', () => {
            // Close other open items
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });

            // Toggle current item
            item.classList.toggle('active');
        });
    });

    // Open the first FAQ item by default
    if (faqItems.length > 0) {
        faqItems[0].classList.add('active');
    }
}

// 推荐滑块
function initTestimonialSlider() {
    const wrapper = document.querySelector('.testimonial-wrapper');
    const slider  = document.querySelector('.testimonial-slider');
    const slides  = slider.querySelectorAll('.testimonial-slide');
    const dots    = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.testimonial-prev');
    const nextBtn = document.querySelector('.testimonial-next');
  
    if (!slider || slides.length === 0) return;
  
    const totalSlides = slides.length;
    let currentSlide = 0;
  
    // —— ① 动态设置轨道和每个 slide 的宽度 ——
    slider.style.width = `${totalSlides * 100}%`;
    slides.forEach(slide => {
      slide.style.flex = `0 0 ${100 / totalSlides}%`;
    });
  
    // —— ② 切换函数：根据索引计算 translateX 百分比 ——
    function showSlide(index) {
      dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
      const shift = index * (100 / totalSlides);
      slider.style.transform = `translateX(-${shift}%)`;
      currentSlide = index;
    }
  
    // 点击小圆点
    dots.forEach((dot, idx) => dot.addEventListener('click', () => showSlide(idx)));
  
    // prev/next 按钮
    prevBtn && prevBtn.addEventListener('click', () => {
      showSlide((currentSlide - 1 + totalSlides) % totalSlides);
    });
    nextBtn && nextBtn.addEventListener('click', () => {
      showSlide((currentSlide + 1) % totalSlides);
    });
  }

// 粘性标题
function initStickyHeader() {
    const header = document.querySelector('header');
    const announcement = document.querySelector('.announcement-bar');

    if (!header || !announcement) return;

    let announcementHeight = announcement.offsetHeight;
    let isSticky = false;
    const threshold = 5;
    let isScrolling;

    // Update height on window resize
    window.addEventListener('resize', () => {
        announcementHeight = announcement.offsetHeight;
    });

    window.addEventListener('scroll', () => {
        window.requestAnimationFrame(() => {
            clearTimeout(isScrolling);
            isScrolling = setTimeout(() => {
                const scrollY = window.scrollY;
                if (scrollY > announcementHeight + threshold && !isSticky) {
                    header.classList.add('sticky');
                    announcement.style.opacity = '0';
                    announcement.style.pointerEvents = 'none';
                    announcement.style.display = 'none';
                    isSticky = true;
                } else if (scrollY < announcementHeight - threshold && isSticky) {
                    header.classList.remove('sticky');
                    announcement.style.opacity = '1';
                    announcement.style.pointerEvents = 'auto';
                    announcement.style.display = 'flex';
                    isSticky = false;
                }
            }, 50);
        });
    }, { passive: true });
}

// 滚动动画
function initAnimations() {
    const animateOnScroll = () => {
        const elements = document.querySelectorAll(
            '.activity-card, .featured-adventure, .featured-adventure-details, .step, .testimonial-content'
        );

        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;

            if (elementPosition < windowHeight - 100) {
                element.classList.add('animated');
                element.style.opacity = '1';
                element.style.transform = element.classList.contains('activity-card')
                    ? 'translateY(0)'
                    : 'none';
            }
        });
    };

    // Set initial styles for animated elements
    document.querySelectorAll('.activity-card, .featured-adventure, .featured-adventure-details, .step, .testimonial-content').forEach(element => {
        element.style.opacity = '0';
        if (element.classList.contains('activity-card')) {
            element.style.transform = 'translateY(30px)';
        }
        element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });

    // Run animation on scroll
    window.addEventListener('scroll', animateOnScroll);

    // Run once on page load
    animateOnScroll();
}

// 时事通讯表格提交
document.addEventListener('submit', function(e) {
    const form = e.target;

    // Check if the form is a newsletter form
    if (form.classList.contains('cta-form') || form.classList.contains('newsletter-form')) {
        e.preventDefault();

        const emailInput = form.querySelector('input[type="email"]');

        if (emailInput && emailInput.value) {
            // Show success message (in a real implementation, you would send this to a server)
            showNotification('Thank you for subscribing to our newsletter!');
            emailInput.value = '';
        } else {
            showNotification('Please enter a valid email address.', 'error');
        }
    }
});

// 通知系统
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
    notification.textContent = message;

    // Style notification
    notification.style.backgroundColor = type === 'success' ? 'var(--primary-color)' : 'var(--danger-color)';
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

