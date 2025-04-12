// Global Variables
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');
const navActions = document.querySelector('.nav-actions');

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initMobileMenu();
    initCountdown();
    initCategoryTabs();
    initFaqToggle();
    initTestimonialSlider();
    initStickyHeader();
    initAnimations();
});

// Mobile Menu Toggle
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

// Countdown Timer
function initCountdown() {
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

// Category Tab Filtering
function initCategoryTabs() {
    const categoryTabs = document.querySelectorAll('.category-tab');
    const activityCards = document.querySelectorAll('.activity-card');

    if (!categoryTabs.length || !activityCards.length) return;

    categoryTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            categoryTabs.forEach(t => t.classList.remove('active'));

            // Add active class to clicked tab
            tab.classList.add('active');

            const category = tab.getAttribute('data-category');

            // Show/hide activities based on category
            activityCards.forEach(card => {
                if (category === 'all') {
                    card.style.display = 'block';
                } else {
                    const cardCategories = card.getAttribute('data-category').split(' ');
                    if (cardCategories.includes(category)) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                }
            });

            // Add animation to visible cards
            setTimeout(() => {
                activityCards.forEach(card => {
                    if (card.style.display === 'block') {
                        card.classList.add('animate');
                    }
                });
            }, 50);
        });
    });
}

// FAQ Accordion
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

// Testimonial Slider
function initTestimonialSlider() {
    const testimonialSlider = document.querySelector('.testimonial-slider');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.testimonial-prev');
    const nextBtn = document.querySelector('.testimonial-next');

    if (!testimonialSlider) return;

    // For a real implementation, you would have multiple slides
    // This is a placeholder for future slide functionality
    let currentSlide = 0;
    const totalSlides = dots.length; // Using dot count as stand-in for slide count

    function showSlide(index) {
        // Update dots
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });

        // In a real implementation, you would also slide to the correct testimonial
        currentSlide = index;
    }

    // Event listeners for dots
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showSlide(index);
        });
    });

    // Event listeners for prev/next buttons
    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
            showSlide(currentSlide);
        });

        nextBtn.addEventListener('click', () => {
            currentSlide = (currentSlide + 1) % totalSlides;
            showSlide(currentSlide);
        });
    }
}

// Sticky Header
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

// Scroll Animations
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

// Newsletter Form Submission
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

// Notification System
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

// Chat Widget Functionality
document.addEventListener('click', function(e) {
    if (e.target.closest('.chat-widget')) {
        showNotification('Chat feature is not available in this demo.');
    }
});
