// 产品数据
const products = [
    {
        id: 1,
        name: "Premium Camping Tent",
        price: 199.99,
        originalPrice: 249.99,
        image_url: "img/product-tent.jpg",
        description: "4-person tent with weather protection"
    },
    {
        id: 2,
        name: "Hiking Backpack",
        price: 89.99,
        originalPrice: 119.99,
        image_url: "img/product-backpack.jpg",
        description: "45L waterproof hiking backpack"
    },
    {
        id: 3,
        name: "Camping Stove",
        price: 49.99,
        originalPrice: 69.99,
        image_url: "img/product-stove.jpg",
        description: "Portable camping stove with wind protection"
    },
    {
        id: 4,
        name: "Sleeping Bag",
        price: 79.99,
        originalPrice: 99.99,
        image_url: "img/product-sleeping-bag.jpg",
        description: "4-season sleeping bag for extreme conditions"
    }
];

// 初始化页面
document.addEventListener('DOMContentLoaded', function() {
    // 初始化购物车
    if (typeof CartManager !== 'undefined') {
        CartManager.init();
    }

    // 渲染产品
    renderProducts();
});

// 渲染产品
function renderProducts() {
    const productGrid = document.getElementById('dynamic-products');
    if (!productGrid) return;

    // 随机选择4个产品
    const randomProducts = getRandomProducts(products, 4);

    randomProducts.forEach(product => {
        const productCard = createProductCard(product);
        productGrid.appendChild(productCard);
    });
}

// 创建产品卡片
function createProductCard(product) {
    const div = document.createElement('div');
    div.className = 'product-card';
    div.innerHTML = `
        <div class="product-image">
            <img src="${product.image_url}" alt="${product.name}">
        </div>
        <div class="product-info">
            <h3>${product.name}</h3>
            <div class="product-price">
                <span class="current-price">$${product.price}</span>
                <span class="original-price">$${product.originalPrice}</span>
            </div>
            <p>${product.description}</p>
            <button class="add-to-cart-btn" data-product-id="${product.id}">ADD TO CART</button>
        </div>
    `;

    // 添加点击事件
    const addToCartBtn = div.querySelector('.add-to-cart-btn');
    addToCartBtn.addEventListener('click', (e) => {
        e.preventDefault();
        addToCart(product);
    });

    return div;
}

// 随机获取产品
function getRandomProducts(products, count) {
    const shuffled = [...products].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// 添加到购物车
function addToCart(product) {
    if (typeof CartManager !== 'undefined') {
        CartManager.addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            image_url: product.image_url,
            quantity: 1
        });
        showNotification('Product added to cart');
    }
}

// 显示通知
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
} 