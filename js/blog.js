// 博客页面交互功能
document.addEventListener('DOMContentLoaded', function() {
    // 博客分类过滤功能
    initCategoryFilters();

    // 博客搜索功能
    initBlogSearch();

    // 分页交互
    initPagination();

    // 动画效果
    initAnimations();
});

// 初始化分类过滤器功能
function initCategoryFilters() {
    const filterButtons = document.querySelectorAll('.blog-filter');
    const allPosts = document.querySelectorAll('.post-card, .featured-post');

    if (filterButtons.length) {
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                // 移除所有活动按钮的激活状态
                filterButtons.forEach(btn => btn.classList.remove('active'));

                // 添加当前按钮的激活状态
                this.classList.add('active');

                const category = this.getAttribute('data-category');

                // 如果选择了"全部"分类，显示所有文章
                if (category === 'all') {
                    allPosts.forEach(post => {
                        post.style.display = 'block';
                    });
                } else {
                    // 否则只显示所选分类的文章
                    allPosts.forEach(post => {
                        if (post.getAttribute('data-category') === category) {
                            post.style.display = 'block';
                        } else {
                            post.style.display = 'none';
                        }
                    });
                }

                // 平滑滚动到内容顶部
                const blogContainer = document.querySelector('.blog-container');
                if (blogContainer) {
                    window.scrollTo({
                        top: blogContainer.offsetTop - 100,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
}

// 初始化博客搜索功能
function initBlogSearch() {
    const searchInput = document.querySelector('.blog-search input');
    const searchButton = document.querySelector('.blog-search button');
    const allPosts = document.querySelectorAll('.post-card, .featured-post');

    if (searchInput && searchButton) {
        // 搜索按钮点击事件
        searchButton.addEventListener('click', function() {
            performSearch(searchInput.value);
        });

        // 回车键搜索
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch(searchInput.value);
            }
        });

        // 执行搜索的函数
        function performSearch(query) {
            query = query.toLowerCase().trim();

            if (query === '') {
                // 如果搜索框为空，显示所有文章
                allPosts.forEach(post => {
                    post.style.display = 'block';
                });
                return;
            }

            // 激活"全部"分类按钮
            document.querySelector('.blog-filter[data-category="all"]').click();

            // 搜索文章标题和摘要
            allPosts.forEach(post => {
                const title = post.querySelector('h2, h3').textContent.toLowerCase();
                const excerpt = post.querySelector('.post-excerpt').textContent.toLowerCase();

                if (title.includes(query) || excerpt.includes(query)) {
                    post.style.display = 'block';

                    // 高亮搜索结果
                    highlightText(post.querySelector('h2, h3'), query);
                    highlightText(post.querySelector('.post-excerpt'), query);
                } else {
                    post.style.display = 'none';
                }
            });

            // 滚动到搜索结果
            if (document.querySelector('.post-card[style="display: block;"], .featured-post[style="display: block;"]')) {
                const blogContainer = document.querySelector('.blog-container');
                if (blogContainer) {
                    window.scrollTo({
                        top: blogContainer.offsetTop - 100,
                        behavior: 'smooth'
                    });
                }
            }
        }

        // 高亮搜索文本
        function highlightText(element, query) {
            if (!element) return;

            const originalText = element.textContent;
            const lowerText = originalText.toLowerCase();
            let highlightedText = originalText;

            // 安全地替换文本 (只高亮第一个匹配)
            const index = lowerText.indexOf(query);
            if (index >= 0) {
                const before = originalText.substring(0, index);
                const match = originalText.substring(index, index + query.length);
                const after = originalText.substring(index + query.length);

                highlightedText = before + '<span class="highlight">' + match + '</span>' + after;
                element.innerHTML = highlightedText;

                // 添加高亮样式
                const style = document.createElement('style');
                style.textContent = '.highlight { background-color: #ffeb3b; color: #000; padding: 0 2px; }';
                document.head.appendChild(style);
            }
        }
    }
}

// 初始化分页交互
function initPagination() {
    const paginationLinks = document.querySelectorAll('.pagination-numbers a');
    const prevButton = document.querySelector('.pagination-btn:first-child');
    const nextButton = document.querySelector('.pagination-btn:last-child');

    if (paginationLinks.length) {
        paginationLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();

                // 移除所有活动链接的激活状态
                paginationLinks.forEach(lnk => lnk.classList.remove('active'));

                // 添加当前链接的激活状态
                this.classList.add('active');

                // 启用或禁用上一页/下一页按钮
                updatePaginationButtons();

                // 模拟页面更改 (在真实项目中，这里会加载新的文章)
                simulatePageChange();
            });
        });

        // 上一页按钮点击事件
        if (prevButton) {
            prevButton.addEventListener('click', function() {
                if (this.hasAttribute('disabled')) return;

                const activeLink = document.querySelector('.pagination-numbers a.active');
                if (activeLink && activeLink.previousElementSibling && activeLink.previousElementSibling.tagName === 'A') {
                    activeLink.previousElementSibling.click();
                }
            });
        }

        // 下一页按钮点击事件
        if (nextButton) {
            nextButton.addEventListener('click', function() {
                if (this.hasAttribute('disabled')) return;

                const activeLink = document.querySelector('.pagination-numbers a.active');
                if (activeLink && activeLink.nextElementSibling && activeLink.nextElementSibling.tagName === 'A') {
                    activeLink.nextElementSibling.click();
                }
            });
        }

        // 更新分页按钮状态
        function updatePaginationButtons() {
            const activeLink = document.querySelector('.pagination-numbers a.active');

            if (activeLink) {
                // 如果当前是第一页，禁用"上一页"按钮
                if (!activeLink.previousElementSibling || activeLink.previousElementSibling.tagName !== 'A') {
                    prevButton.setAttribute('disabled', '');
                } else {
                    prevButton.removeAttribute('disabled');
                }

                // 如果当前是最后一页，禁用"下一页"按钮
                if (!activeLink.nextElementSibling || activeLink.nextElementSibling.tagName !== 'A') {
                    nextButton.setAttribute('disabled', '');
                } else {
                    nextButton.removeAttribute('disabled');
                }
            }
        }

        // 模拟页面更改（实际应用中会加载新内容）
        function simulatePageChange() {
            // 滚动到顶部
            window.scrollTo({
                top: document.querySelector('.blog-hero').offsetTop,
                behavior: 'smooth'
            });

            // 实际应用中，这里会替换为AJAX加载新内容
            console.log('页面已更改，实际应用中这里会加载新内容');
        }

        // 初始化分页按钮状态
        updatePaginationButtons();
    }
}

// 初始化动画效果
function initAnimations() {
    // 为博客文章添加淡入效果
    const blogPosts = document.querySelectorAll('.post-card, .featured-post');

    blogPosts.forEach((post, index) => {
        // 设置初始状态
        post.style.opacity = '0';
        post.style.transform = 'translateY(30px)';
        post.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        post.style.transitionDelay = `${index * 100}ms`;

        // 使用Intersection Observer API检测元素何时进入视口
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // 元素进入视口时添加动画
                    post.style.opacity = '1';
                    post.style.transform = 'translateY(0)';

                    // 一旦元素显示，停止观察
                    observer.unobserve(post);
                }
            });
        }, { threshold: 0.1 }); // 当10%的元素可见时触发

        observer.observe(post);
    });

    // 立即显示初始可见的元素
    setTimeout(() => {
        const visibleElements = Array.from(blogPosts).filter(post => {
            const rect = post.getBoundingClientRect();
            return rect.top < window.innerHeight;
        });

        visibleElements.forEach(element => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        });
    }, 100);

    // 为侧边栏部件添加淡入效果
    const sidebarWidgets = document.querySelectorAll('.sidebar-widget');

    sidebarWidgets.forEach((widget, index) => {
        widget.style.opacity = '0';
        widget.style.transform = 'translateX(20px)';
        widget.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        widget.style.transitionDelay = `${index * 100 + 200}ms`;

        setTimeout(() => {
            widget.style.opacity = '1';
            widget.style.transform = 'translateX(0)';
        }, 300);
    });
}

// 初始化共享功能
function initShare() {
    // 这里可以添加社交分享功能
    // 实际项目中会使用社交媒体API
}

// 初始化评论功能（示例）
function initComments() {
    // 这里可以添加评论系统集成
    // 实际项目中会连接到评论API或服务
}
