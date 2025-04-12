// Delivery Information Page Scripts
document.addEventListener('DOMContentLoaded', function() {
    // Initialize form validation
    initFormValidation();

    // Initialize delivery options
    initDeliveryOptions();

    // Initialize form submission
    initFormSubmission();

    // Initialize coupon code functionality
    initCouponCode();
});

// Form validation
function initFormValidation() {
    const deliveryForm = document.getElementById('delivery-form');
    if (!deliveryForm) return;

    const requiredFields = deliveryForm.querySelectorAll('[required]');

    // Add event listeners to all required fields
    requiredFields.forEach(field => {
        field.addEventListener('blur', function() {
            validateField(this);
        });

        field.addEventListener('input', function() {
            // Remove error styling when user starts typing
            if (this.classList.contains('invalid')) {
                this.classList.remove('invalid');

                // Remove error message if it exists
                const errorMsg = this.parentNode.querySelector('.error-message');
                if (errorMsg) {
                    errorMsg.remove();
                }
            }
        });
    });

    // Validate individual field
    function validateField(field) {
        // Remove any existing error message
        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // Check if field is empty
        if (!field.value.trim()) {
            field.classList.add('invalid');

            // Create and append error message
            const errorMsg = document.createElement('div');
            errorMsg.classList.add('error-message');
            errorMsg.textContent = 'This field is required';

            // Style error message
            errorMsg.style.color = '#e63946';
            errorMsg.style.fontSize = '0.85rem';
            errorMsg.style.marginTop = '0.25rem';

            field.parentNode.appendChild(errorMsg);
            return false;
        }

        // Validate email format if field is email
        if (field.type === 'email' && !isValidEmail(field.value)) {
            field.classList.add('invalid');

            // Create and append error message
            const errorMsg = document.createElement('div');
            errorMsg.classList.add('error-message');
            errorMsg.textContent = 'Please enter a valid email address';

            // Style error message
            errorMsg.style.color = '#e63946';
            errorMsg.style.fontSize = '0.85rem';
            errorMsg.style.marginTop = '0.25rem';

            field.parentNode.appendChild(errorMsg);
            return false;
        }

        // Validate phone number if field is phone
        if (field.id === 'phone' && !isValidPhone(field.value)) {
            field.classList.add('invalid');

            // Create and append error message
            const errorMsg = document.createElement('div');
            errorMsg.classList.add('error-message');
            errorMsg.textContent = 'Please enter a valid phone number';

            // Style error message
            errorMsg.style.color = '#e63946';
            errorMsg.style.fontSize = '0.85rem';
            errorMsg.style.marginTop = '0.25rem';

            field.parentNode.appendChild(errorMsg);
            return false;
        }

        // Validate ZIP code if field is zip
        if (field.id === 'zip' && !isValidZip(field.value)) {
            field.classList.add('invalid');

            // Create and append error message
            const errorMsg = document.createElement('div');
            errorMsg.classList.add('error-message');
            errorMsg.textContent = 'Please enter a valid ZIP code';

            // Style error message
            errorMsg.style.color = '#e63946';
            errorMsg.style.fontSize = '0.85rem';
            errorMsg.style.marginTop = '0.25rem';

            field.parentNode.appendChild(errorMsg);
            return false;
        }

        // Field is valid
        field.classList.remove('invalid');
        return true;
    }

    // Email validation helper
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Phone validation helper
    function isValidPhone(phone) {
        // Basic phone validation (can be customized based on region)
        const phoneRegex = /^\+?[0-9\s\-()]{8,20}$/;
        return phoneRegex.test(phone);
    }

    // ZIP code validation helper
    function isValidZip(zip) {
        // This is a simplified validation for US ZIP codes
        // For international support, this would need to be expanded
        const zipRegex = /^\d{5}(-\d{4})?$/;
        return zipRegex.test(zip);
    }

    // Add styles for invalid fields
    const style = document.createElement('style');
    style.textContent = `
        .form-group input.invalid,
        .form-group select.invalid,
        .form-group textarea.invalid {
            border-color: #e63946;
            background-color: rgba(230, 57, 70, 0.05);
        }
    `;
    document.head.appendChild(style);
}

// Delivery options
function initDeliveryOptions() {
    const deliveryOptions = document.querySelectorAll('input[name="delivery"]');
    const shippingCostElement = document.getElementById('shipping-cost');
    const orderTotalElement = document.getElementById('order-total');

    if (!deliveryOptions.length || !shippingCostElement || !orderTotalElement) return;

    // Shipping costs
    const shippingCosts = {
        'standard': 4.99,
        'express': 9.99,
        'next-day': 14.99
    };

    // Calculate base total (subtotal + tax, without shipping)
    const subtotalText = document.querySelector('.summary-row:first-child span:last-child').textContent;
    const taxText = document.querySelector('.summary-row:nth-child(3) span:last-child').textContent;

    const subtotal = parseFloat(subtotalText.replace('$', ''));
    const tax = parseFloat(taxText.replace('$', ''));
    const baseTotal = subtotal + tax;

    // Update total when delivery option changes
    deliveryOptions.forEach(option => {
        option.addEventListener('change', function() {
            const selectedOption = this.value;
            const shippingCost = shippingCosts[selectedOption];

            // Update shipping cost display
            shippingCostElement.textContent = `$${shippingCost.toFixed(2)}`;

            // Update order total
            const newTotal = baseTotal + shippingCost;
            orderTotalElement.textContent = `$${newTotal.toFixed(2)}`;

            // Add highlight animation to the changed values
            shippingCostElement.classList.add('highlight');
            orderTotalElement.classList.add('highlight');

            // Remove highlight after animation completes
            setTimeout(() => {
                shippingCostElement.classList.remove('highlight');
                orderTotalElement.classList.remove('highlight');
            }, 1500);
        });
    });

    // Add highlight animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes highlight {
            0% { color: var(--primary-color); }
            50% { color: var(--accent-color); }
            100% { color: var(--primary-color); }
        }

        .highlight {
            animation: highlight 1.5s ease;
        }
    `;
    document.head.appendChild(style);
}

// Form submission
function initFormSubmission() {
    const deliveryForm = document.getElementById('delivery-form');
    if (!deliveryForm) return;

    deliveryForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Validate all required fields
        const requiredFields = this.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            // Create a blur event to trigger validation
            const event = new Event('blur');
            field.dispatchEvent(event);

            // Check if field has error class
            if (field.classList.contains('invalid')) {
                isValid = false;
            }
        });

        if (isValid) {
            // Create a notification
            showNotification('Proceeding to payment...', 'success');

            // In a real application, you would submit the form or redirect
            // For demo purposes, simulate a redirect after a delay
            setTimeout(() => {
                // Redirect to a payment page (demo)
                // window.location.href = 'payment.html';
                alert('This would redirect to the payment page in a real application.');
            }, 2000);
        } else {
            // Show error notification
            showNotification('Please complete all required fields correctly.', 'error');

            // Scroll to the first invalid field
            const firstInvalidField = document.querySelector('.invalid');
            if (firstInvalidField) {
                firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstInvalidField.focus();
            }
        }
    });
}

// Coupon code functionality
function initCouponCode() {
    const couponInput = document.querySelector('.coupon-code input');
    const couponButton = document.querySelector('.coupon-code button');

    if (!couponInput || !couponButton) return;

    // Sample coupon codes (in a real app, these would be validated server-side)
    const validCoupons = {
        'SUMMER25': { discount: 25, type: 'percent' },
        'FREESHIP': { discount: 4.99, type: 'amount' },
        'WILD10': { discount: 10, type: 'percent' }
    };

    couponButton.addEventListener('click', function() {
        const couponCode = couponInput.value.trim().toUpperCase();

        if (!couponCode) {
            showNotification('Please enter a coupon code.', 'error');
            return;
        }

        // Check if coupon is valid
        if (validCoupons[couponCode]) {
            // In a real application, you would apply the discount to the order
            const coupon = validCoupons[couponCode];
            let discountText = '';

            if (coupon.type === 'percent') {
                discountText = `${coupon.discount}%`;
            } else {
                discountText = `$${coupon.discount.toFixed(2)}`;
            }

            showNotification(`Coupon applied! ${discountText} discount.`, 'success');

            // Disable the coupon input and button after successful application
            couponInput.disabled = true;
            couponButton.disabled = true;

            // Add a visual indication that the coupon was applied
            const couponContainer = couponInput.parentNode;
            couponContainer.classList.add('coupon-applied');

            // Add a remove coupon button
            const removeButton = document.createElement('button');
            removeButton.textContent = 'Remove';
            removeButton.classList.add('remove-coupon');
            couponContainer.appendChild(removeButton);

            // Style the remove button
            removeButton.style.marginLeft = '0.5rem';
            removeButton.style.padding = '0.5rem';
            removeButton.style.background = 'none';
            removeButton.style.border = 'none';
            removeButton.style.color = '#e63946';
            removeButton.style.fontWeight = '600';
            removeButton.style.cursor = 'pointer';

            // Add functionality to remove button
            removeButton.addEventListener('click', function() {
                couponInput.disabled = false;
                couponButton.disabled = false;
                couponContainer.classList.remove('coupon-applied');
                this.remove();

                // Show notification
                showNotification('Coupon removed.', 'info');
            });

            // Add a style for the applied coupon
            const style = document.createElement('style');
            style.textContent = `
                .coupon-applied input {
                    background-color: rgba(44, 110, 73, 0.1);
                    border-color: var(--primary-color);
                }
            `;
            document.head.appendChild(style);
        } else {
            showNotification('Invalid coupon code.', 'error');
        }
    });
}

// Notification function
function showNotification(message, type = 'info') {
    // Check if notification container exists
    let notificationContainer = document.querySelector('.notification-container');

    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.classList.add('notification-container');
        document.body.appendChild(notificationContainer);

        // Style notification container
        Object.assign(notificationContainer.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: '9999'
        });
    }

    // Create notification
    const notification = document.createElement('div');
    notification.classList.add('notification', type);
    notification.textContent = message;

    // Set icon based on type
    const iconMap = {
        'success': 'fas fa-check-circle',
        'error': 'fas fa-exclamation-circle',
        'info': 'fas fa-info-circle'
    };

    if (iconMap[type]) {
        const icon = document.createElement('i');
        icon.className = iconMap[type];
        notification.prepend(icon);

        // Style icon
        icon.style.marginRight = '8px';
    }

    // Style notification
    const colors = {
        'success': { bg: '#4c956c', color: 'white' },
        'error': { bg: '#e63946', color: 'white' },
        'info': { bg: '#457b9d', color: 'white' }
    };

    Object.assign(notification.style, {
        backgroundColor: colors[type]?.bg || colors.info.bg,
        color: colors[type]?.color || colors.info.color,
        padding: '12px 20px',
        borderRadius: '4px',
        marginBottom: '10px',
        boxShadow: '0 3px 10px rgba(0,0,0,0.15)',
        transform: 'translateX(150%)',
        transition: 'transform 0.3s ease',
        display: 'flex',
        alignItems: 'center'
    });

    // Add notification to container
    notificationContainer.appendChild(notification);

    // Animate notification
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);

    // Remove notification after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(150%)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}
