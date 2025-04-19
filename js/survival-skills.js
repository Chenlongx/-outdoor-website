document.addEventListener('DOMContentLoaded', function() {
    // 导航栏激活状态
    const navLinks = document.querySelectorAll('nav a');
    const sections = document.querySelectorAll('section');

    // 滚动监听，更新导航栏激活状态
    window.addEventListener('scroll', function() {
        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= (sectionTop - 150)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

    // 展开按钮功能
    const expandButtons = document.querySelectorAll('.expand-btn');

    expandButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const targetContent = document.getElementById(targetId);

            if (targetContent.style.display === 'block') {
                targetContent.style.display = 'none';
                this.textContent = this.textContent.replace('收起', '查看');
            } else {
                targetContent.style.display = 'block';
                this.textContent = this.textContent.replace('查看', '收起');
            }
        });
    });

    // 手风琴功能
    const accordionButtons = document.querySelectorAll('.accordion-btn');

    accordionButtons.forEach(button => {
        button.addEventListener('click', function() {
            const content = this.nextElementSibling;

            // 关闭其他所有已打开的手风琴
            accordionButtons.forEach(btn => {
                if (btn !== this) {
                    btn.nextElementSibling.style.display = 'none';
                }
            });

            // 切换当前手风琴状态
            if (content.style.display === 'block') {
                content.style.display = 'none';
            } else {
                content.style.display = 'block';
            }
        });
    });

    // 回到顶部按钮
    const backToTopButton = document.getElementById('back-to-top');

    // 显示/隐藏回到顶部按钮
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopButton.style.display = 'flex';
        } else {
            backToTopButton.style.display = 'none';
        }
    });

    // 回到顶部按钮点击事件
    backToTopButton.addEventListener('click', function() {
        // 平滑滚动回顶部
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // 平滑滚动到锚点
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerOffset = 80; // 导航栏高度
                const elementPosition = targetElement.offsetTop;
                const offsetPosition = elementPosition - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 添加暗色模式切换功能（可选）
    function createDarkModeToggle() {
        const footer = document.querySelector('footer .container');

        // 创建暗色模式切换按钮
        const darkModeToggle = document.createElement('button');
        darkModeToggle.id = 'dark-mode-toggle';
        darkModeToggle.textContent = 'Switch to dark mode';
        darkModeToggle.style.marginTop = '15px';
        darkModeToggle.style.backgroundColor = '#333';
        darkModeToggle.style.color = 'white';
        darkModeToggle.style.padding = '8px 15px';
        darkModeToggle.style.borderRadius = '4px';
        darkModeToggle.style.border = 'none';
        darkModeToggle.style.cursor = 'pointer';

        // 检查用户偏好
        const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        let darkMode = localStorage.getItem('darkMode') === 'true' || prefersDarkMode;

        // 初始化暗色模式状态
        if (darkMode) {
            document.body.classList.add('dark-mode');
            darkModeToggle.textContent = 'Switch to light mode';
        }

        // 添加点击事件
        darkModeToggle.addEventListener('click', function() {
            darkMode = !darkMode;
            localStorage.setItem('darkMode', darkMode);

            if (darkMode) {
                document.body.classList.add('dark-mode');
                this.textContent = 'Switch to light mode';
            } else {
                document.body.classList.remove('dark-mode');
                this.textContent = 'Switch to dark mode';
            }
        });

        // 添加到页脚
        footer.appendChild(darkModeToggle);

        // 添加暗色模式样式
        const style = document.createElement('style');
        style.textContent = `
            .dark-mode {
                background-color: #1a1a1a;
                color: #f0f0f0;
            }

            .dark-mode .tip-card,
            .dark-mode .shelter,
            .dark-mode .tip-box,
            .dark-mode .resource-card,
            .dark-mode #intro {
                background-color: #2a2a2a;
                color: #f0f0f0;
            }

            .dark-mode h1,
            .dark-mode h2,
            .dark-mode h3,
            .dark-mode h4 {
                color: #f0f0f0;
            }

            .dark-mode .tip-card h3,
            .dark-mode .resource-card h3 {
                color: #4c956c;
            }

            .dark-mode .accordion-content,
            .dark-mode .shelter,
            .dark-mode .hidden-content {
                background-color: #333;
                border-color: #444;
            }

            .dark-mode a {
                color: #6abe45;
            }

            .dark-mode a:hover {
                color: #8cd465;
            }

            .dark-mode .warning {
                background-color: #3a2a1a;
            }
        `;
        document.head.appendChild(style);
    }

    // 创建暗色模式切换按钮
    createDarkModeToggle();
});
