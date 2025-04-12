// Shipping Information Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize tabs for international shipping
    initTabs();

    // Initialize FAQ accordion
    initFaqAccordion();

    // Initialize shipping calculator
    initShippingCalculator();

    // Animate on scroll
    initAnimateOnScroll();
});

// Tab functionality for international shipping
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons and panes
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('active');
            });

            document.querySelectorAll('.tab-pane').forEach(pane => {
                pane.classList.remove('active');
            });

            // Add active class to clicked button
            this.classList.add('active');

            // Show corresponding tab pane
            const targetId = this.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });
}

// FAQ accordion functionality
function initFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');

        question.addEventListener('click', function() {
            // Close all other FAQ items
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });

            // Toggle active class on clicked item
            item.classList.toggle('active');
        });
    });
}

// Shipping calculator functionality
function initShippingCalculator() {
    const calculatorForm = document.getElementById('shipping-calculator');
    const resultsContainer = document.getElementById('calculator-results');

    if (calculatorForm) {
        calculatorForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Get form values
            const country = document.getElementById('country').value;
            const zipCode = document.getElementById('zipcode').value;
            const orderValue = parseFloat(document.getElementById('order-value').value);
            const shippingMethod = document.getElementById('shipping-method').value;

            // Calculate shipping cost and delivery estimate
            const result = calculateShipping(country, zipCode, orderValue, shippingMethod);

            // Update results
            document.getElementById('result-cost').textContent = result.cost;
            document.getElementById('result-delivery').textContent = result.delivery;
            document.getElementById('result-method').textContent = result.method;

            // Show results
            resultsContainer.style.display = 'block';

            // Smooth scroll to results
            resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }
}

// Calculate shipping details based on inputs
function calculateShipping(country, zipCode, orderValue, method) {
    let cost = '$0.00';
    let delivery = '';
    let methodText = '';

    // Method text mapping
    if (method === 'standard') {
        methodText = 'Standard Shipping';
    } else if (method === 'express') {
        methodText = 'Express Shipping';
    } else if (method === 'nextday') {
        methodText = 'Next Day Delivery';
    }

    // Calculate based on country and method
    if (country === 'US') {
        if (method === 'standard') {
            cost = orderValue >= 50 ? 'FREE' : '$5.99';
            delivery = '5-7 business days';
        } else if (method === 'express') {
            cost = '$12.99';
            delivery = '2-3 business days';
        } else if (method === 'nextday') {
            cost = '$24.99';
            delivery = 'Next business day';
        }
    } else if (country === 'CA') {
        if (method === 'standard') {
            cost = orderValue >= 150 ? 'FREE' : '$15.99';
            delivery = '7-10 business days';
        } else if (method === 'express') {
            cost = '$29.99';
            delivery = '3-5 business days';
        } else if (method === 'nextday') {
            cost = 'Not Available';
            delivery = 'Not Available';
        }
    } else if (country === 'UK' || country === 'DE' || country === 'FR') {
        if (method === 'standard') {
            cost = orderValue >= 200 ? 'FREE' : '$19.99';
            delivery = '10-14 business days';
        } else if (method === 'express') {
            cost = '$39.99';
            delivery = '5-7 business days';
        } else if (method === 'nextday') {
            cost = 'Not Available';
            delivery = 'Not Available';
        }
    } else if (country === 'AU') {
        if (method === 'standard') {
            cost = orderValue >= 250 ? 'FREE' : '$24.99';
            delivery = '12-16 business days';
        } else if (method === 'express') {
            cost = '$49.99';
            delivery = '7-9 business days';
        } else if (method === 'nextday') {
            cost = 'Not Available';
            delivery = 'Not Available';
        }
    } else {
        cost = 'Contact Customer Service';
        delivery = 'Varies by location';
    }

    return { cost, delivery, method: methodText };
}

// Animate elements on scroll
function initAnimateOnScroll() {
    const animateElements = document.querySelectorAll('.shipping-card, .info-item, .faq-item, .contact-option');

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

// Search functionality (similar to main script)
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
