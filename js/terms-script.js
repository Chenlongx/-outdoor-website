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

    // Create a table of contents for easy navigation
    function createTableOfContents() {
        const termsContent = document.querySelector('.terms-content');
        if (!termsContent) return;

        const sections = termsContent.querySelectorAll('.terms-section h2');
        if (sections.length < 3) return; // Only create TOC if there are enough sections

        const tocContainer = document.createElement('div');
        tocContainer.classList.add('table-of-contents');
        tocContainer.innerHTML = '<h3>Table of Contents</h3>';

        const tocList = document.createElement('ul');
        tocList.classList.add('toc-list');

        sections.forEach((section, index) => {
            const sectionId = `section-${index + 1}`;
            section.setAttribute('id', sectionId);

            const listItem = document.createElement('li');
            const link = document.createElement('a');
            link.href = `#${sectionId}`;
            link.textContent = section.textContent;
            link.classList.add('toc-link');

            listItem.appendChild(link);
            tocList.appendChild(listItem);
        });

        tocContainer.appendChild(tocList);

        // Style the TOC
        tocContainer.style.backgroundColor = 'var(--light-gray)';
        tocContainer.style.padding = '1.5rem';
        tocContainer.style.borderRadius = '6px';
        tocContainer.style.marginBottom = '2rem';

        tocContainer.querySelector('h3').style.marginBottom = '1rem';
        tocContainer.querySelector('h3').style.fontSize = '1.2rem';

        const tocLinks = tocContainer.querySelectorAll('.toc-link');
        tocLinks.forEach(link => {
            link.style.color = 'var(--primary-color)';
            link.style.textDecoration = 'none';
            link.style.display = 'inline-block';
            link.style.marginBottom = '0.5rem';
            link.style.transition = 'color 0.3s ease';
        });

        // Insert TOC at the beginning of the content
        termsContent.insertBefore(tocContainer, termsContent.firstChild);

        // Add click event to TOC links for smooth scrolling
        tocLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);

                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 100,
                        behavior: 'smooth'
                    });

                    // Update active state in TOC
                    tocLinks.forEach(l => l.classList.remove('active'));
                    this.classList.add('active');
                }
            });
        });
    }

    // Initialize TOC
    createTableOfContents();

    // Highlight the current section in the TOC when scrolling
    function highlightCurrentSection() {
        const tocLinks = document.querySelectorAll('.toc-link');
        if (tocLinks.length === 0) return;

        const sections = document.querySelectorAll('.terms-section h2');

        sections.forEach((section, index) => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.parentElement.offsetHeight;
            const scrollPosition = window.scrollY + 150;

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                tocLinks.forEach(link => link.classList.remove('active'));
                tocLinks[index].classList.add('active');

                // Style the active link
                tocLinks[index].style.color = 'var(--secondary-color)';
                tocLinks[index].style.fontWeight = '600';
            } else {
                tocLinks[index].style.color = 'var(--primary-color)';
                tocLinks[index].style.fontWeight = '400';
            }
        });
    }

    // Add scroll event listener for TOC highlighting
    window.addEventListener('scroll', highlightCurrentSection);

    // Back to top button
    function createBackToTopButton() {
        const backToTopBtn = document.createElement('button');
        backToTopBtn.classList.add('back-to-top');
        backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
        document.body.appendChild(backToTopBtn);

        // Style the button
        backToTopBtn.style.position = 'fixed';
        backToTopBtn.style.bottom = '20px';
        backToTopBtn.style.right = '20px';
        backToTopBtn.style.backgroundColor = 'var(--primary-color)';
        backToTopBtn.style.color = 'white';
        backToTopBtn.style.width = '40px';
        backToTopBtn.style.height = '40px';
        backToTopBtn.style.borderRadius = '50%';
        backToTopBtn.style.border = 'none';
        backToTopBtn.style.cursor = 'pointer';
        backToTopBtn.style.display = 'flex';
        backToTopBtn.style.justifyContent = 'center';
        backToTopBtn.style.alignItems = 'center';
        backToTopBtn.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
        backToTopBtn.style.opacity = '0';
        backToTopBtn.style.transition = 'opacity 0.3s ease';
        backToTopBtn.style.zIndex = '100';

        // Show/hide button based on scroll position
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopBtn.style.opacity = '1';
            } else {
                backToTopBtn.style.opacity = '0';
            }
        });

        // Scroll to top when clicked
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Initialize back to top button
    createBackToTopButton();
});
