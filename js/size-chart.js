// Size Chart Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize tabs
    initTabs();

    // Initialize unit toggle
    initUnitToggle();

    // Animate on scroll
    initAnimateOnScroll();
});

// Tab functionality
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('active');
            });

            // Add active class to clicked button
            this.classList.add('active');

            // Hide all tab contents
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });

            // Show corresponding tab content
            const targetId = this.getAttribute('data-target');
            const targetContent = document.getElementById(targetId);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
}

// Unit toggle functionality (inches/cm)
function initUnitToggle() {
    const unitButtons = document.querySelectorAll('.unit-btn');

    unitButtons.forEach(button => {
        button.addEventListener('click', function() {
            const parentTable = this.closest('.size-tables');
            if (!parentTable) return;

            // Remove active class from all unit buttons in this table
            parentTable.querySelectorAll('.unit-btn').forEach(btn => {
                btn.classList.remove('active');
            });

            // Add active class to clicked button
            this.classList.add('active');

            // Get the unit type (inches or cm)
            const unitType = this.getAttribute('data-unit');

            // Hide all tables in this container
            parentTable.querySelectorAll('.size-table').forEach(table => {
                table.classList.remove('active');
            });

            // Show the corresponding table
            const targetTables = parentTable.querySelectorAll(`.${unitType}-table`);
            targetTables.forEach(table => {
                table.classList.add('active');
            });
        });
    });
}

// Animate elements on scroll
function initAnimateOnScroll() {
    const animateElements = document.querySelectorAll('.sizing-tips, .tab-content, .measurement-instructions, .size-tables');

    // Set initial styles
    animateElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });

    // Animation function
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

    // Run on scroll
    window.addEventListener('scroll', animateOnScroll);

    // Run once on page load
    setTimeout(animateOnScroll, 100);
}

// Search functionality
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

// Mobile menu functionality
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        // If no mobile menu exists, create one
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

// Countdown functionality
function startCountdown() {
    const countdownElement = document.getElementById('countdown');
    if (!countdownElement) return;

    // Set countdown date (7 days from now)
    const countdownDate = new Date();
    countdownDate.setDate(countdownDate.getDate() + 7);

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

    // Initial call
    updateCountdown();

    // Update every second
    const countdownInterval = setInterval(updateCountdown, 1000);
}

// Start countdown when page loads
startCountdown();
