// const { Client, Environment, OrdersController, ApiError } = require('@paypal/paypal-server-sdk');

// const client = new Client({
//     clientCredentialsAuthCredentials: {
//         oAuthClientId: process.env.PAYPAL_CLIENT_ID,
//         oAuthClientSecret: process.env.PAYPAL_CLIENT_SECRET,
//     },
//     environment: Environment.Sandbox,
// });

// const ordersController = new OrdersController(client);

// const createOrder = async (cart) => {
//     const collect = {
//         body: {
//             intent: 'CAPTURE',
//             purchaseUnits: [{
//                 amount: {
//                     currencyCode: 'USD',
//                     value: '100', // You should calculate this from the cart
//                     breakdown: {
//                         itemTotal: {
//                             currencyCode: 'USD',
//                             value: '100',
//                         },
//                     },
//                 },
//                 items: cart.map(item => ({
//                     name: item.name,
//                     unitAmount: {
//                         currencyCode: 'USD',
//                         value: item.price,
//                     },
//                     quantity: item.quantity,
//                 })),
//             }],
//         },
//     };

//     try {
//         const { body } = await ordersController.createOrder(collect);
//         return { orderID: body.id };
//     } catch (error) {
//         if (error instanceof ApiError) {
//             throw new Error(error.message);
//         }
//         throw new Error('Failed to create order.');
//     }
// };

// exports.handler = async (event, context) => {
//     if (event.httpMethod !== 'POST') {
//         return {
//             statusCode: 405,
//             body: 'Method Not Allowed',
//         };
//     }

//     try {
//         const cart = JSON.parse(event.body); // Assuming cart is passed in the request body
//         const { orderID } = await createOrder(cart);

//         return {
//             statusCode: 200,
//             body: JSON.stringify({ orderID }),
//         };
//     } catch (error) {
//         return {
//             statusCode: 500,
//             body: JSON.stringify({ error: error.message }),
//         };
//     }
// };



const { Client, Environment, OrdersController, ApiError } = require('@paypal/paypal-server-sdk');

// 初始化 PayPal 客户端
const client = new Client({
    clientCredentialsAuthCredentials: {
        oAuthClientId: process.env.PAYPAL_CLIENT_ID,
        oAuthClientSecret: process.env.PAYPAL_CLIENT_SECRET,
    },
    environment: Environment.Sandbox, // 使用沙箱环境
});

const ordersController = new OrdersController(client);

// 计算购物车的小计（商品总价）
const calculateSubtotal = (cart) => {
    return cart.reduce((total, item) => {
        const price = parseFloat(item.price) || 0; // 确保价格是数字
        const quantity = parseInt(item.quantity) || 1; // 确保数量是整数
        return total + (price * quantity); // 小计 = 价格 * 数量
    }, 0);
};

// 计算运费（例如，小计大于 49 美元免费送货）
const calculateShipping = (subtotal) => {
    return subtotal >= 49 ? 0 : 10; // 如果小计大于或等于 49 美元，运费为 0，否则运费为 10
};

// 创建订单
const createOrder = async (cart) => {
    // 计算购物车的小计和运费
    const subtotal = calculateSubtotal(cart); // 计算小计
    const shipping = calculateShipping(subtotal); // 计算运费
    const total = subtotal + shipping; // 总金额 = 小计 + 运费

    // 创建订单请求
    const collect = {
        body: {
            intent: 'CAPTURE',
            purchaseUnits: [{
                amount: {
                    currencyCode: 'USD',
                    value: total.toFixed(2), // 总金额
                    breakdown: {
                        itemTotal: {
                            currencyCode: 'USD',
                            value: subtotal.toFixed(2), // 小计
                        },
                        shipping: {
                            currencyCode: 'USD',
                            value: shipping.toFixed(2), // 运费
                        },
                    },
                },
                items: cart.map(item => ({
                    name: item.name,
                    unitAmount: {
                        currencyCode: 'USD',
                        value: item.price.toFixed(2), // 商品单价
                    },
                    quantity: item.quantity,
                })),
            }],
        },
    };

    try {
        // 使用 PayPal API 创建订单
        const { body } = await ordersController.createOrder(collect);
        return { orderID: body.id }; // 返回订单 ID
    } catch (error) {
        if (error instanceof ApiError) {
            throw new Error(error.message);
        }
        throw new Error('Failed to create order.');
    }
};

// 处理函数
exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: 'Method Not Allowed',
        };
    }

    try {
        // 获取传递的购物车数据
        const cart = JSON.parse(event.body); // 假设 cart 数据通过 POST 请求传递

        // 调用创建订单函数
        const { orderID } = await createOrder(cart);

        return {
            statusCode: 200,
            body: JSON.stringify({ orderID }), // 返回创建的订单 ID
        };
    } catch (error) {
        console.error('Error creating order:', error); // 输出错误信息到日志
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }), // 返回错误信息
        };
    }
};
