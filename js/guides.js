document.addEventListener('DOMContentLoaded', function() {
    // 初始化所有引导页功能
    initializeGuidesPage();
});

function initializeGuidesPage() {
    // 1. 初始化类别过滤器
    loadGuideCategories();

    // 2. 初始化经验等级过滤器
    initExperienceFilters();

    // 3. 初始化季节过滤器
    initSeasonFilters();

    // 4. 初始化搜索功能
    initSearchFunctionality();

    // 5. 初始化排序
    initSorting();

    // 6. 初始化分页（模拟功能）
    initPagination();

    // 7. 初始化重置过滤器按钮
    initResetFilters();
}

// 追踪活动过滤器
const activeFilters = {
    category: 'all',
    experience: [],
    season: []
};




// 类别过滤功能
function initCategoryFilters() {
    const categoryLinks = document.querySelectorAll('.category-list li a');

    categoryLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            // 从所有链接中删除活动类
            categoryLinks.forEach(catLink => {
                catLink.parentElement.classList.remove('active');
            });

            // 为点击的链接添加 active 类
            this.parentElement.classList.add('active');

            // 更新活动过滤器
            activeFilters.category = this.getAttribute('data-category');

            // 应用过滤器
            applyFilters();
        });
    });
}


// 精选文章渲染
function renderFeaturedGuides(activityCategories) {
    const featuredContainer = document.getElementById('featured-guides');
    if (!featuredContainer) return;
  
    // 只获取第一个被标记为 is_featured 的文章
    const featuredItem = activityCategories.find(
      item => item["guide-article"]?.is_featured
    );
  
    if (!featuredItem) return;
  
    const article = featuredItem["guide-article"];
    const title = article.title;
    const excerpt = article.content?.sections?.[0]?.body || '';
    const imageUrl = article.content?.img || '';
    const imageAlt = title;

  
    // 填充已有的 h3 和 p.guide-excerpt
    const titleElement = featuredContainer.querySelector('h3');
    const excerptElement = featuredContainer.querySelector('.guide-excerpt');
  
    if (titleElement) titleElement.textContent = title;
    if (excerptElement) excerptElement.textContent = excerpt;

    // 设置图片
    const imageElement = featuredContainer.querySelector('.featured-guide-image img');
    if (imageElement) {
        imageElement.src = imageUrl;
        imageElement.alt = imageAlt;
    }

}



// 渲染普通文章




// 美化分类名称
function slugify(name) {
    return name.trim().toLowerCase().replace(/\s+/g, '-'); // "Gear and Equipment" → "gear-and-equipment"
}


// 从后端获取分类并渲染 HTML
async function loadGuideCategories() {
    const categoryList = document.querySelector('.category-list');
    if (!categoryList) return;

    categoryList.innerHTML = `
        <li class="active"><a href="#" data-category="all">All Guides</a></li>
    `;

    try {
        const response = await fetch('/.netlify/functions/fetch-guides-categories');
        const data = await response.json();
        console.log(data)
        const categories = data.categoryNames || [];

        categories.forEach(category => {
            const dataSlug = slugify(category);  // 用作 data-category
            const label = category;              // 原样用于显示
            const li = document.createElement('li');
            li.innerHTML = `<a href="#" data-category="${dataSlug}">${label}</a>`;
            categoryList.appendChild(li);
        });

        initCategoryFilters();

        // 渲染精选文章
        renderFeaturedGuides(data.activityCategories);

    } catch (error) {
        console.error('Error loading categories:', error);
    }
}



// 经验级别过滤功能
function initExperienceFilters() {
    const experienceCheckboxes = document.querySelectorAll('.filter-option input[type="checkbox"][value^="beginner"], .filter-option input[type="checkbox"][value^="intermediate"], .filter-option input[type="checkbox"][value^="advanced"], .filter-option input[type="checkbox"][value^="expert"]');

    experienceCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            // Update active filters
            activeFilters.experience = Array.from(experienceCheckboxes)
                .filter(cb => cb.checked)
                .map(cb => cb.value);

            // Apply filters
            applyFilters();
        });
    });
}




// 季节过滤功能
function initSeasonFilters() {
    const seasonCheckboxes = document.querySelectorAll('.filter-option input[type="checkbox"][value^="spring"], .filter-option input[type="checkbox"][value^="summer"], .filter-option input[type="checkbox"][value^="fall"], .filter-option input[type="checkbox"][value^="winter"], .filter-option input[type="checkbox"][value^="all-seasons"]');

    seasonCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            // Update active filters
            activeFilters.season = Array.from(seasonCheckboxes)
                .filter(cb => cb.checked)
                .map(cb => cb.value);

            // Apply filters
            applyFilters();
        });
    });
}

// 搜索功能
function initSearchFunctionality() {
    const searchInput = document.getElementById('guides-search');
    const searchBtn = document.querySelector('.search-btn');

    // Search when button is clicked
    searchBtn.addEventListener('click', function() {
        performSearch(searchInput.value.trim().toLowerCase());
    });

    // Search when Enter key is pressed
    searchInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            performSearch(this.value.trim().toLowerCase());
        }
    });
}

function performSearch(query) {
    const guideCards = document.querySelectorAll('.guide-card');
    let matchFound = false;

    guideCards.forEach(card => {
        const title = card.querySelector('h4').textContent.toLowerCase();
        const description = card.querySelector('p').textContent.toLowerCase();
        const category = card.querySelector('.guide-category').textContent.toLowerCase();

        if (title.includes(query) || description.includes(query) || category.includes(query)) {
            card.setAttribute('data-search-match', 'true');
            matchFound = true;
        } else {
            card.setAttribute('data-search-match', 'false');
        }
    });

    // Apply filters (including search results)
    applyFilters();

    // Show/hide no results message
    toggleNoResultsMessage(!matchFound && query !== '');
}

// 排序功能
function initSorting() {
    const sortSelect = document.getElementById('sort-guides');

    sortSelect.addEventListener('change', function() {
        const sortValue = this.value;
        const guidesList = document.getElementById('guides-list');
        const guideCards = Array.from(guidesList.querySelectorAll('.guide-card'));

        guideCards.sort((a, b) => {
            const titleA = a.querySelector('h4').textContent;
            const titleB = b.querySelector('h4').textContent;
            const dateA = new Date(a.querySelector('.guide-meta span:last-child').textContent.replace('far fa-calendar-alt', '').trim());
            const dateB = new Date(b.querySelector('.guide-meta span:last-child').textContent.replace('far fa-calendar-alt', '').trim());

            switch(sortValue) {
                case 'newest':
                    return dateB - dateA;
                case 'popular':
                    // This is a mock implementation - in a real app you'd sort by actual popularity metrics
                    return Math.random() - 0.5;
                case 'az':
                    return titleA.localeCompare(titleB);
                case 'za':
                    return titleB.localeCompare(titleA);
                default:
                    return 0;
            }
        });

        // Remove existing cards
        guideCards.forEach(card => card.remove());

        // Append sorted cards
        guideCards.forEach(card => guidesList.appendChild(card));

        // Apply filters
        applyFilters();
    });
}

// 应用所有活动过滤器
function applyFilters() {
    const guideCards = document.querySelectorAll('.guide-card');
    let visibleCount = 0;

    guideCards.forEach(card => {
        // 获取卡牌属性
        const cardCategory = card.getAttribute('data-category');
        const cardExperience = card.getAttribute('data-level');
        const cardSeasons = card.getAttribute('data-season')?.split(' ') || [];
        const searchMatch = card.getAttribute('data-search-match') !== 'false';

        // 检查卡是否与所有活动过滤器匹配
        const categoryMatch = activeFilters.category === 'all' || activeFilters.category === cardCategory;

        const experienceMatch = activeFilters.experience.length === 0 ||
                               activeFilters.experience.includes(cardExperience);

        const seasonMatch = activeFilters.season.length === 0 ||
                           cardSeasons.some(season => activeFilters.season.includes(season)) ||
                           (cardSeasons.includes('all-seasons') && activeFilters.season.length > 0);

        // 根据过滤器匹配显示/隐藏卡片
        if (categoryMatch && experienceMatch && seasonMatch && searchMatch) {
            card.style.display = 'flex';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });

    // 显示/隐藏无结果消息
    toggleNoResultsMessage(visibleCount === 0);
}

// 切换“无结果”消息
function toggleNoResultsMessage(show) {
    const noResultsElement = document.querySelector('.no-results');
    if (noResultsElement) {
        noResultsElement.style.display = show ? 'block' : 'none';
    }
}

// 重置所有过滤器
function initResetFilters() {
    const resetButton = document.getElementById('reset-filters');
    if (resetButton) {
        resetButton.addEventListener('click', function() {
            // Reset category
            const allCategoryLink = document.querySelector('.category-list li a[data-category="all"]');
            if (allCategoryLink) {
                allCategoryLink.click();
            }

            // Reset checkboxes
            const checkboxes = document.querySelectorAll('.filter-option input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = false;
            });

            // Reset search
            const searchInput = document.getElementById('guides-search');
            if (searchInput) {
                searchInput.value = '';
            }

            // Reset active filters
            activeFilters.category = 'all';
            activeFilters.experience = [];
            activeFilters.season = [];

            // Reset search match attributes
            const guideCards = document.querySelectorAll('.guide-card');
            guideCards.forEach(card => {
                card.setAttribute('data-search-match', 'true');
            });

            // Apply reset filters
            applyFilters();
        });
    }
}

// 模拟分页（用于演示）
function initPagination() {
    const paginationLinks = document.querySelectorAll('.guides-pagination a');

    paginationLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            // Remove active class from all links
            paginationLinks.forEach(pLink => {
                pLink.classList.remove('active');
            });

            // Add active class to clicked link if it's not the "Next" button
            if (!this.classList.contains('next-page')) {
                this.classList.add('active');
            }

            // Scroll to top of guides list
            document.querySelector('.guides-header').scrollIntoView({ behavior: 'smooth' });

            // In a real implementation, you would load new content here
            showLoadingAnimation();
        });
    });
}

// 切换页面时显示简短的加载动画（模拟功能）
function showLoadingAnimation() {
    const guidesList = document.getElementById('guides-list');

    // Store original opacity
    const originalOpacity = guidesList.style.opacity;

    // Add transition effect
    guidesList.style.transition = 'opacity 0.3s ease';
    guidesList.style.opacity = '0.5';

    // After a short delay, restore original opacity
    setTimeout(() => {
        guidesList.style.opacity = originalOpacity || '1';

        // Remove transition after animation completes
        setTimeout(() => {
            guidesList.style.transition = '';
        }, 300);
    }, 500);
}

// 在滚动到视图时为引导卡添加动画
function animateOnScroll() {
    const elements = document.querySelectorAll('.guide-card, .expert-card, .resource-card');

    elements.forEach(element => {
        // Check if the element is already animated
        if (element.classList.contains('animated')) return;

        const elementPosition = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;

        if (elementPosition < windowHeight - 50) {
            element.classList.add('animated');
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }
    });
}

// 设置动画元素的初始样式并初始化滚动动画
document.querySelectorAll('.guide-card, .expert-card, .resource-card').forEach(element => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
});

// 添加滚动事件监听器
window.addEventListener('scroll', animateOnScroll);

// 页面加载时运行一次
window.addEventListener('load', animateOnScroll);
