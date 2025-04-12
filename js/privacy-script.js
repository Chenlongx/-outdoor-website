// Mobile Menu Functionality
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');

    // Initialize mobile menu
    mobileMenuBtn.addEventListener('click', () => {
        // If a mobile menu doesn't exist yet, create one
        if (!document.querySelector('.mobile-menu')) {
            // Create mobile menu container
            const mobileMenu = document.createElement('div');
            mobileMenu.classList.add('mobile-menu');

            // Create a close button
            const closeBtn = document.createElement('div');
            closeBtn.classList.add('close-btn');
            closeBtn.innerHTML = '<i class="fas fa-times"></i>';

            // Add event listener to close button
            closeBtn.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                mobileMenu.style.transform = 'translateX(-100%)';
                document.body.style.overflow = 'auto';
            });

            // Clone navigation links
            const navLinks = document.querySelector('.nav-links');
            const navLinksClone = navLinks.cloneNode(true);

            // Append elements to mobile menu
            mobileMenu.appendChild(closeBtn);
            mobileMenu.appendChild(navLinksClone);

            // Append mobile menu to body
            document.body.appendChild(mobileMenu);

            // Style the mobile menu
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
        }

        // Toggle mobile menu
        const mobileMenu = document.querySelector('.mobile-menu');
        mobileMenu.classList.toggle('active');

        // Set styles based on active state
        if (mobileMenu.classList.contains('active')) {
            mobileMenu.style.transform = 'translateX(0)';
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        } else {
            mobileMenu.style.transform = 'translateX(-100%)';
            document.body.style.overflow = 'auto';
        }
    });

    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            if (this.getAttribute('href') !== '#') {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    window.scrollTo({
                        top: target.offsetTop - 100,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Highlight the current section in the table of contents (if implemented)
    const highlightCurrentSection = () => {
        const sections = document.querySelectorAll('.privacy-section');

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const scrollPosition = window.scrollY + 150;

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                const id = section.querySelector('h2').textContent.trim();

                // If you have a table of contents with links, you could highlight the current section
                // const tocLinks = document.querySelectorAll('.toc-link');
                // tocLinks.forEach(link => {
                //     link.classList.remove('active');
                //     if (link.textContent.includes(id)) {
                //         link.classList.add('active');
                //     }
                // });
            }
        });
    };

});
