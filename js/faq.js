// FAQ Page Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu functionality
    const mobileToggle = document.querySelector('.mobile-toggle');

    if (mobileToggle) {
        mobileToggle.addEventListener('click', function() {
            // Create mobile menu if it doesn't exist
            if (!document.querySelector('.mobile-menu')) {
                const mobileMenu = document.createElement('div');
                mobileMenu.classList.add('mobile-menu');

                const closeBtn = document.createElement('div');
                closeBtn.classList.add('close-btn');
                closeBtn.innerHTML = '<i class="fas fa-times"></i>';

                closeBtn.addEventListener('click', function() {
                    mobileMenu.classList.remove('active');
                    document.body.style.overflow = 'auto';
                });

                const navLinks = document.querySelector('.main-nav ul').cloneNode(true);

                mobileMenu.appendChild(closeBtn);
                mobileMenu.appendChild(navLinks);
                document.body.appendChild(mobileMenu);

                // Style mobile menu
                mobileMenu.style.position = 'fixed';
                mobileMenu.style.top = '0';
                mobileMenu.style.left = '0';
                mobileMenu.style.width = '100%';
                mobileMenu.style.height = '100vh';
                mobileMenu.style.backgroundColor = 'white';
                mobileMenu.style.padding = '2rem';
                mobileMenu.style.zIndex = '1000';
                mobileMenu.style.transform = 'translateY(-100%)';
                mobileMenu.style.transition = 'transform 0.3s ease-in-out';

                closeBtn.style.position = 'absolute';
                closeBtn.style.top = '1rem';
                closeBtn.style.right = '1rem';
                closeBtn.style.fontSize = '1.5rem';
                closeBtn.style.cursor = 'pointer';

                navLinks.style.marginTop = '3rem';
                navLinks.style.display = 'flex';
                navLinks.style.flexDirection = 'column';

                const links = navLinks.querySelectorAll('li');
                links.forEach(function(link) {
                    link.style.margin = '0.75rem 0';
                    link.style.padding = '0.5rem 0';
                    link.style.borderBottom = '1px solid #eee';
                });
            }

            const mobileMenu = document.querySelector('.mobile-menu');
            mobileMenu.classList.toggle('active');

            if (mobileMenu.classList.contains('active')) {
                mobileMenu.style.transform = 'translateY(0)';
                document.body.style.overflow = 'hidden'; // Prevent scrolling
            } else {
                mobileMenu.style.transform = 'translateY(-100%)';
                document.body.style.overflow = 'auto';
            }
        });
    }

    // FAQ accordion functionality
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(function(item) {
        const question = item.querySelector('.faq-question');

        question.addEventListener('click', function() {
            // Close other items
            faqItems.forEach(function(otherItem) {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });

            // Toggle current item
            item.classList.toggle('active');
        });
    });

    // Category filter functionality
    const categoryTabs = document.querySelectorAll('.category-tab');
    const faqCategories = document.querySelectorAll('.faq-category');
    const allFaqItems = document.querySelectorAll('.faq-item');

    categoryTabs.forEach(function(tab) {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            categoryTabs.forEach(function(otherTab) {
                otherTab.classList.remove('active');
            });

            // Add active class to clicked tab
            tab.classList.add('active');

            const category = tab.getAttribute('data-category');

            if (category === 'all') {
                // Show the first category only (Products)
                faqCategories.forEach(function(cat, index) {
                    if (index === 0) {
                        cat.style.display = 'block';
                    } else {
                        cat.style.display = 'none';
                    }
                });

                // Reset all items to be visible within their categories
                allFaqItems.forEach(function(item) {
                    item.style.display = 'block';
                });
            } else {
                // Show only the selected category
                faqCategories.forEach(function(cat) {
                    if (cat.id === category) {
                        cat.style.display = 'block';
                    } else {
                        cat.style.display = 'none';
                    }
                });
            }

            // Close all open FAQ items
            faqItems.forEach(function(item) {
                item.classList.remove('active');
            });
        });
    });

    // Search functionality
    const searchInput = document.getElementById('faq-search');
    const searchBtn = document.getElementById('search-btn');

    function performSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();

        if (searchTerm.length < 2) {
            // Reset to default view if search term is too short
            categoryTabs[0].click(); // Activate "All" tab
            return;
        }

        // Show all categories
        faqCategories.forEach(function(cat) {
            cat.style.display = 'block';
        });

        // Filter FAQ items based on search term
        let matchFound = false;

        allFaqItems.forEach(function(item) {
            const question = item.querySelector('.faq-question h3').textContent.toLowerCase();
            const answer = item.querySelector('.faq-answer').textContent.toLowerCase();

            if (question.includes(searchTerm) || answer.includes(searchTerm)) {
                item.style.display = 'block';
                item.classList.add('search-match');
                matchFound = true;
            } else {
                item.style.display = 'none';
                item.classList.remove('search-match');
            }
        });

        // Remove active class from all category tabs
        categoryTabs.forEach(function(tab) {
            tab.classList.remove('active');
        });

        // Expand all matching items
        if (matchFound) {
            const matchingItems = document.querySelectorAll('.search-match');
            matchingItems.forEach(function(item) {
                item.classList.add('active');
            });
        }
    }

    if (searchInput && searchBtn) {
        searchBtn.addEventListener('click', performSearch);

        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
                e.preventDefault();
            }
        });

        // Clear search when input is cleared
        searchInput.addEventListener('input', function() {
            if (this.value.length === 0) {
                categoryTabs[0].click(); // Reset to "All" view
            }
        });
    }

    // Live chat button functionality
    const liveChatBtn = document.querySelector('.live-chat');

    if (liveChatBtn) {
        liveChatBtn.addEventListener('click', function(e) {
            e.preventDefault();

            // Create chat widget if it doesn't exist
            if (!document.querySelector('.chat-widget-container')) {
                const chatWidget = document.createElement('div');
                chatWidget.classList.add('chat-widget-container');

                chatWidget.innerHTML = `
                    <div class="chat-widget">
                        <div class="chat-header">
                            <h3>Customer Support</h3>
                            <button class="close-chat"><i class="fas fa-times"></i></button>
                        </div>
                        <div class="chat-messages">
                            <div class="message support">
                                <div class="message-content">
                                    <p>Hello! Thanks for reaching out to WildGear support. How can we help you today?</p>
                                    <span class="message-time">Just now</span>
                                </div>
                            </div>
                        </div>
                        <div class="chat-input">
                            <input type="text" placeholder="Type your message...">
                            <button type="submit"><i class="fas fa-paper-plane"></i></button>
                        </div>
                    </div>
                `;

                document.body.appendChild(chatWidget);

                // Style chat widget
                const styles = document.createElement('style');
                styles.textContent = `
                    .chat-widget-container {
                        position: fixed;
                        bottom: 20px;
                        right: 20px;
                        z-index: 1000;
                        width: 350px;
                        max-width: 90vw;
                        box-shadow: 0 5px 25px rgba(0, 0, 0, 0.2);
                        border-radius: 10px;
                        overflow: hidden;
                        background-color: white;
                        animation: slideUp 0.3s ease;
                    }

                    .chat-header {
                        background-color: var(--primary-color);
                        color: white;
                        padding: 15px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }

                    .chat-header h3 {
                        margin: 0;
                        font-size: 16px;
                    }

                    .close-chat {
                        background: none;
                        border: none;
                        color: white;
                        cursor: pointer;
                        font-size: 16px;
                    }

                    .chat-messages {
                        padding: 15px;
                        height: 250px;
                        overflow-y: auto;
                    }

                    .message {
                        margin-bottom: 15px;
                    }

                    .message-content {
                        padding: 10px;
                        border-radius: 10px;
                        max-width: 80%;
                    }

                    .message.user {
                        text-align: right;
                    }

                    .message.user .message-content {
                        background-color: var(--primary-color);
                        color: white;
                        margin-left: auto;
                    }

                    .message.support .message-content {
                        background-color: #f1f1f1;
                    }

                    .message-time {
                        display: block;
                        font-size: 12px;
                        margin-top: 5px;
                        opacity: 0.7;
                    }

                    .chat-input {
                        display: flex;
                        padding: 10px;
                        border-top: 1px solid #eee;
                    }

                    .chat-input input {
                        flex: 1;
                        padding: 10px;
                        border: 1px solid #ddd;
                        border-radius: 20px;
                        margin-right: 10px;
                    }

                    .chat-input button {
                        background-color: var(--primary-color);
                        color: white;
                        border: none;
                        border-radius: 50%;
                        width: 40px;
                        height: 40px;
                        cursor: pointer;
                    }

                    @keyframes slideUp {
                        from { transform: translateY(100px); opacity: 0; }
                        to { transform: translateY(0); opacity: 1; }
                    }
                `;

                document.head.appendChild(styles);

                // Add chat functionality
                const closeChat = document.querySelector('.close-chat');
                const chatInput = document.querySelector('.chat-input input');
                const chatSubmit = document.querySelector('.chat-input button');

                closeChat.addEventListener('click', function() {
                    chatWidget.remove();
                });

                function sendMessage() {
                    const message = chatInput.value.trim();
                    if (message.length === 0) return;

                    const chatMessages = document.querySelector('.chat-messages');

                    // Add user message
                    chatMessages.innerHTML += `
                        <div class="message user">
                            <div class="message-content">
                                <p>${message}</p>
                                <span class="message-time">Just now</span>
                            </div>
                        </div>
                    `;

                    chatInput.value = '';
                    chatMessages.scrollTop = chatMessages.scrollHeight;

                    // Simulate support response after a delay
                    setTimeout(function() {
                        chatMessages.innerHTML += `
                            <div class="message support">
                                <div class="message-content">
                                    <p>Thanks for your message. One of our support agents will respond shortly. In the meantime, you might find an answer in our FAQ section.</p>
                                    <span class="message-time">Just now</span>
                                </div>
                            </div>
                        `;
                        chatMessages.scrollTop = chatMessages.scrollHeight;
                    }, 1000);
                }

                chatSubmit.addEventListener('click', sendMessage);
                chatInput.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        sendMessage();
                    }
                });
            } else {
                // Remove chat widget if it already exists
                document.querySelector('.chat-widget-container').remove();
            }
        });
    }
});
