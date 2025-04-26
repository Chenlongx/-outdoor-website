document.addEventListener('DOMContentLoaded', function() {
    // 初始化标签页
    initTabs();

    // 初始化单元切换
    initUnitToggle();

    // 滚动时动画
    initAnimateOnScroll();
});

// 选项卡功能
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    // 默认选中第一个标签
    if (tabButtons.length > 0) {
        tabButtons[0].classList.add('active'); // 默认选中第一个标签
        const firstTabId = tabButtons[0].getAttribute('data-target');
        const firstTabContent = document.getElementById(firstTabId);
        if (firstTabContent) {
            firstTabContent.classList.add('active');
        }
    }

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 从所有按钮中删除活动类
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('active');
            });

            // 为点击的按钮添加 active 类
            this.classList.add('active');

            // 隐藏所有标签内容
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });

            // 显示相应标签内容
            const targetId = this.getAttribute('data-target');
            const targetContent = document.getElementById(targetId);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
}

// 单位切换功能（英寸/厘米）
function initUnitToggle() {
    const unitButtons = document.querySelectorAll('.unit-btn');

    unitButtons.forEach(button => {
        button.addEventListener('click', function() {
            const parentTable = this.closest('.size-tables');
            if (!parentTable) return;

            // 从此表中的所有单位按钮中删除活动类
            parentTable.querySelectorAll('.unit-btn').forEach(btn => {
                btn.classList.remove('active');
            });

            // 为点击的按钮添加 active 类
            this.classList.add('active');

            // 获取单位类型（英寸或厘米）
            const unitType = this.getAttribute('data-unit');

            // 隐藏此容器中的所有表格
            parentTable.querySelectorAll('.size-table').forEach(table => {
                table.classList.remove('active');
            });

            // 显示相应表格
            const targetTables = parentTable.querySelectorAll(`.${unitType}-table`);
            targetTables.forEach(table => {
                table.classList.add('active');
            });
        });
    });
}

// 滚动时动画元素
function initAnimateOnScroll() {
    const animateElements = document.querySelectorAll('.sizing-tips, .tab-content, .measurement-instructions, .size-tables');

    // 设置初始样式
    animateElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });

    // 动画功能
    function animateOnScroll() {
        animateElements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;

            if (elementPosition < windowHeight - 50) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    }

    // 滚动运行
    window.addEventListener('scroll', animateOnScroll);

    // 页面加载时运行一次
    setTimeout(animateOnScroll, 100);
}

// 搜索功能
const searchTrigger = document.getElementById('header-search');
const searchOverlay = document.querySelector('.search-overlay');
const closeButton = document.getElementById('close-search');

if (searchTrigger) {
    searchTrigger.addEventListener('click', (e) => {
        e.preventDefault();
        searchOverlay.style.opacity = '1';
        searchOverlay.style.display = "inline-flex";
        searchOverlay.style.visibility = 'visible';
    });
}

if (closeButton) {
    closeButton.addEventListener('click', () => {
        searchOverlay.style.opacity = '0';
        searchOverlay.style.visibility = 'hidden';
    });
}

if (searchOverlay) {
    searchOverlay.addEventListener('click', (e) => {
        if (e.target === searchOverlay) {
            searchOverlay.style.opacity = '0';
            searchOverlay.style.visibility = 'hidden';
        }
    });
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && searchOverlay.style.visibility === 'visible') {
        searchOverlay.style.opacity = '0';
        searchOverlay.style.visibility = 'hidden';
    }
});

// 移动菜单功能
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        // 如果不存在移动菜单，请创建一个
        if (!document.querySelector('.mobile-menu')) {
            const mobileMenu = document.createElement('div');
            mobileMenu.classList.add('mobile-menu');

            // Clone navigation links
            const navLinks = document.querySelector('.nav-links');
            const navLinksClone = navLinks.cloneNode(true);

            // Create close button
            const closeBtn = document.createElement('div');
            closeBtn.classList.add('close-btn');
            closeBtn.innerHTML = '<i class="fas fa-times"></i>';
            closeBtn.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                mobileMenu.style.transform = 'translateX(-100%)';
                document.body.style.overflow = 'auto';
            });

            // Append elements
            mobileMenu.appendChild(closeBtn);
            mobileMenu.appendChild(navLinksClone);

            // Clone nav actions
            const navActions = document.querySelector('.nav-actions');
            const actionsContainer = document.createElement('div');
            actionsContainer.classList.add('mobile-actions');
            const navActionsClone = navActions.cloneNode(true);
            actionsContainer.appendChild(navActionsClone);
            mobileMenu.appendChild(actionsContainer);

            // Append mobile menu to body
            document.body.appendChild(mobileMenu);

            // Style mobile menu
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

            // Style nav items
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

        // Toggle mobile menu
        const mobileMenu = document.querySelector('.mobile-menu');
        mobileMenu.classList.toggle('active');

        // Set active state styles
        if (mobileMenu.classList.contains('active')) {
            mobileMenu.style.transform = 'translateX(0)';
            document.body.style.overflow = 'hidden';
        } else {
            mobileMenu.style.transform = 'translateX(-100%)';
            document.body.style.overflow = 'auto';
        }
    });
}

// 倒计时功能
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

// 页面加载时开始倒计时
startCountdown();
