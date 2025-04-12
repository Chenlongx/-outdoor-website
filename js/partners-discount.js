// Global Elements
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');
const navActions = document.querySelector('.nav-actions');
const searchTrigger = document.getElementById('header-search');
const searchOverlay = document.querySelector('.search-overlay');
const closeSearchButton = document.getElementById('close-search');
const partnerForm = document.getElementById('partner-form');
const successModal = document.getElementById('success-modal');
const modalCloseBtn = document.querySelector('.close-modal');
const modalButton = document.querySelector('.modal-button');
const faqItems = document.querySelectorAll('.faq-item');
const partnerLogos = document.querySelectorAll('.partner-logo');
const testimonialsContainer = document.getElementById('testimonials-slider');
const testimonialDotsContainer = document.getElementById('testimonial-dots');
const testimonials = document.querySelectorAll('.testimonial');
const tierButtons = document.querySelectorAll('.tier-button');
const ctaButton = document.querySelector('.partners-cta-btn');

// Mobile Menu
function initMobileMenu() {
    if (!mobileMenuBtn) return;

    mobileMenuBtn.addEventListener('click', () => {
        // If mobile menu doesn't exist, create it
        if (!document.querySelector('.mobile-menu')) {
            // Create mobile menu container
            const mobileMenu = document.createElement('div');
            mobileMenu.classList.add('mobile-menu');

            // Clone navigation links
            const navLinksClone = navLinks.cloneNode(true);

            // Create close button
            const closeBtn = document.createElement('div');
            closeBtn.classList.add('close-btn');
            closeBtn.innerHTML = '<i class="fas fa-times"></i>';

            closeBtn.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                mobileMenu.style.transform = 'translateX(-100%)'; // Hide menu
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

            // Style list items
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
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        } else {
            mobileMenu.style.transform = 'translateX(-100%)';
            document.body.style.overflow = 'auto';
        }
    });
}

// Countdown Timer
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

// Sticky Header
function initStickyHeader() {
    const header = document.querySelector('header');
    const announcement = document.querySelector('.announcement-bar');
    if (!header || !announcement) return;

    let lastScrollY = window.scrollY;
    let ticking = false;
    let announcementHeight = announcement.offsetHeight;
    const threshold = announcementHeight + 5;

    // Debounce function for resize event
    const updateHeight = debounce(() => {
        announcementHeight = announcement.offsetHeight;
    }, 100);

    window.addEventListener('resize', updateHeight);

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                handleScroll();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    function handleScroll() {
        const currentScrollY = window.scrollY;

        // Avoid frequent switching at boundary values
        if (currentScrollY >= threshold) {
            if (!header.classList.contains('sticky')) {
                header.classList.add('sticky');
                announcement.style.transform = 'translateY(-100%)';
            }
        } else {
            if (header.classList.contains('sticky')) {
                header.classList.remove('sticky');
                announcement.style.transform = 'translateY(0)';
            }
        }

        // Record last scroll position
        lastScrollY = currentScrollY;
    }
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Search Functionality
function initSearch() {
    if (!searchTrigger || !searchOverlay || !closeSearchButton) return;

    // Show search overlay when clicking search icon
    searchTrigger.addEventListener('click', (e) => {
        e.preventDefault();
        searchOverlay.style.opacity = '1';
        searchOverlay.style.display = 'inline-flex';
        searchOverlay.style.visibility = 'visible';
    });

    // Hide search overlay when clicking close button
    closeSearchButton.addEventListener('click', () => {
        searchOverlay.style.opacity = '0';
        searchOverlay.style.visibility = 'hidden';
    });

    // Hide search overlay when clicking outside search container
    searchOverlay.addEventListener('click', (e) => {
        if (e.target === searchOverlay) {
            searchOverlay.style.opacity = '0';
            searchOverlay.style.visibility = 'hidden';
        }
    });

    // Close search overlay on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && searchOverlay.style.visibility === 'visible') {
            searchOverlay.style.opacity = '0';
            searchOverlay.style.visibility = 'hidden';
        }
    });
}

// FAQ Toggle
function initFAQ() {
    if (!faqItems || faqItems.length === 0) return;

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        const toggle = item.querySelector('.faq-toggle');
        
        if (question && answer && toggle) {
            question.addEventListener('click', () => {
                const isOpen = answer.style.display === 'block';
                
                // Close all other items
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        const otherAnswer = otherItem.querySelector('.faq-answer');
                        const otherToggle = otherItem.querySelector('.faq-toggle');
                        
                        if (otherAnswer && otherToggle) {
                            otherAnswer.style.display = 'none';
                            otherToggle.innerHTML = '<i class="fas fa-plus"></i>';
                        }
                    }
                });
                
                // Toggle current item
                if (isOpen) {
                    answer.style.display = 'none';
                    toggle.innerHTML = '<i class="fas fa-plus"></i>';
                } else {
                    answer.style.display = 'block';
                    toggle.innerHTML = '<i class="fas fa-minus"></i>';
                }
            });
        }
    });
}

// Partner Logos Animation
function initPartnerLogos() {
    if (!partnerLogos || partnerLogos.length === 0) return;

    // Simple animation on scroll
    window.addEventListener('scroll', () => {
        partnerLogos.forEach((logo, index) => {
            if (isElementInViewport(logo)) {
                setTimeout(() => {
                    logo.style.opacity = '1';
                    logo.style.transform = 'translateY(0)';
                }, index * 100);
            }
        });
    });

    // Set initial styles
    partnerLogos.forEach(logo => {
        logo.style.opacity = '0';
        logo.style.transform = 'translateY(20px)';
        logo.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });

    // Trigger once on load
    setTimeout(() => {
        partnerLogos.forEach((logo, index) => {
            setTimeout(() => {
                logo.style.opacity = '1';
                logo.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }, 300);
}

// Testimonials Slider
function initTestimonialSlider() {
    if (!testimonialsContainer || !testimonialDotsContainer || !testimonials || testimonials.length === 0) return;

    let currentIndex = 0;
    const totalTestimonials = testimonials.length;

    // Create dots for each testimonial
    testimonials.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => {
            goToTestimonial(index);
        });
        testimonialDotsContainer.appendChild(dot);
    });

    // Set the initial active testimonial
    updateActiveTestimonial();

    // Function to go to a specific testimonial
    function goToTestimonial(index) {
        currentIndex = index;
        updateActiveTestimonial();
    }

    // Update the active testimonial and dots
    function updateActiveTestimonial() {
        // Update testimonials visibility
        testimonials.forEach((testimonial, index) => {
            if (index === currentIndex) {
                testimonial.style.display = 'block';
            } else {
                testimonial.style.display = 'none';
            }
        });

        // Update active dot
        const dots = testimonialDotsContainer.querySelectorAll('.dot');
        dots.forEach((dot, index) => {
            if (index === currentIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    // Auto-rotate testimonials
    let autoRotate = setInterval(() => {
        currentIndex = (currentIndex + 1) % totalTestimonials;
        updateActiveTestimonial();
    }, 5000);

    // Pause auto-rotate on hover
    testimonialsContainer.addEventListener('mouseenter', () => {
        clearInterval(autoRotate);
    });

    // Resume auto-rotate on mouse leave
    testimonialsContainer.addEventListener('mouseleave', () => {
        autoRotate = setInterval(() => {
            currentIndex = (currentIndex + 1) % totalTestimonials;
            updateActiveTestimonial();
        }, 5000);
    });
}

// Application Form Handling
function initApplicationForm() {
    if (!partnerForm || !successModal || !modalCloseBtn || !modalButton) return;

    partnerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // 获取表单数据
        const formData = {
            organizationName: document.getElementById('organization-name').value,
            organizationType: document.getElementById('organization-type').value,
            contactName: document.getElementById('contact-name').value,
            contactTitle: document.getElementById('contact-title').value,
            contactEmail: document.getElementById('contact-email').value,
            contactPhone: document.getElementById('contact-phone').value,
            organizationSize: document.getElementById('organization-size').value,
            organizationWebsite: document.getElementById('organization-website').value,
            additionalInfo: document.getElementById('additional-info').value
        };
        
        // 构建邮件内容
        const emailSubject = 'WildGear Partners Discount Program Application';
        const emailBody = `
WildGear Partners Discount Program Application

Organization Information:
------------------------
Organization Name: ${formData.organizationName}
Organization Type: ${formData.organizationType}
Organization Size: ${formData.organizationSize}
Website: ${formData.organizationWebsite}

Contact Information:
------------------
Name: ${formData.contactName}
Title/Position: ${formData.contactTitle}
Email: ${formData.contactEmail}
Phone: ${formData.contactPhone}

Additional Information:
---------------------
${formData.additionalInfo}
        `;
        
        // 构建邮件链接
        const mailtoLink = `mailto:aa2231401652@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
        
        // 打开默认邮件客户端
        window.location.href = mailtoLink;
        
        // 显示成功消息
        showNotification('表单已提交，正在打开邮件客户端...');
    });

    // Close modal when clicking close button or modal button
    modalCloseBtn.addEventListener('click', () => {
        successModal.style.display = 'none';
    });

    modalButton.addEventListener('click', () => {
        successModal.style.display = 'none';
    });

    // Close modal when clicking outside the content
    successModal.addEventListener('click', (e) => {
        if (e.target === successModal) {
            successModal.style.display = 'none';
        }
    });
}

// Tier Button and CTA Button Actions
function initButtons() {
    // Tier buttons
    if (tierButtons && tierButtons.length > 0) {
        tierButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Scroll to application form
                const applicationSection = document.querySelector('.application');
                if (applicationSection) {
                    window.scrollTo({
                        top: applicationSection.offsetTop - 100,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // CTA button
    if (ctaButton) {
        ctaButton.addEventListener('click', (e) => {
            e.preventDefault();
            // Scroll to application form
            const applicationSection = document.querySelector('.application');
            if (applicationSection) {
                window.scrollTo({
                    top: applicationSection.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
        });
    }
}

// Helper function to check if element is in viewport
function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.bottom >= 0
    );
}

// Add animation to elements when scrolling into view
function initScrollAnimation() {
    const animatedElements = document.querySelectorAll(
        '.benefit-card, .eligibility-card, .tier-card, .testimonial'
    );

    if (!animatedElements || animatedElements.length === 0) return;

    // Set initial styles
    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });

    // Animation function
    const animateOnScroll = () => {
        animatedElements.forEach(element => {
            if (isElementInViewport(element)) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    };

    // Run animation on scroll
    window.addEventListener('scroll', animateOnScroll);

    // Run once on page load
    animateOnScroll();
}

// Initialize all functions when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initMobileMenu();
    startCountdown();
    initStickyHeader();
    initSearch();
    initFAQ();
    initPartnerLogos();
    initTestimonialSlider();
    initApplicationForm();
    initButtons();
    initScrollAnimation();
});

// 显示通知的函数
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}
