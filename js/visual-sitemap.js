// Visual Sitemap Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Functionality
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');

    mobileMenuBtn.addEventListener('click', () => {
        if (!document.querySelector('.mobile-menu')) {
            const mobileMenu = document.createElement('div');
            mobileMenu.classList.add('mobile-menu');

            const closeBtn = document.createElement('div');
            closeBtn.classList.add('close-btn');
            closeBtn.innerHTML = '<i class="fas fa-times"></i>';

            closeBtn.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                mobileMenu.style.transform = 'translateX(-100%)';
                document.body.style.overflow = 'auto';
            });

            const navLinks = document.querySelector('.nav-links');
            const navLinksClone = navLinks.cloneNode(true);

            mobileMenu.appendChild(closeBtn);
            mobileMenu.appendChild(navLinksClone);
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

            const navItems = navLinksClone.querySelectorAll('li');
            navItems.forEach(item => {
                item.style.margin = '0.75rem 0';
                item.style.padding = '0.5rem 0';
                item.style.borderBottom = '1px solid #eee';
            });
        }

        const mobileMenu = document.querySelector('.mobile-menu');
        mobileMenu.classList.toggle('active');

        if (mobileMenu.classList.contains('active')) {
            mobileMenu.style.transform = 'translateX(0)';
            document.body.style.overflow = 'hidden';
        } else {
            mobileMenu.style.transform = 'translateX(-100%)';
            document.body.style.overflow = 'auto';
        }
    });

    // Sitemap Visualization
    const sitemapVisual = document.getElementById('sitemap-visual');
    const zoomInBtn = document.getElementById('zoom-in');
    const zoomOutBtn = document.getElementById('zoom-out');
    const zoomResetBtn = document.getElementById('zoom-reset');
    const viewAllBtn = document.getElementById('view-all');
    const viewProductsBtn = document.getElementById('view-products');
    const viewActivitiesBtn = document.getElementById('view-activities');
    const viewResourcesBtn = document.getElementById('view-resources');

    // Zoom variables
    let currentScale = 1;
    const minScale = 0.5;
    const maxScale = 2;
    const scaleStep = 0.1;

    // Organize sitemap data
    const sitemapData = {
        root: {
            id: 'home',
            label: 'Home',
            icon: 'fas fa-home',
            children: ['products', 'activities', 'shop', 'resources', 'about', 'support']
        },
        categories: {
            'products': {
                id: 'products',
                label: 'Products',
                icon: 'fas fa-tag',
                category: 'products',
                url: '../products/product-detail.html',
                children: ['camping-gear', 'hiking-equipment', 'climbing-tools', 'fishing-gear', 'water-sports', 'apparel']
            },
            'camping-gear': {
                id: 'camping-gear',
                label: 'Camping Gear',
                icon: 'fas fa-campground',
                category: 'products',
                parent: 'products',
                children: ['tents', 'sleeping-bags', 'camp-cookware', 'furniture', 'lighting']
            },
            'hiking-equipment': {
                id: 'hiking-equipment',
                label: 'Hiking Equipment',
                icon: 'fas fa-boot',
                category: 'products',
                parent: 'products',
                children: ['backpacks', 'footwear', 'trekking-poles', 'navigation', 'hydration']
            },
            'activities': {
                id: 'activities',
                label: 'Activities',
                icon: 'fas fa-hiking',
                category: 'activities',
                children: ['camping', 'hiking', 'climbing', 'fishing', 'kayaking']
            },
            'shop': {
                id: 'shop',
                label: 'Shop',
                icon: 'fas fa-shopping-bag',
                category: 'shop',
                children: ['summer-sale', 'new-releases', 'best-sellers', 'gift-cards']
            },
            'resources': {
                id: 'resources',
                label: 'Resources',
                icon: 'fas fa-book',
                category: 'resources',
                children: ['gear-guides', 'outdoor-skills', 'trail-maps', 'blog']
            },
            'about': {
                id: 'about',
                label: 'About Us',
                icon: 'fas fa-info-circle',
                category: 'about',
                children: ['our-team', 'our-story', 'achievements', 'contact-us']
            },
            'support': {
                id: 'support',
                label: 'Support',
                icon: 'fas fa-handshake',
                category: 'support',
                children: ['faq', 'shipping-info', 'returns', 'warranty', 'legal']
            },
            'legal': {
                id: 'legal',
                label: 'Legal',
                icon: 'fas fa-file-alt',
                category: 'support',
                parent: 'support',
                children: ['privacy-policy', 'terms-of-service', 'accessibility', 'sitemap']
            }
        }
    };

    // Create and position nodes
    function createSitemapNodes() {
        // Clear existing content
        sitemapVisual.innerHTML = '';

        // Create root node
        const rootNode = createNode(
            sitemapData.root.id,
            sitemapData.root.label,
            sitemapData.root.icon,
            'main',
            0
        );
        rootNode.classList.add('root-node');
        sitemapVisual.appendChild(rootNode);

        // Position root node
        positionNode(rootNode, {
            top: 20,
            left: '50%',
            transform: 'translateX(-50%)'
        });

        // Create level 1 nodes
        const level1Wrapper = document.createElement('div');
        level1Wrapper.classList.add('level');
        level1Wrapper.dataset.level = '1';
        sitemapVisual.appendChild(level1Wrapper);

        // Position level 1 wrapper
        level1Wrapper.style.top = '120px';
        level1Wrapper.style.left = '0';
        level1Wrapper.style.width = '100%';

        // Add level 1 nodes
        sitemapData.root.children.forEach((categoryId, index) => {
            const category = sitemapData.categories[categoryId];
            const node = createNode(
                category.id,
                category.label,
                category.icon,
                category.category,
                1
            );
            level1Wrapper.appendChild(node);

            // Create level 2 nodes for this category
            if (category.children && category.children.length > 0) {
                createLevel2Nodes(category, index);
            }
        });

        // Draw connectors after nodes are positioned
        setTimeout(drawConnectors, 100);
    }

    // Create level 2 nodes
    function createLevel2Nodes(parentCategory, parentIndex) {
        const level2Wrapper = document.createElement('div');
        level2Wrapper.classList.add('level');
        level2Wrapper.dataset.level = '2';
        level2Wrapper.dataset.parent = parentCategory.id;
        level2Wrapper.style.display = 'none'; // Hidden by default
        sitemapVisual.appendChild(level2Wrapper);

        // Position level 2 wrapper
        level2Wrapper.style.top = '250px';

        // Add level 2 nodes
        parentCategory.children.forEach(childId => {
            // Find the child data - either in categories or create basic data
            const childData = sitemapData.categories[childId] || {
                id: childId,
                label: childId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
                icon: 'fas fa-circle',
                category: parentCategory.category
            };

            const node = createNode(
                childData.id,
                childData.label,
                childData.icon,
                childData.category,
                2
            );
            level2Wrapper.appendChild(node);

            // Create level 3 nodes if this node has children
            if (childData.children && childData.children.length > 0) {
                createLevel3Nodes(childData);
            }
        });
    }

    // Create level 3 nodes
    function createLevel3Nodes(parentData) {
        const level3Wrapper = document.createElement('div');
        level3Wrapper.classList.add('level');
        level3Wrapper.dataset.level = '3';
        level3Wrapper.dataset.parent = parentData.id;
        level3Wrapper.style.display = 'none'; // Hidden by default
        sitemapVisual.appendChild(level3Wrapper);

        // Position level 3 wrapper
        level3Wrapper.style.top = '380px';

        // Add level 3 nodes
        parentData.children.forEach(childId => {
            // Create simple data for level 3
            const childLabel = childId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

            const node = createNode(
                childId,
                childLabel,
                null, // No icon for mini nodes
                parentData.category,
                3
            );
            node.classList.add('mini-node');
            level3Wrapper.appendChild(node);
        });
    }

    // Helper to create a node element
    function createNode(id, label, icon, category, level) {
        const node = document.createElement('div');
        node.classList.add('node');
        node.dataset.id = id;
        node.dataset.level = level;
        node.dataset.category = category;

        const nodeContent = document.createElement('div');
        nodeContent.classList.add('node-content');

        if (icon) {
            const iconElement = document.createElement('i');
            iconElement.className = icon;
            nodeContent.appendChild(iconElement);
        }

        const labelElement = document.createElement('span');
        labelElement.textContent = label;
        nodeContent.appendChild(labelElement);

        node.appendChild(nodeContent);

        // Add connectors for non-leaf nodes
        if (level < 3) {
            const connector = document.createElement('div');
            connector.classList.add('node-connector');
            node.appendChild(connector);
        }

        // Add click event
        node.addEventListener('click', (e) => handleNodeClick(e, node, id, level, category));

        return node;
    }

    // Position a node with the given styles
    function positionNode(node, styles) {
        Object.keys(styles).forEach(prop => {
            node.style[prop] = styles[prop];
        });
    }

    // Calculate positions for level wrappers
    function calculateLevelPositions() {
        // Get all level wrappers
        const levels = document.querySelectorAll('.level');

        levels.forEach(level => {
            const levelNum = parseInt(level.dataset.level);
            const parent = level.dataset.parent;

            if (levelNum === 1) {
                // Already positioned in createSitemapNodes
                return;
            }

            if (levelNum === 2 && parent) {
                // Find parent node
                const parentNode = document.querySelector(`.node[data-id="${parent}"]`);
                if (parentNode) {
                    // Position based on parent node's position
                    const parentRect = parentNode.getBoundingClientRect();
                    const parentLeft = parentRect.left + window.scrollX;
                    const visualRect = sitemapVisual.getBoundingClientRect();
                    const visualLeft = visualRect.left + window.scrollX;

                    // Calculate offset to center under parent
                    const offsetFromVisual = parentLeft - visualLeft;
                    const levelWidth = level.offsetWidth;

                    level.style.left = `${offsetFromVisual - (levelWidth / 2) + (parentRect.width / 2)}px`;
                }
            }

            if (levelNum === 3 && parent) {
                // Similar to level 2 positioning
                const parentNode = document.querySelector(`.node[data-id="${parent}"]`);
                if (parentNode) {
                    const parentRect = parentNode.getBoundingClientRect();
                    const parentLeft = parentRect.left + window.scrollX;
                    const visualRect = sitemapVisual.getBoundingClientRect();
                    const visualLeft = visualRect.left + window.scrollX;

                    const offsetFromVisual = parentLeft - visualLeft;
                    const levelWidth = level.offsetWidth;

                    level.style.left = `${offsetFromVisual - (levelWidth / 2) + (parentRect.width / 2)}px`;
                }
            }
        });
    }

    // Draw connector lines between nodes
    function drawConnectors() {
        // Remove existing connectors
        document.querySelectorAll('.connector-line').forEach(line => line.remove());

        // Draw root connector
        const rootNode = document.querySelector('.root-node');
        if (rootNode) {
            const level1 = document.querySelector('.level[data-level="1"]');
            if (level1 && level1.style.display !== 'none') {
                drawRootConnectors(rootNode, level1);
            }
        }

        // Draw level 1 to level 2 connectors
        const level1Nodes = document.querySelectorAll('.level[data-level="1"] .node');
        level1Nodes.forEach(node => {
            const nodeId = node.dataset.id;
            const level2 = document.querySelector(`.level[data-level="2"][data-parent="${nodeId}"]`);
            if (level2 && level2.style.display !== 'none') {
                drawParentChildConnectors(node, level2);
            }
        });

        // Draw level 2 to level 3 connectors
        const level2Nodes = document.querySelectorAll('.level[data-level="2"] .node');
        level2Nodes.forEach(node => {
            const nodeId = node.dataset.id;
            const level3 = document.querySelector(`.level[data-level="3"][data-parent="${nodeId}"]`);
            if (level3 && level3.style.display !== 'none') {
                drawParentChildConnectors(node, level3);
            }
        });
    }

    // Draw connectors from root to level 1
    function drawRootConnectors(rootNode, level1) {
        const rootRect = rootNode.getBoundingClientRect();
        const visualRect = sitemapVisual.getBoundingClientRect();
        const level1Nodes = level1.querySelectorAll('.node');

        if (level1Nodes.length === 0) return;

        // Root to vertical line
        const rootBottom = rootRect.bottom - visualRect.top;
        const rootCenterX = rootRect.left + (rootRect.width / 2) - visualRect.left;

        const verticalLine = document.createElement('div');
        verticalLine.classList.add('connector-line');
        verticalLine.style.position = 'absolute';
        verticalLine.style.top = `${rootRect.height + 20}px`;
        verticalLine.style.left = `${rootCenterX}px`;
        verticalLine.style.width = '2px';
        verticalLine.style.height = '40px';
        verticalLine.style.backgroundColor = 'var(--connector-color)';
        verticalLine.style.zIndex = '1';
        sitemapVisual.appendChild(verticalLine);

        // Horizontal line across all level 1 nodes
        const firstNode = level1Nodes[0].getBoundingClientRect();
        const lastNode = level1Nodes[level1Nodes.length - 1].getBoundingClientRect();

        const firstNodeCenter = firstNode.left + (firstNode.width / 2) - visualRect.left;
        const lastNodeCenter = lastNode.left + (lastNode.width / 2) - visualRect.left;

        const horizontalLine = document.createElement('div');
        horizontalLine.classList.add('connector-line');
        horizontalLine.style.position = 'absolute';
        horizontalLine.style.top = `${rootRect.height + 60}px`;
        horizontalLine.style.left = `${firstNodeCenter}px`;
        horizontalLine.style.width = `${lastNodeCenter - firstNodeCenter}px`;
        horizontalLine.style.height = '2px';
        horizontalLine.style.backgroundColor = 'var(--connector-color)';
        horizontalLine.style.zIndex = '1';
        sitemapVisual.appendChild(horizontalLine);

        // Vertical lines from horizontal line to each level 1 node
        level1Nodes.forEach(node => {
            const nodeRect = node.getBoundingClientRect();
            const nodeCenterX = nodeRect.left + (nodeRect.width / 2) - visualRect.left;

            const nodeConnector = document.createElement('div');
            nodeConnector.classList.add('connector-line');
            nodeConnector.style.position = 'absolute';
            nodeConnector.style.top = `${rootRect.height + 60}px`;
            nodeConnector.style.left = `${nodeCenterX}px`;
            nodeConnector.style.width = '2px';
            nodeConnector.style.height = `${nodeRect.top - visualRect.top - (rootRect.height + 60)}px`;
            nodeConnector.style.backgroundColor = 'var(--connector-color)';
            nodeConnector.style.zIndex = '1';
            sitemapVisual.appendChild(nodeConnector);
        });
    }

    // Draw connectors from a parent node to its children level
    function drawParentChildConnectors(parentNode, childrenLevel) {
        const parentRect = parentNode.getBoundingClientRect();
        const visualRect = sitemapVisual.getBoundingClientRect();
        const childNodes = childrenLevel.querySelectorAll('.node');

        if (childNodes.length === 0) return;

        // Parent to vertical line
        const parentBottom = parentRect.bottom - visualRect.top;
        const parentCenterX = parentRect.left + (parentRect.width / 2) - visualRect.left;

        const verticalLine = document.createElement('div');
        verticalLine.classList.add('connector-line');
        verticalLine.style.position = 'absolute';
        verticalLine.style.top = `${parentBottom}px`;
        verticalLine.style.left = `${parentCenterX}px`;
        verticalLine.style.width = '2px';
        verticalLine.style.height = '30px';
        verticalLine.style.backgroundColor = 'var(--connector-color)';
        verticalLine.style.zIndex = '1';
        sitemapVisual.appendChild(verticalLine);

        // Horizontal line across all child nodes
        const firstNode = childNodes[0].getBoundingClientRect();
        const lastNode = childNodes[childNodes.length - 1].getBoundingClientRect();

        const firstNodeCenter = firstNode.left + (firstNode.width / 2) - visualRect.left;
        const lastNodeCenter = lastNode.left + (lastNode.width / 2) - visualRect.left;

        const horizontalLine = document.createElement('div');
        horizontalLine.classList.add('connector-line');
        horizontalLine.style.position = 'absolute';
        horizontalLine.style.top = `${parentBottom + 30}px`;
        horizontalLine.style.left = `${firstNodeCenter}px`;
        horizontalLine.style.width = `${lastNodeCenter - firstNodeCenter}px`;
        horizontalLine.style.height = '2px';
        horizontalLine.style.backgroundColor = 'var(--connector-color)';
        horizontalLine.style.zIndex = '1';
        sitemapVisual.appendChild(horizontalLine);

        // Vertical lines from horizontal line to each child node
        childNodes.forEach(node => {
            const nodeRect = node.getBoundingClientRect();
            const nodeCenterX = nodeRect.left + (nodeRect.width / 2) - visualRect.left;

            const nodeConnector = document.createElement('div');
            nodeConnector.classList.add('connector-line');
            nodeConnector.style.position = 'absolute';
            nodeConnector.style.top = `${parentBottom + 30}px`;
            nodeConnector.style.left = `${nodeCenterX}px`;
            nodeConnector.style.width = '2px';
            nodeConnector.style.height = `${nodeRect.top - visualRect.top - (parentBottom + 30)}px`;
            nodeConnector.style.backgroundColor = 'var(--connector-color)';
            nodeConnector.style.zIndex = '1';
            sitemapVisual.appendChild(nodeConnector);
        });
    }

    // Handle node click events
    function handleNodeClick(e, node, id, level, category) {
        e.stopPropagation();

        if (level === 0) {
            // Root node does nothing on click
            return;
        }

        if (level === 1) {
            // Toggle level 2 for this category
            const level2 = document.querySelector(`.level[data-level="2"][data-parent="${id}"]`);
            if (level2) {
                const isVisible = level2.style.display !== 'none';

                // Hide all level 2
                document.querySelectorAll('.level[data-level="2"]').forEach(el => {
                    el.style.display = 'none';
                });

                // Hide all level 3
                document.querySelectorAll('.level[data-level="3"]').forEach(el => {
                    el.style.display = 'none';
                });

                // Show/hide this level 2
                level2.style.display = isVisible ? 'none' : 'flex';

                // Recalculate positions and redraw connectors
                calculateLevelPositions();
                drawConnectors();
            }
        } else if (level === 2) {
            // Toggle level 3 for this node
            const level3 = document.querySelector(`.level[data-level="3"][data-parent="${id}"]`);
            if (level3) {
                const isVisible = level3.style.display !== 'none';

                // Hide all level 3
                document.querySelectorAll('.level[data-level="3"]').forEach(el => {
                    el.style.display = 'none';
                });

                // Show/hide this level 3
                level3.style.display = isVisible ? 'none' : 'flex';

                // Recalculate positions and redraw connectors
                calculateLevelPositions();
                drawConnectors();
            }
        }
    }

    // Zoom functionality
    function updateZoom(newScale) {
        if (newScale >= minScale && newScale <= maxScale) {
            currentScale = newScale;
            sitemapVisual.style.transform = `scale(${currentScale})`;

            // Redraw connectors after zoom animation completes
            setTimeout(drawConnectors, 300);
        }
    }

    zoomInBtn.addEventListener('click', () => {
        updateZoom(currentScale + scaleStep);
    });

    zoomOutBtn.addEventListener('click', () => {
        updateZoom(currentScale - scaleStep);
    });

    zoomResetBtn.addEventListener('click', () => {
        updateZoom(1);
    });

    // View filter functionality
    function setActiveViewButton(button) {
        document.querySelectorAll('.view-controls button').forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');
    }

    // Filter views
    function filterNodes(category) {
        // Hide all nodes and levels first
        document.querySelectorAll('.node:not(.root-node)').forEach(node => {
            node.style.display = 'none';
        });

        document.querySelectorAll('.level').forEach(level => {
            level.style.display = 'none';
        });

        // Always show root
        document.querySelector('.root-node').style.display = 'block';

        if (category === 'all') {
            // Show level 1 and all nodes
            document.querySelector('.level[data-level="1"]').style.display = 'flex';
            document.querySelectorAll('.node').forEach(node => {
                node.style.display = 'block';
            });
        } else {
            // Show level 1
            document.querySelector('.level[data-level="1"]').style.display = 'flex';

            // Show nodes of the selected category at level 1
            document.querySelectorAll(`.level[data-level="1"] .node[data-category="${category}"]`).forEach(node => {
                node.style.display = 'block';
            });

            // Show level 2 for the category
            const level1Node = document.querySelector(`.level[data-level="1"] .node[data-category="${category}"]`);
            if (level1Node) {
                const nodeId = level1Node.dataset.id;
                const level2 = document.querySelector(`.level[data-level="2"][data-parent="${nodeId}"]`);
                if (level2) {
                    level2.style.display = 'flex';
                    level2.querySelectorAll('.node').forEach(node => {
                        node.style.display = 'block';
                    });
                }
            }
        }

        // Recalculate positions and redraw connectors
        calculateLevelPositions();
        drawConnectors();
    }

    // View filter button events
    viewAllBtn.addEventListener('click', () => {
        setActiveViewButton(viewAllBtn);
        filterNodes('all');
    });

    viewProductsBtn.addEventListener('click', () => {
        setActiveViewButton(viewProductsBtn);
        filterNodes('products');
    });

    viewActivitiesBtn.addEventListener('click', () => {
        setActiveViewButton(viewActivitiesBtn);
        filterNodes('activities');
    });

    viewResourcesBtn.addEventListener('click', () => {
        setActiveViewButton(viewResourcesBtn);
        filterNodes('resources');
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        calculateLevelPositions();
        drawConnectors();
    });

    // Initialize sitemap
    createSitemapNodes();
    calculateLevelPositions();

    // Set initial view to "All"
    viewAllBtn.click();
});
