document.addEventListener('DOMContentLoaded', function() {
    // Initialize all guide page functionality
    initializeGuidesPage();
});

function initializeGuidesPage() {
    // 1. Initialize category filters
    initCategoryFilters();

    // 2. Initialize experience level filters
    initExperienceFilters();

    // 3. Initialize season filters
    initSeasonFilters();

    // 4. Initialize search functionality
    initSearchFunctionality();

    // 5. Initialize sorting
    initSorting();

    // 6. Initialize pagination (mock functionality)
    initPagination();

    // 7. Initialize reset filters button
    initResetFilters();
}

// Track active filters
const activeFilters = {
    category: 'all',
    experience: [],
    season: []
};

// Category filter functionality
function initCategoryFilters() {
    const categoryLinks = document.querySelectorAll('.category-list li a');

    categoryLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            // Remove active class from all links
            categoryLinks.forEach(catLink => {
                catLink.parentElement.classList.remove('active');
            });

            // Add active class to clicked link
            this.parentElement.classList.add('active');

            // Update active filter
            activeFilters.category = this.getAttribute('data-category');

            // Apply filters
            applyFilters();
        });
    });
}

// Experience level filter functionality
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

// Season filter functionality
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

// Search functionality
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

// Sorting functionality
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

// Apply all active filters
function applyFilters() {
    const guideCards = document.querySelectorAll('.guide-card');
    let visibleCount = 0;

    guideCards.forEach(card => {
        // Get card attributes
        const cardCategory = card.getAttribute('data-category');
        const cardExperience = card.getAttribute('data-level');
        const cardSeasons = card.getAttribute('data-season')?.split(' ') || [];
        const searchMatch = card.getAttribute('data-search-match') !== 'false';

        // Check if card matches all active filters
        const categoryMatch = activeFilters.category === 'all' || activeFilters.category === cardCategory;

        const experienceMatch = activeFilters.experience.length === 0 ||
                               activeFilters.experience.includes(cardExperience);

        const seasonMatch = activeFilters.season.length === 0 ||
                           cardSeasons.some(season => activeFilters.season.includes(season)) ||
                           (cardSeasons.includes('all-seasons') && activeFilters.season.length > 0);

        // Show/hide card based on filter matches
        if (categoryMatch && experienceMatch && seasonMatch && searchMatch) {
            card.style.display = 'flex';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });

    // Show/hide no results message
    toggleNoResultsMessage(visibleCount === 0);
}

// Toggle "No Results" message
function toggleNoResultsMessage(show) {
    const noResultsElement = document.querySelector('.no-results');
    if (noResultsElement) {
        noResultsElement.style.display = show ? 'block' : 'none';
    }
}

// Reset all filters
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

// Mock pagination (for demonstration)
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

// Show a brief loading animation when changing pages (mock functionality)
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

// Add animation to guide cards when scrolling into view
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

// Set initial styles for animated elements and initialize scroll animation
document.querySelectorAll('.guide-card, .expert-card, .resource-card').forEach(element => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
});

// Add scroll event listener
window.addEventListener('scroll', animateOnScroll);

// Run once on page load
window.addEventListener('load', animateOnScroll);
