// Support Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // 初始化常见问题解答手风琴
    initFaqAccordion();

    // Initialize FAQ Category tabs
    initFaqCategories();

    // Initialize Contact Form
    initContactForm();

    // Initialize Chat Button
    initChatButton();

    // Initialize Store Locator
    initStoreLocator();

    // Add countdown functionality from main script
    if (typeof startCountdown === 'function') {
        startCountdown();
    } else {
        initCountdown();
    }

    // Add sticky header functionality from main script
    if (typeof initStickyHeader === 'function') {
        initStickyHeader();
    } else {
        initStickyHeaderFallback();
    }
});

// 常见问题解答手风琴功能
function initFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
  
    faqItems.forEach(item => {
      const question = item.querySelector('.faq-question');
      const icon = item.querySelector('.faq-question i');
  
      if (question && icon) {
        question.addEventListener('click', () => {
          const isActive = item.classList.contains('active');
  
          // 关闭其他所有项
          faqItems.forEach(otherItem => {
            otherItem.classList.remove('active');
            const otherIcon = otherItem.querySelector('.faq-question i');
            if (otherIcon) {
              otherIcon.className = 'fas fa-chevron-down';
            }
          });
  
          if (!isActive) {
            item.classList.add('active');
            icon.className = 'fas fa-chevron-up';
          } else {
            icon.className = 'fas fa-chevron-down';
          }
        });
      }
    });
  }

// FAQ Category Tabs
function initFaqCategories() {
    const faqCategoryBtns = document.querySelectorAll('.faq-category-btn');
    const faqCategories = document.querySelectorAll('.faq-category');

    faqCategoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.getAttribute('data-category');

            // Update button state
            faqCategoryBtns.forEach(otherBtn => {
                otherBtn.classList.remove('active');
            });
            btn.classList.add('active');

            // Update category content
            faqCategories.forEach(cat => {
                if (cat.id === category) {
                    cat.classList.add('active');
                } else {
                    cat.classList.remove('active');
                }
            });
        });
    });
}

// Contact Form submission
function initContactForm() {
    const supportForm = document.getElementById('supportForm');

    if (supportForm) {
        supportForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Get form values
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                orderNumber: document.getElementById('orderNumber').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value
            };

            // Build email content
            const emailSubject = `WildGear Support: ${formData.subject}`;
            const emailBody = `
WildGear Customer Support Request

Customer Information:
-------------------
Name: ${formData.name}
Email: ${formData.email}
Order Number: ${formData.orderNumber || 'Not provided'}
Subject: ${formData.subject}

Message:
-------
${formData.message}
            `;

            // Build email link
            const mailtoLink = `mailto:aa2231401652@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

            // Open default email client
            window.location.href = mailtoLink;

            // Show success message 
            showNotification('The form has been submitted, opening the email client...');
        });
    }
}

// Chat button functionality
function initChatButton() {
    const chatNowBtn = document.querySelector('.chat-now-btn');

    if (chatNowBtn) {
        chatNowBtn.addEventListener('click', function() {
            // Here you can add logic to open a chat window
            // Or redirect to a chat service
            window.open('https://wa.me/8613326425565', '_blank');
        });
    }
}

// Store Locator functionality
function initStoreLocator() {
    const storeSearchForm = document.getElementById('storeSearchForm');

    if (storeSearchForm) {
        storeSearchForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const location = document.getElementById('locationInput').value;

            if (location.trim() !== '') {
                showNotification(`Store search for "${location}" is not available in this demo.`);
            } else {
                showNotification('Please enter a location to search for stores.');
            }
        });
    }

    // Store directions links
    const storeDirectionsLinks = document.querySelectorAll('.store-directions');

    storeDirectionsLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            const storeName = this.closest('.store-item').querySelector('h4').textContent;
            showNotification(`Directions to ${storeName} are not available in this demo.`);
        });
    });
}

// Notification system (fallback if main script is not loaded)
function showNotification(message) {
    // Check if the function exists in the main script
    if (typeof window.showNotification === 'function') {
        window.showNotification(message);
    } else {
        // Create a fallback notification function
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
        notification.style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color') || '#2c6e49';
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
}

// Countdown Timer (fallback if main script is not loaded)
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

// Sticky Header functionality (fallback if main script is not loaded)
function initStickyHeaderFallback() {
    const header = document.querySelector('header');
    const announcement = document.querySelector('.announcement-bar');
    if (!header || !announcement) return;

    let announcementHeight = announcement.offsetHeight;
    let isSticky = false;
    const threshold = 5;
    let isScrolling;

    // Window resize listener
    window.addEventListener('resize', () => {
        announcementHeight = announcement.offsetHeight;
    });

    // Scroll listener
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

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        // Only process if it's a non-empty hash link
        if (this.getAttribute('href') !== '#' && this.getAttribute('href').startsWith('#')) {
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                e.preventDefault();
                window.scrollTo({
                    top: targetElement.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
        }
    });
});
